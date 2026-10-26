import { useNavigate } from 'react-router-dom';
import { adminApi } from '../admin.service';
import { Bars, ErrorBox, Kpi, Loading } from '../components/ui';
import { useData } from '../hooks/useData';
import { fcfa } from '../lib/format';

const moisCourt = (m: string) => new Date(`${m}-01T12:00:00Z`).toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '');
const jourMois = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const compact = (n: number) => (n >= 1_000_000 ? `${+(n / 1_000_000).toFixed(1)} M` : n >= 1000 ? `${Math.round(n / 1000)} k` : String(n));

export default function Dashboard() {
  const navigate = useNavigate();
  const go = (to: string) => () => navigate(`/admin${to}`);
  const [s, reload, err] = useData(() => adminApi.stats());
  const [rev, reloadRev, errRev] = useData(() => adminApi.getRevenus());
  if (err) return <ErrorBox message={err} onRetry={reload} />;
  if (!s) return <Loading />;
  const f = s.fiches;
  return (
    <>
      <header className="ph row">
        <div><p className="eyebrow">Vue d’ensemble</p><h1>Tableau de bord</h1><p className="lede">L’état des fiches connectées. Clique sur un indicateur pour afficher les fiches concernées.</p></div>
      </header>

      <h2 className="h3">À traiter</h2>
      <section className="kpis">
        <Kpi icon="clock" label="Expirent sous 30 jours" value={f.expirentBientot} sub="renouvellement à relancer" tone={f.expirentBientot ? 'warn' : undefined} onClick={go('/relances')} />
        <Kpi icon="x" label="Expirées" value={f.expirees} sub="aucun abonnement valable" tone={f.expirees ? 'down' : undefined} onClick={go('/fiches?expiration=expiree')} />
        <Kpi icon="shield" label="Suspendues" value={f.suspendues} sub="page masquée" onClick={go('/fiches?statut=suspendue')} />
      </section>

      <h2 className="h3">Revenus</h2>
      {errRev ? <ErrorBox message={errRev} onRetry={reloadRev} /> : !rev ? <Loading /> : <>
        <section className="kpis">
          <Kpi icon="check" label="Encaissé ce mois" value={fcfa(rev.encaisse.ceMois)}
            sub={rev.encaisse.evolutionPct === null ? 'pas de mois précédent à comparer' : `${rev.encaisse.evolutionPct >= 0 ? '+' : ''}${rev.encaisse.evolutionPct} % vs mois précédent`}
            tone={rev.encaisse.evolutionPct !== null && rev.encaisse.evolutionPct < 0 ? 'down' : undefined} />
          <Kpi icon="clock" label="Mois précédent" value={fcfa(rev.encaisse.moisPrecedent)} sub="paiements enregistrés" />
          <Kpi icon="zap" label="À renouveler (30 j)" value={rev.aRenouveler.nb} sub={`≈ ${fcfa(rev.aRenouveler.montantEstimeFcfa)} au prix actuel`} onClick={go('/relances')} />
        </section>
        <div className="grid2">
          <section className="panel"><div className="panel-h"><h2>Encaissements par mois</h2><span className="adm-muted small">12 derniers mois</span></div>
            <Bars data={rev.mois.map((m) => ({ label: moisCourt(m.mois), value: m.montantFcfa }))} format={compact} /></section>
          <section className="panel"><div className="panel-h"><h2>Nouvelles fiches par semaine</h2><span className="adm-muted small">12 dernières semaines</span></div>
            <Bars data={rev.fichesParSemaine.map((w) => ({ label: jourMois(w.semaine), value: w.nb }))} /></section>
        </div>
      </>}

      <h2 className="h3">Vue d’ensemble</h2>
      <section className="kpis">
        <Kpi icon="card" label="Fiches" value={f.total} sub={`${f.nouvellesSur30Jours} créée${f.nouvellesSur30Jours > 1 ? 's' : ''} sur 30 jours`} onClick={go('/fiches')} />
        <Kpi icon="users" label="Clients" value={s.clients} sub={`${f.sansProprietaire} fiche${f.sansProprietaire > 1 ? 's' : ''} sans propriétaire`} onClick={go('/clients')} />
        <Kpi icon="eye" label="Scans au total" value={new Intl.NumberFormat('fr-FR').format(s.scansTotal)} sub="toutes fiches confondues" />
      </section>

      <h2 className="h3">Formules en cours</h2>
      <section className="kpis">
        <Kpi label="Essentielle" value={s.formules.essentielle} sub="abonnements valables" onClick={go('/fiches?formule=essentielle')} />
        <Kpi label="Pro" value={s.formules.pro} sub="abonnements valables" onClick={go('/fiches?formule=pro')} />
        <Kpi label="Signature" value={s.formules.signature} sub="abonnements valables" onClick={go('/fiches?formule=signature')} />
      </section>
    </>
  );
}
