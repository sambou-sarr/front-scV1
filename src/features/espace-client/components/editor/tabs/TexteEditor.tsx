import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « texte ». */
export default function TexteEditor({ tab, setTabs, tabs }: TabEditorProps) {
  return (
    <label className="ed-area">
      <textarea
        rows={3}
        value={tab.contenu || ""}
        onChange={ev =>
          setTabs(
            tabs.map(x =>
              x.id === tab.id ? { ...x, contenu: ev.target.value } : x,
            ),
          )
        }
      />
    </label>
  );
}
