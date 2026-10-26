import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « liens ». */
export default function LiensEditor({ plan, upD, fiche }: TabEditorProps) {
  const d = fiche.data;
  const L = d.liens || [];
  return (
    <div className="ed-items">
      {L.map((l, k) => (
        <div key={k} className="ed-it2">
          <input
            placeholder="Libellé"
            value={l.label}
            onChange={ev =>
              upD({
                liens: L.map((x, j) =>
                  j === k ? { ...x, label: ev.target.value } : x,
                ),
              })
            }
          />
          <input
            placeholder="https://"
            value={l.url}
            onChange={ev =>
              upD({
                liens: L.map((x, j) =>
                  j === k ? { ...x, url: ev.target.value } : x,
                ),
              })
            }
          />
          <button
            className="ed-del"
            onClick={() => upD({ liens: L.filter((_, j) => j !== k) })}
          >
            ×
          </button>
        </div>
      ))}
      {L.length < plan.maxLinks && (
        <button
          className="ed-add-b"
          onClick={() => upD({ liens: [...L, { label: "", url: "" }] })}
        >
          + Ajouter un lien
        </button>
      )}
      <small className="ed-cnt">
        {L.length}/{plan.maxLinks}
      </small>
    </div>
  );
}
