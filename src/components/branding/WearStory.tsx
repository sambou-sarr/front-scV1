import { useRef, useState } from 'react';
import { B_STORY } from '../../data/branding';
import useStickyProgress from '../../hooks/useStickyProgress';
import { cssVars } from '../../lib/css';

/*
  « Le logo devant, le QR code au dos » — travelling de caméra piloté par le scroll.
  Pour chaque tenue : vue d'ensemble → zoom sur le logo → panoramique vers le QR
  → le téléphone ouvre la page de la marque. Puis tenue suivante (fondu).
*/
const ease = (x: number) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, f: number) => a + (b - a) * f;

export default function WearStory() {
  const W = B_STORY.wears, N = W.length;
  const [g, setG] = useState(0), [beat, setBeat] = useState(0), [ph, setPh] = useState(false);
  const sec = useRef<HTMLElement>(null), frame = useRef<HTMLDivElement>(null), imgs = useRef<(HTMLImageElement | null)[]>([]), scan = useRef<HTMLSpanElement>(null), prog = useRef<HTMLElement>(null);
  const st = useRef<{ g: number; beat: number; ph: boolean | null }>({ g: -1, beat: -1, ph: null });

  useStickyProgress(sec, (p) => {
    const t = p * N * 2 * 1.04, gi = Math.min(N - 1, Math.floor(t / 2)), u = cl(t - gi * 2, 0, 2);
    const w = W[gi], F = frame.current!, FW = F.clientWidth, FH = F.clientHeight;
    const m = window.innerWidth <= 900;
    const zoom = m ? 1.9 : 2.1;
    // 0 → .8 : vue d'ensemble → logo ; 1.1 → 1.8 : logo → QR
    const a = ease(cl(u / .8)), b = ease(cl((u - 1.1) / .7));
    const px = lerp(lerp(50, w.logo[0], a), w.qr[0], b), py = lerp(lerp(50, w.logo[1], a), w.qr[1], b);
    const s = lerp(1, zoom, a) + (b * .25);
    const k = a;
    const tx = (50 - px) / 100 * FW * k, ty = (50 - py) / 100 * FH * k;
    imgs.current.forEach((im, i) => {
      if (!im) return;
      im.style.opacity = i === gi ? '1' : '0';
      if (i === gi) { im.style.transformOrigin = `${px}% ${py}%`; im.style.transform = `translate(${tx}px,${ty}px) scale(${s})`; }
    });
    scan.current!.style.opacity = u > 1.55 ? '1' : '0';
    prog.current!.style.transform = `scaleX(${p})`;
    const nBeat = u < 1.1 ? 0 : 1, nPh = u > 1.6;
    if (gi !== st.current.g) { st.current.g = gi; setG(gi); }
    if (nBeat !== st.current.beat) { st.current.beat = nBeat; setBeat(nBeat); }
    if (nPh !== st.current.ph) { st.current.ph = nPh; setPh(nPh); }
  });

  const w = W[g];
  return (
    <section className="wear" id="tenues" ref={sec} style={{ height: `${N * 170 + 100}vh` }}>
      <div className="pin">
        <div className="wrap we-grid">
          <div className="we-head">
            <p className="label">{B_STORY.label}</p>
            <h2 className="h2">{B_STORY.title}<br /><em className="red">{B_STORY.red}</em></h2>
          </div>
          <div className="we-txt" aria-live="polite">
            <ol className="we-tabs" aria-hidden="true">{W.map((x, i) => <li key={x.id} className={i === g ? 'on' : i < g ? 'done' : ''}>{x.name}</li>)}</ol>
            <p className="we-line" key={w.id + beat}>{beat === 0 ? w.a : <>{w.a} <em className="red">{w.b}</em></>}</p>
            <p className="we-use">{w.use}</p>
            <div className="j-prog"><i ref={prog} /></div>
          </div>
          <div className="we-stage" aria-hidden="true">
            <div className="we-frame" ref={frame}>
              {W.map((x, i) => <img key={x.id} ref={(el) => { imgs.current[i] = el; }} src={x.img} alt="" style={{ opacity: i === 0 ? 1 : 0 }} />)}
              <span className="we-scan" ref={scan}><i /><i /><i /><i /></span>
            </div>
            <div className={`phone static we-phone${ph ? ' on' : ''}`}>
              <div className="screen">
                <div className="isl" />
                <div className="we-page" key={w.id} style={cssVars({ '--bc': w.page.color })}>
                  <p className="we-brand"><b>{w.page.brand}</b><small>{w.page.sub}</small></p>
                  {w.page.actions.map((a) => <span key={a} className="we-act">{a}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
