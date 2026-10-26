// Module « Créez votre carte » (page Cartes connectées).
// Recueil des données : consentement marketing SÉPARÉ, NON pré-coché, horodaté
// (loi sénégalaise n° 2008-08, art. 16 : pas de prospection par e-mail sans consentement préalable).
// « À VALIDER » = proposition de rédaction.

// Configurateur (page Cartes) : règles par niveau, conformes au catalogue
//  - Essentielle : design Support Connecté, sans personnalisation visuelle
//  - Pro : recto-verso personnalisé avec vos coordonnées
//  - Signature : « Design sur mesure, finitions premium » → fond, logo, couleur, réglages
import type { Tier } from '../lib/print';

export interface BgPreset { id: string; label: string; ink: 'light' | 'dark'; img?: string }
export interface StudioField { k: 'name' | 'role' | 'company' | 'phone' | 'email'; label: string; ph: string; auto: string; req?: boolean; type?: string }

export const DESIGNER = {
  label: 'Configurateur',
  title: 'Composez votre carte,',
  red: 'elle se crée sous vos yeux.', // À VALIDER
  text: 'Recto : votre logo. Verso : vos coordonnées et votre QR code. Signature : fonds, couleurs et photos à votre image.', // À VALIDER
  essNote: 'La carte Essentielle garde le design Support Connecté. Vos coordonnées s’affichent sur votre page connectée, modifiables à vie.', // À VALIDER (fin : catalogue)
  panel: 'Personnalisation',
  faceFront: 'Recto', faceBack: 'Verso',
  logoLabel: 'Votre logo (recto)', logoSize: 'Taille du logo', logoHint: 'Sans logo, le nom de votre entreprise s’affiche à sa place.',
  bgLabel: 'Fond du recto', backLabel: 'Fond du verso', sameAsFront: 'Comme le recto',
  accentLabel: 'Couleur d’accent', inkLabel: 'Couleur des textes', inkAuto: 'Auto', tuneLabel: 'Réglages de l’image du recto',
  upload: 'Importer une image', uploadLogo: 'Importer mon logo', replace: 'Remplacer', remove: 'Retirer',
  drop: 'Déposez une image sur la carte',
  zoom: 'Zoom', posX: 'Cadrage horizontal', posY: 'Cadrage vertical', dim: 'Assombrir', backDim: 'Assombrir le verso', reset: 'Réinitialiser',
  fileHint: 'PNG, JPG, WEBP ou SVG, 5 Mo maximum.',
  fileErr: { type: 'Format non pris en charge : choisissez une image.', size: 'Image trop lourde (5 Mo maximum).' },
  attach: 'Pensez à joindre vos fichiers (logo, images) à l’e-mail qui s’ouvre.',
  presets: [
    { id: 'noir', label: 'Noir mat', ink: 'light' },
    { id: 'or', label: 'Or brossé', ink: 'dark' },
    { id: 'rouge', label: 'Rouge profond', ink: 'light' },
    { id: 'motif', label: 'Motif', ink: 'light' },
    { id: 'villa', label: 'Villa', ink: 'light', img: '/images/fond-villa.webp' },
    { id: 'terrasse', label: 'Terrasse', ink: 'light', img: '/images/fond-terrasse.webp' },
  ] satisfies BgPreset[],
  accents: ['#c9a25b', '#EF1733', '#ffffff', '#1f7a4d', '#2f6fdf'],
  inks: ['#ffffff', '#f6f3ec', '#d6b06a', '#111315', '#EF1733'],
  send: { essentielle: 'Demander ma carte Essentielle', pro: 'Recevoir ma maquette Pro', signature: 'Recevoir ma maquette Signature' } satisfies Record<Tier, string>,
};

export const STUDIO = {
  label: 'Votre carte, en direct', // À VALIDER
  title: 'Écrivez-la.',
  red: 'Elle s’écrit.', // À VALIDER
  text: 'Choisissez votre niveau, tapez vos coordonnées : votre carte connectée se compose sous vos yeux. Validez, nous vous préparons la maquette.', // À VALIDER
  tiers: [
    { id: 'essentielle', label: 'Essentielle', note: 'Recto', twoSided: false },
    { id: 'pro', label: 'Pro', note: 'Recto-verso personnalisé', twoSided: true },
    { id: 'signature', label: 'Signature', note: 'Design sur mesure, finitions premium', twoSided: true },
  ] satisfies { id: Tier; label: string; note: string; twoSided: boolean }[],
  fields: [
    { k: 'name', label: 'Nom et prénom', ph: 'Votre nom', auto: 'name', req: true },
    { k: 'role', label: 'Fonction', ph: 'Votre fonction', auto: 'organization-title' },
    { k: 'company', label: 'Entreprise (facultatif)', ph: 'Votre entreprise', auto: 'organization' },
    { k: 'phone', label: 'Téléphone', ph: '+221 · · · · · · · · ·', auto: 'tel', type: 'tel' },
    { k: 'email', label: 'E-mail', ph: 'vous@entreprise.sn', auto: 'email', type: 'email' },
  ] satisfies StudioField[],
  // Verso Pro / Signature (libellés repris des visuels produits)
  back: {
    pro: { title: ['Scannez.', 'Connectez.', 'Développez.'], links: ['Contact', 'Appeler', 'Email', 'Site web', 'Réseaux sociaux'] },
    signature: { title: ['Plus', 'qu’un contact.', 'Une expérience.'], links: ['Mon profil', 'Me contacter', 'Mon email', 'Mon site web', 'Mes réseaux sociaux'] },
  },
  flip: 'Voir le verso', front: 'Voir le recto', oneSide: 'La carte Essentielle est imprimée au recto.',
  info: 'En validant, vous acceptez d’être recontacté au sujet de cette maquette.',
  optin: 'J’accepte de recevoir les nouveautés et offres Support Connecté (e-mail ou WhatsApp). Désinscription possible à tout moment.',
  send: 'Recevoir ma maquette',
  errors: { name: 'Indiquez votre nom.', reach: 'Laissez un téléphone ou un e-mail.', email: 'Adresse e-mail invalide.', phone: 'Numéro incomplet.' },
  done: { title: 'Demande envoyée', text: 'Nous préparons votre carte et revenons vers vous.', promise: 'Devis chiffré et détaillé, sans engagement.', edit: 'Modifier ma carte' },
};
