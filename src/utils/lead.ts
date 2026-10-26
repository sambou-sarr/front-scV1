import { CONTACT, LEAD_ENDPOINT } from '../data/contact';

/*
  Envoi d'une demande (lead).
  - LEAD_ENDPOINT renseigné : POST JSON vers votre API / CRM / Formspree → { mode: 'api' }.
  - Sinon : ouvre la messagerie avec la demande pré-remplie → { mode: 'mailto' }.
  Lève une erreur si l'API répond en échec (la page affiche alors un message de repli).
*/
/** Champs communs à toutes les demandes (formulaire de contact, devis V5, configurateur de carte). */
export interface LeadBase {
  intentLabel: string;
  products: string[];
  sector?: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  city?: string;
  prefer?: string;
  message?: string;
}
export type LeadMode = 'api' | 'mailto';

export function leadText(p: LeadBase): string {
  return [
    `Objet : ${p.intentLabel}`,
    p.products.length ? `Supports : ${p.products.join(', ')}` : null,
    p.sector ? `Activité : ${p.sector}` : null,
    '',
    `Nom : ${p.name}`, p.company ? `Entreprise : ${p.company}` : null,
    p.phone ? `Téléphone : ${p.phone}` : null, p.email ? `E-mail : ${p.email}` : null,
    p.city ? `Ville : ${p.city}` : null, `Préférence : ${p.prefer}`,
    p.message ? `\nMessage :\n${p.message}` : null,
  ].filter((x) => x !== null).join('\n');
}

export default async function sendLead(payload: LeadBase): Promise<{ mode: LeadMode }> {
  if (LEAD_ENDPOINT) {
    const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('lead_failed');
    return { mode: 'api' };
  }
  const subject = `${payload.intentLabel} — ${payload.company || payload.name}`;
  window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(leadText(payload))}`;
  return { mode: 'mailto' };
}
