import { useState } from 'react';
import { adminApi } from '../admin.service';
import { useData, useDebounced } from '../hooks/useData';
import type { FicheRow } from '../../../types/admin';

/** Recherche d'une fiche par nom, entreprise, adresse ou téléphone. */
export default function FichePicker({ onPick }: { onPick: (f: FicheRow) => void }) {
  const [text, setText] = useState('');
  const search = useDebounced(text.trim(), 300);
  const [res, , err] = useData(() => (search.length >= 2 ? adminApi.listFiches({ search, limit: 6 }) : Promise.resolve(null)), [search]);
  return (
    <div className="picker">
      <input placeholder="Rechercher une fiche (nom, entreprise, adresse…)" value={text} onChange={(e) => setText(e.target.value)} />
      {err && <small className="err">{err}</small>}
      {res && (res.fiches.length ? <ul className="pick-list">{res.fiches.map((f) => (
        <li key={f.id}><button type="button" onClick={() => onPick(f)}><b>{f.entreprise || f.nom}</b><span>{f.entreprise ? `${f.nom} · ` : ''}/{f.slug}</span></button></li>))}</ul>
        : <p className="empty">Aucune fiche trouvée.</p>)}
    </div>
  );
}
