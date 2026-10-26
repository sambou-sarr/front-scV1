import { SUPPORTS } from '../../data/content';
import { Icon } from '../Icons';
import { cssVars } from '../../lib/css';

/*
  « Des supports physiques qui ouvrent vos outils digitaux. » — grille « bento ».
  Chaque tuile a sa micro-interaction, qui donne envie d'ouvrir la page produit
  sans en répéter le contenu : la carte s'incline, les stickers s'éventaillent,
  le panneau zoome sur son QR, le polo passe du logo au QR (polo Atelier Kanël, V6).
*/
const VIS = {
  cartes: () => <div className="bv bv-card"><img src="/images/main-carte-detouree.webp" alt="" loading="lazy" /><i className="bv-sheen" /></div>,
  qr: () => <div className="bv bv-qr"><img className="s1" src="/images/sticker-wifi.webp" alt="" loading="lazy" /><img className="s3" src="/images/sticker-menu.webp" alt="" loading="lazy" /><img className="s2" src="/images/sticker-google.webp" alt="" loading="lazy" /></div>,
  panneaux: () => <div className="bv bv-pan"><span className="pw"><img src="/images/panneau-immo.webp" alt="" loading="lazy" /><i className="bv-ring" /></span></div>,
  branding: () => <div className="bv bv-brand"><img src="/images/polo-atelier-kanel.webp" alt="" loading="lazy" /></div>,
};
const KEYS: (keyof typeof VIS)[] = ['cartes', 'qr', 'panneaux', 'branding'];

export default function SupportsBento() {
  return (
    <section className="h2-supports" id="supports">
      <div className="wrap">
        <div className="sec-head rv">
          <div><p className="label">{SUPPORTS.label}</p><h2 className="h2">{SUPPORTS.titleStart}<span className="red">{SUPPORTS.titleRed}</span></h2></div>
          <a className="more" href="/cartes-connectees">{SUPPORTS.link} <Icon id="arr" /></a>
        </div>
        <div className="bento">
          {SUPPORTS.items.map((s, i) => {
            const V = VIS[KEYS[i]];
            return (
              <a key={s.href} href={s.href} className={`bt bt-${KEYS[i]} rv`} style={cssVars({ '--i': i })}>
                {s.badge && <span className="badge">{s.badge}</span>}
                <V />
                <div className="bt-tx">
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <span className="more">{SUPPORTS.cta} <Icon id="arr" /></span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
