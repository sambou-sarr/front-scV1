// Types partagés de la mise à jour V5 (création de contenu, immobilier, demandes de devis).
// Le contrat LeadPayload est celui que reçoit la fonction serveur lead-intake.

export type Pole = 'contenu' | 'impression' | 'digital' | 'ia' | 'immobilier';
export type Mode = 'reel' | 'ia';
export type Production = 'reel' | 'ia' | 'mixte' | 'indecis';
export type Delai = 'urgent' | 'mois' | 'trimestre' | 'libre';
export type Profil = 'promoteur' | 'agence' | 'proprietaire';
export type Stade = 'avant-lancement' | 'chantier' | 'commercialisation' | 'livraison';

/** Une prestation du catalogue (identifiant stable : il sert de clé de prix et de valeur envoyée au back-office). */
export interface Prestation {
  id: string;
  label: string;
  pole: Pole;
  /** Description quand le visiteur a choisi « Tournage réel ». */
  reel: string;
  /** Description quand le visiteur a choisi « Avec l’IA ». Absente = même texte dans les deux cas. */
  ia?: string;
}

export interface Img {
  /** Chemin sans suffixe : /images/contenu/tournage-chef → tournage-chef-l.webp (largeur w) et tournage-chef-s.webp (w/2) */
  src: string;
  alt: string;
  w: number;
  h: number;
  /** true = image existante en un seul fichier : src contient l'extension (ex. /images/panneau-immo.webp). */
  single?: boolean;
}

export interface Projet {
  nom?: string;
  ville?: string;
  lots?: number | null;
  stade?: Stade;
}

/** Ce que reçoit lead-intake (champs historiques + champs V5). */
export interface LeadPayload {
  intent: 'devis' | 'demo' | 'question';
  intentLabel: string;
  products: string[];
  sector: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  prefer: string;
  message: string;
  consent_marketing: boolean;
  consent_text: string;
  consent_at: string;
  source: 'site';
  page: string;
  website: string; // pot de miel anti-robot : toujours vide pour un humain
  // V5
  pole: Pole;
  services: string[];
  production: Production;
  delai: Delai;
  profil?: Profil;
  projet?: Projet;
}

/** Préréglage d'ouverture du formulaire (bouton cliqué). */
export interface QuotePreset {
  pole?: Pole;
  services?: string[];
  profil?: Profil;
  stade?: Stade;
  production?: Production;
  from?: string;
}
