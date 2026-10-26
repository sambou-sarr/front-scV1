import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../../lib/api";
import "./FicheStats.css";

const PAGE_SIZE = 10;

type CallbackRequest = {
  id: number;
  nom: string;
  telephone: string;
  createdAt: string;
  fiche: {
    id: number;
    slug: string;
    prenom: string;
    nom: string;
  };
};

type CallbackRequestsResponse = {
  demandes: CallbackRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function CallbackRequestsPage() {
  const [page, setPage] = useState(1);
  const requestsQuery = useQuery({
    queryKey: ["all-callback-requests", page, PAGE_SIZE],
    queryFn: async ({ signal }) => {
      const response = await api.get<{ rappels: CallbackRequestsResponse }>(
        `fiches/rappels?page=${page}&limit=${PAGE_SIZE}`,
        { signal },
      );
      return response.data.rappels;
    },
  });

  const data = requestsQuery.data;
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;

  return (
    <section className="callback-requests-page">
      <header className="callback-requests-header">
        <div>
          <p className="callback-requests-eyebrow">Espace client</p>
          <h1>Demandes de rappel</h1>
          <p>Retrouvez les coordonnées laissées depuis le formulaire public « Être rappelé » de toutes vos fiches.</p>
        </div>
        <button
          type="button"
          className="fiche-passage-refresh"
          onClick={() => void requestsQuery.refetch()}
          disabled={requestsQuery.isFetching}
          aria-label="Actualiser les demandes"
          title="Actualiser"
        >
          {requestsQuery.isFetching ? "…" : "↻"}
        </button>
      </header>

      {requestsQuery.isPending ? (
        <div className="callback-requests-state" role="status">Chargement des demandes…</div>
      ) : requestsQuery.isError ? (
        <div className="callback-requests-state" role="alert">
          <p>Impossible de charger les demandes de rappel.</p>
          <button type="button" onClick={() => void requestsQuery.refetch()} disabled={requestsQuery.isFetching}>
            {requestsQuery.isFetching ? "Chargement…" : "Réessayer"}
          </button>
        </div>
      ) : (
        <>
          <div className="callback-requests-summary">
            <div>
              <span>Total des demandes</span>
              <strong>{(pagination?.total ?? 0).toLocaleString("fr-FR")}</strong>
            </div>
            <p>
              {pagination?.total
                ? `Page ${pagination.page} sur ${pagination.totalPages}`
                : "Aucune demande enregistrée"}
            </p>
          </div>

          {data?.demandes.length ? (
            <div className="fiche-passage-table-wrap callback-requests-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Téléphone</th>
                    <th>Fiche concernée</th>
                    <th>Date de réception</th>
                  </tr>
                </thead>
                <tbody>
                  {data.demandes.map(demande => (
                    <tr key={demande.id}>
                      <td>{demande.nom}</td>
                      <td><a className="callback-phone" href={`tel:${demande.telephone}`}>{demande.telephone}</a></td>
                      <td>
                        <a
                          className="callback-fiche-link"
                          href={`/f/${encodeURIComponent(demande.fiche.slug)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {[demande.fiche.prenom, demande.fiche.nom].filter(Boolean).join(" ") || demande.fiche.slug}
                        </a>
                      </td>
                      <td>{formatDate(demande.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="callback-requests-empty">
              <h2>Aucune demande pour le moment</h2>
              <p>Les demandes envoyées depuis les fiches publiques apparaîtront ici.</p>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="callback-requests-pagination" aria-label="Pagination des demandes de rappel">
              <button
                type="button"
                onClick={() => setPage(current => Math.max(1, current - 1))}
                disabled={page <= 1 || requestsQuery.isFetching}
              >
                ← Précédent
              </button>
              <span>Page {pagination?.page ?? page} / {totalPages}</span>
              <button
                type="button"
                onClick={() => setPage(current => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages || requestsQuery.isFetching}
              >
                Suivant →
              </button>
            </nav>
          )}
          <p className="callback-requests-footnote">Affichage de {data?.demandes.length ?? 0} demande(s) par page, des plus récentes aux plus anciennes.</p>
        </>
      )}
    </section>
  );
}
