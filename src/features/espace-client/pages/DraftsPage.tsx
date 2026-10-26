import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ApiFicheSummary } from "../../../types";
import { useDashboardFiches } from "../hooks/useDashboardFiches";
import { FichePagination } from "../components/FicheListControls";
import { FICHE_PAGE_SIZE, pageFiches } from "../lib/ficheList";

function DraftCard({
  fiche,
  onEdit,
}: {
  fiche: ApiFicheSummary;
  onEdit: (id: number) => void;
}) {
  return (
    <article className="flex flex-col gap-4 border-b border-[#eee9e1] px-5 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {fiche.logo ? (
          <img
            src={fiche.logo}
            alt=""
            className="h-12 w-12 shrink-0 rounded-xl border border-[#e3dfd8] object-cover"
          />
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#f4f1eb] text-sm font-semibold text-[#6d665d]">
            {(fiche.entreprise || fiche.prenom).charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-[#111111]">
            {fiche.entreprise || `${fiche.prenom} ${fiche.nom}`.trim()}
          </h2>
          <p className="mt-1 truncate text-sm text-[#6d665d]">
            {[fiche.fonction, fiche.secteur?.toLowerCase()]
              .filter(Boolean)
              .join(" · ") || "Nouvelle fiche"}
          </p>
          <p className="mt-1 text-xs text-[#8d8a85]">
            Créée le{" "}
            {new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(new Date(fiche.createdAt))}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onEdit(fiche.id)}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#08090A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c9142b] focus:outline-none focus:ring-2 focus:ring-[#EF1733] focus:ring-offset-2"
      >
        Éditer la fiche <span aria-hidden="true">↗</span>
      </button>
    </article>
  );
}

export default function DraftsPage() {
  const navigate = useNavigate();
  const { data: fiches = [], isPending, isError, refetch, isFetching } =
    useDashboardFiches();
  const [page, setPage] = useState(1);
  const drafts = useMemo(
    () => fiches.filter(fiche => fiche.statut === "BROUILLON"),
    [fiches],
  );
  const pageData = pageFiches(drafts, page, FICHE_PAGE_SIZE);

  return (
    <div className="min-h-full bg-transparent px-4 py-6 text-[#111111] sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-7">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#EF1733]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#EF1733]" />
            Espace client
          </div>
          <h1 className="font-[Cormorant_Garamond,Georgia,serif] text-4xl font-semibold tracking-tight text-[#08090A] sm:text-5xl">
            Mes brouillons
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d665d] sm:text-base">
            Les fiches nouvellement créées restent privées jusqu’à leur
            publication. Éditez-les pour les compléter et les publier.
          </p>
        </header>

        <section
          className="overflow-hidden rounded-2xl border border-[#e3dfd8] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.05)]"
          aria-label="Fiches en brouillon"
        >
          <div className="flex items-center justify-between border-b border-[#eee9e1] px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#08090A]">
                Fiches à terminer
              </h2>
              <p className="mt-1 text-sm text-[#6d665d]">
                {drafts.length} brouillon{drafts.length > 1 ? "s" : ""}
              </p>
            </div>
            <span className="rounded-full bg-[#f4f1eb] px-3 py-1.5 text-xs font-medium text-[#6d665d]">
              Privées
            </span>
          </div>

          {isPending ? (
            <div
              className="px-6 py-16 text-center text-sm text-[#6d665d]"
              role="status"
            >
              Chargement des brouillons…
            </div>
          ) : isError ? (
            <div className="px-6 py-12 text-center" role="alert">
              <p className="font-semibold">Impossible de charger vos brouillons</p>
              <p className="mt-2 text-sm text-[#6d665d]">
                Vérifiez votre connexion puis réessayez.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                disabled={isFetching}
                className="mt-4 rounded-xl bg-[#08090A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isFetching ? "Chargement…" : "Réessayer"}
              </button>
            </div>
          ) : drafts.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <div
                className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#f4f1eb] text-2xl text-[#6d665d]"
                aria-hidden="true"
              >
                ▤
              </div>
              <h2 className="mt-4 font-semibold text-[#111111]">
                Aucun brouillon
              </h2>
              <p className="mt-1 text-sm text-[#6d665d]">
                Les nouvelles fiches apparaîtront ici jusqu’à leur publication.
              </p>
            </div>
          ) : (
            <>
              {pageData.items.map(fiche => (
                <DraftCard
                  key={fiche.id}
                  fiche={fiche}
                  onEdit={id => navigate(`/espace-client/editeur/${id}`)}
                />
              ))}
              <FichePagination
                currentPage={pageData.currentPage}
                pageCount={pageData.pageCount}
                startIndex={pageData.startIndex}
                endIndex={pageData.endIndex}
                total={drafts.length}
                onPageChange={setPage}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
