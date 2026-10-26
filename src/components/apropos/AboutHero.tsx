import { useEffect, useState } from 'react';
import { A_HERO } from '../../data/apropos';
import { Icon } from '../Icons';
import ParticleLogo from './ParticleLogo';

export default function AboutHero() {
  const [go, setGo] = useState(false);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);
  return (
    <section className={`c-hero a-hero${go ? ' go' : ''}`} id="top">
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap a-hero-grid">
        <div>
          <p className="label light fx">{A_HERO.label}</p>
          <h1>
            <span className="l"><span>{A_HERO.line1}</span></span>
            <span className="l"><span><em className="red">{A_HERO.red}</em></span></span>
          </h1>
          <p className="lead fx d1">{A_HERO.lead}</p>
          <div className="ctas fx d2">
            <a className="btn btn-red" href="#diagnostic">{A_HERO.cta1} <Icon id="arr" /></a>
            <a className="btn btn-line" href="#contact">{A_HERO.cta2}</a>
          </div>
          <ul className="badges fx d3">{A_HERO.chips.map((c, i) => <li key={c}><Icon id={['i-pin', 'i-doc', 'i-mob'][i]} />{c}</li>)}</ul>
        </div>
        <div className="a-hero-vis">
          <ParticleLogo />
          <p className="a-scan"><b>{A_HERO.scan}</b><span>{A_HERO.hint}</span></p>
        </div>
      </div>
    </section>
  );
}
