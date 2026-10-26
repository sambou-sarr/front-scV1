import { today } from "../format";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « horaires » vu par le visiteur. */
export default function HorairesView({ fiche }: ViewProps) {
  const d = fiche.data;
  return (
    <ul className="f-hours">
      {(d.horaires || []).map(h => (
        <li key={h.jour} className={h.jour === today() ? "now" : ""}>
          <span>
            {h.jour}
            {h.jour === today() && <em>Aujourd’hui</em>}
          </span>
          <b>{h.horaire}</b>
        </li>
      ))}
    </ul>
  );
}
