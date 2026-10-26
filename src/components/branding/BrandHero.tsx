import { useEffect, useRef, useState } from 'react';
import { B_HERO, B_STORY } from '../../data/branding';
import { Icon } from '../Icons';

/*
  Hero Branding : le polo, avec deux repères animés « Logo devant » / « QR au dos »
  (cadre de scan qui se dessine), inclinaison au pointeur.
*/
export default function BrandHero() {
  const [go, setGo] = useState(false);
  const zone = useRef<HTMLElement>(null), vis = useRef<HTMLDivElement>(null);
  const w = B_STORY.wears[1];
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const el = zone.current!, v = vis.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const tick = () => {
      cx += (tx - cx) * .07; cy += (ty - cy) * .07;
      v.style.transform = `rotateY(${cx * 10}deg) rotateX(${-cy * 8}deg)`;
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .001 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => { const b = el.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width - .5; ty = (e.clientY - b.top) / b.height - .5; if (!raf) raf = requestAnimationFrame(tick); };
    const leave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(tick); };
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(raf); el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <section className={`c-hero b-hero${go ? ' go' : ''}`} ref={zone}>
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap b-hero-grid">
        <div>
          <p className="label light fx">{B_HERO.label}</p>
          <h1>
            <span className="l"><span>{B_HERO.line1}</span></span>
            <span className="l"><span><em className="red">{B_HERO.red}</em></span></span>
          </h1>
          <p className="lead fx d1">{B_HERO.lead}</p>
          <div className="ctas fx d2">
            <a className="btn btn-red" href="/contact">{B_HERO.cta1} <Icon id="arr" /></a>
            <a className="btn btn-line" href="#tenues">{B_HERO.cta2}</a>
          </div>
          <ul className="badges fx d3">{B_HERO.badges.map((b) => <li key={b.label}><Icon id={b.icon} />{b.label}</li>)}</ul>
        </div>
        <div className="b-hero-vis">
          <div className="b-tilt" ref={vis}>
            <img src={w.img} alt="Polo Atelier Kanël, logo devant et QR code au dos" />
            <span className="b-mark front" style={{ left: w.logo[0] + '%', top: w.logo[1] + '%' }}><i /><b>{B_HERO.front}</b></span>
            <span className="b-mark back" style={{ left: w.qr[0] + '%', top: w.qr[1] + '%' }}><i /><b>{B_HERO.back}</b></span>
          </div>
        </div>
      </div>
    </section>
  );
}
