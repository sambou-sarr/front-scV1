import { useEffect, useRef, useState } from 'react';
import { P_HERO } from '../../data/panneaux';
import { Icon } from '../Icons';
import { cssVars } from '../../lib/css';

/*
  Hero Panneaux & bâches : collage en profondeur des 4 formats.
  Chaque calque bouge selon sa profondeur (--d) : au pointeur (JS, rAF)
  et au scroll (CSS scroll-driven animations, repli automatique).
*/
const LAYERS = [
  { img: '/images/panneau-accueil.webp', cls: 'l-accueil', d: .35, alt: 'Panneau d’accueil hôtel avec huit QR codes' },
  { img: '/images/bache.webp', cls: 'l-bache', d: .55, alt: 'Bâche grand format À vendre avec QR code' },
  { img: '/images/panneau-immo.webp', cls: 'l-immo', d: .8, alt: 'Panneau immobilier connecté À vendre' },
  { img: '/images/chevalet.webp', cls: 'l-chevalet', d: 1.1, alt: 'Chevalet trottoir menu digital' },
];

export default function PanHero() {
  const [go, setGo] = useState(false);
  const zone = useRef<HTMLElement>(null), stack = useRef<HTMLDivElement>(null);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const el = zone.current!, st = stack.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const tick = () => {
      cx += (tx - cx) * .07; cy += (ty - cy) * .07;
      st.style.setProperty('--mx', cx.toFixed(3)); st.style.setProperty('--my', cy.toFixed(3));
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => { const b = el.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width - .5; ty = (e.clientY - b.top) / b.height - .5; if (!raf) raf = requestAnimationFrame(tick); };
    const leave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <section className={`c-hero p-hero${go ? ' go' : ''}`} ref={zone}>
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap p-hero-grid">
        <div className="p-hero-txt">
          <p className="label light fx">{P_HERO.label}</p>
          <h1>
            <span className="l"><span>{P_HERO.line1}</span></span>
            <span className="l"><span><em className="red">{P_HERO.red}</em></span></span>
          </h1>
          <p className="lead fx d1">{P_HERO.lead}</p>
          <div className="ctas fx d2">
            <a className="btn btn-red" href="/contact">{P_HERO.cta1} <Icon id="arr" /></a>
            <a className="btn btn-line" href="#formats">{P_HERO.cta2}</a>
          </div>
          <ul className="badges fx d3">{P_HERO.badges.map((b) => <li key={b.label}><Icon id={b.icon} />{b.label}</li>)}</ul>
        </div>
        <div className="p-stack" ref={stack}>
          {LAYERS.map((l, i) => (
            <div key={l.cls} className={`p-layer ${l.cls}`} style={cssVars({ '--d': l.d, '--i': i })}>
              <img src={l.img} alt={l.alt} draggable="false" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
