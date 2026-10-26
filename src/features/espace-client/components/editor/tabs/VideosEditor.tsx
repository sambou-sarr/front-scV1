import { useRef } from "react";
import type { Photo } from "../../../../../types";
import { uploadMedia } from "../shared";
import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « videos ». */
export default function VideosEditor({ fiche, plan, upD }: TabEditorProps) {
  const d = fiche.data;
  const latest = useRef(fiche);
  latest.current = fiche;
  const G = d.galerie || [];
  const V = G.filter(media => media.type === "video");
  const setVideos = (next: Photo[]) =>
    upD({
      galerie: [...G.filter(media => media.type !== "video"), ...next],
    });
  return (
    <div className="ed-items">
      {V.map((video, i) => (
        <div key={i} className="ed-it2">
          <input
            value={video.url}
            placeholder="URL de la vidéo (https://...)"
            aria-label={`URL de la vidéo ${i + 1}`}
            onChange={ev =>
              setVideos(
                V.map((x, j) => (j === i ? { ...x, url: ev.target.value } : x)),
              )
            }
          />
          <button
            className="ed-del"
            type="button"
            aria-label={`Retirer la vidéo ${i + 1}`}
            onClick={() => setVideos(V.filter((_, j) => j !== i))}
          >
            ×
          </button>
        </div>
      ))}
      {V.length < plan.maxVideos && (
        <button
          className="ed-add-b"
          type="button"
          onClick={() => setVideos([...V, { type: "video", url: "", alt: "" }])}
        >
          + Ajouter une vidéo par URL
        </button>
      )}
      <small className="ed-cnt">
        {V.length}/{plan.maxVideos} vidéos
      </small>
      <label className="ed-add-b">
        <input
          type="file"
          accept="video/mp4,video/webm"
          style={{ display: "none" }}
          disabled={V.length >= plan.maxVideos}
          onChange={async ev => {
            const input = ev.currentTarget;
            const selected = input.files?.[0];
            try {
              if (!selected || !/^video\/(mp4|webm)$/.test(selected.type))
                return;
              const current = latest.current.data.galerie || [];
              const videos = current.filter(media => media.type === "video");
              if (videos.length >= plan.maxVideos) return;
              const uploaded = await uploadMedia(fiche.id, selected);
              const latestGallery = latest.current.data.galerie || [];
              upD({
                galerie: [
                  ...latestGallery.filter(media => media.type !== "video"),
                  ...videos,
                  { type: "video", url: uploaded.url, alt: "" },
                ],
              });
            } catch (error) {
              window.alert(
                error instanceof Error
                  ? error.message
                  : "Échec de l'envoi de la vidéo.",
              );
            } finally {
              input.value = "";
            }
          }}
        />
        + Importer une vidéo
      </label>
      <p className="ed-hint">
        Formats acceptés : MP4 et WebM, 30 Mo maximum par vidéo.
      </p>
    </div>
  );
}
