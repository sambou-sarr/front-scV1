import { useEffect, useRef, useState } from 'react';

/*
  Un univers par métier : carrousel glissable (défilement horizontal aimanté), défilement
  automatique tant que le visiteur ne touche pas, image qui se « pose » quand elle est au centre.
  Ces marques sont des univers de démonstration, pas des clients (mention affichée).
*/
export const UNIVERS = [
  { img: '/images/univers-chez-homard.webp', name: 'Chez Homard', sector: 'Restaurant', href: '/secteurs#sec-restaurants-cafes' },
  { img: '/images/univers-baobab-suites.webp', name: 'Baobab Suites', sector: 'Hôtel', href: '/secteurs#sec-hotels-residences' },
  { img: '/images/univers-phonezone.webp', name: 'PhoneZone', sector: 'Commerce · téléphonie', href: '/secteurs#sec-commerces-boutiques' },
  { img: '/images/univers-teranga-immo.webp', name: 'Teranga Immo', sector: 'Immobilier', href: '/secteurs#sec-immobilier' },
  { img: '/images/univers-senegalais-immo.webp', name: 'Sénégalais Immo', sector: 'Immobilier · terrains', href: '/secteurs#sec-immobilier' },
  { img: '/images/univers-nomad-fit.webp', name: 'Nomad Fit Club', sector: 'Sport & loisirs', href: '/secteurs#sec-tourisme-loisirs' },
];

interface UniversGalleryProps { label?: string; title?: string; red?: string; note?: string }
export default function UniversGallery({ label = 'Un univers par métier', title = 'Vos supports,', red = 'à vos couleurs.', note = 'Univers de démonstration conçus par Support Connecté.' }: UniversGalleryProps) {
  const track = useRef<HTMLDivElement>(null), [cur, setCur] = useState(0), user = useRef(false);
  useEffect(() => {
    const t = track.current!;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setCur(Number((e.target as HTMLElement).dataset.i)); }), { root: t, threshold: .6 });
    [...t.children].forEach((c) => io.observe(c));
    const stop = () => { user.current = true; };
    t.addEventListener('pointerdown', stop); t.addEventListener('wheel', stop, { passive: true });
    const id = setInterval(() => { if (user.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; const n = (Number(t.dataset.cur || 0) + 1) % UNIVERS.length; go(n, true); }, 4200);
    return () => { io.disconnect(); clearInterval(id); t.removeEventListener('pointerdown', stop); t.removeEventListener('wheel', stop); };
  }, []);
  useEffect(() => { track.current!.dataset.cur = String(cur); }, [cur]);
  const go = (i: number, auto?: boolean) => { const t = track.current!, c = t.children[i] as HTMLElement; if (!auto) user.current = true; t.scrollTo({ left: c.offsetLeft - (t.clientWidth - c.clientWidth) / 2, behavior: 'smooth' }); };
  return (
    <section className="univ">
      <div className="wrap"><p className="label">{label}</p><h2 className="h2">{title} <em className="red">{red}</em></h2></div>
      <div className="univ-track" ref={track}>
        {UNIVERS.map((u, i) => (
          <figure key={u.name} className={`univ-card${i === cur ? ' on' : ''}`} data-i={i}>
            <div className="uc-img"><img src={u.img} alt={`Univers ${u.name} : supports connectés (${u.sector})`} loading="lazy" draggable="false" /></div>
            <figcaption><b>{u.name}</b><span>{u.sector}</span></figcaption>
          </figure>
        ))}
      </div>
      <div className="wrap univ-nav"><small>{note}</small><div className="univ-dots">{UNIVERS.map((u, i) => <button key={u.name} className={i === cur ? 'on' : ''} onClick={() => go(i)} aria-label={u.name} />)}</div></div>
    </section>
  );
}
