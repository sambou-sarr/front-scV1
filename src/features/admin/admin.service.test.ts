// @vitest-environment jsdom
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../lib/api";
import { ApiError } from "../../lib/apiError";
import { clearSession, getSession, saveSession } from "../../lib/session";
import { adminApi } from "./admin.service";

type Call = {
  method?: string;
  url?: string;
  params?: unknown;
  auth?: string;
  data?: unknown;
};
let calls: Call[] = [];
let respond: (config: InternalAxiosRequestConfig) => {
  status: number;
  data?: unknown;
  headers?: Record<string, string>;
};
const original = api.defaults.adapter;

beforeEach(() => {
  localStorage.clear();
  calls = [];
  respond = () => ({ status: 200, data: {} });
  saveSession({ token: "T", user: { name: "Admin", email: "a@b.sn", role: "ADMIN" } });
  api.defaults.adapter = async config => {
    calls.push({
      method: config.method,
      url: config.url,
      params: config.params,
      auth: config.headers.Authorization as string | undefined,
      data: config.data,
    });
    const { status, data, headers } = respond(config);
    const response = { status, data, statusText: "", headers: headers ?? {}, config };
    if (status >= 400)
      throw new AxiosError("fail", String(status), config, undefined, response);
    return response;
  };
});
afterEach(() => {
  api.defaults.adapter = original;
  clearSession();
});

describe("adminApi", () => {
  it("envoie le jeton et retire les paramètres vides", async () => {
    await adminApi.listFiches({ search: "", statut: "active", formule: undefined, page: 2, limit: 20 });
    expect(calls[0]).toMatchObject({
      method: "get",
      url: "/admin/fiches",
      auth: "Bearer T",
      params: { statut: "active", page: 2, limit: 20 },
    });
  });

  it("supprime une fiche avec la confirmation du slug", async () => {
    await adminApi.deleteFiche(12, "chez-awa");
    expect(calls[0]).toMatchObject({
      method: "delete",
      url: "/admin/fiches/12",
      params: { confirmer: "chez-awa" },
    });
  });

  it("utilise les routes Formules pour les réglages administrateur", async () => {
    await adminApi.getFormules();
    await adminApi.updateFormule("pro", { actif: true });
    await adminApi.updateEmplacements({ prixUnitaireFcfa: 1500 });
    await adminApi.tarifCommande({ lignes: [], emplacements: 2 });

    expect(calls.map(({ method, url }) => [method, url])).toEqual([
      ["get", "/admin/formules"],
      ["patch", "/admin/formules/pro"],
      ["patch", "/admin/formules/emplacements"],
      ["post", "/admin/formules/commande/tarif"],
    ]);
  });

  it("transmet les changements de slug d'une fiche sans compte client", async () => {
    await adminApi.updateFiche(5, { slug: "nouvelle-adresse" });
    expect(calls[0]).toMatchObject({ method: "patch", url: "/admin/fiches/5" });
    expect(JSON.parse(String(calls[0].data))).toEqual({ slug: "nouvelle-adresse" });
  });

  it("remonte les erreurs en ApiError lisible (format serveur, texte simple, repli par statut)", async () => {
    respond = () => ({ status: 409, data: { error: { code: "SLUG", message: "Ce slug existe." } } });
    await expect(adminApi.stats()).rejects.toMatchObject({ message: "Ce slug existe.", code: "SLUG", status: 409 });

    respond = () => ({ status: 422, data: { error: "Carte déjà livrée." } });
    await expect(adminApi.stats()).rejects.toMatchObject({ message: "Carte déjà livrée." });

    respond = () => ({ status: 403, data: {} });
    const e = await adminApi.stats().catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect((e as ApiError).message).toBe("Accès refusé.");

    respond = () => ({ status: 503, data: {} });
    await expect(adminApi.stats()).rejects.toMatchObject({ message: "Erreur du serveur." });
  });

  it("un 401 met fin à la session (le garde renvoie vers la connexion)", async () => {
    respond = () => ({ status: 401, data: {} });
    await expect(adminApi.stats()).rejects.toMatchObject({ status: 401 });
    expect(getSession()).toBeNull();
  });

  it("télécharge un QR en blob et lit le nom du fichier", async () => {
    respond = () => ({
      status: 200,
      data: new Blob(["x"]),
      headers: { "content-disposition": 'attachment; filename="qr-sc.png"' },
    });
    const body = { contenu: { type: "lien", url: "https://sc.sn" } } as never;
    const r = await adminApi.qrTelecharger(body, "png");
    expect(r.filename).toBe("qr-sc.png");
    expect(r.blob).toBeInstanceOf(Blob);
    expect(calls[0]).toMatchObject({
      method: "post",
      url: "/client/qrcodes/telecharger",
      params: { format: "png" },
    });
  });
});
