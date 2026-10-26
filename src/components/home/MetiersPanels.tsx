import { useState } from 'react';
import { APPROACH } from '../../data/content';
import { H_METIERS } from '../../data/home';
import { Icon } from '../Icons';
import { MiniPhone } from '../PhoneMockup';

/*
  « Trois métiers connectés. » — panneaux extensibles : le métier survolé (ou touché)
  s'ouvre, les deux autres se replient. V6 : titres repliés à l'horizontale + icône « survoler pour ouvrir ».
  Sur mobile : cartes empilées (tout est ouvert, pas d'icône).
  Textes du cahier des charges (sections 07 à 10), inchangés.
*/
export default function MetiersPanels() {
  const [act, setAct] = useState(0);
  return (
    <section className="h2-approach" id="approche">
      <div className="wrap">
        <div className="ap-head rv">
          <div>
            <p className="label">{APPROACH.label}</p>
            <h2 className="h2">{APPROACH.titleStart}<span className="red">{APPROACH.titleRed}</span></h2>
          </div>
          <p className="side">{APPROACH.sideStart}<br /><span className="red">{APPROACH.sideRed}</span></p>
        </div>
        <div className="mp-row rv">
          {APPROACH.metiers.map((m, i) => {
            const V = H_METIERS[i];
            return (
              <article key={m.id} className={`mp${i === act ? ' on' : ''}`} tabIndex={0}
                onMouseEnter={() => setAct(i)} onFocus={() => setAct(i)} onClick={() => setAct(i)} aria-expanded={i === act}>
                <div className={`mp-vis v-${V.visual}`} aria-hidden="true">
                  {V.visual === 'phone' ? <MiniPhone /> : <img src={V.img} alt="" loading="lazy" />}
                </div>
                <span className="mp-num">{m.num}</span>
                <div className="mp-v" aria-hidden="true">
                  <p>{m.title.map((l, k) => <span key={k}>{l}</span>)}</p>
                  <span className="mp-hint" title="Survolez pour ouvrir"><Icon id="i-hover" /></span>
                </div>
                <div className="mp-body">
                  <h3>{m.title.map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}</h3>
                  <p className="mp-sub">{m.sub}</p>
                  <ul>{m.items.map((it) => <li key={it}>{it}</li>)}</ul>
                  <a className="more" href={V.href}>{APPROACH.more} <Icon id="arr" /></a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
