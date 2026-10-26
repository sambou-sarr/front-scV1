import type { Disposition, FicheData, Secteur, Taille, Theme } from "./fiche";
import type { Plan, PlanType } from "./plan";

/*
  Formes BRUTES renvoyées par l'API (DTO). Ne pas les utiliser dans les composants :
  `lib/ficheApi.ts` les convertit en `FicheRecord` (types/fiche.ts), le modèle de référence du front.

  Les enums « serveur » (MAJUSCULES) sont DÉRIVÉS des enums du domaine avec `Uppercase<…>` :
  ils ne peuvent plus dériver silencieusement.
*/

export type ApiSecteur = Uppercase<Secteur>;
export type StatutFiche = "ACTIVE" | "SUSPENDUE" | "BROUILLON";
export type PremierBouton = "WHATSAPP" | "APPEL" | "EMAIL";

/** Un média de `data.galerie` tel que stocké (le type n'est pas restreint côté serveur). */
export interface ApiMedia {
  type: string;
  url: string;
  alt?: string;
}

/** GET /fiches/:id, GET /fiches/public/:slug, PATCH /fiches/:id → `{ fiche }`. */
export interface ApiFicheDetail {
  id: number;
  slug: string;
  /** « ESSENTIELLE » | « PRO » | « SIGNATURE » (casse variable selon la route). */
  formule: string;
  planCapabilities?: Plan | null;
  statut: string;
  expiree?: boolean;
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
  updatedAt?: string;
  data: Omit<FicheData, "galerie"> & { galerie?: ApiMedia[] };
}

/** GET client/dashboard/fiches : lignes Prisma « Fiche » (colonnes MAJUSCULES, dates ISO, valeurs nullables). */
export interface ApiFicheSummary {
  id: number;
  slug: string;
  prenom: string;
  nom: string;
  fonction: string | null;
  entreprise: string | null;
  photo: string | null;
  logo: string | null;
  telephone: string | null;
  whatsapp: string | null;
  email: string | null;
  site: string | null;
  adresse: string | null;
  googlePlaceId: string | null;
  premierBouton: PremierBouton;
  messageWhatsapp: string | null;
  statut: StatutFiche;
  enLigneSeule: boolean;
  scansTotal: number;
  userId: number | null;
  claimCode: string | null;
  secteur: ApiSecteur | null;
  presentation: string | null;
  rdvLabel: string | null;
  rdvUrl: string | null;
  enteteDisposition: Uppercase<Disposition>;
  enteteTaille: Uppercase<Taille>;
  enteteTheme: Uppercase<Theme> | null;
  enteteCouverture: string | null;
  createdAt: string;
  updatedAt: string;
  /** Abonnement actif renvoyé dans la relation subscriptions du tableau de bord. */
  subscriptions?: {
    endsAt: string | null;
    status?: "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED";
    plan: { type: PlanType; nom?: string };
  }[];
  /** Dernier abonnement confirmé, y compris expiré ou annulé, pour afficher l’échéance. */
  latestSubscription?: {
    endsAt: string | null;
    status: "ACTIVE" | "CANCELED" | "EXPIRED";
  } | null;
  /** Ancien format compatible avec les réponses déjà adaptées. */
  abonnementActif?: {
    endsAt: string | null;
    status?: "PENDING" | "ACTIVE" | "CANCELED" | "EXPIRED";
    plan: { type: PlanType; nom: string };
  } | null;
}
