import { useState } from 'react';
import { adminApi } from '../admin.service';
import { Badge } from './ui';
import { useData, useDebounced } from '../hooks/useData';
import type { UserRow } from '../../../types/admin';

/** Recherche d'un compte client par e-mail ou nom. */
export default function UserPicker({ onPick, hint }: { onPick: (u: UserRow) => void; hint?: string }) {
  const [text, setText] = useState('');
  const search = useDebounced(text.trim(), 300);
  const [res, , err] = useData(() => (search.length >= 2 ? adminApi.listUsers({ search, limit: 6 }) : Promise.resolve(null)), [search]);
  return (
    <div className="picker">
      <input placeholder="Rechercher par e-mail ou nom…" value={text} onChange={(e) => setText(e.target.value)} />
      {hint && <small className="adm-muted">{hint}</small>}
      {err && <small className="err">{err}</small>}
      {res && (res.users.length ? <ul className="pick-list">{res.users.map((u) => (
        <li key={u.id}><button type="button" onClick={() => onPick(u)}><b>{u.email}</b><span>{u.nom || '—'} · {u.nbFiches} fiche{u.nbFiches > 1 ? 's' : ''}{u.role === 'admin' && <Badge tone="dark">admin</Badge>}</span></button></li>))}</ul>
        : <p className="empty">Aucun compte trouvé. Le client doit d’abord s’inscrire.</p>)}
    </div>
  );
}
