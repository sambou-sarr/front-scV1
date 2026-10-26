import { Icon } from '../Icons';
import { conseiller } from '../../data/conseiller';
import { quote } from '../devis/quoteStore';
import track from '../../utils/track';
import type { QuotePreset } from '../../types/v5';

// Appel à l'action de fin de page (mêmes classes que SimpleCTA) : ouvre le formulaire de devis au lieu d'une autre page.
// Second bouton : WhatsApp du conseiller si data/conseiller.ts est renseigné, sinon appel du standard.
export default function CtaBand({ label, title, red, text, cta1, cta2, bg, preset, wa }: {
  label: string; title: string; red: string; text?: string; cta1: string; cta2: string; bg?: string; preset: QuotePreset; wa: string;
}) {
  const c = conseiller(wa);
  return (
    <section className="c-cta">
      <div className="c-cta-bg" aria-hidden="true" style={bg ? { backgroundImage: `url(${bg})`, opacity: 0.55 } : undefined} />
      <div className="wrap c-cta-in">
        <div className="rv">
          <p className="label light">{label}</p>
          <h2>{title}<br /><em className="red">{red}</em></h2>
          {text && <p>{text}</p>}
        </div>
        <div className="btns rv">
          <button type="button" className="btn btn-red" onClick={() => quote.open({ ...preset, from: 'cta-fin' })}>{cta1} <Icon id="arr" /></button>
          <a className="btn btn-line" href={c.href} {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
            onClick={() => track(c.external ? 'lead_whatsapp' : 'lead_call', { from: 'cta-fin', pole: preset.pole ?? '' })}>
            <Icon id={c.icon} />{c.external ? cta2 : c.label}
          </a>
        </div>
      </div>
    </section>
  );
}
