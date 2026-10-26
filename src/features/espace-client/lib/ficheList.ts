import type { ApiFicheSummary, ApiSecteur, PlanType } from "../../../types";

export type FicheListFilters = {
  search: string;
  plan: "all" | PlanType;
  status: "all" | "active" | "expired" | "suspended" | "draft";
  sector: "all" | ApiSecteur;
  expiry: "all" | "expiring" | "expired" | "no-expiry";
};

export const DEFAULT_FICHE_LIST_FILTERS: FicheListFilters = {
  search: "",
  plan: "all",
  status: "all",
  sector: "all",
  expiry: "all",
};

export const FICHE_PAGE_SIZE = 10;

const getSubscription = (fiche: ApiFicheSummary) =>
  fiche.subscriptions?.[0] ??
  fiche.latestSubscription ??
  fiche.abonnementActif;

export function getFicheStatus(
  fiche: ApiFicheSummary,
  now = Date.now(),
): "active" | "expired" | "suspended" | "draft" {
  if (fiche.statut === "BROUILLON") return "draft";
  if (fiche.statut !== "ACTIVE") return "suspended";
  const subscription = getSubscription(fiche);
  if (subscription?.status && subscription.status !== "ACTIVE") return "expired";
  if (!subscription?.endsAt) return "active";
  return new Date(subscription.endsAt).getTime() <= now ? "expired" : "active";
}

export function filterFiches(
  fiches: ApiFicheSummary[],
  filters: FicheListFilters,
  now = Date.now(),
) {
  const normalizedSearch = filters.search.trim().toLocaleLowerCase("fr");

  return fiches.filter(fiche => {
    const searchMatches =
      normalizedSearch.length === 0 ||
      [
        fiche.prenom,
        fiche.nom,
        fiche.entreprise,
        fiche.fonction,
      ].some(value => value?.toLocaleLowerCase("fr").includes(normalizedSearch));
    if (!searchMatches) return false;

    const plan = (
      fiche.subscriptions?.[0]?.plan.type ??
      fiche.abonnementActif?.plan.type ??
      "ESSENTIELLE"
    ).toUpperCase();
    if (filters.plan !== "all" && plan !== filters.plan) return false;

    const status = getFicheStatus(fiche, now);
    if (filters.status !== "all" && status !== filters.status) return false;

    if (filters.sector !== "all" && fiche.secteur !== filters.sector)
      return false;

    const subscription = getSubscription(fiche);
    const endsAt = subscription?.endsAt;
    if (filters.expiry === "no-expiry" && endsAt) return false;
    if (filters.expiry === "expired" && status !== "expired") return false;
    if (filters.expiry === "expiring") {
      if (!endsAt || status !== "active") return false;
      const daysRemaining = Math.ceil(
        (new Date(endsAt).getTime() - now) / 86_400_000,
      );
      if (daysRemaining < 0 || daysRemaining > 30) return false;
    }

    return true;
  });
}

export function pageFiches<T>(
  fiches: T[],
  page: number,
  pageSize = FICHE_PAGE_SIZE,
) {
  const pageCount = Math.max(1, Math.ceil(fiches.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), pageCount);
  const start = (currentPage - 1) * pageSize;
  return {
    items: fiches.slice(start, start + pageSize),
    currentPage,
    pageCount,
    startIndex: fiches.length === 0 ? 0 : start + 1,
    endIndex: Math.min(start + pageSize, fiches.length),
  };
}
