import { useEffect, useRef, useState } from 'react';
import { SECTORS, CATS, S_EXPLORE } from '../../data/secteurs';
import { Icon } from '../Icons';
import SectorScreen from './SectorScreen';
import useStickyProgress from '../../hooks/useStickyProgress';
import { cssVars } from '../../lib/css';
import type { Sector } from '../../data/secteurs';

/*
  Explorateur des secteurs (8 en V6 : Promoteurs et Immobilier séparés).
  Desktop : les chapitres défilent à gauche, la scène visuelle reste épinglée à droite
  et se recompose à chaque secteur (révélation par clip-path, cascade, téléphone).
  Barre d'onglets collante avec progression ; sur mobile elle suit le secteur actif.
*/
function Comp({ s, on }: { s: Sector; on: boolean }) {
  return (
    <div className={`comp${on ? ' on' : ''}`} aria-hidden={!on}>
      {s.imgs.map((m, i) => (
        <span key={m.src + i} className="ci" style={cssVars({ '--x': m.x, '--y': m.y, '--w': m.w, '--r': (m.r || 0) + 'deg', '--i': i })}>
          <img src={m.src} alt="" loading="lazy" draggable="false" />
        </span>
      ))}
    </div>
  );
}

export default function SectorExplorer() {
  const [cur, setCur] = useState(0);
  const wrap = useRef<HTMLElement>(null), chaps = useRef<(HTMLElement | null)[]>([]), tabs = useRef<HTMLDivElement>(null), bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) setCur(Number((e.target as HTMLElement).dataset.i));
    }), { rootMargin: '-45% 0px -50% 0px' });
    chaps.current.forEach((c) => c && io.observe(c));
    return () => io.disconnect();
  }, []);

  useEffect(() => { // garde l'onglet actif visible (mobile)
    const t = tabs.current, b = t?.children[cur] as HTMLElement | undefined;
    if (t && b) t.scrollTo({ left: b.offsetLeft - (t.clientWidth - b.clientWidth) / 2, behavior: 'smooth' });
  }, [cur]);

  useStickyProgress(wrap, (p) => { bar.current!.style.transform = `scaleX(${p})`; });

  const goTo = (i: number) => chaps.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const s = SECTORS[cur];

  return (
    <section className="explorer" id="explorer" ref={wrap}>
      <div className="ex-tabs-wrap">
        <div className="wrap">
          <div className="ex-tabs" ref={tabs} role="tablist" aria-label={S_EXPLORE.label}>
            {SECTORS.map((x, i) => (
              <button key={x.id} role="tab" aria-selected={i === cur} className={i === cur ? 'on' : i < cur ? 'done' : ''} onClick={() => goTo(i)}>
                <Icon id={x.icon} /><span>{x.short}</span>
              </button>
            ))}
          </div>
        </div>
        <span className="ex-bar" aria-hidden="true"><i ref={bar} /></span>
      </div>

      <div className="wrap ex-grid">
        <div className="ex-chaps">
          {SECTORS.map((x, i) => (
            <article key={x.id} id={'sec-' + x.id} className={`chap${i === cur ? ' on' : ''}`} data-i={i} ref={(el) => { chaps.current[i] = el; }}>
              <p className="chap-n"><span className="chap-ic"><Icon id={x.icon} /></span>{String(i + 1).padStart(2, '0')} / {String(SECTORS.length).padStart(2, '0')}</p>
              <h2 className="chap-t">{x.name}</h2>
              <p className="chap-hook">{x.hook}</p>
              <div className="chap-mob" aria-hidden="true"><Comp s={x} on /></div>
              <p className="chap-k">{S_EXPLORE.supportsTitle}</p>
              <ul className="chap-sup">
                {x.supports.map((u) => (
                  <li key={u.title}>
                    <a href={CATS[u.cat].href} className="cat"><Icon id={CATS[u.cat].icon} />{CATS[u.cat].short}</a>
                    <b>{u.title}</b><span>{u.text}</span>
                  </li>
                ))}
              </ul>
              {/* Lien vers la page dédiée si elle existe (promoteurs, immobilier → « Promoteur et immobilier »), sinon demande de devis */}
              <a className="more" href={x.detail || '/contact?sujet=devis#formulaire'}>{x.detail ? (x.detailLabel || `${S_EXPLORE.seePage} ${x.name}`) : S_EXPLORE.quote} <Icon id="arr" /></a>
            </article>
          ))}
        </div>

        <div className="ex-side" aria-hidden="true">
          <div className="ex-sticky">
            <div className="ex-stage">
              {SECTORS.map((x, i) => <Comp key={x.id} s={x} on={i === cur} />)}
              <div className="phone static ex-phone">
                <div className="screen"><div className="isl" /><div className="orb-scr" key={cur}><SectorScreen page={s.page} /></div></div>
              </div>
            </div>
            <p className="ex-cap"><Icon id={s.icon} />{S_EXPLORE.pageTitle}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
