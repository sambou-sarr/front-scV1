import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { A_REGISTER as T } from "../../../data/auth";
import { resetPassword } from "../auth.service";
import { passwordOk } from "../../../utils/auth";

type Errors = Partial<Record<string, string>>;

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [err, setError] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    const errors: Errors = {};

    if (!passwordOk(password)) {
      errors.password = T.errors.password;
    }

    if (confirm !== password) {
      errors.confirm = T.errors.confirm;
    }

    if (!token) {
      errors.token = "Le lien de réinitialisation est invalide ou incomplet.";
    }

    setError(errors);

    if (Object.keys(errors).length > 0 || !token) return;

    setLoading(true);

    try {
      await resetPassword({ token, password });

      setSuccess(true);
    } catch {
      setError({
        submit:
          "La réinitialisation a échoué. Le lien est peut-être expiré ou invalide.",
      });
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
        aria-labelledby="reset-password-title"
        className="w-full max-w-[460px] rounded-2xl border border-white/10 bg-[#111315]/95 p-7 shadow-[0_28px_100px_rgba(0,0,0,0.3)] backdrop-blur-xl sm:p-11"
      >
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
          id="reset-password-title"
          className="text-4xl font-medium leading-tight tracking-[-0.035em] sm:text-[44px]"
        >
          Nouveau <span className="text-red-500">mot de passe.</span>
        </h1>

        <p className="mb-7 mt-4 text-sm leading-7 text-[#a9aaac]">
          Choisissez un nouveau mot de passe sécurisé pour retrouver l'accès à
          votre compte.
        </p>

        {/* Erreur generale */}
        {(err.submit || err.token) && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-300"
          >
            {err.submit || err.token}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Nouveau mot de passe */}
          <label
            htmlFor="reset-password"
            className="mb-2 text-xs font-semibold text-[#eeedeb]"
          >
            Nouveau mot de passe
          </label>

          <div className="relative mb-2">
            <input
              id="reset-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError(previous => ({
                  ...previous,
                  password: "",
                  submit: "",
                }));
              }}
              placeholder="Saisissez votre mot de passe"
              required
              aria-invalid={Boolean(err.password)}
              className={`h-12 w-full rounded-lg border bg-[#0c0d0f] px-4 pr-24 text-sm text-white outline-none transition placeholder:text-[#73767a] focus:ring-4 focus:ring-red-500/10 ${
                err.password
                  ? "border-red-500"
                  : "border-[#35383b] hover:border-[#55585c] focus:border-red-500"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword(value => !value)}
              className="absolute inset-y-0 right-3 text-xs font-semibold text-[#a9aaac] transition hover:text-white"
            >
              {showPassword ? "Masquer" : "Afficher"}
            </button>
          </div>

          {err.password && (
            <p className="mb-4 text-xs leading-5 text-red-400" role="alert">
              {err.password}
            </p>
          )}

          {!err.password && <div className="mb-4" />}

          {/* Confirmation */}
          <label
            htmlFor="reset-confirm"
            className="mb-2 text-xs font-semibold text-[#eeedeb]"
          >
            Confirmer le mot de passe
          </label>

          <input
            id="reset-confirm"
            name="confirm"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={e => {
              setConfirm(e.target.value);
              setError(previous => ({
                ...previous,
                confirm: "",
                submit: "",
              }));
            }}
            placeholder="Saisissez à nouveau le mot de passe"
            required
            aria-invalid={Boolean(err.confirm)}
            className={`mb-2 h-12 w-full rounded-lg border bg-[#0c0d0f] px-4 text-sm text-white outline-none transition placeholder:text-[#73767a] focus:ring-4 focus:ring-red-500/10 ${
              err.confirm
                ? "border-red-500"
                : "border-[#35383b] hover:border-[#55585c] focus:border-red-500"
            }`}
          />

          {err.confirm && (
            <p className="mb-4 text-xs leading-5 text-red-400" role="alert">
              {err.confirm}
            </p>
          )}

          {!err.confirm && <div className="mb-4" />}

          <button
            type="submit"
            disabled={loading}
            className="flex min-h-12 w-full items-center justify-between rounded-lg bg-red-600 px-4 py-3 text-sm font-bold transition duration-200 hover:-translate-y-0.5 hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <span>
              {loading
                ? "Réinitialisation..."
                : "Réinitialiser mon mot de passe"}
            </span>

            {!loading && (
              <span aria-hidden="true" className="text-xl">
                ↗
              </span>
            )}
          </button>
        </form>

        <div className="mt-7 border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#c9c7c3] transition hover:text-red-500"
          >
            <span aria-hidden="true">←</span>
            Retour à la connexion
          </button>
        </div>
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
            aria-labelledby="reset-success-title"
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
              id="reset-success-title"
              className="text-3xl font-medium tracking-tight"
            >
              Mot de passe modifié !
            </h2>

            <p className="mb-7 mt-4 text-sm leading-7 text-[#a9aaac]">
              Votre mot de passe a été réinitialisé avec succès. Vous pouvez
              maintenant vous connecter.
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
