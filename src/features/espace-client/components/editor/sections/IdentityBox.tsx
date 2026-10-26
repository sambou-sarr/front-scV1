import type { FicheRecord } from "../../../../../types";
import { I } from "../../fiche/Icon";
import { imageInput } from "../shared";

/** Champs d'identité (nom, contacts…), photo de profil et logo. */
export default function IdentityBox({
  fiche,
  up,
}: {
  fiche: FicheRecord;
  up: (patch: Partial<FicheRecord>) => void;
}) {
  const file = (cb: (url: string) => void) => imageInput(fiche.id, cb);
  return (
    <details className="ed-box">
      <summary>Identité</summary>
      <div className="ed-grid">
        {(
          [
            ["prenom", "Prénom / nom commercial"],
            ["nom", "Nom"],
            ["fonction", "Fonction"],
            ["entreprise", "Entreprise"],
            ["telephone", "Téléphone"],
            ["whatsapp", "WhatsApp"],
            ["email", "E-mail"],
            ["adresse", "Adresse"],
          ] as const
        ).map(([k, l]) => (
          <label key={k}>
            <span>{l}</span>
            <input
              value={fiche[k] || ""}
              onChange={ev => up({ [k]: ev.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="ed-files">
        <label className="ed-file">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={file(u => up({ photo: u }))}
          />
          {fiche.photo ? <img src={fiche.photo} alt="" /> : <I n="user" />}
          <span>Photo de profil</span>
        </label>
        <label className="ed-file">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={file(u => up({ logo: u }))}
          />
          {fiche.logo ? <img src={fiche.logo} alt="" /> : <I n="image" />}
          <span>Logo</span>
        </label>
      </div>
    </details>
  );
}
