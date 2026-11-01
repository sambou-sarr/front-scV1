import { TAB_TYPES } from "../../../lib/plans";
import type { TabType } from "../../../types";
import type { SectionStickerAdmin } from "../../../types/admin";

/* Stickers par section : libellés et décisions possibles, côté administration (logique pure). */
type Statut = SectionStickerAdmin["statut"];

export const SS_STATUT: Record<Statut, { label: string; tone: string }> = {
  demande: { label: "À traiter", tone: "gold" },
  active: { label: "Activée", tone: "green" },
  desactivee: { label: "Désactivée", tone: "grey" },
  refusee: { label: "Refusée", tone: "red" },
};

/** Nom lisible d'une section : un type d'onglet connu, sinon un onglet personnalisé. */
export const sectionLabel = (key: string): string =>
  key in TAB_TYPES ? TAB_TYPES[key as TabType].label : "Onglet personnalisé";

export type SectionDecision = "active" | "desactivee" | "refusee";

/** Décisions possibles selon l'état (reflète les transitions acceptées par le serveur). */
export const DECISIONS: Record<
  Statut,
  { to: SectionDecision; label: string; primary?: boolean }[]
> = {
  demande: [
    { to: "active", label: "Activer la section", primary: true },
    { to: "refusee", label: "Refuser" },
  ],
  active: [{ to: "desactivee", label: "Désactiver" }],
  desactivee: [{ to: "active", label: "Réactiver", primary: true }],
  refusee: [],
};

export const DECISION_DONE: Record<SectionDecision, string> = {
  active: "Section activée : le client voit maintenant son lien et son QR",
  desactivee: "Section désactivée : la page redevient la fiche complète",
  refusee: "Demande refusée",
};

export const displayName = (f: SectionStickerAdmin["fiche"]) =>
  f.entreprise?.trim() ||
  [f.prenom, f.nom].filter(Boolean).join(" ").trim() ||
  f.slug;
