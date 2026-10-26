import { useEffect, useState } from 'react';
import { A_END, CONTACT } from '../../data/apropos';
import { Icon } from '../Icons';
import track from '../../utils/track';

/*
  Bouton d'action flottant : apparaît une fois le hero dépassé,
  se retire quand le diagnostic ou la zone de contact sont visibles (pas de doublon
  avec leurs propres boutons, et jamais par-dessus un bouton d'action).
*/
export default function StickyCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const hero = document.getElementById('top');
    const blockers = ['diagnostic', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
    let pastHero = false; const vis = new Set();
    const upd = () => setShow(pastHero && vis.size === 0);
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.target === hero) pastHero = !e.isIntersecting && e.boundingClientRect.top < 0;
      else if (e.isIntersecting) vis.add(e.target); else vis.delete(e.target);
      upd();
    }), { threshold: 0, rootMargin: '-90px 0px -20% 0px' });
    hero && io.observe(hero); blockers.forEach((b) => io.observe(b!));
    return () => io.disconnect();
  }, []);
  return (
    <a className={`scta${show ? ' on' : ''}`} href={`mailto:${CONTACT.email}?subject=${encodeURIComponent('Demande de démonstration')}`} aria-hidden={!show} tabIndex={show ? 0 : -1} onClick={() => track('cta_demo', { source: 'sticky' })}>
      <span className="scta-dot" aria-hidden="true" /><span><b>{A_END.sticky}</b><small>{A_END.stickySub}</small></span><Icon id="arr" />
    </a>
  );
}
