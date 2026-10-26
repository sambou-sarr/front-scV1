import { useEffect, useRef, useState } from 'react';
import { Icon } from '../Icons';
import { CC_IA } from '../../data/contenu';

/*
  Démonstration animée « une demande → réponse préparée → validation → envoi ».
  Démarre quand la carte est visible (le message entrant est déjà affiché : la carte n'est jamais vide),
  boucle avec une pause ; état final fixe si l'utilisateur a demandé moins d'animations. Exemple fictif.
*/
const FIRST = 1, LAST = 4;
export default function IaDemo() {
  const [k, setK] = useState(FIRST);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setK(LAST); return; }
    let timer = 0, on = false;
    const tick = () => { setK((x) => (x >= LAST ? FIRST : x + 1)); timer = window.setTimeout(tick, 1900); };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; timer = window.setTimeout(tick, 600); }
      if (!e.isIntersecting && on) { on = false; window.clearTimeout(timer); }
    }, { threshold: 0.4 });
    if (box.current) io.observe(box.current);
    return () => { io.disconnect(); window.clearTimeout(timer); };
  }, []);
  const D = CC_IA.demo;
  return (
    <div className="ia-demo" ref={box}>
      <ol className="ia-steps" aria-label="Le circuit d’une demande">
        {CC_IA.flow.map((f, i) => <li key={f} className={k > i ? 'done' : k === i + 1 ? 'on' : undefined}><span>{i + 1}</span>{f}</li>)}
      </ol>
      <div className="ia-chat" aria-hidden="true">
        <p className="ia-from">{D.from}</p>
        <p className={`ia-b in${k >= 1 ? ' show' : ''}`}>{D.ask}</p>
        <div className={`ia-b out draft${k >= 2 ? ' show' : ''}${k >= 3 ? ' ok' : ''}`}>
          <span className="ia-k"><Icon id="i-spark" />{k >= 3 ? D.who : 'Réponse préparée par l’IA'}</span>
          {D.draft}
          {k === 2 && <span className="ia-btn">Valider</span>}
        </div>
        <p className={`ia-sent${k >= 4 ? ' show' : ''}`}><Icon id="i-check" />{D.sent}</p>
        <p className={`ia-tag${k >= 4 ? ' show' : ''}`}>{D.tag}</p>
      </div>
      <p className="ia-ex">Exemple fictif</p>
    </div>
  );
}
