import { LAYOUTS, SIZES, THEMES } from "../../../../../lib/plans";
import type {
  Disposition,
  EnteteComplete,
  Taille,
  Theme,
} from "../../../../../types";
import { Lock } from "../shared";

interface Props {
  sig: boolean;
  entete: EnteteComplete;
  setE: (patch: Partial<EnteteComplete>) => void;
}

/** Disposition, taille et thème de l'entête : Signature uniquement. */
export default function AppearanceBox({ sig, entete: e, setE }: Props) {
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
