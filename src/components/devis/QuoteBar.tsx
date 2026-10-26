import { Icon } from '../Icons';
import { quote, useQuote } from './quoteStore';
import type { QuotePreset } from '../../types/v5';

// Barre collante qui apparaît dès qu'une prestation est sélectionnée.
export default function QuoteBar({ preset }: { preset: QuotePreset }) {
  const { selected, open } = useQuote();
  if (!selected.length || open) return null;
  const n = selected.length;
  return (
    <div className="qa-bar" role="region" aria-label="Votre sélection">
      <span><b>{n}</b> prestation{n > 1 ? 's' : ''}<span className="qa-long"> sélectionnée{n > 1 ? 's' : ''}</span></span>
      <button type="button" className="btn btn-red" onClick={() => quote.open({ ...preset, from: 'barre' })}>Demander mon devis <Icon id="arr" /></button>
    </div>
  );
}
