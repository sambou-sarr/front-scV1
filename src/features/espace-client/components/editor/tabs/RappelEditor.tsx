import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « rappel ». */
export default function RappelEditor({ fiche, up }: TabEditorProps) {
  return (
    <div className="ed-items">
      <label>
        <span>Téléphone pour être rappelé</span>
        <input
          value={fiche.telephone || ""}
          placeholder="+221..."
          onChange={ev => up({ telephone: ev.target.value })}
        />
      </label>
      <label>
        <span>WhatsApp</span>
        <input
          value={fiche.whatsapp || ""}
          placeholder="+221..."
          onChange={ev => up({ whatsapp: ev.target.value })}
        />
      </label>
    </div>
  );
}
