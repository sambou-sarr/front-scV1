import { useState } from "react";
import { Link } from "react-router-dom";
import { toApiError } from "../../../lib/apiError";
import type { SectionStickerAdmin } from "../../../types/admin";
import Fiche from "../../espace-client/components/Fiche";
import PhonePreview from "../../espace-client/components/PhonePreview";
import StickerSectionView from "../../espace-client/components/sticker/StickerSectionView";
import { fetchFiche } from "../../espace-client/lib/ficheApi";
import { adminApi } from "../admin.service";
import { useData } from "../hooks/useData";
import { fdate } from "../lib/format";
import {
  DECISIONS,
  DECISION_DONE,
  SS_STATUT,
  displayName,
  sectionLabel,
  type SectionDecision,
} from "../lib/sectionStickers";
import {
  Badge,
  Btn,
  Empty,
  ErrorBox,
  Loading,
  Modal,
  useAction,
} from "./ui";

/*
  Stickers par section, côté administration : le client demande un devis (nombre de stickers) ; l'administration traite
  la demande, regarde l'aperçu et ACTIVE la section. Tant qu'elle n'est pas activée, la page /s/:slug/:section affiche
  la fiche complète ; une fois activée, seule cette section est servie et le client reçoit son lien et son QR.
*/

/** Décision de l'administration (activer, désactiver, refuser) puis rechargement. */
function useDecision(onChanged: () => void) {
  const run = useAction();
  return async (d: SectionStickerAdmin, to: SectionDecision) => {
    if (
      await run(
        () => adminApi.setSectionStickerStatus(d.id, to),
        DECISION_DONE[to]
      )
    )
      onChanged();
  };
}

/** Mini téléphone : la fiche entière, ou UNE section telle que la verra la personne qui scanne (même non activée). */
export function FichePhone({
  ficheId,
  section,
  whatsapp,
}: {
  ficheId: number;
  section: string | null;
  whatsapp?: string;
}) {
  const [fiche, reload, err] = useData(
    () =>
      // message lisible du service plutôt qu'une erreur technique brute
      fetchFiche(`fiches/${ficheId}`).catch(e => {
        throw toApiError(e, "Fiche indisponible. Réessayez.");
      }),
    [ficheId]
  );
  if (err) return <ErrorBox message={err} onRetry={reload} />;
  if (!fiche) return <Loading />;
  const previewFiche =
    whatsapp && !fiche.whatsapp ? { ...fiche, whatsapp } : fiche;
  return (
    <PhonePreview>
      {scroller =>
        section ? (
          <StickerSectionView
            key={`${previewFiche.id}-${section}`}
            fiche={previewFiche}
            section={section}
            scrollerRef={scroller}
            preview
          />
        ) : (
          <Fiche
            key={previewFiche.id}
            fiche={previewFiche}
            scrollerRef={scroller}
          />
        )
      }
    </PhonePreview>
  );
}

/** Aperçu d'une section demandée, en fenêtre (depuis la liste des demandes). */
function PreviewModal({
  demande,
  onClose,
}: {
  demande: SectionStickerAdmin;
  onClose: () => void;
}) {
  return (
    <Modal
      title={`Aperçu · ${sectionLabel(demande.section)} · ${displayName(demande.fiche)}`}
      onClose={onClose}
      wide
    >
      <p className="adm-muted">
        Ce que verra la personne qui scanne le sticker (aperçu : la section n'a
        pas besoin d'être activée).
      </p>
      <FichePhone ficheId={demande.fiche.id} section={demande.section} />
    </Modal>
  );
}

const FILTERS = [
  ["all", "Tous les statuts"],
  ...Object.entries(SS_STATUT).map(([status, value]) => [status, value.label] as const),
] as const;
type Filter = "all" | SectionStickerAdmin["statut"];
const matches = (filter: Filter, demande: SectionStickerAdmin) =>
  filter === "all" || demande.statut === filter;

/**
 * Onglet « Stickers par section » de la page Production : toutes les demandes des clients.
 * Chargement et erreur sont gérés ici : une API pas encore à jour ne doit pas bloquer le reste de la page Production.
 */
export function SectionStickersTab({
  data,
  error,
  onChanged,
}: {
  data: SectionStickerAdmin[] | null;
  error: string | null;
  onChanged: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("demande");
  const [preview, setPreview] = useState<SectionStickerAdmin | null>(null);
  const decide = useDecision(onChanged);
  if (error) return <ErrorBox message={error} onRetry={onChanged} />;
  if (!data) return <Loading />;
  const list = data.filter(d => matches(filter, d));
  return (
    <section aria-label="Stickers par section">
      <p className="adm-muted">
        Demandes de devis des clients. « Activer la section » ouvre la page /s/…
        au public et donne au client son lien et son QR.
      </p>
      <label className="prod-status-filter">
        Filtrer les demandes par statut
        <select
          aria-label="Filtrer les demandes par statut"
          value={filter}
          onChange={event => setFilter(event.target.value as Filter)}
        >
          {FILTERS.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      {list.length === 0 ? (
        <Empty>
          {filter === "demande" ? "Aucune demande à traiter." : "Aucune demande."}
        </Empty>
      ) : (
        <div className="table-wrap">
          <table className="adm-tbl">
            <thead>
              <tr>
                <th>Fiche</th>
                <th>Section</th>
                <th>Stickers</th>
                <th>Client</th>
                <th>Demandée le</th>
                <th>État</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {list.map(d => (
                <tr key={d.id}>
                  <td>
                    <Link to={`/admin/fiches/${d.fiche.id}`}>
                      <b>{displayName(d.fiche)}</b>
                    </Link>
                    <br />
                    <span className="adm-muted">/{d.fiche.slug}</span>
                  </td>
                  <td>{sectionLabel(d.section)}</td>
                  <td>{d.quantite}</td>
                  <td>
                    {d.client?.nom || "—"}
                    {d.client?.email && (
                      <>
                        <br />
                        <span className="adm-muted">{d.client.email}</span>
                      </>
                    )}
                  </td>
                  <td>{fdate(d.createdAt)}</td>
                  <td>
                    <Badge tone={SS_STATUT[d.statut].tone}>
                      {SS_STATUT[d.statut].label}
                    </Badge>
                  </td>
                  <td className="ss-actions">
                    <Btn onClick={() => setPreview(d)}>Aperçu</Btn>
                    {DECISIONS[d.statut].map(a => (
                      <Btn
                        key={a.to}
                        kind={a.primary ? "red" : undefined}
                        onClick={() => void decide(d, a.to)}
                      >
                        {a.label}
                      </Btn>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {preview && (
        <PreviewModal demande={preview} onClose={() => setPreview(null)} />
      )}
    </section>
  );
}

/** Panneau de la fiche détail (/admin/fiches/:id) : mini téléphone + demandes de stickers de CETTE fiche. */
export function FichePreviewPanel({
  ficheId,
  whatsapp,
}: {
  ficheId: number;
  whatsapp?: string;
}) {
  const [data, reload, err] = useData(
    () => adminApi.listSectionStickers({ ficheId }),
    [ficheId]
  );
  const [section, setSection] = useState<string | null>(null);
  const decide = useDecision(reload);
  const demandes = data?.demandes ?? [];
  return (
    <section className="panel" aria-label="Aperçu et stickers par section">
      <div className="panel-h">
        <h2>Aperçu et stickers par section</h2>
      </div>
      <div className="fd-prev">
        <div className="fd-prev-list">
          {err ? (
            <ErrorBox message={err} onRetry={reload} />
          ) : !data ? (
            <Loading />
          ) : demandes.length === 0 ? (
            <p className="adm-muted">
              Aucune demande de stickers pour cette fiche.
            </p>
          ) : (
            <ul className="fd-ss">
              {demandes.map(d => (
                <li key={d.id}>
                  <div>
                    <b>{sectionLabel(d.section)}</b>{" "}
                    <Badge tone={SS_STATUT[d.statut].tone}>
                      {SS_STATUT[d.statut].label}
                    </Badge>
                    <br />
                    <span className="adm-muted">
                      {d.quantite} sticker{d.quantite > 1 ? "s" : ""} · demandée
                      le {fdate(d.createdAt)}
                    </span>
                  </div>
                  <span className="ss-actions">
                    <Btn
                      onClick={() =>
                        setSection(section === d.section ? null : d.section)
                      }
                    >
                      {section === d.section ? "Voir la fiche" : "Aperçu"}
                    </Btn>
                    {DECISIONS[d.statut].map(a => (
                      <Btn
                        key={a.to}
                        kind={a.primary ? "red" : undefined}
                        onClick={() => void decide(d, a.to)}
                      >
                        {a.label}
                      </Btn>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {section && (
            <p className="adm-muted">
              Aperçu de la section « {sectionLabel(section)} ».{" "}
              <button className="adm-link" onClick={() => setSection(null)}>
                Revenir à la fiche
              </button>
            </p>
          )}
        </div>
        <FichePhone ficheId={ficheId} section={section} whatsapp={whatsapp} />
      </div>
    </section>
  );
}
