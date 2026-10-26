import type { ReactNode } from 'react';
import { SECTORS as SEC_HEAD } from '../../data/content';
import { SECTORS } from '../../data/secteurs';
import { H_SECTORS } from '../../data/home';
import { Icon } from '../Icons';

/*
  « Une solution adaptée à chaque métier. » — deux bandeaux en défilement infini
  (sens opposés, bords fondus par masque CSS, pause au survol). Chaque métier renvoie
  à son chapitre sur la page Secteurs. Mouvement réduit : bandeaux fixes et défilables.
*/
export default function SectorsMarquee() {
  const row = <T,>(items: T[], render: (x: T, k: number) => ReactNode, cls: string) => (
    <div className={`mq ${cls}`}>
      <div className="mq-track">
        {[0, 1].map((k) => <div className="mq-set" key={k} aria-hidden={k === 1}>{items.map((x) => render(x, k))}</div>)}
      </div>
    </div>
  );
  return (
    <section className="h2-sectors">
      <div className="wrap">
        <div className="sec-head rv">
          <div><p className="label">{SEC_HEAD.label}</p><h2 className="h2">{SEC_HEAD.title}</h2></div>
          <a className="more" href="/secteurs">{SEC_HEAD.link} <Icon id="arr" /></a>
        </div>
      </div>
      {row(SECTORS, (s, k) => (
        <a key={s.id + k} className="mq-pill" href={`/secteurs#sec-${s.id}`} tabIndex={k ? -1 : 0}><span><Icon id={s.icon} /></span>{s.name}</a>
      ), 'mq-a')}
      {row(SECTORS, (s, k) => (
        <span key={s.id + k} className="mq-hook">{s.hook}</span>
      ), 'mq-b')}
      <p className="wrap mq-hint">{H_SECTORS.hint}</p>
    </section>
  );
}
