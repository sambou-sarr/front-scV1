import { useEffect, useRef, useState } from 'react';
import { C_HERO } from '../../data/cartes';
import { useContent } from '../../lib/content';
import { Icon } from '../Icons';
import Card3D from './Card3D';

/*
  Hero de la page Cartes.
  - Carte 3D qui suit le pointeur (inclinaison + reflet lumineux), se retourne au clic / tap.
  - Au scroll, la carte s'éloigne en perspective via CSS scroll-driven animations
    (animation-timeline: view()), sans JavaScript, avec repli automatique si non supporté.
*/
export default function CardsHero() {
  const CH = useContent('cartes.hero', C_HERO);
  const [go, setGo] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const zone = useRef<HTMLElement>(null), rot = useRef<HTMLDivElement>(null);

  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const el = zone.current, r = rot.current;
    if (!el || !r || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const tick = () => {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      r.style.setProperty('--ry', (cx * 22).toFixed(2) + 'deg');
      r.style.setProperty('--rx', (-cy * 16).toFixed(2) + 'deg');
      r.style.setProperty('--gx', (50 + cx * 60).toFixed(1) + '%');
      r.style.setProperty('--gy', (50 + cy * 60).toFixed(1) + '%');
      if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) raf = requestAnimationFrame(tick); else raf = 0;
    };
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - .5) * 2; ty = ((e.clientY - b.top) / b.height - .5) * 2;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const leave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <section className={`c-hero${go ? ' go' : ''}`} ref={zone}>
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap c-hero-grid">
        <div className="c-hero-txt">
          <p className="label light fx">{CH.label}</p>
          <h1>
            <span className="l"><span>{CH.line1}</span></span>
            <span className="l"><span>{CH.line2}</span></span>
            <span className="l"><span className="red">{CH.red}</span></span>
          </h1>
          <p className="lead fx d1">{CH.lead}</p>
          <div className="ctas fx d2">
            <a className="btn btn-red" href="#niveaux">{CH.cta1} <Icon id="arr" /></a>
            <a className="btn btn-line" href="#parcours">
              <span className="play"><svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg></span>{CH.cta2}
            </a>
          </div>
          <ul className="badges fx d3">
            {CH.badges.map((b) => <li key={b.label}><Icon id={b.icon} />{b.label}</li>)}
          </ul>
        </div>
        <div className="c-hero-card">
          <div className="float">
            <Card3D variant="pro" rotRef={rot} className={flipped ? 'flipped' : ''} onClick={() => setFlipped((f) => !f)}
              label={flipped ? 'Carte Pro, verso. Toucher pour voir le recto' : 'Carte Pro, recto. Toucher pour voir le verso'} />
          </div>
          <p className="hint fx d4"><Icon id="i-sync" />{CH.hint}</p>
        </div>
      </div>
    </section>
  );
}
