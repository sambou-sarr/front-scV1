import { NAV_FLAT as NAV, FOOTER } from '../data/content';
import { Icon } from './Icons';
import { useContent } from '../lib/content';

// Cahier, section 17. Fond blanc, deux niveaux.
export default function Footer({ current = '/' }: { current?: string }) {
  const F = useContent('global.footer', FOOTER);
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="r1">
          <img src="/images/logo-noir.webp" alt="Support Connecté" width="140" height="44" loading="lazy" />
          <nav aria-label="Navigation du pied de page">
            {NAV.map((n) => <a key={n.href} href={n.href} className={n.href === current ? 'on' : undefined}>{n.label}</a>)}
          </nav>
          <div className="so">
            {F.socials.map((s) => (
              <a key={s.icon} href={s.href} aria-label={s.label}><Icon id={s.icon} /></a>
            ))}
          </div>
        </div>
        <div className="r2">
          <span>{F.copyright} · <a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Confidentialité</a></span>
          <span className="sig">{F.signature.map((w, i) => <span key={w}>{i > 0 && <i>•</i>}{w}</span>)}</span>
          <span className="imp">{F.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
