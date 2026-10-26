import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « reseaux ». */
export default function ReseauxEditor({ plan, upD, fiche }: TabEditorProps) {
  const d = fiche.data;
  const R = d.reseauxSociaux || [];
  return (
    <div className="ed-items">
      {R.map((r, i) => (
        <div key={i} className="ed-it2">
          <input
            placeholder="Réseau (ex. Instagram)"
            aria-label={`Nom du réseau social ${i + 1}`}
            value={r.label}
            onChange={ev =>
              upD({
                reseauxSociaux: R.map((x, j) =>
                  j === i ? { ...x, label: ev.target.value } : x,
                ),
              })
            }
          />
          <input
            placeholder="https://..."
            aria-label={`Adresse du réseau social ${i + 1}`}
            value={r.url}
            onChange={ev =>
              upD({
                reseauxSociaux: R.map((x, j) =>
                  j === i ? { ...x, url: ev.target.value } : x,
                ),
              })
            }
          />
          <button
            className="ed-del"
            type="button"
            aria-label={`Retirer le réseau social ${i + 1}`}
            onClick={() => upD({ reseauxSociaux: R.filter((_, j) => j !== i) })}
          >
            ×
          </button>
        </div>
      ))}
      {R.length < plan.maxSocial && (
        <button
          className="ed-add-b"
          type="button"
          onClick={() =>
            upD({ reseauxSociaux: [...R, { label: "", url: "" }] })
          }
        >
          + Ajouter un réseau social
        </button>
      )}
      <small className="ed-cnt">
        {R.length}/{plan.maxSocial} réseaux sociaux
      </small>
    </div>
  );
}
