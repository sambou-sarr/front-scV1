import type { PointerEvent } from 'react';
import { Icon } from '../Icons';
import Pic from '../shared/Pic';
import { CC_TEAM } from '../../data/contenu';

// Inclinaison 3D au survol (souris uniquement ; rien au toucher ni si l'utilisateur limite les animations).
const tilt = (e: PointerEvent<HTMLElement>) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget, b = el.getBoundingClientRect();
  el.style.setProperty('--ry', `${((e.clientX - b.left) / b.width - 0.5) * 10}deg`);
  el.style.setProperty('--rx', `${((e.clientY - b.top) / b.height - 0.5) * -10}deg`);
};
const reset = (e: PointerEvent<HTMLElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg'); };

// L'équipe, présentée par ses propres cartes NFC (preuve de savoir-faire et visages de l'agence).
export default function TeamCards() {
  const T = CC_TEAM;
  return (
    <section className="cc-team">
      <div className="wrap">
        <div className="cc-team-head">
          <div className="rv">
            <p className="label">{T.label}</p>
            <h2 className="h2">{T.title} <em className="red">{T.red}</em></h2>
          </div>
          <p className="cc-lead rv">{T.text}</p>
        </div>
        <ul className="cc-team-grid">
          {T.cards.map((c) => (
            <li key={c.name}>
              <figure className="cc-card" onPointerMove={tilt} onPointerLeave={reset}>
                <Pic img={c.img} sizes="(max-width: 760px) 84vw, 44vw" />
              </figure>
              <p><b>{c.name}</b><span>{c.role}</span></p>
            </li>
          ))}
        </ul>
        <a className="more" href={T.cta.href}>{T.cta.label} <Icon id="arr" /></a>
      </div>
    </section>
  );
}
