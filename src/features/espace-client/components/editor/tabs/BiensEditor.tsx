import { useRef } from "react";
import type { BienData as Bien } from "../../../../../types";
import { I } from "../../fiche/Icon";
import { uploadMedia } from "../shared";
import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « biens ». */
export default function BiensEditor({ fiche, plan, upD }: TabEditorProps) {
  const d = fiche.data;
  const latest = useRef(fiche);
  latest.current = fiche;
  const Bs = d.biens || [];
  const setB = (i: number, patch: Partial<Bien>) => {
    const current = latest.current.data.biens || [];
    upD({
      biens: current.map((x, j) => (j === i ? { ...x, ...patch } : x)),
    });
  };
  return (
    <div className="ed-items">
      {Bs.map((b, i) => (
        <div key={i} className="ed-sec">
          <div className="ed-it2">
            <input
              placeholder="Titre du bien"
              value={b.titre}
              onChange={ev => setB(i, { titre: ev.target.value })}
            />
            <select
              value={b.type}
              onChange={ev =>
                setB(i, { type: ev.target.value as Bien["type"] })
              }
            >
              <option value="vente">À vendre</option>
              <option value="location">À louer</option>
            </select>
          </div>
          <div className="ed-specs">
            {(
              [
                ["prix", "Prix (F)"],
                ["ville", "Ville"],
                ["surface", "Surface m²"],
                ["terrain", "Terrain m²"],
                ["chambres", "Chambres"],
                ["sdb", "Salles de bain"],
              ] as const
            ).map(([k, l]) => (
              <label key={k}>
                <span>{l}</span>
                <input
                  value={b[k] ?? ""}
                  onChange={ev =>
                    setB(i, {
                      [k]:
                        k === "ville"
                          ? ev.target.value
                          : ev.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </label>
            ))}
          </div>
          <textarea
            rows={2}
            placeholder="Description"
            value={b.description || ""}
            onChange={ev => setB(i, { description: ev.target.value })}
          />
          <div className="ed-gal">
            {(b.photos || []).map((u, k) => (
              <span key={k}>
                <img src={u} alt="" />
                <button
                  onClick={() =>
                    setB(i, { photos: b.photos!.filter((_, j) => j !== k) })
                  }
                >
                  ×
                </button>
              </span>
            ))}
            {(b.photos || []).length < plan.maxPhotosPerBien! && (
              <label className="ed-gal-add">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={async ev => {
                    const input = ev.currentTarget;
                    const files = [...(input.files || [])]
                      .filter(f => /^image\/(jpeg|png|webp)$/.test(f.type))
                      .slice(
                        0,
                        Math.max(
                          0,
                          plan.maxPhotosPerBien! - (b.photos || []).length,
                        ),
                      );
                    const added: string[] = [];
                    try {
                      for (const f of files) {
                        const uploaded = await uploadMedia(fiche.id, f);
                        added.push(uploaded.url);
                      }
                      if (added.length) {
                        const current = latest.current.data.biens?.[i];
                        if (current)
                          setB(i, {
                            photos: [...(current.photos || []), ...added],
                          });
                      }
                    } catch (error) {
                      if (added.length) {
                        const current = latest.current.data.biens?.[i];
                        if (current)
                          setB(i, {
                            photos: [...(current.photos || []), ...added],
                          });
                      }
                      window.alert(
                        error instanceof Error
                          ? error.message
                          : "Échec de l'envoi d'une photo du bien.",
                      );
                    } finally {
                      input.value = "";
                    }
                  }}
                />
                <I n="plus" s={18} />
              </label>
            )}
            <small className="ed-cnt">
              {(b.photos || []).length}/{plan.maxPhotosPerBien} photos
            </small>
          </div>
          <button
            className="ed-link"
            onClick={() => upD({ biens: Bs.filter((_, j) => j !== i) })}
          >
            Retirer ce bien
          </button>
        </div>
      ))}
      {Bs.length < plan.maxBiens! ? (
        <button
          className="ed-add-b"
          onClick={() =>
            upD({
              biens: [
                ...Bs,
                {
                  titre: "",
                  type: "vente",
                  prix: "",
                  ville: "",
                  photos: [],
                },
              ],
            })
          }
        >
          + Ajouter un bien
        </button>
      ) : (
        <p className="ed-limit">
          Limite de {plan.maxBiens} biens atteinte. Au-delà, nous créons ou
          refondons le site internet de votre agence avec l’ensemble de vos
          biens : parlez-en à votre conseiller.
        </p>
      )}
    </div>
  );
}
