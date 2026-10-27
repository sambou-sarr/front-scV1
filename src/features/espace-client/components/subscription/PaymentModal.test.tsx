// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, createElement as h } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { api } from "../../../../lib/api";
import type { ApiFicheSummary } from "../../../../types";
import { PaymentModal } from "./PaymentModal";

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const NOW = Date.now();
const day = (n: number) => new Date(NOW + n * 86_400_000).toISOString();
const fiche = (over: Partial<ApiFicheSummary>): ApiFicheSummary =>
  ({
    id: 12,
    slug: "le-sunset",
    prenom: "Rose",
    nom: "Ndiaye",
    statut: "ACTIVE",
    subscriptions: [],
    ...over,
  }) as ApiFicheSummary;

const expiredPro = () =>
  fiche({
    latestSubscription: {
      status: "EXPIRED",
      endsAt: day(-20),
      plan: { type: "PRO" },
    },
  });
const activePro = () =>
  fiche({
    subscriptions: [
      { endsAt: day(200), status: "ACTIVE", plan: { type: "PRO" } },
    ] as never,
  });

const grid = {
  formules: [
    {
      formule: "essentielle",
      nom: "Essentielle",
      prixMensuelFcfa: 0,
      durees: [],
      remises: [],
    },
    {
      formule: "pro",
      nom: "Pro",
      prixMensuelFcfa: 2500,
      durees: [{ dureeMois: 12, remisePct: 10 }],
      remises: [],
    },
    {
      formule: "signature",
      nom: "Signature",
      prixMensuelFcfa: 5000,
      durees: [{ dureeMois: 12, remisePct: 10 }],
      remises: [],
    },
  ],
  emplacements: { prixUnitaireFcfa: null, packs: [] },
};
const line = {
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
};

describe("PaymentModal : renouvellement ou upgrade", () => {
  const original = api.defaults.adapter;
  let posts: { url?: string; body?: Record<string, unknown> }[] = [];
  let root: Root;
  let host: HTMLDivElement;
  let qc: QueryClient;

  beforeEach(() => {
    posts = [];
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    api.defaults.adapter = async config => {
      const mk = (data: unknown) => ({
        status: 200,
        data,
        statusText: "",
        headers: {},
        config,
      });
      if (config.method === "post")
        posts.push({
          url: config.url,
          body: config.data && JSON.parse(config.data),
        });
      if (config.url === "client/parametres") return mk(grid);
      if (config.url === "client/parametres/commande/tarif")
        return mk({
          totalFcfa: 27000,
          totalSansRemiseFcfa: 30000,
          economieFcfa: 3000,
          lignes: [line],
        });
      if (config.url === "/subscription/upgrade")
        return mk({
          data: { payment: { id: 5, reference: null, status: "pending" } },
        });
      if (config.url === "/subscription/payments/5/simulate-confirmation")
        return mk({
          succes: "ok",
          data: {
            subscription: { id: 1, ficheId: 12, planId: 2, status: "ACTIVE" },
            fiche: { id: 12, formule: "pro" },
            payment: {
              id: 5,
              reference: null,
              mode: "simulation",
              status: "confirmed",
            },
          },
        });
      return mk({});
    };
  });
  afterEach(() => {
    api.defaults.adapter = original;
    act(() => root.unmount());
    host.remove();
  });

  const open = async (f: ApiFicheSummary) => {
    await act(async () => {
      root.render(
        h(
          QueryClientProvider,
          { client: qc },
          h(
            MemoryRouter,
            null,
            h(PaymentModal, { fiche: f, onClose: () => {} }),
          ),
        ),
      );
    });
    for (let i = 0; i < 6; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));
  };
  const checkedPlans = () =>
    [...host.querySelectorAll<HTMLInputElement>('input[type="radio"]')]
      .filter(i => i.checked)
      .map(i => i.closest("label")?.textContent ?? "");
  const offeredPlans = () =>
    [...host.querySelectorAll<HTMLInputElement>('input[type="radio"]')].map(
      i => i.closest("label")?.textContent ?? "",
    );
  const confirmButton = (label: string) =>
    [...host.querySelectorAll("button")].find(b =>
      b.textContent?.startsWith(label),
    ) as HTMLButtonElement | undefined;

  it("fiche échue : parle de renouvellement, rappelle l'abonnement terminé et propose la formule précédente", async () => {
    await open(expiredPro());
    const text = host.textContent ?? "";
    expect(text).toContain("Renouveler l’abonnement");
    expect(text).toContain("Abonnement Pro terminé le");
    expect(text).toContain("Reprenez votre formule ou changez-en");
    expect(text).not.toContain("Choisissez la formule supérieure");
    expect(checkedPlans()).toHaveLength(1);
    expect(checkedPlans()[0]).toContain("Pro");
    // la même formule ET une formule supérieure sont proposées
    expect(offeredPlans().some(l => l.includes("Pro"))).toBe(true);
    expect(offeredPlans().some(l => l.includes("Signature"))).toBe(true);
  });

  it("confirmer : demande la même formule au serveur, confirme le paiement et rafraîchit l'éditeur", async () => {
    qc.setQueryData(["fiche-preview", 12], { expiree: true });
    qc.setQueryData(["public-fiche", "le-sunset"], { expiree: true });
    await open(expiredPro());
    await act(async () => confirmButton("Renouveler")!.click());
    for (let i = 0; i < 6; i++)
      await act(async () => void (await new Promise(r => setTimeout(r, 0))));

    const upgrade = posts.find(p => p.url === "/subscription/upgrade");
    expect(upgrade?.body).toMatchObject({ ficheId: 12, plan: "pro" });
    expect(
      posts.some(
        p => p.url === "/subscription/payments/5/simulate-confirmation",
      ),
    ).toBe(true);
    expect(host.textContent).toContain("Abonnement renouvelé");
    // l'éditeur et la page publique ne gardent pas la version « expirée » en cache
    expect(qc.getQueryState(["fiche-preview", 12])?.isInvalidated).toBe(true);
    expect(qc.getQueryState(["public-fiche", "le-sunset"])?.isInvalidated).toBe(
      true,
    );
  });

  it("abonnement valide : l'upgrade reste inchangé (formule supérieure seulement)", async () => {
    await open(activePro());
    const text = host.textContent ?? "";
    expect(text).toContain("Choisir une formule");
    expect(text).toContain("Choisissez la formule supérieure");
    expect(text).not.toContain("Renouveler");
    expect(offeredPlans()).toHaveLength(1);
    expect(offeredPlans()[0]).toContain("Signature");
  });

  it("fiche gratuite sans abonnement : parcours d'upgrade, pas de renouvellement", async () => {
    await open(fiche({}));
    expect(host.textContent).toContain("Choisir une formule");
    expect(host.textContent).not.toContain("Renouveler");
  });
});
