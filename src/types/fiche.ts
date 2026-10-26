/**
 * Modèle de domaine de la fiche côté front : c'est LA référence pour l'éditeur, la fiche publique et les tests.
 *
 *   types/fiche.ts : ce fichier (FicheRecord, FicheData, Onglet…), valeurs en minuscules, jamais null
 *   types/plan.ts  : droits d'une formule (Plan)
 *   types/api.ts   : formes brutes renvoyées par le serveur (DTO) ; lib/ficheApi.ts les convertit en FicheRecord
 *
 * Les enums sont des unions de chaînes (pas de `enum` TS : compatible `erasableSyntaxOnly`).
 */
import type { Plan } from "./plan";

/** Secteurs d'activité proposés (modèles de page). */
export const SECTEURS = [
  "restaurant",
  "immobilier",
  "commerce",
  "hotel",
  "independant",
  "beaute",
] as const;
export type Secteur = (typeof SECTEURS)[number];

export const DISPOSITIONS = ["portrait", "logo", "banniere", "duo"] as const;
export type Disposition = (typeof DISPOSITIONS)[number];

export const TAILLES = ["s", "m", "l"] as const;
export type Taille = (typeof TAILLES)[number];

export const THEMES = ["or", "clair", "bleu", "nuit"] as const;
export type Theme = (typeof THEMES)[number];

export type Formule = "essentielle" | "pro" | "signature";

export type TabType =
  | "presentation"
  | "menu"
  | "biens"
  | "catalogue"
  | "galerie"
  | "videos"
  | "liens"
  | "rendezvous"
  | "rappel"
  | "horaires"
  | "avis"
  | "reseaux"
  | "localisation"
  | "texte";

export interface Onglet {
  id: string;
  type: TabType;
  titre?: string;
  contenu?: string;
  visible?: boolean;
}
export interface Entete {
  disposition?: Disposition;
  taille?: Taille;
  theme?: Theme;
  couverture?: string;
}
/** Entête après application des valeurs par défaut de la formule. */
export interface EnteteComplete {
  disposition: Disposition;
  taille: Taille;
  theme: Theme;
  couverture?: string;
}
export interface Lien {
  label: string;
  url: string;
}
export interface Horaire {
  jour: string;
  horaire: string;
}
export interface Photo {
  type: "image" | "video";
  url: string;
  alt?: string;
}
export interface Article {
  nom: string;
  description?: string;
  photo?: string;
  prix?: string;
  devise?: string;
  badge?: string;
}
export interface SectionCatalogue {
  titre: string;
  articles: Article[];
}
export interface Plat {
  nom: string;
  prix?: string;
  description?: string;
  image?: string;
  video?: string;
  videoWebm?: string;
  badge?: string;
}
export interface SectionMenu {
  titre: string;
  plats: Plat[];
}

/**
 * Bien tel qu'il est édité et renvoyé dans `data.biens` (GET / PATCH /fiches/:id) :
 * prix en texte, photos en URLs. C'est la forme de référence côté front.
 */
export interface BienData {
  titre: string;
  type: "vente" | "location";
  prix?: string;
  periode?: string;
  ville?: string;
  surface?: number | string;
  terrain?: number | string;
  chambres?: number | string;
  sdb?: number | string;
  atouts?: string[];
  description?: string;
  photos?: string[];
}

export interface FicheData {
  secteur?: Secteur;
  /** WHATSAPP | APPEL | EMAIL (voir PremierBouton dans types/api.ts). */
  premierBouton?: string;
  messageWhatsapp?: string;
  presentation?: string;
  reseauxSociaux?: Lien[];
  liens?: Lien[];
  horaires?: Horaire[];
  galerie?: Photo[];
  sections?: SectionCatalogue[];
  menu?: { sections: SectionMenu[] };
  biens?: BienData[];
  rendezVous?: { label: string; url: string };
  onglets?: Onglet[];
  entete?: Entete;
}

/**
 * Clés de `FicheData`, listées UNE fois. Utilisée par `lib/ficheApi.ts` (lecture du serveur) et
 * `lib/fichePayload.ts` (corps du PATCH). Ajouter une clé à `FicheData` sans l'ajouter ici fait échouer le typecheck.
 * La synchronisation avec le schéma Zod du serveur reste à vérifier à la main (api-sc/src/modules/fiches/fiches.schemas.ts).
 */
export const FICHE_DATA_KEYS = [
  "secteur",
  "premierBouton",
  "messageWhatsapp",
  "presentation",
  "reseauxSociaux",
  "liens",
  "horaires",
  "galerie",
  "sections",
  "menu",
  "biens",
  "rendezVous",
  "onglets",
  "entete",
] as const satisfies readonly (keyof FicheData)[];

type MissingDataKeys = Exclude<
  keyof FicheData,
  (typeof FICHE_DATA_KEYS)[number]
>;
type Assert<T extends true> = T;
export type FicheDataKeysAreExhaustive = Assert<
  [MissingDataKeys] extends [never] ? true : false
>;

export interface FicheRecord {
  id: number;
  slug: string;
  formule: Formule;
  planCapabilities?: Plan | null;
  expiree?: boolean;
  statut: string;
  enLigneSeule: boolean;
  prenom: string;
  nom: string;
  fonction: string;
  entreprise: string;
  photo: string;
  logo: string;
  telephone: string;
  whatsapp: string;
  email: string;
  site: string;
  adresse: string;
  googlePlaceId: string;
  dateEcheance: string | null;
  scansTotal: number;
  /** Version de la fiche renvoyée par l'API ; renvoyée au PATCH pour détecter une modification concurrente. */
  updatedAt?: string;
  data: FicheData;
}
