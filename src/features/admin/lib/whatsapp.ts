import type { RelanceItem, RelanceType } from '../../../types/admin';
import { fdate } from './format';

// Numéro → format wa.me (chiffres uniquement). 9 chiffres commençant par 7 = mobile sénégalais → indicatif 221.
export function waNumber(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (/^7\d{8}$/.test(d)) d = '221' + d;
  return d.length >= 10 ? d : null;
}

// Message proposé : l'équipe le relit dans WhatsApp avant d'envoyer.
export function waMessage(type: RelanceType, r: RelanceItem): string {
  const salut = `Bonjour ${r.prenom || r.nom},`;
  const fiche = r.entreprise ? `votre fiche connectée « ${r.entreprise} »` : 'votre fiche connectée';
  if (type === 'bientot') return `${salut} ${fiche} Support Connecté arrive à échéance le ${fdate(r.dateEcheance)}. Souhaitez-vous la renouveler ?`;
  if (type === 'expirees') return `${salut} ${fiche} Support Connecté a expiré${r.dateEcheance ? ` le ${fdate(r.dateEcheance)}` : ''}. Je peux la réactiver dès aujourd’hui si vous le souhaitez.`;
  return `${salut} ${fiche} a déjà été consultée ${r.scansTotal} fois. Souhaitez-vous que je vous présente la formule Pro ?`;
}

export function waLink(type: RelanceType, r: RelanceItem): string | null {
  const n = waNumber(r.whatsapp) ?? waNumber(r.telephone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(waMessage(type, r))}` : null;
}
