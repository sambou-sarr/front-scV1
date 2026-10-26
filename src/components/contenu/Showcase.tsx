import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import { CC_SHOW } from '../../data/contenu';
import track from '../../utils/track';

/*
  Galerie d'exemples : défilement horizontal (glisser au doigt, flèches au clavier ou à la souris),
  agrandissement plein écran au clic (Échap pour fermer, flèches pour naviguer).
*/
export default function Showcase() {
  const track_ = useRef<HTMLUListElement>(null);
  const [zoom, setZoom] = useState(-1);
  const items = CC_SHOW.items;
  const slide = (dir: number) => {
    const t = track_.current; if (!t) return;
    t.scrollBy({ left: dir * Math.min(t.clientWidth * 0.8, 640), behavior: 'smooth' });
  };
  const go = useCallback((d: number) => setZoom((z) => (z + d + items.length) % items.length), [items.length]);
  useEffect(() => {
    if (zoom < 0) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setZoom(-1); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [zoom, go]);
  const z = zoom >= 0 ? items[zoom] : null;
  return (
    <section className="cc-show" id={CC_SHOW.id}>
      <div className="wrap cc-show-head">
        <div className="rv">
          <p className="label">{CC_SHOW.label}</p>
          <h2 className="h2">{CC_SHOW.title} <em className="red">{CC_SHOW.red}</em></h2>
        </div>
        <div className="cc-show-nav">
          <button type="button" aria-label="Exemples précédents" onClick={() => slide(-1)}><Icon id="arr" style={{ transform: 'scaleX(-1)' }} /></button>
          <button type="button" aria-label="Exemples suivants" onClick={() => slide(1)}><Icon id="arr" /></button>
        </div>
      </div>
      <ul className="cc-show-track" ref={track_}>
        {items.map((it, i) => (
          <li key={it.title}>
            <button type="button" className="cc-shot" onClick={() => { setZoom(i); track('gallery_open', { item: it.title }); }} aria-label={`Agrandir : ${it.title}`}>
              <Pic img={it.img} sizes="(max-width: 760px) 84vw, 520px" />
              <span className="cc-shot-cap"><em>{it.tag}</em><b>{it.title}</b></span>
            </button>
          </li>
        ))}
      </ul>
      <p className="wrap cc-show-note">{CC_SHOW.note}</p>
      {z && (
        <div className="cc-lb" role="dialog" aria-modal="true" aria-label={z.title} onClick={(e) => { if (e.target === e.currentTarget) setZoom(-1); }}>
          <figure>
            <img src={`${z.img.src}-l.webp`} alt={z.img.alt} width={z.img.w} height={z.img.h} />
            <figcaption><em>{z.tag}</em> {z.title}<small>{zoom + 1} / {items.length}</small></figcaption>
          </figure>
          <button type="button" className="cc-lb-x" aria-label="Fermer" onClick={() => setZoom(-1)}>×</button>
          <button type="button" className="cc-lb-p" aria-label="Précédent" onClick={() => go(-1)}><Icon id="arr" style={{ transform: 'scaleX(-1)' }} /></button>
          <button type="button" className="cc-lb-n" aria-label="Suivant" onClick={() => go(1)}><Icon id="arr" /></button>
        </div>
      )}
    </section>
  );
}
