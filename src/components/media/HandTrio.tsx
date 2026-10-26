import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Icon } from '../Icons';
import { cssVars } from '../../lib/css';

/*
  Trois mains, trois niveaux (photos fournies). Les cartes montent en cascade à l'arrivée,
  s'inclinent sous le pointeur ; un clic ouvre le configurateur sur le bon niveau.
*/
const ITEMS = [
  { tier: 'essentielle', img: '/images/main-carte-essentielle.webp', name: 'Essentielle', text: 'Le design Support Connecté. Vos coordonnées en un scan.' },
  { tier: 'pro', img: '/images/main-carte-pro.webp', name: 'Pro', text: 'Votre nom sur la carte. Vos liens, vos photos, vos avis.', },
  { tier: 'signature', img: '/images/main-carte-signature.webp', name: 'Signature', text: 'Design sur mesure, finitions premium.', gold: true },
];

interface HandTrioProps { label?: string; title?: string; red?: string }

export default function HandTrio({ label = 'Trois niveaux', title = 'Elle tient dans la main.', red = 'Elle ouvre tout le reste.' }: HandTrioProps) {
  const sec = useRef<HTMLElement>(null), [inView, setIn] = useState(false);
  useEffect(() => { const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect(); } }, { threshold: .2 }); io.observe(sec.current!); return () => io.disconnect(); }, []);
  const tilt = (e: ReactPointerEvent<HTMLButtonElement>) => { if (window.matchMedia('(hover: none)').matches) return; const el = e.currentTarget, r = el.getBoundingClientRect(); el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 10}deg`); el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - .5) * 8}deg`); };
  const reset = (e: ReactPointerEvent<HTMLButtonElement>) => { e.currentTarget.style.setProperty('--ry', '0deg'); e.currentTarget.style.setProperty('--rx', '0deg'); };
  const open = (t: string) => { window.dispatchEvent(new CustomEvent('studio:tier', { detail: t })); document.getElementById('creer-ma-carte')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  return (
    <section className={`htrio${inView ? ' in' : ''}`} ref={sec}>
      <div className="wrap">
        <p className="label light">{label}</p>
        <h2 className="h2">{title} <em className="red">{red}</em></h2>
        <div className="htrio-grid">
          {ITEMS.map((x, i) => (
            <button key={x.tier} className={`hcard${x.gold ? ' gold' : ''}`} style={cssVars({ '--i': i })} onPointerMove={tilt} onPointerLeave={reset} onClick={() => open(x.tier)}>
              <img src={x.img} alt={`Carte ${x.name} Support Connecté tenue en main`} loading="lazy" />
              <span className="hc-tx"><b>{x.name}</b><span>{x.text}</span><em>Composer la mienne <Icon id="arr" /></em></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
