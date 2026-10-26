import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "../../../styles/layout.css";
import { useSession } from "../../../lib/session";
import { logout as signOut } from "../../auth/auth.service";

/*
  Cadre de l'espace client : menu latéral (Tableau de bord, Paramètres) + zone de contenu (<Outlet />).
  Mobile : le menu devient un tiroir ouvert par le bouton ☰ (Échap, clic à côté ou changement de page = fermeture).
  Routes enfants : index (tableau de bord), fiches/:slug (éditeur), parametres.
*/
const BASE = "/espace-client";
const P: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  sliders: "M4 7h9M17 7h3M4 17h3M11 17h9M13 4v6M7 14v6",
  creditCard: "M3 6h18v12H3zM3 10h18M7 15h3",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z",
  out: "M10 4H5v16h5M15 8l4 4-4 4M9 12h10",
  message: "M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z",
  drafts: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  menu: "M4 6h16M4 12h16M4 18h16",
  x: "M6 6l12 12M18 6L6 18",
};
const Ico = ({ n }: { n: string }) => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={P[n]} />
  </svg>
);

const NAV: {
  to: string;
  label: string;
  icon: string;
  match: (p: string) => boolean;
}[] = [
  {
    to: BASE,
    label: "Tableau de bord",
    icon: "grid",
    match: p =>
      p === BASE || p === `${BASE}/` || p.startsWith(`${BASE}/fiches`),
  },
  {
    to: `${BASE}/editeur`,
    label: "Éditeur de fiches",
    icon: "edit",
    match: p => p.startsWith(`${BASE}/editeur`),
  },
  {
    to: `${BASE}/brouillons`,
    label: "Brouillons",
    icon: "drafts",
    match: p => p.startsWith(`${BASE}/brouillons`),
  },
  {
    to: `${BASE}/demandes-rappel`,
    label: "Demandes de rappel",
    icon: "message",
    match: p => p.startsWith(`${BASE}/demandes-rappel`),
  },
  {
    to: `${BASE}/abonnements`,
    label: "Abonnements & formules",
    icon: "creditCard",
    match: p => p.startsWith(`${BASE}/abonnements`),
  },
  {
    to: `${BASE}/parametres`,
    label: "Paramètres",
    icon: "sliders",
    match: p => p.startsWith(`${BASE}/parametres`),
  },
];

export default function ClientLayout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const user = useSession()?.user;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Prévient le serveur puis supprime la session ; <RequireAuth> renvoie alors vers /login.
  const logout = () => void signOut();

  // La protection de la route est assurée par <RequireAuth> (App.tsx) ; ceci rassure seulement TypeScript.
  if (!user) return null;

  return (
    <div className={`cl${open ? " open" : ""}`}>
      <a className="cl-skip" href="#cl-main">
        Aller au contenu
      </a>

      <header className="cl-bar">
        <button
          className="cl-burger"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="cl-nav"
        >
          <Ico n="menu" />
        </button>
        <span className="cl-brand sm">
          <img src="/images/symbole-s.webp" alt="" width="28" height="28" />{" "}
          Support Connecté
        </span>
      </header>

      <aside
        className="cl-side"
        id="cl-nav"
        aria-label="Navigation de l’espace client"
      >
        <div className="cl-top">
          <span className="cl-brand">
            <img src="/images/symbole-s.webp" alt="" width="34" height="34" />
            <span>
              Support Connecté<small>Espace client</small>
            </span>
          </span>
          <button
            className="cl-close"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
          >
            <Ico n="x" />
          </button>
        </div>
        <nav aria-label="Principal">
          <ul className="cl-nav">
            {NAV.map(n => {
              const on = n.match(pathname);
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={on ? "on" : undefined}
                    aria-current={on ? "page" : undefined}
                  >
                    <Ico n={n.icon} />
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="cl-user">
          <span className="cl-av" aria-hidden="true">
            {user.name.charAt(0)}
          </span>
          <span className="cl-who">
            <b>{user.name}</b>
            <small>{user.email}</small>
          </span>
          <button
            onClick={logout}
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <Ico n="out" />
          </button>
        </div>
      </aside>
      <div
        className="cl-scrim"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <main id="cl-main" className="cl-main" tabIndex={-1}>
        {children ?? <Outlet context={{ user }} />}
      </main>
    </div>
  );
}
