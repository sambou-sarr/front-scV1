import { I } from "../Icon";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « avis » vu par le visiteur. */
export default function AvisView({ fiche }: ViewProps) {
  return (
    <div className="f-review">
      <div>
        <b>Votre expérience compte</b>
        <span>Partagez votre avis sur Google en un clic.</span>
      </div>
      <a
        className="f-btn gold sm"
        href={
          fiche.googlePlaceId
            ? `https://search.google.com/local/writereview?placeid=${fiche.googlePlaceId}`
            : "#"
        }
        target="_blank"
        rel="noreferrer"
      >
        <I n="star" s={14} />
        Laisser un avis
      </a>
    </div>
  );
}
