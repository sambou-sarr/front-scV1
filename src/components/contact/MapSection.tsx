import { C_MAP, PLACE, CONTACT } from '../../data/contact';
import { Icon } from '../Icons';
import track from '../../utils/track';

/*
  Carte schématique (pas de service de cartographie chargé : rapide et sans cookies) :
  trame de points, trajet animé Dakar → Saly → Mbour, repère qui pulse sur Saly.
  Le bouton ouvre Google Maps. Pour une vraie carte : remplacer .cm-map par un <iframe> Google Maps.
*/
export default function MapSection() {
  const P = Object.fromEntries(C_MAP.pins.map((p) => [p.id, p]));
  return (
    <section className="ct-map">
      <div className="wrap cm-grid">
        <div className="rv">
          <p className="label light">{C_MAP.label}</p>
          <h2 className="h2">{C_MAP.title}<br /><em className="red">{C_MAP.red}</em></h2>
          <p className="cm-p">{C_MAP.text}</p>
          <p className="cm-addr"><Icon id="i-pin" /><span><b>{PLACE.address}</b><small>{CONTACT.zone} · {CONTACT.reach}</small></span></p>
          <a className="btn btn-red" href={PLACE.maps} target="_blank" rel="noopener noreferrer" onClick={() => track('map_open', {})}>{C_MAP.open} <Icon id="arr" /></a>
        </div>
        <div className="cm-map rv" role="img" aria-label={`${C_MAP.schematic} : Dakar, Saly, Mbour`}>
          <svg className="cm-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path d={`M${P.dakar.x} ${P.dakar.y} C 30 40, 44 56, ${P.saly.x} ${P.saly.y} S ${P.mbour.x - 3} ${P.mbour.y}, ${P.mbour.x} ${P.mbour.y}`} />
          </svg>
          {C_MAP.pins.map((p) => (
            <span key={p.id} className={`cm-pin${p.main ? ' main' : ''}`} style={{ left: p.x + '%', top: p.y + '%' }}>
              {p.main && <><i className="pulse" /><i className="pulse p2" /></>}
              <i className="dot" /><b>{p.label}</b>
            </span>
          ))}
          <span className="cm-note">{C_MAP.schematic}</span>
        </div>
      </div>
    </section>
  );
}
