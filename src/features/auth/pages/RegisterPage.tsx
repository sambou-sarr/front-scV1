import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AuthField from "../../../components/auth/AuthField";
import AuthShell from "../../../components/auth/AuthShell";
import { Icon } from "../../../components/Icons";
import { A_REGISTER as T } from "../../../data/auth";
import { EMAIL_RE, passwordOk, passwordRules } from "../../../utils/auth";
import { register } from "../auth.service";

// Page Inscription — /inscription (nom, e-mail, mot de passe, confirmation).
// Le serveur revalide tout (la validation ci-dessous n'est qu'un confort) et envoie l'e-mail de vérification.
type Field = "name" | "email" | "password" | "confirm";
type Errors = Partial<Record<Field, string>>;

export default function RegisterPage() {
  const [d, setD] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    website: "",
  });
  const [err, setErr] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [doneEmail, setDoneEmail] = useState<string | null>(null);

  const set = (k: keyof typeof d) => (v: string) => {
    setD(x => ({ ...x, [k]: v }));
    setErr(x => ({ ...x, [k]: undefined }));
  };
  const rules = passwordRules(d.password);

  //  Send the Request
  const submit = (ev: FormEvent) => {
    ev.preventDefault();

    const e: Errors = {};

    // Verify inputs
    if (d.name.trim().length < 2) e.name = T.errors.name;
    if (!EMAIL_RE.test(d.email.trim())) e.email = T.errors.email;
    if (!passwordOk(d.password)) e.password = T.errors.password;
    if (d.confirm !== d.password) e.confirm = T.errors.confirm;
    setErr(e);

    if (Object.keys(e).length) return;

    setSending(true);
    const email = d.email.trim().toLowerCase();

    //  give data to the Use mutation hook
    mutate({
      email,
      name: d.name,
      password: d.password,
    });

    setDoneEmail(email);
  };

  const { mutate, isError, error } = useMutation({
    mutationFn: register,

    onSuccess: (_data, variables) => {
      setDoneEmail(variables.email);
    },

    onError: () => {
      setSending(false);
    },
  });

  return (
    <AuthShell
      title={T.title}
      description={T.meta}
      label={T.label}
      h1={T.h1}
      lead={T.lead}
    >
      {doneEmail && !isError ? (
        <div className="au-done" role="status">
          <span className="au-ok">
            <Icon id="i-mail" />
          </span>
          <h2>{T.done.title}</h2>
          <p>{T.done.text(doneEmail)}</p>
          <p className="au-hint">{T.done.hint}</p>
          <Link to="/login" className="btn btn-line dark">
            {T.done.login}
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="au-form">
          <header>
            <h2>{T.heading}</h2>
            <p>{T.sub}</p>
          </header>
          <AuthField
            id="name"
            label={T.fields.name}
            value={d.name}
            autoComplete="name"
            error={err.name}
            disabled={sending}
            maxLength={120}
            onChange={set("name")}
          />
          <AuthField
            id="email"
            type="email"
            label={T.fields.email}
            value={d.email}
            autoComplete="email"
            error={err.email}
            disabled={sending}
            onChange={set("email")}
          />
          <AuthField
            id="password"
            type="password"
            label={T.fields.password}
            value={d.password}
            autoComplete="new-password"
            error={err.password}
            disabled={sending}
            maxLength={128}
            onChange={set("password")}
          />
          <ul className="au-rules" aria-label="Critères du mot de passe">
            {(Object.keys(T.rules) as (keyof typeof T.rules)[]).map(k => (
              <li key={k} className={rules[k] ? "ok" : undefined}>
                <span>
                  <Icon id="i-check" />
                </span>
                {T.rules[k]}
              </li>
            ))}
          </ul>
          <AuthField
            id="confirm"
            type="password"
            label={T.fields.confirm}
            value={d.confirm}
            autoComplete="new-password"
            error={err.confirm}
            disabled={sending}
            maxLength={128}
            onChange={set("confirm")}
          />
          {/* Piège anti-robot (comme sur le formulaire de contact) */}
          <input
            className="au-hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            name="website"
            value={d.website}
            onChange={e => set("website")(e.target.value)}
          />
          {isError && (
            <p className="au-err" role="alert">
              {error instanceof Error
                ? error.message
                : "Une erreur est survenue lors de l'inscription."}
            </p>
          )}
          <button type="submit" className="btn btn-red" disabled={sending}>
            {sending ? T.sending : T.submit} <Icon id="arr" />
          </button>
          <p className="au-hint">
            {T.legal[0]}
            <Link to="/mentions-legales" className="au-link">
              {T.legal[1]}
            </Link>
            {T.legal[2]}
            <Link to="/confidentialite" className="au-link">
              {T.legal[3]}
            </Link>
            {T.legal[4]}
          </p>
          <p className="au-alt">
            {T.haveAccount}{" "}
            <Link to="/login" className="au-link">
              {T.login}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
