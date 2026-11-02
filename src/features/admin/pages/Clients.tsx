import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import { adminApi } from '../admin.service';
import { Badge, Btn, Empty, ErrorBox, Field, Icon, Loading, Modal, Pager, useAction } from '../components/ui';
import { useData, useDebounced } from '../hooks/useData';
import { fdate } from '../lib/format';

export default function Clients() {
  const navigate = useNavigate();
  const [text, setText] = useState(''), [role, setRole] = useState(''), [page, setPage] = useState(1);
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const search = useDebounced(text.trim(), 300);
  const run = useAction();
  useEffect(() => setPage(1), [search]);
  const [data, reload, err] = useData(() => adminApi.listUsers({ search: search || undefined, role: (role || undefined) as 'client' | 'admin' | undefined, page, limit: 20 }), [search, role, page]);

  const submitAdmin = async (event: FormEvent) => {
    event.preventDefault();
    if (sendingInvite || !adminName.trim() || !adminEmail.trim()) return;
    setSendingInvite(true);
    const result = await run(
      () => adminApi.createAdmin({ nom: adminName.trim(), email: adminEmail.trim() }),
      'Invitation administrateur envoyée par e-mail.',
    );
    setSendingInvite(false);
    if (result) {
      setAddAdminOpen(false);
      setAdminName('');
      setAdminEmail('');
      reload();
    }
  };

  return (
    <>
      <header className="ph row"><div><p className="eyebrow">Comptes</p><h1>Clients</h1><p className="lede">Les comptes inscrits. Un client voit ses fiches après avoir saisi le code de sa carte.</p></div><div className="ph-actions"><Btn kind="red" icon="plus" onClick={() => setAddAdminOpen(true)}>Ajouter un administrateur</Btn></div></header>
      <div className="filters">
        <label className="search"><Icon n="search" /><input placeholder="E-mail ou nom…" value={text} onChange={(e) => setText(e.target.value)} /></label>
        <select value={role} onChange={(e: ChangeEvent<HTMLSelectElement>) => { setRole(e.target.value); setPage(1); }} aria-label="Rôle"><option value="">Tous les rôles</option><option value="client">Clients</option><option value="admin">Administrateurs</option></select>
      </div>
      {err ? <ErrorBox message={err} onRetry={reload} /> : !data ? <Loading /> : data.users.length ? <>
        <div className="table-wrap"><table className="adm-tbl">
          <thead><tr><th>Compte</th><th>Rôle</th><th>E-mail</th><th>Fiches</th><th>Inscrit le</th></tr></thead>
          <tbody>{data.users.map((u) => (
            <tr key={u.id} onClick={() => navigate(`/admin/fiches?userId=${u.id}`)}>
              <td data-l="Compte"><b>{u.nom || u.email}</b>{u.nom && <small>{u.email}</small>}</td>
              <td data-l="Rôle">{u.role === 'admin' ? <Badge tone="dark">Admin</Badge> : <Badge>Client</Badge>}</td>
              <td data-l="E-mail">{u.emailVerifie ? <Badge tone="green">Vérifié</Badge> : <Badge tone="gold">Non vérifié</Badge>}</td>
              <td data-l="Fiches">{u.nbFiches ? <Link className="link" to={`/admin/fiches?userId=${u.id}`} onClick={(e) => e.stopPropagation()}>{u.nbFiches}</Link> : 0}</td>
              <td data-l="Inscrit le">{fdate(u.createdAt)}</td>
            </tr>))}</tbody></table></div>
        <Pager page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} noun="compte" onPage={setPage} />
      </> : <Empty>Aucun compte trouvé.</Empty>}
      {addAdminOpen && <Modal title="Ajouter un administrateur" onClose={() => !sendingInvite && setAddAdminOpen(false)}>
        <form className="form" onSubmit={submitAdmin}>
          <p className="adm-muted">Un lien sécurisé sera envoyé par e-mail pour définir son mot de passe. Le lien expire après 24 heures.</p>
          <Field label="Nom complet"><input required minLength={2} maxLength={100} autoComplete="name" autoFocus value={adminName} onChange={event => setAdminName(event.target.value)} /></Field>
          <Field label="Adresse e-mail"><input required type="email" maxLength={254} autoComplete="email" value={adminEmail} onChange={event => setAdminEmail(event.target.value)} /></Field>
          <div className="form-a"><Btn disabled={sendingInvite} onClick={() => setAddAdminOpen(false)}>Annuler</Btn><Btn type="submit" kind="red" disabled={sendingInvite || !adminName.trim() || !adminEmail.trim()}>{sendingInvite ? 'Envoi de l’invitation…' : 'Créer et inviter'}</Btn></div>
        </form>
      </Modal>}
    </>
  );
}
