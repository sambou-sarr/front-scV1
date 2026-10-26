import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../admin.service';
import { Badge, Empty, ErrorBox, Icon, Loading } from '../components/ui';
import { useData } from '../hooks/useData';
import { FORMULES, FORMULE_TONE, fdate } from '../lib/format';
import { waLink } from '../lib/whatsapp';
import type { RelanceItem, RelanceType } from '../../../types/admin';

const TABS: { id: RelanceType; label: string; aide: string }[] = [
  { id: 'bientot', label: 'À renouveler', aide: 'Abonnement qui se termine dans les 30 jours. Les plus proches en premier.' },
  { id: 'expirees', label: 'Expirées', aide: 'Plus aucun abonnement valable. Les plus scannées en premier : ce sont les plus faciles à récupérer.' },
  { id: 'montee', label: 'Montée en gamme', aide: 'Formule Essentielle déjà scannée au moins 50 fois : bon moment pour proposer la Pro.' },
];
type RelanceFilter = RelanceType | 'toutes';

export default function Relances() {
  const [tab, setTab] = useState<RelanceFilter>('toutes');
  const [data, reload, err] = useData(() => Promise.all(TABS.map((t) => adminApi.getRelances(t.id))));
  if (err) return <ErrorBox message={err} onRetry={reload} />;
  if (!data) return <Loading />;
  const allItems = new Map<number, { item: RelanceItem; type: RelanceType }>();
  data.forEach((page, i) => page.items.forEach((item) => {
    if (!allItems.has(item.id)) allItems.set(item.id, { item, type: TABS[i].id });
  }));
  const selectedTab = TABS.find((t) => t.id === tab);
  const selected = tab === 'toutes'
    ? [...allItems.values()]
    : data[TABS.findIndex((t) => t.id === tab)].items.map((item) => ({ item, type: tab }));
  const aide = tab === 'toutes'
    ? 'Toutes les fiches à relancer : renouvellements, fiches expirées et opportunités de montée en gamme.'
    : selectedTab!.aide;

  return (
    <>
      <header className="ph"><p className="eyebrow">Suivi commercial</p><h1>Relances</h1>
        <p className="lede">Les fiches à contacter. Le bouton WhatsApp ouvre la conversation avec un message prêt : tu le relis, puis tu l’envoies.</p></header>

      <div className="filters">
        <button className={`adm-chip${tab === 'toutes' ? ' on' : ''}`} onClick={() => setTab('toutes')}>Toutes ({allItems.size})</button>
        {TABS.map((t, i) => <button key={t.id} className={`adm-chip${tab === t.id ? ' on' : ''}`} onClick={() => setTab(t.id)}>{t.label} ({data[i].total})</button>)}
      </div>
      <p className="adm-muted small">{aide}</p>

      {selected.length ? <>
        <div className="table-wrap"><table className="adm-tbl">
          <thead><tr><th>Fiche</th><th>Formule</th><th>Échéance</th><th>Scans</th><th>Contact</th><th /></tr></thead>
          <tbody>{selected.map(({ item, type }) => <Row key={item.id} r={item} type={type} />)}</tbody></table></div>
        {selectedTab && data[TABS.indexOf(selectedTab)].total > selected.length &&
          <p className="adm-muted small">{selected.length} affichées sur {data[TABS.indexOf(selectedTab)].total}.</p>}
      </> : <Empty>Rien à relancer ici pour le moment.</Empty>}
    </>
  );
}

function Row({ r, type }: { r: RelanceItem; type: RelanceType }) {
  const navigate = useNavigate();
  const wa = waLink(type, r);
  const j = r.joursRestants;
  return (
    <tr onClick={() => navigate(`/admin/fiches/${r.id}`)}>
      <td data-l="Fiche"><Link to={`/admin/fiches/${r.id}`} onClick={(e) => e.stopPropagation()}><b>{r.entreprise || r.nom}</b></Link><small>{r.entreprise ? `${r.nom} · ` : ''}/{r.slug}</small></td>
      <td data-l="Formule"><Badge tone={FORMULE_TONE[r.formule]}>{FORMULES[r.formule]}</Badge></td>
      <td data-l="Échéance">{r.dateEcheance ? <>{fdate(r.dateEcheance)}{j !== null && <small>{j >= 0 ? `dans ${j} j` : `expirée depuis ${-j} j`}</small>}</> : '—'}</td>
      <td data-l="Scans">{r.scansTotal}</td>
      <td data-l="Contact">{r.whatsapp || r.telephone || r.email || <span className="adm-muted">Aucun</span>}</td>
      <td onClick={(e) => e.stopPropagation()}>{wa ? <a className="adm-btn adm-btn-ghost" href={wa} target="_blank" rel="noreferrer"><Icon n="ext" s={16} />WhatsApp</a> : <span className="adm-muted small">Pas de numéro</span>}</td>
    </tr>
  );
}
