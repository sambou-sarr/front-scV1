import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { FicheRow } from "../../../types/admin";
import { adminApi } from "../admin.service";
import {
  Badge,
  Btn,
  Empty,
  ErrorBox,
  Icon,
  Loading,
  Modal,
  Pager,
} from "../components/ui";
import { useData, useDebounced } from "../hooks/useData";
import { FORMULES, FORMULE_TONE, fdate } from "../lib/format";
import { sectionLabel } from "../lib/sectionStickers";

type Filters = {
  search: string;
  statut: string;
  formule: string;
  expiration: string;
  sticker: "" | "demande";
  tri: string;
  userId: string;
};
const FROM_URL = (q: URLSearchParams): Filters => ({
  search: q.get("search") ?? "",
  statut: q.get("statut") ?? "",
  formule: q.get("formule") ?? "",
  expiration: q.get("expiration") ?? "",
  sticker: q.get("sticker") === "demande" ? "demande" : "",
  tri: q.get("tri") ?? "recent",
  userId: q.get("userId") ?? "",
});

export default function Fiches() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const [ficheDemandes, setFicheDemandes] = useState<FicheRow | null>(null);
  const [f, setF] = useState<Filters>(() => FROM_URL(query));
  const [page, setPage] = useState(1);
  const [text, setText] = useState(f.search);
  const search = useDebounced(text.trim(), 300);
  useEffect(() => {
    setF(x => (x.search === search ? x : { ...x, search }));
    setPage(1);
  }, [search]);

  const [data, reload, err] = useData(
    () =>
      adminApi.listFiches({
        ...f,
        sticker: f.sticker || undefined,
        page,
        limit: 20,
      }),
    [
      f.search,
      f.statut,
      f.formule,
      f.expiration,
      f.sticker,
      f.tri,
      f.userId,
      page,
    ]
  );
  const set = (k: keyof Filters) => (e: ChangeEvent<HTMLSelectElement>) => {
    setF(x => ({ ...x, [k]: e.target.value }));
    setPage(1);
  };
  const filtered = !!(
    f.search ||
    f.statut ||
    f.formule ||
    f.expiration ||
    f.sticker ||
    f.userId
  );
  const reset = () => {
    setF({ ...FROM_URL(new URLSearchParams()) });
    setText("");
    setPage(1);
  };

  return (
    <>
      <header className="ph">
        <div>
          <p className="eyebrow">Cartes</p>
          <h1>Fiches</h1>
          <p className="lede">
            Toutes les fiches connectées : formule, échéance, propriétaire.
            Clique sur une ligne pour la gérer.
          </p>
        </div>
      </header>

      <div className="filters">
        <label className="search">
          <Icon n="search" />
          <input
            placeholder="Nom, entreprise, adresse, téléphone, e-mail…"
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </label>
        <select
          value={f.formule}
          onChange={set("formule")}
          aria-label="Formule"
        >
          <option value="">Formule</option>
          {Object.entries(FORMULES).map(([k, l]) => (
            <option key={k} value={k}>
              {l}
            </option>
          ))}
        </select>
        <select value={f.statut} onChange={set("statut")} aria-label="Statut">
          <option value="">Statut</option>
          <option value="active">Active</option>
          <option value="suspendue">Suspendue</option>
        </select>
        <select
          value={f.expiration}
          onChange={set("expiration")}
          aria-label="Échéance"
        >
          <option value="">Échéance</option>
          <option value="bientot">Expire sous 30 jours</option>
          <option value="expiree">Expirée</option>
        </select>
        <select
          value={f.sticker}
          onChange={set("sticker")}
          aria-label="Demandes de stickers"
        >
          <option value="">Demandes de stickers</option>
          <option value="demande">À traiter</option>
        </select>
        <select value={f.tri} onChange={set("tri")} aria-label="Tri">
          <option value="recent">Plus récentes</option>
          <option value="scans">Plus scannées</option>
          <option value="nom">Par nom</option>
        </select>
        {f.userId && (
          <button
            className="adm-chip on"
            onClick={() => setF(x => ({ ...x, userId: "" }))}
          >
            Fiches d’un client ✕
          </button>
        )}
        {filtered && (
          <button className="link small" onClick={reset}>
            Tout effacer
          </button>
        )}
      </div>

      {err ? (
        <ErrorBox message={err} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : data.fiches.length ? (
        <>
          <div className="table-wrap">
            <table className="adm-tbl">
              <thead>
                <tr>
                  <th>Fiche</th>
                  <th>Formule</th>
                  <th>Statut</th>
                  <th>Propriétaire</th>
                  <th>Échéance</th>
                  <th>Scans</th>
                  <th>Demandes sticker</th>
                </tr>
              </thead>
              <tbody>
                {data.fiches.map(x => (
                  <tr
                    key={x.id}
                    onClick={() => navigate(`/admin/fiches/${x.id}`)}
                  >
                    <td data-l="Fiche">
                      <Link
                        to={`/admin/fiches/${x.id}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <b>{x.entreprise || x.nom}</b>
                      </Link>
                      <small>
                        {x.entreprise ? `${x.nom} · ` : ""}/{x.slug}
                      </small>
                    </td>
                    <td data-l="Formule">
                      <Badge tone={FORMULE_TONE[x.formule]}>
                        {FORMULES[x.formule]}
                      </Badge>
                      {x.expiree && <Badge tone="red">Expirée</Badge>}
                    </td>
                    <td data-l="Statut">
                      {x.statut === "active" ? (
                        <Badge tone="green">Active</Badge>
                      ) : (
                        <Badge tone="grey">Suspendue</Badge>
                      )}
                    </td>
                    <td data-l="Propriétaire">
                      {x.proprietaire ? (
                        <>
                          <b>{x.proprietaire.nom || x.proprietaire.email}</b>
                          {x.proprietaire.nom && (
                            <small>{x.proprietaire.email}</small>
                          )}
                        </>
                      ) : (
                        <span className="adm-muted">Aucun</span>
                      )}
                    </td>
                    <td data-l="Échéance">
                      {x.dateEcheance
                        ? fdate(x.dateEcheance)
                        : x.expiree
                          ? "—"
                          : "Sans échéance"}
                    </td>
                    <td data-l="Scans">{x.scansTotal}</td>
                    <td data-l="Demandes sticker">
                      {x.demandesSticker.length ? (
                        <div className="row-a left">
                          <span aria-label={`${x.demandesSticker.length} demandes en attente`}>
                            <Badge tone="red">{x.demandesSticker.length}</Badge>
                          </span>
                          <Btn
                            kind="red"
                            icon="eye"
                            aria-label={`Voir les sections demandées pour ${x.entreprise || x.nom}`}
                            onClick={e => {
                              e.stopPropagation();
                              setFicheDemandes(x);
                            }}
                          >
                            Voir sections
                          </Btn>
                        </div>
                      ) : (
                        <span className="adm-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager
            page={data.pagination.page}
            totalPages={data.pagination.totalPages}
            total={data.pagination.total}
            noun="fiche"
            onPage={setPage}
          />
          {ficheDemandes && (
            <Modal
              title={`Sections demandées · ${ficheDemandes.entreprise || ficheDemandes.nom}`}
              onClose={() => setFicheDemandes(null)}
            >
              <p className="adm-muted">
                {ficheDemandes.demandesSticker.length} demande
                {ficheDemandes.demandesSticker.length > 1 ? "s" : ""} de stickers
                à traiter.
              </p>
              <div className="table-wrap">
                <table className="adm-tbl">
                  <thead>
                    <tr>
                      <th>Section</th>
                      <th>Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ficheDemandes.demandesSticker.map(d => (
                      <tr key={d.id}>
                        <td>
                          <Badge tone="gold">{sectionLabel(d.section)}</Badge>
                        </td>
                        <td>
                          {d.quantite} sticker{d.quantite > 1 ? "s" : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="form-a">
                <Btn onClick={() => setFicheDemandes(null)}>Fermer</Btn>
                <Btn
                  kind="dark"
                  icon="out"
                  onClick={() => {
                    navigate(`/admin/fiches/${ficheDemandes.id}`);
                    setFicheDemandes(null);
                  }}
                >
                  Ouvrir la fiche
                </Btn>
              </div>
            </Modal>
          )}
        </>
      ) : (
        <Empty>
          {filtered
            ? "Aucune fiche ne correspond à ces filtres."
            : "Aucune fiche pour le moment."}
        </Empty>
      )}
    </>
  );
}
