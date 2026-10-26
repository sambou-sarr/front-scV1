import { Icon } from '../Icons';
import { IM_PROFILES } from '../../data/immobilier';
import { cssVars } from '../../lib/css';

// Trois portes d'entrée : chaque profil renvoie vers sa section.
export default function ImProfiles() {
  return (
    <section className="ix-profiles" aria-label="Votre profil">
      <div className="wrap ix-prof-grid">
        {IM_PROFILES.map((p, i) => (
          <a key={p.id} href={`#${p.id}`} className="ix-prof rv" style={cssVars({ '--i': i })}>
            <span className="ix-prof-ic"><Icon id={p.icon} /></span>
            <b>{p.title}</b>
            <span>{p.text}</span>
            <ul>{p.points.map((x) => <li key={x}>{x}</li>)}</ul>
            <em>Voir l’offre <Icon id="arr" /></em>
          </a>
        ))}
      </div>
    </section>
  );
}
