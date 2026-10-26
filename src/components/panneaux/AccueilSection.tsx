import { useEffect, useRef, useState } from 'react';
import { P_ACCUEIL } from '../../data/panneaux';
import { HOTEL_SCREENS } from './HotelScreens';

/*
  Panneau d'accueil interactif : les 8 QR du visuel sont cliquables.
  Le téléphone affiche l'écran correspondant. Défilement automatique
  tant que l'utilisateur n'a rien touché et que la section est visible.
*/
export default function AccueilSection() {
  const [cur, setCur] = useState(0);
  const box = useRef<HTMLElement>(null), user = useRef(false);
  const S = P_ACCUEIL.spots;

  useEffect(() => {
    let id = 0;
    const io = new IntersectionObserver(([e]) => {
      clearInterval(id);
      if (e.isIntersecting && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
        id = window.setInterval(() => { if (user.current) return clearInterval(id); setCur((c) => (c + 1) % S.length); }, 2600);
    }, { threshold: .45 });
    io.observe(box.current!);
    return () => { io.disconnect(); clearInterval(id); };
  }, [S.length]);

  const pick = (i: number) => { user.current = true; setCur(i); };

  return (
    <section className="accueil" id="accueil" ref={box}>
      <div className="wrap">
        <div className="sec-head split rv">
          <div><p className="label">{P_ACCUEIL.label}</p><h2 className="h2">{P_ACCUEIL.title}<br /><em className="red">{P_ACCUEIL.red}</em></h2></div>
          <p className="side-note">{P_ACCUEIL.text}</p>
        </div>
        <div className="ac-grid">
          <div className="ac-panel">
            <img src="/images/panneau-accueil.webp" alt="Panneau d’accueil d’hôtel avec huit QR codes" loading="lazy" />
            {S.map((s, i) => (
              <button key={s.id} className={`ac-spot${i === cur ? ' on' : ''}`} style={{ left: s.x + '%', top: s.y + '%' }} onClick={() => pick(i)} aria-label={s.label} aria-pressed={i === cur}>
                <i />
              </button>
            ))}
            <p className="ac-hint">{P_ACCUEIL.hint}</p>
          </div>
          <div className="ac-side">
            <div className="phone static ac-phone" aria-live="polite">
              <div className="screen">
                <div className="isl" />
                {S.map((s, i) => { const C = HOTEL_SCREENS[s.id as keyof typeof HOTEL_SCREENS]; return <div key={s.id} className={`qu-scr${i === cur ? ' on' : ''}`}><C /></div>; })}
              </div>
            </div>
            <div className="ac-chips" role="group" aria-label="Accès du panneau">
              {S.map((s, i) => <button key={s.id} className={i === cur ? 'on' : ''} onClick={() => pick(i)}>{s.label}</button>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
