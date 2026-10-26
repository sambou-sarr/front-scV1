import { ENV } from '../../../lib/env';
import type { Formule } from '../../../types/admin';

export const FORMULES: Record<Formule, string> = { essentielle: 'Essentielle', pro: 'Pro', signature: 'Signature' };
export const FORMULE_TONE: Record<Formule, string> = { essentielle: 'grey', pro: 'dark', signature: 'gold' };
// ⚠️ À aligner sur SECTEURS de fiches.schemas.ts côté API.
export const SECTEURS: Record<string, string> = { restaurant: 'Restaurant', immobilier: 'Immobilier', commerce: 'Commerce', hotel: 'Hôtel', independant: 'Indépendant', beaute: 'Beauté' };
export const SUB_STATUS: Record<string, { label: string; tone: string }> = {
  active: { label: 'Active', tone: 'green' }, pending: { label: 'En attente', tone: 'gold' },
  canceled: { label: 'Annulée', tone: 'grey' }, expired: { label: 'Expirée', tone: 'red' },
};

export const fcfa = (n: number | null | undefined) => (n === null || n === undefined ? '—' : `${new Intl.NumberFormat('fr-FR').format(n)} F`);
export const fdate = (d: string | number | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export function ago(d: string | number | Date | null | undefined): string {
  if (!d) return '—';
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'à l’instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.round(h / 24);
  return j < 30 ? `il y a ${j} j` : fdate(d);
}
/** Adresse publique d'une fiche (route /f/:slug du site). Même base que les QR codes de l'espace client. */
export const publicUrl = (slug: string) =>
  `${(ENV.VITE_PUBLIC_APP_URL || window.location.origin).replace(/\/+$/, '')}/f/${encodeURIComponent(slug)}`;
