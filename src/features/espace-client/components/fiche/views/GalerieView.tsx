import { planOf } from "../../../../../lib/plans";
import { Carousel } from "../Carousel";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « galerie » vu par le visiteur. */
export default function GalerieView({ fiche }: ViewProps) {
  const d = fiche.data,
    plan = planOf(fiche);
  return (
    <Carousel
      label="Photo"
      items={(d.galerie || [])
        .filter(g => g.type !== "video" && g.url)
        .slice(0, plan.maxPhotos)}
      render={g => <img src={g.url} alt={g.alt || ""} loading="lazy" />}
    />
  );
}
