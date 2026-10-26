// ⚠️ TEXTES VALIDÉS — page Cartes connectées.
// Sources : catalogue 2026 et maquette de la page Cartes. Ne pas reformuler sans validation.

export const C_HERO = {
  label: 'Cartes connectées · Édition 2026',
  line1: 'Votre carte n’est',
  line2: 'plus une carte,',
  red: 'c’est votre univers.',
  lead: 'Un geste suffit : votre client scanne ou approche son téléphone. Votre univers s’ouvre immédiatement.',
  cta1: 'Choisir ma carte',
  cta2: 'Voir comment ça marche',
  badges: [
    { icon: 'nfc', label: 'NFC + QR' },
    { icon: 'i-mob', label: 'Sans application' },
    { icon: 'i-pen', label: 'Contenu modifiable' },
  ],
  hint: 'Touchez la carte pour la retourner',
};

// Contenu des faces de la carte 3D (reprend les visuels produits)
export const CARD_FACES = {
  pro: {
    tagline: ['Votre activité.', 'À portée de main.'],
    backTitle: ['Scannez.', 'Connectez.', 'Développez.'],
    backSub: ['Plus qu’une carte.', 'Une relation qui dure.'],
    links: [['i-user', 'Contact'], ['i-phone', 'Appeler'], ['i-mail', 'Email'], ['i-globe', 'Site web'], ['i-pin', 'Adresse'], ['i-share', 'Réseaux sociaux'], ['i-doc', 'Nos services']],
    script: ['Des opportunités', 'sans limite.'],
  },
  signature: {
    tagline: ['Signature', 'Votre image sans limite.'],
    backTitle: ['Plus', 'qu’un contact.', 'Une expérience.'],
    backSub: [],
    links: [['i-user', 'Mon profil'], ['i-phone', 'Me contacter'], ['i-mail', 'Mon email'], ['i-globe', 'Mon site web'], ['i-pin', 'Ma localisation'], ['i-share', 'Mes réseaux sociaux'], ['i-doc', 'Découvrir mes services']],
    script: ['Redéfinissons', 'votre relation client.'],
  },
};

export const JOURNEY = {
  label: 'Le parcours',
  title: 'Du geste au contact,',
  red: 'en quelques secondes.',
  intro: 'Une carte physique, un scan, une page à votre nom et des actions immédiates. Un parcours simple et fluide pour connecter votre entreprise à vos clients.',
  steps: [
    { n: '01', title: 'Vous présentez', text: 'Votre carte physique, en main ou sur un support.' },
    { n: '02', title: 'Votre client scanne', text: 'NFC ou QR, sans application.' },
    { n: '03', title: 'La page s’ouvre', text: 'Votre page connectée, adaptée à votre activité.' },
    { n: '04', title: 'Il agit', text: 'Appeler, réserver, commander, donner un avis…' },
  ],
  tiles: [
    { icon: 'i-phone', label: 'Appeler' },
    { icon: 'i-wa', label: 'WhatsApp' },
    { icon: 'i-cal', label: 'Réserver' },
    { icon: 'i-pin', label: 'Itinéraire' },
    { icon: 'i-star', label: 'Avis Google' },
    { icon: 'i-cart', label: 'Catalogue' },
  ],
};

export const ANATOMY = {
  label: 'Ce que votre client voit',
  title: 'Une page à votre nom.',
  red: 'Vos informations, vos liens et vos actions, dans l’ordre où votre client en a besoin.',
  text: 'Une page claire, rapide et optimisée pour mobile, qui regroupe tout ce que votre client cherche à faire : vous contacter, découvrir, réserver, commander, laisser un avis…',
  callouts: [
    { title: 'Votre univers', text: 'Photo, logo, couleurs à votre image.', at: 14 },
    { title: 'Vos informations', text: 'Contact, horaires, adresse, description.', at: 36 },
    { title: 'Vos contenus', text: 'Menu, catalogue, photos, vidéos.', at: 56 },
    { title: 'Vos actions', text: 'Appel, réservation, commande, avis, etc.', at: 76 },
  ],
};

export const USES = {
  label: 'Une carte. Plusieurs usages.',
  title: 'Un même support physique.',
  red: 'Un outil digital qui évolue avec votre activité.',
  side: 'Restaurants, hôtels, commerces, entreprises… la carte connectée s’adapte à tous les métiers et à tous les besoins.',
  items: [
    { key: 'call', icon: 'i-phone', title: 'Appel immédiat', text: 'Un simple clic pour vous contacter.' },
    { key: 'wa', icon: 'i-wa', title: 'WhatsApp', text: 'Vos clients vous écrivent directement.' },
    { key: 'review', icon: 'i-star', title: 'Avis Google', text: 'Ils laissent facilement un avis.' },
    { key: 'shop', icon: 'i-cart', title: 'Catalogue', text: 'Vos produits et services en ligne.' },
    { key: 'book', icon: 'i-cal', title: 'Réservation', text: 'Ils réservent en quelques secondes.' },
  ],
};

export const TIERS = {
  label: 'Trois niveaux',
  title: 'Une carte pour',
  red: 'chaque niveau.',
  intro: 'Les trois niveaux sont conçus pour accompagner progressivement votre activité : du simple contact à un véritable outil de prospection.',
  list: [
    {
      id: 'essentielle', name: 'Essentielle', title: 'Être trouvé. Être contacté.',
      text: 'La carte qui remplace le papier. Vos informations essentielles en un scan, modifiables à vie. Sans suivi, sans engagement.',
      image: '/images/main-carte-essentielle.webp', highlights: ['Puce NFC et QR code intégrés', 'Appel, WhatsApp, coordonnées', 'Page modifiable à vie'],
      cta: 'Découvrir l’Essentielle',
    },
    {
      id: 'pro', name: 'Pro', title: 'Transformez chaque contact en opportunité.',
      text: 'Recto-verso personnalisé. Vos liens, vos photos, vos avis, un premier catalogue et le suivi de vos scans.',
      image: '/images/main-carte-pro.webp', highlights: ['10 liens, 4 photos, 1 vidéo', 'Avis Google', 'Catalogue : 2 sections, 12 articles', 'Statistiques de scans'],
      cta: 'Découvrir la Pro',
    },
    {
      id: 'signature', name: 'Signature', title: 'Votre image sans limite.',
      text: 'Design sur mesure, catalogue complet avec bouton commander, tableau de bord et cartes rattachées : la carte devient un outil de prospection.',
      image: '/images/main-carte-signature.webp', highlights: ['Catalogue 6 sections avec bouton commander', 'Tableau de bord mensuel', 'Cartes rattachées à votre compte', 'Design sur mesure, finitions premium'],
      cta: 'Découvrir la Signature',
    },
  ],
  tableTitle: 'Ce que contient chaque carte.',
  // true = inclus, false = non inclus, texte = valeur
  table: [
    ['Puce NFC et QR code intégrés', true, true, true],
    ['Coordonnées, appel et WhatsApp', true, true, true],
    ['Enregistrement du contact en un geste', true, true, true],
    ['Page connectée modifiable à vie', true, true, true],
    ['Liens personnalisés', false, '10 max', '10 max'],
    ['Photos', false, '4', '8'],
    ['Vidéos', false, '1', '3'],
    ['Avis Google', false, true, true],
    ['Catalogue en ligne', false, '2 sections · 12 articles', '6 sections · 12 articles'],
    ['Fiche article avec prix et bouton commander', false, false, true],
    ['Statistiques de scans', false, true, true],
    // Fiches V2 — À VALIDER
    ['Modèle de page adapté à votre métier', true, true, true],
    ['Blocs réorganisables en les faisant glisser', false, true, true],
    ['Blocs à ajouter ou retirer, entête modulable', false, false, true],
    ['Menu interactif avec une vidéo courte par plat', false, false, true],
    ['Biens immobiliers : photos et caractéristiques', false, false, true],
    ['Tableau de bord mensuel', false, false, true],
    ['Cartes rattachées à votre compte', false, false, true],
    ['Design sur mesure, finitions premium', false, false, true],
    ['Accompagnement personnalisé', false, false, true],
  ] satisfies [string, boolean | string, boolean | string, boolean | string][],
};

export const STICKER = {
  label: 'En option sur les trois cartes',
  title: 'Le sticker téléphone',
  text: 'Rond de 30 mm collé au dos du smartphone. Il reprend le QR code de votre carte : vous partagez votre fiche même quand la carte est restée au bureau.',
  cta: 'Ajouter l’option',
};

export type LiveData = { phone: string; hours: string; catalog: string[] };
export type LiveChange = { [K in keyof LiveData]: { key: string; label: string; field: K; from: LiveData[K]; to: LiveData[K] } }[keyof LiveData];

export const LIVE = {
  label: 'Pourquoi une carte connectée ?',
  title: 'Votre contenu évolue,',
  red: 'pas votre support.',
  text: 'Nouveau numéro, nouveau prix, nouveaux horaires : tous les supports déjà distribués pointent vers la nouvelle version. Aucune réimpression.',
  caption: 'Une modification. Tous vos supports restent à jour.',
  distributed: 'Cartes déjà distribuées',
  // États successifs de la page de démonstration
  changes: [
    { key: 'num', label: 'Nouveau numéro', field: 'phone', from: '+221 77 000 00 00', to: '+221 78 123 45 67' },
    { key: 'hours', label: 'Nouveaux horaires', field: 'hours', from: 'Lun – Sam · 12 h – 22 h', to: 'Lun – Dim · 12 h – 23 h' },
    { key: 'cat', label: 'Nouveau catalogue', field: 'catalog', from: ['Thiéboudienne', 'Yassa poulet', 'Jus de bissap'], to: ['Thiof grillé', 'Mafé', 'Ceviche de la baie'] },
  ] satisfies LiveChange[],
};

export const RESULTS = {
  label: 'Et si votre carte travaillait après la rencontre ?',
  title: ['Plus qu’un contact,', 'des résultats concrets.'],
  steps: [
    { icon: 'i-scan', title: 'Scan', text: 'Votre client découvre votre univers.' },
    { icon: 'i-target', title: 'Action', text: 'Il appelle, réserve, commande ou donne un avis.' },
    { icon: 'i-people', title: 'Contact', text: 'Vous êtes facilement accessible.' },
    { icon: 'i-chart', title: 'Fidélisation', text: 'Vos supports continuent de travailler pour vous.' },
  ],
};

export const C_CTA = {
  label: 'Votre projet',
  title: 'Votre prochain contact',
  red: 'commence ici.',
  text: 'Choisissez le niveau adapté à votre activité : nous préparons votre carte, votre page connectée et son fonctionnement.',
  cta1: 'Choisir ma carte',
  cta2: 'Parler à un conseiller',
};
