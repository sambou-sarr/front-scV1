// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../../lib/api";
import { visibleTabs } from "../../../../lib/plans";
import { FICHES } from "../../../../test/fixtures/fiches";
import { sectionKey } from "../../lib/stickerSections";
import StickerSectionPage from "../../pages/StickerSectionPage";
import StickerSectionView from "./StickerSectionView";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/** Fiche de test dont toutes les sections visibles sont activées par l'administration. */
const fiche = (slug: string) => {
  const f = structuredClone(FICHES.find(f => f.slug === slug)!);
  f.stickerSections = visibleTabs(f).map(sectionKey);
  return f;
};
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

  it("section pas encore activée par l'administration : le visiteur voit la fiche complète", () => {
    const f = fiche("le-sunset");
    f.stickerSections = []; // demande de devis envoyée, rien d'activé
    const html = render(h(StickerSectionView, { fiche: f, section: "menu" }));
    expect(html).toContain("f-hero");
    expect(html).not.toContain("Voir la fiche complète");
  });

  it("l'aperçu (preview) montre la section même non activée", () => {
    const f = fiche("le-sunset");
    f.stickerSections = [];
    const html = render(
      h(StickerSectionView, { fiche: f, section: "menu", preview: true }),
    );
    expect(html).toContain("Voir la fiche complète");
    expect(html).not.toContain("f-hero");
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
