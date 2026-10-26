import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « localisation ». */
export default function LocalisationEditor({ fiche, up }: TabEditorProps) {
  return (
    <div className="ed-items">
      <label>
        <span>Adresse</span>
        <input
          value={fiche.adresse || ""}
          placeholder="Adresse de l’activité"
          onChange={ev => up({ adresse: ev.target.value })}
        />
      </label>
      <label>
        <span>Lien ou identifiant Google Maps (facultatif)</span>
        <input
          value={fiche.googlePlaceId || ""}
          placeholder="Identifiant Google Place"
          onChange={ev => up({ googlePlaceId: ev.target.value })}
        />
      </label>
    </div>
  );
}
