// Formes des réponses de l'API (voir admin.service.ts). L'API parle en minuscules : "pro", "active".
export type Formule = "essentielle" | "pro" | "signature";
export type Statut = "active" | "suspendue";

export interface Proprietaire {
  id: number;
  email: string;
  nom: string | null;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FicheRow {
  id: number;
  slug: string;
  nom: string;
  entreprise: string;
  statut: Statut;
  formule: Formule;
  expiree: boolean;
  dateEcheance: string | null;
  scansTotal: number;
  createdAt: string;
  proprietaire: Proprietaire | null;
}
export interface FichesPage {
  fiches: FicheRow[];
  pagination: Pagination;
}

export interface Stats {
  fiches: {
    total: number;
    suspendues: number;
    expirees: number;
    expirentBientot: number;
    sansProprietaire: number;
    nouvellesSur30Jours: number;
  };
  formules: Record<Formule, number>;
  scansTotal: number;
  clients: number;
}

export interface Abonnement {
  id: number;
  formule: Formule;
  statut: string;
  debut: string;
  fin: string | null;
  montantFcfa: number | null;
  referencePaiement: string | null;
  annuleLe: string | null;
}
// Le détail d'une fiche vient de toFicheDto (module fiches) : on ne lit que quelques champs, sans supposer le reste.
export type FicheDto = {
  id: number;
  slug: string;
  compteClientCree?: boolean;
} & Record<string, unknown>;
export interface FicheDetail {
  fiche: FicheDto;
  abonnements: Abonnement[];
}

export interface UserRow {
  id: number;
  email: string;
  nom: string | null;
  role: "client" | "admin";
  emailVerifie: boolean;
  createdAt: string;
  nbFiches: number;
}
export interface UsersPage {
  users: UserRow[];
  pagination: Pagination;
}

export type LeadStatus = "NEW" | "CONTACTED" | "CLOSED";
export interface LeadRequest {
  id: number;
  intent: string;
  intentLabel: string;
  products: string[];
  sector: string | null;
  name: string;
  role: string | null;
  company: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  prefer: string | null;
  message: string | null;
  consentMarketing: boolean;
  consentText: string | null;
  consentAt: string | null;
  source: string;
  page: string | null;
  pole: string | null;
  services: string[];
  production: string | null;
  delai: string | null;
  profil: string | null;
  projet: Record<string, unknown> | null;
  design: Record<string, unknown> | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}
export interface LeadRequestsPage {
  items: LeadRequest[];
  pagination: Pagination;
}

export interface ListFichesParams {
  search?: string;
  statut?: string;
  formule?: string;
  expiration?: string;
  userId?: string;
  tri?: string;
  page?: number;
  limit?: number;
}

export interface SubscriptionInput {
  plan: Formule;
  endsAt?: string | null;
  amountFcfa?: number;
  paymentRef?: string;
}

export type RelanceType = "bientot" | "expirees" | "montee";
export interface RelanceItem {
  id: number;
  slug: string;
  nom: string;
  prenom: string;
  entreprise: string;
  formule: Formule;
  dateEcheance: string | null;
  joursRestants: number | null;
  scansTotal: number;
  telephone: string | null;
  whatsapp: string | null;
  email: string | null;
  proprietaire: Proprietaire | null;
}
export interface RelancesPage {
  total: number;
  items: RelanceItem[];
}

export interface Revenus {
  encaisse: {
    ceMois: number;
    moisPrecedent: number;
    evolutionPct: number | null;
  };
  mois: { mois: string; montantFcfa: number; nbPaiements: number }[];
  parFormule: Record<Formule, { montantFcfa: number; nbPaiements: number }>;
  aRenouveler: { nb: number; montantEstimeFcfa: number };
  fichesParSemaine: { semaine: string; nb: number }[];
}

// ───── Production (cartes NFC, stickers, QR dynamiques) ─────
export type StatutCarte =
  | "a_imprimer"
  | "imprimee"
  | "encodee"
  | "testee"
  | "livree"
  | "annulee";
export type StatutSticker =
  | "a_parametrer"
  | "parametre"
  | "teste"
  | "imprime"
  | "livre"
  | "annule";
export type Fonction =
  | "avis"
  | "wifi"
  | "menu"
  | "reseaux"
  | "contact"
  | "rdv"
  | "lien";
export interface FicheProd {
  id: number | null;
  slug: string;
  nom: string;
  entreprise: string;
  telephone: string | null;
  email: string | null;
  fonction: string | null;
}
export interface Carte {
  id: number;
  ficheId: number | null;
  rectoPath: string | null;
  versoPath: string | null;
  tier: Formule;
  nfcUrl: string;
  adresseChangee: boolean;
  rectoUrl: string | null;
  versoUrl: string | null;
  design: Record<string, unknown> | null;
  encodedAt: string | null;
  statut: StatutCarte;
  notes: string | null;
  printedAt: string | null;
  testedAt: string | null;
  createdAt: string;
  fiche: FicheProd | null;
}
export type ParamsSticker = Record<string, string | number | boolean>;
export interface Sticker {
  id: number;
  kind: "fonction" | "telephone";
  fonction: Fonction | null;
  tailleMm: number;
  forme: string | null;
  theme: string | null;
  quantite: number;
  options: { nfc?: boolean; anti_metal?: boolean } | null;
  parametres: ParamsSticker | null;
  personnalisation: {
    couleur_qr?: string;
    fond?: string;
    texte?: string;
  } | null;
  qrMode: "dynamique" | "wifi" | "fiche";
  ficheSlug: string | null;
  ficheUrl: string | null;
  qr: {
    code: string;
    url: string;
    targetUrl: string | null;
    actif: boolean;
    scans: number;
  } | null;
  statut: StatutSticker;
  notes: string | null;
  createdAt: string;
  fiche: FicheProd | null;
}
export interface QrLien {
  code: string;
  url: string;
  label: string | null;
  targetUrl: string | null;
  actif: boolean;
  scans: number;
  lastScanAt: string | null;
  sticker: { id: number; fonction: Fonction | null; tailleMm: number } | null;
}
export interface ProductionSummary {
  cartesAImprimer: number;
  stickersAParametrer: { fonction: number; telephone: number };
  qrSansCible: number;
  scansQr: number;
}
export type CreateStickerInput =
  | {
      kind: "fonction";
      fonction: Fonction;
      tailleMm: 80 | 120 | 170;
      forme: "rond" | "carre";
      theme: "noir" | "blanc" | "or" | "rouge";
      quantite: number;
      ficheId?: number;
      options?: { nfc?: boolean; anti_metal?: boolean };
      parametres: ParamsSticker;
    }
  | {
      kind: "telephone";
      ficheId: number;
      quantite: number;
      personnalisation: { couleur_qr?: string; fond?: string; texte?: string };
    };
export type Duree = { dureeMois: number; remisePct: number };
export type Palier = { quantiteMin: number; remisePct: number };
export type Pack = { quantite: number; prixFcfa: number };

export type FormuleReglage = {
  formule: "essentielle" | "pro" | "signature";
  nom: string;
  prixMensuelFcfa: number | null; // base du calcul (1 mois)
  prixFcfa: number | null; // défaut à l'activation d'un abonnement
  dureeMois: number | null; // défaut à l'activation
  actif: boolean;
  durees: Duree[];
  remises: Palier[];
};

export type Emplacements = { prixUnitaireFcfa: number | null; packs: Pack[] };
export type Parametres = {
  formules: FormuleReglage[];
  emplacements: Emplacements;
};

export type PatchFormule = Partial<
  Pick<
    FormuleReglage,
    | "prixMensuelFcfa"
    | "prixFcfa"
    | "dureeMois"
    | "actif"
    | "durees"
    | "remises"
  >
>;
export type PatchEmplacements = {
  prixUnitaireFcfa?: number | null;
  packs?: Pack[];
};

export type TarifEmplacements = {
  quantite: number;
  prixUnitaireFcfa: number;
  totalFcfa: number;
  totalSansPackFcfa: number;
  economieFcfa: number;
  detail: {
    unitaires: number;
    packs: { quantite: number; prixFcfa: number; nombre: number }[];
  };
};
export type TarifLigne = {
  formule: string;
  quantiteFormule: number;
  dureeMois: number;
  quantite: number;
  prixMensuelFcfa: number;
  remiseDureePct: number;
  remiseQuantitePct: number;
  prixApresDureeFcfa: number;
  prixUnitaireFcfa: number;
  totalFcfa: number;
  totalSansRemiseFcfa: number;
  economieFcfa: number;
};
export type TarifCommande = {
  lignes: TarifLigne[];
  emplacements: TarifEmplacements | null;
  totalFcfa: number;
  totalSansRemiseFcfa: number;
  economieFcfa: number;
};
export type CommandeInput = {
  lignes: {
    formule: FormuleReglage["formule"];
    dureeMois: number;
    quantite: number;
  }[];
  emplacements?: number;
};

// ───── Générateur de QR codes (module back « qrcode ») ─────
export type QrFormat = "png" | "svg" | "jpeg" | "webp" | "pdf";
export type QrDots = "square" | "rounded" | "dots" | "diamond";
export type QrEye = "square" | "rounded" | "circle";
export interface QrStyle {
  size?: number;
  margin?: number;
  errorCorrection?: "L" | "M" | "Q" | "H";
  foreground?: string;
  background?: string;
  gradient?: {
    type: "linear" | "radial";
    from: string;
    to: string;
    angle?: number;
  } | null;
  dots?: QrDots;
  eyes?: {
    frame?: QrEye;
    pupil?: QrEye;
    frameColor?: string | null;
    pupilColor?: string | null;
  };
  logo?: {
    dataUrl?: string;
    sizePct?: number;
    shape?: "square" | "circle";
    backgroundColor?: string;
  } | null;
  label?: { text: string; color?: string; fontSizePx?: number } | null;
}
export type QrContenu =
  | {
      type: "lien";
      url: string;
      utm?: Partial<
        Record<"source" | "medium" | "campaign" | "term" | "content", string>
      >;
    }
  | {
      type: "wifi";
      ssid: string;
      password?: string;
      encryption: "WPA" | "WEP" | "nopass";
      hidden?: boolean;
    };
export interface QrRenderInput {
  contenu: QrContenu;
  styleId?: number;
  style?: QrStyle;
  nom?: string;
}
export interface QrApercu {
  contenu: string;
  width: number;
  height: number;
  svg: string;
  dataUrl: string;
  avertissements: string[];
}
export interface QrStyleItem {
  id: number;
  nom: string;
  avecLogo: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface QrStyleFull {
  id: number;
  nom: string;
  style: QrStyle;
  createdAt: string;
  updatedAt: string;
}
export interface QrFormatInfo {
  format: QrFormat;
  mime: string;
  extension: string;
  description: string;
}
