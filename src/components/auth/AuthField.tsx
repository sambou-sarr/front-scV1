import { useState } from "react";
import { HIDE, SHOW } from "../../data/auth";

/*
  Champ à libellé flottant (même principe que .fl du formulaire de contact).
  type="password" : bouton « Afficher / Masquer » intégré.
*/
interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "email" | "password";
  error?: string;
  autoComplete?: string;
  disabled?: boolean;
  maxLength?: number;
}

export default function AuthField({
  id,
  label,
  value,
  onChange,
  type = "text",
  error,
  autoComplete,
  disabled,
  maxLength = 160,
}: Props) {
  const [show, setShow] = useState(false);
  const isPwd = type === "password";
  return (
    <div className={`au-fl${error ? " bad" : ""}${isPwd ? " pw" : ""}`}>
      <input
        id={id}
        name={id}
        type={isPwd && show ? "text" : type}
        placeholder=" "
        value={value}
        autoComplete={autoComplete}
        maxLength={maxLength}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={e => onChange(e.target.value)}
      />
      <label htmlFor={id}>{label}</label>
      {isPwd && (
        <button
          type="button"
          className="au-eye"
          onClick={() => setShow(s => !s)}
          aria-pressed={show}
          aria-label={`${show ? HIDE : SHOW} le mot de passe`}
        >
          {show ? HIDE : SHOW}
        </button>
      )}
      {error && (
        <em id={`${id}-err`} role="alert">
          {error}
        </em>
      )}
    </div>
  );
}
