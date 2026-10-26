// Sélection de prestations + ouverture du formulaire de devis, partagées par toute la page
// (boutons « Ajouter au devis », barre du bas, formulaire). La sélection survit au changement de page
// (sessionStorage) : on peut ajouter une vidéo sur /creation-contenu puis une bâche sur /promoteur-immobilier.
import { useSyncExternalStore } from 'react';
import track from '../../utils/track';
import type { QuotePreset } from '../../types/v5';

/** seq : incrémenté à chaque ouverture (le formulaire se réinitialise sur ce signal, pas sur les autres changements). */
interface State { open: boolean; seq: number; preset: QuotePreset; selected: string[] }

const KEY = 'sc-devis';
const load = (): string[] => {
  try { const v: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []; }
  catch { return []; }
};
const save = (ids: string[]): void => { try { sessionStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* navigation privée : sélection non conservée */ } };

let state: State = { open: false, seq: 0, preset: {}, selected: typeof window === 'undefined' ? [] : load() };
const subs = new Set<() => void>();
const set = (s: Partial<State>): void => {
  state = { ...state, ...s };
  if (s.selected) save(s.selected);
  subs.forEach((f) => f());
};

export const quote = {
  get: (): State => state,
  subscribe: (f: () => void): (() => void) => { subs.add(f); return () => { subs.delete(f); }; },
  /** Ouvre le formulaire ; les prestations du préréglage s'ajoutent à la sélection. */
  open(p: QuotePreset = {}): void {
    const selected = [...new Set([...state.selected, ...(p.services ?? [])])];
    set({ open: true, seq: state.seq + 1, preset: p, selected });
    track('quote_open', { from: p.from ?? '', pole: p.pole ?? '', n: selected.length });
  },
  close(): void { set({ open: false }); },
  toggle(id: string): void {
    const has = state.selected.includes(id);
    set({ selected: has ? state.selected.filter((x) => x !== id) : [...state.selected, id] });
    track(has ? 'quote_remove' : 'quote_add', { service: id });
  },
  setSelected(ids: string[]): void { set({ selected: ids }); },
  /** Après envoi réussi : sélection vidée (le formulaire reste ouvert sur l'écran de confirmation). */
  done(): void { set({ selected: [] }); },
};

export function useQuote(): State {
  return useSyncExternalStore(quote.subscribe, quote.get, quote.get);
}
