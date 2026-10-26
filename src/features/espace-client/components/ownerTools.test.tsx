// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import { clearSession, getSession, saveSession } from "../../../lib/session";
import { FICHES } from "../../../test/fixtures/fiches";
import PublicFichePage from "../pages/PublicFichePage";
import Fiche from "./Fiche";
import StickerSectionView from "./sticker/StickerSectionView";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/*
  Le QR code, le bouton « NFC · QR » et le geste « tirer pour le QR » sont des OUTILS DU PROPRIÉTAIRE
  (pour qu'une personne scanne sa fiche). Une personne qui ouvre la fiche en la scannant ne les voit pas.
*/
const fiche = (slug = "le-sunset") =>
  structuredClone(FICHES.find(f => f.slug === slug)!);
const html = (el: ReturnType<typeof h>) =>
  renderToString(h(MemoryRouter, null, el));
const OWNER_MARKERS = ["NFC · QR", "f-qrp", "Scannez pour ouvrir"];

describe("Fiche : outils du propriétaire", () => {
  it("par défaut (visiteur) : ni bouton « NFC · QR », ni QR code", () => {
    const out = html(h(Fiche, { fiche: fiche() }));
    for (const marker of OWNER_MARKERS) expect(out).not.toContain(marker);
    expect(out).toContain("Fiche de contact"); // le reste de l'en-tête est inchangé
  });

  it("propriétaire : bouton « NFC · QR » et QR code présents", () => {
    const out = html(h(Fiche, { fiche: fiche(), ownerTools: true }));
    for (const marker of OWNER_MARKERS) expect(out).toContain(marker);
  });

  it("la page sticker en repli sur la fiche complète n'affiche pas les outils", () => {
    const out = html(
      h(StickerSectionView, {
        fiche: fiche("awa-ndiaye"),
        section: "presentation",
      }),
    );
    expect(out).toContain("f-hero");
    for (const marker of OWNER_MARKERS) expect(out).not.toContain(marker);
  });
});

describe("geste « tirer pour le QR »", () => {
  let root: Root;
  let host: HTMLDivElement;
  beforeEach(() => {
    host = document.createElement("div");
    root = createRoot(host);
  });
  afterEach(() => act(() => root.unmount()));

  const pullUp = (ownerTools: boolean) => {
    const scroller = document.createElement("div"); // au sommet de la page (scrollTop = 0)
    act(() =>
      root.render(
        h(
          MemoryRouter,
          null,
          h(Fiche, {
            fiche: fiche(),
            scrollerRef: { current: scroller },
            ownerTools,
          }),
        ),
      ),
    );
    act(
      () =>
        void scroller.dispatchEvent(new WheelEvent("wheel", { deltaY: -120 })),
    );
    return host.querySelector(".fiche")!.classList.contains("pulling");
  };

  it("actif pour le propriétaire", () => expect(pullUp(true)).toBe(true));
  it("sans effet pour un visiteur", () => expect(pullUp(false)).toBe(false));
});

/* ───── page publique complète avec un faux serveur ───── */
describe("PublicFichePage : qui voit les outils", () => {
  const original = api.defaults.adapter;
  let calls: { method?: string; url?: string }[] = [];
  let dashboard: () => { status: number; data: unknown };
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    localStorage.clear();
    calls = [];
    host = document.createElement("div");
    root = createRoot(host);
    dashboard = () => ({ status: 200, data: [] });
    api.defaults.adapter = async config => {
      calls.push({ method: config.method, url: config.url });
      const mk = (status: number, data: unknown) => ({
        status,
        data,
        statusText: "",
        headers: {},
        config,
      });
      let res = mk(200, {});
      if (config.method === "get" && config.url === "fiches/public/le-sunset") {
        const f = fiche();
        res = mk(200, {
          fiche: {
            ...f,
            formule: f.formule.toUpperCase(),
            statut: f.statut.toUpperCase(),
          },
        });
      } else if (config.url === "client/dashboard/fiches") {
        const d = dashboard();
        res = mk(d.status, d.data);
      }
      if (res.status >= 400)
        throw new AxiosError(
          "fail",
          String(res.status),
          config,
          undefined,
          res,
        );
      return res;
    };
  });
  afterEach(() => {
    api.defaults.adapter = original;
    act(() => root.unmount());
    clearSession();
  });

  const open = async () => {
    await act(async () => {
      root.render(
        h(
          QueryClientProvider,
          { client: new QueryClient() },
          h(
            MemoryRouter,
            { initialEntries: ["/f/le-sunset?source=qr"] },
            h(
              Routes,
              null,
              h(Route, { path: "/f/:slug", element: h(PublicFichePage) }),
            ),
          ),
        ),
      );
    });
    for (let i = 0; i < 6; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));
    return host.textContent ?? "";
  };
  const user = { name: "Rose", email: "rose@exemple.sn" };
  const dashboardCalls = () =>
    calls.filter(c => c.url === "client/dashboard/fiches").length;

  it("visiteur anonyme : aucun outil, et aucune requête vers l'espace client", async () => {
    const text = await open();
    expect(text).toContain("Fiche de contact");
    expect(text).not.toContain("NFC · QR");
    expect(dashboardCalls()).toBe(0);
  });

  it("propriétaire connecté : les outils apparaissent", async () => {
    saveSession({ token: "T", user });
    dashboard = () => ({ status: 200, data: [{ id: 1, slug: "le-sunset" }] });
    expect(await open()).toContain("NFC · QR");
  });

  it("connecté mais fiche d'un autre : aucun outil", async () => {
    saveSession({ token: "T", user });
    dashboard = () => ({ status: 200, data: [{ id: 2, slug: "autre-fiche" }] });
    const text = await open();
    expect(text).toContain("Fiche de contact");
    expect(text).not.toContain("NFC · QR");
  });

  it("session refusée par le serveur (401) : aucun outil, la session est supprimée", async () => {
    saveSession({ token: "T", user });
    dashboard = () => ({ status: 401, data: {} });
    expect(await open()).not.toContain("NFC · QR");
    expect(getSession()).toBeNull();
  });
});
