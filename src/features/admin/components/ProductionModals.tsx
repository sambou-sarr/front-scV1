import { useState } from 'react';
import type { FormEvent } from 'react';
import { adminApi } from '../admin.service';
import { FORMULES } from '../lib/format';
import { CHAMPS, FN } from '../lib/production';
import { Btn, Field, Modal, Seg, useAction } from './ui';
import FichePicker from './FichePicker';
import type { CreateStickerInput, Fonction, FicheRow, Formule } from '../../../types/admin';

const FichePicked = ({ f, onClear }: { f: FicheRow; onClear: () => void }) => (
  <p className="picked-fiche"><b>{f.entreprise || f.nom}</b><span className="adm-muted">/{f.slug}</span><button type="button" className="link small" onClick={onClear}>changer</button></p>
);

// ───────── Nouvelle carte NFC ─────────
export function NouvelleCarteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [fiche, setFiche] = useState<FicheRow | null>(null);
  const [tier, setTier] = useState<'' | Formule>('');
  const [busy, setBusy] = useState(false);
  const run = useAction();
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!fiche) return;
    setBusy(true);
    const r = await run(() => adminApi.createCarte({ ficheId: fiche.id, tier: tier || undefined }), 'Carte ajoutée à la production');
    setBusy(false);
    if (r) { onCreated(); onClose(); }
  };
  return (
    <Modal title="Nouvelle carte" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <div className="field"><span className="field-l">Fiche</span>{fiche ? <FichePicked f={fiche} onClear={() => setFiche(null)} /> : <FichePicker onPick={setFiche} />}</div>
        <Field label="Formule de la carte" hint="Vide = formule en cours de la fiche"><select value={tier} onChange={(e) => setTier(e.target.value as '' | Formule)}>
          <option value="">Automatique</option>{Object.entries(FORMULES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></Field>
        <p className="note-gold">L’adresse écrite dans la puce est figée à la création. Fixe l’adresse de la fiche avant d’encoder : si elle change ensuite, la carte devra être ré-encodée.</p>
        <div className="form-a"><Btn onClick={onClose}>Annuler</Btn><button className="adm-btn adm-btn-red" type="submit" disabled={!fiche || busy}>Créer la carte</button></div>
      </form>
    </Modal>
  );
}

// ───────── Nouveau sticker ─────────
const TAILLES = [[80, '8 cm'], [120, '12 cm'], [170, '17 cm']] as const;

export function NouveauStickerModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [kind, setKind] = useState<'fonction' | 'telephone'>('fonction');
  const [fonction, setFonction] = useState<Fonction>('avis');
  const [taille, setTaille] = useState<80 | 120 | 170>(120);
  const [forme, setForme] = useState<'rond' | 'carre'>('rond');
  const [theme, setTheme] = useState<'noir' | 'blanc' | 'or' | 'rouge'>('noir');
  const [quantite, setQuantite] = useState('1');
  const [nfc, setNfc] = useState(false), [antiMetal, setAntiMetal] = useState(false);
  const [p, setP] = useState<Record<string, string>>({});
  const [security, setSecurity] = useState<'WPA' | 'WEP' | 'aucune'>('WPA'), [hidden, setHidden] = useState(false);
  const [fiche, setFiche] = useState<FicheRow | null>(null);
  const [coul, setCoul] = useState('#0b0b0c'), [fond, setFond] = useState('#ffffff'), [texte, setTexte] = useState('');
  const [busy, setBusy] = useState(false);
  const run = useAction();
  const setParam = (k: string, v: string) => setP((x) => ({ ...x, [k]: v }));
  const qte = Math.max(1, Math.min(10000, Math.round(Number(quantite) || 1)));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    let body: CreateStickerInput;
    if (kind === 'telephone') {
      if (!fiche) return void run(() => Promise.reject(new Error('Choisis la fiche dont le QR sera copié.')));
      body = { kind, ficheId: fiche.id, quantite: qte, personnalisation: { couleur_qr: coul, fond, ...(texte.trim() && { texte: texte.trim() }) } };
    } else {
      const parametres: Record<string, string | boolean> = {};
      for (const k of ['etablissement', ...CHAMPS[fonction].map((c) => c.k)]) if (p[k]?.trim()) parametres[k] = p[k].trim();
      if (fonction === 'wifi') { parametres.security = security; if (hidden) parametres.hidden = true; }
      body = { kind, fonction, tailleMm: taille, forme, theme, quantite: qte, parametres, ...(fiche && { ficheId: fiche.id }), options: { ...(nfc && { nfc: true }), ...(antiMetal && { anti_metal: true }) } };
    }
    setBusy(true);
    const r = await run(() => adminApi.createSticker(body), 'Sticker ajouté à la production');
    setBusy(false);
    if (r) { onCreated(); onClose(); }
  };

  return (
    <Modal title="Nouveau sticker" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <Seg value={kind} onChange={setKind} options={[['fonction', 'Sticker à fonction'], ['telephone', 'Sticker téléphone 30 mm']]} />

        {kind === 'fonction' ? <>
          <div className="f2">
            <Field label="Fonction"><select value={fonction} onChange={(e) => setFonction(e.target.value as Fonction)}>{Object.entries(FN).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></Field>
            <Field label="Taille"><select value={taille} onChange={(e) => setTaille(Number(e.target.value) as 80 | 120 | 170)}>{TAILLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
          </div>
          <div className="f2">
            <Field label="Forme"><select value={forme} onChange={(e) => setForme(e.target.value as 'rond' | 'carre')}><option value="rond">Rond</option><option value="carre">Carré</option></select></Field>
            <Field label="Thème"><select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}><option value="noir">Noir</option><option value="blanc">Blanc</option><option value="or">Or</option><option value="rouge">Rouge</option></select></Field>
          </div>
          <Field label="Établissement" hint="Affiché sous le QR"><input maxLength={100} value={p.etablissement ?? ''} onChange={(e) => setParam('etablissement', e.target.value)} /></Field>
          {CHAMPS[fonction].map((c) => <Field key={c.k} label={c.l}><input maxLength={500} placeholder={c.ph} value={p[c.k] ?? ''} onChange={(e) => setParam(c.k, e.target.value)} /></Field>)}
          {fonction === 'wifi' && <div className="f2">
            <Field label="Sécurité"><select value={security} onChange={(e) => setSecurity(e.target.value as typeof security)}><option value="WPA">WPA</option><option value="WEP">WEP</option><option value="aucune">Aucune</option></select></Field>
            <label className="toggle"><input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} /><span />Réseau masqué</label>
          </div>}
          <div className="chk">
            <label className="toggle"><input type="checkbox" checked={nfc} onChange={(e) => setNfc(e.target.checked)} /><span />Puce NFC</label>
            <label className="toggle"><input type="checkbox" checked={antiMetal} onChange={(e) => setAntiMetal(e.target.checked)} /><span />Anti-métal</label>
          </div>
          <div className="field"><span className="field-l">Client (facultatif)</span>{fiche ? <FichePicked f={fiche} onClear={() => setFiche(null)} /> : <FichePicker onPick={setFiche} />}</div>
        </> : <>
          <div className="field"><span className="field-l">Fiche copiée *</span>{fiche ? <FichePicked f={fiche} onClear={() => setFiche(null)} /> : <FichePicker onPick={setFiche} />}</div>
          <div className="f2">
            <Field label="Couleur du QR"><input type="color" value={coul} onChange={(e) => setCoul(e.target.value)} /></Field>
            <Field label="Couleur de fond"><input type="color" value={fond} onChange={(e) => setFond(e.target.value)} /></Field>
          </div>
          <Field label="Texte autour du QR" hint="Vide = « Scannez-moi » · écris « aucun » pour ne rien imprimer"><input maxLength={40} value={texte} onChange={(e) => setTexte(e.target.value)} /></Field>
        </>}

        <Field label="Quantité"><input type="number" min={1} max={10000} value={quantite} onChange={(e) => setQuantite(e.target.value)} /></Field>
        <div className="form-a"><Btn onClick={onClose}>Annuler</Btn><button className="adm-btn adm-btn-red" type="submit" disabled={busy}>Créer le sticker</button></div>
      </form>
    </Modal>
  );
}
