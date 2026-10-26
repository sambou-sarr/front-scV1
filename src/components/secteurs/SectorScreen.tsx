import { cssVars } from '../../lib/css';
import type { SectorPage } from '../../data/secteurs';
// Page de démonstration affichée dans le téléphone pour un secteur (PLACEHOLDER).
// Les libellés d'actions reprennent la liste du catalogue (pôle II).
export default function SectorScreen({ page }: { page: SectorPage }) {
  return (
    <div className="we-page" style={cssVars({ '--bc': page.color })}>
      <p className="we-brand"><b>{page.brand}</b><small>{page.sub}</small></p>
      {page.actions.map((a) => <span key={a} className="we-act">{a}</span>)}
    </div>
  );
}
