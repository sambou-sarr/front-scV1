import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import "../../../styles/admin.css";
import { AFTER_ADMIN_LOGIN } from "../../../data/auth";
import { useSession } from "../../../lib/session";
import { safePath } from "../../../utils/auth";
import { adminLogin } from "../../auth/auth.service";

// Page Connexion du back-office — /admin/login. Accès réservé aux administrateurs (POST /auth/admin/login).
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const state = location.state as { from?: string; notice?: string } | null;
  const target = safePath(state?.from, AFTER_ADMIN_LOGIN);
  // Une page de l'espace client ou du site public mémorisée n'a pas de sens après une connexion admin.
  const dest = target.startsWith("/admin") ? target : AFTER_ADMIN_LOGIN;

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: adminLogin,
    onSuccess: () => navigate(dest, { replace: true }),
  });

  // Déjà connecté en administrateur : inutile de ressaisir ses identifiants.
  if (session?.user.role === "ADMIN") return <Navigate to={dest} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutate({ email: email.trim(), password });
  };

  const message = isError ? error.message : (state?.notice ?? "");

  return (
    <div className="adm">
      <div className="login">
        <form onSubmit={submit}>
          <span className="logo lg">S</span>
          <h1>Back-office</h1>
          <p>Accès réservé aux administrateurs.</p>
          <input
            type="email"
            required
            autoComplete="username"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button
            className="adm-btn adm-btn-red"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Connexion…" : "Se connecter"}
          </button>
          {message && (
            <small className="err" role="alert">
              {message}
            </small>
          )}
        </form>
      </div>
    </div>
  );
}
