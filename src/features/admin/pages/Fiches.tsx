import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { adminApi } from '../admin.service';
import { Badge, Empty, ErrorBox, Icon, Loading, Pager } from '../components/ui';
import { useData, useDebounced } from '../hooks/useData';
import { FORMULES, FORMULE_TONE, fdate } from '../lib/format';

type Filters = { search: string; statut: string; formule: string; expiration: string; carteALier: string; tri: string; userId: string };
const FROM_URL = (q: URLSearchParams): Filters => ({
  search: q.get('search') ?? '', statut: q.get('statut') ?? '', formule: q.get('formule') ?? '', expiration: q.get('expiration') ?? '',
  carteALier: q.get('carteALier') ?? '', tri: q.get('tri') ?? 'recent', userId: q.get('userId') ?? '',
});

export default function Fiches() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const [f, setF] = useState<Filters>(() => FROM_URL(query));
  const [page, setPage] = useState(1);
  const [text, setText] = useState(f.search);
  const search = useDebounced(text.trim(), 300);
  useEffect(() => { setF((x) => (x.search === search ? x : { ...x, search })); setPage(1); }, [search]);

  const [data, reload, err] = useData(() => adminApi.listFiches({ ...f, page, limit: 20 }), [f.search, f.statut, f.formule, f.expiration, f.carteALier, f.tri, f.userId, page]);
  const set = (k: keyof Filters) => (e: ChangeEvent<HTMLSelectElement>) => { setF((x) => ({ ...x, [k]: e.target.value })); setPage(1); };
  const filtered = !!(f.search || f.statut || f.formule || f.expiration || f.carteALier || f.userId);
  const reset = () => { setF({ ...FROM_URL(new URLSearchParams()) }); setText(''); setPage(1); };

  return (
    <>
      <header className="ph">
        <div><p className="eyebrow">Cartes</p><h1>Fiches</h1><p className="lede">Toutes les fiches connectées : formule, échéance, propriétaire. Clique sur une ligne pour la gérer.</p></div>
      </header>

      <div className="filters">
        <label className="search"><Icon n="search" /><input placeholder="Nom, entreprise, adresse, téléphone, e-mail…" value={text} onChange={(e) => setText(e.target.value)} /></label>
        <select value={f.formule} onChange={set('formule')} aria-label="Formule"><option value="">Formule</option>{Object.entries(FORMULES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select value={f.statut} onChange={set('statut')} aria-label="Statut"><option value="">Statut</option><option value="active">Active</option><option value="suspendue">Suspendue</option></select>
        <select value={f.expiration} onChange={set('expiration')} aria-label="Échéance"><option value="">Échéance</option><option value="bientot">Expire sous 30 jours</option><option value="expiree">Expirée</option></select>
        <select value={f.carteALier} onChange={set('carteALier')} aria-label="Carte"><option value="">Carte</option><option value="true">Code à lier</option><option value="false">Sans code</option></select>
        <select value={f.tri} onChange={set('tri')} aria-label="Tri"><option value="recent">Plus récentes</option><option value="scans">Plus scannées</option><option value="nom">Par nom</option></select>
        {f.userId && <button className="adm-chip on" onClick={() => setF((x) => ({ ...x, userId: '' }))}>Fiches d’un client ✕</button>}
        {filtered && <button className="link small" onClick={reset}>Tout effacer</button>}
      </div>

      {err ? <ErrorBox message={err} onRetry={reload} /> : !data ? <Loading /> : data.fiches.length ? <>
        <div className="table-wrap"><table className="adm-tbl">
          <thead><tr><th>Fiche</th><th>Formule</th><th>Statut</th><th>Propriétaire</th><th>Échéance</th><th>Scans</th></tr></thead>
          <tbody>{data.fiches.map((x) => (
            <tr key={x.id} onClick={() => navigate(`/admin/fiches/${x.id}`)}>
              <td data-l="Fiche"><Link to={`/admin/fiches/${x.id}`} onClick={(e) => e.stopPropagation()}><b>{x.entreprise || x.nom}</b></Link><small>{x.entreprise ? `${x.nom} · ` : ''}/{x.slug}</small></td>
              <td data-l="Formule"><Badge tone={FORMULE_TONE[x.formule]}>{FORMULES[x.formule]}</Badge>{x.expiree && <Badge tone="red">Expirée</Badge>}</td>
              <td data-l="Statut">{x.statut === 'active' ? <Badge tone="green">Active</Badge> : <Badge tone="grey">Suspendue</Badge>}</td>
              <td data-l="Propriétaire">{x.proprietaire ? <><b>{x.proprietaire.nom || x.proprietaire.email}</b>{x.proprietaire.nom && <small>{x.proprietaire.email}</small>}</>
                : x.carteALier ? <Badge tone="gold">Carte à lier</Badge> : <span className="adm-muted">Aucun</span>}</td>
              <td data-l="Échéance">{x.dateEcheance ? fdate(x.dateEcheance) : x.expiree ? '—' : 'Sans échéance'}</td>
              <td data-l="Scans">{x.scansTotal}</td>
            </tr>))}</tbody></table></div>
        <Pager page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} noun="fiche" onPage={setPage} />
      </> : <Empty>{filtered ? 'Aucune fiche ne correspond à ces filtres.' : 'Aucune fiche pour le moment.'}</Empty>}

    </>
  );
}
