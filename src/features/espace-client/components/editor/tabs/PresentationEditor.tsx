import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « presentation ». */
export default function PresentationEditor({
  plan,
  upD,
  fiche,
}: TabEditorProps) {
  const d = fiche.data;
  return (
    <label className="ed-area">
      <textarea
        rows={4}
        className="w-full resize-y break-words text-sm"
        maxLength={plan.maxPresentation}
        value={d.presentation || ""}
        onChange={ev => upD({ presentation: ev.target.value })}
      />
      <small>
        {(d.presentation || "").length} / {plan.maxPresentation}
      </small>
    </label>
  );
}
