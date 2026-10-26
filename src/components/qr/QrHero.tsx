import { useEffect, useRef, useState } from 'react';
import { Q_HERO, Q_STICKERS } from '../../data/qr';
import { Icon } from '../Icons';

/*
  Hero QR Smart : carrousel 3D des stickers (CSS preserve-3d).
  Rotation automatique lente, glisser au doigt ou à la souris avec inertie.
  Le sticker de face est mis en avant (netteté, taille), les autres s'estompent.
*/
export default function QrHero() {
  const [go, setGo] = useState(false);
  const [front, setFront] = useState(0);
  const ring = useRef<HTMLDivElement>(null), zone = useRef<HTMLDivElement>(null);
  const N = Q_STICKERS.length, STEP = 360 / N;

  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const el = zone.current!, r = ring.current!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let a = 0, v = reduce ? 0 : -0.12, drag = false, lx = 0, raf = 0, last = -1;
    const tick = () => {
      if (!drag) { a += v; v += ((reduce ? 0 : -0.12) - v) * 0.02; }
      r.style.transform = `translateZ(calc(var(--R) * -1)) rotateX(-6deg) rotateY(${a}deg)`;
      const f = ((Math.round(-a / STEP) % N) + N) % N;
      if (f !== last) { last = f; setFront(f); }
      raf = requestAnimationFrame(tick);
    };
    const down = (e: PointerEvent) => { drag = true; lx = e.clientX; el.setPointerCapture?.(e.pointerId); };
    const move = (e: PointerEvent) => { if (!drag) return; const dx = e.clientX - lx; lx = e.clientX; a += dx * 0.35; v = dx * 0.35; };
    const up = () => { drag = false; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, [N, STEP]);

  return (
    <section className={`c-hero q-hero${go ? ' go' : ''}`}>
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap q-hero-grid">
        <div className="q-hero-txt">
          <p className="label light fx">{Q_HERO.label}</p>
          <h1>
            <span className="l"><span>{Q_HERO.line1}</span></span>
            <span className="l"><span><em className="red">{Q_HERO.red}</em></span></span>
          </h1>
          <p className="lead fx d1">{Q_HERO.lead}</p>
          <div className="ctas fx d2">
            <a className="btn btn-red" href="/contact?sujet=qr#formulaire">{Q_HERO.cta1} <Icon id="arr" /></a>
            <a className="btn btn-line" href="#usages">{Q_HERO.cta2}</a>
          </div>
          <ul className="badges fx d3">{Q_HERO.badges.map((b) => <li key={b.label}><Icon id={b.icon} />{b.label}</li>)}</ul>
        </div>

        <div className="q-carousel" ref={zone} aria-roledescription="carrousel" aria-label="Les stickers QR Smart">
          <div className="q-scene">
            <div className="q-ring" ref={ring}>
              {Q_STICKERS.map((s, i) => (
                <div key={s.id} className={`q-item${i === front ? ' front' : ''}`} style={{ transform: `rotateY(${i * STEP}deg) translateZ(var(--R))` }}>
                  <img src={s.img} alt={s.label} draggable="false" />
                </div>
              ))}
            </div>
          </div>
          <p className="q-now" aria-live="polite"><b>{Q_STICKERS[front].label}</b><span>{Q_STICKERS[front].text}</span></p>
          <p className="hint fx d4"><Icon id="i-sync" />{Q_HERO.hint}</p>
        </div>
      </div>
    </section>
  );
}
