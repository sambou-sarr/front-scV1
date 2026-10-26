import { planOf } from "../../../../../lib/plans";
import type { ViewProps } from "../types";
import { VideoItem } from "../video";

/** Contenu de l'onglet « videos » vu par le visiteur. */
export default function VideosView({ fiche }: ViewProps) {
  const d = fiche.data,
    plan = planOf(fiche);
  const vids = (d.galerie || [])
    .filter(g => g.type === "video" && g.url.trim())
    .slice(0, plan.maxVideos);
  return vids.length ? (
    <div className="f-vids">
      {vids.map((g, k) => (
        <VideoItem key={`${g.url}-${k}`} url={g.url} />
      ))}
    </div>
  ) : (
    <p className="f-txt muted">
      Ajoutez jusqu’à {plan.maxVideos} vidéos (YouTube, Vimeo, TikTok ou fichier
      MP4/WebM).
    </p>
  );
}
