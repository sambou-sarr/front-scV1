import { B_OBJECTS } from '../../data/branding';
import { cssVars } from '../../lib/css';

// « Plus qu'un objet. Une expérience. » — photo d'ambiance avec repères qui s'allument un à un.
export default function ObjectsBand() {
  return (
    <section className="objs">
      <div className="wrap">
        <div className="rv ob-head">
          <p className="label light">{B_OBJECTS.label}</p>
          <h2 className="h2">{B_OBJECTS.title} <em className="red">{B_OBJECTS.red}</em></h2>
          <p>{B_OBJECTS.text}</p>
        </div>
        <div className="ob-photo rv">
          <img src="/images/ambiance-saly.webp" alt="Casquette, carte, badge, polo, gourde, tote bag et présentoir Support Connecté" loading="lazy" />
          {B_OBJECTS.spots.map((s, i) => (
            <span key={s.label} className={`spot${s.x > 50 ? ' r' : ''}`} style={cssVars({ left: s.x + '%', top: s.y + '%', '--i': i })}><i>{i + 1}</i><b>{s.label}</b></span>
          ))}
        </div>
        <ol className="ob-legend" aria-hidden="true">{B_OBJECTS.spots.map((s) => <li key={s.label}>{s.label}</li>)}</ol>
      </div>
    </section>
  );
}
