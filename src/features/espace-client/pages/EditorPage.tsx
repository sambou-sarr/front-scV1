import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Editor from "../components/Editor";
import Fiche from "../components/Fiche";
import StickerSectionView from "../components/sticker/StickerSectionView";
import { resolveStickerSection, sectionTitle } from "../lib/stickerSections";
import { useDashboardFiches } from "../hooks/useDashboardFiches";
import { useFicheEditor } from "../hooks/useFicheEditor";
import { useUnsavedGuard } from "../hooks/useUnsavedGuard";
import type { FicheRecord } from "../../../types";

/*
  Éditeur de fiche : formulaire à gauche (droits par formule, blocs, identité, entête), aperçu téléphone en
  direct à droite.
  Routes : /espace-client/editeur  et  /espace-client/editeur/:id   (id numérique de la fiche)

  Données : lib/ficheSource.ts — GET / PATCH /api/fiches/:id.
*/

// Le serveur refuse déjà toute modification d'une fiche suspendue (FICHE_SUSPENDUE) ou dont l'abonnement est échu
// (ABONNEMENT_EXPIRE) ; on le dit avant et on verrouille l'éditeur.
const lockReason = (f: FicheRecord): string | null => {
  if (f.statut === "suspendue")
    return "Cette fiche est suspendue : la modification est impossible.";
  if (f.expiree)
    return "L'abonnement de cette fiche a expiré : la modification est bloquée tant qu'il n'est pas renouvelé.";
  return null;
};

export default function EditorPage() {
  const { id } = useParams<{ id: string }>();
  if (!id) return <ApiIndex />;
  return <FicheEditor key={id} id={id} />;
}

/* /editeur sans identifiant (menu latéral) : on ouvre la première fiche du client */
function ApiIndex() {
  const { data, isPending, isError, refetch } = useDashboardFiches();
  if (isPending)
    return (
      <p className="fiche-preview-state" role="status">
        Chargement de vos fiches…
      </p>
    );
  if (isError)
    return (
      <div className="fiche-preview-state" role="alert">
        <h1>Impossible de charger vos fiches</h1>
        <button onClick={() => void refetch()}>Réessayer</button>
      </div>
    );
  const first = data?.[0];
  if (!first)
    return (
      <div className="fiche-preview-state">
        <h1>Aucune fiche à modifier</h1>
        <p>Créez d'abord une fiche depuis votre tableau de bord.</p>
        <Link to="/espace-client">Retour au tableau de bord</Link>
      </div>
    );
  return <Navigate to={`/espace-client/editeur/${first.id}`} replace />;
}

function FicheEditor({ id }: { id: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  // Section de sticker affichée dans l'aperçu téléphone (null = fiche complète).
  const [previewSection, setPreviewSection] = useState<string | null>(null);
  const {
    draft,
    setDraft,
    status,
    loadError,
    dirty,
    saving,
    publishing,
    saveError,
    publishError,
    notes,
    save,
    publish,
    reset,
    retry,
  } = useFicheEditor(id);

  useEffect(() => {
    document.title = "Modifier ma fiche — Support Connecté";
  }, []);

  // Quitter la page (fermeture ou lien interne) avec des modifications non enregistrées
  useUnsavedGuard(dirty);

  if (status === "loading")
    return (
      <p className="fiche-preview-state" role="status">
        Chargement de la fiche…
      </p>
    );
  if (status === "error" || !draft)
    return (
      <div className="fiche-preview-state" role="alert">
        <h1>
          {loadError?.kind === "notfound"
            ? "Fiche introuvable"
            : "Impossible de charger la fiche"}
        </h1>
        <p>{loadError?.message ?? "Une erreur est survenue."}</p>
        {loadError?.kind !== "notfound" && loadError?.kind !== "auth" && (
          <button onClick={retry}>Réessayer</button>
        )}{" "}
        <Link to="/espace-client">Retour au tableau de bord</Link>
      </div>
    );

  const locked = lockReason(draft);
  // Onglet réellement ouvert par ce sticker (null si la section est masquée / supprimée : on affiche alors la fiche complète).
  const resolved = previewSection
    ? resolveStickerSection(draft, previewSection)
    : null;
  const previewTab = resolved && "tab" in resolved ? resolved.tab : null;

  return (
    <div className="edp-page">
      <div className="demo-body m-editeur">
        <aside className="demo-ed">
          <div className="edp-bar">
            <Link to="/espace-client" className="edp-back">
              ← Tableau de bord
            </Link>
            <span className="edp-state" role="status" aria-live="polite">
              {saving
                ? "Enregistrement…"
                : dirty
                  ? "Modifications non enregistrées"
                  : "Tout est enregistré"}
            </span>

            <button
              className="edp-ghost"
              onClick={reset}
              disabled={!dirty || saving || !!locked}
            >
              Annuler
            </button>
            <button
              className="edp-save"
              onClick={save}
              disabled={!dirty || saving || !!locked}
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            {draft.statut === "brouillon" && (
              <button
                className="edp-save"
                onClick={() => void publish()}
                disabled={dirty || saving || publishing || !!locked}
                title={
                  dirty
                    ? "Enregistrez vos modifications avant de publier."
                    : undefined
                }
              >
                {publishing ? "Publication…" : "Publier"}
              </button>
            )}
          </div>

          {draft.statut === "brouillon" && dirty && (
            <p className="edp-note" role="status">
              Enregistrez vos modifications avant de publier cette fiche.
            </p>
          )}
          {locked && (
            <p className="edp-note edp-warn" role="alert">
              {locked}
            </p>
          )}
          {saveError && (
            <div className="edp-note edp-warn" role="alert">
              <strong>{saveError.message}</strong>
              {saveError.kind === "conflict" && (
                <>
                  {" "}
                  <button onClick={retry}>
                    Recharger la fiche (mes modifications non enregistrées
                    seront perdues)
                  </button>
                </>
              )}
              {publishError && (
                <p className="edp-note edp-warn" role="alert">
                  {publishError.message}
                </p>
              )}
              {saveError.issues.length > 0 && (
                <ul className="edp-errors">
                  {saveError.issues.slice(0, 8).map((i, n) => (
                    <li key={n}>
                      <b>{i.label}</b> — {i.message}
                    </li>
                  ))}
                  {saveError.issues.length > 8 && (
                    <li>… et {saveError.issues.length - 8} autre(s)</li>
                  )}
                </ul>
              )}
            </div>
          )}
          {!saveError &&
            notes.map(n => (
              <p key={n} className="edp-note" role="status">
                {n}
              </p>
            ))}

          {/* fieldset disabled : désactive d'un coup tous les champs et boutons de l'éditeur quand la fiche est verrouillée */}
          <fieldset className="edp-lock" disabled={!!locked}>
            <Editor
              fiche={draft}
              onChange={setDraft}
              previewSection={previewSection}
              onPreviewSection={setPreviewSection}
            />
          </fieldset>
        </aside>

        <div className="demo-stage">
          {previewTab && (
            <p className="edp-prev-bar" role="status">
              Aperçu du sticker « {sectionTitle(previewTab)} » (brouillon, non
              enregistré)
              <button onClick={() => setPreviewSection(null)}>
                Revenir à la fiche
              </button>
            </p>
          )}
          <div className="device">
            <div className="device-in" ref={scroller}>
              {previewSection ? (
                <StickerSectionView
                  key={`${draft.slug}-${previewSection}`}
                  fiche={draft}
                  section={previewSection}
                  scrollerRef={scroller}
                />
              ) : (
                <Fiche
                  key={draft.slug}
                  fiche={draft}
                  scrollerRef={scroller}
                  ownerTools
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
