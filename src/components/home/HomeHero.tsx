import { useEffect, useRef, useState } from 'react';
import { HERO } from '../../data/content';
import { useContent } from '../../lib/content';
import { H_SCENE } from '../../data/home';
import { Icon } from '../Icons';
import { DemoPage } from '../PhoneMockup';
import { cssVars } from '../../lib/css';

/*
  Hero V2 — « Redéfinissons vôtre relation client. »
  Scène de convergence : la carte, le sticker, le chevalet et le polo ouvrent TOUS
  la même page. Un faisceau part du support actif vers le téléphone, qui affiche
  « Ouvert depuis : … ». Profondeur au pointeur (chaque support selon sa profondeur).
  Survol d'un support : il prend la main. Pause hors écran, mouvement réduit respecté.
*/
export default function HomeHero() {
  const HERO_ = useContent('home.hero', HERO);
  const [go, setGo] = useState(false), [cur, setCur] = useState(0), [flash, setFlash] = useState(0);
  const zone = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), hold = useRef(0), vis = useRef(true);
  const S = H_SCENE.supports;

  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => { vis.current = e.isIntersecting; }, { threshold: .1 });
    io.observe(stage.current!);
    const id = setInterval(() => {
      if (!vis.current || Date.now() < hold.current) return;
      setCur((c) => (c + 1) % S.length); setFlash((f) => f + 1);
    }, 2600);
    return () => { clearInterval(id); io.disconnect(); };
  }, [S.length]);

  useEffect(() => {
    const el = zone.current!, st = stage.current!;
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

  const pick = (i: number) => { hold.current = Date.now() + 6000; if (i !== cur) { setCur(i); setFlash((f) => f + 1); } };

  return (
    <section className={`c-hero h2-hero${go ? ' go' : ''}`} ref={zone} id="top">
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap h2-grid">
        <div className="h2-txt">
          <p className="h2-kick fx">{HERO_.kicker.map((k, i) => <span key={k}>{i > 0 && <i>•</i>}{k}</span>)}</p>
          <h1>
            <span className="l"><span>{HERO_.line1}</span></span>
            <span className="l"><span>{HERO_.line2Start}<span className="red">{HERO_.line2Red}</span></span></span>
          </h1>
          <p className="lead fx d1">{HERO_.lead}</p>
          <div className="ctas fx d2">
            <a className="btn btn-red" href="#approche">{HERO_.cta1} <Icon id="arr" /></a>
            <a className="btn btn-line" href="#video"><span className="play"><svg viewBox="0 0 10 12"><path d="M0 0l10 6-10 6z" fill="currentColor" /></svg></span>{HERO_.cta2}</a>
          </div>
          <div className="pillars fx d3">
            {HERO_.pillars.map((p) => <div className="pillar" key={p.title}><Icon id={p.icon} /><div><b>{p.title}</b><span>{p.sub}</span></div></div>)}
          </div>
        </div>

        <div className="hv-stage" ref={stage} aria-label="Carte, sticker, chevalet et polo ouvrent la même page connectée">
          <svg className="hv-beams" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {S.map((s, i) => <line key={s.id + (i === cur ? flash : '')} x1={s.cx} y1={s.cy} x2="50" y2="50" pathLength="1" className={i === cur ? 'on' : ''} />)}
          </svg>
          {S.map((s, i) => (
            <button key={s.id} className={`hv-sup${i === cur ? ' on' : ''}${s.x > 50 ? ' r' : ''}`} onMouseEnter={() => pick(i)} onFocus={() => pick(i)} onClick={() => pick(i)}
              style={cssVars({ left: s.x + '%', top: s.y + '%', width: s.w + '%', '--d': s.d, '--i': i })} aria-label={s.label}>
              <img src={s.img} alt="" draggable="false" />
              <span className="hv-tag">{s.label}</span>
            </button>
          ))}
          <div className={`phone static hv-phone${flash ? ' ping' : ''}`} key={'p' + flash} aria-hidden="true">
            <div className="screen">
              <div className="isl" />
              <DemoPage className="show" />
            </div>
          </div>
          <span className="hv-from" key={'f' + cur} aria-live="polite"><Icon id="i-scan" />{H_SCENE.from} : <b>{S[cur].label}</b></span>
        </div>
      </div>
      <a className="h2-scroll" href="#approche" aria-label="Descendre"><span /></a>
    </section>
  );
}
