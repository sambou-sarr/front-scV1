// Textes de la page « Promoteur et immobilier » (/promoteur-immobilier ; ancienne adresse /secteurs/immobilier conservée) — V5, retouches V6.
// Blocs modifiables dans le back-office (Contenu du site) : immobilier.hero, immobilier.cta, immobilier.prix.
// « À VALIDER » = proposition de rédaction. Programme « Les Terrasses du Sahel » : exemple fictif de démonstration.
import type { Img, Profil, Stade } from '../types/v5';
import { IMG } from './contenu';

const I = (src: string, alt: string, w = 1536, h = 1024): Img => ({ src: `/images/immobilier/${src}`, alt, w, h });
const ONE = (src: string, alt: string, w: number, h: number): Img => ({ src, alt, w, h, single: true });
export const IMG_IM = {
  coucher: I('programme-coucher', 'Fiche d’un programme connecté sur téléphone, devant la résidence en construction et sa bâche, au coucher du soleil', 1312, 1199),
  jour: I('programme-jour', 'Bâche de chantier connectée sur la façade d’un programme en construction, fiche du programme sur téléphone', 1312, 1199),
  tournage: IMG.chantier,
  visite: IMG.visite3d,
  staging: IMG.homeStaging,
  villa: IMG.presentatrice,
  agence: ONE('/images/univers-teranga-immo.webp', 'Univers d’une agence immobilière : plaquettes, carte, présentoir QR et page connectée', 1600, 587),
  panneau: ONE('/images/panneau-immo.webp', 'Panneau À vendre connecté avec QR code : photos, détails, localisation, contact', 1300, 920),
  terrain: ONE('/images/univers-senegalais-immo.webp', 'Panneau terrain à vendre connecté avec QR code, présentoir et page connectée d’une agence', 1600, 592),
  hotel: ONE('/images/univers-baobab-suites.webp', 'Univers d’une résidence hôtelière : présentoirs QR, page connectée et supports de chambre', 1600, 589),
} satisfies Record<string, Img>;

export const IM_HERO = {
  label: 'Promoteur et immobilier',
  line1: 'Boostez votre',
  line2: '',
  red: 'pré-commercialisation.',
  lead: 'Bâches de chantier connectées, fiches programme, visites 3D, home staging et suivi de chaque contact. Le panneau reste, le contenu évolue : lots disponibles, prix et photos se mettent à jour sans rien réimprimer.',
  cta1: 'Demander un devis',
  cta2: 'Voir le parcours promoteur',
  badge: 'Fiche mise à jour il y a 2 min',
};

export const IM_PROFILES: { id: string; profil: Profil; icon: string; title: string; text: string; points: string[] }[] = [
  { id: 'promoteurs', profil: 'promoteur', icon: 'i-crane', title: 'Promoteurs', text: 'De l’acquisition du terrain à la remise des clés.', points: ['Bâche de chantier connectée', 'Fiche programme et visite 3D', 'Suivi des contacts par support', 'Création de contenu, IA ou traditionnel'] },
  { id: 'agences', profil: 'agence', icon: 's-home', title: 'Agences immobilières', text: 'Des biens qui se visitent avant la visite.', points: ['Panneaux À vendre connectés', 'Fiche agence jusqu’à 30 biens', 'Création ou refonte du site de l’agence', 'Création de contenu, IA ou traditionnel'] },
  { id: 'location', profil: 'proprietaire', icon: 'i-key', title: 'Résidences & maisons d’hôtes', text: 'Augmentez vos réservations.', points: ['Photos et visite 3D pour vos annonces', 'Vidéo avec présentatrice', 'Panneau d’accueil des hôtes', 'Création de contenu, IA ou traditionnel'] },
];

export interface Etape { id: Stade; n: string; label: string; icon: string; title: string; text: string; mode?: string; img: Img; services: string[]; point: string }
export const IM_JOURNEY = {
  label: 'Promoteurs',
  title: 'Un support pour chaque étape,',
  red: 'dès l’acquisition du terrain jusqu’à la remise des clés.',
  cta: 'Demander un devis pour cette étape',
  etapes: [
    {
      id: 'avant-lancement', n: '01', label: 'Avant le lancement', icon: 'i-cube',
      title: 'Le programme existe avant la première pierre.',
      text: 'Plans lisibles, vues 3D et visite virtuelle construite à partir des plans : vos premiers acquéreurs se projettent dès le lancement commercial. Une vidéo avec présentateur et une fiche programme connectée font le reste.',
      mode: 'En contenu traditionnel ou par le biais de l’IA.',
      img: IMG_IM.visite, services: ['plans-3d', 'visite-3d', 'presentateur', 'fiche-programme', 'kakemono', 'imprimes'],
      point: 'Le bureau de vente ouvre avec tout ce qu’il faut pour vendre sur plan.',
    },
    {
      id: 'chantier', n: '02', label: 'Chantier', icon: 'i-crane',
      title: 'La palissade devient votre meilleur commercial.',
      text: 'Une bâche grand format avec un QR qui ouvre la fiche du programme : chaque passant voit les lots, les prix et réserve une visite, de jour comme de nuit. Chaque mois, l’avancement en photos et en vidéo rassure les acquéreurs.',
      img: IMG_IM.jour, services: ['bache-chantier', 'panneau-programme', 'suivi-chantier', 'drone'],
      point: 'Le panneau reste, les lots disponibles se mettent à jour derrière le QR.',
    },
    {
      id: 'commercialisation', n: '03', label: 'Commercialisation', icon: 'i-people',
      title: 'Chaque visite repart avec le programme en poche.',
      text: 'Appartement témoin mis en scène, photos d’intérieur, stickers QR sur les portes des lots, cartes NFC pour les commerciaux : l’acheteur garde tout dans son téléphone, et vous savez d’où vient chaque contact.',
      img: IMG_IM.tournage, services: ['home-staging', 'photo-interieur', 'stickers-lots', 'cartes-nfc', 'reseaux-sociaux', 'campagnes'],
      point: 'Chaque commercial, chaque support a son propre lien : les contacts sont attribués automatiquement.',
    },
    {
      id: 'livraison', n: '04', label: 'Livraison & location', icon: 'i-key',
      title: 'Après la remise des clés, le lien continue de servir.',
      text: 'Panneau d’accueil de la résidence (Wi-Fi, règlement, services, avis), contenus pour la location saisonnière, panneaux À louer connectés pour la revente : la même équipe prend le relais.',
      img: IMG_IM.staging, services: ['panneau-accueil', 'annonces-location', 'panneau-immo', 'visite-3d'],
      point: 'Les propriétaires-investisseurs louent plus vite, la résidence garde une image soignée.',
    },
  ] satisfies Etape[],
};

// Démonstration interactive de la fiche programme (exemple fictif, prix repris du visuel de démonstration)
export const IM_LOTS = {
  label: 'Fiche programme connectée',
  title: 'Actualisation en direct',
  red: 'de vos réservations.',
  text: 'Touchez un lot pour simuler une réservation ou une vente : la fiche se met à jour aussitôt, et avec elle la bâche, les panneaux, les cartes et les stickers qui y mènent. Aucune réimpression.',
  points: ['Lots, surfaces et prix « à partir de »', 'Plans, visite 3D et vidéo de présentation', 'Demande de visite ou de brochure en un geste', 'Chaque scan compté par support : bâche, panneau, carte, sticker'],
  board: 'Votre espace',
  phone: 'Ce que voit l’acheteur',
  hint: 'Touchez un lot : disponible → réservé → vendu',
  programme: { nom: 'Les Terrasses du Sahel', lieu: 'Résidence · Saly', tag: 'Exemple' },
  types: [
    { id: 'T1', surface: '45 m²', prix: '45 000 000 F', count: 8 },
    { id: 'T2', surface: '60 à 80 m²', prix: '70 000 000 F', count: 10 },
    { id: 'T3', surface: '80 à 120 m²', prix: '95 000 000 F', count: 6 },
  ],
  // statut initial des 24 lots, dans l'ordre T1 ×8, T2 ×10, T3 ×6 : d = disponible, r = réservé, v = vendu
  initial: 'dvdrddvd' + 'ddvrdddvdd' + 'dvddrd',
  actions: ['Plans & visite virtuelle', 'Équipements & services', 'Localisation', 'Demander une visite'],
};

export const IM_FUNNEL = {
  label: 'Tunnel de vente · Promoteurs',
  title: 'Du scan à la signature,',
  red: 'on récupère tous les contacts.',
  text: 'Chaque support porte son propre lien. Vous savez quelle bâche, quel panneau ou quel commercial a amené chaque acheteur, et les relances partent toutes seules.',
  steps: [
    { icon: 'i-scan', title: 'Scan', text: 'Bâche, panneau, carte NFC, sticker de lot : le support est identifié.' },
    { icon: 'i-mob', title: 'Fiche', text: 'L’acheteur consulte lots, prix, plans et visite 3D.' },
    { icon: 'i-chat', title: 'Demande', text: 'Visite, brochure, rappel : la demande arrive au bon commercial, avec le lot qui l’intéresse.' },
    { icon: 'i-sync', title: 'Relance', text: 'Pas de réponse ? Relance à J+2, rappel de la visite la veille.' },
    { icon: 's-home', title: 'Visite', text: 'La fiche du lot est renvoyée après la visite, documents compris.' },
    { icon: 'i-check', title: 'Réservation', text: 'Le lot passe en « réservé » : tous les supports sont à jour.' },
  ],
  board: {
    title: 'Compte rendu du mois',
    tag: 'Données d’exemple',
    rows: [
      { label: 'Bâche façade', scans: 412, leads: 31 },
      { label: 'Panneau rond-point', scans: 236, leads: 14 },
      { label: 'Cartes des commerciaux', scans: 158, leads: 22 },
      { label: 'Stickers des lots (témoin)', scans: 97, leads: 9 },
      { label: 'Réseaux sociaux', scans: 305, leads: 18 },
    ],
    cols: ['Scans', 'Demandes'],
  },
};

export interface Offre { id: string; profil: Profil; label: string; title: string; red: string; text: string; imgs: Img[]; services: string[]; point: string; link?: { label: string; href: string }; cta: string }
export const IM_AGENCES: Offre = {
  id: 'agences', profil: 'agence', label: 'Agences immobilières', title: 'Vos biens', red: 'se visitent avant la visite.',
  text: 'Panneaux À vendre et À louer connectés, fiche agence jusqu’à 30 biens, création de contenu (IA ou traditionnel), visite 3D et home staging : vos annonces se démarquent, vos commerciaux gagnent du temps. Au-delà de 30 biens, nous créons ou refondons le site internet de l’agence avec l’ensemble de vos biens.',
  imgs: [IMG_IM.agence, IMG_IM.panneau], services: ['panneau-immo', 'fiche-agence', 'site-agence', 'photo-interieur', 'visite-3d', 'home-staging', 'cartes-nfc'],
  point: 'Bien vendu ? Le lien du panneau est réattribué au bien suivant : notre support reste utilisable pour un nouveau bien.',
  link: { label: 'Voir le panneau connecté en action', href: '/panneaux-baches#immobilier' },
  cta: 'Devis agence',
};
export const IM_LOCATION: Offre = {
  id: 'location', profil: 'proprietaire', label: 'Résidences, maisons d’hôtes, locations', title: 'Augmentez vos réservations', red: 'avec de meilleures images.',
  text: 'Photos grand angle, visite 3D, vidéo avec présentatrice, textes d’annonce, en contenu traditionnel ou avec l’IA. Rendus fidèles : nous améliorons uniquement la qualité de vos images, sans rien modifier de vos intérieurs. Sur place, le panneau d’accueil répond aux questions à votre place.',
  imgs: [IMG_IM.villa, IMG_IM.hotel], services: ['annonces-location', 'photo-interieur', 'visite-3d', 'presentateur', 'panneau-accueil', 'reseaux-sociaux'],
  point: 'Une gestion locative plus sereine : moins de questions répétées, des annonces qui donnent envie.',
  link: { label: 'Toute la création de contenu', href: '/creation-contenu' },
  cta: 'Devis location',
};

export const IM_PACKS = {
  label: 'Formules promoteurs',
  title: 'Trois formules pour démarrer,',
  red: 'ajustées à votre programme.',
  note: 'Prix sur devis, selon le nombre de lots, les surfaces de bâche et la durée du chantier.',
  packs: [
    { id: 'pack-lancement', name: 'Lancement', stade: 'avant-lancement' as Stade, pitch: 'Vendre sur plan dès l’ouverture du bureau de vente.', services: ['plans-3d', 'visite-3d', 'video', 'presentateur', 'fiche-programme', 'kakemono'] },
    { id: 'pack-chantier', name: 'Chantier connecté', stade: 'chantier' as Stade, pitch: 'La façade travaille pour vous pendant toute la construction.', services: ['bache-chantier', 'panneau-programme', 'fiche-programme', 'suivi-chantier', 'drone'], featured: true },
    { id: 'pack-commercialisation', name: 'Commercialisation', stade: 'commercialisation' as Stade, pitch: 'Chaque visite et chaque contact suivis jusqu’à la réservation.', services: ['home-staging', 'photo-interieur', 'stickers-lots', 'cartes-nfc', 'reseaux-sociaux', 'campagnes'] },
  ],
  cta: 'Demander cette formule',
  quote: 'Sur devis',
  featured: 'La plus demandée', // À VALIDER
};

export const IM_STEPS = {
  label: 'Travailler ensemble',
  title: 'Cinq temps,',
  red: 'un livrable à chaque étape.',
  steps: [
    { n: '01', title: 'Étude du besoin', text: 'Plaquette, plan masse, nombre de lots, calendrier' },
    { n: '02', title: 'Proposition', text: 'Devis chiffré et détaillé, sans engagement' },
    { n: '03', title: 'Production', text: 'Tournage, 3D, impression et fiches connectées' },
    { n: '04', title: 'Pose & mise en ligne', text: 'Bâche posée, QR testés, fiche en ligne' },
    { n: '05', title: 'Suivi mensuel', text: 'Avancement, lots à jour, compte rendu des contacts' },
  ],
};

export const IM_FAQ = {
  label: 'Questions fréquentes', title: 'Promoteur et immobilier,', red: 'vos questions.',
  items: [
    { q: 'Que se passe-t-il quand un lot est vendu ?', a: 'Vous le passez en « vendu » depuis votre espace, ou par message à votre conseiller : la fiche se met à jour, et tous les supports qui y mènent (bâche, panneaux, cartes, stickers) affichent la bonne information. Notre support reste utilisable pour un nouveau bien.' },
    { q: 'Peut-on montrer un appartement qui n’est pas encore construit ?', a: 'Oui : vues 3D et visite virtuelle construites à partir des plans, avec la mention « visuel non contractuel ». Dès que le témoin existe, nous le photographions et le filmons.' },
    { q: 'Comment savoir d’où viennent nos contacts ?', a: 'Chaque support porte son propre lien : bâche, panneau, carte de commercial, sticker de lot, réseaux sociaux. Le compte rendu mensuel indique combien de scans et de demandes chaque support a générés.' },
    { q: 'La bâche tient-elle toute la durée du chantier ?', a: 'Elle est conçue pour l’extérieur : encres anti-UV, œillets renforcés, finitions adaptées au vent. Format, matière et fixation sont précisés dans le devis.' },
    { q: 'Les prises de vue par drone sont-elles possibles partout ?', a: 'Uniquement là où les vols sont autorisés, avec les autorisations nécessaires. Nous vérifions avant de programmer le tournage.' },
    { q: 'Travaillez-vous avec les agences qui commercialisent nos lots ?', a: 'Oui : chaque agence partenaire peut recevoir ses propres cartes et liens, pour que chaque contact soit attribué à la bonne équipe.' },
  ],
};

export const IM_CTA = {
  label: 'Votre programme',
  title: 'Parlons de votre programme,',
  red: 'avant la prochaine visite.', // À VALIDER
  text: 'Plaquette, plan masse ou simple adresse du terrain : envoyez ce que vous avez, nous revenons avec un devis chiffré et détaillé, sans engagement.',
  cta1: 'Demander un devis',
  cta2: 'Parler à un conseiller',
  bg: '/images/immobilier/programme-jour-l.webp',
};

export const IM_META = {
  title: 'Promoteur et immobilier — Support Connecté',
  description: 'Bâches de chantier connectées, fiches programme, visites 3D, home staging, cartes NFC des commerciaux et suivi des contacts pour les promoteurs, les agences et les résidences au Sénégal.',
};
