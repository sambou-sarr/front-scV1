// Textes de la page À propos (/a-propos).
// Sources : catalogue 2026, cahier des charges (textes validés), éléments de marque fournis
// (« Scannez. Vous verrez. », « Et si on restait connectés ? », coordonnées).
// « À VALIDER » = proposition de rédaction.
// Règles respectées : aucun faux témoignage, aucun chiffre non sourcé, aucun prix, aucune mention d'une autre marque.

import type { CatKey } from './secteurs';

export type QuizKey = 'sector' | 'goal' | 'scale';
export interface QuizOption { id: string; label: string; boost: string[] }
export interface QuizStep { key: QuizKey; q: string; options?: QuizOption[] }
export interface CatalogItem { t: string; cat: CatKey; text: string }

export const CONTACT = {
  phone: '(+221) 33 999 41 11', tel: '+221339994111',
  email: 'contact@supportconnecte.com',
  zone: 'Saly · Mbour · Dakar',
  reach: 'Sénégal · Afrique · International',
};

export const A_HERO = {
  label: 'À propos',
  line1: 'Des supports',
  red: 'qui créent du lien.',
  lead: 'Nous réunissons la communication, la programmation et le support intelligent pour transformer chaque point de contact en une expérience digitale simple, utile et durable.',
  cta1: 'Faire mon diagnostic', // À VALIDER
  cta2: 'Demander une démonstration',
  chips: ['Saly · Mbour · Dakar', 'Devis sans engagement', 'Sans application'],
  scan: 'Scannez. Vous verrez.',
  hint: 'Passez le doigt sur le logo', // À VALIDER
};

// Catalogue, pôle II — révélée mot à mot au scroll
export const A_MANIFESTO = {
  label: 'Notre conviction', // À VALIDER
  a1: 'Un support qui ne mène nulle part', a2: 'est une dépense.',
  b1: 'Un support qui ouvre la bonne page', b2: 'devient un commercial.',
};

// Signature de marque (cahier, mini-piliers du hero)
export const A_VERBS = [
  { verb: 'Connecter', sub: 'Les personnes' },
  { verb: 'Partager', sub: 'Vos contenus' },
  { verb: 'Simplifier', sub: 'Votre quotidien' },
];

export const A_PROMISES = {
  label: 'Nos engagements', // À VALIDER
  title: 'Ce sur quoi',
  red: 'vous pouvez compter.', // À VALIDER
  items: [
    { icon: 'i-people', title: 'La démonstration', text: 'Nous venons avec les supports. Vous scannez, vous voyez ce que verront vos clients.' },
    { icon: 'i-doc', title: 'La proposition', text: 'Devis chiffré et détaillé, sans engagement.' },
    { icon: 'i-bolt', title: 'La livraison', text: 'Délais respectés après validation, installation comprise.' },
    { icon: 'i-mob', title: 'Sans application', text: 'NFC ou QR, sans application.' },
    { icon: 'i-sync', title: 'Modifiable à vie', text: 'Le support reste. Le contenu évolue.' },
    { icon: 'i-check', title: 'Aucune réimpression', text: 'Nouveau numéro, nouveau prix, nouveaux horaires : tous les supports déjà distribués pointent vers la nouvelle version.' },
  ],
};

// Catalogue complet des produits (descriptions mot pour mot) — sert au diagnostic
export const CATALOG: CatalogItem[] = [
  { t: 'Carte Essentielle', cat: 'cartes', text: 'La carte qui remplace le papier. Vos informations essentielles en un scan, modifiables à vie. Sans suivi, sans engagement.' },
  { t: 'Carte Pro', cat: 'cartes', text: 'Recto-verso personnalisé. Vos liens, vos photos, vos avis, un premier catalogue et le suivi de vos scans.' },
  { t: 'Carte Signature', cat: 'cartes', text: 'Design sur mesure, catalogue complet avec bouton commander, tableau de bord et cartes rattachées : la carte devient un outil de prospection.' },
  { t: 'Sticker téléphone', cat: 'cartes', text: 'Rond de 30 mm au dos du smartphone, copie du QR de votre carte.' },
  { t: 'Avis clients', cat: 'qr', text: 'Google, TripAdvisor, Booking, avant le départ.' },
  { t: 'QR Smart', cat: 'qr', text: 'Un sticker posé sur la table. En fin de repas, le client scanne, donne son avis, puis joue : la roue ou le jeu des trois boîtes. Il repart avec un bon de réduction à utiliser lors de sa prochaine visite.' },
  { t: 'Accès Wi-Fi', cat: 'qr', text: 'La connexion sans donner le mot de passe.' },
  { t: 'Réseaux sociaux', cat: 'qr', text: 'Instagram, Facebook, TikTok, YouTube.' },
  { t: 'Notre menu', cat: 'qr', text: 'Menu digital modifiable chaque jour.' },
  { t: 'Contactez-nous', cat: 'qr', text: 'Appel, WhatsApp, email, site.' },
  { t: 'Rendez-vous', cat: 'qr', text: 'Réservation d’un créneau en un scan.' },
  { t: 'Panneau immobilier connecté', cat: 'panneaux', text: 'Photos, plans, prix, localisation, rendez-vous. Le lien est réattribué dès que le bien est vendu.' },
  { t: 'Bâche grand format', cat: 'panneaux', text: 'Sur mesure, œillets inclus, encres anti-UV. Chantier, devanture, événement.' },
  { t: 'Panneau d’accueil', cat: 'panneaux', text: 'Jusqu’à huit accès sur un panneau : Wi-Fi, menu, avis, WhatsApp, informations.' },
  { t: 'Chevalet trottoir', cat: 'panneaux', text: 'Bois double face, affiche interchangeable. Le QR ouvre le menu digital du jour.' },
  { t: 'Casquette', cat: 'branding', text: 'Logo sur la face avant, QR sur le côté. Le support le plus visible en extérieur.' },
  { t: 'T-shirt', cat: 'branding', text: 'Logo poitrine, grand QR au dos lisible à distance. Staff, événement, vente.' },
  { t: 'Polo', cat: 'branding', text: 'La tenue d’équipe du personnel en contact avec le client.' },
];

// Diagnostic express (questions et logique : À VALIDER)
export const A_QUIZ = {
  label: 'Diagnostic express',
  title: 'Trois questions,',
  red: 'vos supports recommandés.',
  text: 'Répondez en quelques secondes : nous vous montrons par où commencer, puis nous venons vous le démontrer.',
  steps: [
    { key: 'sector', q: 'Quelle est votre activité ?' },
    {
      key: 'goal', q: 'Votre priorité aujourd’hui ?',
      options: [
        { id: 'contact', label: 'Être trouvé et contacté', boost: ['Carte Pro', 'Contactez-nous', 'Carte Essentielle', 'Sticker téléphone'] },
        { id: 'avis', label: 'Obtenir plus d’avis', boost: ['QR Smart', 'Avis clients'] },
        { id: 'offre', label: 'Présenter mon offre', boost: ['Notre menu', 'Chevalet trottoir', 'Panneau immobilier connecté', 'Carte Signature'] },
        { id: 'visible', label: 'Être vu de loin', boost: ['Bâche grand format', 'Panneau d’accueil', 'Casquette'] },
      ],
    },
    {
      key: 'scale', q: 'Pour combien de points de contact ?',
      options: [
        { id: 'solo', label: 'Moi, ou un seul lieu', boost: [] },
        { id: 'team', label: 'Toute une équipe', boost: ['Carte Signature', 'Polo'] },
        { id: 'multi', label: 'Plusieurs lieux', boost: ['Panneau d’accueil', 'Réseaux sociaux'] },
        { id: 'event', label: 'Un événement', boost: ['Bâche grand format', 'T-shirt'] },
      ],
    },
  ] satisfies QuizStep[],
  other: 'Autre activité',
  back: 'Retour',
  resultTitle: 'Par où commencer',
  next: 'Prochaine étape : la démonstration',
  nextText: 'Nous venons avec les supports. Vous scannez, vous voyez ce que verront vos clients.',
  send: 'Recevoir ma proposition',
  call: 'Appeler',
  restart: 'Recommencer',
};

// Réponses = phrases du catalogue (questions : À VALIDER)
export const A_FAQ = {
  label: 'Questions fréquentes',
  title: 'Avant de',
  red: 'vous lancer.',
  items: [
    { q: 'Mes clients doivent-ils installer une application ?', a: 'Non. NFC ou QR, sans application : un geste suffit, votre client scanne ou approche son téléphone et votre univers s’ouvre immédiatement.' },
    { q: 'Que se passe-t-il si je change de numéro ou de prix ?', a: 'Nouveau numéro, nouveau prix, nouveaux horaires : tous les supports déjà distribués pointent vers la nouvelle version. Aucune réimpression.' },
    { q: 'Puis-je voir le résultat avant de commander ?', a: 'Oui. Nous venons avec les supports. Vous scannez, vous voyez ce que verront vos clients.' },
    { q: 'Quels sont les délais ?', a: 'Devis chiffré et détaillé, sans engagement. Le délai de livraison est fixé dans le devis et respecté après validation, installation comprise.' },
    { q: 'Les stickers résistent-ils à l’extérieur ?', a: 'Résistants à l’eau et aux UV, en 8, 12 ou 17 cm, ronds, carrés ou rectangulaires. Posés en quelques secondes, modifiables à distance.' },
    { q: 'Vous occupez-vous aussi de ma communication ?', a: 'Oui : communication et marketing, programmation et développement de solutions, support intelligent. Chaque pôle peut travailler seul pour vous. Ensemble, ils forment une chaîne sans rupture.' },
  ],
};

export const A_END = {
  hand: 'Et si on restait connectés ?',
  text: 'Une équipe d’experts, réactive et à votre écoute.',
  cta1: 'Demander une démonstration',
  team: 'Découvrir l’équipe',
  sticky: 'Demander une démonstration',
  stickySub: 'Devis sans engagement',
};
