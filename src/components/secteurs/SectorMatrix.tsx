import { useState } from 'react';
import { SECTORS, CATS, S_MATRIX } from '../../data/secteurs';
import type { CatKey, Sector } from '../../data/secteurs';
import { Icon } from '../Icons';

/*
  Matrice secteurs × supports. Croix de survol en CSS pur (sélecteur :has()),
  filtre par support au clic (les secteurs non concernés s'estompent).
  Un point = ce support figure dans les recommandations du secteur (calculé depuis secteurs.ts).
*/
const has = (s: Sector, k: CatKey) => s.supports.some((u) => u.cat === k);

export default function SectorMatrix() {
  const [col, setCol] = useState<CatKey | null>(null);
  const keys = Object.keys(CATS) as CatKey[];
  return (
    <section className="matrix">
      <div className="wrap">
        <div className="sec-head split rv">
          <div><p className="label">{S_MATRIX.label}</p><h2 className="h2">{S_MATRIX.title} <em className="red">{S_MATRIX.red}</em></h2></div>
          <p className="side-note">{S_MATRIX.hint}</p>
        </div>
        <div className="mx-wrap rv">
          <table className="mx" data-col={col || ''}>
            <thead>
              <tr>
                <th scope="col" className="mx-corner">Secteur</th>
                {keys.map((k) => (
                  <th scope="col" key={k} data-c={k}>
                    <button className={col === k ? 'on' : ''} aria-pressed={col === k} onClick={() => setCol(col === k ? null : k)}>
                      <Icon id={CATS[k].icon} /><span>{CATS[k].short}</span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTORS.map((s) => (
                <tr key={s.id} className={col && !has(s, col) ? 'dim' : ''}>
                  <th scope="row"><a href={'#sec-' + s.id}><Icon id={s.icon} /><span className="full">{s.name}</span><span className="short">{s.short}</span></a></th>
                  {keys.map((k) => <td key={k} data-c={k}>{has(s, k) ? <span className="mx-dot" aria-label="Recommandé" /> : <span className="mx-no" aria-label="—">·</span>}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
