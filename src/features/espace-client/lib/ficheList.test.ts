import { describe, expect, it } from "vitest";
import type { ApiFicheSummary } from "../../../types";
import {
  DEFAULT_FICHE_LIST_FILTERS,
  filterFiches,
  pageFiches,
} from "./ficheList";

const fiche = (
  overrides: Partial<ApiFicheSummary> = {},
): ApiFicheSummary => ({
  id: 1,
  slug: "fiche-1",
  prenom: "Awa",
  nom: "Ndiaye",
  fonction: "Coiffeuse",
  entreprise: "Salon Awa",
  photo: null,
  logo: null,
  telephone: null,
  whatsapp: null,
  email: null,
  site: null,
  adresse: null,
  googlePlaceId: null,
  premierBouton: "WHATSAPP",
  messageWhatsapp: null,
  statut: "ACTIVE",
  enLigneSeule: true,
  scansTotal: 0,
  userId: 1,
  claimCode: null,
  secteur: "BEAUTE",
  presentation: null,
  rdvLabel: null,
  rdvUrl: null,
  enteteDisposition: "PORTRAIT",
  enteteTaille: "M",
  enteteTheme: "OR",
  enteteCouverture: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const subscription = (
  type: "ESSENTIELLE" | "PRO" | "SIGNATURE",
  endsAt: string | null,
  status: "ACTIVE" | "CANCELED" | "EXPIRED" | "PENDING" = "ACTIVE",
) => [{ endsAt, status, plan: { type } }];

describe("filterFiches", () => {
  const now = Date.parse("2026-01-10T00:00:00.000Z");
  const fiches = [
    fiche({ subscriptions: subscription("PRO", "2026-01-20T00:00:00.000Z") }),
    fiche({
      id: 2,
      slug: "fiche-2",
      prenom: "Moussa",
      nom: "Diallo",
      entreprise: null,
      secteur: "RESTAURANT",
      latestSubscription: {
        endsAt: "2026-01-09T00:00:00.000Z",
        status: "EXPIRED",
      },
    }),
    fiche({
      id: 3,
      slug: "fiche-3",
      entreprise: null,
      statut: "SUSPENDUE",
      subscriptions: subscription("ESSENTIELLE", null),
    }),
    fiche({
      id: 4,
      slug: "fiche-4",
      prenom: "Fiche",
      nom: "en cours",
      entreprise: null,
      statut: "BROUILLON",
    }),
  ];

  it("recherche par nom, entreprise ou activité sans tenir compte de la casse", () => {
    expect(
      filterFiches(fiches, { ...DEFAULT_FICHE_LIST_FILTERS, search: "DIALLO" })
        .map(item => item.id),
    ).toEqual([2]);
    expect(
      filterFiches(fiches, {
        ...DEFAULT_FICHE_LIST_FILTERS,
        search: "salon awa",
      }).map(item => item.id),
    ).toEqual([1]);
  });

  it("combine formule, statut, secteur et échéance", () => {
    expect(
      filterFiches(
        fiches,
        {
          ...DEFAULT_FICHE_LIST_FILTERS,
          plan: "PRO",
          status: "active",
          sector: "BEAUTE",
          expiry: "expiring",
        },
        now,
      ).map(item => item.id),
    ).toEqual([1]);
    expect(
      filterFiches(
        fiches,
        { ...DEFAULT_FICHE_LIST_FILTERS, status: "expired" },
        now,
      ).map(item => item.id),
    ).toEqual([2]);
    expect(
      filterFiches(fiches, {
        ...DEFAULT_FICHE_LIST_FILTERS,
        status: "suspended",
      }).map(item => item.id),
    ).toEqual([3]);
    expect(
      filterFiches(fiches, {
        ...DEFAULT_FICHE_LIST_FILTERS,
        status: "draft",
      }).map(item => item.id),
    ).toEqual([4]);
  });
});

describe("pageFiches", () => {
  it("découpe en pages de dix et borne les numéros de page", () => {
    const values = Array.from({ length: 23 }, (_, id) => id + 1);
    expect(pageFiches(values, 2)).toMatchObject({
      items: values.slice(10, 20),
      currentPage: 2,
      pageCount: 3,
      startIndex: 11,
      endIndex: 20,
    });
    expect(pageFiches(values, 99).currentPage).toBe(3);
    expect(pageFiches([], 1)).toMatchObject({
      items: [],
      pageCount: 1,
      startIndex: 0,
      endIndex: 0,
    });
  });
});
