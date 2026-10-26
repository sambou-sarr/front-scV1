// Textes de la page Secteurs (/secteurs).
// Le catalogue ne contient pas de texte par secteur : chaque secteur assemble les
// produits du catalogue qui lui correspondent, avec leurs descriptions MOT POUR MOT.
// Les phrases d'accroche par secteur et la matrice sont des propositions : « À VALIDER ».
// V5 : catégorie « Création de contenu » (textes repris du catalogue data/prestations.ts) ; detail = page dédiée.
import { PRESTA } from './prestations';

export type CatKey = 'cartes' | 'qr' | 'panneaux' | 'branding' | 'contenu';
export interface Support { cat: CatKey; title: string; text: string }
/** Visuel de la composition : x, y, w en % de la scène ; r = rotation en degrés. */
export interface SceneImg { src: string; x: number; y: number; w: number; r?: number }
/** Page de démonstration affichée dans le téléphone. */
export interface SectorPage { brand: string; sub: string; color: string; actions: string[] }
export interface Sector {
  id: string; icon: string; name: string; short: string; hook: string;
  /** Page dédiée (V5/V6) et libellé du lien. */
  detail?: string; detailLabel?: string;
  supports: Support[]; imgs: SceneImg[]; page: SectorPage;
}
const P = (id: string): Support => ({ cat: 'contenu', title: PRESTA[id].label, text: PRESTA[id].reel });

// Catégories de supports (les 4 pages produits du site)
export const CATS: Record<CatKey, { label: string; short: string; icon: string; href: string }> = {
  cartes: { label: 'Cartes connectées', short: 'Cartes', icon: 'i-card', href: '/cartes-connectees' },
  qr: { label: 'QR Smart', short: 'QR Smart', icon: 'i-scan', href: '/qr-smart' },
  panneaux: { label: 'Panneaux & bâches', short: 'Panneaux', icon: 'i-board', href: '/panneaux-baches' },
  branding: { label: 'Branding intelligent', short: 'Branding', icon: 'i-shirt', href: '/branding-intelligent' },
  contenu: { label: 'Création de contenu', short: 'Contenu', icon: 'i-cam', href: '/creation-contenu' }, // V5
};

export const S_HERO = {
  label: 'Nos secteurs',
  line1: 'Une solution adaptée',
  red: 'à chaque métier.',
  lead: 'Des supports physiques qui ouvrent vos outils digitaux.',
  cta1: 'Trouver mon secteur', // À VALIDER
  cta2: 'Demander un devis',
  hint: 'Touchez un secteur', // À VALIDER
};

// imgs : composition visuelle (x, y, w en % de la scène ; r = rotation)
export const SECTORS: Sector[] = [
  {
    id: 'restaurants-cafes', icon: 's-resto', name: 'Restaurants & cafés', short: 'Restaurants',
    hook: 'Du trottoir à l’addition : le menu, la réservation et l’avis, en un scan.', // À VALIDER
    supports: [
      { cat: 'qr', title: 'Notre menu', text: 'Menu digital modifiable chaque jour.' },
      { cat: 'panneaux', title: 'Chevalet trottoir', text: 'Bois double face, affiche interchangeable. Le QR ouvre le menu digital du jour.' },
      { cat: 'qr', title: 'QR Smart', text: 'Boostez vos avis, faites jouer vos clients.' },
      { cat: 'branding', title: 'Polo', text: 'La tenue d’équipe du personnel en contact avec le client.' },
      P('photo'),
    ],
    imgs: [
      { src: '/images/chevalet.webp', x: 2, y: 4, w: 33 },
      { src: '/images/sticker-menu.webp', x: 34, y: 6, w: 25, r: -8 },
      { src: '/images/jeu-roue-sel-braise.webp', x: 30, y: 50, w: 30, r: 5 },
    ],
    page: { brand: 'LE SUNSET', sub: 'Restaurant, Saly', color: '#e8c77f', actions: ['Menu et catalogue', 'Formulaire et rendez-vous', 'Avis Google', 'Itinéraire GPS'] },
  },
  {
    id: 'hotels-residences', icon: 's-hotel', name: 'Hôtels & résidences', short: 'Hôtels',
    hook: 'Tout le séjour à portée de main, de l’accueil au départ.', // À VALIDER
    supports: [
      { cat: 'panneaux', title: 'Panneau d’accueil', text: 'Jusqu’à huit accès sur un panneau : Wi-Fi, menu, avis, WhatsApp, informations.' },
      { cat: 'qr', title: 'Accès Wi-Fi', text: 'La connexion sans donner le mot de passe.' },
      { cat: 'qr', title: 'Avis clients', text: 'Google, TripAdvisor, Booking, avant le départ.' },
      { cat: 'cartes', title: 'Carte Signature', text: 'Design sur mesure, catalogue complet avec bouton commander, tableau de bord et cartes rattachées : la carte devient un outil de prospection.' },
      P('visite-3d'),
    ],
    imgs: [
      { src: '/images/panneau-accueil.webp', x: 0, y: 14, w: 64 },
      { src: '/images/sticker-wifi.webp', x: 4, y: 62, w: 23, r: -8 },
      { src: '/images/sticker-google.webp', x: 34, y: 64, w: 22, r: 7 },
    ],
    page: { brand: 'HÔTEL · SALY', sub: 'Tout à portée de main', color: '#e8c77f', actions: ['Accès Wi-Fi', 'Menu et catalogue', 'Appel et WhatsApp', 'Avis Google'] },
  },
  {
    id: 'commerces-boutiques', icon: 's-shop', name: 'Commerces & boutiques', short: 'Commerces',
    hook: 'Vos clients vous suivent, vous écrivent et reviennent.', // À VALIDER
    supports: [
      { cat: 'qr', title: 'Réseaux sociaux', text: 'Instagram, Facebook, TikTok, YouTube.' },
      { cat: 'qr', title: 'Contactez-nous', text: 'Appel, WhatsApp, email, site.' },
      { cat: 'cartes', title: 'Carte Pro', text: 'Recto-verso personnalisé. Vos liens, vos photos, vos avis, un premier catalogue et le suivi de vos scans.' },
      { cat: 'branding', title: 'T-shirt', text: 'Logo poitrine, grand QR au dos lisible à distance. Staff, événement, vente.' },
      P('reseaux-sociaux'),
    ],
    imgs: [
      { src: '/images/sticker-reseaux.webp', x: 2, y: 4, w: 30, r: -6 },
      { src: '/images/main-carte-detouree.webp', x: 18, y: 30, w: 46, r: 3 },
      { src: '/images/tshirt.webp', x: 0, y: 64, w: 42 },
    ],
    page: { brand: 'L’ÉPICERIE NOMADE', sub: 'Des saveurs d’ici et d’ailleurs', color: '#e9b44c', actions: ['Menu et catalogue', 'Réseaux sociaux', 'Appel et WhatsApp', 'Itinéraire GPS'] },
  },
  {
    id: 'promoteurs', icon: 'i-crane', name: 'Promoteurs immobiliers', short: 'Promoteurs',
    hook: 'De l’acquisition du terrain à la remise des clés : boostez votre pré-commercialisation.', // V6
    detail: '/promoteur-immobilier#promoteurs', detailLabel: 'Voir la page Promoteur et immobilier',
    supports: [
      { cat: 'panneaux', title: PRESTA['bache-chantier'].label, text: PRESTA['bache-chantier'].reel },
      { cat: 'panneaux', title: PRESTA['fiche-programme'].label, text: PRESTA['fiche-programme'].reel },
      P('visite-3d'),
      { cat: 'cartes', title: PRESTA['cartes-nfc'].label, text: PRESTA['cartes-nfc'].reel },
      { cat: 'qr', title: PRESTA['stickers-lots'].label, text: PRESTA['stickers-lots'].reel },
    ],
    imgs: [
      { src: '/images/bache.webp', x: 0, y: 10, w: 64 },
      { src: '/images/immobilier/programme-jour-s.webp', x: 6, y: 52, w: 52, r: -3 },
    ],
    page: { brand: 'LES TERRASSES DU SAHEL', sub: 'Résidence · Saly', color: '#c9a25b', actions: ['Lots disponibles', 'Plans et visite 3D', 'Avancement du chantier', 'Demander une visite'] },
  },
  {
    id: 'immobilier', icon: 's-home', name: 'Immobilier', short: 'Immobilier',
    hook: 'Agences, résidences, maisons d’hôtes : chaque bien se visite en ligne avant la visite.', // V6
    detail: '/promoteur-immobilier#agences', detailLabel: 'Voir la page Promoteur et immobilier',
    supports: [
      { cat: 'panneaux', title: 'Panneau immobilier connecté', text: 'Photos, plans, prix, localisation, rendez-vous. Le lien est réattribué dès que le bien est vendu.' },
      { cat: 'cartes', title: PRESTA['fiche-agence'].label, text: PRESTA['fiche-agence'].reel },
      P('photo-interieur'),
      P('visite-3d'),
      { cat: 'qr', title: 'Rendez-vous', text: 'Réservation d’un créneau en un scan.' },
    ],
    imgs: [
      { src: '/images/panneau-immo.webp', x: 0, y: 8, w: 64 },
      { src: '/images/sticker-rdv.webp', x: 8, y: 60, w: 24, r: -6 },
    ],
    page: { brand: 'VILLA · SALY', sub: 'À vendre', color: '#EF1733', actions: ['Galerie photos', 'Vidéos', 'Itinéraire GPS', 'Formulaire et rendez-vous'] },
  },
  {
    id: 'tourisme-loisirs', icon: 's-palm', name: 'Tourisme & loisirs', short: 'Tourisme',
    hook: 'Visites, ateliers, boutique : vos visiteurs repartent avec vous dans la poche.', // À VALIDER (V6)
    supports: [
      { cat: 'branding', title: 'Polo', text: 'La tenue d’équipe du personnel en contact avec le client.' },
      { cat: 'panneaux', title: 'Bâche grand format', text: 'Sur mesure, œillets inclus, encres anti-UV. Chantier, devanture, événement.' },
      { cat: 'qr', title: 'Avis clients', text: 'Google, TripAdvisor, Booking, avant le départ.' },
      { cat: 'qr', title: 'Réseaux sociaux', text: 'Instagram, Facebook, TikTok, YouTube.' },
      P('video-courte'),
    ],
    imgs: [
      { src: '/images/polo-atelier-kanel.webp', x: 0, y: 6, w: 62 },
      { src: '/images/sticker-google.webp', x: 6, y: 60, w: 24, r: -7 },
      { src: '/images/sticker-reseaux.webp', x: 36, y: 60, w: 24, r: 6 },
    ],
    page: { brand: 'ATELIER KANËL', sub: 'Créations locales · Saly', color: '#b3262e', actions: ['Nos créations', 'Ateliers et visites', 'Commander', 'Nous trouver'] }, // V6 : exemple aligné sur le polo Atelier Kanël
  },
  {
    id: 'entreprises', icon: 's-case', name: 'Entreprises', short: 'Entreprises',
    hook: 'Chaque rencontre devient un contact enregistré.', // À VALIDER
    supports: [
      { cat: 'cartes', title: 'Carte Essentielle', text: 'La carte qui remplace le papier. Vos informations essentielles en un scan, modifiables à vie. Sans suivi, sans engagement.' },
      { cat: 'cartes', title: 'Carte Signature', text: 'Design sur mesure, catalogue complet avec bouton commander, tableau de bord et cartes rattachées : la carte devient un outil de prospection.' },
      { cat: 'cartes', title: 'Sticker téléphone', text: 'Rond de 30 mm au dos du smartphone, copie du QR de votre carte.' },
      { cat: 'branding', title: 'Casquette', text: 'Logo sur la face avant, QR sur le côté. Le support le plus visible en extérieur.' },
      P('video'),
    ],
    imgs: [
      { src: '/images/main-carte-detouree.webp', x: 4, y: 14, w: 62, r: -3 },
      { src: '/images/sticker-telephone.webp', x: 46, y: 60, w: 17, r: 10 },
    ],
    page: { brand: 'VOTRE ENTREPRISE', sub: 'Carte connectée', color: '#EF1733', actions: ['Enregistrer le contact', 'Appel et WhatsApp', 'Liens personnalisés', 'Statistiques de scans'] },
  },
  {
    id: 'institutions-administrations', icon: 's-inst', name: 'Institutions & administrations', short: 'Institutions',
    hook: 'Rendez-vous, contacts et informations, sans file d’attente.', // À VALIDER
    supports: [
      { cat: 'qr', title: 'Rendez-vous', text: 'Réservation d’un créneau en un scan.' },
      { cat: 'qr', title: 'Contactez-nous', text: 'Appel, WhatsApp, email, site.' },
      { cat: 'panneaux', title: 'Panneau d’accueil', text: 'Jusqu’à huit accès sur un panneau : Wi-Fi, menu, avis, WhatsApp, informations.' },
      { cat: 'cartes', title: 'Page connectée modifiable à vie', text: 'Nouveau numéro, nouveau prix, nouveaux horaires : tous les supports déjà distribués pointent vers la nouvelle version. Aucune réimpression.' },
    ],
    imgs: [
      { src: '/images/sticker-rdv.webp', x: 2, y: 6, w: 28, r: -6 },
      { src: '/images/sticker-contact.webp', x: 32, y: 14, w: 28, r: 6 },
      { src: '/images/panneau-accueil.webp', x: 0, y: 54, w: 58 },
    ],
    page: { brand: 'MAIRIE', sub: 'Accueil du public', color: '#e8c77f', actions: ['Formulaire et rendez-vous', 'Appel et WhatsApp', 'Itinéraire GPS', 'Liens personnalisés'] },
  },
];

export const S_EXPLORE = {
  label: 'Par secteur',
  seePage: 'Voir la page', // À VALIDER
  quote: 'Demander un devis pour ce secteur', // V5 : secteurs sans page dédiée
  supportsTitle: 'Vos supports',
  pageTitle: 'Ce que voit votre client',
};

export const S_MATRIX = {
  label: 'En un coup d’œil',
  title: 'Quel support',
  red: 'pour quel métier ?',
  hint: 'Touchez une colonne pour filtrer', // À VALIDER
};

// Catalogue, page « Nos trois pôles » (noms des métiers selon le cahier des charges)
export const S_CHAIN = {
  label: 'Nos trois pôles',
  title: 'Trois métiers connectés.',
  red: 'De la stratégie au support en action.',
  text: 'Chaque pôle peut travailler seul pour vous. Ensemble, ils forment une chaîne sans rupture : la communication décide du message, le développement construit la page, l’atelier fabrique le support qui y mène.',
  poles: [
    { n: 'I', title: 'Communication & marketing', sub: 'Ce que vous dites, et comment.' },
    { n: 'II', title: 'Programmation et développement de solutions', sub: 'Ce que vos clients trouvent.' },
    { n: 'III', title: 'Support intelligent', sub: 'Vos outils connectés.' },
  ],
  quote: 'Le client ne voit que sa devanture, sa carte, son écran. Nous faisons en sorte que tout lui dise la même chose.',
};

export const S_CTA = {
  label: 'Votre projet',
  title: 'Construisons ensemble',
  red: 'vos outils intelligents.',
  text: 'Une équipe d’experts, réactive et à votre écoute.',
  cta1: 'Demander un devis',
  cta2: 'Parler à un conseiller',
};
