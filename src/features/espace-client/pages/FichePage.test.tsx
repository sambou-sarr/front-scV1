// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import { FichePage } from "./FichePage";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const history = Array.from({ length: 8 }, (_, index) => ({
  period: `2026-${String(index + 1).padStart(2, "0")}`,
  qr: index + 1,
  nfc: index + 2,
  direct: index + 3,
  total: index * 3 + 6,
}));

describe("Tableau de bord de la fiche", () => {
  const originalAdapter = api.defaults.adapter;
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement("div");
    root = createRoot(host);
    api.defaults.adapter = async config => {
      const response = (data: unknown) => ({
        status: 200,
        statusText: "OK",
        headers: {},
        config,
        data,
      });
      if (config.url === "fiches/1") {
        return response({
          fiche: {
            id: 1,
            slug: "awa-ndiaye",
            formule: "PRO",
            statut: "ACTIVE",
            expiree: false,
            enLigneSeule: false,
            prenom: "Awa",
            nom: "Ndiaye",
            fonction: "Directrice",
            entreprise: "Atelier Awa",
            photo: "",
            logo: "",
            telephone: "771234567",
            whatsapp: "",
            email: "awa@example.sn",
            site: "",
            adresse: "",
            googlePlaceId: "",
            dateEcheance: null,
            scansTotal: 128,
            data: { galerie: [] },
          },
        });
      }
      if (config.url?.startsWith("fiches/1/stats?")) {
        return response({
          stats: {
            ficheId: 1,
            granularity: "month",
            filters: { date: null, month: null },
            totals: { qr: 36, nfc: 18, direct: 9, total: 63 },
            history,
          },
        });
      }
      if (config.url === "fiches/1/card-request") {
        return response({ carte: null });
      }
      throw new Error(`Unexpected request: ${config.url}`);
    };
  });

  afterEach(() => {
    api.defaults.adapter = originalAdapter;
    act(() => root.unmount());
  });

  async function openPage() {
    await act(async () => {
      root.render(
        h(
          QueryClientProvider,
          {
            client: new QueryClient({
              defaultOptions: { queries: { retry: false } },
            }),
          },
          h(
            MemoryRouter,
            { initialEntries: ["/espace-client/fiche/preview/1"] },
            h(
              Routes,
              null,
              h(Route, {
                path: "/espace-client/fiche/preview/:id",
                element: h(FichePage),
              }),
            ),
          ),
        ),
      );
    });
    for (let i = 0; i < 8; i++) {
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }
  }

  it("pagine l’historique mensuel, six lignes par page", async () => {
    await openPage();

    const rows = () =>
      host.querySelectorAll(".fiche-passage-history tbody tr");
    expect(rows()).toHaveLength(6);
    expect(rows()[0].textContent).toContain("2026-08");
    expect(host.textContent).toContain("1 / 2");

    await act(async () => {
      host
        .querySelector<HTMLButtonElement>(
          '[aria-label="Page suivante de l’historique"]',
        )!
        .click();
    });
    expect(rows()).toHaveLength(2);
    expect(rows()[0].textContent).toContain("2026-02");
    expect(host.textContent).toContain("2 / 2");
  });

  it("ouvre la demande de carte directement depuis l’onglet Carte", async () => {
    await openPage();

    await act(async () => {
      host.querySelectorAll<HTMLButtonElement>(".fiche-dashboard-nav button")[2].click();
    });
    await act(async () => {
      host.querySelector<HTMLButtonElement>(".fiche-card-request-button")!.click();
    });

    expect(host.querySelector('[role="dialog"]')).toBeTruthy();
    expect(host.textContent).toContain("Demande de carte — Awa Ndiaye");
    expect(host.textContent).toContain("FCFA");
    expect(host.querySelector('textarea[required]')).toBeTruthy();
  });
});
