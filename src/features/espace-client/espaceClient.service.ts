// create fiche
import { api } from "../../lib/api";
import type { ApiFicheSummary } from "../../types";
import { toApiError } from "../../lib/apiError";
import type { SubscriptionKpi } from "./pages/SubscriptionPage";
import type { PlanType } from "../../types";

export async function createFiche(data: any) {
  const result = await api.post("/fiches", data);
  return result.data;
}

export type PlanPricing = {
  formule: "essentielle" | "pro" | "signature";
  nom: string;
  prixMensuelFcfa: number | null;
  durees: { dureeMois: number; remisePct: number }[];
  remises: { quantiteMin: number; remisePct: number }[];
};

export type PricingGrid = {
  formules: PlanPricing[];
  emplacements: {
    prixUnitaireFcfa: number | null;
    packs: { quantite: number; prixFcfa: number }[];
  };
};

export type FicheCreationStatus = {
  totalFiches: number;
  fichesReservees: number;
  freeSlots: number;
  isLimitReached: boolean;
};

export type FichePurchaseInput = {
  plan: "essentielle" | "pro" | "signature";
  quantity: number;
  dureeMois?: number;
};

export type CardRequest = {
  id: number;
  ficheId: number | null;
  tier: string;
  statut: "a_imprimer" | "imprimee" | "encodee" | "testee" | "livree" | "annulee";
  nfcUrl: string;
  adresseLivraison: string | null;
  telephoneLivraison: string | null;
  notesClient: string | null;
  montantFcfa: number | null;
  createdAt: string;
};

export type CardRequestInput = {
  adresseLivraison: string;
  telephoneLivraison: string;
  notesClient?: string;
};

export async function getCardRequest(ficheId: number): Promise<CardRequest | null> {
  const response = await api.get<{ carte: CardRequest | null }>(
    `fiches/${ficheId}/card-request`,
  );
  return response.data.carte;
}

export async function createCardRequest(
  ficheId: number,
  input: CardRequestInput,
): Promise<CardRequest> {
  const response = await api.post<{ carte: CardRequest }>(
    `fiches/${ficheId}/card-request`,
    input,
  );
  return response.data.carte;
}

export type FichePurchaseQuote = {
  formule: string;
  nom: string;
  quantity: number;
  freeQuantity: number;
  paidQuantity: number;
  dureeMois: number | null;
  totalFcfa: number;
  tarif?: {
    prixMensuelFcfa: number;
    remiseDureePct: number;
    remiseQuantitePct: number;
    prixApresDureeFcfa: number;
    prixUnitaireFcfa: number;
    totalSansRemiseFcfa: number;
    economieFcfa: number;
  };
  emplacements?: {
    totalSansPackFcfa: number;
    economieFcfa: number;
    detail: {
      unitaires: number;
      packs: { quantite: number; prixFcfa: number; nombre: number }[];
    };
  } | null;
};

export async function getFicheCreationStatus(): Promise<FicheCreationStatus> {
  const response = await api.get<FicheCreationStatus>("fiches/total-fiche");
  return response.data;
}

export async function getPricingGrid(): Promise<PricingGrid> {
  const response = await api.get<PricingGrid>("client/parametres");
  return response.data;
}

export async function quoteFichePurchase(
  input: FichePurchaseInput
): Promise<FichePurchaseQuote> {
  const response = await api.post<{ quote: FichePurchaseQuote }>(
    "fiches/purchases/quote",
    input,
  );
  return response.data.quote;
}

export async function purchaseFiches(
  input: FichePurchaseInput,
): Promise<{
  purchase: { id: number; status: "confirmed" };
  fiches: {
    id: number;
    slug: string;
    prenom: string;
    nom: string;
    formule: string;
    statut: string;
  }[];
}> {
  const response = await api.post<
    | {
        purchase: { id: number; status: "confirmed" };
        fiches: {
          id: number;
          slug: string;
          prenom: string;
          nom: string;
          formule: string;
          statut: string;
        }[];
      }
    | {
        purchase: { id: number; status: "pending" };
      }
  >("fiches/purchases", input);

  if (response.data.purchase.status === "confirmed")
    return response.data as {
      purchase: { id: number; status: "confirmed" };
      fiches: {
        id: number;
        slug: string;
        prenom: string;
        nom: string;
        formule: string;
        statut: string;
      }[];
    };

  const confirmation = await api.post<{
    purchase: { id: number; status: "confirmed" };
    fiches: {
      id: number;
      slug: string;
      prenom: string;
      nom: string;
      formule: string;
      statut: string;
    }[];
  }>(`fiches/purchases/${response.data.purchase.id}/simulate-confirmation`);
  return confirmation.data;
}

export async function quoteSubscription(
  plan: Exclude<PlanType, "ESSENTIELLE">,
  dureeMois: number,
) {
  const response = await api.post<{
    totalFcfa: number;
    totalSansRemiseFcfa: number;
    economieFcfa: number;
    lignes: {
      quantite: number;
      dureeMois: number;
      prixMensuelFcfa: number;
      remiseDureePct: number;
      remiseQuantitePct: number;
      prixApresDureeFcfa: number;
      prixUnitaireFcfa: number;
      totalFcfa: number;
      totalSansRemiseFcfa: number;
      economieFcfa: number;
    }[];
  }>("client/parametres/commande/tarif", {
    lignes: [
      {
        formule: plan.toLowerCase(),
        dureeMois,
        quantite: 1,
      },
    ],
  });
  return response.data;
}

export async function getDashboardFiche(
  signal?: AbortSignal
): Promise<ApiFicheSummary[]> {
  const response = await api.get<ApiFicheSummary[]>("client/dashboard/fiches", {
    signal,
  });
  return response.data;
}

// get subscripton kpi

export async function getKpi(): Promise<SubscriptionKpi> {
  try {
    const response = await api.get<SubscriptionKpi>("subscription/kpi");
    return response.data;
  } catch (e) {
    throw toApiError(e);
  }
}


export type UpgradePlanResponse = {
  succes: string;
  message?: string;
  data: {
    subscription: { id: number; ficheId: number; planId: number; status: string };
    fiche: { id: number; formule: string };
    payment: {
      id: number;
      reference: string | null;
      mode: "simulation";
      status: "confirmed";
    };
  };
};

export async function upgradeFichePlan(
  ficheId: number,
  plan: Exclude<PlanType, "ESSENTIELLE">,
  dureeMois: number,
): Promise<UpgradePlanResponse> {
  // Étape 1 : demander l'upgrade. Le backend crée un paiement PENDING,
  // sans changer la formule active.
  const request = await api.post<{
    data: { payment: { id: number; reference: string | null; status: "pending" } };
  }>("/subscription/upgrade", {
    ficheId,
    plan: plan.toLowerCase(),
    dureeMois,
  });

  // Étape 2 : adaptateur de simulation (désactivé côté backend en production).
  // L'intégration Wave/Orange Money remplacera cet appel par le parcours fournisseur.
  const paymentId = request.data.data.payment.id;
  const confirmation = await api.post<UpgradePlanResponse>(
    `/subscription/payments/${paymentId}/simulate-confirmation`
  );
  return confirmation.data;
}
