import { useEffect, useRef, useState } from 'react';
import { PROCESS } from '../../data/content';
import { H_PROCESS } from '../../data/home';
import { Icon } from '../Icons';
import { DemoPage } from '../PhoneMockup';
import { cssVars } from '../../lib/css';

/*
  « Du support physique à l'action. » — frise à faire glisser (curseur natif <input type="range">,
  donc clavier et lecteurs d'écran compris). Lecture automatique quand la section est visible,
  qui s'arrête dès que le visiteur prend la main. Pas de défilement détourné.
*/
const MAX = 400, SEG = MAX / 4;

export default function ProcessScrubber() {
  const [v, setV] = useState(0);
  const sec = useRef<HTMLElement>(null), user = useRef(false);
  const step = Math.min(3, Math.floor(v / SEG));
  const s = PROCESS.steps[step];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, vis = false, last = 0;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: .35 });
    io.observe(sec.current!);
    const tick = (t: number) => {
      if (vis && !user.current) {
        const dt = last ? Math.min(64, t - last) : 16;
        setV((x) => { const f = x % SEG; const slow = f > SEG * .25 && f < SEG * .95 ? .018 : .09; const n = x + dt * slow; return n >= MAX ? 0 : n; });
      }
      last = t; raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, []);

  const take = () => { user.current = true; };
  const goStep = (i: number) => { take(); setV(i * SEG + SEG / 2); };

  return (
    <section className="h2-process" ref={sec}>
      <div className="wrap">
        <div className="rv"><p className="label">{PROCESS.label}</p><h2 className="h2">{PROCESS.title}</h2></div>

        <div className="pr-grid2">
          <div className="pr-scene" aria-hidden="true">
            <div className={`pl pl0${step === 0 ? ' on' : ''}`}>
              {H_PROCESS.choose.map((c, i) => (
                <span key={c.label} className={`pl0-it${i === 0 ? ' pick' : ''}`} style={cssVars({ '--i': i })}>
                  <img src={c.img} alt="" loading="lazy" /><b>{c.label}</b>{i === 0 && <em><Icon id="i-check" /></em>}
                </span>
              ))}
            </div>
            <div className={`pl pl1${step === 1 ? ' on' : ''}`}>
              <img className="pl1-card" src="/images/main-carte-detouree.webp" alt="" loading="lazy" />
              {H_PROCESS.chips.map((c, i) => <span key={c} className={`pl-chip c${i}`} style={cssVars({ '--i': i })}><b />{c}</span>)}
            </div>
            <div className={`pl pl2${step === 2 ? ' on' : ''}`}>
              <img className="pl2-card" src="/images/main-carte-detouree.webp" alt="" loading="lazy" />
              <span className="pl2-waves"><i /><i /><i /></span>
              <div className="phone static pl-phone"><div className="screen"><div className="isl" /><div className="pl2-read"><span><Icon id="nfc" /></span><b>Support Connecté détecté</b></div></div></div>
            </div>
            <div className={`pl pl3${step === 3 ? ' on' : ''}`}>
              <div className="phone static pl-phone"><div className="screen"><div className="isl" /><DemoPage className="show" /></div></div>
              {H_PROCESS.actions.map((a, i) => <span key={a} className={`pl-act a${i}`} style={cssVars({ '--i': i })}><Icon id={['i-phone', 'i-cal', 'i-cart', 'i-star'][i]} />{a}</span>)}
            </div>
            <p className={`pl-note${step === 3 ? ' on' : ''}`}>{PROCESS.noteStart}<u>{PROCESS.noteUnderline}</u></p>
          </div>

          <div className="pr-ctrl">
            <div className="pr-nodes">
              {PROCESS.steps.map((x, i) => (
                <button key={x.n} className={`pr-node${i === step ? ' on' : i < step ? ' done' : ''}`} onClick={() => goStep(i)} aria-label={`${x.n} ${x.title}`}>
                  <span><Icon id={x.icon} /></span>
                </button>
              ))}
            </div>
            <input className="pr-range" type="range" min="0" max={MAX} step="1" value={v} style={cssVars({ '--p': v / MAX })}
              onChange={(e) => { take(); setV(Number(e.target.value)); }} onPointerDown={take}
              aria-label="Étapes : du support physique à l’action" aria-valuetext={`${s.n} ${s.title}`} />
            <p className="pr-hint">{H_PROCESS.hint}</p>
            <div className="pr-text" key={step} aria-live="polite">
              <span className="pr-n">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.sub}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
