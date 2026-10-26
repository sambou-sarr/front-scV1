import { api } from '../lib/api';

/*
  Envoie les demandes au backend Support Connecté. Les données du studio de carte
  qui peuvent contenir des images encodées ne sont pas incluses dans la requête.
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
export type LeadMode = 'api';

export default async function sendLead(payload: LeadBase): Promise<{ mode: LeadMode }> {
  const body = JSON.stringify(payload, (key, value: unknown) =>
    key === 'print' || key.endsWith('_fichier') ? undefined : value,
  );
  await api.post('/leads', body);
  return { mode: 'api' };
}
