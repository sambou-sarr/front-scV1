import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FicheRecord } from "../../../types";
import { FicheError, ficheSource, toFicheError } from "../lib/ficheSource";
import { dashboardFichesKey } from "./useDashboardFiches";

type Status = "loading" | "ready" | "error";

/**
 * Brouillon local d'une fiche en cours d'édition.
 * L'éditeur modifie `draft` à chaque frappe (aperçu téléphone en direct) ; rien n'est envoyé au serveur
 * tant que `save()` n'est pas appelé (limite de débit de l'API + validation serveur).
 */
export function useFicheEditor(key: string) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<FicheRecord | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [loadError, setLoadError] = useState<FicheError | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [saveError, setSaveError] = useState<FicheError | null>(null);
  const [publishError, setPublishError] = useState<FicheError | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [attempt, setAttempt] = useState(0);
  const saved = useRef<FicheRecord | null>(null);
  const savedJson = useRef("");

  useEffect(() => {
    if (!key) return;
    let live = true;
    setStatus("loading");
    setDraft(null);
    setLoadError(null);
    setSaveError(null);
    setPublishError(null);
    setNotes([]);
    ficheSource
      .load(key)
      .then(f => {
        if (!live) return;
        saved.current = f;
        savedJson.current = JSON.stringify(f);
        setDraft(f);
        setStatus("ready");
      })
      .catch(e => {
        if (!live) return;
        setLoadError(toFicheError(e));
        setStatus("error");
      });
    return () => {
      live = false;
    };
  }, [key, attempt]);

  const dirty = draft !== null && JSON.stringify(draft) !== savedJson.current;

  const save = useCallback(async () => {
    if (!draft || !saved.current || saving) return;
    setSaving(true);
    setSaveError(null);
    setNotes([]);
    const sentJson = JSON.stringify(draft);
    try {
      const { fiche, notes } = await ficheSource.save(draft, saved.current);
      saved.current = fiche;
      savedJson.current = JSON.stringify(fiche);
      // On adopte la version du serveur seulement si rien n'a été tapé pendant l'envoi ;
      // sinon on garde le brouillon courant (il reste « non enregistré ») au lieu d'écraser la saisie.
      setDraft(current => (current && JSON.stringify(current) !== sentJson ? current : fiche));
      setNotes(notes);
      // Le tableau de bord et l'aperçu doivent refléter la modification
      void queryClient.invalidateQueries({ queryKey: dashboardFichesKey });
      void queryClient.invalidateQueries({ queryKey: ["fiche-preview", fiche.id] });
    } catch (e) {
      setSaveError(toFicheError(e));
    } finally {
      setSaving(false);
    }
  }, [draft, saving, queryClient]);

  const publish = useCallback(async () => {
    if (
      !draft ||
      dirty ||
      saving ||
      publishing ||
      draft.statut !== "brouillon"
    )
      return;
    setPublishing(true);
    setPublishError(null);
    setNotes([]);
    try {
      const fiche = await ficheSource.publish(String(draft.id));
      saved.current = fiche;
      savedJson.current = JSON.stringify(fiche);
      setDraft(fiche);
      setNotes(["Votre fiche est publiée et son lien public est maintenant actif."]);
      void queryClient.invalidateQueries({ queryKey: dashboardFichesKey });
      void queryClient.invalidateQueries({
        queryKey: ["fiche-preview", fiche.id],
      });
    } catch (error) {
      setPublishError(toFicheError(error));
    } finally {
      setPublishing(false);
    }
  }, [draft, dirty, saving, publishing, queryClient]);

  const reset = useCallback(() => {
    if (saved.current) {
      setDraft(JSON.parse(savedJson.current) as FicheRecord);
      setSaveError(null);
      setNotes([]);
    }
  }, []);

  const retry = useCallback(() => setAttempt(n => n + 1), []);

  return {
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
  };
}
