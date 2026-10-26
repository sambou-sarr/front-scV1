import type { Disposition, TabType, Taille, Theme } from "./fiche";

/** Formule commerciale telle que l'envoie le serveur (MAJUSCULES). `Formule` (fiche.ts) en est la version minuscule. */
export const PLAN_TYPES = ["ESSENTIELLE", "PRO", "SIGNATURE"] as const;
export type PlanType = (typeof PLAN_TYPES)[number];

/** Droits d'une formule (à dupliquer côté serveur). Les limites absentes = fonction non incluse. */
export interface Plan {
  label: string;
  theme: Theme;
  tabs: TabType[];
  canReorder: boolean;
  canHide: boolean;
  canAdd: boolean;
  canRename: boolean;
  maxPresentation: number;
  maxSocial: number;
  maxLinks: number;
  maxPhotos: number;
  maxVideos: number;
  maxCustomTabs?: number;
  hasGoogleReview: boolean;
  hasCatalog: boolean;
  maxCatalogSections?: number;
  maxCatalogArticlesPerSection?: number;
  catalogPrices: boolean;
  hasMenu?: boolean;
  maxMenuSections?: number;
  maxMenuItemsPerSection?: number;
  menuVideoPerItem?: boolean;
  maxMenuVideoSeconds?: number;
  hasBiens?: boolean;
  maxBiens?: number;
  maxPhotosPerBien?: number;
  hasForm?: boolean;
  hasStats: boolean;
  hasDashboard?: boolean;
  headerLayouts: Disposition[];
  themes: Theme[];
}

export interface TabTypeInfo {
  label: string;
  icon: string;
  hint?: string;
}
export interface Template {
  label: string;
  icon: string;
  tabs: TabType[];
  titles: Partial<Record<TabType, string>>;
  entete: { disposition: Disposition; taille: Taille };
}

export const FORMULES: {
  id: PlanType;
  label: string;
  description: string;
  accent: string;
}[] = [
  {
    id: "ESSENTIELLE",
    label: "Essentiel",
    description: "L'essentiel pour commencer à partager vos coordonnées.",
    accent: "border-[#e3dfd8]",
  },
  {
    id: "PRO",
    label: "Pro",
    description: "Pour donner plus de visibilité à votre activité.",
    accent: "border-[#ef1733]/30",
  },
  {
    id: "SIGNATURE",
    label: "Signature",
    description: "Une expérience complète pour votre présence digitale.",
    accent: "border-amber-300",
  },
];
