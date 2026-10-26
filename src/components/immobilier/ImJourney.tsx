import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import ServiceCard from '../devis/ServiceCard';
import { quote } from '../devis/quoteStore';
import { IM_JOURNEY } from '../../data/immobilier';
import { usePrices } from '../../lib/prices';
import track from '../../utils/track';

/*
  Parcours promoteur en quatre étapes (onglets accessibles : flèches gauche/droite, Début/Fin).
  Le contenu de l'onglet change sans animation d'apparition « rv » (elle ne se déclenche qu'une fois).
*/
export default function ImJourney() {
  const J = IM_JOURNEY;
  const [cur, setCur] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const price = usePrices();
  const e = J.etapes[cur];
  const select = (i: number, focus = false) => {
    setCur(i); track('stage_view', { stade: J.etapes[i].id });
    if (focus) tabs.current[i]?.focus();
  };
  const onKey = (ev: KeyboardEvent<HTMLDivElement>) => {
    const n = J.etapes.length;
    const keys: Record<string, number> = { ArrowRight: (cur + 1) % n, ArrowLeft: (cur - 1 + n) % n, Home: 0, End: n - 1 };
    const k = keys[ev.key];
    if (k !== undefined) { ev.preventDefault(); select(k, true); }
  };
  return (
    <section className="ix-journey" id="promoteurs">
      <div className="wrap">
        <div className="rv">
          <p className="label">{J.label}</p>
          <h2 className="h2">{J.title} <em className="red">{J.red}</em></h2>
        </div>
        <div className="ix-tabs" role="tablist" aria-label="Étapes d’un programme" onKeyDown={onKey}>
          <span className="ix-tabs-line" aria-hidden="true"><i style={{ transform: `scaleX(${cur / (J.etapes.length - 1)})` }} /></span>
          {J.etapes.map((x, i) => (
            <button key={x.id} ref={(el) => { tabs.current[i] = el; }} type="button" role="tab" id={`ix-tab-${x.id}`} aria-controls="ix-panel" aria-selected={i === cur} tabIndex={i === cur ? 0 : -1}
              className={i === cur ? 'on' : i < cur ? 'done' : undefined} onClick={() => select(i)}>
              <span className="ix-tab-ic"><Icon id={x.icon} /></span>
              <span className="ix-tab-n">{x.n}</span>
              <b>{x.label}</b>
            </button>
          ))}
        </div>
        <div className="ix-panel" id="ix-panel" role="tabpanel" aria-labelledby={`ix-tab-${e.id}`} key={e.id}>
          <figure className="ix-panel-img"><Pic img={e.img} sizes="(max-width: 900px) 92vw, 44vw" /></figure>
          <div className="ix-panel-tx">
            <h3>{e.title}</h3>
            <p className="cc-lead">{e.text}</p>
            {e.mode && <p className="ix-mode"><Icon id="i-spark" />{e.mode}</p>}
            <ul className="sv-list">{e.services.map((id) => <ServiceCard key={id} id={id} price={price(id)} />)}</ul>
            <p className="ix-point"><Icon id="i-bolt" />{e.point}</p>
            <div className="cc-pole-act">
              <button type="button" className="btn btn-red" onClick={() => quote.open({ pole: 'immobilier', profil: 'promoteur', stade: e.id, from: `etape-${e.id}` })}>{J.cta} <Icon id="arr" /></button>
              {cur < J.etapes.length - 1 && <button type="button" className="more ix-next" onClick={() => select(cur + 1)}>Étape suivante : {J.etapes[cur + 1].label} <Icon id="arr" /></button>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
