import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../../lib/api";
import { CardRequestPanel } from "../components/CardRequestPanel";
import Fiche from "../components/Fiche";
import { fetchFiche } from "../lib/ficheApi";
import "./FicheStats.css";

type PassageStats = {
  ficheId: number;
  granularity: "day" | "month";
  filters: { date: string | null; month: string | null };
  totals: { qr: number; nfc: number; direct: number; total: number };
  history: Array<{
    period: string;
    qr: number;
    nfc: number;
    direct: number;
    total: number;
  }>;
};

function PassageStatsPanel({ ficheId }: { ficheId: number }) {
  const [granularity, setGranularity] = useState<"day" | "month">("month");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");

  const statsQuery = useQuery({
    queryKey: ["fiche-passage-stats", ficheId, granularity, date, month],
    enabled: Number.isInteger(ficheId) && ficheId > 0,
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ granularity });
      if (granularity === "day" && date) params.set("date", date);
      if (granularity === "month" && month) params.set("month", month);
      const response = await api.get<{ stats: PassageStats }>(
        `fiches/${ficheId}/stats?${params.toString()}`,
        { signal },
      );
      return response.data.stats;
    },
  });

  const stats = statsQuery.data;
  const countCards = [
    { label: "Total des passages", value: stats?.totals.total ?? 0, key: "total" },
    { label: "QR code", value: stats?.totals.qr ?? 0, key: "qr" },
    { label: "NFC", value: stats?.totals.nfc ?? 0, key: "nfc" },
    { label: "Accès directs / autres", value: stats?.totals.direct ?? 0, key: "direct" },
  ];

  return (
    <aside className="fiche-passage-panel" aria-labelledby="fiche-passage-title">
      <div className="fiche-passage-heading">
        <div>
          <h2 id="fiche-passage-title">Statistiques des passages</h2>
          <p>Chaque ouverture valide est comptabilisée.</p>
        </div>
        <button
          type="button"
          className="fiche-passage-refresh"
          onClick={() => void statsQuery.refetch()}
          disabled={statsQuery.isFetching}
          aria-label="Actualiser les statistiques"
          title="Actualiser"
        >
          {statsQuery.isFetching ? "…" : "↻"}
        </button>
      </div>

      <div className="fiche-passage-filters">
        <label>
          Regroupement
          <select
            value={granularity}
            onChange={event => setGranularity(event.target.value as "day" | "month")}
          >
            <option value="month">Par mois</option>
            <option value="day">Par jour</option>
          </select>
        </label>
        {granularity === "day" ? (
          <label>
            Filtrer par date
            <input type="date" value={date} onChange={event => setDate(event.target.value)} />
          </label>
        ) : (
          <label>
            Filtrer par mois
            <input type="month" value={month} onChange={event => setMonth(event.target.value)} />
          </label>
        )}
        <p className="fiche-passage-filter-hint">
          Sans filtre, tout l’historique détaillé disponible est affiché.
        </p>
        <p className="fiche-passage-filter-hint">
          Les anciens compteurs sans date ni source ne peuvent pas être répartis rétroactivement entre QR, NFC et accès directs.
        </p>
      </div>

      {statsQuery.isPending ? (
        <p className="fiche-passage-state" role="status">Chargement des statistiques…</p>
      ) : statsQuery.isError ? (
        <div className="fiche-passage-state" role="alert">
          <p>Impossible de charger les statistiques.</p>
          <button type="button" onClick={() => void statsQuery.refetch()}>Réessayer</button>
        </div>
      ) : (
        <>
          <div className="fiche-passage-cards">
            {countCards.map(card => (
              <div className="fiche-passage-card" key={card.key}>
                <span>{card.label}</span>
                <strong>{card.value.toLocaleString("fr-FR")}</strong>
              </div>
            ))}
          </div>
          <div className="fiche-passage-history">
            <h3>Historique {granularity === "day" ? "journalier" : "mensuel"}</h3>
            {stats?.history.length ? (
              <div className="fiche-passage-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{granularity === "day" ? "Date" : "Mois"}</th>
                      <th>Total</th>
                      <th>QR</th>
                      <th>NFC</th>
                      <th>Direct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...stats.history].reverse().map(row => (
                      <tr key={row.period}>
                        <td>{row.period}</td>
                        <td>{row.total.toLocaleString("fr-FR")}</td>
                        <td>{row.qr.toLocaleString("fr-FR")}</td>
                        <td>{row.nfc.toLocaleString("fr-FR")}</td>
                        <td>{row.direct.toLocaleString("fr-FR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="fiche-passage-empty">Aucun passage enregistré pour cette période.</p>
            )}
          </div>
        </>
      )}
    </aside>
  );
}


type RappelRequest = {
  id: number;
  nom: string;
  telephone: string;
  createdAt: string;
};

type RappelsResponse = {
  ficheId: number;
  total: number;
  demandes: RappelRequest[];
};

function RappelsPanel({ ficheId }: { ficheId: number }) {
  const rappelsQuery = useQuery({
    queryKey: ["fiche-rappels", ficheId],
    enabled: Number.isInteger(ficheId) && ficheId > 0,
    queryFn: async ({ signal }) => {
      const response = await api.get<{ rappels: RappelsResponse }>(
        `fiches/${ficheId}/rappels`,
        { signal },
      );
      return response.data.rappels;
    },
  });

  return (
    <section className="fiche-passage-panel fiche-rappels-panel" aria-labelledby="fiche-rappels-title">
      <div className="fiche-passage-heading">
        <div>
          <h2 id="fiche-rappels-title">Demandes de rappel</h2>
          <p>Les coordonnées laissées depuis le bloc « Être rappelé ».</p>
        </div>
        <button
          type="button"
          className="fiche-passage-refresh"
          onClick={() => void rappelsQuery.refetch()}
          disabled={rappelsQuery.isFetching}
          aria-label="Actualiser les demandes"
          title="Actualiser"
        >
          {rappelsQuery.isFetching ? "…" : "↻"}
        </button>
      </div>

      {rappelsQuery.isPending ? (
        <p className="fiche-passage-state" role="status">Chargement des demandes…</p>
      ) : rappelsQuery.isError ? (
        <div className="fiche-passage-state" role="alert">
          <p>Impossible de charger les demandes de rappel.</p>
          <button type="button" onClick={() => void rappelsQuery.refetch()}>Réessayer</button>
        </div>
      ) : (
        <>
          <div className="fiche-passage-cards fiche-rappel-summary">
            <div className="fiche-passage-card">
              <span>Total des demandes enregistrées</span>
              <strong>{(rappelsQuery.data?.total ?? 0).toLocaleString("fr-FR")}</strong>
            </div>
          </div>
          {rappelsQuery.data?.demandes.length ? (
            <div className="fiche-passage-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Téléphone</th>
                    <th>Date de la demande</th>
                  </tr>
                </thead>
                <tbody>
                  {rappelsQuery.data.demandes.map(demande => (
                    <tr key={demande.id}>
                      <td>{demande.nom}</td>
                      <td><a href={`tel:${demande.telephone}`}>{demande.telephone}</a></td>
                      <td>{new Intl.DateTimeFormat("fr-FR", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(demande.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="fiche-passage-empty">Aucune demande de rappel pour le moment.</p>
          )}
          <p className="fiche-passage-filter-hint">
            Les demandes les plus récentes sont affichées en premier (maximum 100).
          </p>
        </>
      )}
    </section>
  );
}

function FicheDashboardPanel({
  ficheId,
  formula,
  eligible,
}: {
  ficheId: number;
  formula: string;
  eligible: boolean;
}) {
  const [activeSection, setActiveSection] = useState<
    "overview" | "rappels" | "carte"
  >("overview");
  const sections = [
    { id: "overview" as const, label: "Statistiques", description: "Passages et sources" },
    { id: "rappels" as const, label: "Demandes de rappel", description: "Coordonnées reçues" },
    { id: "carte" as const, label: "Carte", description: "Carte physique NFC" },
  ];

  return (
    <div className="fiche-dashboard">
      <header className="fiche-dashboard-header">
        <div>
          <h2>Tableau de bord de la fiche</h2>
          <p>Retrouvez ici les statistiques et les interactions reçues. D’autres modules pourront être ajoutés sans modifier les blocs existants.</p>
        </div>
      </header>
      <nav className="fiche-dashboard-nav" aria-label="Rubriques du tableau de bord de la fiche">
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            className={activeSection === section.id ? "active" : ""}
            aria-current={activeSection === section.id ? "page" : undefined}
            onClick={() => setActiveSection(section.id)}
          >
            <strong>{section.label}</strong>
            <span>{section.description}</span>
          </button>
        ))}
      </nav>
      {activeSection === "overview" ? (
        <PassageStatsPanel ficheId={ficheId} />
      ) : activeSection === "rappels" ? (
        <RappelsPanel ficheId={ficheId} />
      ) : (
        <CardRequestPanel
          ficheId={ficheId}
          formula={formula}
          eligible={eligible}
        />
      )}
    </div>
  );
}

export function FichePage() {
  const { id } = useParams<{ id: string }>();
  const ficheId = Number(id);
  const phoneScroller = useRef<HTMLDivElement>(null);

  const {
    data: fiche,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["fiche-preview", ficheId],
    enabled: Number.isInteger(ficheId) && ficheId > 0,
    queryFn: ({ signal }) => fetchFiche(`fiches/${ficheId}`, signal),
  });

  if (!Number.isInteger(ficheId) || ficheId <= 0) {
    return (
      <div className="fiche-preview-state" role="alert">
        <h1>Fiche invalide</h1>
        <p>L’identifiant de la fiche est invalide.</p>
        <Link to="/espace-client">Retour au tableau de bord</Link>
      </div>
    );
  }

  if (isPending) {
    return (
      <p className="fiche-preview-state" role="status">
        Chargement de la prévisualisation…
      </p>
    );
  }

  if (isError) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const message =
      status === 401
        ? "Votre session a expiré. Reconnectez-vous pour accéder à cette fiche."
        : status === 403 || status === 404
          ? "Cette fiche est introuvable ou vous n’avez pas le droit d’y accéder."
          : "Impossible de charger cette fiche. Vérifiez votre connexion puis réessayez.";

    return (
      <div className="fiche-preview-state" role="alert">
        <h1>Prévisualisation indisponible</h1>
        <p>{message}</p>
        {status === 401 ? (
          <Link to="/login">Se connecter</Link>
        ) : (
          <button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Chargement…" : "Réessayer"}
          </button>
        )}
        <p>
          <Link to="/espace-client">Retour au tableau de bord</Link>
        </p>
      </div>
    );
  }

  if (!fiche) {
    return <p className="fiche-preview-state">Aucune fiche trouvée.</p>;
  }

  return (
    <section
      aria-label={`Prévisualisation de la fiche de ${fiche.prenom} ${fiche.nom}`}
    >
      <div className="fiche-preview-toolbar">
        <Link to="/espace-client">← Retour au tableau de bord</Link>
        <a
          href={`/f/${encodeURIComponent(fiche.slug)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fiche-public-link"
        >
          Fiche publique ↗
        </a>
        <span>La prévisualisation privée ne compte pas comme passage.</span>
      </div>
      <div className="fiche-preview-layout">
        <div className="fiche-preview-stage">
          <div className="fiche-preview-device">
            <div className="fiche-preview-device-in" ref={phoneScroller}>
              <Fiche key={fiche.id} fiche={fiche} scrollerRef={phoneScroller} ownerTools />
            </div>
          </div>
        </div>
        <FicheDashboardPanel
          ficheId={fiche.id}
          formula={fiche.formule}
          eligible={fiche.statut === "ACTIVE" && !fiche.expiree}
        />
      </div>
    </section>
  );
}
