import { Icon } from '../Icons';

/*
  Écrans de démonstration, un par type de sticker (PLACEHOLDER : à remplacer par
  les vraies pages Support Connecté). Chaque écran s'anime quand il devient actif (.on).
*/
import { cssVars } from '../../lib/css';

interface ScreenProps { name?: string }
export const Head = ({ sub, name = 'LE SUNSET' }: { sub: string; name?: string }) => (
  <div className="ps-head"><span className="ps-av"><Icon id="palm" /></span><div><b>{name}</b><small>{sub}</small></div></div>
);

export function ScreenGoogle({ name }: ScreenProps) {
  return (
    <div className="ps ps-google">
      <Head name={name} sub="Restaurant, Saly" />
      <p className="ps-q">Comment s’est passée votre visite ?</p>
      <div className="ps-stars">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} id="i-star" />)}</div>
      <div className="ps-field"><span>Excellent dîner face à la mer, service au top…</span></div>
      <span className="ps-btn">Publier sur Google</span>
    </div>
  );
}
export function ScreenWifi({ name }: ScreenProps) {
  return (
    <div className="ps ps-wifi">
      <Head name={name} sub="Accès Wi-Fi" />
      <div className="ps-wbig"><Icon id="i-wifi" /></div>
      <div className="ps-sheet"><small>Rejoindre le réseau</small><b>« LeSunset_Clients » ?</b><span className="ps-btn">Rejoindre</span></div>
      <p className="ps-ok"><Icon id="i-check" />Connecté</p>
    </div>
  );
}
export function ScreenReseaux({ name }: ScreenProps) {
  const L = [['Instagram', '#d6249f'], ['Facebook', '#1877f2'], ['TikTok', '#111'], ['YouTube', '#ff0000']];
  return (
    <div className="ps ps-soc">
      <Head name={name} sub="Suivez-nous" />
      {L.map(([n, c]) => <span key={n} className="ps-sbtn" style={cssVars({ '--c': c })}><i />{n}<em>Suivre</em></span>)}
      <p className="ps-note">Actualités, offres, événements</p>
    </div>
  );
}
export function ScreenMenu({ name }: ScreenProps) {
  const M: [string, [string, string][]][] = [['Entrées', [['Salade de la baie', '3 500 F'], ['Accras de poisson', '2 500 F']]], ['Plats', [['Thiof grillé', '7 500 F'], ['Yassa poulet', '5 000 F']]], ['Boissons', [['Jus de bissap', '1 500 F']]]];
  return (
    <div className="ps ps-menu">
      <Head name={name} sub="Menu du jour" />
      {M.map(([cat, items]) => (
        <div key={cat} className="ps-cat"><small>{cat}</small>{items.map(([n, p]) => <p key={n}><span>{n}</span><b>{p}</b></p>)}</div>
      ))}
    </div>
  );
}
export function ScreenContact({ name }: ScreenProps) {
  const L = [['i-phone', 'Appeler'], ['i-wa', 'WhatsApp'], ['i-mail', 'Email'], ['arr', 'Telegram'], ['i-globe', 'Site web']];
  return (
    <div className="ps ps-contact">
      <Head name={name} sub="Contactez-nous" />
      {L.map(([ic, l]) => <span key={l} className="ps-cbtn"><Icon id={ic} />{l}</span>)}
    </div>
  );
}
export function ScreenRdv({ name }: ScreenProps) {
  const days = ['Lun 13', 'Mar 14', 'Mer 15', 'Jeu 16'];
  const slots = ['10 h 00', '11 h 30', '14 h 30', '16 h 00', '17 h 30', '19 h 00'];
  return (
    <div className="ps ps-rdv">
      <Head name={name} sub="Prendre rendez-vous" />
      <div className="ps-days">{days.map((d, i) => <span key={d} className={i === 1 ? 'sel' : ''}>{d}</span>)}</div>
      <div className="ps-slots">{slots.map((s, i) => <span key={s} className={i === 2 ? 'sel' : ''}>{s}</span>)}</div>
      <span className="ps-btn">Confirmer mardi, 14 h 30</span>
    </div>
  );
}
export const SCREENS = { google: ScreenGoogle, wifi: ScreenWifi, reseaux: ScreenReseaux, menu: ScreenMenu, contact: ScreenContact, rdv: ScreenRdv };
