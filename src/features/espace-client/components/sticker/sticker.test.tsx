// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../../lib/api";
import { FICHES } from "../../../../test/fixtures/fiches";
import StickerBox from "../editor/sections/StickerBox";
import StickerSectionPage from "../../pages/StickerSectionPage";
import StickerSectionView from "./StickerSectionView";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const fiche = (slug: string) =>
  structuredClone(FICHES.find(f => f.slug === slug)!);
const render = (
  el: Parameters<typeof h>[0] extends never ? never : ReturnType<typeof h>,
) => renderToString(h(MemoryRouter, null, el));
const view = (slug: string, section: string) =>
  render(h(StickerSectionView, { fiche: fiche(slug), section }));

describe("StickerSectionView", () => {
  it("affiche logo/nom, UNE section et le bouton vers la fiche complète", () => {
    const html = view("le-sunset", "menu");
    expect(html).toContain("ss-head");
    expect(html).toContain("Voir la fiche complète");
    expect(html).toContain('href="/f/le-sunset"');
    expect(html).toContain("Le Sunset"); // nom de l'établissement
    expect(html).not.toContain("f-hero"); // pas l'en-tête de la fiche complète
    expect(html).not.toContain("f-save"); // ni le bouton « Enregistrer le contact »
  });

  it("n'affiche que la section demandée, pas les autres onglets", () => {
    const html = view("le-sunset", "menu");
    expect((html.match(/class="f-sec open"/g) || []).length).toBe(1);
    expect(html).not.toContain("f-sec-h"); // pas d'en-têtes d'onglets pliables
  });

  it.each([
    ["Essentielle (pas de stickers)", "awa-ndiaye", "presentation"],
    ["section inconnue", "le-sunset", "n-importe-quoi"],
  ])("retombe sur la fiche complète : %s", (_label, slug, section) => {
    const html = view(slug, section);
    expect(html).toContain("f-hero");
    expect(html).not.toContain("Voir la fiche complète");
  });

  it("retombe sur la fiche complète si la section est masquée", () => {
    const f = fiche("le-sunset");
    f.data.onglets = f.data.onglets!.map(t =>
      t.type === "menu" ? { ...t, visible: false } : t,
    );
    const html = render(h(StickerSectionView, { fiche: f, section: "menu" }));
    expect(html).toContain("f-hero");
  });
});

describe("StickerBox (éditeur)", () => {
  it("propose un lien et un QR par section, la section du secteur en premier", () => {
    const html = render(h(StickerBox, { fiche: fiche("le-sunset") }));
    expect(html).toContain("/s/le-sunset/menu");
    expect(html).toContain("Conseillée pour votre secteur");
    expect(html.indexOf("/s/le-sunset/menu")).toBeLessThan(
      html.indexOf("/s/le-sunset/horaires"),
    );
  });

  it("est verrouillé pour la formule Essentielle", () => {
    const html = render(h(StickerBox, { fiche: fiche("awa-ndiaye") }));
    expect(html).toContain("ed-lock");
    expect(html).not.toContain("/s/awa-ndiaye");
  });
});

describe("StickerBox : aperçu dans le téléphone", () => {
  const mountBox = (props: Record<string, unknown>) => {
    const host = document.createElement("div");
    const root = createRoot(host);
    act(() =>
      root.render(
        h(
          MemoryRouter,
          null,
          h(StickerBox, { fiche: fiche("le-sunset"), ...props }),
        ),
      ),
    );
    return { host, unmount: () => act(() => root.unmount()) };
  };
  const buttons = (host: HTMLElement, label: string) =>
    [...host.querySelectorAll("button")].filter(b => b.textContent === label);

  it("« Aperçu » demande l'affichage de la section choisie", () => {
    const calls: (string | null)[] = [];
    const { host, unmount } = mountBox({
      previewSection: null,
      onPreviewSection: (k: string | null) => calls.push(k),
    });
    const first = buttons(host, "Aperçu")[0];
    act(() => first.click());
    expect(calls).toEqual(["menu"]); // la section du secteur est en premier
    unmount();
  });

  it("la section affichée propose « Fermer l'aperçu » et le ferme (null)", () => {
    const calls: (string | null)[] = [];
    const { host, unmount } = mountBox({
      previewSection: "menu",
      onPreviewSection: (k: string | null) => calls.push(k),
    });
    const close = buttons(host, "Fermer l’aperçu")[0];
    expect(close.getAttribute("aria-pressed")).toBe("true");
    act(() => close.click());
    expect(calls).toEqual([null]);
    unmount();
  });

  it("sans gestionnaire (hors éditeur), aucun bouton d'aperçu", () => {
    const { host, unmount } = mountBox({});
    expect(buttons(host, "Aperçu")).toHaveLength(0);
    unmount();
  });
});

/* ───── page complète avec un faux serveur ───── */
describe("StickerSectionPage", () => {
  const original = api.defaults.adapter;
  let calls: { method?: string; url?: string; body?: unknown }[] = [];
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    calls = [];
    host = document.createElement("div");
    root = createRoot(host);
    api.defaults.adapter = async config => {
      calls.push({
        method: config.method,
        url: config.url,
        body: config.data && JSON.parse(config.data),
      });
      const mk = (status: number, data: unknown) => ({
        status,
        data,
        statusText: "",
        headers: {},
        config,
      });
      if (config.method === "post") return mk(200, {});
      if (config.url === "fiches/public/inconnue")
        throw new AxiosError("nf", "404", config, undefined, mk(404, {}));
      const f = fiche("le-sunset");
      return mk(200, {
        fiche: {
          ...f,
          formule: f.formule.toUpperCase(),
          statut: f.statut.toUpperCase(),
        },
      });
    };
  });
  afterEach(() => {
    api.defaults.adapter = original;
    act(() => root.unmount());
    document.head
      .querySelectorAll('meta[name="robots"]')
      .forEach(m => m.remove());
  });

  const mount = async (path: string) => {
    const qc = new QueryClient();
    await act(async () => {
      root.render(
        h(
          QueryClientProvider,
          { client: qc },
          h(
            MemoryRouter,
            { initialEntries: [path] },
            h(
              Routes,
              null,
              h(Route, {
                path: "/s/:slug/:section",
                element: h(StickerSectionPage),
              }),
            ),
          ),
        ),
      );
    });
    // laisse la requête et l'enregistrement du passage se terminer
    for (let i = 0; i < 5; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));
  };

  it("charge la fiche, affiche la section, enregistre un passage « qr » et interdit l'indexation", async () => {
    await mount("/s/le-sunset/menu");
    expect(host.textContent).toContain("Voir la fiche complète");
    expect(calls.find(c => c.method === "get")?.url).toBe(
      "fiches/public/le-sunset",
    );
    const passage = calls.find(c => c.method === "post");
    expect(passage?.url).toBe("fiches/public/le-sunset/passages");
    expect(passage?.body).toMatchObject({ source: "qr" });
    expect(
      document.head
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content"),
    ).toBe("noindex");
  });

  it("affiche « Fiche introuvable » pour un slug inconnu, sans enregistrer de passage", async () => {
    await mount("/s/inconnue/menu");
    expect(host.textContent).toContain("Fiche introuvable");
    expect(calls.some(c => c.method === "post")).toBe(false);
  });
});
