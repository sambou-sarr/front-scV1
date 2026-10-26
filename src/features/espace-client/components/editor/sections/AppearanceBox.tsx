import { LAYOUTS, SIZES, THEMES } from "../../../../../lib/plans";
import type {
  Disposition,
  EnteteComplete,
  FicheRecord,
  Taille,
  Theme,
} from "../../../../../types";
import { I } from "../../fiche/Icon";
import { Lock, imageInput } from "../shared";

interface Props {
  fiche: FicheRecord;
  sig: boolean;
  entete: EnteteComplete;
  setE: (patch: Partial<EnteteComplete>) => void;
}

/** Entête et apparence (disposition, taille, thème, couverture) : Signature uniquement. */
export default function AppearanceBox({ fiche, sig, entete: e, setE }: Props) {
  const file = (cb: (url: string) => void) => imageInput(fiche.id, cb);
  return (
    <details className="ed-box">
      <summary>Entête et apparence</summary>
      {sig ? (
        <>
          <p className="ed-k">Disposition de la photo et du logo</p>
          <div className="ed-layouts">
            {Object.entries(LAYOUTS).map(([k, v]) => (
              <button
                key={k}
                className={e.disposition === k ? "on" : ""}
                onClick={() => setE({ disposition: k as Disposition })}
              >
                <i className={`mini mi-${k}`}>
                  <b />
                  <u />
                </i>
                <strong>{v.label}</strong>
                <small>{v.hint}</small>
              </button>
            ))}
          </div>
          <div className="ed-row">
            <div>
              <p className="ed-k">Taille</p>
              <div className="ed-seg">
                {Object.entries(SIZES).map(([k, l]) => (
                  <button
                    key={k}
                    className={e.taille === k ? "on" : ""}
                    onClick={() => setE({ taille: k as Taille })}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="ed-k">Thème</p>
              <div className="ed-themes">
                {Object.entries(THEMES).map(([k, l]) => (
                  <button
                    key={k}
                    className={`tt-${k}${e.theme === k ? " on" : ""}`}
                    onClick={() => setE({ theme: k as Theme })}
                    title={l}
                    aria-label={l}
                  />
                ))}
              </div>
            </div>
          </div>
          {(e.disposition === "logo" || e.disposition === "banniere") && (
            <label className="ed-file wide">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={file(u => setE({ couverture: u }))}
              />
              {e.couverture ? (
                <img src={e.couverture} alt="" />
              ) : (
                <I n="image" />
              )}
              <span>Photo de couverture</span>
            </label>
          )}
        </>
      ) : (
        <Lock>
          Entête modulable (logo, bannière, duo), tailles et thèmes :
          disponibles en Signature.
        </Lock>
      )}
    </details>
  );
}
