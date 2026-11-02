import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Stats } from "../../../types/admin";
import { adminApi } from "../admin.service";
import {
  Bars,
  Empty,
  ErrorBox,
  Kpi,
  LineChart,
  Loading,
} from "../components/ui";
import { useData } from "../hooks/useData";
import { fcfa, fdate } from "../lib/format";

type ChartMode = "bars" | "line";
type RangePreset = "7" | "30" | "90" | "365" | "custom";

const DAY_MS = 24 * 60 * 60 * 1000;
const isoDate = (date: Date) => date.toISOString().slice(0, 10);
const today = () => isoDate(new Date());
const rangeFor = (days: number) => {
  const end = new Date(`${today()}T00:00:00.000Z`);
  if (days === 365) {
    return {
      from: isoDate(
        new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 11, 1))
      ),
      to: isoDate(end),
    };
  }
  return {
    from: isoDate(new Date(end.getTime() - (days - 1) * DAY_MS)),
    to: isoDate(end),
  };
};
const compact = (n: number) =>
  n >= 1_000_000
    ? `${+(n / 1_000_000).toFixed(1)} M`
    : n >= 1000
      ? `${Math.round(n / 1000)} k`
      : String(n);

function periodLabel(value: string, grouping: "day" | "week" | "month") {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (grouping === "month") {
    return date
      .toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
      })
      .replace(".", "");
  }
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
  });
}

const subscriptionStatus: Record<string, string> = {
  pending: "En attente",
  active: "Actif",
  expired: "Expiré",
  canceled: "Annulé",
};

function RecentActivity({ stats }: { stats: Stats }) {
  const navigate = useNavigate();
  const clients = stats.derniersClients ?? [];
  const subscriptions = stats.derniersAbonnements ?? [];

  return (
    <>
      <h2 className="h3">Activité récente</h2>
      <div className="grid2">
        <section className="panel">
          <div className="panel-h">
            <h2>10 derniers clients inscrits</h2>
            <span className="adm-muted small">{clients.length} comptes</span>
          </div>
          {clients.length ? (
            <div className="table-wrap">
              <table className="adm-tbl">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>E-mail</th>
                    <th>Inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr
                      key={client.id}
                      onClick={() =>
                        navigate(`/admin/fiches?userId=${client.id}`)
                      }
                    >
                      <td data-l="Client">
                        <b>{client.nom || client.email}</b>
                      </td>
                      <td data-l="E-mail">{client.email}</td>
                      <td data-l="Inscription">{fdate(client.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>Aucun client inscrit.</Empty>
          )}
        </section>
        <section className="panel">
          <div className="panel-h">
            <h2>10 derniers abonnements</h2>
            <span className="adm-muted small">
              {subscriptions.length} abonnements
            </span>
          </div>
          {subscriptions.length ? (
            <div className="table-wrap">
              <table className="adm-tbl">
                <thead>
                  <tr>
                    <th>Fiche</th>
                    <th>Formule / statut</th>
                    <th>Créé le</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(subscription => (
                    <tr
                      key={subscription.id}
                      onClick={() =>
                        navigate(
                          `/admin/abonnements?subscriptionId=${subscription.id}`
                        )
                      }
                    >
                      <td data-l="Fiche">
                        <b>
                          {subscription.fiche?.nom ||
                            subscription.fiche?.slug ||
                            "Fiche supprimée"}
                        </b>
                        {subscription.fiche?.entreprise && (
                          <small>{subscription.fiche.entreprise}</small>
                        )}
                      </td>
                      <td data-l="Formule / statut">
                        <b>{subscription.formule}</b>
                        <small>
                          {subscriptionStatus[subscription.statut] ??
                            subscription.statut}
                          {subscription.montantFcfa !== null
                            ? ` · ${fcfa(subscription.montantFcfa)}`
                            : ""}
                        </small>
                      </td>
                      <td data-l="Créé le">{fdate(subscription.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty>Aucun abonnement enregistré.</Empty>
          )}
        </section>
      </div>
    </>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const go = (to: string) => () => navigate(`/admin${to}`);
  const [s, reload, err] = useData(() => adminApi.stats());
  const defaultRange = rangeFor(365);
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [fromInput, setFromInput] = useState(defaultRange.from);
  const [toInput, setToInput] = useState(defaultRange.to);
  const [preset, setPreset] = useState<RangePreset>("365");
  const [chartMode, setChartMode] = useState<ChartMode>("bars");
  const [rangeError, setRangeError] = useState("");
  const [rev, reloadRev, errRev] = useData(
    () => adminApi.getRevenus({ from, to }),
    [from, to]
  );

  if (err) return <ErrorBox message={err} onRetry={reload} />;
  if (!s) return <Loading />;
  const f = s.fiches;
  const setQuickRange = (value: RangePreset) => {
    setPreset(value);
    setRangeError("");
    if (value === "custom") return;
    const range = rangeFor(Number(value));
    setFrom(range.from);
    setTo(range.to);
    setFromInput(range.from);
    setToInput(range.to);
  };
  const applyCustomRange = () => {
    if (!fromInput || !toInput || fromInput > toInput) {
      setRangeError(
        "Choisissez une date de début antérieure ou égale à la date de fin."
      );
      return;
    }
    setRangeError("");
    setPreset("custom");
    setFrom(fromInput);
    setTo(toInput);
  };
  const incomeData = (rev?.encaissements ?? []).map(point => ({
    label: rev ? periodLabel(point.periode, rev.grouping) : point.periode,
    value: point.montantFcfa,
  }));
  const ficheData = (rev?.nouvellesFiches ?? []).map(point => ({
    label: rev ? periodLabel(point.periode, rev.grouping) : point.periode,
    value: point.nombre,
  }));

  return (
    <>
      <header className="ph row">
        <div>
          <p className="eyebrow">Vue d’ensemble</p>
          <h1>Tableau de bord</h1>
          <p className="lede">
            L’état des fiches connectées. Clique sur un indicateur pour afficher
            les fiches concernées.
          </p>
        </div>
      </header>

      <h2 className="h3">À traiter</h2>
      <section className="kpis">
        <Kpi
          icon="clock"
          label="Expirent sous 30 jours"
          value={f.expirentBientot}
          sub="renouvellement à relancer"
          tone={f.expirentBientot ? "warn" : undefined}
          onClick={go("/relances")}
        />
        <Kpi
          icon="x"
          label="Expirées"
          value={f.expirees}
          sub="aucun abonnement valable"
          tone={f.expirees ? "down" : undefined}
          onClick={go("/fiches?expiration=expiree")}
        />
        <Kpi
          icon="shield"
          label="Suspendues"
          value={f.suspendues}
          sub="page masquée"
          onClick={go("/fiches?statut=suspendue")}
        />
      </section>

      <h2 className="h3">Revenus </h2>
      <div className="panel dashboard-chart-controls">
        <div className="dashboard-range-control">
          <div className="dashboard-range-heading">
            <strong>Période</strong>
            <span className="dashboard-active-range" role="status">
              {preset === "custom"
                ? "Période personnalisée"
                : `Filtre actif : ${preset} jours`}
            </span>
          </div>
          <div
            className="dashboard-control-group"
            role="group"
            aria-label="Période des graphiques"
          >
            {(
              [
                ["7", "7 jours"],
                ["30", "30 jours"],
                ["90", "90 jours"],
                ["365", "12 mois"],
                ["custom", "Personnalisée"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={preset === value ? "on" : ""}
                aria-pressed={preset === value}
                onClick={() => setQuickRange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="dashboard-date-range">
          <label>
            Du
            <input
              aria-label="Date de début"
              type="date"
              value={fromInput}
              onChange={event => {
                setFromInput(event.target.value);
                setPreset("custom");
              }}
            />
          </label>
          <label>
            Au
            <input
              aria-label="Date de fin"
              type="date"
              value={toInput}
              onChange={event => {
                setToInput(event.target.value);
                setPreset("custom");
              }}
            />
          </label>
          <button
            type="button"
            className="adm-btn adm-btn-dark"
            onClick={applyCustomRange}
          >
            Appliquer
          </button>
        </div>
        {rangeError && (
          <p className="err" role="alert">
            {rangeError}
          </p>
        )}
        <label className="dashboard-chart-mode">
          Type de graphique
          <select
            aria-label="Type de graphique"
            value={chartMode}
            onChange={event => setChartMode(event.target.value as ChartMode)}
          >
            <option value="bars">Barres</option>
            <option value="line">Courbes</option>
          </select>
        </label>
      </div>

      {errRev ? (
        <ErrorBox message={errRev} onRetry={reloadRev} />
      ) : !rev ? (
        <Loading />
      ) : (
        <>
          <section className="kpis">
            <Kpi
              icon="check"
              label="Encaissé sur la période"
              value={fcfa(rev.encaisse.montantFcfa)}
              sub={
                rev.encaisse.evolutionPct === null
                  ? "pas de période précédente à comparer"
                  : `${rev.encaisse.evolutionPct >= 0 ? "+" : ""}${rev.encaisse.evolutionPct} % vs période précédente`
              }
              tone={
                rev.encaisse.evolutionPct !== null &&
                rev.encaisse.evolutionPct < 0
                  ? "down"
                  : undefined
              }
            />
            {/* <Kpi
              icon="clock"
              label="Période précédente"
              value={fcfa(rev.encaisse.periodePrecedenteFcfa)}
              sub="encaissements enregistrés"
            /> */}
            <Kpi
              icon="zap"
              label="À renouveler (30 j)"
              value={rev.aRenouveler.nb}
              sub={`≈ ${fcfa(rev.aRenouveler.montantEstimeFcfa)} au prix actuel`}
              onClick={go("/relances")}
            />
          </section>
          <div className="grid2">
            <section className="panel">
              <div className="panel-h">
                <h2>Encaissements</h2>
                <span className="adm-muted small">
                  {from} — {to}
                </span>
              </div>
              {chartMode === "bars" ? (
                <Bars data={incomeData} format={compact} />
              ) : (
                <LineChart
                  data={incomeData}
                  format={compact}
                  label="Encaissements par période"
                />
              )}
            </section>
            <section className="panel">
              <div className="panel-h">
                <h2>Nouvelles fiches</h2>
                <span className="adm-muted small">
                  {from} — {to}
                </span>
              </div>
              {chartMode === "bars" ? (
                <Bars data={ficheData} />
              ) : (
                <LineChart
                  data={ficheData}
                  label="Nouvelles fiches par période"
                />
              )}
            </section>
          </div>
        </>
      )}

      <h2 className="h3">Vue d’ensemble</h2>
      <section className="kpis">
        <Kpi
          icon="card"
          label="Fiches"
          value={f.total}
          sub={`${f.nouvellesSur30Jours} créée${f.nouvellesSur30Jours > 1 ? "s" : ""} sur 30 jours`}
          onClick={go("/fiches")}
        />
        <Kpi
          icon="users"
          label="Clients"
          value={s.clients}
          sub={`${f.sansProprietaire} fiche${f.sansProprietaire > 1 ? "s" : ""} sans propriétaire`}
          onClick={go("/clients")}
        />
        <Kpi
          icon="qrcode"
          label="Demandes de stickers"
          value={new Intl.NumberFormat("fr-FR").format(s.demandesSticker)}
          sub="toutes fiches confondues"
          onClick={go("/fiches?sticker=demande")}
        />
        <Kpi
          icon="card"
          label="Demandes de cartes"
          value={new Intl.NumberFormat("fr-FR").format(s.demandesCarte)}
          sub="en cours de production"
          tone={s.demandesCarte ? "hot" : undefined}
          onClick={go("/production")}
        />
        <Kpi
          icon="eye"
          label="Scans au total"
          value={new Intl.NumberFormat("fr-FR").format(s.scansTotal)}
          sub="toutes fiches confondues"
        />
      </section>

      <h2 className="h3">Formules en cours</h2>
      <section className="kpis">
        <Kpi
          label="Essentielle"
          value={s.formules.essentielle}
          sub="abonnements valables"
          onClick={go("/fiches?formule=essentielle")}
        />
        <Kpi
          label="Pro"
          value={s.formules.pro}
          sub="abonnements valables"
          onClick={go("/fiches?formule=pro")}
        />
        <Kpi
          label="Signature"
          value={s.formules.signature}
          sub="abonnements valables"
          onClick={go("/fiches?formule=signature")}
        />
      </section>
      <RecentActivity stats={s} />
    </>
  );
}
