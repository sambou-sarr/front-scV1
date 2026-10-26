import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import { CC_INDEX } from '../../data/contenu';

// Sommaire visuel : une vignette par pôle, ancre vers la section. Défile à l'horizontale sur mobile.
export default function CcIndex() {
  return (
    <nav className="cc-index" aria-label="Nos prestations">
      <div className="wrap">
        <ol className="cc-index-row">
          {CC_INDEX.map((f, i) => (
            <li key={f.id}>
              <a href={`#${f.id}`} className="cc-idx">
                <span className="cc-idx-img">{f.img ? <Pic img={f.img} sizes="220px" /> : <span className="cc-idx-ai"><Icon id="i-spark" /><i /><i /><i /></span>}</span>
                <span className="cc-idx-n">{String(i + 1).padStart(2, '0')}</span>
                <b>{f.label}</b>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
