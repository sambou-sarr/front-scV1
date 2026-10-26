import { useState } from "react";
import { api } from "../../../../../lib/api";
import { I } from "../Icon";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « rappel » vu par le visiteur. */
export default function RappelView({ fiche }: ViewProps) {
  const [sent, setSent] = useState(false);
  const [rappelSubmitting, setRappelSubmitting] = useState(false);
  const [rappelError, setRappelError] = useState("");
  return sent ? (
    <p className="f-ok" role="status">
      Merci ! Votre demande a bien été envoyée à l’établissement.
    </p>
  ) : (
    <form
      className="f-form"
      onSubmit={async e => {
        e.preventDefault();
        if (rappelSubmitting) return;
        const form = e.currentTarget;
        const formData = new FormData(form);
        setRappelSubmitting(true);
        setRappelError("");
        try {
          await api.post(
            `fiches/public/${encodeURIComponent(fiche.slug)}/rappels`,
            {
              nom: String(formData.get("nom") || "").trim(),
              telephone: String(formData.get("telephone") || "").trim(),
            },
          );
          setSent(true);
        } catch {
          setRappelError(
            "Impossible d’envoyer la demande. Vérifiez vos coordonnées puis réessayez.",
          );
        } finally {
          setRappelSubmitting(false);
        }
      }}
    >
      <p className="f-txt">
        Laissez vos coordonnées, l’établissement vous rappelle rapidement.
      </p>
      <input
        name="nom"
        required
        minLength={2}
        maxLength={100}
        autoComplete="name"
        placeholder="Votre nom"
      />
      <input
        name="telephone"
        required
        type="tel"
        minLength={7}
        maxLength={25}
        autoComplete="tel"
        placeholder="Votre téléphone"
      />
      {rappelError && (
        <p className="f-error" role="alert">
          {rappelError}
        </p>
      )}
      <button className="f-btn gold" type="submit" disabled={rappelSubmitting}>
        {rappelSubmitting ? "Envoi en cours…" : "Demander un rappel"}{" "}
        <I n="arrow" s={14} />
      </button>
    </form>
  );
}
