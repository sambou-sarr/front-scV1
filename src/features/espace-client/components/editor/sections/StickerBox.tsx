import { useRef, useState } from "react";
import { ENV } from "../../../../../lib/env";
import { TAB_TYPES } from "../../../../../lib/plans";
import type { FicheRecord } from "../../../../../types";
import {
  hasStickers,
  sectionTitle,
  stickerPath,
  stickerSections,
  type StickerSectionInfo,
} from "../../../lib/stickerSections";
import { I } from "../../fiche/Icon";
import { QR } from "../../fiche/QR";
import { Lock, downloadSvg } from "../shared";

const origin = () =>
  (ENV.VITE_BASE_URL || window.location.origin).replace(/\/+$/, "");

interface Preview {
  /** Section actuellement affichée dans l'aperçu téléphone (null = fiche complète). */
  previewSection: string | null;
  onPreviewSection?: (key: string | null) => void;
}

function StickerRow({
  fiche,
  info,
  previewSection,
  onPreviewSection,
}: {
  fiche: FicheRecord;
  info: StickerSectionInfo;
} & Preview) {
  const previewing = previewSection === info.key;
  const qr = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const url = `${origin()}${stickerPath(fiche.slug, info.key)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez ce lien :", url);
    }
  };
  return (
    <li className="ed-stk">
      <div className="ed-stk-qr" ref={qr}>
        <QR text={url} logo={fiche.logo} size={84} />
      </div>
      <div className="ed-stk-t">
        <b>
          <I n={TAB_TYPES[info.tab.type].icon} s={13} />{" "}
          {sectionTitle(info.tab)}
        </b>
        {info.primary && (
          <small className="ed-stk-rec">Conseillée pour votre secteur</small>
        )}
        <code>{stickerPath(fiche.slug, info.key)}</code>
        <span className="ed-stk-a">
          <button className="ed-add-b" onClick={copy}>
            {copied ? "Lien copié" : "Copier le lien"}
          </button>
          <button
            className="ed-add-b"
            onClick={() =>
              downloadSvg(qr.current, `sticker-${fiche.slug}-${info.key}.svg`)
            }
          >
            QR (SVG)
          </button>
          {onPreviewSection && (
            <button
              className={`ed-add-b${previewing ? " on" : ""}`}
              aria-pressed={previewing}
              onClick={() => onPreviewSection(previewing ? null : info.key)}
            >
              {previewing ? "Fermer l’aperçu" : "Aperçu"}
            </button>
          )}
          <a className="ed-up" href={url} target="_blank" rel="noreferrer">
            Ouvrir <I n="arrow" s={13} />
          </a>
        </span>
      </div>
    </li>
  );
}

/**
 * Stickers par section (Pro et Signature) : un QR par section de la fiche. Au scan, seule cette section
 * s'affiche (page /s/:slug/:section), avec un bouton vers la fiche complète. La fiche elle-même n'est pas modifiée.
 */
export default function StickerBox({
  fiche,
  previewSection = null,
  onPreviewSection,
}: { fiche: FicheRecord } & Partial<Preview>) {
  const sections = stickerSections(fiche);
  return (
    <details className="ed-box">
      <summary>
        Stickers par section <small>Pro et Signature</small>
      </summary>
      {!hasStickers(fiche) ? (
        <Lock to="Pro">
          Un sticker peut ouvrir une seule section (le menu, vos biens…) au lieu
          de la fiche entière. Réservé aux formules Pro et Signature.
        </Lock>
      ) : sections.length === 0 ? (
        <p className="ed-hint">
          Ajoutez au moins une section visible à votre fiche pour créer un
          sticker.
        </p>
      ) : (
        <>
          <p className="ed-hint">
            Chaque QR ouvre uniquement la section choisie, avec votre logo,
            votre nom et un bouton vers la fiche complète. Si la section est
            masquée ou supprimée, c’est la fiche complète qui s’affiche. «
            Aperçu » l’affiche dans le téléphone, avec vos modifications non
            enregistrées.
          </p>
          <ul className="ed-stk-list">
            {sections.map(info => (
              <StickerRow
                key={info.key}
                fiche={fiche}
                info={info}
                previewSection={previewSection}
                onPreviewSection={onPreviewSection}
              />
            ))}
          </ul>
        </>
      )}
    </details>
  );
}
