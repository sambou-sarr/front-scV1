import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « avis ». */
export default function AvisEditor({ fiche, up }: TabEditorProps) {
  return (
    <div className="ed-items">
      <label>
        <span>Identifiant Google Place</span>
        <input
          value={fiche.googlePlaceId || ""}
          placeholder="Identifiant Google Place"
          onChange={ev => up({ googlePlaceId: ev.target.value })}
        />
      </label>
      <p className="ed-hint">
        Cet identifiant permet d’associer les avis Google à votre établissement.
      </p>
    </div>
  );
}
