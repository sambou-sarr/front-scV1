import { useRef } from 'react';
import { A_VERBS } from '../../data/apropos';
import useViewProgress from '../../hooks/useViewProgress';
import { cssVars } from '../../lib/css';

/*
  Les trois verbes de la marque en typographie géante.
  Les lignes glissent en sens opposé au scroll et le texte se remplit de rouge
  (background-clip: text) au fur et à mesure.
*/
export default function VerbsBand() {
  const sec = useRef<HTMLElement>(null);
  useViewProgress(sec, (p) => sec.current!.style.setProperty('--p', p.toFixed(4)));
  return (
    <section className="verbs" ref={sec} style={cssVars({ '--p': 0 })}>
      {A_VERBS.map((v, i) => (
        <div key={v.verb} className={`vb-row r${i}`}>
          <span className="vb-word" data-t={v.verb}>{v.verb}</span>
          <span className="vb-sub">{v.sub}</span>
        </div>
      ))}
    </section>
  );
}
