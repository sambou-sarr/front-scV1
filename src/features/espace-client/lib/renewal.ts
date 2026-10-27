import type { ApiFicheSummary, PlanType } from "../../../types";
import { health, subscriptionEndsAt } from "./dashboard";

/*
  Renouvellement d'abonnement d'une fiche dont l'échéance est dépassée (logique pure).

  Côté serveur, une fiche sans abonnement valide est traitée comme Essentielle : toute formule payante,
  y compris la même que celle qui vient de se terminer, est donc acceptée par POST /subscription/upgrade.
  Tant que l'abonnement est valide, le serveur n'accepte qu'une formule SUPÉRIEURE (pas de renouvellement anticipé).
*/

export type PaidPlan = Exclude<PlanType, "ESSENTIELLE">;

export interface RenewalInfo {
  /** Plus aucun abonnement valide : la fiche peut être renouvelée. */
  expired: boolean;
  /** Formule payante qui vient de se terminer (à proposer en premier), si le serveur l'indique. */
  previousPlan: PaidPlan | null;
  /** Date de fin du dernier abonnement (ISO), si connue. */
  endedAt: string | null;
}

export const isExpiredFiche = (fiche: ApiFicheSummary, now = Date.now()) =>
  health(fiche, now) === "expired";

export function renewalInfo(
  fiche: ApiFicheSummary,
  now = Date.now(),
): RenewalInfo {
  const expired = isExpiredFiche(fiche, now);
  if (!expired) return { expired: false, previousPlan: null, endedAt: null };
  const last =
    fiche.latestSubscription?.plan?.type ?? fiche.abonnementActif?.plan?.type;
  return {
    expired: true,
    previousPlan: last && last !== "ESSENTIELLE" ? last : null,
    endedAt: subscriptionEndsAt(fiche) ?? null,
  };
}

/** Page des abonnements, avec la fenêtre de renouvellement de cette fiche ouverte. */
export const renewPath = (ficheId: number) =>
  `/espace-client/abonnements?renew=${ficheId}`;
