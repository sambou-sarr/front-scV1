import { Icon } from '../Icons';
import { Head, ScreenWifi, ScreenMenu, ScreenGoogle, ScreenReseaux } from '../qr/PhoneScreens';

// Écrans du panneau d'accueil (PLACEHOLDER : à remplacer par la vraie page de l'établissement).
const N = 'HÔTEL · SALY';
function ScreenDecouvrir() {
  const L = [['Plage de Saly', '5 min à pied'], ['Réserve de Bandia', '20 min en voiture'], ['Lagune de la Somone', '15 min en voiture']];
  return <div className="ps"><Head name={N} sub="À découvrir" />{L.map(([a, b]) => <span key={a} className="ps-cbtn col"><Icon id="i-pin" /><span><b>{a}</b><small>{b}</small></span></span>)}</div>;
}
function ScreenCall() {
  return <div className="ps ps-call"><Head name={N} sub="Nous appeler" /><div className="ps-callring"><Icon id="i-phone" /></div><p className="ps-q">Appel de la réception…</p><span className="ps-btn red-o">Raccrocher</span></div>;
}
function ScreenWa() {
  return <div className="ps ps-wa"><Head name={N} sub="WhatsApp" /><p className="bub in">Bonjour, bienvenue ! Comment pouvons-nous vous aider ?</p><p className="bub out">Une table pour deux ce soir, possible ?</p><p className="bub in">Bien sûr, 20 h 30 en terrasse ?</p></div>;
}
function ScreenInfos() {
  const L = [['Réception', '24 h / 24'], ['Petit-déjeuner', '7 h – 10 h 30'], ['Départ', 'avant 12 h'], ['Navette', 'sur demande']];
  return <div className="ps"><Head name={N} sub="Informations" /><div className="ps-cat">{L.map(([a, b]) => <p key={a}><span>{a}</span><b>{b}</b></p>)}</div></div>;
}
export const HOTEL_SCREENS = {
  wifi: () => <ScreenWifi name={N} />, menu: () => <ScreenMenu name={N} />, decouvrir: ScreenDecouvrir, google: () => <ScreenGoogle name={N} />,
  appel: ScreenCall, whatsapp: ScreenWa, reseaux: () => <ScreenReseaux name={N} />, infos: ScreenInfos,
};
