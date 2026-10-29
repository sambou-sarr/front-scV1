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
  let failUpload = false;
  let uploads: { name: string; type: string; size: number }[];
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    failList = false;
    failUpload = false;
    uploads = [];
    calls = [];
    URL.createObjectURL = () => "blob:apercu";
    URL.revokeObjectURL = () => {};
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
      const body =
        typeof config.data === "string" ? JSON.parse(config.data) : undefined;
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
      if (
        config.method === "post" &&
        url === "admin/production/modeles-cartes/images"
      ) {
        const file = config.data as File;
        uploads.push({
          name: file.name,
          type: String(config.headers.get("Content-Type")),
          size: file.size,
        });
        if (failUpload)
          throw new AxiosError(
            "fail",
            "422",
            config,
            undefined,
            mk(
              { error: { message: "Format d’image refusé par le serveur" } },
              422,
            ),
          );
        return mk(
          {
            url: `http://localhost:4000/api/media/cartes/0a1b2c3d-0000-4000-8000-00000000000${uploads.length}.webp`,
          },
          201,
        );
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
  const png = (name = "recto.png", type = "image/png", size = 2048) =>
    new File([new ArrayBuffer(size)], name, { type });
  const pick = async (input: HTMLInputElement, file: File) => {
    Object.defineProperty(input, "files", {
      value: [file],
      configurable: true,
    });
    await act(
      async () =>
        void input.dispatchEvent(new Event("change", { bubbles: true })),
    );
  };
  const nomInput = () =>
    dialog().querySelector<HTMLInputElement>(
      'input:not([type="checkbox"]):not([type="file"])',
    )!;
  const fileInputs = () => [
    ...dialog().querySelectorAll<HTMLInputElement>('input[type="file"]'),
  ];
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

  it("ajouter un modèle : choisir deux fichiers, aucun champ de lien", async () => {
    await open();
    await click(button(section("Essentielle"), "Ajouter un modèle"));
    expect(dialog().getAttribute("aria-label")).toBe(
      "Nouveau modèle Essentielle",
    );
    expect(dialog().querySelector('input[type="url"]')).toBeNull(); // plus de lien à coller
    expect(fileInputs()).toHaveLength(2);
    expect(fileInputs()[0].accept).toBe("image/jpeg,image/png,image/webp");
  });

  it("refuse un fichier qui n'est pas une image JPEG, PNG ou WebP, ou qui dépasse 12 Mo", async () => {
    await open();
    await click(button(section("Essentielle"), "Ajouter un modèle"));
    await pick(fileInputs()[0], png("doc.pdf", "application/pdf"));
    expect(dialog().textContent).toContain("Format non pris en charge");
    await pick(fileInputs()[1], png("gros.png", "image/png", 13 * 1024 * 1024));
    expect(dialog().textContent).toContain("dépasse 12 Mo");
    await type(nomInput(), "Essentielle bleu");
    expect(button(dialog(), "Ajouter le modèle").disabled).toBe(true); // rien d'accepté
    expect(uploads).toHaveLength(0);
  });

  it("ajouter : envoie les deux images (corps binaire, bon type), puis crée le modèle avec leurs adresses", async () => {
    await open();
    await click(button(section("Essentielle"), "Ajouter un modèle"));
    const submit = button(dialog(), "Ajouter le modèle");
    await type(nomInput(), "Essentielle bleu");
    expect(submit.disabled).toBe(true); // les deux faces sont obligatoires
    await pick(fileInputs()[0], png("recto.png", "image/png"));
    expect(submit.disabled).toBe(true);
    await pick(fileInputs()[1], png("verso.webp", "image/webp"));
    expect(submit.disabled).toBe(false);
    expect(dialog().querySelectorAll("img")).toHaveLength(2); // aperçu des deux faces avant l'envoi
    expect(calls.some(c => c.url?.endsWith("/images"))).toBe(false); // rien n'est envoyé avant la validation

    await click(submit);
    expect(uploads.map(u => [u.name, u.type])).toEqual([
      ["recto.png", "image/png"],
      ["verso.webp", "image/webp"],
    ]);
    expect(called("post", "/admin/production/modeles-cartes")?.body).toEqual({
      tier: "essentielle",
      nom: "Essentielle bleu",
      rectoUrl:
        "http://localhost:4000/api/media/cartes/0a1b2c3d-0000-4000-8000-000000000001.webp",
      versoUrl:
        "http://localhost:4000/api/media/cartes/0a1b2c3d-0000-4000-8000-000000000002.webp",
      actif: false,
    });
    expect(document.body.querySelector('[role="dialog"]')).toBeNull(); // fenêtre fermée
    expect(section("Essentielle").textContent).toContain("Essentielle bleu");
  });

  it("ajouter avec « afficher dès maintenant » active le modèle", async () => {
    await open();
    await click(button(section("Essentielle"), "Ajouter un modèle"));
    await type(nomInput(), "Essentielle bleu");
    await pick(fileInputs()[0], png());
    await pick(fileInputs()[1], png("verso.png"));
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

  it("si un envoi échoue, le modèle n'est pas créé et la fenêtre reste ouverte", async () => {
    failUpload = true;
    await open();
    await click(button(section("Essentielle"), "Ajouter un modèle"));
    await type(nomInput(), "Essentielle bleu");
    await pick(fileInputs()[0], png());
    await pick(fileInputs()[1], png("verso.png"));
    await click(button(dialog(), "Ajouter le modèle"));
    expect(document.body.textContent).toContain(
      "Format d’image refusé par le serveur",
    );
    expect(called("post", "/admin/production/modeles-cartes")).toBeUndefined();
    expect(dialog()).toBeTruthy();
    expect(button(dialog(), "Ajouter le modèle").disabled).toBe(false); // on peut réessayer
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

  it("modifier : changer seulement le nom n'envoie aucune image et ne touche pas aux faces", async () => {
    await open();
    await click(button(section("Pro"), "Modifier", 0));
    await type(nomInput(), "Pro noir mat");
    await click(button(dialog(), "Enregistrer"));
    expect(uploads).toHaveLength(0);
    expect(called("patch", "/admin/production/modeles-cartes/1")?.body).toEqual(
      { nom: "Pro noir mat" },
    );
    expect(section("Pro").textContent).toContain("Pro noir mat");
  });

  it("modifier : remplacer seulement le verso envoie une image et ne change que le verso", async () => {
    await open();
    await click(button(section("Pro"), "Modifier", 0));
    expect(dialog().querySelectorAll("img")).toHaveLength(2); // faces actuelles affichées
    await pick(fileInputs()[1], png("nouveau-verso.png"));
    await click(button(dialog(), "Enregistrer"));
    expect(uploads.map(u => u.name)).toEqual(["nouveau-verso.png"]);
    const body = called("patch", "/admin/production/modeles-cartes/1")?.body;
    expect(body).toMatchObject({
      nom: "Pro noir",
      versoUrl: expect.stringContaining("/api/media/cartes/"),
    });
    expect(body).not.toHaveProperty("rectoUrl");
  });

  it("une erreur du serveur est affichée", async () => {
    failList = true;
    await open();
    expect(host.textContent).toContain("Serveur indisponible");
  });
});
