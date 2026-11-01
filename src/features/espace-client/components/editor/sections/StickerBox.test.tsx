// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "../../../../../lib/api";
import { FICHES } from "../../../../../test/fixtures/fiches";
import type { ApiSectionSticker, FicheRecord } from "../../../../../types";
import StickerBox from "./StickerBox";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/*
  « Stickers par section » côté client : le client demande un DEVIS (nombre de stickers) ; l'administration active la
  section ; ce n'est qu'alors que le lien, le QR, l'aperçu et l'ouverture apparaissent.
*/
const fiche = (slug = "le-sunset"): FicheRecord => ({
  ...structuredClone(FICHES.find(f => f.slug === slug)!),
  id: 12,
});
const demande = (over: Partial<ApiSectionSticker> = {}): ApiSectionSticker => ({
  id: 1,
  section: "menu",
  quantite: 20,
  message: null,
  statut: "demande",
  createdAt: "2026-10-29T10:00:00Z",
  activatedAt: null,
  ...over,
});

describe("StickerBox : demande de devis", () => {
  const original = api.defaults.adapter;
  let store: ApiSectionSticker[];
  let calls: {
    method?: string;
    url?: string;
    body?: Record<string, unknown>;
  }[];
  let failList = false;
  let failPost: { status: number; message: string } | null = null;
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    store = [];
    calls = [];
    failList = false;
    failPost = null;
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    api.defaults.adapter = async config => {
      const body =
        typeof config.data === "string" ? JSON.parse(config.data) : undefined;
      calls.push({ method: config.method, url: config.url, body });
      const mk = (data: unknown, status = 200) => ({
        status,
        data,
        statusText: "",
        headers: {},
        config,
      });
      if (
        config.url === "fiches/12/section-stickers" &&
        config.method === "get"
      ) {
        if (failList)
          throw new AxiosError(
            "fail",
            "500",
            config,
            undefined,
            mk({ error: { message: "Serveur indisponible" } }, 500),
          );
        return mk({ demandes: store });
      }
      if (
        config.url === "fiches/12/section-stickers" &&
        config.method === "post"
      ) {
        if (failPost)
          throw new AxiosError(
            "fail",
            String(failPost.status),
            config,
            undefined,
            mk({ error: { message: failPost.message } }, failPost.status),
          );
        const created = demande({
          id: store.length + 10,
          section: body!.section as string,
          quantite: body!.quantite as number,
          createdAt: new Date().toISOString(),
        });
        store = [created, ...store];
        return mk({ demande: created }, 201);
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
    for (let i = 0; i < 8; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));
  };
  const open = async (
    f: FicheRecord = fiche(),
    extra: Record<string, unknown> = {},
  ) => {
    await act(async () =>
      root.render(
        h(
          QueryClientProvider,
          {
            client: new QueryClient({
              defaultOptions: { queries: { retry: false } },
            }),
          },
          h(MemoryRouter, null, h(StickerBox, { fiche: f, ...extra })),
        ),
      ),
    );
    await settle();
  };
  const rows = () => [...host.querySelectorAll<HTMLElement>("li.ed-stk")];
  const rowOf = (statut: string, nth = 0) =>
    rows().filter(r => r.dataset.statut === statut)[nth];
  const btn = (scope: ParentNode, label: string) =>
    [...scope.querySelectorAll("button")].find(b =>
      b.textContent?.startsWith(label),
    ) as HTMLButtonElement | undefined;
  const type = async (el: HTMLInputElement, v: string) => {
    await act(async () => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(el, v);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };
  const posts = () => calls.filter(c => c.method === "post");

  it("formule Essentielle : bloc verrouillé, aucune demande ni requête", async () => {
    await open(fiche("awa-ndiaye"));
    expect(host.querySelector(".ed-lock")).toBeTruthy();
    expect(host.querySelector("form")).toBeNull();
    expect(calls.filter(c => c.url?.includes("section-stickers"))).toHaveLength(
      0,
    );
  });

  it("sans demande : un formulaire de devis par section, AUCUN lien ni QR", async () => {
    await open();
    expect(rows().length).toBeGreaterThan(1);
    expect(host.querySelectorAll("form.ed-stk-quote")).toHaveLength(
      rows().length,
    );
    expect(host.textContent).toContain("Demander un devis");
    expect(host.textContent).not.toContain("Copier le lien");
    expect(host.textContent).not.toContain("QR (SVG)");
    expect(host.querySelector("svg[aria-label*='QR'], .ed-stk-qr")).toBeNull();
    expect(
      host.querySelector<HTMLInputElement>('input[type="number"]')!.value,
    ).toBe("10"); // quantité par défaut
  });

  it("la section du secteur est proposée en premier et signalée", async () => {
    await open();
    expect(rows()[0].textContent).toContain("Conseillée pour votre secteur");
  });

  it("envoie la demande avec la section et le nombre choisis, puis affiche « demande envoyée »", async () => {
    await open();
    const first = rows()[0];
    await type(
      first.querySelector<HTMLInputElement>('input[type="number"]')!,
      "25",
    );
    await act(
      async () =>
        void first
          .querySelector("form")!
          .dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true }),
          ),
    );
    await settle();
    expect(posts()).toHaveLength(1);
    expect(posts()[0].body).toEqual({ section: "menu", quantite: 25 });
    expect(rowOf("demande").textContent).toContain("Demande envoyée");
    expect(rowOf("demande").textContent).toContain("25 stickers");
    expect(rowOf("demande").textContent).not.toContain("Copier le lien"); // rien n'est activé tant que l'admin n'a pas décidé
  });

  it.each(["0", "501", "-3", "2.5", "abc", ""])(
    "quantité « %s » refusée : bouton désactivé et aucun envoi",
    async raw => {
      await open();
      const first = rows()[0];
      await type(
        first.querySelector<HTMLInputElement>('input[type="number"]')!,
        raw,
      );
      expect(btn(first, "Demander un devis")!.disabled).toBe(true);
      await act(
        async () =>
          void first
            .querySelector("form")!
            .dispatchEvent(
              new Event("submit", { bubbles: true, cancelable: true }),
            ),
      );
      expect(posts()).toHaveLength(0);
      expect(first.textContent).toContain("entre 1 et 500");
    },
  );

  it("une erreur du serveur est affichée sous la section", async () => {
    failPost = {
      status: 409,
      message: "Une demande est déjà en cours pour cette section.",
    };
    await open();
    const first = rows()[0];
    await act(
      async () =>
        void first
          .querySelector("form")!
          .dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true }),
          ),
    );
    await settle();
    expect(first.textContent).toContain(
      "Une demande est déjà en cours pour cette section.",
    );
  });

  it("section ACTIVÉE : lien, QR, aperçu et ouverture apparaissent (et seulement alors)", async () => {
    store = [
      demande({ statut: "active", activatedAt: "2026-10-30T09:00:00Z" }),
    ];
    const onPreview = vi.fn();
    await open(fiche(), { previewSection: null, onPreviewSection: onPreview });
    const active = rowOf("active");
    expect(btn(active, "Copier le lien")).toBeTruthy();
    expect(btn(active, "QR (SVG)")).toBeTruthy();
    expect(btn(active, "Aperçu")).toBeTruthy();
    expect(active.querySelector("a.ed-up")?.getAttribute("href")).toMatch(
      /\/s\/le-sunset\/menu$/,
    );
    expect(active.querySelector("form")).toBeNull(); // plus de devis à demander
    await act(async () => btn(active, "Aperçu")!.click());
    expect(onPreview).toHaveBeenCalledWith("menu");
    // les autres sections n'ont toujours que le formulaire de devis
    const others = rows().filter(r => r !== active);
    expect(others.every(r => !r.textContent?.includes("Copier le lien"))).toBe(
      true,
    );
    expect(others.every(r => r.querySelector("form"))).toBe(true);
  });

  it("section désactivée par l'administration : outils retirés, nouvelle demande possible", async () => {
    store = [demande({ statut: "desactivee" })];
    await open();
    const r = rowOf("desactivee");
    expect(r.textContent).toContain("Section désactivée");
    expect(r.textContent).not.toContain("Copier le lien");
    expect(btn(r, "Refaire une demande de devis")).toBeTruthy();
  });

  it("demande refusée : message clair et nouvelle demande possible", async () => {
    store = [demande({ statut: "refusee" })];
    await open();
    const r = rowOf("refusee");
    expect(r.textContent).toContain("Demande refusée");
    expect(btn(r, "Refaire une demande de devis")).toBeTruthy();
  });

  it("seule la demande la plus récente de la section compte", async () => {
    store = [
      demande({
        id: 2,
        statut: "demande",
        quantite: 40,
        createdAt: "2026-10-30T10:00:00Z",
      }),
      demande({ id: 1, statut: "refusee", createdAt: "2026-10-01T10:00:00Z" }),
    ];
    await open();
    expect(rowOf("demande").textContent).toContain("40 stickers");
    expect(rowOf("refusee")).toBeUndefined();
  });

  it("le singulier est respecté (1 sticker)", async () => {
    store = [demande({ quantite: 1 })];
    await open();
    expect(rowOf("demande").textContent).toContain("1 sticker ·");
    expect(rowOf("demande").textContent).not.toContain("1 stickers");
  });

  it("erreur de chargement : message et bouton « Réessayer »", async () => {
    failList = true;
    await open();
    expect(host.textContent).toContain("Impossible de charger vos demandes");
    expect(btn(host, "Réessayer")).toBeTruthy();
  });
});
