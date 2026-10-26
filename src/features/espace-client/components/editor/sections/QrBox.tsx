import { ENV } from "../../../../../lib/env";
import type { FicheRecord } from "../../../../../types";
import { I } from "../../fiche/Icon";
import { QR } from "../../fiche/QR";
import { downloadSvg } from "../shared";

/** Aperçu du QR code de la fiche, téléchargement SVG et lien de commande du sticker. */
export default function QrBox({ fiche }: { fiche: FicheRecord }) {
  return (
    <details className="ed-box">
      <summary>
        Mon QR code <small>et sticker téléphone 30 mm</small>
      </summary>
      <div className="ed-qr">
        <div className="ed-qr-v" id="ed-qr-svg">
          <QR
            text={`${ENV.VITE_BASE_URL}/f/${fiche.slug}`}
            logo={fiche.logo}
            size={132}
          />
        </div>
        <div className="ed-qr-t">
          <p>
            Le QR code de votre fiche :{" "}
            <b>supportconnecte.com/f/{fiche.slug}</b>. C’est le même que celui
            de votre carte.
          </p>
          <button
            className="ed-add-b"
            onClick={() =>
              downloadSvg(
                document.querySelector("#ed-qr-svg"),
                `qr-${fiche.slug}.svg`,
              )
            }
          >
            Télécharger mon QR (vectoriel)
          </button>
          <a
            className="ed-up"
            href={`${ENV.VITE_BASE_URL}/contact?sujet=qr#formulaire`}
            target="_blank"
            rel="noreferrer"
          >
            Commander mon sticker 30 mm <I n="arrow" s={13} />
          </a>
        </div>
      </div>
    </details>
  );
}
