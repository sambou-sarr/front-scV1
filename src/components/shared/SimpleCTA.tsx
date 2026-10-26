import { Icon } from '../Icons';

// CTA de fin de page réutilisable (fond photo ambiance, léger parallaxe CSS).
export interface SimpleCTAProps { label: string; title: string; red: string; text?: string; cta1: string; cta2: string; href1?: string; bg?: string }
export default function SimpleCTA({ label, title, red, text, cta1, cta2, href1 = '/contact', bg }: SimpleCTAProps) {
  return (
    <section className="c-cta">
      <div className="c-cta-bg" aria-hidden="true" style={bg ? { backgroundImage: `url(${bg})`, opacity: .55 } : undefined} />
      <div className="wrap c-cta-in">
        <div className="rv">
          <p className="label light">{label}</p>
          <h2>{title}<br /><em className="red">{red}</em></h2>
          {text && <p>{text}</p>}
        </div>
        <div className="btns rv">
          <a className="btn btn-red" href={href1}>{cta1} <Icon id="arr" /></a>
          <a className="btn btn-line" href="/contact"><Icon id="i-chat" />{cta2}</a>
        </div>
      </div>
    </section>
  );
}
