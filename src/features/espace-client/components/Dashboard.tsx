
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { isAuthFailure } from "../../../lib/apiError";
import { clearSession } from "../../../lib/session";
import "../../../styles/dashboard.css";
import { deleteFiche } from "../espaceClient.service";
import {
  dashboardFichesKey,
  useDashboardFiches,
} from "../hooks/useDashboardFiches";
import type { Health } from "../lib/dashboard";
import {
  checks,
  completion,
  daysLeft,
  displayName,
  fmtDate,
  health,
  publicUrl,
  SECTEUR_LABEL,
  subscriptionEndsAt,
} from "../lib/dashboard";
import {
  DEFAULT_FICHE_LIST_FILTERS,
  filterFiches,
  pageFiches,
  type FicheListFilters,
} from "../lib/ficheList";
import { renewPath } from "../lib/renewal";
import CreateFicheForm from "../pages/CreateFicheForm";
import { FicheListControls, FichePagination } from "./FicheListControls";

interface Props {
  user: { name: string };
  onEdit: (ficheId: number) => void;
  onView: (slug: string) => void;
}

type Fiche = NonNullable<
  ReturnType<typeof useDashboardFiches>["data"]
>[number];

const PILL: Record<
  Health,
  { cls: string; text: (d: number | null) => string }
> = {
  ok: { cls: "ok", text: () => "En ligne" },
  soon: { cls: "warn", text: d => `Expire dans ${d} j` },
  expired: { cls: "bad", text: () => "Expirée" },
  suspended: { cls: "bad", text: () => "Suspendue" },
  draft: { cls: "warn", text: () => "Brouillon" },
};

function Skeleton() {
  return (
    <div className="db" aria-busy="true" aria-label="Chargement">
      <div className="db-sk h" />
      <div className="db-kpis">
        <div className="db-sk k" />
        <div className="db-sk k" />
        <div className="db-sk k" />
      </div>
      <div className="db-sk l" />
      <div className="db-sk l" />
    </div>
  );
}

export default function Dashboard({ user, onEdit, onView }: Props) {
  const queryClient = useQueryClient();

  const {
    data: fiches,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useDashboardFiches();

  const [sel, setSel] = useState<string>();
  const [createOpen, setCreateOpen] = useState(false);
  const [ficheToDelete, setFicheToDelete] = useState<Fiche | null>(null);
  const [filters, setFilters] = useState(DEFAULT_FICHE_LIST_FILTERS);
  const [page, setPage] = useState(1);

  const filteredFiches = useMemo(
    () => filterFiches(fiches ?? [], filters),
    [fiches, filters]
  );

  const pageData = pageFiches(filteredFiches, page);

  const updateFilters = (next: FicheListFilters) => {
    setFilters(next);
    setPage(1);
  };

  const deleteMutation = useMutation({
    mutationKey: ["deleteFiche"],
    mutationFn: (ficheId: number) => deleteFiche(ficheId),

    onSuccess: async (_result, ficheId) => {
      setFicheToDelete(null);

      // Si la fiche supprimée était sélectionnée, ne plus la sélectionner.
      setSel(current => {
        const deletedFiche = fiches?.find(f => f.id === ficheId);
        return current === deletedFiche?.slug ? undefined : current;
      });

      // Actualiser les données du dashboard après la suppression.
      await queryClient.invalidateQueries({
        queryKey: dashboardFichesKey,
      });
    },
  });

  const handleDelete = (fiche: Fiche) => {
    deleteMutation.reset();
    setFicheToDelete(fiche);
  };

  const confirmDelete = () => {
    if (!ficheToDelete || deleteMutation.isPending) return;

    deleteMutation.mutate(ficheToDelete.id);
  };

  const handleCreated = () => {
    setCreateOpen(false);
    void queryClient.invalidateQueries({
      queryKey: dashboardFichesKey,
    });
  };

  // Priorité à l'abonnement le plus récent fourni par l'API.
  // Sinon, on recherche un abonnement actif dans la liste.
  const selectedSubscription = ficheToDelete
    ? ficheToDelete.latestSubscription ??
      ficheToDelete.subscriptions?.find(s => s.status === "ACTIVE") ??
      ficheToDelete.subscriptions?.[0]
    : undefined;

  const hasActiveSubscription =
    selectedSubscription?.status === "ACTIVE";

  const createDialog = createOpen ? (
    <div
      className="db-modal-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          setCreateOpen(false);
        }
      }}
    >
      <section
        className="db-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="db-create-title"
      >
        <header className="db-create-modal-head">
          <div>
            <p className="db-k">Nouvelle fiche</p>
            <h2 id="db-create-title">Créer une fiche</h2>
          </div>

          <button
            type="button"
            className="db-create-close"
            onClick={() => setCreateOpen(false)}
            aria-label="Fermer la fenêtre de création"
          >
            ×
          </button>
        </header>

        <CreateFicheForm
          onCreated={handleCreated}
          onUnauthorized={() => {
            setCreateOpen(false);
            clearSession();
          }}
        />
      </section>
    </div>
  ) : null;

  if (isPending) return <Skeleton />;

  if (isError) {
    const expired = isAuthFailure(error);

    return (
      <div className="db">
        <div className="db-state" role="alert">
          <h2>
            {expired
              ? "Session expirée"
              : "Impossible de charger vos fiches"}
          </h2>

          <p>
            {expired
              ? "Reconnectez-vous pour retrouver votre espace."
              : "Vérifiez votre connexion puis réessayez."}
          </p>

          {expired ? (
            <a className="db-copy" href="/login">
              Se connecter
            </a>
          ) : (
            <button
              className="db-copy"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? "Chargement…" : "Réessayer"}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!fiches.length) {
    return (
      <div className="db">
        <div className="db-state">
          <h2>Aucune fiche pour le moment</h2>
          <p>
            Créez votre première fiche connectée pour commencer à la
            personnaliser.
          </p>

          <button
            className="db-create-btn"
            onClick={() => setCreateOpen(true)}
          >
            + Créer ma fiche
          </button>
        </div>

        {createDialog}
      </div>
    );
  }

  const cur =
    pageData.items.find(f => f.slug === sel) ?? pageData.items[0];

  const url = cur ? publicUrl(cur.slug) : "";
  const missing = cur ? checks(cur).filter(c => !c.ok) : [];
  const pc = cur ? completion(cur) : 0;

  const scans = fiches.reduce((sum, fiche) => sum + fiche.scansTotal, 0);

  const alerts = fiches.filter(
    fiche => !["ok", "draft"].includes(health(fiche))
  );

  const last = fiches.reduce(
    (latest, fiche) =>
      fiche.updatedAt > latest ? fiche.updatedAt : latest,
    fiches[0].updatedAt
  );

  return (
    <div className="db">
      <header className="db-head">
        <div className="db-head-row">
          <div>
            <p className="db-k">Espace client</p>
            <h1>Bonjour {user.name.split(" ")[0]}</h1>
            <p className="db-sub">
              Voici l’état de vos fiches connectées.
            </p>
          </div>

          <button
            className="db-create-btn"
            onClick={() => setCreateOpen(true)}
          >
            + Créer une fiche
          </button>
        </div>
      </header>

      {alerts.length > 0 && (
        <ul className="db-alerts" role="status">
          {alerts.map(fiche => (
            <li key={fiche.id} className={PILL[health(fiche)].cls}>
              <b>{displayName(fiche)}</b> —{" "}
              {PILL[health(fiche)].text(
                daysLeft(subscriptionEndsAt(fiche))
              )}
              .{" "}
              {health(fiche) === "expired" ? (
                <Link to={renewPath(fiche.id)}>Renouveler</Link>
              ) : (
                <Link to="/espace-client/abonnements">Voir</Link>
              )}
            </li>
          ))}
        </ul>
      )}

      <section className="db-kpis" aria-label="Chiffres clés">
        <div className="db-kpi">
          <span>Fiches</span>
          <b>{fiches.length}</b>
          <small>
            {fiches.filter(f => health(f) === "ok").length} en ligne
          </small>
        </div>

        <div className="db-kpi">
          <span>Passages NFC · QR</span>
          <b>{scans.toLocaleString("fr-FR")}</b>
          <small>
            {scans === 0
              ? "partagez votre QR pour commencer"
              : "toutes fiches confondues"}
          </small>
        </div>

        <div className="db-kpi">
          <span>Dernière modification</span>
          <b className="sm">{fmtDate(last)}</b>
          <small>sur l’ensemble de vos fiches</small>
        </div>
      </section>

      <div className="db-grid">
        <section aria-label="Mes fiches">
          <h2>Mes fiches</h2>

          <FicheListControls
            filters={filters}
            onChange={updateFilters}
          />

          {pageData.items.length === 0 ? (
            <div className="db-state">
              <p>Aucune fiche ne correspond à ces filtres.</p>

              <button
                className="db-copy"
                onClick={() =>
                  updateFilters(DEFAULT_FICHE_LIST_FILTERS)
                }
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            <ul className="db-list">
              {pageData.items.map(fiche => {
                const h = health(fiche);
                const c = completion(fiche);

                const subscription =
                  fiche.subscriptions?.[0] ??
                  fiche.abonnementActif;

                return (
                  <li
                    key={fiche.id}
                    className={fiche.id === cur?.id ? "on" : ""}
                  >
                    <button
                      className="db-pick"
                      onClick={() => setSel(fiche.slug)}
                      aria-pressed={fiche.id === cur?.id}
                    >
                      <span className="db-av">
                        {fiche.logo ? (
                          <img src={fiche.logo} alt="" />
                        ) : (
                          displayName(fiche).charAt(0)
                        )}
                      </span>

                      <span className="db-meta">
                        <b>{displayName(fiche)}</b>
                        <small>{fiche.fonction}</small>
                      </span>

                      {fiche.secteur && (
                        <em className="db-tag">
                          {SECTEUR_LABEL[fiche.secteur]}
                        </em>
                      )}
                    </button>

                    <div className="db-row">
                      <span className={`db-pill ${PILL[h].cls}`}>
                        {PILL[h].text(
                          daysLeft(subscriptionEndsAt(fiche))
                        )}
                      </span>

                      {subscription && (
                        <span className="db-plan">
                          {subscription.plan?.nom ??
                            subscription.plan?.type}
                        </span>
                      )}

                      {fiche.enLigneSeule &&
                        !subscription && (
                          <span className="db-plan free">
                            Créée gratuitement
                          </span>
                        )}

                      <span className="db-scans">
                        <b>{fiche.scansTotal}</b> passage
                        {fiche.scansTotal > 1 ? "s" : ""}
                      </span>

                      <span className="db-act">
                        <button onClick={() => onView(fiche.slug)}>
                          Voir
                        </button>

                        {h === "expired" && (
                          <Link
                            className="db-public-link"
                            to={renewPath(fiche.id)}
                          >
                            Renouveler
                          </Link>
                        )}

                        {h !== "draft" && (
                          <a
                            className="db-public-link"
                            href={`/f/${encodeURIComponent(fiche.slug)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Fiche publique
                          </a>
                        )}

                        <button
                          className="pri"
                          onClick={() => onEdit(fiche.id)}
                        >
                          Modifier
                        </button>

                        <button
                          type="button"
                          className="db-delete-btn"
                          onClick={() => handleDelete(fiche)}
                          disabled={deleteMutation.isPending}
                        >
                          Supprimer
                        </button>
                      </span>
                    </div>

                    <div
                      className="db-comp"
                      title={`Fiche complète à ${c} %`}
                    >
                      <i>
                        <u style={{ width: `${c}%` }} />
                      </i>
                      <span>{c} % complète</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <FichePagination
            currentPage={pageData.currentPage}
            pageCount={pageData.pageCount}
            startIndex={pageData.startIndex}
            endIndex={pageData.endIndex}
            total={filteredFiches.length}
            onPageChange={setPage}
          />
        </section>

        {cur && (
          <aside
            className="db-side"
            aria-label={`Détail de ${displayName(cur)}`}
          >
            <div className="db-card">
              <h2>Compléter « {displayName(cur)} »</h2>

              <p className="db-sub2">
                {pc === 100
                  ? "Votre fiche est complète, bravo."
                  : `${missing.length} élément${missing.length > 1 ? "s" : ""} à ajouter pour convaincre vos clients.`}
              </p>

              <ul className="db-todo">
                {checks(cur).map(check => (
                  <li
                    key={check.key}
                    className={check.ok ? "ok" : ""}
                  >
                    <span aria-hidden="true">
                      {check.ok ? "✓" : ""}
                    </span>
                    {check.label}
                  </li>
                ))}
              </ul>

              {pc < 100 && (
                <button
                  className="db-copy pri"
                  onClick={() => onEdit(cur.id)}
                >
                  Compléter ma fiche
                </button>
              )}
            </div>
          </aside>
        )}
      </div>

      {createDialog}

      {/* Modal de confirmation de suppression */}
      {ficheToDelete && (
        <div
          className="db-modal-backdrop"
          onMouseDown={event => {
            if (
              event.target === event.currentTarget &&
              !deleteMutation.isPending
            ) {
              setFicheToDelete(null);
              deleteMutation.reset();
            }
          }}
        >
          <section
            className="db-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="db-delete-title"
            aria-describedby="db-delete-description"
          >
            <div className="db-delete-icon" aria-hidden="true">
              !
            </div>

            <h2 id="db-delete-title">
              Supprimer cette fiche ?
            </h2>

            <p className="db-delete-name">
              {displayName(ficheToDelete)}
            </p>

            {hasActiveSubscription ? (
              <div className="db-delete-warning">
                <strong>Attention : abonnement actif</strong>

                <p id="db-delete-description">
                  Cette fiche possède un abonnement actif
                  {selectedSubscription?.plan?.type
                    ? ` (${selectedSubscription.plan.type})`
                    : ""}
                  {selectedSubscription?.endsAt
                    ? ` jusqu’au ${fmtDate(selectedSubscription.endsAt)}`
                    : ""}
                  .
                </p>

                <p>
                  La suppression de la fiche peut affecter
                  l’accès au service associé. Vérifiez les
                  conséquences sur l’abonnement avant de continuer.
                  La suppression ne garantit pas sa résiliation.
                </p>
              </div>
            ) : (
              <p id="db-delete-description">
                Voulez-vous vraiment supprimer cette fiche ?
                Cette action peut être définitive.
              </p>
            )}

            {deleteMutation.isError && (
              <div className="db-delete-error" role="alert">
                {isAuthFailure(deleteMutation.error)
                  ? "Votre session a expiré. Reconnectez-vous avant de réessayer."
                  : "La suppression a échoué. Vérifiez votre connexion et réessayez."}

                {isAuthFailure(deleteMutation.error) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFicheToDelete(null);
                      clearSession();
                    }}
                  >
                    Se connecter
                  </button>
                )}
              </div>
            )}

            <div className="db-delete-actions">
              <button
                type="button"
                className="db-delete-cancel"
                onClick={() => {
                  setFicheToDelete(null);
                  deleteMutation.reset();
                }}
                disabled={deleteMutation.isPending}
              >
                Annuler
              </button>

              <button
                type="button"
                className="db-delete-confirm"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending
                  ? "Suppression…"
                  : "Confirmer la suppression"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
