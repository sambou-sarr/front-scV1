import { Link } from "react-router-dom";
import type { FicheRecord, Plan } from "../../../../../types";
import { I } from "../../fiche/Icon";
import { UPGRADE_PATH } from "../shared";

/** Bandeau « Votre formule » avec lien vers l'offre supérieure. */
export default function PlanBanner({
  fiche,
  plan,
  sig,
}: {
  fiche: FicheRecord;
  plan: Plan;
  sig: boolean;
}) {
  return (
    <div className={`ed-plan p-${fiche.formule}`}>
      <div>
        <small>Votre formule</small>
        <b>
          {plan.label}
          {fiche.enLigneSeule ? " · en ligne" : ""}
        </b>
      </div>
      {!sig && (
        <Link to={UPGRADE_PATH} className="ed-up">
          Découvrir la Signature <I n="arrow" s={13} />
        </Link>
      )}
    </div>
  );
}
