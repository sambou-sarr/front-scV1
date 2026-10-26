import type { PointerEvent as ReactPointerEvent } from 'react';
import { A_PROMISES } from '../../data/apropos';
import { Icon } from '../Icons';
import { cssVars } from '../../lib/css';

/*
  Engagements (textes du catalogue). Cartes « projecteur » : un halo suit le pointeur
  et illumine la bordure (variables CSS --mx / --my + masque CSS).
*/
const track = (e: ReactPointerEvent<HTMLLIElement>) => {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
};

export default function Promises() {
  return (
    <section className="promises">
      <div className="wrap">
        <div className="rv pr-head">
          <p className="label">{A_PROMISES.label}</p>
          <h2 className="h2">{A_PROMISES.title} <em className="red">{A_PROMISES.red}</em></h2>
        </div>
        <ul className="pr-grid">
          {A_PROMISES.items.map((p, i) => (
            <li key={p.title} className="pr-card rv" onPointerMove={track} style={cssVars({ '--i': i })}>
              <span className="pr-ic"><Icon id={p.icon} /></span>
              <b>{p.title}</b>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
