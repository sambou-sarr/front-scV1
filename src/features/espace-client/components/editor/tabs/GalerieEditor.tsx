import { useRef } from "react";
import type { Photo } from "../../../../../types";
import { I } from "../../fiche/Icon";
import { uploadMedia } from "../shared";
import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « galerie ». */
export default function GalerieEditor({ fiche, plan, upD }: TabEditorProps) {
  const d = fiche.data;
  const latest = useRef(fiche);
  latest.current = fiche;
  const allMedia = d.galerie || [];
  const G = allMedia.filter(media => media.type !== "video");
  return (
    <div className="ed-gal">
      {G.map((g, k) => (
        <span key={g.url || k}>
          <img src={g.url} alt={g.alt || ""} />
          <button
            onClick={() =>
              upD({
                galerie: allMedia.filter(media => media.url !== g.url),
              })
            }
          >
            ×
          </button>
        </span>
      ))}
      {G.length < plan.maxPhotos && (
        <label className="ed-gal-add">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={async ev => {
              const input = ev.currentTarget;
              const files = [...(input.files || [])]
                .filter(f => /^image\/(jpeg|png|webp)$/.test(f.type))
                .slice(0, Math.max(0, plan.maxPhotos - G.length));
              const add: Photo[] = [];
              try {
                for (const f of files) {
                  const uploaded = await uploadMedia(fiche.id, f);
                  add.push({ type: "image", url: uploaded.url, alt: "" });
                }
                if (add.length) {
                  const current = latest.current.data.galerie || [];
                  upD({ galerie: [...current, ...add] });
                }
              } catch (error) {
                window.alert(
                  error instanceof Error
                    ? error.message
                    : "Échec de l'envoi d'une image.",
                );
                if (add.length) {
                  const current = latest.current.data.galerie || [];
                  upD({ galerie: [...current, ...add] });
                }
              } finally {
                input.value = "";
              }
            }}
          />
          <I n="plus" s={18} />
        </label>
      )}
      <small className="ed-cnt">
        {G.length}/{plan.maxPhotos} photos
      </small>
    </div>
  );
}
