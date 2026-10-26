import { C_CTA } from '../../data/cartes';
import { Icon } from '../Icons';

export default function CardsCTA() {
  return (
    <section className="c-cta">
      <div className="c-cta-bg" aria-hidden="true" />
      <div className="wrap c-cta-in">
        <div className="rv">
          <p className="label light">{C_CTA.label}</p>
          <h2>{C_CTA.title}<br /><em className="red">{C_CTA.red}</em></h2>
          <p>{C_CTA.text}</p>
        </div>
        <div className="btns rv">
          <a className="btn btn-red" href="#niveaux">{C_CTA.cta1} <Icon id="arr" /></a>
          <a className="btn btn-line" href="/contact"><Icon id="i-chat" />{C_CTA.cta2}</a>
        </div>
      </div>
    </section>
  );
}
