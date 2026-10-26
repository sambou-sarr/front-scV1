import { useEffect, useState } from 'react';
import { adminApi } from '../admin.service';
import { Badge, ErrorBox, Loading, useAction } from '../components/ui';
import { useData } from '../hooks/useData';
import { FORMULE_TONE, fcfa } from '../lib/format';
import type { Duree, Emplacements, FormuleReglage, Pack, Palier, PatchEmplacements, PatchFormule, TarifCommande } from '../../../types/admin';

// '' → null ; sinon entier ≥ min ; undefined = saisie invalide
const parse = (t: string, min: number): number | null | undefined => {
  const v = t.trim().replace(/\s/g, '');
  if (v === '') return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= min ? n : undefined;
};

// Mêmes règles que le back (parametres.schemas.ts) pour répondre sans aller-retour.
const validDurees = (l: Duree[]) => {
  const s = [...l].sort((a, b) => a.dureeMois - b.dureeMois);
  for (let i = 1; i < s.length; i++) {
    if (s[i].dureeMois === s[i - 1].dureeMois) return `Deux durées identiques (${s[i].dureeMois} mois)`;
    if (s[i].remisePct < s[i - 1].remisePct) return 'La remise ne peut pas baisser quand la durée augmente';
  }
  return null;
};
const validPaliers = (l: Palier[]) => {
  const s = [...l].sort((a, b) => a.quantiteMin - b.quantiteMin);
  for (let i = 1; i < s.length; i++) {
    if (s[i].quantiteMin === s[i - 1].quantiteMin) return `Deux paliers ont la même quantité (${s[i].quantiteMin})`;
    if (s[i].remisePct <= s[i - 1].remisePct) return 'La remise doit augmenter avec la quantité';
  }
  return null;
};
const validPacks = (unit: number | null) => (l: Pack[]) => {
  const vus = new Set<number>();
  for (const p of l) {
    if (vus.has(p.quantite)) return `Deux packs de ${p.quantite} emplacements`;
    vus.add(p.quantite);
    if (unit !== null && p.prixFcfa >= p.quantite * unit)
      return `Le pack de ${p.quantite} doit coûter moins que ${p.quantite} × ${unit} F`;
  }
  return null;
};

export default function Formules() {
  const [data, reload, err] = useData(() => adminApi.getFormules());
  const [rows, setRows] = useState<FormuleReglage[]>([]);
  const [emp, setEmp] = useState<Emplacements>({ prixUnitaireFcfa: null, packs: [] });
  const run = useAction();
  useEffect(() => { if (data) { setRows(data.formules); setEmp(data.emplacements); } }, [data]);

  if (err) return <ErrorBox message={err} onRetry={reload} />;
  if (!data) return <Loading />;
  const patch = (f: FormuleReglage) => setRows((l) => l.map((x) => (x.formule === f.formule ? f : x)));

  const saveFormule = async (f: FormuleReglage, body: PatchFormule, ok: string) => {
    const r = await run(() => adminApi.updateFormule(f.formule, body), ok);
    if (r) patch(r.formule);
    return !!r;
  };
  const saveEmp = async (body: PatchEmplacements, ok: string) => {
    const r = await run(() => adminApi.updateEmplacements(body), ok);
    if (r) setEmp(r.emplacements);
    return !!r;
  };

  return (
    <>
      <header className="ph"><p className="eyebrow">Réglages des formules</p><h1>Formules</h1>
        <p className="lede">Prix, remises et emplacements. Le prix d'un abonnement = prix mensuel × durée, moins la remise de durée, puis moins la remise de quantité (les deux se cumulent). Les abonnements déjà créés ne changent pas.</p></header>

      {/* ───── Formules : prix mensuel + valeurs par défaut ───── */}
      <div className="table-wrap"><table className="adm-tbl">
        <thead><tr><th>Formule</th><th>Prix mensuel (F / mois)</th><th>Active</th></tr></thead>
        <tbody>{rows.map((f) => (
          <tr key={f.formule} className={f.actif ? '' : 'off'}>
            <td data-l="Formule"><Badge tone={FORMULE_TONE[f.formule]}>{f.nom}</Badge></td>
            <td data-l="Prix mensuel"><NumInput value={f.prixMensuelFcfa} min={0} placeholder="à définir" label={`Prix mensuel ${f.nom}`}
              onSave={(n) => saveFormule(f, { prixMensuelFcfa: n }, n === null ? 'Prix mensuel retiré' : `Prix mensuel : ${fcfa(n)}`)} /></td>
           
            <td data-l="Active"><label className="toggle"><input type="checkbox" checked={f.actif} aria-label={`Activer ${f.nom}`}
              onChange={(e) => void saveFormule(f, { actif: e.target.checked }, e.target.checked ? 'Formule activée' : 'Formule désactivée')} /><span /></label></td>
          </tr>))}</tbody></table></div>
      <p className="adm-muted small">Le prix mensuel sert de base au calcul. Le prix et la durée « par défaut » sont proposés à l'activation manuelle d'une formule sur une fiche. Une formule désactivée ne peut plus être attribuée ni commandée ; les abonnements en cours continuent.</p>

      {/* ───── Grille standard : remet prix + remises à plat en un clic ───── */}
      <GrilleStandard onApplied={reload} />

      {/* ───── Remises par formule ───── */}
      <h2 className="sec">Remises</h2>
      <div className="grid-2">
        {rows.map((f) => (
          <section key={f.formule} className="card">
            <h3><Badge tone={FORMULE_TONE[f.formule]}>{f.nom}</Badge></h3>
            <RowsEditor<Duree>
              title="Remise selon la durée" hint="Seules les durées listées sont proposées à la commande."
              cols={[{ key: 'dureeMois', label: 'Durée', min: 1, max: 120, suffix: 'mois' }, { key: 'remisePct', label: 'Remise', min: 0, max: 90, suffix: '%' }]}
              rows={f.durees} validate={validDurees} addRow={{ dureeMois: 1, remisePct: 0 }}
              onSave={(l) => saveFormule(f, { durees: l }, 'Remises de durée enregistrées')} />
            <RowsEditor<Palier>
              title="Remise selon le nombre de fiches" hint="Calculée sur le total de fiches de cette formule dans la commande. Ex. : 10 → 10 % dès 10 fiches ; 51 → 20 % au-delà de 50."
              cols={[{ key: 'quantiteMin', label: 'À partir de', min: 2, max: 100000, suffix: 'fiches' }, { key: 'remisePct', label: 'Remise', min: 1, max: 90, suffix: '%' }]}
              rows={f.remises} validate={validPaliers} addRow={{ quantiteMin: 5, remisePct: 10 }}
              onSave={(l) => saveFormule(f, { remises: l }, 'Remises de quantité enregistrées')} />
          </section>))}
      </div>

      {/* ───── Emplacements supplémentaires ───── */}
      <h2 className="sec">Emplacements supplémentaires</h2>
      <section className="card">
        <label className="field-row">Prix d'un emplacement à l'unité (F)
          <NumInput value={emp.prixUnitaireFcfa} min={0} placeholder="à définir" label="Prix unitaire d'un emplacement"
            onSave={(n) => saveEmp({ prixUnitaireFcfa: n }, n === null ? 'Prix retiré' : `Prix enregistré : ${fcfa(n)}`)} />
        </label>
        <RowsEditor<Pack>
          title="Packs à prix fixe" hint="Un pack doit coûter moins cher que les mêmes emplacements à l'unité."
          cols={[{ key: 'quantite', label: 'Quantité', min: 2, max: 1000, suffix: 'emplacements' }, { key: 'prixFcfa', label: 'Prix', min: 1, max: 100000000, suffix: 'F' }]}
          rows={emp.packs} validate={validPacks(emp.prixUnitaireFcfa)} addRow={{ quantite: 3, prixFcfa: 1 }}
          onSave={(l) => saveEmp({ packs: l }, 'Packs enregistrés')} />
      </section>

      {/* ───── Simulateur ───── */}
      <h2 className="sec">Simulateur de prix</h2>
      <Simulateur formules={rows} emp={emp} />
    </>
  );
}

// ───────── Champ numérique : enregistre à la sortie du champ ou sur Entrée ─────────
function NumInput({ value, min, placeholder, label, onSave }: { value: number | null; min: number; placeholder: string; label: string; onSave: (n: number | null) => Promise<boolean> }) {
  const initial = value === null ? '' : String(value);
  const [v, setV] = useState(initial);
  const run = useAction();
  useEffect(() => setV(initial), [initial]);
  const save = async () => {
    if (v.trim() === initial) return;
    const n = parse(v, min);
    if (n === undefined) { setV(initial); return void run(() => Promise.reject(new Error(`Valeur invalide : un nombre entier, ${min === 0 ? 'positif' : 'au moins ' + min}.`))); }
    if (!(await onSave(n))) setV(initial);
  };
  return <input className="prix-in" inputMode="numeric" aria-label={label} placeholder={placeholder} value={v} onChange={(e) => setV(e.target.value)} onBlur={save} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />;
}

// ───────── Éditeur de liste (durées, paliers, packs) : on édite, puis « Enregistrer » ─────────
type Col = { key: string; label: string; min: number; max: number; suffix: string };

function RowsEditor<T extends Record<string, number>>({ title, hint, cols, rows, validate, addRow, onSave }: {
  title: string; hint: string; cols: Col[]; rows: T[]; addRow: T;
  validate: (l: T[]) => string | null; onSave: (l: T[]) => Promise<boolean>;
}) {
  const toDraft = (l: T[]) => l.map((r) => cols.map((c) => String(r[c.key])));
  const [d, setD] = useState<string[][]>(() => toDraft(rows));
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const sig = JSON.stringify(rows);
  useEffect(() => { setD(toDraft(rows)); setMsg(null); }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = JSON.stringify(d) !== JSON.stringify(toDraft(rows));

  const setCell = (i: number, j: number, v: string) => { setMsg(null); setD((x) => x.map((r, a) => (a === i ? r.map((c, b) => (b === j ? v : c)) : r))); };

  const save = async () => {
    const out: T[] = [];
    for (const row of d) {
      const o: Record<string, number> = {};
      for (let j = 0; j < cols.length; j++) {
        const c = cols[j];
        const n = parse(row[j], c.min);
        if (n === null || n === undefined || n > c.max) return setMsg(`${c.label} : entier entre ${c.min} et ${c.max}.`);
        o[c.key] = n;
      }
      out.push(o as T);
    }
    const e = validate(out);
    if (e) return setMsg(e);
    setBusy(true);
    const ok = await onSave(out);
    setBusy(false);
    if (!ok) setMsg('Enregistrement refusé, voir le message.');
  };

  return (
    <div className="rows-ed">
      <p className="rows-title">{title}</p>
      <p className="adm-muted small">{hint}</p>
      {d.length === 0 && <p className="adm-muted small">Aucune ligne.</p>}
      {d.map((row, i) => (
        <div className="rows-line" key={i}>
          {cols.map((c, j) => (
            <label key={c.key}><span className="sr-only">{c.label}</span>
              <input className="prix-in" inputMode="numeric" aria-label={`${title} — ${c.label} ${i + 1}`} value={row[j]} onChange={(e) => setCell(i, j, e.target.value)} />
              <span className="adm-muted small"> {c.suffix}</span></label>))}
          <button type="button" className="adm-btn-ghost" aria-label="Supprimer la ligne" onClick={() => { setMsg(null); setD((x) => x.filter((_, a) => a !== i)); }}>✕</button>
        </div>))}
      <div className="rows-actions">
        <button type="button" className="adm-btn-ghost" onClick={() => { setMsg(null); setD((x) => [...x, cols.map((c) => String(addRow[c.key]))]); }}>+ Ajouter</button>
        <button type="button" className="adm-btn" disabled={!dirty || busy} onClick={save}>{busy ? '…' : 'Enregistrer'}</button>
      </div>
      {msg && <p className="err small" role="alert">{msg}</p>}
    </div>
  );
}

// ───────── Simulateur : appelle POST /commande/tarif avec les réglages en vigueur ─────────
function Simulateur({ formules, emp }: { formules: FormuleReglage[]; emp: Emplacements }) {
  const actives = formules.filter((f) => f.actif);
  const [formule, setFormule] = useState('');
  const [duree, setDuree] = useState('');
  const [qte, setQte] = useState('1');
  const [nbEmp, setNbEmp] = useState('0');
  const [res, setRes] = useState<TarifCommande | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const f = actives.find((x) => x.formule === formule) ?? actives[0];
  const durees = f?.durees ?? [];
  const dureeN = durees.some((d) => String(d.dureeMois) === duree) ? Number(duree) : durees[0]?.dureeMois;
  const q = parse(qte, 1);
  const e = parse(nbEmp, 0);
  // clé qui change dès qu'un réglage change → le calcul se rafraîchit tout seul
  const sig = JSON.stringify([f, emp]);

  useEffect(() => {
    if (!f || dureeN === undefined || !q || e === undefined || e === null) { setRes(null); setErr(null); return; }
    let vivant = true;
    const t = setTimeout(async () => {
      try {
        const r = await adminApi.tarifCommande({ lignes: [{ formule: f.formule, dureeMois: dureeN, quantite: q }], ...(e > 0 && { emplacements: e }) });
        if (vivant) { setRes(r); setErr(null); }
      } catch (x) { if (vivant) { setRes(null); setErr(x instanceof Error ? x.message : 'Calcul impossible'); } }
    }, 300);
    return () => { vivant = false; clearTimeout(t); };
  }, [f?.formule, dureeN, q, e, sig]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!f) return <p className="adm-muted">Aucune formule active à simuler.</p>;
  const l = res?.lignes[0];

  return (
    <section className="card">
      <div className="sim-form">
        <label>Formule <select value={f.formule} onChange={(x) => setFormule(x.target.value)}>{actives.map((a) => <option key={a.formule} value={a.formule}>{a.nom}</option>)}</select></label>
        <label>Durée <select value={dureeN ?? ''} onChange={(x) => setDuree(x.target.value)} disabled={!durees.length}>{durees.map((d) => <option key={d.dureeMois} value={d.dureeMois}>{d.dureeMois} mois</option>)}</select></label>
        <label>Fiches <input className="prix-in" inputMode="numeric" value={qte} onChange={(x) => setQte(x.target.value)} /></label>
        <label>Emplacements en plus <input className="prix-in" inputMode="numeric" value={nbEmp} onChange={(x) => setNbEmp(x.target.value)} /></label>
      </div>
      {!durees.length && <p className="adm-muted small">Ajoute au moins une durée à cette formule pour la simuler.</p>}
      {err && <p className="err small" role="alert">{err}</p>}
      {res && l && (
        <dl className="sim-res">
          <dt>Prix mensuel</dt><dd>{fcfa(l.prixMensuelFcfa)} × {l.dureeMois} mois</dd>
          <dt>Remise de durée</dt><dd>{l.remiseDureePct} % → {fcfa(l.prixApresDureeFcfa)} / fiche</dd>
          <dt>Remise de quantité</dt><dd>{l.remiseQuantitePct} % → {fcfa(l.prixUnitaireFcfa)} / fiche</dd>
          <dt>Fiches ({l.quantite})</dt><dd>{fcfa(l.totalFcfa)}</dd>
          {res.emplacements && (<>
            <dt>Emplacements ({res.emplacements.quantite})</dt>
            <dd>{fcfa(res.emplacements.totalFcfa)}
              <span className="adm-muted small"> — {[...res.emplacements.detail.packs.map((p) => `${p.nombre} pack${p.nombre > 1 ? 's' : ''} de ${p.quantite}`), res.emplacements.detail.unitaires ? `${res.emplacements.detail.unitaires} à l'unité` : ''].filter(Boolean).join(' + ')}</span></dd>
          </>)}
          <dt className="total">Total</dt><dd className="total">{fcfa(res.totalFcfa)}{res.economieFcfa > 0 && <span className="adm-muted small"> (économie : {fcfa(res.economieFcfa)})</span>}</dd>
        </dl>)}
    </section>
  );
}

// ───────── Grille de départ ─────────
// C'est la grille de la procédure de commande. Si les tarifs changent un jour,
// on les modifie directement dans les champs de la page ; cette constante ne sert
// qu'à tout remettre à plat en un clic.
//   · quantité : 10 fiches ou plus → 10 %, plus de 50 fiches (donc 51) → 20 %
//   · durée    : 1 mois → 0 %, 3 mois → 10 %, 12 mois → 20 %
//   · Essentiel : 1000 F, 1 mois, aucune remise (prix fixe du schéma)
const DUREES = [
  { dureeMois: 1, remisePct: 0 },
  { dureeMois: 3, remisePct: 10 },
  { dureeMois: 12, remisePct: 20 },
];
const PALIERS = [
  { quantiteMin: 10, remisePct: 10 },
  { quantiteMin: 51, remisePct: 20 },
];

const GRILLE: { formule: FormuleReglage['formule']; nom: string; body: PatchFormule }[] = [
  { formule: 'essentielle', nom: 'Essentiel', body: { prixMensuelFcfa: 1000, durees: [{ dureeMois: 1, remisePct: 0 }], remises: [] } },
  { formule: 'pro', nom: 'Pro', body: { prixMensuelFcfa: 2500, durees: DUREES, remises: PALIERS } },
  { formule: 'signature', nom: 'Signature', body: { prixMensuelFcfa: 5000, durees: DUREES, remises: PALIERS } },
];

function GrilleStandard({ onApplied }: { onApplied: () => void }) {
  const run = useAction();

  const appliquer = async () => {
    if (!window.confirm('Remplacer les prix mensuels et toutes les remises (durée et quantité) des 3 formules par la grille standard ?')) return;
    // Une seule action : un seul message, et on s'arrête à la première erreur.
    // `true` en retour = succès (useAction renvoie ce que renvoie la fonction).
    const ok = await run(async () => {
      for (const g of GRILLE) await adminApi.updateFormule(g.formule, g.body);
      return true;
    }, 'Grille standard appliquée');
    if (ok) onApplied(); // recharge la page : champs et simulateur repartent des nouvelles valeurs
  };

  return (
    <section className="card">
      <h3>Grille standard</h3>
      <ul className="adm-muted small">
        {GRILLE.map((g) => (
          <li key={g.formule}>
            <strong>{g.nom}</strong> : {fcfa(g.body.prixMensuelFcfa ?? 0)} / mois
            {g.body.remises && g.body.remises.length > 0 && ' · remise quantité dès 10 fiches (10 %) et au-delà de 50 (20 %)'}
            {g.body.durees && g.body.durees.length > 1 && ' · durée : 3 mois −10 %, 12 mois −20 %'}
          </li>
        ))}
      </ul>
      <p className="adm-muted small">Ne touche ni à l'état actif des formules, ni aux emplacements, ni aux abonnements déjà créés.</p>
      <div className="rows-actions">
        <button type="button" className="adm-btn" onClick={appliquer}>Appliquer la grille standard</button>
      </div>
    </section>
  );
}