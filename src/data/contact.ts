// Textes de la page Contact (/contact).
// Sources : catalogue 2026 (« Votre prochain point de contact commence ici. », les 3 étapes),
// cahier des charges (textes validés), coordonnées fournies. « À VALIDER » = proposition.
import { CONTACT } from './apropos';
export { CONTACT };

// Réglage de l'envoi : laisser vide = ouverture de la messagerie avec la demande pré-remplie.
// Renseigner une URL (API, Formspree, CRM…) pour un envoi direct en JSON (POST).
const ENV: Partial<ImportMetaEnv> = (typeof import.meta !== 'undefined' && import.meta.env) || {};
// Back-office : https://<PROJECT_REF>.supabase.co/functions/v1/lead-intake (variable VITE_LEAD_ENDPOINT du fichier .env)
export const LEAD_ENDPOINT = ENV.VITE_LEAD_ENDPOINT || '';

export const PLACE = {
  address: 'Saly Niakh Niakhal, Mbour', // À VÉRIFIER : adresse publique à afficher
  maps: 'https://www.google.com/maps/search/?api=1&query=Saly%20Niakh%20Niakhal%20Mbour',
};

export const C_HERO = {
  label: 'Contact',
  line1: 'Votre prochain point de contact',
  red: 'commence ici.',
  lead: 'Une équipe d’experts, réactive et à votre écoute.',
  channels: [
    { id: 'call', icon: 'i-phone', title: 'Appeler', value: CONTACT.phone, href: `tel:${CONTACT.tel}`, copy: CONTACT.phone },
    { id: 'mail', icon: 'i-mail', title: 'Écrire', value: CONTACT.email, href: `mailto:${CONTACT.email}`, copy: CONTACT.email },
    { id: 'form', icon: 'i-pen', title: 'Demander un devis', value: 'Devis chiffré et détaillé, sans engagement.', href: '#formulaire', preset: 'devis' },
    { id: 'demo', icon: 'i-people', title: 'La démonstration', value: 'Nous venons avec les supports. Vous scannez, vous voyez ce que verront vos clients.', href: '#formulaire', preset: 'demo' },
  ],
  copied: 'Copié',
  copy: 'Copier',
};

export const C_MAP = {
  label: 'Où nous trouver',
  title: 'Basés à Saly,',
  red: 'nous venons à vous.', // À VALIDER
  text: 'Une équipe d’experts, réactive et à votre écoute.',
  schematic: 'Carte schématique',
  open: 'Ouvrir dans Google Maps',
  pins: [
    { id: 'dakar', label: 'Dakar', x: 22, y: 24 },
    { id: 'saly', label: 'Saly', x: 58, y: 64, main: true },
    { id: 'mbour', label: 'Mbour', x: 66, y: 72 },
  ],
};

// V6 — Formulaire de contact simple (page Contact). intent : valeur reçue par lead-intake (devis | demo | question).
export const C_FORM = {
  label: 'Nous écrire',
  title: 'Dites-nous ce qu’il vous faut,',
  red: 'nous revenons vers vous.',
  text: 'Par téléphone, par e-mail ou via ce formulaire : un conseiller vous répond et vous propose un devis chiffré et détaillé, sans engagement.',
  subjectLabel: 'Votre demande',
  subjects: [
    { id: 'devis', label: 'Un devis', intent: 'devis', products: [] },
    { id: 'demo', label: 'Une démonstration', intent: 'demo', products: [] },
    { id: 'qr', label: 'Des stickers QR Smart', intent: 'devis', products: ['QR Smart'] },
    { id: 'question', label: 'Une question', intent: 'question', products: [] },
  ],
  fields: { name: 'Nom et prénom *', company: 'Entreprise', phone: 'Téléphone', email: 'E-mail', message: 'Votre message (activité, supports souhaités, quantités…)' },
  preferLabel: 'Être recontacté par',
  prefers: ['Appel', 'WhatsApp', 'E-mail'],
  hint: '* Votre nom, et un téléphone ou un e-mail.',
  send: 'Envoyer ma demande',
  errors: { name: 'Indiquez votre nom.', reach: 'Laissez un téléphone ou un e-mail.', email: 'Adresse e-mail invalide.', phone: 'Numéro incomplet.', fail: 'L’envoi a échoué. Réessayez, ou appelez-nous directement.' },
  done: { title: 'Demande envoyée', text: 'Merci : un conseiller vous recontacte rapidement. Devis chiffré et détaillé, sans engagement.', mailto: 'Votre messagerie s’est ouverte avec la demande pré-remplie : il ne reste qu’à l’envoyer.', again: 'Nouvelle demande' },
};
