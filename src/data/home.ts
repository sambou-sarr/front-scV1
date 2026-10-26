// Landing page V2 — éléments de mise en scène.
// Les textes validés restent dans content.ts (cahier des charges, section 29) : HERO, APPROACH,
// SUPPORTS, PROCESS, CTA. Ce fichier ne contient que la scénographie et les liens.
// « À VALIDER » = proposition de rédaction.

// Hero : 4 supports qui ouvrent la même page (x, y, w en % de la scène, d = profondeur)
export const H_SCENE = {
  from: 'Ouvert depuis', // À VALIDER
  supports: [
    { id: 'carte', img: '/images/main-carte-detouree.webp', label: 'Carte connectée', x: 1, y: 6, w: 37, d: .6, cx: 19.5, cy: 20 },
    { id: 'sticker', img: '/images/sticker-google.webp', label: 'QR Smart', x: 74, y: 0, w: 25, d: .9, cx: 86.5, cy: 14 },
    { id: 'chevalet', img: '/images/chevalet.webp', label: 'Chevalet trottoir', x: 79, y: 46, w: 20, d: .75, cx: 89, cy: 63 },
    { id: 'polo', img: '/images/polo-atelier-kanel.webp', label: 'Polo', x: 0, y: 60, w: 38, d: .5, cx: 19, cy: 74.5 },
  ],
};

// Trois métiers : visuel et lien de chaque panneau (dans l'ordre de APPROACH.metiers)
export const H_METIERS = [
  { visual: 'img', img: '/images/oasis.webp', href: '/creation-contenu' }, // V5 : page Création de contenu
  { visual: 'phone', href: '/cartes-connectees' },
  { visual: 'img', img: '/images/panneau-a-vendre.webp', href: '#supports' },
];

// Bento des supports (dans l'ordre de SUPPORTS.items)
export const H_BENTO = ['cartes', 'qr', 'panneaux', 'branding'];

// Scrubber « Du support physique à l'action »
export const H_PROCESS = {
  hint: 'Faites glisser pour avancer', // À VALIDER
  choose: [
    { img: '/images/main-carte-detouree.webp', label: 'Carte' },
    { img: '/images/sticker-google.webp', label: 'Sticker' },
    { img: '/images/chevalet.webp', label: 'Chevalet' },
    { img: '/images/polo-atelier-kanel.webp', label: 'Textile' },
  ],
  chips: ['Logo', 'Visuels', 'Contenus', 'QR ou NFC'], // repris de l'étape 02 du cahier
  actions: ['Appeler', 'Réserver', 'Commander', 'Laisser un avis'], // repris de l'étape 04 du cahier
};

// Bandeau des secteurs
export const H_SECTORS = { hint: 'Survolez pour mettre en pause' }; // À VALIDER

// Accroche vers le module de la page Contact
export const H_TEASER = {
  label: 'Votre carte, en direct',
  title: 'Écrivez-la.',
  red: 'Elle s’écrit.',
  text: 'Dans le configurateur, votre carte connectée se compose pendant que vous tapez vos coordonnées. Validez : nous vous préparons la maquette.', // À VALIDER
  cta: 'Créer ma carte',
  href: '/cartes-connectees#creer-ma-carte',
  // Identités de démonstration (fictives)
  samples: [
    { company: 'Le Sunset Saly', name: 'Awa Ndiaye', role: 'Gérante', phone: '+221 77 123 45 67' },
    { company: 'Chez Homard', name: 'Moussa Diop', role: 'Chef', phone: '+221 78 000 11 22' },
    { company: 'L’Épicerie Nomade', name: 'Fatou Sarr', role: 'Fondatrice', phone: '+221 76 555 44 33' },
  ],
};
