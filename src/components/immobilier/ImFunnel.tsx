import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icons';
import { IM_FUNNEL } from '../../data/immobilier';
import { cssVars } from '../../lib/css';

/*
  Tunnel de vente du promoteur : six étapes reliées, puis le compte rendu mensuel par support
  (barres animées à l'apparition). Chiffres d'exemple, signalés comme tels.
*/
export default function ImFunnel() {
  const F = IM_FUNNEL;
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, []);
  const max = Math.max(...F.board.rows.map((r) => r.scans));
  const tot = F.board.rows.reduce((a, r) => ({ scans: a.scans + r.scans, leads: a.leads + r.leads }), { scans: 0, leads: 0 });
  return (
    <section className="ix-funnel" id="tunnel">
      <div className="wrap">
        <div className="ix-funnel-head">
          <div className="rv">
            <p className="label light">{F.label}</p>
            <h2 className="h2">{F.title} <em className="red">{F.red}</em></h2>
          </div>
          <p className="cc-lead rv">{F.text}</p>
        </div>
        <ol className="ix-steps">
          {F.steps.map((s, i) => (
            <li key={s.title} className="rv" style={cssVars({ '--i': i })}>
              <span className="ix-step-ic"><Icon id={s.icon} /></span>
              <b>{s.title}</b>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <div className={`ix-report${on ? ' on' : ''}`} ref={box}>
          <header><b>{F.board.title}</b><span>{F.board.tag}</span></header>
          <div className="ix-rep-h" aria-hidden="true"><span /><span>{F.board.cols[0]}</span><span>{F.board.cols[1]}</span></div>
          <ul>
            {F.board.rows.map((r, i) => (
              <li key={r.label} style={cssVars({ '--w': `${(r.scans / max) * 100}%`, '--i': i })}>
                <span className="ix-rep-l">{r.label}<i aria-hidden="true"><em /></i></span>
                <span className="ix-rep-n">{r.scans}</span>
                <span className="ix-rep-n red">{r.leads}</span>
              </li>
            ))}
          </ul>
          <footer><span>Total</span><span className="ix-rep-n">{tot.scans}</span><span className="ix-rep-n red">{tot.leads}</span></footer>
        </div>
      </div>
    </section>
  );
}
