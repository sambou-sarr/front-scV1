/*
  Validation des formulaires d'authentification (e-mail, règles de mot de passe) et redirections sûres.
  Les appels réseau sont dans features/auth/auth.service.ts ; la session (jeton, utilisateur) dans lib/session.ts.
*/

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const passwordRules = (pw: string) => ({
  length: pw.length >= 8,
  letter: /[A-Za-z]/.test(pw),
  digit: /\d/.test(pw),
});
export const passwordOk = (pw: string) =>
  Object.values(passwordRules(pw)).every(Boolean);

/** Redirection interne uniquement (évite les « open redirect » via ?from=https://…). */
export const safePath = (p: unknown, fallback: string): string =>
  typeof p === "string" && p.startsWith("/") && !p.startsWith("//")
    ? p
    : fallback;
