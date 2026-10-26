import { planOf } from "../../../../../lib/plans";
import { I } from "../Icon";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « liens » vu par le visiteur. */
export default function LiensView({ fiche }: ViewProps) {
  const d = fiche.data,
    plan = planOf(fiche);
  return (
    <div className="f-links">
      {(d.liens || []).slice(0, plan.maxLinks).map(l => (
        <a key={l.label} href={l.url} target="_blank" rel="noreferrer">
          {l.label}
          <I n="arrow" s={14} />
        </a>
      ))}
    </div>
  );
}
