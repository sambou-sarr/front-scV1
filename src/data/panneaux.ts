// Textes de la page Panneaux & bâches QR (/panneaux-baches).
// Sources : catalogue 2026 (page Panneaux & bâches QR, pôle II, « Travailler ensemble »),
// cahier des charges (CTA), et textes imprimés sur vos visuels produits.
// Les lignes marquées « À VALIDER » sont des propositions de rédaction.

export const P_HERO = {
  label: 'Panneaux & bâches QR · Édition 2026',
  line1: 'Votre message digital',
  red: 'en grand format.',
  lead: 'Un support qui ne mène nulle part est une dépense. Un support qui ouvre la bonne page devient un commercial.',
  cta1: 'Demander un devis',
  cta2: 'Voir les formats', // À VALIDER
  badges: [
    { icon: 's-home', label: 'Immobilier' },
    { icon: 's-shop', label: 'Commerces' },
    { icon: 'i-cal', label: 'Événements' },
    { icon: 's-hotel', label: 'Accueils' },
  ],
};

export const P_INDEX = [
  { id: 'immobilier', img: '/images/panneau-immo.webp', title: 'Panneau immobilier connecté' },
  { id: 'bache', img: '/images/bache.webp', title: 'Bâche grand format' },
  { id: 'accueil', img: '/images/panneau-accueil.webp', title: 'Panneau d’accueil' },
  { id: 'chevalet', img: '/images/chevalet.webp', title: 'Chevalet trottoir' },
];

export const P_IMMO = {
  label: 'Panneau immobilier connecté',
  title: 'Le panneau reste.',
  red: 'Le bien change.', // À VALIDER
  steps: [
    { n: '01', title: 'Visitez le bien en ligne.', text: 'Le passant scanne, sans application.' /* À VALIDER */ },
    { n: '02', title: 'Photos, plans, prix, localisation, rendez-vous.', text: 'Tout le bien, dans la poche de l’acheteur.' /* À VALIDER */ },
    { n: '03', title: 'Le lien est réattribué dès que le bien est vendu.', text: 'Le panneau passe au bien suivant. Aucune réimpression.' /* À VALIDER (fin : catalogue) */ },
  ],
  // Démonstration (PLACEHOLDER : biens fictifs)
  props: [
    { name: 'Villa', place: 'Saly', tag: 'À vendre', cover: 'immo' },
    { name: 'Terrain', place: 'Ngaparou', tag: 'Nouveau bien', cover: 'bache' },
  ],
  rows: [
    { icon: 's-home', label: 'Photos', value: '24 photos' },
    { icon: 'i-doc', label: 'Plans', value: 'Plan 2D' },
    { icon: 'i-chart', label: 'Prix', value: 'Sur demande' },
    { icon: 'i-pin', label: 'Localisation', value: 'Voir la carte' },
    { icon: 'i-cal', label: 'Rendez-vous', value: 'Réserver une visite' },
  ],
  sold: 'Vendu',
};

export const P_BACHE = {
  label: 'Bâche grand format',
  title: 'Sur mesure, œillets inclus,',
  red: 'encres anti-UV.',
  text: 'Chantier, devanture, événement.',
  specs: [
    { icon: 'i-ruler', title: 'Sur mesure' },
    { icon: 'i-target', title: 'Œillets inclus' },
    { icon: 'i-drop', title: 'Encres anti-UV' },
  ],
  uses: [
    { id: 'chantier', label: 'Chantier' },
    { id: 'devanture', label: 'Devanture' },
    { id: 'evenement', label: 'Événement' },
  ],
};

export const P_ACCUEIL = {
  label: 'Panneau d’accueil',
  title: 'Jusqu’à huit accès',
  red: 'sur un panneau.',
  text: 'Wi-Fi, menu, avis, WhatsApp, informations.',
  hint: 'Touchez un QR du panneau', // À VALIDER
  // Positions en % sur le visuel panneau-accueil.webp (centres des QR codes)
  spots: [
    { id: 'wifi', label: 'Wi-Fi', x: 48.7, y: 51.7 },
    { id: 'menu', label: 'Menu', x: 64.5, y: 52.9 },
    { id: 'decouvrir', label: 'Découvrir', x: 79.1, y: 54.2 },
    { id: 'google', label: 'Avis clients', x: 92.4, y: 54.9 },
    { id: 'appel', label: 'Nous appeler', x: 48.7, y: 79.2 },
    { id: 'whatsapp', label: 'WhatsApp', x: 64.5, y: 79.4 },
    { id: 'reseaux', label: 'Réseaux sociaux', x: 79.1, y: 79.7 },
    { id: 'infos', label: 'Informations', x: 92.4, y: 79.2 },
  ],
};

export const P_CHEVALET = {
  label: 'Chevalet trottoir',
  title: 'Bois double face,',
  red: 'affiche interchangeable.',
  text: 'Le QR ouvre le menu digital du jour.',
  quote: ['Le support reste.', 'Le contenu évolue.'],
  sub: 'Nouveau numéro, nouveau prix, nouveaux horaires : tous les supports déjà distribués pointent vers la nouvelle version. Aucune réimpression.',
  // Démonstration (PLACEHOLDER) — un plat du jour par jour de la semaine
  days: [
    ['Lun', 'Thiéboudienne'], ['Mar', 'Yassa poulet'], ['Mer', 'Mafé'], ['Jeu', 'Thiof grillé'],
    ['Ven', 'Soupou kandia'], ['Sam', 'Dibi d’agneau'], ['Dim', 'Ceebu yapp'],
  ],
};

export const P_STEPS = {
  label: 'Travailler ensemble',
  title: 'Cinq temps,',
  red: 'un livrable à chaque étape.',
  steps: [
    { n: '01', title: 'Cadrage', text: 'Entretien, audit de l’existant, écoute terrain' },
    { n: '02', title: 'Stratégie', text: 'Positionnement, priorités, calendrier' },
    { n: '03', title: 'Création', text: 'Maquettes et prototypes' },
    { n: '04', title: 'Déploiement', text: 'Fabrication, mise en ligne, pose, formation' },
    { n: '05', title: 'Pilotage', text: 'Mesure des résultats, ajustements, réassort' },
  ],
};

export const P_CTA = {
  label: 'Votre projet',
  title: 'Construisons ensemble',
  red: 'vos outils intelligents.',
  text: 'Une équipe d’experts, réactive et à votre écoute.',
  cta1: 'Demander un devis',
  cta2: 'Parler à un conseiller',
};
