import { useEffect, useState } from "react";
import { TEMPLATES, applyTemplate } from "../../../../../lib/plans";
import type {
  EnteteComplete,
  FicheData,
  FicheRecord,
  Plan,
  Secteur,
} from "../../../../../types";
import { I } from "../../fiche/Icon";

interface Props {
  fiche: FicheRecord;
  plan: Plan;
  sig: boolean;
  entete: EnteteComplete;
  upD: (patch: Partial<FicheData>) => void;
}

/** « Mon activité » : applique un modèle de page par métier, avec annulation pendant 7 s. */
export default function TemplateBox({
  fiche,
  plan,
  sig,
  entete: e,
  upD,
}: Props) {
  const [undo, setUndo] = useState<Partial<FicheData> | null>(null);
  const pickTemplate = (key: Secteur) => {
    setUndo({
      onglets: fiche.data.onglets,
      entete: fiche.data.entete,
      secteur: fiche.data.secteur,
    });
    const r = applyTemplate(fiche.formule, key, plan);
    upD({
      secteur: key,
      onglets: r.onglets,
      ...(sig ? { entete: { ...e, ...r.entete } } : {}),
    });
  };
  useEffect(() => {
    if (!undo) return undefined;
    const id = setTimeout(() => setUndo(null), 7000);
    return () => clearTimeout(id);
  }, [undo]);
  return (
    <details open className="ed-box">
      <summary>
        Mon activité <small>modèle de page</small>
      </summary>
      <div className="ed-tpl">
        {Object.entries(TEMPLATES).map(([k, t]) => (
          <button
            key={k}
            className={fiche.data.secteur === k ? "on" : ""}
            onClick={() => pickTemplate(k as Secteur)}
          >
            <I n={t.icon} s={16} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>
      {undo && (
        <p className="ed-undo">
          Modèle appliqué.{" "}
          <button
            onClick={() => {
              upD(undo);
              setUndo(null);
            }}
          >
            Annuler
          </button>
        </p>
      )}
      <p className="ed-hint">
        Le modèle place les bons blocs dans le bon ordre pour votre métier. Vous
        gardez la main ensuite.
      </p>
    </details>
  );
}
