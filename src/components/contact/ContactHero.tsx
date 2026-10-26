import { useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, PointerEvent as ReactPointerEvent } from 'react';
import { C_HERO } from '../../data/contact';
import { useContent } from '../../lib/content';
import { Icon } from '../Icons';
import track from '../../utils/track';

/*
  Hero Contact : 4 canaux en cartes « magnétiques » (elles suivent légèrement le pointeur),
  copie en un geste du téléphone et de l'e-mail (Clipboard API) avec confirmation animée.
  « La démonstration » pré-remplit le formulaire (événement lead:preset).
*/
function Magnetic({ children, className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const el = useRef<HTMLDivElement>(null);
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const r = el.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    el.current!.style.transform = `translate(${x * 10}px, ${y * 8}px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
    el.current!.style.setProperty('--gx', `${(x + .5) * 100}%`); el.current!.style.setProperty('--gy', `${(y + .5) * 100}%`);
  };
  const leave = () => { el.current!.style.transform = ''; };
  return <div ref={el} className={className} onPointerMove={move} onPointerLeave={leave} {...rest}>{children}</div>;
}

type Channel = (typeof C_HERO.channels)[number];

export default function ContactHero() {
  const CH = useContent('contact.hero', C_HERO);
  const [go, setGo] = useState(false), [copied, setCopied] = useState<string | null>(null);
  useEffect(() => { const t = setTimeout(() => setGo(true), 60); return () => clearTimeout(t); }, []);

  const copy = async (c: Channel) => {
    try { await navigator.clipboard.writeText(c.copy!); } catch { /* navigateur sans accès presse-papier */ }
    setCopied(c.id); track('contact_copy', { channel: c.id }); setTimeout(() => setCopied(null), 1600);
  };
  const open = (c: Channel) => {
    track(c.id === 'call' ? 'lead_call' : c.id === 'mail' ? 'lead_email' : 'cta_form', { source: 'contact_hero' });
    if (c.preset) window.dispatchEvent(new CustomEvent('lead:preset', { detail: { intent: c.preset } }));
  };

  return (
    <section className={`c-hero ct-hero${go ? ' go' : ''}`}>
      <div className="c-hero-glow" aria-hidden="true" />
      <div className="wrap ct-hero-grid">
        <div>
          <p className="label light fx">{CH.label}</p>
          <h1>
            <span className="l"><span>{CH.line1}</span></span>
            <span className="l"><span><em className="red">{CH.red}</em></span></span>
          </h1>
          <p className="lead fx d1">{CH.lead}</p>
        </div>
        <div className="ct-channels">
          {CH.channels.map((c, i) => (
            <Magnetic key={c.id} className={`ct-ch fx d${Math.min(4, i + 1)}${c.copy ? ' short' : ''}`}>
              <a href={c.href} onClick={() => open(c)} className="ct-ch-main">
                <span className="ct-ch-ic"><Icon id={c.icon} /></span>
                <span className="ct-ch-tx"><b>{c.title}</b><span>{c.value}</span></span>
                <Icon id="arr" />
              </a>
              {c.copy && (
                <button className={`ct-copy${copied === c.id ? ' ok' : ''}`} onClick={() => copy(c)} aria-label={`${CH.copy} ${c.value}`}>
                  {copied === c.id ? <><Icon id="i-check" />{CH.copied}</> : CH.copy}
                </button>
              )}
            </Magnetic>
          ))}
        </div>
      </div>
    </section>
  );
}
