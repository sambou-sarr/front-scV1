import { useEffect, useState } from 'react';
import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import { IM_HERO, IM_PROFILES, IMG_IM } from '../../data/immobilier';
import { useContent } from '../../lib/content';
import { quote } from '../devis/quoteStore';

/*
  Hero Immobilier : promesse + accès direct par profil (promoteur, agence, résidence).
  Visuel : la fiche programme sur téléphone devant le chantier et sa bâche (univers de démonstration).
*/
export default function ImHero() {
  const H = useContent('immobilier.hero', IM_HERO) as typeof IM_HERO;
  const [go, setGo] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setGo(true), 60); return () => window.clearTimeout(t); }, []);
  return (
    <section className={`c-hero ix-hero${go ? ' go' : ''}`}>
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap ix-hero-grid">
        <div className="ix-hero-txt">
          <p className="label light fx">{H.label}</p>
          <h1>
            <span className="l"><span>{H.line1}</span></span>
            {H.line2 && <span className="l"><span>{H.line2}</span></span>}
            <span className="l"><span><em className="red">{H.red}</em></span></span>
          </h1>
          <p className="lead fx d1">{H.lead}</p>
          <div className="ctas fx d2">
            <button type="button" className="btn btn-red" onClick={() => quote.open({ pole: 'immobilier', from: 'hero' })}>{H.cta1} <Icon id="arr" /></button>
            <a className="btn btn-line" href="#promoteurs">{H.cta2}</a>
          </div>
          <nav className="ix-who fx d3" aria-label="Vous êtes">
            {IM_PROFILES.map((p) => <a key={p.id} href={`#${p.id}`}><Icon id={p.icon} />{p.title}</a>)}
          </nav>
        </div>
        <figure className="ix-hero-vis">
          <Pic img={IMG_IM.coucher} eager sizes="(max-width: 900px) 92vw, 44vw" />
          <span className="ix-live" aria-hidden="true"><i />{H.badge}</span>
          <figcaption>Univers de démonstration</figcaption>
        </figure>
      </div>
    </section>
  );
}
