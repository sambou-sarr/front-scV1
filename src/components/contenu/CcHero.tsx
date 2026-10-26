import { useEffect, useState } from 'react';
import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import { CC_HERO, IMG } from '../../data/contenu';
import { useContent } from '../../lib/content';
import { quote } from '../devis/quoteStore';

// Compteur « REC » du visuel principal : composant isolé pour ne pas redessiner tout le hero chaque seconde.
function Rec() {
  const [t, setT] = useState(12);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setT((x) => (x + 1) % 3600), 1000);
    return () => window.clearInterval(id);
  }, []);
  const mm = String(Math.floor(t / 60)).padStart(2, '0'), ss = String(t % 60).padStart(2, '0');
  return <span className="cc-rec"><i />REC <b>00:{mm}:{ss}</b></span>;
}

/*
  Hero de la page Création de contenu : texte à gauche, planche de tournage à droite
  (vidéo en cours, home staging, impression). Entrée animée, puis légère flottaison (désactivée si
  l'utilisateur a demandé moins d'animations).
*/
export default function CcHero() {
  const H = useContent('contenu.hero', CC_HERO) as typeof CC_HERO;
  const [go, setGo] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setGo(true), 60); return () => window.clearTimeout(t); }, []);
  return (
    <section className={`c-hero cc-hero${go ? ' go' : ''}`}>
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap cc-hero-grid">
        <div className="cc-hero-txt">
          <p className="label light fx">{H.label}</p>
          <h1>
            <span className="l"><span>{H.line1}</span></span>
            <span className="l"><span>{H.line2}</span></span>
            <span className="l"><span><em className="red">{H.red}</em></span></span>
          </h1>
          <p className="lead fx d1">{H.lead}</p>
          <div className="ctas fx d2">
            <button type="button" className="btn btn-red" onClick={() => quote.open({ pole: 'contenu', from: 'hero' })}>{H.cta1} <Icon id="arr" /></button>
            <a className="btn btn-line" href="#exemples">{H.cta2}</a>
          </div>
          <ul className="badges fx d3">{H.chips.map((c, i) => <li key={c}><Icon id={['i-mic', 'i-cube', 'i-sofa'][i] ?? 'i-check'} />{c}</li>)}</ul>
        </div>
        <div className="cc-hero-vis" aria-hidden="true">
          <figure className="cc-hv cc-hv-main">
            <Pic img={IMG.presentatrice} eager sizes="(max-width: 900px) 92vw, 46vw" />
            <Rec />
            <span className="cc-frame" />
          </figure>
          <figure className="cc-hv cc-hv-a">
            <Pic img={IMG.homeStaging} sizes="(max-width: 900px) 46vw, 22vw" />
            <figcaption><Icon id="i-sofa" />Home staging</figcaption>
          </figure>
          <figure className="cc-hv cc-hv-b">
            <Pic img={IMG.showroom} sizes="(max-width: 900px) 46vw, 22vw" />
            <figcaption><Icon id="i-print" />Impression</figcaption>
          </figure>
          <span className="cc-chip cc-chip-1"><Icon id="i-mic" />Voix off FR · WO · EN</span>
          <span className="cc-chip cc-chip-2"><Icon id="i-cube" />Visite 360°</span>
        </div>
      </div>
    </section>
  );
}
