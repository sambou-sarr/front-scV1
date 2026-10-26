import { useEffect, useRef, useState } from 'react';
import { JOURNEY, DEMO } from './journeyData';
import { Icon } from '../Icons';
import Card3D from './Card3D';
import { DemoPage } from '../PhoneMockup';

/*
  « Du geste au contact » — séquence 3D pilotée par le scroll (sticky, sans scroll-jacking).
  Étape 1 : la carte fait un tour complet (recto puis verso).
  Étape 2 : elle bascule vers le téléphone, ondes NFC.
  Étape 3 : la page connectée s'ouvre.
  Étape 4 : les actions se déploient autour du téléphone, démonstration de taps.
  Positions : images-clés [t, x, y, z(px), rotX, rotY, rotZ, échelle, opacité], t de 0 à 4.
*/
const CARD_D = [[0,-.1,0,0,8,-22,-4,1,1],[.95,-.1,0,0,8,338,-4,1,1],[1.2,-.1,0,0,8,338,-4,1,1],[1.9,.02,.2,40,58,360,-14,.78,1],[2.2,.02,.2,40,58,360,-14,.78,1],[2.8,-.36,.3,0,20,360,-8,.5,1],[4,-.38,.32,0,20,360,-8,.46,1]];
const CARD_M = [[0,0,-.05,0,8,-22,-4,1,1],[.95,0,-.05,0,8,338,-4,1,1],[1.2,0,-.05,0,8,338,-4,1,1],[1.9,-.08,.26,40,58,360,-14,.72,1],[2.2,-.08,.26,40,58,360,-14,.72,1],[2.8,-.3,.34,0,20,360,-8,.45,0],[4,-.3,.34,0,20,360,-8,.45,0]];
const PH_D = [[1.1,.5,0,0,0,0,0,.9,0],[1.8,.22,-.02,0,0,-10,0,1,1],[2.8,.04,-.02,0,0,0,0,1.02,1],[4,.04,-.02,0,0,0,0,1.02,1]];
const PH_M = [[1.1,.5,-.04,0,0,0,0,.9,0],[1.8,.14,-.06,0,0,-10,0,1,1],[2.8,0,-.04,0,0,0,0,1,1],[4,0,-.04,0,0,0,0,1,1]];
const TILES_D = [[-.24,-.28],[-.27,-.02],[-.24,.24],[.32,-.28],[.35,-.02],[.32,.24]];
const TILES_M = [[-.33,-.3],[-.36,0],[-.33,.3],[.33,-.3],[.36,0],[.33,.3]];

type Key = number[]; // [t, x, y, z, rotX, rotY, rotZ, échelle, opacité]
const ease = (x: number) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
function kf(K: Key[], t: number): number[] {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 0; i < K.length - 1; i++) { const a = K[i], b = K[i + 1]; if (t <= b[0]) { const f = ease((t - a[0]) / (b[0] - a[0])); return a.slice(1).map((v, k) => v + (b[k + 1] - v) * f); } }
  return K[K.length - 1].slice(1);
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function JourneySection() {
  const [step, setStep] = useState(0);
  const sec = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), card = useRef<HTMLDivElement>(null), rot = useRef<HTMLDivElement>(null), phone = useRef<HTMLDivElement>(null), screen = useRef<HTMLDivElement>(null);
  const idle = useRef<HTMLDivElement>(null), read = useRef<HTMLDivElement>(null), page = useRef<HTMLDivElement>(null), waves = useRef<HTMLDivElement>(null), prog = useRef<HTMLElement>(null);
  const tap = useRef<HTMLDivElement>(null), sheet = useRef<HTMLDivElement>(null), sT = useRef<HTMLElement>(null), sS = useRef<HTMLElement>(null);
  const tiles = useRef<(HTMLDivElement | null)[]>([]), acts = useRef<(HTMLLIElement | null)[]>([]), loop = useRef(false), stepRef = useRef(-1);

  useEffect(() => {
    let raf = 0, alive = true;
    const view = (v: HTMLDivElement | null) => { [idle.current, read.current, page.current].forEach((x) => x!.classList.toggle('hide', x !== v)); page.current!.classList.toggle('show', v === page.current); };

    async function taps() {
      let k = 0;
      while (loop.current && alive) {
        const [i, a, b] = DEMO.taps[k % DEMO.taps.length], el = acts.current[i]!;
        const sr = screen.current!.getBoundingClientRect(), er = el.getBoundingClientRect();
        tap.current!.style.left = ((er.left + er.width * .75 - sr.left) / sr.width) * 100 + '%';
        tap.current!.style.top = ((er.top + er.height / 2 - sr.top) / sr.height) * 100 + '%';
        tap.current!.classList.add('on'); await wait(600); if (!loop.current) break;
        tap.current!.classList.add('hit'); el.classList.add('press');
        const tile = tiles.current[DEMO.tileFor[i]]; tile?.classList.add('ping');
        await wait(180); tap.current!.classList.remove('hit'); el.classList.remove('press');
        sT.current!.textContent = a; sS.current!.textContent = b; sheet.current!.classList.add('up');
        await wait(1500); sheet.current!.classList.remove('up'); tile?.classList.remove('ping'); await wait(350); k++;
      }
      tap.current?.classList.remove('on'); sheet.current?.classList.remove('up');
    }

    function frame() {
      const r = sec.current!.getBoundingClientRect(), span = r.height - innerHeight;
      if (r.bottom < 0 || r.top > innerHeight) { loop.current = false; return; }
      const p = clamp(-r.top / span, 0, 1), t = clamp(p * 4.4, 0, 4), m = innerWidth <= 900;
      const w = stage.current!.clientWidth, h = stage.current!.clientHeight;
      stage.current!.style.setProperty('--sw', Math.min(w, h * (m ? 1.05 : 1.7)) + 'px');
      const c = kf(m ? CARD_M : CARD_D, t);
      card.current!.style.transform = `translate(-50%,-50%) translate3d(${c[0] * w}px,${c[1] * h}px,${c[2]}px) scale(${c[6]})`;
      card.current!.style.opacity = String(c[7]);
      rot.current!.style.transform = `rotateX(${c[3]}deg) rotateY(${c[4]}deg) rotateZ(${c[5]}deg)`;
      const ph = kf(m ? PH_M : PH_D, t);
      phone.current!.style.transform = `translate(-50%,-50%) translate(${ph[0] * w}px,${ph[1] * h}px) rotateY(${ph[4]}deg) scale(${ph[6]})`;
      phone.current!.style.opacity = String(ph[7]);
      const reading = t >= 1.95 && t < 2.55;
      waves.current!.classList.toggle('on', t >= 1.85 && t < 2.6);
      phone.current!.classList.toggle('glow', reading);
      view(t < 1.95 ? idle.current : reading ? read.current : page.current);
      const n = t < 2.55 ? 0 : Math.ceil(clamp((t - 2.55) / .35, 0, 1) * acts.current.length);
      acts.current.forEach((a, i) => a!.classList.toggle('in', i < n));
      const tp = m ? TILES_M : TILES_D;
      tiles.current.forEach((el, i) => {
        const f = ease(clamp((t - 3.05 - i * .07) / .35, 0, 1));
        const x = tp[i][0] * f, y = tp[i][1] * f;
        el!.style.transform = `translate(-50%,-50%) translate(${(x + (m ? 0 : .04 * f)) * w}px,${y * h}px) scale(${.4 + .6 * f})`;
        el!.style.opacity = String(f);
      });
      prog.current!.style.transform = `scaleX(${p})`;
      const st = t < 1.1 ? 0 : t < 1.95 ? 1 : t < 3.05 ? 2 : 3;
      if (st !== stepRef.current) { stepRef.current = st; setStep(st); }
      const want = t >= 3.4;
      if (want && !loop.current) { loop.current = true; taps(); }
      if (!want) loop.current = false;
    }
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); frame();
    return () => { alive = false; loop.current = false; cancelAnimationFrame(raf); removeEventListener('scroll', on); removeEventListener('resize', on); };
  }, []);

  return (
    <section className="journey" id="parcours" ref={sec} aria-label={JOURNEY.title + ' ' + JOURNEY.red}>
      <div className="pin">
        <div className="wrap j-grid">
          <div className="j-head">
            <p className="label">{JOURNEY.label}</p>
            <h2 className="h2">{JOURNEY.title}<br /><em className="red">{JOURNEY.red}</em></h2>
          </div>
          <div className="j-foot">
            <div className="j-steps" aria-live="polite">
              {JOURNEY.steps.map((s, i) => (
                <div key={s.n} className={`j-step${i === step ? ' on' : ''}`}>
                  <span className="n">{s.n}</span><h3>{s.title}</h3><p>{s.text}</p>
                </div>
              ))}
            </div>
            <ol className="j-rail" aria-hidden="true">
              {JOURNEY.steps.map((s, i) => <li key={s.n} className={i === step ? 'on' : i < step ? 'done' : ''}>{s.n}</li>)}
            </ol>
            <div className="j-prog"><i ref={prog} /></div>
          </div>

          <div className="j-stage" ref={stage} aria-hidden="true">
            {JOURNEY.tiles.map((tl, i) => (
              <div className="o tile" key={tl.label} ref={(el) => { tiles.current[i] = el; }} style={{ opacity: 0 }}>
                <span className="ti"><Icon id={tl.icon} /></span>{tl.label}
              </div>
            ))}
            <div className="o phone" ref={phone} style={{ opacity: 0 }}>
              <div className="screen" ref={screen}>
                <div className="isl" />
                <div className="view idle" ref={idle}><div className="t">20:14</div><div className="d">samedi 26 septembre</div></div>
                <div className="view reading hide" ref={read}><div className="ic"><Icon id="nfc" /></div><b>Support Connecté détecté</b><small>Ouverture de la page…</small></div>
                <DemoPage className="view hide" ref={page} actRefs={acts}>
                  <div className="tap" ref={tap} />
                  <div className="sheet" ref={sheet}><div className="ok"><Icon id="i-check" /></div><div><b ref={sT} /><small ref={sS} /></div></div>
                </DemoPage>
              </div>
            </div>
            <div className="o j-card" ref={card}>
              <Card3D variant="pro" rotRef={rot} />
              <div className="waves" ref={waves}><i /><i /><i /></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
