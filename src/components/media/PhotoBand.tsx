import { useEffect, useRef, useState } from 'react';
import useViewProgress from '../../hooks/useViewProgress';
import { cssVars } from '../../lib/css';

/*
  Bandeau photo animé : zoom et parallaxe liés au défilement (PC), panoramique lent (mobile),
  repères qui s'allument quand le bandeau entre à l'écran. Réutilisable sur toutes les pages.

  V6 :
  - Les repères sont placés EN % DE L'IMAGE (pas du cadre) : l'image et ses repères partagent la même boîte,
    dimensionnée en CSS comme un « object-fit: cover » (unités de conteneur cqw/cqh). Un repère reste donc
    exactement sur son objet, quelle que soit la largeur d'écran et pendant le zoom.
    ratio = largeur / hauteur de l'image (obligatoire pour un placement exact ; sinon lu au chargement).
  - Textes toujours en blanc (le rouge était peu lisible sur photo).
  - layout="stack" : titre AU-DESSUS de l'image, sur fond sombre (aucun texte posé sur la photo).
    layout="overlay" (défaut) : titre posé sur l'image, en haut (pos="top") ou en bas.
  hotspots : [{ x, y, label, far, side }] — x, y en % de l'image ; far = masqué sur mobile ; side 'l' = étiquette à gauche.
*/
export interface Hotspot { x: number; y: number; label: string; far?: boolean; side?: 'l' | 'r' }
interface PhotoBandProps {
  src: string; alt?: string; label?: string; title?: string; red?: string; text?: string; note?: string;
  hotspots?: Hotspot[]; id?: string; pos?: 'top' | 'bottom'; layout?: 'overlay' | 'stack'; ratio?: number;
}
export default function PhotoBand({ src, alt = '', label, title, red, text, note, hotspots = [], id, pos = 'bottom', layout = 'overlay', ratio }: PhotoBandProps) {
  const sec = useRef<HTMLElement>(null), [inView, setIn] = useState(false), [ar, setAr] = useState(ratio || 0);
  useViewProgress(sec, (p) => sec.current?.style.setProperty('--p', p.toFixed(4)));
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect(); } }, { threshold: .35 });
    io.observe(sec.current!); return () => io.disconnect();
  }, []);
  const tx = (title || text) && (
    <div className="pband-tx"><div className="wrap">
      {label && <p className="label light">{label}</p>}
      {title && <h2>{title}{red && <>{layout === 'stack' ? <br /> : ' '}<em>{red}</em></>}</h2>}
      {text && <p>{text}</p>}
      {note && <small>{note}</small>}
    </div></div>
  );
  return (
    <section className={`pband pos-${pos} lay-${layout}${inView ? ' in' : ''}`} ref={sec} id={id}>
      {layout === 'stack' && tx}
      <div className="pband-img">
        <div className="pband-cv">
          <div className="pband-box" style={cssVars({ '--ar': ar || 2.4 })}>
            <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={(e) => { if (!ratio) setAr(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight); }} />
            {hotspots.map((h, i) => <span key={h.label} className={`hs${h.far ? ' far' : ''}${h.side === 'l' ? ' l' : ''}`} style={cssVars({ left: h.x + '%', top: h.y + '%', '--i': i })}><i /><b>{h.label}</b></span>)}
          </div>
        </div>
      </div>
      {layout !== 'stack' && tx}
    </section>
  );
}
