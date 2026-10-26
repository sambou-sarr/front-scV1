import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toApiError } from "../../../lib/apiError";
import { verifyEmail } from "../auth.service";

export const VerifyMailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submitToken() {
    if (loading) return;

    if (!token) {
      setError("Le lien de vérification est invalide ou incomplet.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyEmail(token);
      setSuccess(true);
    } catch (err: unknown) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#0c0d0f] px-4 py-24 text-white sm:px-6">
      {/* Arriere-plan decoratif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_88%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-48 -z-10 h-[420px] w-[420px] rounded-full bg-red-600/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-64 -left-48 -z-10 h-[450px] w-[450px] rounded-full bg-red-600/10 blur-3xl"
      />

      {/* Logo */}
      <a
        href="/"
        aria-label="Support Connecté, accueil"
        className="absolute left-5 top-6 sm:left-10 lg:left-[72px]"
      >
        <img
          src="/images/logo-blanc.webp"
          alt="Support Connecté"
          width="142"
          className="h-auto w-32 object-contain sm:w-[142px]"
        />
      </a>

      {/* Carte principale */}
      <section
        aria-labelledby="verify-title"
        className="w-full max-w-[460px] rounded-2xl border border-white/10 bg-[#111315]/95 p-7 shadow-[0_28px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-11"
      >
        {/* Icone email */}
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-red-500/40 bg-red-500/10 text-red-500">
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>

        <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-[#c9c7c3]">
          SUPPORT CONNECTÉ
        </p>

        <h1
          id="verify-title"
          className="text-4xl font-medium leading-tight tracking-[-0.035em] sm:text-[44px]"
        >
          Vérifiez votre <span className="text-red-500">adresse e-mail.</span>
        </h1>

        <p className="mb-7 mt-4 text-sm leading-7 text-[#a9aaac]">
          Confirmez votre adresse e-mail pour finaliser la création de votre
          compte.
        </p>

        {/* Message d'erreur */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-300"
          >
            {error}
          </div>
        )}

        {/* Bouton de verification */}
        <button
          type="button"
          onClick={submitToken}
          disabled={loading || success}
          className="flex min-h-12 w-full items-center justify-between rounded-lg bg-red-600 px-4 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          <span>
            {loading ? "Vérification en cours..." : "Confirmer mon e-mail"}
          </span>

          {!loading && (
            <span aria-hidden="true" className="text-xl">
              ↗
            </span>
          )}
        </button>

        <p className="mb-2 mt-6 text-xs leading-6 text-[#8f9194]">
          Vous avez ouvert cette page par erreur ? Vous pouvez revenir à la
          connexion.
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="py-1 text-xs font-semibold text-white transition hover:text-red-500"
        >
          Retour à la connexion
        </button>
      </section>

      {/* Pied de page */}
      <p className="absolute bottom-4 text-center text-[10px] font-medium tracking-wide text-[#696b6e]">
        © {new Date().getFullYear()} Support Connecté
      </p>

      {/* Modal de succes */}
      {success && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-5 backdrop-blur-md">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-success-title"
            className="w-full max-w-[420px] rounded-2xl border border-white/10 bg-[#111315] p-7 shadow-2xl sm:p-9"
          >
            <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
              <svg
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <h2
              id="verify-success-title"
              className="text-3xl font-medium tracking-tight"
            >
              Adresse vérifiée !
            </h2>

            <p className="mb-7 mt-4 text-sm leading-7 text-[#a9aaac]">
              Votre adresse e-mail a été confirmée. Vous pouvez maintenant vous
              connecter à votre compte.
            </p>

            <button
              type="button"
              onClick={() => navigate("/login", { replace: true })}
              className="flex min-h-12 w-full items-center justify-between rounded-lg bg-red-600 px-4 py-3 text-sm font-bold transition hover:bg-red-500"
            >
              <span>Aller à la connexion</span>
              <span aria-hidden="true" className="text-xl">
                ↗
              </span>
            </button>
          </section>
        </div>
      )}
    </main>
  );
};
