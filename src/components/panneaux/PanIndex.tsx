import { P_INDEX } from '../../data/panneaux';
import { cssVars } from '../../lib/css';

// Sommaire visuel des 4 formats (ancres vers chaque section).
export default function PanIndex() {
  return (
    <nav className="p-index" id="formats" aria-label="Les formats">
      <div className="wrap p-index-row">
        {P_INDEX.map((f, i) => (
          <a key={f.id} href={`#${f.id}`} className="p-idx rv" style={cssVars({ '--i': i })}>
            <span className="p-idx-img"><img src={f.img} alt="" loading="lazy" /></span>
            <span className="p-idx-n">0{i + 1}</span>
            <b>{f.title}</b>
          </a>
        ))}
      </div>
    </nav>
  );
}
