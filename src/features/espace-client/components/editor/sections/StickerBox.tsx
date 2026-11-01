import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState, type FormEvent } from "react";
import { ENV } from "../../../../../lib/env";
import { toApiError } from "../../../../../lib/apiError";
import { TAB_TYPES } from "../../../../../lib/plans";
import type { ApiSectionSticker, FicheRecord } from "../../../../../types";
import {
  createSectionSticker,
  getSectionStickers,
} from "../../../espaceClient.service";
import {
  DEFAULT_STICKERS,
  MAX_STICKERS,
  hasStickers,
  latestBySection,
  parseQuantity,
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

const stickersLabel = (n: number) => `${n} sticker${n > 1 ? "s" : ""}`;

/** Demande de devis : le client indique le nombre de stickers ; l'administration traite puis active la section. */
function QuoteForm({
  fiche,
  sectionKey,
  retry,
}: {
  fiche: FicheRecord;
  sectionKey: string;
  retry: boolean;
}) {
  const queryClient = useQueryClient();
  const [raw, setRaw] = useState(String(DEFAULT_STICKERS));
  const quantite = parseQuantity(raw);
  const mutation = useMutation({
    mutationFn: () =>
      createSectionSticker(fiche.id, {
        section: sectionKey,
        quantite: quantite!,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["section-stickers", fiche.id],
      }),
  });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (quantite !== null) mutation.mutate();
  };
  return (
    <form className="ed-stk-quote" onSubmit={submit}>
      <label>
        Nombre de stickers
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={MAX_STICKERS}
          step={1}
          value={raw}
          onChange={e => setRaw(e.target.value)}
          aria-invalid={quantite === null}
        />
      </label>
      <button
        className="ed-add-b"
        type="submit"
        disabled={quantite === null || mutation.isPending}
      >
        {mutation.isPending
          ? "Envoi…"
          : retry
            ? "Refaire une demande de devis"
            : "Demander un devis"}
      </button>
      {quantite === null && (
        <small role="alert">
          Indiquez un nombre entre 1 et {MAX_STICKERS}.
        </small>
      )}
      {mutation.isError && (
        <small role="alert" className="ed-stk-err">
          {toApiError(mutation.error).message}
        </small>
      )}
    </form>
  );
}

/** Outils d'une section ACTIVÉE par l'administration : lien, QR, aperçu et ouverture. */
function ActiveTools({
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
    <div className="ed-stk-active">
      <div className="ed-stk-qr" ref={qr}>
        <QR text={url} logo={fiche.logo} size={84} />
      </div>
      <div className="ed-stk-t">
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
    </div>
  );
}

function StickerRow({
  fiche,
  info,
  demande,
  previewSection,
  onPreviewSection,
}: {
  fiche: FicheRecord;
  info: StickerSectionInfo;
  demande: ApiSectionSticker | undefined;
} & Preview) {
  const statut = demande?.statut;
  return (
    <li className="ed-stk" data-statut={statut ?? "aucune"}>
      <div className="ed-stk-body">
        <b>
          <I n={TAB_TYPES[info.tab.type].icon} s={13} />{" "}
          {sectionTitle(info.tab)}
        </b>
        {info.primary && (
          <small className="ed-stk-rec">Conseillée pour votre secteur</small>
        )}

        {statut === "active" ? (
          <ActiveTools
            fiche={fiche}
            info={info}
            previewSection={previewSection}
            onPreviewSection={onPreviewSection}
          />
        ) : statut === "demande" ? (
          <p className="ed-stk-state">
            <span className="ed-stk-badge">Demande envoyée</span>{" "}
            {stickersLabel(demande!.quantite)} · en attente de l’administration.
            Vous serez prévenu dès que la section sera activée.
          </p>
        ) : (
          <>
            {statut === "refusee" && (
              <p className="ed-stk-state">
                <span className="ed-stk-badge bad">Demande refusée</span> Vous
                pouvez en refaire une.
              </p>
            )}
            {statut === "desactivee" && (
              <p className="ed-stk-state">
                <span className="ed-stk-badge bad">Section désactivée</span> par
                l’administration. Vous pouvez refaire une demande.
              </p>
            )}
            <QuoteForm
              fiche={fiche}
              sectionKey={info.key}
              retry={statut === "refusee" || statut === "desactivee"}
            />
          </>
        )}
      </div>
    </li>
  );
}

/**
 * Stickers par section (Pro et Signature). Le client demande un DEVIS pour un nombre de stickers ; l'administration
 * traite la demande et active la section. Une fois activée, il obtient le lien, le QR, l'aperçu et l'ouverture de la
 * page /s/:slug/:section (seule cette section s'affiche, avec un bouton vers la fiche complète).
 */
export default function StickerBox({
  fiche,
  previewSection = null,
  onPreviewSection,
}: { fiche: FicheRecord } & Partial<Preview>) {
  const eligible = hasStickers(fiche);
  const sections = stickerSections(fiche);
  const demandes = useQuery({
    queryKey: ["section-stickers", fiche.id],
    queryFn: () => getSectionStickers(fiche.id),
    enabled: eligible,
  });
  const latest = latestBySection(demandes.data ?? []);
  return (
    <details className="ed-box">
      <summary>
        Stickers par section <small>Pro et Signature</small>
      </summary>
      {!eligible ? (
        <Lock to="Pro">
          Un sticker peut ouvrir une seule section (le menu, vos biens…) au lieu
          de la fiche entière. Réservé aux formules Pro et Signature.
        </Lock>
      ) : sections.length === 0 ? (
        <p className="ed-hint">
          Ajoutez au moins une section visible à votre fiche pour demander des
          stickers.
        </p>
      ) : (
        <>
          <p className="ed-hint">
            Un sticker ouvre une seule section de votre fiche, avec votre logo,
            votre nom et un bouton vers la fiche complète. Indiquez le nombre de
            stickers souhaité : l’administration vous répond par un devis puis
            active la section. Le lien et le QR apparaissent alors ici.
          </p>
          {demandes.isError && (
            <p className="ed-hint" role="alert">
              Impossible de charger vos demandes.{" "}
              <button className="ed-up" onClick={() => demandes.refetch()}>
                Réessayer
              </button>
            </p>
          )}
          {demandes.isPending ? (
            <p className="ed-hint" role="status">
              Chargement de vos demandes…
            </p>
          ) : (
            <ul className="ed-stk-list">
              {sections.map(info => (
                <StickerRow
                  key={info.key}
                  fiche={fiche}
                  info={info}
                  demande={latest.get(info.key)}
                  previewSection={previewSection}
                  onPreviewSection={onPreviewSection}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </details>
  );
}
