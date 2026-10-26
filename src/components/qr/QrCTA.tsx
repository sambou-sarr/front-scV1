import { Q_CTA } from '../../data/qr';
import { Icon } from '../Icons';

// Étapes « Travailler ensemble » + boutons vers le formulaire de contact (V6 : plus de configurateur).
// delivery : texte de l'étape « La livraison » propre à la page (ex. Branding : sans pose).
export default function QrCTA({ delivery }: { delivery?: string }) {
  const steps = Q_CTA.steps.map((s, i) => (delivery && i === Q_CTA.steps.length - 1 ? { ...s, text: delivery } : s));
  return (
    <section className="c-cta q-cta">
      <div className="c-cta-bg" aria-hidden="true" />
      <div className="wrap">
        <div className="q-cta-head rv">
          <p className="label light">{Q_CTA.label}</p>
          <h2>{Q_CTA.title}<br /><em className="red">{Q_CTA.red}</em></h2>
        </div>
        <ol className="q-steps">
          <span className="rs-line" aria-hidden="true"><i /></span>
          {steps.map((s, i) => (
            <li key={s.title}><span className="qs-n">{i + 1}</span><b>{s.title}</b><p>{s.text}</p></li>
          ))}
        </ol>
        <div className="btns rv">
          <a className="btn btn-red" href="/contact?sujet=demo#formulaire">{Q_CTA.cta1} <Icon id="arr" /></a>
          <a className="btn btn-line" href="/contact#formulaire"><Icon id="i-chat" />{Q_CTA.cta2}</a>
        </div>
      </div>
    </section>
  );
}
