import { useRef } from "react";
import type { SectionCatalogue } from "../../../../../types";
import { I } from "../../fiche/Icon";
import { Lock, uploadMedia } from "../shared";
import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « catalogue ». */
export default function CatalogueEditor({ fiche, plan, upD }: TabEditorProps) {
  const d = fiche.data;
  const latest = useRef(fiche);
  latest.current = fiche;
  const S = d.sections || [];
  const setS = (v: SectionCatalogue[]) => upD({ sections: v });
  return (
    <div className="ed-items">
      {S.length > plan.maxCatalogSections! && (
        <p className="ed-err" role="alert">
          Votre formule autorise {plan.maxCatalogSections} section(s) :
          retirez-en {S.length - plan.maxCatalogSections!} pour pouvoir
          enregistrer.
        </p>
      )}
      {S.map((s, si) => (
        <div key={si} className="ed-sec">
          <input
            className="ed-sec-t"
            value={s.titre}
            onChange={ev =>
              setS(
                S.map((x, j) =>
                  j === si ? { ...x, titre: ev.target.value } : x,
                ),
              )
            }
          />
          {s.articles.map((a, ai) => (
            <div key={ai} className="ed-it">
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
                      const currentSections =
                        latest.current.data.sections || [];
                      setS(
                        currentSections.map((x, j) =>
                          j === si
                            ? {
                                ...x,
                                articles: x.articles.map((y, k) =>
                                  k === ai ? { ...y, photo: uploaded.url } : y,
                                ),
                              }
                            : x,
                        ),
                      );
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
                {a.photo ? (
                  <img src={a.photo} alt="" />
                ) : (
                  <I n="image" s={16} />
                )}
              </label>
              <input
                placeholder="Nom"
                value={a.nom}
                onChange={ev =>
                  setS(
                    S.map((x, j) =>
                      j === si
                        ? {
                            ...x,
                            articles: x.articles.map((y, k) =>
                              k === ai ? { ...y, nom: ev.target.value } : y,
                            ),
                          }
                        : x,
                    ),
                  )
                }
              />
              {plan.catalogPrices && (
                <input
                  className="ed-price"
                  placeholder="Prix"
                  inputMode="numeric"
                  value={a.prix || ""}
                  onChange={ev =>
                    setS(
                      S.map((x, j) =>
                        j === si
                          ? {
                              ...x,
                              articles: x.articles.map((y, k) =>
                                k === ai
                                  ? {
                                      ...y,
                                      prix: ev.target.value.replace(/\D/g, ""),
                                    }
                                  : y,
                              ),
                            }
                          : x,
                      ),
                    )
                  }
                />
              )}
              <button
                className="ed-del"
                type="button"
                aria-label={`Retirer l'article ${a.nom || ai + 1}`}
                onClick={() =>
                  setS(
                    S.map((x, j) =>
                      j === si
                        ? {
                            ...x,
                            articles: x.articles.filter((_, k) => k !== ai),
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
          {s.articles.length > plan.maxCatalogArticlesPerSection! && (
            <p className="ed-err" role="alert">
              {plan.maxCatalogArticlesPerSection} articles maximum par section :
              retirez-en{" "}
              {s.articles.length - plan.maxCatalogArticlesPerSection!}.
            </p>
          )}
          {s.articles.length < plan.maxCatalogArticlesPerSection! && (
            <button
              className="ed-add-b"
              onClick={() =>
                setS(
                  S.map((x, j) =>
                    j === si
                      ? {
                          ...x,
                          articles: [
                            ...x.articles,
                            {
                              nom: "",
                              description: "",
                              prix: "",
                              devise: "XOF",
                            },
                          ],
                        }
                      : x,
                  ),
                )
              }
            >
              + Article
            </button>
          )}
          <button
            className="ed-link"
            type="button"
            onClick={() => setS(S.filter((_, j) => j !== si))}
          >
            Retirer cette section
          </button>
        </div>
      ))}
      {S.length < plan.maxCatalogSections! && (
        <button
          className="ed-add-b"
          onClick={() =>
            setS([...S, { titre: "Nouvelle section", articles: [] }])
          }
        >
          + Section
        </button>
      )}
      {!plan.catalogPrices && (
        <Lock>
          Prix et bouton « Commander » sur chaque article : en Signature.
        </Lock>
      )}
    </div>
  );
}
