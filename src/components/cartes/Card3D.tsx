import { forwardRef } from 'react';
import type { ReactElement, Ref } from 'react';
import { Icon } from '../Icons';
import { CARD_FACES } from '../../data/cartes';

/*
  Carte connectée en vraie 3D CSS (transform-style: preserve-3d), recto et verso.
  Tout est vectoriel ou issu du logo officiel : la carte reste nette à toutes les tailles.
  La rotation se pilote de l'extérieur via le style de .c3d-rot (ref "rotRef").
  Les tailles de texte sont en unités de conteneur (cqw) : la carte s'adapte à sa largeur.

  ⚠️ QR code décoratif. Le QR réel est généré en code (cahier, section 21) : remplacer <FakeQR />.
*/

export function FakeQR() {
  // motif fixe (pas d'aléatoire au rendu, pour rester stable entre SSR/CSR)
  const n = 21, cells: ReactElement[] = [];
  let s = 17;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
    const mid = x > 7 && x < 13 && y > 7 && y < 13;
    if (!finder && !mid && rnd() > .52) cells.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" />);
  }
  const F = ({ x, y }: { x: number; y: number }) => (<g><rect x={x} y={y} width="7" height="7" /><rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" /><rect x={x + 2} y={y + 2} width="3" height="3" /></g>);
  return (
    <svg viewBox="0 0 21 21" shapeRendering="crispEdges" fill="#000" aria-hidden="true">
      {cells}<F x={0} y={0} /><F x={14} y={0} /><F x={0} y={14} />
      <rect x="8.4" y="8.4" width="4.2" height="4.2" rx=".8" fill="#E40C1A" />
      <text x="10.5" y="11.8" fontSize="3.6" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="Inter, sans-serif">S</text>
    </svg>
  );
}

export type CardVariant = keyof typeof CARD_FACES;
interface Card3DProps { variant?: CardVariant; rotRef?: Ref<HTMLDivElement>; className?: string; onClick?: () => void; label?: string }
const Card3D = forwardRef<HTMLDivElement, Card3DProps>(function Card3D({ variant = 'pro', rotRef, className = '', onClick, label }, ref) {
  const f = CARD_FACES[variant];
  return (
    <div className={`c3d ${variant} ${className}`} ref={ref} onClick={onClick}
      role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} aria-label={label}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick()) : undefined}>
      <div className="c3d-rot" ref={rotRef}>
        {/* RECTO */}
        <div className="face front">
          <img className="wm" src="/images/symbole-s.webp" alt="" />
          <div className="lg"><img src="/images/logo-vertical-blanc.webp" alt="Support Connecté" /></div>
          <div className="nfc"><Icon id="nfc" /><span>NFC</span></div>
          <div className="motto">Connecter<i /> Partager<i /> Simplifier</div>
          <div className="tag"><b />{f.tagline.map((l, i) => <span key={i} className={i === 0 && variant === 'signature' ? 'gold' : undefined}>{l}</span>)}</div>
          <div className="glare" />
        </div>
        {/* VERSO */}
        <div className="face back">
          <div className="bl">
            <p className="bt">{f.backTitle.map((l) => <span key={l}>{l}</span>)}</p>
            <b className="rule" />
            {f.backSub.length > 0 && <p className="bs">{f.backSub.map((l) => <span key={l}>{l}</span>)}</p>}
          </div>
          <ul className="links">{f.links.map(([ic, l]) => <li key={l}><Icon id={ic} />{l}</li>)}</ul>
          <p className="script">{f.script.map((l) => <span key={l}>{l}</span>)}</p>
          <div className="qr back-qr"><FakeQR /></div>
          <div className="glare" />
        </div>
      </div>
    </div>
  );
});

export default Card3D;
