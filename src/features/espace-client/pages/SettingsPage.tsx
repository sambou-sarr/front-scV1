import { useEffect, useState } from "react";
import { errMsg } from "../../../lib/apiError";
import { forgotPassword } from "../../auth/auth.service";
import "../../../styles/dashboard.css";
import { useClientUser } from "../layout/useClientUser";

type ResetState = "idle" | "sending" | "sent" | "error";

export default function SettingsPage() {
  const user = useClientUser();
  const [resetState, setResetState] = useState<ResetState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Paramètres — Support Connecté";
  }, []);

  const sendResetLink = async () => {
    if (resetState === "sending") return;
    setResetState("sending");
    setError("");
    try {
      await forgotPassword(user.email);
      setResetState("sent");
    } catch (cause) {
      setError(errMsg(cause));
      setResetState("error");
    }
  };

  return (
    <div className="db st-page">
      <header className="db-head">
        <p className="db-k">Espace client</p>
        <h1>Paramètres</h1>
        <p className="db-sub">
          Consultez les informations de votre compte et protégez son accès.
        </p>
      </header>

      <section className="db-card st-account" aria-labelledby="st-compte">
        <div className="st-section-heading">
          <span className="st-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </svg>
          </span>
          <div>
            <p className="db-k">Profil</p>
            <h2 id="st-compte">Mon compte</h2>
          </div>
        </div>
        <dl className="st-dl">
          <div>
            <dt>Nom</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Adresse e-mail du compte</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
      </section>

      <section className="db-card st-security" aria-labelledby="st-security">
        <div className="st-security-top">
          <span className="st-icon security" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 1 1 8 0v3M12 14v3" />
            </svg>
          </span>
          <div>
            <p className="db-k">Sécurité</p>
            <h2 id="st-security">Mot de passe oublié ?</h2>
            <p className="st-description">
              Recevez un lien sécurisé pour choisir un nouveau mot de passe.
              Il sera envoyé à <strong>{user.email}</strong>.
            </p>
          </div>
        </div>

        <div className="st-security-footer">
          <p className="st-expiry">
            Le lien est valable 30 minutes et ne peut être utilisé qu’une fois.
          </p>
          <button
            type="button"
            className="st-reset-action"
            onClick={() => void sendResetLink()}
            disabled={resetState === "sending"}
          >
            {resetState === "sending" ? (
              <>
                <span className="st-spinner" aria-hidden="true" />
                Envoi en cours…
              </>
            ) : (
              <>
                Envoyer le lien de réinitialisation
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7M7 7h10v10" />
                </svg>
              </>
            )}
          </button>
        </div>

        {resetState === "sent" && (
          <p className="st-feedback success" role="status">
            La demande a été prise en compte. Si cette adresse peut recevoir un
            lien, vous le recevrez dans quelques instants.
          </p>
        )}
        {resetState === "error" && (
          <p className="st-feedback error" role="alert">
            Impossible d’envoyer le lien : {error}
          </p>
        )}
      </section>
    </div>
  );
}
