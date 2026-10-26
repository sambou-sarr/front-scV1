import { planOf } from "../../../../../lib/plans";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « presentation » vu par le visiteur. */
export default function PresentationView({ fiche }: ViewProps) {
  const d = fiche.data,
    plan = planOf(fiche);
  return (
    <p className="f-txt">
      {(d.presentation || "").slice(0, plan.maxPresentation)}
    </p>
  );
}
