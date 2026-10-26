import AddToQuote from './AddToQuote';
import { PRESTA } from '../../data/prestations';
import type { Mode } from '../../types/v5';

/*
  Une prestation du catalogue : libellé, description selon le mode choisi (tournage réel ou IA),
  prix « à partir de » s'il est renseigné dans le back-office, bouton « Ajouter au devis ».
  Identifiant inconnu = rien d'affiché (pas d'erreur si le catalogue évolue).
*/
export default function ServiceCard({ id, mode = 'reel', price = '' }: { id: string; mode?: Mode; price?: string }) {
  const p = PRESTA[id];
  if (!p) return null;
  const ia = mode === 'ia' && Boolean(p.ia);
  return (
    <li className={`sv${ia ? ' sv-ia' : ''}`}>
      <div className="sv-t"><b>{p.label}</b>{p.ia && <span className="sv-mode">{ia ? 'Avec l’IA' : 'Réel'}</span>}</div>
      <p key={ia ? 'ia' : 'reel'} className="sv-d">{ia ? p.ia : p.reel}</p>
      <div className="sv-f">{price && <span className="sv-price">{price}</span>}<AddToQuote id={id} label={p.label} /></div>
    </li>
  );
}
