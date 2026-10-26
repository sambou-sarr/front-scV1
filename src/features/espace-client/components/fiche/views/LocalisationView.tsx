import { I } from "../Icon";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « localisation » vu par le visiteur. */
export default function LocalisationView({ fiche }: ViewProps) {
  return (
    <div>
      <p className="f-txt">{fiche.adresse}</p>
      <a
        className="f-btn gold"
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fiche.adresse || "")}${fiche.googlePlaceId ? `&query_place_id=${fiche.googlePlaceId}` : ""}`}
        target="_blank"
        rel="noreferrer"
      >
        Ouvrir Google Maps <I n="arrow" s={14} />
      </a>
    </div>
  );
}
