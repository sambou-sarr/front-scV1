// Formules, droits, blocs et modèles par métier.
// ⚠️ Source de vérité commune : le tableau « Ce que contient chaque carte » du site (data/cartes.ts),
//    les droits du back-office (settings.plan_limits) et la validation serveur de l'outil membres.
import type {
  Disposition,
  Entete,
  EnteteComplete,
  FicheData,
  FicheRecord,
  Formule,
  Onglet,
  Plan,
  Secteur,
  TabType,
  TabTypeInfo,
  Taille,
  Template,
  Theme,
} from "../types";

export const TAB_TYPES: Record<TabType, TabTypeInfo> = {
  presentation: { label: "Présentation", icon: "user" },
  menu: {
    label: "Menu interactif",
    icon: "play",
    hint: "Plats avec photo, vidéo courte et description",
  },
  biens: {
    label: "Biens immobiliers",
    icon: "home",
    hint: "Photos, prix et caractéristiques de chaque bien",
  },
  catalogue: {
    label: "Produits & prestations",
    icon: "menu",
    hint: "Sections et articles avec photo",
  },
  galerie: { label: "Galerie", icon: "image" },
  videos: { label: "Vidéos", icon: "play" },
  liens: { label: "Liens", icon: "link" },
  rendezvous: { label: "Rendez-vous", icon: "cal" },
  rappel: { label: "Être rappelé", icon: "chat" },
  horaires: { label: "Horaires", icon: "clock" },
  avis: { label: "Avis Google", icon: "star" },
  reseaux: { label: "Réseaux sociaux", icon: "globe" },
  localisation: { label: "Localisation", icon: "pin" },
  texte: {
    label: "Texte libre",
    icon: "text",
    hint: "Un onglet à votre nom, votre texte",
  },
};



export const PLANS: Record<Formule, Plan> = {
  essentielle: {
    label: "Essentielle",
    theme: "bleu",
    tabs: ["presentation", "reseaux", "localisation"],
    canReorder: false,
    canHide: false,
    canAdd: false,
    canRename: false,
    maxPresentation: 280,
    maxSocial: 3,
    maxLinks: 0,
    maxPhotos: 0,
    maxVideos: 0,
    hasGoogleReview: false,
    hasCatalog: false,
    catalogPrices: false,
    hasStats: false,
    headerLayouts: ["portrait"],
    themes: ["bleu"],
  },
  pro: {
    label: "Pro",
    theme: "clair",
    tabs: [
      "presentation",
      "catalogue",
      "galerie",
      "videos",
      "liens",
      "horaires",
      "avis",
      "reseaux",
      "localisation",
    ],
    canReorder: true,
    canHide: true,
    canAdd: false,
    canRename: false,
    maxPresentation: 800,
    maxSocial: 6,
    maxLinks: 10,
    maxPhotos: 4,
    maxVideos: 1,
    hasGoogleReview: true,
    hasCatalog: true,
    maxCatalogSections: 2,
    maxCatalogArticlesPerSection: 12,
    catalogPrices: false,
    hasStats: true,
    headerLayouts: ["portrait"],
    themes: ["clair", "bleu"],
  },
  signature: {
    label: "Signature",
    theme: "or",
    tabs: Object.keys(TAB_TYPES) as TabType[],
    canReorder: true,
    canHide: true,
    canAdd: true,
    canRename: true,
    maxPresentation: 2000,
    maxSocial: 10,
    maxLinks: 10,
    maxPhotos: 8,
    maxVideos: 3,
    maxCustomTabs: 4,
    hasGoogleReview: true,
    hasCatalog: true,
    maxCatalogSections: 6,
    maxCatalogArticlesPerSection: 12,
    catalogPrices: true,
    hasMenu: true,
    maxMenuSections: 6,
    maxMenuItemsPerSection: 12,
    menuVideoPerItem: true,
    maxMenuVideoSeconds: 30,
    hasBiens: true,
    maxBiens: 30,
    maxPhotosPerBien: 10,
    hasForm: true,
    hasStats: true,
    hasDashboard: true,
    headerLayouts: ["portrait", "logo", "banniere", "duo"],
    themes: ["or", "clair", "bleu", "nuit"],
  },
};

// Droits effectifs d'une fiche : ceux renvoyés par l'API (table plan_limits, modifiable depuis le back-office),
// avec repli sur PLANS pour les données fictives ou une API qui ne les fournit pas.
export const planOf = (
  f: Pick<FicheRecord, "formule" | "planCapabilities">
): Plan => f.planCapabilities ?? PLANS[f.formule];

// Modèles de page par métier : ordre des blocs + entête conseillé. Appliqués dans les limites de la formule.
export const TEMPLATES: Record<Secteur, Template> = {
  restaurant: {
    label: "Restaurant, café",
    icon: "menu",
    tabs: [
      "menu",
      "rendezvous",
      "horaires",
      "galerie",
      "avis",
      "localisation",
      "reseaux",
    ],
    titles: { rendezvous: "Réserver une table", menu: "La carte" },
    entete: { disposition: "logo", taille: "l" },
  },
  immobilier: {
    label: "Immobilier",
    icon: "home",
    tabs: [
      "biens",
      "presentation",
      "rappel",
      "avis",
      "localisation",
      "reseaux",
    ],
    titles: { biens: "Nos biens" },
    entete: { disposition: "banniere", taille: "m" },
  },
  commerce: {
    label: "Commerce, boutique",
    icon: "menu",
    tabs: [
      "catalogue",
      "horaires",
      "galerie",
      "avis",
      "localisation",
      "reseaux",
    ],
    titles: { catalogue: "Nos produits" },
    entete: { disposition: "logo", taille: "m" },
  },
  hotel: {
    label: "Hôtel, résidence",
    icon: "cal",
    tabs: [
      "presentation",
      "galerie",
      "rendezvous",
      "menu",
      "avis",
      "localisation",
      "reseaux",
    ],
    titles: { rendezvous: "Réserver une chambre", menu: "Le restaurant" },
    entete: { disposition: "banniere", taille: "l" },
  },
  independant: {
    label: "Indépendant, commercial",
    icon: "user",
    tabs: ["presentation", "rappel", "liens", "reseaux", "horaires"],
    titles: {},
    entete: { disposition: "duo", taille: "m" },
  },
  beaute: {
    label: "Beauté, bien-être",
    icon: "star",
    tabs: [
      "catalogue",
      "rendezvous",
      "galerie",
      "horaires",
      "avis",
      "localisation",
      "reseaux",
    ],
    titles: { catalogue: "Nos prestations", rendezvous: "Prendre rendez-vous" },
    entete: { disposition: "portrait", taille: "l" },
  },
};

export const LAYOUTS: Record<Disposition, { label: string; hint: string }> = {
  portrait: {
    label: "Portrait",
    hint: "Photo ronde : commercial terrain, indépendant",
  },
  logo: { label: "Logo", hint: "Grand logo centré : restaurant, marque" },
  banniere: {
    label: "Bannière",
    hint: "Photo de couverture : hôtel, immobilier",
  },
  duo: { label: "Duo", hint: "Photo + logo de l’entreprise : équipe" },
};
export const SIZES: Record<Taille, string> = {
  s: "Petit",
  m: "Moyen",
  l: "Grand",
};
export const THEMES: Record<Theme, string> = {
  or: "Noir & or",
  clair: "Ivoire & bronze",
  bleu: "Bleu nuit",
  nuit: "Noir & rouge",
};

let uid = 0;
const nid = (t: string) =>
  `${t}-${Date.now().toString(36)}${(uid++).toString(36)}`;
// Ids DÉTERMINISTES : defaultTabs() est rappelé à chaque rendu tant que la fiche n'a pas d'onglets
// enregistrés ; avec des ids aléatoires, l'onglet ouvert / sélectionné ne correspondait plus à rien
// au rendu suivant (sections qui se referment, bouton « Modifier » sans effet).
export const defaultTabs = (formule: Formule): Onglet[] =>
  PLANS[formule].tabs
    .filter(
      t =>
        t !== "texte" &&
        !(formule === "signature" && ["menu", "biens"].includes(t))
    )
    .map(type => ({ id: `${formule}-${type}`, type, visible: true }));

const isEssentialDefaultTabs = (tabs: Onglet[]) => {
  const essentialTabs = defaultTabs("essentielle");
  return (
    tabs.length === essentialTabs.length &&
    essentialTabs.every(expected => {
      const actual = tabs.find(tab => tab.type === expected.type);
      return (
        actual !== undefined &&
        actual.visible !== false &&
        actual.titre === undefined &&
        actual.contenu === undefined
      );
    })
  );
};

/**
 * Fiche Signature dont la configuration enregistrée est encore celle de l'Essentielle (upgrade de formule).
 * Une fiche déjà migrée (voir `migrateLegacySignature`) est reconnue à ses onglets `signature-…` (identifiants
 * déterministes de `defaultTabs`) : une page Signature volontairement réduite à ces trois onglets n'est donc
 * pas prise pour un ancien modèle.
 */
export const hasLegacyEssentialTemplate = (
  fiche: Pick<FicheRecord, "formule" | "data">,
) =>
  fiche.formule === "signature" &&
  !!fiche.data.onglets?.length &&
  isEssentialDefaultTabs(fiche.data.onglets) &&
  !fiche.data.onglets.some(tab => tab.id.startsWith("signature-"));

/** Onglets persistés, en remplaçant les seuls défauts Essentielle après un upgrade Signature. */
export const configuredTabs = (
  fiche: Pick<FicheRecord, "formule" | "data">
): Onglet[] => {
  const tabs = fiche.data.onglets;
  if (!tabs?.length) return defaultTabs(fiche.formule);
  if (hasLegacyEssentialTemplate(fiche)) return defaultTabs("signature");
  return tabs;
};

/** Remplace l'ancien thème Essentielle tant que la fiche conserve ses onglets initiaux. */
export const signatureHeader = (
  fiche: Pick<FicheRecord, "formule" | "planCapabilities" | "data">,
) => {
  const header = fiche.data.entete;
  if (
    !hasLegacyEssentialTemplate(fiche) ||
    !header ||
    header.disposition !== "portrait" ||
    header.taille !== "m" ||
    header.theme !== "bleu" ||
    header.couverture
  )
    return header;
  return { ...header, theme: planOf(fiche).theme };
};

/**
 * Entête réellement affiché (disposition, taille, thème) : UNE seule règle pour la fiche, l'éditeur et la page
 * sticker. Hors Signature, l'entête enregistré est ignoré ; les valeurs interdites par la formule sont corrigées.
 */
export function resolveHeader(
  fiche: Pick<FicheRecord, "formule" | "planCapabilities" | "data">,
): EnteteComplete {
  const plan = planOf(fiche);
  const header: EnteteComplete = {
    disposition: "portrait",
    taille: "m",
    theme: plan.theme,
    ...(fiche.formule === "signature" ? signatureHeader(fiche) : {}),
  };
  if (!plan.headerLayouts.includes(header.disposition)) header.disposition = "portrait";
  if (!plan.themes.includes(header.theme)) header.theme = plan.theme;
  return header;
}

/**
 * À appliquer à la PREMIÈRE modification d'une fiche Signature encore à l'ancien modèle : enregistre ce qui est
 * affiché (onglets Signature, entête Signature). La fiche cesse alors d'être « ancienne » et ses choix suivants
 * sont respectés (par exemple le thème bleu, identique à l'ancien thème par défaut).
 */
export function migrateLegacySignature(
  fiche: FicheRecord,
): Pick<FicheData, "onglets" | "entete"> | null {
  if (!hasLegacyEssentialTemplate(fiche)) return null;
  const entete = signatureHeader(fiche);
  return { onglets: defaultTabs("signature"), ...(entete ? { entete } : {}) };
}

// Applique un modèle de métier sans jamais dépasser la formule
export function applyTemplate(
  formule: Formule,
  key: Secteur,
  plan: Plan = PLANS[formule]
): { onglets: Onglet[]; entete: Entete } {
  const t = TEMPLATES[key];
  let types = t.tabs.filter(x => plan.tabs.includes(x));
  if (!plan.canReorder)
    types = plan.tabs.filter(x => types.includes(x) || plan.tabs.length <= 3);
  if (!plan.canAdd)
    plan.tabs.forEach(x => {
      if (!types.includes(x) && x !== "texte") types.push(x);
    });
  return {
    onglets: types.map(type => ({
      id: nid(type),
      type,
      visible: true,
      ...(plan.canRename && t.titles[type] ? { titre: t.titles[type] } : {}),
    })),
    entete: plan.headerLayouts.includes(t.entete.disposition)
      ? t.entete
      : { disposition: "portrait", taille: "m" },
  };
}

// Onglets réellement affichés (respecte la formule, même si la donnée contient autre chose)
export function visibleTabs(fiche: FicheRecord): Onglet[] {
  const plan = planOf(fiche);
  let tabs = configuredTabs(fiche);
  tabs = tabs.filter(t => plan.tabs.includes(t.type));
  if (!plan.canReorder)
    tabs = [...tabs].sort(
      (a, b) => plan.tabs.indexOf(a.type) - plan.tabs.indexOf(b.type)
    );
  if (!plan.canHide) tabs = tabs.map(t => ({ ...t, visible: true }));
  return tabs.filter(t => t.visible !== false);
}
export const newId = nid;
