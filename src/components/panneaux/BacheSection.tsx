import { useState } from 'react';
import { P_BACHE } from '../../data/panneaux';
import { Icon } from '../Icons';

/*
  Bâche grand format : la bâche « flotte » (ondulation CSS + reflet qui glisse),
  les œillets pulsent, et le décor change selon l'usage choisi (chantier, devanture, événement).
*/
export default function BacheSection() {
  const [use, setUse] = useState(0);
  return (
    <section className="bache" id="bache">
      <div className="wrap ba-grid">
        <div className="ba-txt rv">
          <p className="label light">{P_BACHE.label}</p>
          <h2 className="h2">{P_BACHE.title}<br /><em className="red">{P_BACHE.red}</em></h2>
          <p className="ba-p">{P_BACHE.text}</p>
          <ul className="ba-specs">
            {P_BACHE.specs.map((s) => <li key={s.title}><span><Icon id={s.icon} /></span>{s.title}</li>)}
          </ul>
          <div className="seg dark" role="radiogroup" aria-label="Usage">
            {P_BACHE.uses.map((u, i) => <button key={u.id} role="radio" aria-checked={use === i} className={use === i ? 'on' : ''} onClick={() => setUse(i)}>{u.label}</button>)}
          </div>
        </div>
        <div className={`ba-scene s-${P_BACHE.uses[use].id}`}>
          <div className="ba-deco" aria-hidden="true"><i /><i /><i /></div>
          <div className="ba-flag">
            <img src="/images/bache.webp" alt="Bâche grand format avec œillets et QR code" loading="lazy" />
            <span className="ba-sheen" aria-hidden="true" />
            {[[2.2, 4], [97.6, 4], [2.2, 95], [97.6, 95]].map(([x, y], i) => <span key={i} className="eyelet" style={{ left: x + '%', top: y + '%' }} aria-hidden="true" />)}
          </div>
          <p className="ba-use" aria-live="polite">{P_BACHE.uses[use].label}</p>
        </div>
      </div>
    </section>
  );
}
