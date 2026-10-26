import type { ApiSecteur, PlanType } from "../../../types";
import type { FicheListFilters } from "../lib/ficheList";
import { SECTEUR_LABEL } from "../lib/dashboard";

interface FiltersProps {
  filters: FicheListFilters;
  onChange: (filters: FicheListFilters) => void;
}

const fieldClass =
  "min-h-10 rounded-lg border border-[#e3dfd8] bg-white px-3 text-sm text-[#25221e] outline-none focus:border-[#08090A] focus:ring-2 focus:ring-[#08090A]/10";

export function FicheListControls({ filters, onChange }: FiltersProps) {
  const update = <K extends keyof FicheListFilters>(
    key: K,
    value: FicheListFilters[K],
  ) => onChange({ ...filters, [key]: value });

  return (
    <div className="grid gap-3 border-b border-[#eee9e1] bg-[#faf9f7] px-5 py-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="sr-only" htmlFor="fiche-filter-search">
        Rechercher une fiche
      </label>
      <input
        id="fiche-filter-search"
        className={`${fieldClass} sm:col-span-2 lg:col-span-1`}
        type="search"
        placeholder="Nom, prénom, activité…"
        value={filters.search}
        onChange={event => update("search", event.target.value)}
      />
      <label className="sr-only" htmlFor="fiche-filter-plan">
        Filtrer par formule
      </label>
      <select
        id="fiche-filter-plan"
        className={fieldClass}
        value={filters.plan}
        onChange={event =>
          update("plan", event.target.value as "all" | PlanType)
        }
      >
        <option value="all">Toutes les formules</option>
        <option value="ESSENTIELLE">Essentielle</option>
        <option value="PRO">Pro</option>
        <option value="SIGNATURE">Signature</option>
      </select>
      <label className="sr-only" htmlFor="fiche-filter-status">
        Filtrer par statut
      </label>
      <select
        id="fiche-filter-status"
        className={fieldClass}
        value={filters.status}
        onChange={event =>
          update(
            "status",
            event.target.value as FicheListFilters["status"],
          )
        }
      >
        <option value="all">Tous les statuts</option>
        <option value="active">Active</option>
        <option value="expired">Expirée</option>
        <option value="suspended">Suspendue</option>
        <option value="draft">Brouillon</option>
      </select>
      <label className="sr-only" htmlFor="fiche-filter-sector">
        Filtrer par secteur
      </label>
      <select
        id="fiche-filter-sector"
        className={fieldClass}
        value={filters.sector}
        onChange={event =>
          update("sector", event.target.value as "all" | ApiSecteur)
        }
      >
        <option value="all">Tous les secteurs</option>
        {Object.entries(SECTEUR_LABEL).map(([sector, label]) => (
          <option key={sector} value={sector}>
            {label}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor="fiche-filter-expiry">
        Filtrer par échéance
      </label>
      <select
        id="fiche-filter-expiry"
        className={fieldClass}
        value={filters.expiry}
        onChange={event =>
          update("expiry", event.target.value as FicheListFilters["expiry"])
        }
      >
        <option value="all">Toutes les échéances</option>
        <option value="expiring">Expire dans les 30 jours</option>
        <option value="expired">Échéance dépassée</option>
        <option value="no-expiry">Sans échéance</option>
      </select>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  pageCount: number;
  startIndex: number;
  endIndex: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function FichePagination({
  currentPage,
  pageCount,
  startIndex,
  endIndex,
  total,
  onPageChange,
}: PaginationProps) {
  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 border-t border-[#eee9e1] px-5 py-4 text-sm text-[#6d665d] sm:flex-row"
      aria-label="Pagination des fiches"
    >
      <p aria-live="polite">
        {total === 0
          ? "Aucune fiche ne correspond aux filtres"
          : `${startIndex}–${endIndex} sur ${total} fiche${total > 1 ? "s" : ""}`}
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className={`${fieldClass} px-3 disabled:cursor-not-allowed disabled:opacity-45`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Précédent
        </button>
        <span aria-current="page">
          Page {currentPage} sur {pageCount}
        </span>
        <button
          type="button"
          className={`${fieldClass} px-3 disabled:cursor-not-allowed disabled:opacity-45`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pageCount}
        >
          Suivant
        </button>
      </div>
    </nav>
  );
}
