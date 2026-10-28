import { useState } from 'react';
import type { FormEvent } from 'react';
import { adminApi } from '../admin.service';
import { Badge, Btn, ConfirmModal, ErrorBox, Field, Loading, Modal, useAction } from '../components/ui';
import { useData } from '../hooks/useData';
import { FORMULES, FORMULE_TONE } from '../lib/format';
import type { Formule, ModeleCarte } from '../../../types/admin';

/*
  Modèles de carte : le recto et le verso que le client voit quand il demande une carte physique.
  Un seul modèle ACTIF par formule ; sans modèle actif, le client voit l'aperçu par défaut.
  Les images sont des adresses https déjà hébergées (Cloudinary…), comme les fichiers d'impression.
*/
const TIERS = Object.keys(FORMULES) as Formule[];
const isHttps = (u: string) => {
  try { return new URL(u.trim()).protocol === 'https:'; } catch { return false; }
};

/** Une face de carte ; une adresse cassée affiche un message au lieu d'une image vide. */
function Face({ url, label }: { url: string; label: string }) {
  const [ko, setKo] = useState(false);
  return (
    <figure className="mc-face">
      {ko ? <div className="mc-face-ko">Image introuvable</div> : <img src={url} alt={label} loading="lazy" onError={() => setKo(true)} />}
      <figcaption>{label}</figcaption>
    </figure>
  );
}
const Faces = ({ m }: { m: Pick<ModeleCarte, 'nom' | 'rectoUrl' | 'versoUrl'> }) => (
  <div className="mc-faces">
    <Face key={m.rectoUrl} url={m.rectoUrl} label={`${m.nom} — recto`} />
    <Face key={m.versoUrl} url={m.versoUrl} label={`${m.nom} — verso`} />
  </div>
);

function ModeleModal({ tier, modele, onClose, onSaved }: { tier: Formule; modele?: ModeleCarte; onClose: () => void; onSaved: () => void }) {
  const [nom, setNom] = useState(modele?.nom ?? '');
  const [recto, setRecto] = useState(modele?.rectoUrl ?? '');
  const [verso, setVerso] = useState(modele?.versoUrl ?? '');
  const [actif, setActif] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = useAction();
  const erreur = !nom.trim() ? 'Donne un nom au modèle.' : !isHttps(recto) ? 'L’adresse du recto doit commencer par https://' : !isHttps(verso) ? 'L’adresse du verso doit commencer par https://' : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (erreur) return;
    setBusy(true);
    const body = { nom: nom.trim(), rectoUrl: recto.trim(), versoUrl: verso.trim() };
    const r = modele
      ? await run(() => adminApi.updateModeleCarte(modele.id, body), 'Modèle enregistré')
      : await run(() => adminApi.createModeleCarte({ tier, ...body, actif }), actif ? 'Modèle ajouté et activé' : 'Modèle ajouté');
    setBusy(false);
    if (r) { onSaved(); onClose(); }
  };
  return (
    <Modal title={modele ? `Modifier « ${modele.nom} »` : `Nouveau modèle ${FORMULES[tier]}`} onClose={onClose} wide>
      <form className="form" onSubmit={submit}>
        <Field label="Nom du modèle" hint="Visible seulement ici (ex. « Noir mat 2026 »)"><input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} autoFocus /></Field>
        <Field label="Recto (adresse de l’image)"><input type="url" value={recto} onChange={(e) => setRecto(e.target.value)} placeholder="https://…" /></Field>
        <Field label="Verso (adresse de l’image)"><input type="url" value={verso} onChange={(e) => setVerso(e.target.value)} placeholder="https://…" /></Field>
        {isHttps(recto) && isHttps(verso) && <Faces m={{ nom: nom.trim() || 'Aperçu', rectoUrl: recto.trim(), versoUrl: verso.trim() }} />}
        {!modele && <label className="mc-check"><input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} /> Afficher ce modèle aux clients {FORMULES[tier]} dès maintenant <span className="adm-muted">(remplace le modèle actif)</span></label>}
        {erreur && (nom || recto || verso) && <p className="note-gold" role="alert">{erreur}</p>}
        <div className="form-a"><Btn onClick={onClose}>Annuler</Btn><button className="adm-btn adm-btn-red" type="submit" disabled={!!erreur || busy}>{modele ? 'Enregistrer' : 'Ajouter le modèle'}</button></div>
      </form>
    </Modal>
  );
}

export default function ModelesCartes() {
  const [data, reload, err] = useData(() => adminApi.listModelesCartes());
  const [edition, setEdition] = useState<{ tier: Formule; modele?: ModeleCarte } | null>(null);
  const [suppression, setSuppression] = useState<ModeleCarte | null>(null);
  const run = useAction();

  if (err) return <ErrorBox message={err} onRetry={reload} />;
  if (!data) return <Loading />;

  const activer = async (m: ModeleCarte, actif: boolean) => {
    if (await run(() => adminApi.updateModeleCarte(m.id, { actif }), actif ? `« ${m.nom} » est maintenant affiché aux clients ${FORMULES[m.tier]}` : 'Modèle désactivé')) reload();
  };
  const supprimer = async (m: ModeleCarte) => {
    if (await run(() => adminApi.deleteModeleCarte(m.id), 'Modèle supprimé')) reload();
  };

  return (
    <div className="mc">
      <header className="page-h">
        <h1>Modèles de cartes</h1>
        <p className="adm-muted">Le recto et le verso que le client voit quand il demande sa carte. Un seul modèle actif par formule.</p>
      </header>

      {TIERS.map((tier) => {
        const liste = data.modeles.filter((m) => m.tier === tier);
        const actif = liste.find((m) => m.actif);
        const autres = liste.filter((m) => !m.actif);
        return (
          <section key={tier} className="mc-tier" aria-label={`Modèles ${FORMULES[tier]}`}>
            <div className="mc-tier-h">
              <h2><Badge tone={FORMULE_TONE[tier]}>{FORMULES[tier]}</Badge></h2>
              <Btn icon="plus" onClick={() => setEdition({ tier })}>Ajouter un modèle</Btn>
            </div>

            {actif ? (
              <div className="mc-active">
                <p><b>{actif.nom}</b> <Badge tone="green">Affiché aux clients</Badge></p>
                <Faces m={actif} />
                <div className="mc-a">
                  <Btn onClick={() => setEdition({ tier, modele: actif })}>Modifier</Btn>
                  <Btn onClick={() => void activer(actif, false)}>Désactiver</Btn>
                  <Btn kind="red" onClick={() => setSuppression(actif)}>Supprimer</Btn>
                </div>
              </div>
            ) : (
              <p className="note-gold">Aucun modèle actif : les clients {FORMULES[tier]} voient l’aperçu par défaut.</p>
            )}

            {autres.length > 0 && (
              <ul className="mc-others">
                {autres.map((m) => (
                  <li key={m.id}>
                    <span className="mc-name">{m.nom}</span>
                    <Faces m={m} />
                    <span className="mc-a">
                      <Btn kind="dark" onClick={() => void activer(m, true)}>Activer</Btn>
                      <Btn onClick={() => setEdition({ tier, modele: m })}>Modifier</Btn>
                      <Btn kind="red" onClick={() => setSuppression(m)}>Supprimer</Btn>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      {edition && <ModeleModal tier={edition.tier} modele={edition.modele} onClose={() => setEdition(null)} onSaved={reload} />}
      {suppression && (
        <ConfirmModal title="Supprimer ce modèle ?" confirmLabel="Supprimer" danger onConfirm={() => { const m = suppression; setSuppression(null); void supprimer(m); }} onClose={() => setSuppression(null)}>
          « {suppression.nom} » ne sera plus proposé. Les demandes de carte déjà passées ne sont pas modifiées.
          {suppression.actif && ` Les clients ${FORMULES[suppression.tier]} verront l’aperçu par défaut.`}
        </ConfirmModal>
      )}
    </div>
  );
}
