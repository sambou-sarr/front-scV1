import { useRef } from 'react';
import { A_MANIFESTO } from '../../data/apropos';
import useStickyProgress from '../../hooks/useStickyProgress';
import { cssVars } from '../../lib/css';

/*
  Conviction du catalogue en deux temps, pilotée par le scroll (variable CSS --p) :
  la première phrase apparaît mot à mot, « dépense » est barrée,
  puis la seconde phrase se révèle et « commercial » se souligne en rouge.
  L'opacité de chaque mot est calculée en CSS pur avec clamp() et calc().
*/
const Words = ({ text, start, span, cls = '' }: { text: string; start: number; span: number; cls?: string }) => {
  const w = text.split(' ');
  return w.map((x, i) => (
    <span key={i} className={`mw ${cls}`} style={cssVars({ '--i': i, '--n': w.length, '--s': start, '--d': span })}>{x} </span>
  ));
};

export default function Manifesto() {
  const sec = useRef<HTMLElement>(null);
  useStickyProgress(sec, (p) => sec.current!.style.setProperty('--p', p.toFixed(4)));
  const A = A_MANIFESTO;
  return (
    <section className="mani" ref={sec} style={cssVars({ '--p': 0 })} aria-label={`${A.a1} ${A.a2} ${A.b1} ${A.b2}`}>
      <div className="pin">
        <div className="wrap mani-in">
          <p className="label light">{A.label}</p>
          <p className="mani-l l1" aria-hidden="true"><Words text={A.a1} start={.02} span={.2} /><span className="strike"><Words text={A.a2} start={.2} span={.08} /></span></p>
          <p className="mani-l l2" aria-hidden="true"><Words text={A.b1} start={.44} span={.2} /><span className="uline"><Words text={A.b2} start={.62} span={.08} cls="red" /></span></p>
        </div>
      </div>
    </section>
  );
}
