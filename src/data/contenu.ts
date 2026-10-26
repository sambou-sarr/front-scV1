// Textes de la page Création de contenu & communication intégrée (/creation-contenu) — V5.
// Blocs modifiables dans le back-office (Contenu du site) : contenu.hero, contenu.cta, contenu.prix.
// « À VALIDER » = proposition de rédaction. Les visuels sont des univers de démonstration conçus par Support Connecté.
import type { Img, Pole } from '../types/v5';

const I = (src: string, alt: string, w = 1536, h = 1024): Img => ({ src: `/images/contenu/${src}`, alt, w, h });
export const IMG = {
  presentatrice: I('presentatrice-villa', 'Tournage d’une présentatrice au bord de la piscine d’une villa, à Saly'),
  chef: I('tournage-chef', 'Tournage vidéo d’un chef qui dresse une assiette en terrasse'),
  shooting: I('shooting-photo', 'Shooting photo des plats et des supports d’un restaurant'),
  reseaux: I('reseaux-sociaux', 'Planification des contenus pour les réseaux sociaux : photos, vidéos, calendrier'),
  visite3d: I('visite-3d', 'Prise de vue 360° dans un programme en construction et visite virtuelle sur ordinateur et téléphone'),
  homeStaging: I('home-staging', 'Home staging : la même pièce vide, puis meublée'),
  chantier: { src: '/images/immobilier/tournage-chantier', alt: 'Tournage d’un présentateur devant un programme immobilier en construction', w: 1536, h: 1024 },
  showroom: I('impression-showroom', 'Gamme de supports imprimés : kakémonos, bâches, drapeaux, stickers, textiles, véhicule'),
  gamme: I('impression-gamme', 'Affiche : tous les supports de communication créés en interne', 1024, 1536),
  planche: I('impression-planche', 'Planche des supports : bâche, kakémono, drapeau, enseigne, panneaux, stickers, textiles'),
  terrasse: I('terrasse-supports', 'Terrasse de restaurant équipée de supports Support Connecté'),
  kakemono: I('terrasse-kakemono', 'Kakémono, drapeau et stickers QR sur une terrasse'),
} satisfies Record<string, Img>;

export const CC_HERO = {
  label: 'Création de contenu · Communication intégrée',
  line1: 'Du tournage',
  line2: 'à la bâche,',
  red: 'une seule équipe.',
  lead: 'Photo, vidéo, présentateurs et voix off, visites 3D, home staging, réseaux sociaux et impression personnalisée : nous concevons, produisons et diffusons vos contenus. En tournage réel ou avec l’appui de l’IA, selon votre projet.',
  cta1: 'Demander un devis',
  cta2: 'Voir les exemples',
  chips: ['Voix off · français, wolof, anglais', 'Visite 3D 360°', 'Home staging réel ou virtuel'],
};

// Sommaire de la page (vignettes cliquables). Sans image : vignette graphique (pôle IA).
export const CC_INDEX: { id: string; label: string; img?: Img }[] = [
  { id: 'photo-video', label: 'Photo & vidéo', img: IMG.chef },
  { id: 'presentateurs', label: 'Présentateurs & voix off', img: IMG.presentatrice },
  { id: 'visites-3d', label: 'Visites 3D & home staging', img: IMG.homeStaging },
  { id: 'reseaux', label: 'Réseaux sociaux', img: IMG.reseaux },
  { id: 'impression', label: 'Impression personnalisée', img: IMG.showroom },
  { id: 'ia', label: 'IA & automatisation' },
];

export const CC_MODE = {
  label: 'Deux façons de produire',
  title: 'En tournage réel',
  red: 'ou avec l’IA.',
  options: [
    { id: 'reel' as const, title: 'Tournage réel', text: 'Une équipe sur place, de vraies personnes, vos lieux tels qu’ils sont. Pour inspirer confiance : visages, savoir-faire, ambiance.', img: IMG.chef },
    { id: 'ia' as const, title: 'Avec l’IA', text: 'Présentateurs virtuels, voix de synthèse, home staging et visuels générés à partir de vos images. Pour aller vite, décliner et mettre à jour.', img: IMG.homeStaging },
  ],
  hint: 'Les descriptions de la page s’adaptent à votre choix.',
  both: 'Les deux se combinent : un tournage pour l’essentiel, l’IA pour les versions et les mises à jour.', // À VALIDER
  ethics: 'Chaque visuel retouché ou généré qui montre un bien ou un produit porte la mention « visuel non contractuel ». Jamais l’image ou la voix d’une personne sans son accord écrit.',
};

export interface PoleBlock {
  id: string; pole: Pole; label: string; title: string; red: string; text: string;
  services: string[]; imgs: Img[]; cta: string; note?: string; link?: { label: string; href: string };
}

export const CC_POLES: PoleBlock[] = [
  {
    id: 'photo-video', pole: 'contenu', label: 'Photo & vidéo', title: 'Des images qui donnent', red: 'envie de venir.',
    text: 'Plats, chambres, produits, équipes, chantiers : nous tournons sur place et livrons des formats prêts pour vos réseaux, votre site, vos annonces et vos écrans.',
    services: ['photo', 'video', 'video-courte', 'motion'], imgs: [IMG.chef, IMG.shooting], cta: 'Devis photo & vidéo',
  },
  {
    id: 'presentateurs', pole: 'contenu', label: 'Présentateurs & voix off', title: 'Un visage et une voix', red: 'pour vous présenter.',
    text: 'Un présentateur sur votre lieu, une voix off en français, en wolof ou en anglais, ou un avatar quand il faut aller vite. Le texte est écrit avec vous.',
    services: ['presentateur', 'voix-off', 'script'], imgs: [IMG.presentatrice, IMG.chantier], cta: 'Devis présentateur & voix off',
  },
  {
    id: 'visites-3d', pole: 'contenu', label: 'Visites 3D & home staging', title: 'Le bien se visite', red: 'avant la visite.',
    text: 'Promoteurs, agences, maisons d’hôtes, hôtels : une visite 360°, des plans lisibles et des pièces mises en scène pour vendre ou louer plus sereinement.',
    services: ['visite-3d', 'plans-3d', 'home-staging', 'photo-interieur'], imgs: [IMG.homeStaging, IMG.visite3d], cta: 'Devis visite 3D & home staging',
    note: 'Maisons d’hôtes, résidences, locations saisonnières : des photos et une visite 3D soignées pour vos annonces et vos plateformes de réservation.',
    link: { label: 'Promoteur et immobilier : tout le parcours', href: '/promoteur-immobilier' },
  },
  {
    id: 'reseaux', pole: 'digital', label: 'Réseaux sociaux & digital', title: 'Publier régulièrement,', red: 'sans y passer vos soirées.',
    text: 'Calendrier éditorial, visuels à votre charte, publications, réponses aux messages et rapport mensuel. Vous validez, nous publions.',
    services: ['reseaux-sociaux', 'visuels', 'fiche-google', 'campagnes'], imgs: [IMG.reseaux], cta: 'Devis réseaux sociaux',
  },
];

export const CC_PRINT = {
  id: 'impression', label: 'Impression personnalisée', title: 'Du kakémono à la bâche,', red: 'tout est sur mesure.',
  text: 'Nous créons le visuel, imprimons, personnalisons et posons. Chaque support peut porter un QR ou une puce NFC qui ouvre votre page connectée.',
  quote: 'Tout est personnalisé et sur devis.',
  services: ['kakemono', 'bache', 'stickers', 'plaques-pvc', 'drapeaux', 'enseigne', 'panneaux', 'vitrophanie', 'vehicule', 'imprimes', 'textile', 'plv'],
  steps: [
    { label: 'Conseil', icon: 'i-chat' }, { label: 'Création graphique', icon: 'i-pen' }, { label: 'Impression', icon: 'i-print' },
    { label: 'Personnalisation', icon: 'i-scissors' }, { label: 'Pose & installation', icon: 'i-tool' }, { label: 'Livraison', icon: 'i-truck' },
  ],
  img: IMG.showroom, side: IMG.gamme,
  links: [{ label: 'Panneaux & bâches connectés', href: '/panneaux-baches' }, { label: 'Stickers QR Smart', href: '/qr-smart' }],
  cta: 'Devis impression',
};

export const CC_IA = {
  id: 'ia', label: 'IA & automatisation', title: 'L’IA au travail,', red: 'vous aux commandes.',
  text: 'Nous repérons les tâches qui vous prennent du temps, nous les automatisons dans vos outils, puis nous formons votre équipe. Rien n’est publié ni envoyé sans votre validation.',
  services: ['ia-reponses', 'ia-relances', 'ia-publication', 'ia-demandes', 'ia-traduction', 'ia-integration'],
  flow: ['Une demande arrive', 'L’IA prépare la réponse', 'Vous validez', 'C’est envoyé et suivi'],
  // Démonstration animée (exemple fictif d’une maison d’hôtes)
  demo: {
    from: 'Client · WhatsApp',
    ask: 'Bonjour, vous avez une chambre pour deux ce week-end ?',
    draft: 'Bonjour ! Oui, la suite Baobab est libre samedi et dimanche, petit-déjeuner compris. Je vous envoie les photos et le tarif ?',
    who: 'Validé par Awa, réception',
    sent: 'Envoyé · relance programmée demain à 10 h',
    tag: 'Classée : réservation',
  },
  proof: 'La même mécanique fait tourner notre propre suivi client : demandes classées, relances programmées, tâches créées automatiquement.',
  steps: [
    { n: '01', title: 'Audit', text: 'Une heure avec vous pour lister les tâches répétitives.' },
    { n: '02', title: 'Mise en place', text: 'Les automatisations sont installées dans vos outils.' },
    { n: '03', title: 'Formation', text: 'Votre équipe sait les utiliser et les ajuster.' },
    { n: '04', title: 'Suivi', text: 'Nous mesurons le temps gagné et ajustons.' },
  ],
  cta: 'Parler de mon projet IA',
};

export const CC_SHOW = {
  id: 'exemples', label: 'Exemples de rendus', title: 'Ce que nous produisons,', red: 'en images.',
  note: 'Univers de démonstration conçus par Support Connecté.',
  items: [
    { img: IMG.visite3d, title: 'Visite virtuelle 3D', tag: 'Immobilier' },
    { img: IMG.homeStaging, title: 'Home staging avant / après', tag: 'Immobilier' },
    { img: IMG.chantier, title: 'Présentateur sur chantier', tag: 'Promoteur' },
    { img: IMG.presentatrice, title: 'Vidéo de présentation', tag: 'Hôtellerie' },
    { img: IMG.chef, title: 'Tournage culinaire', tag: 'Restaurant' },
    { img: IMG.shooting, title: 'Shooting produits', tag: 'Restaurant' },
    { img: IMG.reseaux, title: 'Calendrier réseaux sociaux', tag: 'Digital' },
    { img: IMG.terrasse, title: 'Supports en situation', tag: 'Impression' },
    { img: IMG.planche, title: 'Planche de supports', tag: 'Impression' },
  ],
};

const E = (src: string, name: string, role: string): { img: Img; name: string; role: string } => ({ img: { src: `/images/equipe/${src}`, alt: `Carte NFC de ${name}, ${role}`, w: 1200, h: 752 }, name, role });
export const CC_TEAM = {
  label: 'L’équipe', title: 'Nos propres cartes,', red: 'conçues ici.',
  text: 'Portrait retravaillé, mise en page, puce NFC : la même équipe conçoit vos contenus et vos supports.',
  cards: [
    E('suleyman-tiget', 'Süleyman Tiget', 'Directeur marketing & pilotage projet'),
    E('dougoutigui-coulibaly', 'Dougoutigui Coulibaly', 'Directeur recherche & développement'),
    E('mouhamed-khouma', 'Mouhamed Bassirou Khouma', 'Développeur programmeur'),
    E('sambou-sarr', 'Sambou Sarr', 'Développeur back-end'),
  ],
  cta: { label: 'Créer les cartes de votre équipe', href: '/cartes-connectees' },
};

export const CC_STEPS = {
  label: 'Travailler ensemble',
  title: 'Cinq temps,',
  red: 'un livrable à chaque étape.',
  steps: [
    { n: '01', title: 'Brief', text: 'Objectifs, cibles, lieux, supports et délais' },
    { n: '02', title: 'Devis', text: 'Chiffré et détaillé, sans engagement' },
    { n: '03', title: 'Production', text: 'Tournage, création graphique ou génération IA' },
    { n: '04', title: 'Validation', text: 'Vous validez avant toute diffusion ou impression' },
    { n: '05', title: 'Diffusion', text: 'Publication, impression, pose et suivi des résultats' },
  ],
};

export const CC_FAQ = {
  label: 'Questions fréquentes', title: 'Avant de', red: 'vous lancer.',
  items: [
    { q: 'Faut-il choisir entre tournage réel et IA ?', a: 'Non. Beaucoup de projets combinent les deux : un tournage pour l’essentiel, l’IA pour les déclinaisons et les mises à jour. Nous vous conseillons selon l’usage et le budget.' },
    { q: 'Pouvez-vous tourner en wolof ?', a: 'Oui, avec des présentateurs et des voix off réels. Les voix de synthèse sont proposées en français et en anglais.' },
    { q: 'Le home staging virtuel est-il honnête pour une annonce ?', a: 'Oui, s’il est signalé : chaque image meublée virtuellement porte la mention « visuel non contractuel », et le bien n’est jamais modifié (murs, vues, surfaces).' },
    { q: 'Qui peut utiliser les images et les vidéos ?', a: 'Les conditions d’utilisation (supports, durée, diffusion) sont précisées dans le devis, avant la production.' },
    { q: 'Où intervenez-vous ?', a: 'Saly, Mbour et Dakar, et partout au Sénégal sur devis.' },
    { q: 'Comment sont fixés les prix ?', a: 'Sur devis, selon la durée de tournage, le nombre de livrables et les supports. Certaines prestations affichent un prix « à partir de ».' },
  ],
};

export const CC_CTA = {
  label: 'Votre projet',
  title: 'Racontez-nous ce que vous voulez montrer,',
  red: 'nous nous occupons du reste.', // À VALIDER
  text: 'Une équipe d’experts, réactive et à votre écoute.',
  cta1: 'Demander un devis',
  cta2: 'Parler à un conseiller',
  bg: '/images/contenu/terrasse-supports-l.webp',
};

export const CC_META = {
  title: 'Création de contenu, vidéo, visite 3D et impression — Support Connecté',
  description: 'Photo, vidéo, présentateurs et voix off, visites 3D, home staging, réseaux sociaux, impression personnalisée et automatisation IA. Une seule équipe à Saly, Mbour et Dakar. Devis sans engagement.',
};
