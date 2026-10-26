import { RESULTS } from '../../data/cartes';
import { Icon } from '../Icons';
import { cssVars } from '../../lib/css';

// « Plus qu'un contact » — la ligne rouge se remplit avec le scroll (animation-timeline: view()).
export default function ResultsSection() {
  return (
    <section className="results">
      <div className="wrap rs-grid">
        <div className="rv">
          <p className="label">{RESULTS.label}</p>
          <h2 className="h2">{RESULTS.title[0]}<br />{RESULTS.title[1]}</h2>
        </div>
        <ol className="rs-flow">
          <span className="rs-line" aria-hidden="true"><i /></span>
          {RESULTS.steps.map((s, i) => (
            <li key={s.title} style={cssVars({ '--i': i })}>
              <span className="rs-ic"><Icon id={s.icon} /></span>
              <b>{s.title}</b><p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
