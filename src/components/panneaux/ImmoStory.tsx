import { useRef, useState } from 'react';
import { P_IMMO } from '../../data/panneaux';
import { Icon } from '../Icons';
import useStickyProgress from '../../hooks/useStickyProgress';

/*
  Panneau immobilier connecté — scène sticky pilotée par le scroll.
  1. La caméra zoome sur le QR du panneau.  2. Le téléphone ouvre la fiche du bien,
  ses rubriques s'allument une à une.  3. Tampon « Vendu » : le lien est réattribué,
  la même page affiche le bien suivant.
*/
const QR = [51.1, 65.5]; // centre du QR sur panneau-immo.webp (%)
const ease = (x: number) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const cl = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

export default function ImmoStory() {
  const [step, setStep] = useState(0), [prop, setProp] = useState(0), [lit, setLit] = useState(-1);
  const sec = useRef<HTMLElement>(null), frame = useRef<HTMLDivElement>(null), img = useRef<HTMLImageElement>(null), phone = useRef<HTMLDivElement>(null), stamp = useRef<HTMLDivElement>(null), ring = useRef<HTMLSpanElement>(null), prog = useRef<HTMLElement>(null);
  const st = useRef({ step: -1, prop: -1, lit: -2 });

  useStickyProgress(sec, (p) => {
    const t = p * 3.2, m = window.innerWidth <= 900;
    const f = frame.current!, W = f.clientWidth, H = f.clientHeight;
    // zoom sur le QR, puis retour à mi-zoom pour montrer le tampon
    const zin = ease(cl(t / .9)), zout = ease(cl((t - 2) / .35));
    const s = 1 + 1.5 * zin - 1.2 * zout;
    const k = zin - zout * .8;
    const tx = (0.5 - QR[0] / 100) * W * k, ty = (0.5 - QR[1] / 100) * H * k;
    img.current!.style.transformOrigin = `${QR[0]}% ${QR[1]}%`;
    img.current!.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    ring.current!.style.opacity = t > .6 && t < 1.2 ? '1' : '0';
    const ph = ease(cl((t - .85) / .35));
    phone.current!.style.opacity = String(ph);
    phone.current!.style.transform = `translate(${(1 - ph) * (m ? 40 : 80)}px, ${(1 - ph) * 20}px) rotate(${(1 - ph) * 6}deg)`;
    stamp.current!.style.opacity = t >= 2.15 ? '1' : '0';
    stamp.current!.classList.toggle('on', t >= 2.15);
    prog.current!.style.transform = `scaleX(${p})`;
    const nStep = t < 1 ? 0 : t < 2.1 ? 1 : 2;
    const nProp = t >= 2.45 ? 1 : 0;
    const nLit = t < 1.15 ? -1 : t >= 2.1 ? 5 : Math.min(4, Math.floor((t - 1.15) / .18));
    if (nStep !== st.current.step) { st.current.step = nStep; setStep(nStep); }
    if (nProp !== st.current.prop) { st.current.prop = nProp; setProp(nProp); }
    if (nLit !== st.current.lit) { st.current.lit = nLit; setLit(nLit); }
  });

  const pr = P_IMMO.props[prop];
  return (
    <section className="immo" id="immobilier" ref={sec}>
      <div className="pin">
        <div className="wrap im-grid">
          <div className="im-head">
            <p className="label">{P_IMMO.label}</p>
            <h2 className="h2">{P_IMMO.title}<br /><em className="red">{P_IMMO.red}</em></h2>
          </div>
          <div className="im-steps" aria-live="polite">
            {P_IMMO.steps.map((s, i) => (
              <div key={s.n} className={`im-step${i === step ? ' on' : ''}`}><span className="n">{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></div>
            ))}
            <div className="j-prog"><i ref={prog} /></div>
          </div>
          <div className="im-stage" aria-hidden="true">
            <div className="im-frame" ref={frame}>
              <img ref={img} src="/images/panneau-immo.webp" alt="" />
              <span className="im-ring" ref={ring} style={{ left: QR[0] + '%', top: QR[1] + '%' }}><i /><i /></span>
              <span className="im-stamp" ref={stamp}>{P_IMMO.sold}</span>
            </div>
            <div className="phone static im-phone" ref={phone} style={{ opacity: 0 }}>
              <div className="screen">
                <div className="isl" />
                <div className={`im-page p${prop}`} key={prop}>
                  <div className={`im-cover c-${pr.cover}`} />
                  <div className="im-title"><span className="im-tag">{pr.tag}</span><b>{pr.name}</b><small>{pr.place}</small></div>
                  <ul>
                    {P_IMMO.rows.map((r, i) => (
                      <li key={r.label} className={i <= lit ? 'lit' : ''}><Icon id={r.icon} /><span>{r.label}</span><em>{r.value}</em></li>
                    ))}
                  </ul>
                  {prop === 1 && <p className="im-re"><Icon id="i-sync" />Lien réattribué</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
