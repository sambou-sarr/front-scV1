import { isAxiosError } from "axios";
import { Link } from "react-router-dom";
import "../pages/FicheStats.css";

/** États d'une page publique de fiche : chargement, introuvable (404…) ou indisponible (410). */
export default function PublicFicheState({
  loading,
  error,
}: {
  loading?: boolean;
  error?: unknown;
}) {
  if (loading) {
    return (
      <main className="fiche-public-state" role="status">
        Chargement de la fiche…
      </main>
    );
  }
  const status = isAxiosError(error) ? error.response?.status : undefined;
  const unavailable = status === 410;
  return (
    <main className="fiche-public-state" role="alert">
      <h1>{unavailable ? "Fiche indisponible" : "Fiche introuvable"}</h1>
      <p>
        {unavailable
          ? "Cette fiche est momentanément indisponible."
          : "Cette fiche n’existe pas ou ne peut pas être affichée."}
      </p>
      <Link to="/">Retour à l’accueil</Link>
    </main>
  );
}
