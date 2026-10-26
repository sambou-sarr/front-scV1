import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../auth.service";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch {
      setError(
        "Une erreur est survenue. Vérifiez votre connexion et réessayez."
      );
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
      <Link
        to="/"
        aria-label="Support Connecté, accueil"
        className="absolute left-5 top-6 sm:left-10 lg:left-[72px]"
      >
        <img
          src="/images/logo-blanc.webp"
          alt="Support Connecté"
          width="142"
          className="h-auto w-32 object-contain sm:w-[142px]"
        />
      </Link>

      {/* Carte principale */}
      <section
        aria-labelledby="forgot-password-title"
        className="w-full max-w-[460px] rounded-2xl border border-white/10 bg-[#111315]/95 p-7 shadow-[0_28px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-11"
      >
        {/* Icone */}
        <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border border-red-500/40 bg-red-500/10 text-red-500">
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <path d="M12 15v2" />
          </svg>
        </div>

        <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-[#c9c7c3]">
          SUPPORT CONNECTÉ
        </p>

        <h1
          id="forgot-password-title"
          className="text-4xl font-medium leading-tight tracking-[-0.035em] sm:text-[44px]"
        >
          Mot de passe <span className="text-red-500">oublié ?</span>
        </h1>

        <p className="mb-7 mt-4 text-sm leading-7 text-[#a9aaac]">
          Pas d'inquiétude. Saisissez votre adresse e-mail et nous vous
          enverrons les instructions pour réinitialiser votre mot de passe.
        </p>

        {/* Message de succes */}
        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-xs leading-6 text-emerald-300"
          >
            Si un compte correspond à cette adresse e-mail, vous recevrez
            bientôt les instructions de réinitialisation.
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label
            htmlFor="forgot-email"
            className="mb-2 text-xs font-semibold text-[#eeedeb]"
          >
            Adresse e-mail
          </label>

          <input
            id="forgot-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="vous@exemple.com"
            value={email}
            onChange={ev => {
              setEmail(ev.target.value);
              setSuccess(false);
              setError("");
            }}
            required
            className="mb-5 h-12 w-full rounded-lg border border-[#35383b] bg-[#0c0d0f] px-4 text-sm text-white outline-none transition placeholder:text-[#73767a] hover:border-[#55585c] focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
          />

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-between rounded-lg bg-red-600 px-4 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <span>
              {loading ? "Envoi en cours..." : "Réinitialiser mon mot de passe"}
            </span>

            {!loading && (
              <span aria-hidden="true" className="text-xl">
                ↗
              </span>
            )}
          </button>
        </form>

        <div className="mt-7 border-t border-white/10 pt-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#c9c7c3] transition hover:text-red-500"
          >
            <span aria-hidden="true">←</span>
            Retour à la connexion
          </Link>
        </div>
      </section>

      {/* Pied de page */}
      <p className="absolute bottom-4 text-center text-[10px] font-medium tracking-wide text-[#696b6e]">
        © {new Date().getFullYear()} Support Connecté
      </p>
    </main>
  );
};
