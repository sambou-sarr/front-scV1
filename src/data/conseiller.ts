// Joindre un conseiller depuis les pages V5.
// À RENSEIGNER : numéro WhatsApp Business du conseiller, format international (ex. '+221771234567').
// Vide = les boutons proposent d'appeler le standard (CONTACT.phone) au lieu d'ouvrir WhatsApp.
import { CONTACT } from './apropos';

export const WHATSAPP: string = '';

export function conseiller(message: string): { href: string; label: string; icon: string; external: boolean } {
  if (WHATSAPP) return { href: `https://wa.me/${WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, label: 'Écrire sur WhatsApp', icon: 'i-wa', external: true };
  return { href: `tel:${CONTACT.tel}`, label: `Appeler le ${CONTACT.phone}`, icon: 'i-phone', external: false };
}
