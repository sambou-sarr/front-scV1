// ⚠️ TEXTES VALIDÉS — cahier des charges, section 29.
// Ne pas reformuler. Toute modification passe par Support Connecté.

export interface NavLink { label: string; href: string; icon?: string; children?: undefined }
export interface NavGroup { label: string; href?: undefined; children: (NavLink & { icon: string })[] }
export type NavItem = NavLink | NavGroup;

export const NAV: NavItem[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Nos solutions', children: [
    { label: 'Cartes connectées', href: '/cartes-connectees', icon: 'i-card' },
    { label: 'QR Smart', href: '/qr-smart', icon: 'i-scan' },
    { label: 'Panneaux & bâches', href: '/panneaux-baches', icon: 'i-pen' },
    { label: 'Branding intelligent', href: '/branding-intelligent', icon: 'i-check' },
    { label: 'Création de contenu', href: '/creation-contenu', icon: 'i-cam' }, // V5
    { label: 'Promoteur et immobilier', href: '/promoteur-immobilier', icon: 'i-crane' }, // V6 : lien principal de la page
  ] },
  { label: 'Secteurs', href: '/secteurs' },
  // Réalisations (/realisations) et L’équipe (/equipe) : prévues au cahier, à réintégrer quand les pages existeront.
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
];
export const NAV_FLAT: NavLink[] = NAV.flatMap((n) => n.children || [n]);

export const HERO = {
  kicker: ['Communication', 'Programmation', 'Support intelligent'],
  line1: 'Redéfinissons',
  line2Start: 'vôtre ', // « vôtre » avec accent : formulation officielle validée
  line2Red: 'relation client.',
  lead: 'Nous réunissons la communication, la programmation et le support intelligent pour transformer chaque point de contact en une expérience digitale simple qui booste votre visibilité.',
  cta1: 'Découvrir nos solutions',
  cta2: 'Voir la vidéo',
  pillars: [
    { icon: 'p-link', title: 'Connecter', sub: 'Les personnes' },
    { icon: 'p-people', title: 'Partager', sub: 'Vos contenus' },
    { icon: 'p-chart', title: 'Simplifier', sub: 'Votre quotidien' },
  ],
  imageAlt: 'Cartes connectées, casquette, polo, présentoir, badge et smartphone Support Connecté sur une terrasse à Saly',
};

export const APPROACH = {
  label: 'Notre approche',
  titleStart: 'Trois métiers ',
  titleRed: 'connectés.',
  sideStart: 'De la stratégie à l’acquisition',
  sideRed: 'jusqu’à la fidélisation',
  metiers: [
    {
      id: 'communication', num: 'I',
      title: ['Communication', '& marketing'],
      sub: 'Ce que vous dites, et comment.',
      items: ['Stratégie et positionnement', 'Logo, charte et identité', 'Édition, contenus, photo et vidéo'],
      image: '/images/oasis.webp', alt: 'Identité visuelle et support client réalisés par Support Connecté',
    },
    {
      id: 'developpement', num: 'II',
      title: ['Programmation', 'et développement', 'de solutions'],
      sub: 'Ce que vos clients trouvent.',
      items: ['Page connectée par métier', 'Back-office et statistiques', 'Sites vitrines et hébergement', 'Outils de fidélisation', 'Booster vos avis'],
      image: null, // affiche le mini téléphone (PhoneMockup)
    },
    {
      id: 'support', num: 'III',
      title: ['Support intelligent'],
      sub: 'Vos outils connectés.',
      items: ['Cartes, stickers, panneaux', 'Bâches, textile, vitrophanie', 'Encodage, contrôle et pose'],
      image: '/images/panneau-a-vendre.webp', alt: 'Panneau immobilier connecté À vendre',
    },
  ],
  more: 'En savoir plus',
};

export const SUPPORTS = {
  label: 'Nos supports',
  titleStart: 'Des supports physiques qui ouvrent ',
  titleRed: 'vos outils digitaux.',
  link: 'Voir tous les supports',
  cta: 'Découvrir',
  items: [
    { title: 'Cartes connectées', text: 'La solution tout-en-un pour vos contacts, informations et contenus.', image: '/images/main-carte-detouree.webp', alt: 'Carte connectée Support Connecté', href: '/cartes-connectees', badge: 'Produit phare' },
    { title: 'QR Smart', text: 'Stickers pour avis, Wi-Fi, réseaux sociaux, menus, contact…', image: '/images/qr-avis-google.webp', alt: 'Sticker QR avis Google', href: '/qr-smart' },
    { title: 'Panneaux & bâches QR', text: 'Immobilier, commerces, événements, accueils…', image: '/images/panneau-hotel.webp', alt: 'Panneau d’accueil hôtel avec QR codes', href: '/panneaux-baches' },
    { title: 'Branding intelligent', text: 'Textile et objets de marque qui créent du lien.', image: '/images/casquette.webp', alt: 'Casquette marquée avec QR code', href: '/branding-intelligent' },
  ],
};

export const PROCESS = {
  label: 'Comment ça marche ?',
  title: 'Du support physique à l’action.',
  steps: [
    { icon: 'i-cart', n: '01', title: 'Vous choisissez', sub: 'Un support adapté à votre activité.' },
    { icon: 'i-pen', n: '02', title: 'On le personnalise', sub: 'Logo, visuels, contenus et QR ou NFC.' },
    { icon: 'i-mob', n: '03', title: 'Vos clients scannent', sub: 'Accès immédiat à votre page connectée.' },
    { icon: 'i-check', n: '04', title: 'Ils passent à l’action', sub: 'Appeler, réserver, commander, laisser un avis…' },
  ],
  fan: [
    { label: 'Carte', image: '/images/main-carte-detouree.webp' },
    { label: 'Sticker QR', image: '/images/qr-avis-google.webp' },
    { label: 'Panneau', image: '/images/panneau-hotel.webp' },
    { label: 'Textile', image: '/images/casquette.webp' },
  ],
  chips: ['Votre logo', 'Vos visuels', 'Vos contenus', 'QR ou NFC'],
  // Formulation exacte demandée par le client (section 14)
  noteStart: 'Un simple scan toute votre ',
  noteUnderline: 'communication.',
};

// Démo d'interface — PLACEHOLDER à remplacer par l'interface officielle (section 14)
export const DEMO_PAGE = {
  name: 'LE SUNSET',
  place: 'RESTAURANT, SALY',
  actions: [
    { icon: 'i-menu', label: 'Voir le menu' },
    { icon: 'i-cal', label: 'Réserver une table' },
    { icon: 'i-phone', label: 'Nous appeler' },
    { icon: 'i-wa', label: 'WhatsApp' },
    { icon: 'i-cart', label: 'Commander' },
    { icon: 'i-star', label: 'Laisser un avis' },
  ],
  // [index de l'action, titre, sous-titre] joués en boucle à l'étape 4
  taps: [
    [1, 'Table réservée', 'Ce soir, 20 h 30, 2 personnes'],
    [3, 'WhatsApp ouvert', '« Bonjour, c’est ouvert ce midi ? »'],
    [4, 'Commande envoyée', 'Retrait dans 20 minutes'],
    [5, 'Merci pour votre avis', '★★★★★ sur Google'],
    [2, 'Appel en cours', 'Le Sunset, Saly'],
  ] satisfies [number, string, string][],
};

export const SECTORS = {
  label: 'Nos secteurs',
  title: 'Une solution adaptée à chaque métier.',
  link: 'Voir tous les secteurs',
  items: [
    { icon: 's-resto', label: ['Restaurants', '& cafés'], href: '/secteurs/restaurants-cafes' },
    { icon: 's-hotel', label: ['Hôtels', '& résidences'], href: '/secteurs/hotels-residences' },
    { icon: 's-shop', label: ['Commerces', '& boutiques'], href: '/secteurs/commerces-boutiques' },
    { icon: 'i-crane', label: ['Promoteurs'], href: '/promoteur-immobilier#promoteurs' },
    { icon: 's-home', label: ['Immobilier'], href: '/promoteur-immobilier#agences' },
    { icon: 's-palm', label: ['Tourisme', '& loisirs'], href: '/secteurs/tourisme-loisirs' },
    { icon: 's-case', label: ['Entreprises'], href: '/secteurs/entreprises' },
    { icon: 's-inst', label: ['Institutions', '& administrations'], href: '/secteurs/institutions-administrations' },
  ],
};

export const CTA = {
  label: 'Votre projet',
  title: ['Construisons ensemble', 'vos outils intelligents.'],
  sub: 'Une équipe d’experts, réactive et à votre écoute.',
  cta1: 'Demander un devis',
  cta2: 'Parler à un conseiller',
};

export const FOOTER = {
  copyright: '© 2026 Support Connecté. Tous droits réservés.',
  signature: ['CONNECTER', 'PARTAGER', 'SIMPLIFIER'],
  tagline: 'Des supports dans la vraie vie. Un impact réel.',
  socials: [
    { icon: 'so-ig', label: 'Instagram', href: '#' },
    { icon: 'so-fb', label: 'Facebook', href: '#' },
    { icon: 'so-in', label: 'LinkedIn', href: '#' },
    { icon: 'so-yt', label: 'YouTube', href: '#' },
    { icon: 'so-tt', label: 'TikTok', href: '#' },
  ],
};
