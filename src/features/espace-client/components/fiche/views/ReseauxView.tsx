import { planOf } from "../../../../../lib/plans";
import { I } from "../Icon";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « reseaux » vu par le visiteur. */
export default function ReseauxView({ fiche }: ViewProps) {
  const d = fiche.data,
    plan = planOf(fiche);
  return (
    <div className="f-soc">
      {(d.reseauxSociaux || []).slice(0, plan.maxSocial).map(s => (
        <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
          <span>
            <I n="globe" s={15} />
          </span>
          {s.label}
          <I n="arrow" s={13} />
        </a>
      ))}
    </div>
  );
}
