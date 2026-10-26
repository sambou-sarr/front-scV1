import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import type { ApiFicheSummary } from "../../../types";
import { StatCard } from "../components/StatCard";
import { CardRequestPanel } from "../components/CardRequestPanel";
import {
  FicheListControls,
  FichePagination,
} from "../components/FicheListControls";
import { PaymentModal } from "../components/subscription/PaymentModal";
import {
  getPlan,
  initials,
  PlanPill,
  PlansPanel,
} from "../components/subscription/PlansPanel";
import { getDashboardFiche, getKpi } from "../espaceClient.service";
import {
  DEFAULT_FICHE_LIST_FILTERS,
  filterFiches,
  pageFiches,
  type FicheListFilters,
} from "../lib/ficheList";

export type SubscriptionKpi = {
  data: {
    nbrFiche: number;
    nbrFicheActive: number;
    nbrPayingFiche: number;
  };
};

function getSubscriptionExpiry(fiche: ApiFicheSummary) {
  const subscription =
    fiche.subscriptions?.[0] ??
    fiche.latestSubscription ??
    fiche.abonnementActif;
  if (!subscription)
    return { dateLabel: "Aucun abonnement actif", remainingLabel: null };

  const endsAt = subscription.endsAt;
  if (endsAt === null)
    return {
      dateLabel:
        subscription.status === "CANCELED"
          ? "Abonnement annulé"
          : subscription.status === "EXPIRED"
            ? "Abonnement expiré"
            : "Sans échéance",
      remainingLabel: null,
    };

  const endDate = new Date(`${endsAt.slice(0, 10)}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const daysRemaining = Math.ceil(
    (endDate.getTime() - today.getTime()) / 86_400_000,
  );

  return {
    dateLabel: new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(endDate),
    remainingLabel:
      daysRemaining < 0
        ? "Échéance dépassée"
        : daysRemaining === 0
          ? "Expire aujourd’hui"
          : `${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} restant${daysRemaining > 1 ? "s" : ""}`,
  };
}

function SubscriptionExpiry({ fiche }: { fiche: ApiFicheSummary }) {
  const expiry = getSubscriptionExpiry(fiche);
  return (
    <div className="text-sm text-[#6d665d]">
      <span>{expiry.dateLabel}</span>
      {expiry.remainingLabel && (
        <span className="mt-1 block text-xs text-[#8d8a85]">
          {expiry.remainingLabel}
        </span>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const [paymentFiche, setPaymentFiche] = useState<ApiFicheSummary | null>(null);
  const [cardFiche, setCardFiche] = useState<ApiFicheSummary | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FICHE_LIST_FILTERS);
  const [page, setPage] = useState(1);
  useEffect(() => {
    if (!cardFiche) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCardFiche(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [cardFiche]);
  // 1. Récupération des fiches
  const {
    data: fiches,
    isPending: isFichesPending,
    isError: isFichesError,
    error: fichesError,
    refetch,
    isFetching,
  } = useQuery<ApiFicheSummary[]>({
    queryKey: ["ficheSubscriptionPage"],
    queryFn: ({ signal }) => getDashboardFiche(signal),
  });

  const ficheCount = fiches?.length ?? 0;
  const filteredFiches = useMemo(
    () => filterFiches(fiches ?? [], filters),
    [fiches, filters],
  );
  const pageData = pageFiches(filteredFiches, page);
  const updateFilters = (next: FicheListFilters) => {
    setFilters(next);
    setPage(1);
  };

  // 2. Récupération des KPIs
  const { data: kpi } = useQuery<SubscriptionKpi>({
    queryKey: ["kpiSubscription"],
    queryFn: getKpi,
  });
  return (
    <div className="min-h-full bg-transparent px-4 py-6 text-[#111111] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#EF1733]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#EF1733]" /> Espace
              client
            </div>
            <h1 className="font-[Cormorant_Garamond,Georgia,serif] text-4xl font-semibold tracking-tight text-[#08090A] sm:text-5xl">
              Abonnements & formules
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d665d] sm:text-base">
              Retrouvez vos fiches et découvrez la formule qui correspond à vos
              besoins.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPlans(value => !value)}
            aria-expanded={showPlans}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[#e3dfd8] bg-white px-4 py-3 text-sm font-semibold text-[#25221e] shadow-[0_6px_20px_rgba(0,0,0,0.05)] transition hover:border-[#08090A] hover:bg-[#f4f1eb] md:self-auto"
          >
            <span aria-hidden="true">✦</span>
            {showPlans ? "Masquer nos formules" : "Voir nos formules"}
            <span
              className={`transition-transform ${showPlans ? "rotate-180" : ""}`}
              aria-hidden="true"
            >
              ⌄
            </span>
          </button>
        </header>
        <section
          aria-label="Statistiques"
          className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <StatCard
            label="Toutes mes fiches"
            caption="Fiches enregistrées"
            icon="▤"
            stat={kpi?.data.nbrFiche as number}
          />
          <StatCard
            label="Fiches actives"
            caption="Prêtes à être consultées"
            icon="↗"
            stat={kpi?.data.nbrFicheActive as number}
          />
          <StatCard
            label="Abonnements payants"
            caption="Formules Pro et Signature"
            icon="✧"
            stat={kpi?.data.nbrPayingFiche as number}
          />
        </section>
        <div
          className={`grid items-start gap-6 ${showPlans ? "xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,1fr)]" : "grid-cols-1"}`}
        >
          <section
            className="min-w-0 overflow-hidden rounded-2xl border border-[#e3dfd8] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)] shadow-black/[0.05]"
            aria-labelledby="subscription-fiches-title"
          >
            <div className="flex flex-col justify-between gap-3 border-b border-[#eee9e1] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
              <div>
                <h2
                  id="subscription-fiches-title"
                  className="text-lg font-semibold tracking-tight text-[#08090A]"
                >
                  Mes fiches
                </h2>
                <p className="mt-1 text-sm text-[#6d665d]">
                  {ficheCount} fiche{ficheCount > 1 ? "s" : ""} au total
                </p>
              </div>
              <span className="inline-flex w-fit items-center rounded-full bg-[#eee9e1] px-3 py-1.5 text-xs font-medium text-[#6d665d]">
                Données de votre espace client
              </span>
            </div>
            {isFichesPending ? (
              <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-[#6d665d]">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#e3dfd8] border-t-rose-600" />
                Chargement des fiches…
              </div>
            ) : isFichesError ? (
              <div className="px-6 py-12 text-center" role="alert">
                <p className="font-semibold text-[#111111]">
                  Impossible de charger vos fiches
                </p>
                <p className="mt-2 text-sm text-[#6d665d]">
                  {isAxiosError(fichesError) &&
                  fichesError.response?.status === 401
                    ? "Votre session a expiré. Reconnectez-vous pour continuer."
                    : "Vérifiez votre connexion puis réessayez."}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="mt-4 rounded-xl bg-[#08090A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isFetching ? "Chargement…" : "Réessayer"}
                </button>
              </div>
            ) : !fiches?.length ? (
              <div className="px-6 py-14 text-center">
                <div
                  className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eee9e1] text-2xl text-[#6d665d]"
                  aria-hidden="true"
                >
                  ▤
                </div>
                <h3 className="mt-4 font-semibold text-[#111111]">
                  Aucune fiche pour le moment
                </h3>
                <p className="mt-1 text-sm text-[#6d665d]">
                  Vos fiches apparaîtront ici dès qu'elles seront disponibles.
                </p>
              </div>
            ) : (
              <>
                <FicheListControls
                  filters={filters}
                  onChange={updateFilters}
                />
                {pageData.items.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-[#6d665d]">
                      Aucune fiche ne correspond à ces filtres.
                    </p>
                    <button
                      type="button"
                      onClick={() => updateFilters(DEFAULT_FICHE_LIST_FILTERS)}
                      className="mt-3 rounded-lg border border-[#e3dfd8] bg-white px-3 py-2 text-sm font-semibold text-[#25221e]"
                    >
                      Effacer les filtres
                    </button>
                  </div>
                ) : (
                <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead className="bg-[#f7f5f1] text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6d665d]">
                      <tr>
                        <th className="px-5 py-3.5">Fiche</th>
                        <th className="px-4 py-3.5">Formule</th>
                        <th className="px-4 py-3.5">Secteur</th>
                        <th className="px-4 py-3.5">Téléphone</th>
                        <th className="px-4 py-3.5">WhatsApp</th>
                        <th className="px-4 py-3.5">Échéance</th>
                        <th className="px-5 py-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pageData.items.map(fiche => (
                        <tr
                          key={fiche.id}
                          className="transition hover:bg-transparent"
                        >
                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              {fiche.logo ? (
                                <img
                                  src={fiche.logo}
                                  alt={`Logo de ${fiche.prenom} ${fiche.nom}`}
                                  className="h-10 w-10 shrink-0 rounded-xl border border-[#e3dfd8] object-cover"
                                />
                              ) : (
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#08090A] text-xs font-bold tracking-wide text-white">
                                  {initials(fiche.prenom, fiche.nom)}
                                </span>
                              )}
                              <div className="min-w-0">
                                <p className="max-w-[200px] truncate text-sm font-semibold text-[#111111]">
                                  {fiche.prenom} {fiche.nom}
                                </p>
                                <p className="mt-0.5 max-w-[200px] truncate text-xs text-[#8d8a85]">
                                  {fiche.entreprise ||
                                    fiche.fonction ||
                                    "Fiche professionnelle"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <PlanPill plan={getPlan(fiche)} />
                          </td>
                          <td className="px-4 py-4 text-sm text-[#6d665d]">
                            {fiche.secteur
                              ? fiche.secteur.charAt(0) +
                                fiche.secteur.slice(1).toLowerCase()
                              : "—"}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#6d665d]">
                            {fiche.telephone || "—"}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#6d665d]">
                            {fiche.whatsapp || "—"}
                          </td>
                          <td className="px-4 py-4 text-sm text-[#6d665d]">
                            <SubscriptionExpiry fiche={fiche} />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex flex-col items-end gap-2">
                              <button
                                type="button"
                                onClick={() => setPaymentFiche(fiche)}
                                className="whitespace-nowrap rounded-lg bg-[#08090A] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#c9142b] focus:outline-none focus:ring-2 focus:ring-[#EF1733] focus:ring-offset-2"
                              >
                                Voir formule <span aria-hidden="true">↗</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setCardFiche(fiche)}
                                disabled={fiche.statut !== "ACTIVE" || !getPlan(fiche)}
                                title={
                                  fiche.statut !== "ACTIVE" || !getPlan(fiche)
                                    ? "Une fiche publiée avec un abonnement actif est nécessaire."
                                    : undefined
                                }
                                className="whitespace-nowrap rounded-lg border border-[#e3dfd8] bg-white px-3.5 py-2 text-xs font-semibold text-[#25221e] transition hover:border-[#08090A] hover:bg-[#f7f5f1] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Demander une carte
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="divide-y divide-slate-100 md:hidden">
                  {pageData.items.map(fiche => (
                    <article key={fiche.id} className="p-4">
                      <div className="flex items-start gap-3">
                        {fiche.logo ? (
                          <img
                            src={fiche.logo}
                            alt={`Logo de ${fiche.prenom} ${fiche.nom}`}
                            className="h-12 w-12 shrink-0 rounded-xl border border-[#e3dfd8] object-cover"
                          />
                        ) : (
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#08090A] text-xs font-bold text-white">
                            {initials(fiche.prenom, fiche.nom)}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-[#111111]">
                            {fiche.prenom} {fiche.nom}
                          </h3>
                          <p className="mt-1 text-xs text-[#6d665d]">
                            {fiche.secteur
                              ? fiche.secteur.charAt(0) +
                                fiche.secteur.slice(1).toLowerCase()
                              : "Secteur non renseigné"}
                          </p>
                          <div className="mt-2">
                            <PlanPill plan={getPlan(fiche)} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#f4f1eb] p-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-[#8d8a85]">
                            Téléphone
                          </p>
                          <p className="mt-1 break-words text-sm text-[#4a443c]">
                            {fiche.telephone || "—"}
                          </p>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-[#8d8a85]">
                            WhatsApp
                          </p>
                          <p className="mt-1 break-words text-sm text-[#4a443c]">
                            {fiche.whatsapp || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl bg-[#f4f1eb] px-3 py-2">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[#8d8a85]">
                          Échéance
                        </p>
                        <SubscriptionExpiry fiche={fiche} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentFiche(fiche)}
                        className="mt-3 w-full rounded-xl bg-[#08090A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c9142b]"
                      >
                        Voir formule <span aria-hidden="true">↗</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardFiche(fiche)}
                        disabled={fiche.statut !== "ACTIVE" || !getPlan(fiche)}
                        className="mt-2 w-full rounded-xl border border-[#e3dfd8] bg-white px-4 py-3 text-sm font-semibold text-[#25221e] transition hover:border-[#08090A] hover:bg-[#f7f5f1] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Demander une carte
                      </button>
                    </article>
                  ))}
                </div>
                </>
                )}
                <FichePagination
                  currentPage={pageData.currentPage}
                  pageCount={pageData.pageCount}
                  startIndex={pageData.startIndex}
                  endIndex={pageData.endIndex}
                  total={filteredFiches.length}
                  onPageChange={setPage}
                />
              </>
            )}
          </section>
          {showPlans && <PlansPanel onClose={() => setShowPlans(false)} />}
        </div>
        <p className="mt-6 text-xs leading-5 text-[#8d8a85]">
          Les tarifs et remises affichés proviennent des paramètres actifs. Le
          montant final est confirmé par le serveur avant validation.
        </p>
      </div>
      {paymentFiche && (
        <PaymentModal
          fiche={paymentFiche}
          onClose={() => setPaymentFiche(null)}
          onSuccess={() => {
            void queryClient.invalidateQueries({
              queryKey: ["ficheSubscriptionPage"],
            });
            void queryClient.invalidateQueries({
              queryKey: ["kpiSubscription"],
            });
          }}
        />
      )}
      {cardFiche && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="card-request-dialog-title"
        >
          <div className="my-auto w-full max-w-3xl rounded-2xl bg-[#f7f5f1] p-3 shadow-2xl sm:p-5">
            <div className="flex items-center justify-between gap-4 px-2 pb-3">
              <h2
                id="card-request-dialog-title"
                className="font-semibold text-[#111111]"
              >
                Demande de carte — {cardFiche.prenom} {cardFiche.nom}
              </h2>
              <button
                type="button"
                autoFocus
                onClick={() => setCardFiche(null)}
                aria-label="Fermer la demande de carte"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-xl text-[#6d665d] hover:bg-white"
              >
                ×
              </button>
            </div>
            <CardRequestPanel
              ficheId={cardFiche.id}
              formula={getPlan(cardFiche) ?? "essentielle"}
              eligible={cardFiche.statut === "ACTIVE" && !!getPlan(cardFiche)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
