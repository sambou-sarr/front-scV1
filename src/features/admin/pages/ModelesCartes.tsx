import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { adminApi } from '../admin.service';
import { Badge, Btn, ConfirmModal, ErrorBox, Field, Loading, Modal, useAction } from '../components/ui';
import { useData } from '../hooks/useData';
import { FORMULES, FORMULE_TONE } from '../lib/format';
import type { Formule, ModeleCarte } from '../../../types/admin';

/*
  Modèles de carte : le recto et le verso que le client voit quand il demande une carte physique.
  Un seul modèle ACTIF par formule ; sans modèle actif, le client voit l'aperçu par défaut.
  Les images sont téléversées ici (JPEG, PNG ou WebP, 12 Mo max) : le serveur les optimise et les héberge. Les anciens
  modèles créés avec un lien https restent affichés et peuvent être remplacés par un fichier.
*/
const TIERS = Object.keys(FORMULES) as Formule[];
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 12 * 1024 * 1024;
/** Message d'erreur si le fichier ne peut pas être envoyé, sinon null. */
const checkFile = (f: File): string | null =>
  !ACCEPTED.includes(f.type) ? 'Format non pris en charge : utilisez une image JPEG, PNG ou WebP.' : f.size > MAX_BYTES ? 'L’image dépasse 12 Mo.' : null;

/** Adresse d'aperçu d'un fichier choisi (libérée dès que le fichier change ou que la fenêtre se ferme). */
function usePreview(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file || typeof URL.createObjectURL !== 'function') { setUrl(null); return; }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  return url;
}

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

/** Choix d'une image : le fichier choisi remplace l'image actuelle (modification) ; un fichier invalide est refusé. */
function ImagePicker({ label, file, error, onPick }: { label: string; file: File | null; error: string | null; onPick: (f: File | null, error: string | null) => void }) {
  return (
    <Field label={label} hint={file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} Mo` : 'JPEG, PNG ou WebP · 12 Mo max'}>
      <input
        type="file"
        accept={ACCEPTED.join(',')}
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          const problem = f ? checkFile(f) : null;
          onPick(f && !problem ? f : null, problem);
          if (problem) e.target.value = '';
        }}
      />
      {error && <span className="note-gold" role="alert">{error}</span>}
    </Field>
  );
}

function ModeleModal({ tier, modele, onClose, onSaved }: { tier: Formule; modele?: ModeleCarte; onClose: () => void; onSaved: () => void }) {
  const [nom, setNom] = useState(modele?.nom ?? '');
  const [recto, setRecto] = useState<File | null>(null);
  const [verso, setVerso] = useState<File | null>(null);
  const [rectoErr, setRectoErr] = useState<string | null>(null);
  const [versoErr, setVersoErr] = useState<string | null>(null);
  const [actif, setActif] = useState(false);
  const [busy, setBusy] = useState(false);
  const run = useAction();
  const rectoPreview = usePreview(recto);
  const versoPreview = usePreview(verso);
  const rectoSrc = rectoPreview ?? modele?.rectoUrl ?? null;
  const versoSrc = versoPreview ?? modele?.versoUrl ?? null;
  // Création : les deux faces sont obligatoires. Modification : on peut ne changer que le nom ou qu'une seule face.
  const erreur = !nom.trim() ? 'Donne un nom au modèle.' : !modele && !recto ? 'Choisis l’image du recto.' : !modele && !verso ? 'Choisis l’image du verso.' : rectoErr ?? versoErr;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (erreur) return;
    setBusy(true);
    const r = await run(
      async () => {
        // Envoi d'abord, enregistrement ensuite : si un envoi échoue, rien n'est créé ni modifié.
        const rectoUrl = recto ? (await adminApi.uploadCardImage(recto)).url : undefined;
        const versoUrl = verso ? (await adminApi.uploadCardImage(verso)).url : undefined;
        return modele
          ? adminApi.updateModeleCarte(modele.id, { nom: nom.trim(), ...(rectoUrl && { rectoUrl }), ...(versoUrl && { versoUrl }) })
          : adminApi.createModeleCarte({ tier, nom: nom.trim(), rectoUrl: rectoUrl!, versoUrl: versoUrl!, actif });
      },
      modele ? 'Modèle enregistré' : actif ? 'Modèle ajouté et activé' : 'Modèle ajouté',
    );
    setBusy(false);
    if (r) { onSaved(); onClose(); }
  };
  return (
    <Modal title={modele ? `Modifier « ${modele.nom} »` : `Nouveau modèle ${FORMULES[tier]}`} onClose={onClose} wide>
      <form className="form" onSubmit={submit}>
        <Field label="Nom du modèle" hint="Visible seulement ici (ex. « Noir mat 2026 »)"><input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} autoFocus /></Field>
        <ImagePicker label={modele ? 'Recto (laisser vide pour garder l’actuel)' : 'Recto'} file={recto} error={rectoErr} onPick={(f, p) => { setRecto(f); setRectoErr(p); }} />
        <ImagePicker label={modele ? 'Verso (laisser vide pour garder l’actuel)' : 'Verso'} file={verso} error={versoErr} onPick={(f, p) => { setVerso(f); setVersoErr(p); }} />
        {rectoSrc && versoSrc && <Faces m={{ nom: nom.trim() || 'Aperçu', rectoUrl: rectoSrc, versoUrl: versoSrc }} />}
        {!modele && <label className="mc-check"><input type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} /> Afficher ce modèle aux clients {FORMULES[tier]} dès maintenant <span className="adm-muted">(remplace le modèle actif)</span></label>}
        {erreur && (nom || recto || verso) && <p className="note-gold" role="alert">{erreur}</p>}
        <div className="form-a"><Btn onClick={onClose}>Annuler</Btn><button className="adm-btn adm-btn-red" type="submit" disabled={!!erreur || busy}>{busy ? 'Envoi des images…' : modele ? 'Enregistrer' : 'Ajouter le modèle'}</button></div>
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
