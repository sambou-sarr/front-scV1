// @vitest-environment jsdom
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { logout, login } from "../features/auth/auth.service";
import { api } from "./api";
import { ApiError } from "./apiError";
import { clearSession, getSession, saveSession } from "./session";

/*
  Le client HTTP est testé avec un adaptateur factice : on observe les requêtes sortantes
  et on simule les réponses du serveur, sans réseau.
*/
type Call = { url?: string; auth?: string };
let calls: Call[] = [];
let respond: (config: InternalAxiosRequestConfig) => {
  status: number;
  data?: unknown;
};
const original = api.defaults.adapter;

beforeEach(() => {
  localStorage.clear();
  calls = [];
  respond = () => ({ status: 200, data: {} });
  api.defaults.adapter = async config => {
    calls.push({
      url: config.url,
      auth: config.headers.Authorization as string | undefined,
    });
    const { status, data } = respond(config);
    const response = { status, data, statusText: "", headers: {}, config };
    if (status >= 400)
      throw new AxiosError("fail", String(status), config, undefined, response);
    return response;
  };
});
afterEach(() => {
  api.defaults.adapter = original;
  clearSession();
});

const user = { name: "Awa", email: "awa@exemple.sn" };

describe("client HTTP", () => {
  it("envoie le jeton de la session", async () => {
    saveSession({ token: "T1", user });
    await api.get("/fiches/1");
    expect(calls[0].auth).toBe("Bearer T1");
  });

  it("n'envoie pas de jeton sur les routes d'authentification", async () => {
    saveSession({ token: "T1", user });
    await api.post("/auth/login", {});
    await api.post("auth/forgot-password", {});
    expect(calls.map(c => c.auth)).toEqual([undefined, undefined]);
  });

  it("supprime la session quand le serveur refuse le jeton (401)", async () => {
    saveSession({ token: "T1", user });
    respond = () => ({ status: 401, data: {} });
    await expect(api.get("/client/dashboard/fiches")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(getSession()).toBeNull();
  });

  it("garde la session sur un 403 ou un 500", async () => {
    saveSession({ token: "T1", user });
    respond = () => ({ status: 403, data: {} });
    await expect(api.get("/x")).rejects.toBeTruthy();
    respond = () => ({ status: 500, data: {} });
    await expect(api.get("/x")).rejects.toBeTruthy();
    expect(getSession()).not.toBeNull();
  });

  it("un 401 de connexion (mauvais mot de passe) ne touche pas la session", async () => {
    saveSession({ token: "T1", user });
    respond = () => ({
      status: 401,
      data: { error: { message: "Identifiants invalides." } },
    });
    await expect(
      login({ email: "a@b.sn", password: "x" }),
    ).rejects.toMatchObject({
      message: "Identifiants invalides.",
      status: 401,
    });
    expect(getSession()).not.toBeNull();
  });
});

describe("auth.service", () => {
  it("login enregistre la session et renvoie la réponse", async () => {
    respond = () => ({
      status: 200,
      data: {
        token: "T2",
        user: {
          id: 7,
          email: "awa@exemple.sn",
          nom: "Awa",
          role: "CLIENT",
          emailVerified: true,
        },
      },
    });
    await login({ email: "awa@exemple.sn", password: "secret" });
    expect(getSession()).toEqual({
      token: "T2",
      user: { id: 7, role: "CLIENT", name: "Awa", email: "awa@exemple.sn" },
    });
  });

  it("login échoue en ApiError et n'ouvre pas de session", async () => {
    respond = () => ({
      status: 401,
      data: { error: { message: "Identifiants invalides." } },
    });
    const p = login({ email: "a@b.sn", password: "x" });
    await expect(p).rejects.toBeInstanceOf(ApiError);
    expect(getSession()).toBeNull();
  });

  it("logout prévient le serveur AVEC le jeton, puis efface la session", async () => {
    saveSession({ token: "T3", user });
    await logout();
    expect(calls).toEqual([{ url: "/auth/logout", auth: "Bearer T3" }]);
    expect(getSession()).toBeNull();
  });

  it("logout efface la session même si le serveur est injoignable", async () => {
    saveSession({ token: "T3", user });
    respond = () => ({ status: 500 });
    await expect(logout()).resolves.toBeUndefined();
    expect(getSession()).toBeNull();
  });
});
