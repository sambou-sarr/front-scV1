// @vitest-environment jsdom
import { AxiosError } from "axios";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import type { ModeleCarte } from "../../../types/admin";
import { ToastProvider } from "../components/ui";
import ModelesCartes from "./ModelesCartes";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/* Page d'administration « Modèles de cartes » : serveur simulé en mémoire (un seul modèle actif par formule). */
const model = (over: Partial<ModeleCarte>): ModeleCarte => ({
  id: 1,
  tier: "pro",
  nom: "Pro noir",
  rectoUrl: "https://cdn.exemple.sn/p1r.png",
  versoUrl: "https://cdn.exemple.sn/p1v.png",
  actif: false,
  createdAt: "2026-10-27T10:00:00Z",
  updatedAt: "2026-10-27T10:00:00Z",
  ...over,
});

describe("Modèles de cartes (admin)", () => {
  const original = api.defaults.adapter;
  let store: ModeleCarte[];
  let calls: {
    method?: string;
    url?: string;
    body?: Record<string, unknown>;
  }[];
  let failList = false;
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    failList = false;
    calls = [];
    store = [
      model({ id: 1, nom: "Pro noir", actif: true }),
      model({
        id: 2,
        nom: "Pro rouge",
        rectoUrl: "https://cdn.exemple.sn/p2r.png",
        versoUrl: "https://cdn.exemple.sn/p2v.png",
      }),
      model({ id: 3, tier: "signature", nom: "Signature or", actif: true }),
    ];
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    api.defaults.adapter = async config => {
      const body = config.data ? JSON.parse(config.data) : undefined;
      const url = (config.url ?? "").replace(/^\//, "");
      calls.push({ method: config.method, url: config.url, body });
      const mk = (data: unknown, status = 200) => ({
        status,
        data,
        statusText: "",
        headers: {},
        config,
      });
      const id = Number(url.split("/").pop());
      if (
        config.method === "get" &&
        url === "admin/production/modeles-cartes"
      ) {
        if (failList)
          throw new AxiosError(
            "fail",
            "500",
            config,
            undefined,
            mk({ error: { message: "Serveur indisponible" } }, 500),
          );
        return mk({ modeles: store });
      }
      if (config.method === "post") {
        if (body.actif)
          store = store.map(m =>
            m.tier === body.tier ? { ...m, actif: false } : m,
          );
        const created = model({ ...body, id: 100, actif: !!body.actif });
        store = [...store, created];
        return mk({ modele: created }, 201);
      }
      if (config.method === "patch") {
        const target = store.find(m => m.id === id)!;
        if (body.actif)
          store = store.map(m =>
            m.tier === target.tier ? { ...m, actif: false } : m,
          );
        store = store.map(m => (m.id === id ? { ...m, ...body } : m));
        return mk({ modele: store.find(m => m.id === id) });
      }
      if (config.method === "delete") {
        store = store.filter(m => m.id !== id);
        return mk({ ok: true });
      }
      return mk({});
    };
  });
  afterEach(() => {
    api.defaults.adapter = original;
    act(() => root.unmount());
    host.remove();
  });

  const settle = async () => {
    for (let i = 0; i < 6; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));
  };
  const open = async () => {
    await act(async () =>
      root.render(h(ToastProvider, null, h(ModelesCartes))),
    );
    await settle();
  };
  const section = (nom: string) =>
    document.body.querySelector<HTMLElement>(
      `section[aria-label="Modèles ${nom}"]`,
    )!;
  const button = (scope: ParentNode, label: string, nth = 0) =>
    [...scope.querySelectorAll("button")].filter(b => b.textContent === label)[
      nth
    ] as HTMLButtonElement;
  const click = async (el: HTMLElement) => {
    await act(async () => el.click());
    await settle();
  };
  const type = async (el: HTMLInputElement, value: string) => {
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  const dialog = () =>
    document.body.querySelector<HTMLElement>('[role="dialog"]')!;
  const called = (method: string, url: string) =>
    calls.find(c => c.method === method && c.url === url);

  it("affiche, par formule, le modèle actif (recto et verso) et les autres modèles", async () => {
    await open();
    const pro = section("Pro");
    expect(pro.textContent).toContain("Pro noir");
    expect(pro.textContent).toContain("Affiché aux clients");
    expect(
      pro.querySelector<HTMLImageElement>('img[alt="Pro noir — recto"]')?.src,
    ).toBe("https://cdn.exemple.sn/p1r.png");
    expect(pro.querySelector('img[alt="Pro noir — verso"]')).toBeTruthy();
    expect(pro.textContent).toContain("Pro rouge"); // modèle non actif, listé avec « Activer »
    expect(button(pro, "Activer")).toBeTruthy();
  });

  it("une formule sans modèle actif l'indique : le client voit l'aperçu par défaut", async () => {
    await open();
    expect(section("Essentielle").textContent).toContain("Aucun modèle actif");
    expect(section("Essentielle").textContent).toContain("aperçu par défaut");
  });

  it("activer un modèle remplace l'ancien modèle actif de la formule", async () => {
    await open();
    await click(button(section("Pro"), "Activer"));
    expect(called("patch", "/admin/production/modeles-cartes/2")?.body).toEqual(
      { actif: true },
    );
    const pro = section("Pro");
    // « Pro rouge » est maintenant le modèle affiché ; « Pro noir » devient un modèle à réactiver
    expect(pro.querySelector(".mc-active")?.textContent).toContain("Pro rouge");
    expect(pro.querySelector(".mc-others")?.textContent).toContain("Pro noir");
  });

  it("désactiver le modèle actif laisse la formule sans modèle", async () => {
    await open();
    await click(button(section("Signature"), "Désactiver"));
    expect(called("patch", "/admin/production/modeles-cartes/3")?.body).toEqual(
      { actif: false },
    );
    expect(section("Signature").textContent).toContain("Aucun modèle actif");
  });

  it("ajouter un modèle : refuse une adresse non sécurisée, puis envoie la formule, le nom et les deux faces", async () => {
    await open();
    await click(button(section("Essentielle"), "Ajouter un modèle"));
    expect(dialog().getAttribute("aria-label")).toBe(
      "Nouveau modèle Essentielle",
    );
    const [nom, recto, verso] = [
      ...dialog().querySelectorAll<HTMLInputElement>(
        'input:not([type="checkbox"])',
      ),
    ];
    const submit = button(dialog(), "Ajouter le modèle");
    await type(nom, "Essentielle bleu");
    await type(recto, "http://cdn.exemple.sn/r.png");
    await type(verso, "https://cdn.exemple.sn/v.png");
    expect(submit.disabled).toBe(true);
    expect(dialog().textContent).toContain("https://");
    await type(recto, "https://cdn.exemple.sn/r.png");
    expect(submit.disabled).toBe(false);
    expect(dialog().querySelectorAll("img")).toHaveLength(2); // aperçu des deux faces avant d'enregistrer

    await click(submit);
    expect(called("post", "/admin/production/modeles-cartes")?.body).toEqual({
      tier: "essentielle",
      nom: "Essentielle bleu",
      rectoUrl: "https://cdn.exemple.sn/r.png",
      versoUrl: "https://cdn.exemple.sn/v.png",
      actif: false,
    });
    expect(document.body.querySelector('[role="dialog"]')).toBeNull(); // modale fermée
    expect(section("Essentielle").textContent).toContain("Essentielle bleu");
    expect(section("Essentielle").textContent).toContain("Aucun modèle actif"); // créé inactif par défaut
  });

  it("ajouter avec « afficher dès maintenant » active le modèle", async () => {
    await open();
    await click(button(section("Essentielle"), "Ajouter un modèle"));
    const [nom, recto, verso] = [
      ...dialog().querySelectorAll<HTMLInputElement>(
        'input:not([type="checkbox"])',
      ),
    ];
    await type(nom, "Essentielle bleu");
    await type(recto, "https://cdn.exemple.sn/r.png");
    await type(verso, "https://cdn.exemple.sn/v.png");
    await click(
      dialog().querySelector<HTMLInputElement>('input[type="checkbox"]')!,
    );
    await click(button(dialog(), "Ajouter le modèle"));
    expect(
      called("post", "/admin/production/modeles-cartes")?.body,
    ).toMatchObject({ actif: true });
    expect(
      section("Essentielle").querySelector(".mc-active")?.textContent,
    ).toContain("Essentielle bleu");
  });

  it("supprimer demande une confirmation, puis retire le modèle", async () => {
    await open();
    await click(button(section("Signature"), "Supprimer"));
    expect(dialog().textContent).toContain("Signature or");
    expect(dialog().textContent).toContain("aperçu par défaut"); // c'était le modèle actif
    expect(calls.some(c => c.method === "delete")).toBe(false); // rien n'est supprimé avant la confirmation
    await click(button(dialog(), "Supprimer"));
    expect(called("delete", "/admin/production/modeles-cartes/3")).toBeTruthy();
    expect(section("Signature").textContent).not.toContain("Signature or");
  });

  it("annuler la suppression ne supprime rien", async () => {
    await open();
    await click(button(section("Signature"), "Supprimer"));
    await click(button(dialog(), "Annuler"));
    expect(calls.some(c => c.method === "delete")).toBe(false);
    expect(section("Signature").textContent).toContain("Signature or");
  });

  it("modifier un modèle envoie le nom et les adresses", async () => {
    await open();
    await click(button(section("Pro"), "Modifier", 0));
    const [nom] = [
      ...dialog().querySelectorAll<HTMLInputElement>(
        'input:not([type="checkbox"])',
      ),
    ];
    await type(nom, "Pro noir mat");
    await click(button(dialog(), "Enregistrer"));
    expect(
      called("patch", "/admin/production/modeles-cartes/1")?.body,
    ).toMatchObject({ nom: "Pro noir mat" });
    expect(section("Pro").textContent).toContain("Pro noir mat");
  });

  it("une erreur du serveur est affichée", async () => {
    failList = true;
    await open();
    expect(host.textContent).toContain("Serveur indisponible");
  });
});
