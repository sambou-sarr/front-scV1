import { useState } from "react";
import type { ChangeEvent } from "react";
import type { Plat, SectionMenu } from "../../../../../types";
import { I } from "../../fiche/Icon";
import { toURL, uploadMedia } from "../shared";
import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « menu ». */
export default function MenuEditor({ fiche, plan, upD }: TabEditorProps) {
  const d = fiche.data;
  const [err, setErr] = useState("");
  const M = d.menu?.sections || [];
  const setM = (v: SectionMenu[]) => upD({ menu: { sections: v } });
  const setP = (si: number, pi: number, patch: Partial<Plat>) =>
    setM(
      M.map((x, j) =>
        j === si
          ? {
              ...x,
              plats: x.plats.map((y, k) => (k === pi ? { ...y, ...patch } : y)),
            }
          : x,
      ),
    );
  const vid =
    (si: number, pi: number) => (ev: ChangeEvent<HTMLInputElement>) => {
      const f = ev.target.files![0];
      ev.target.value = "";
      if (!f || !/^video\/(mp4|webm)$/.test(f.type)) {
        if (f) setErr("Format vidéo non pris en charge. Utilisez MP4 ou WebM.");
        return;
      }
      const localUrl = toURL(f);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = async () => {
        if (v.duration > plan.maxMenuVideoSeconds! + 0.5) {
          setErr(
            `Vidéo trop longue : ${plan.maxMenuVideoSeconds} secondes maximum.`,
          );
          URL.revokeObjectURL(localUrl);
          return;
        }
        try {
          setErr("");
          const uploaded = await uploadMedia(fiche.id, f, "menu");
          setP(si, pi, { video: uploaded.url });
        } catch (error) {
          setErr(
            error instanceof Error
              ? error.message
              : "Échec de l'envoi de la vidéo.",
          );
        } finally {
          URL.revokeObjectURL(localUrl);
        }
      };
      v.onerror = () => {
        URL.revokeObjectURL(localUrl);
        setErr(
          "Impossible de lire cette vidéo. Essayez un autre fichier MP4 ou WebM.",
        );
      };
      v.src = localUrl;
    };
  return (
    <div className="ed-items">
      {M.map((s, si) => (
        <div key={si} className="ed-sec">
          <input
            className="ed-sec-t"
            value={s.titre}
            onChange={ev =>
              setM(
                M.map((x, j) =>
                  j === si ? { ...x, titre: ev.target.value } : x,
                ),
              )
            }
          />
          {s.plats.map((p, pi) => (
            <div key={pi} className="ed-dish">
              <label className="ed-thumb">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={async ev => {
                    const input = ev.currentTarget;
                    const f = input.files?.[0];
                    try {
                      if (!f) return;
                      const uploaded = await uploadMedia(fiche.id, f);
                      setP(si, pi, { image: uploaded.url });
                    } catch (error) {
                      window.alert(
                        error instanceof Error
                          ? error.message
                          : "Échec de l'envoi de l'image.",
                      );
                    } finally {
                      input.value = "";
                    }
                  }}
                />
                {p.image ? (
                  <img src={p.image} alt="" />
                ) : (
                  <I n="image" s={16} />
                )}
              </label>
              <div className="ed-dish-f">
                <div className="ed-it2">
                  <input
                    placeholder="Nom du plat"
                    value={p.nom}
                    onChange={ev => setP(si, pi, { nom: ev.target.value })}
                  />
                  <input
                    className="ed-price"
                    placeholder="Prix"
                    inputMode="numeric"
                    value={p.prix || ""}
                    onChange={ev =>
                      setP(si, pi, {
                        prix: ev.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Description"
                  value={p.description || ""}
                  onChange={ev =>
                    setP(si, pi, { description: ev.target.value })
                  }
                />
                <label className="ed-vid">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    onChange={vid(si, pi)}
                  />
                  <I n="play" s={14} />
                  {p.video
                    ? "Vidéo ajoutée · remplacer"
                    : `Ajouter une vidéo courte (${plan.maxMenuVideoSeconds} s max, verticale)`}
                </label>
              </div>
              <button
                className="ed-del"
                type="button"
                aria-label={`Retirer le plat ${p.nom || pi + 1}`}
                onClick={() =>
                  setM(
                    M.map((x, j) =>
                      j === si
                        ? {
                            ...x,
                            plats: x.plats.filter((_, k) => k !== pi),
                          }
                        : x,
                    ),
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
          {s.plats.length > plan.maxMenuItemsPerSection! && (
            <p className="ed-err" role="alert">
              {plan.maxMenuItemsPerSection} plats maximum par section :
              retirez-en {s.plats.length - plan.maxMenuItemsPerSection!}.
            </p>
          )}
          {s.plats.length < plan.maxMenuItemsPerSection! && (
            <button
              className="ed-add-b"
              onClick={() =>
                setM(
                  M.map((x, j) =>
                    j === si
                      ? {
                          ...x,
                          plats: [
                            ...x.plats,
                            { nom: "", prix: "", description: "" },
                          ],
                        }
                      : x,
                  ),
                )
              }
            >
              + Plat
            </button>
          )}
          <button
            className="ed-link"
            type="button"
            onClick={() => setM(M.filter((_, j) => j !== si))}
          >
            Retirer cette section
          </button>
        </div>
      ))}
      {err && (
        <p className="ed-err" role="alert">
          {err}
        </p>
      )}
      {M.length < plan.maxMenuSections! && (
        <button
          className="ed-add-b"
          onClick={() => setM([...M, { titre: "Nouvelle section", plats: [] }])}
        >
          + Section du menu
        </button>
      )}
    </div>
  );
}
