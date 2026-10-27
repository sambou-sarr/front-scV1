// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../lib/api";
import type { ApiFicheSummary } from "../../../types";
import SubscriptionPage from "./SubscriptionPage";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

/* /espace-client/abonnements?renew=<id> ouvre directement la fenêtre de renouvellement de cette fiche. */
const NOW = Date.now();
const day = (n: number) => new Date(NOW + n * 86_400_000).toISOString();
const base = {
  statut: "ACTIVE",
  prenom: "Rose",
  nom: "Ndiaye",
  subscriptions: [],
};
const expired = {
  ...base,
  id: 12,
  slug: "rose-pro",
  latestSubscription: {
    status: "EXPIRED",
    endsAt: day(-20),
    plan: { type: "PRO" },
  },
};
const active = {
  ...base,
  id: 13,
  slug: "awa-signature",
  subscriptions: [
    { endsAt: day(200), status: "ACTIVE", plan: { type: "SIGNATURE" } },
  ],
};

const Where = () => {
  const l = useLocation();
  return h("i", { id: "where" }, l.pathname + l.search);
};

describe("SubscriptionPage : lien de renouvellement", () => {
  const original = api.defaults.adapter;
  let root: Root;
  let host: HTMLDivElement;

  beforeEach(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    api.defaults.adapter = async config => {
      const mk = (data: unknown) => ({
        status: 200,
        data,
        statusText: "",
        headers: {},
        config,
      });
      if (config.url === "client/parametres/commande/tarif")
        return mk({
          totalFcfa: 27000,
          totalSansRemiseFcfa: 30000,
          economieFcfa: 3000,
          lignes: [
            {
              quantite: 1,
              dureeMois: 12,
              prixMensuelFcfa: 2500,
              remiseDureePct: 10,
              remiseQuantitePct: 0,
              prixApresDureeFcfa: 27000,
              prixUnitaireFcfa: 27000,
              totalFcfa: 27000,
              totalSansRemiseFcfa: 30000,
              economieFcfa: 3000,
            },
          ],
        });
      if (config.url === "subscription/kpi")
        return mk({
          data: { nbrFiche: 2, nbrFicheActive: 2, nbrPayingFiche: 1 },
        });
      if (config.url === "client/dashboard/fiches")
        return mk([expired, active] as ApiFicheSummary[]);
      if (config.url === "client/parametres")
        return mk({
          formules: [
            {
              formule: "pro",
              nom: "Pro",
              prixMensuelFcfa: 2500,
              durees: [{ dureeMois: 12, remisePct: 0 }],
              remises: [],
            },
            {
              formule: "signature",
              nom: "Signature",
              prixMensuelFcfa: 5000,
              durees: [{ dureeMois: 12, remisePct: 0 }],
              remises: [],
            },
          ],
          emplacements: { prixUnitaireFcfa: null, packs: [] },
        });
      return mk({});
    };
  });
  afterEach(() => {
    api.defaults.adapter = original;
    act(() => root.unmount());
    host.remove();
  });

  const open = async (url: string) => {
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
            { initialEntries: [url] },
            h(
              Routes,
              null,
              h(Route, {
                path: "/espace-client/abonnements",
                element: h("div", null, h(SubscriptionPage), h(Where)),
              }),
            ),
          ),
        ),
      );
    });
    for (let i = 0; i < 8; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));
  };
  const where = () => host.querySelector("#where")!.textContent;
  const buttons = (label: string) =>
    [...host.querySelectorAll("button")].filter(b =>
      b.textContent?.includes(label),
    );

  it("?renew=<fiche échue> : ouvre la fenêtre de renouvellement de cette fiche", async () => {
    await open("/espace-client/abonnements?renew=12");
    expect(host.textContent).toContain("Renouveler l’abonnement");
    expect(host.textContent).toContain("Abonnement Pro terminé le");
  });

  it("fermer la fenêtre retire ?renew de l'adresse (pas de réouverture au rechargement)", async () => {
    await open("/espace-client/abonnements?renew=12");
    expect(where()).toContain("renew=12");
    const close = [...host.querySelectorAll("button")].find(b =>
      /fermer|close|✕|×/i.test(
        b.getAttribute("aria-label") ?? b.textContent ?? "",
      ),
    );
    expect(close).toBeTruthy();
    await act(async () => close!.click());
    expect(where()).toBe("/espace-client/abonnements");
    expect(host.textContent).not.toContain("Renouveler l’abonnement");
  });

  it("?renew=<fiche déjà valide> : rien ne s'ouvre et le paramètre est retiré", async () => {
    await open("/espace-client/abonnements?renew=13");
    expect(host.textContent).not.toContain("Renouveler l’abonnement");
    expect(where()).toBe("/espace-client/abonnements");
  });

  it("?renew=<fiche inconnue> : rien ne s'ouvre", async () => {
    await open("/espace-client/abonnements?renew=999");
    expect(host.textContent).not.toContain("Renouveler l’abonnement");
    expect(where()).toBe("/espace-client/abonnements");
  });

  it("sans ?renew : la page s'affiche avec un bouton « Renouveler » sur la fiche échue seulement", async () => {
    await open("/espace-client/abonnements");
    expect(host.textContent).not.toContain("Renouveler l’abonnement"); // pas de fenêtre ouverte
    expect(buttons("Renouveler").length).toBeGreaterThan(0);
    expect(host.textContent).toContain("Voir formule"); // la fiche valide garde son bouton d'origine
  });
});
