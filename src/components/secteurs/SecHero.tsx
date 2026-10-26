import { useEffect, useRef, useState } from 'react';
import { S_HERO, SECTORS } from '../../data/secteurs';
import { Icon } from '../Icons';
import SectorScreen from './SectorScreen';
import { cssVars } from '../../lib/css';

/*
  Hero Secteurs : orbite des 8 métiers autour d'un téléphone.
  L'anneau tourne lentement (les icônes restent droites), un faisceau relie le centre
  au secteur actif et le téléphone affiche la page type de ce métier.
  Survol / toucher : sélection. Clic : défilement jusqu'au chapitre du secteur.
*/
const N = SECTORS.length;
const ang = (i: number) => -90 + i * (360 / N);

export default function SecHero() {
  const [go, setGo] = useState(false), [cur, setCur] = useState(0), [beam, setBeam] = useState(ang(0));
  const user = useRef(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => { if (!user.current) setCur((c) => (c + 1) % N); }, 2600);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { // le faisceau tourne toujours par le chemin le plus court
    setBeam((prev) => { let a = ang(cur); while (a - prev > 180) a -= 360; while (a - prev < -180) a += 360; return a; });
  }, [cur]);
  const pick = (i: number) => { user.current = true; setCur(i); };
  const go2 = (i: number) => { pick(i); document.getElementById('sec-' + SECTORS[i].id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const s = SECTORS[cur];

  return (
    <section className={`c-hero s-hero${go ? ' go' : ''}`}>
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap s-hero-grid">
        <div>
          <p className="label light fx">{S_HERO.label}</p>
          <h1>
            <span className="l"><span>{S_HERO.line1}</span></span>
            <span className="l"><span><em className="red">{S_HERO.red}</em></span></span>
          </h1>
          <p className="lead fx d1">{S_HERO.lead}</p>
          <div className="ctas fx d2">
            <a className="btn btn-red" href="#explorer">{S_HERO.cta1} <Icon id="arr" /></a>
            <a className="btn btn-line" href="/contact">{S_HERO.cta2}</a>
          </div>
        </div>

        <div className="orbit" onMouseLeave={() => { user.current = false; }}>
          <div className="orb-ring">
            <span className="orb-beam" style={cssVars({ '--a': beam + 'deg' })} aria-hidden="true" />
            {SECTORS.map((x, i) => {
              const a = ang(i) * Math.PI / 180;
              return (
                <button key={x.id} className={`orb-item${i === cur ? ' on' : ''}`}
                  style={cssVars({ left: `${50 + Math.cos(a) * 43}%`, top: `${50 + Math.sin(a) * 43}%`, '--i': i })}
                  onMouseEnter={() => pick(i)} onFocus={() => pick(i)} onClick={() => go2(i)} aria-label={x.name}>
                  <span className="orb-in"><span className="orb-ic"><Icon id={x.icon} /></span><span className="orb-lb">{x.short}</span></span>
                </button>
              );
            })}
          </div>
          <div className="phone static orb-phone" aria-live="polite">
            <div className="screen"><div className="isl" /><div className="orb-scr" key={cur}><SectorScreen page={s.page} /></div></div>
          </div>
          <p className="orb-now"><b>{s.name}</b><span>{S_HERO.hint}</span></p>
        </div>
      </div>
    </section>
  );
}
