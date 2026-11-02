import type { ReactNode } from "react";
import { Suspense, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../../lib/session";
import "../../../styles/admin.css";
import { logout as signOut } from "../../auth/auth.service";
import type { IconName } from "../components/ui";
import { Icon, ToastProvider } from "../components/ui";

/*
  Cadre du back-office : menu latéral (tiroir sur mobile + barre d'onglets en bas) et zone de contenu (<Outlet />).
  Même principe que ClientLayout : la protection de la route est assurée par <RequireAdmin> (App.tsx).
  Routes enfants : index (tableau de bord), fiches, fiches/:id, clients, demandes, relances, production, cartes, qrcodes, formules.
*/
export const ADMIN_BASE = "/admin";

const NAV: { to: string; label: string; icon: IconName }[] = [
  { to: ADMIN_BASE, label: "Tableau de bord", icon: "dash" },
  { to: `${ADMIN_BASE}/fiches`, label: "Fiches", icon: "card" },
  { to: `${ADMIN_BASE}/abonnements`, label: "Abonnements & paiements", icon: "cal" },
  { to: `${ADMIN_BASE}/clients`, label: "Clients", icon: "users" },
  { to: `${ADMIN_BASE}/demandes`, label: "Demandes", icon: "file" },
  { to: `${ADMIN_BASE}/relances`, label: "Relances", icon: "zap" },
  { to: `${ADMIN_BASE}/production`, label: "Production", icon: "gear" },
  { to: `${ADMIN_BASE}/cartes`, label: "Modèles de cartes", icon: "card" },
  { to: `${ADMIN_BASE}/qrcodes`, label: "QR codes", icon: "qr" },
  { to: `${ADMIN_BASE}/formules`, label: "Formules", icon: "sliders" },
  { to: `${ADMIN_BASE}/historique`, label: "Journal d’activité", icon: "clock" },
  { to: `${ADMIN_BASE}/parametres`, label: "Paramètres admin", icon: "sliders" },
];

export default function AdminLayout({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();
  const user = useSession()?.user;
  const label = user?.name || user?.email || "Administrateur";
  const on = (to: string) =>
    to === ADMIN_BASE
      ? pathname === ADMIN_BASE || pathname === `${ADMIN_BASE}/`
      : pathname.startsWith(to);

  // Prévient le serveur puis supprime la session ; <RequireAdmin> renvoie alors vers /admin/login.
  const logout = () => void signOut();

  return (
    <div className="adm">
      <div className="app">
        <aside className={`side${open ? " open" : ""}`}>
          <div className="flex items-center gap-3 px-4 py-4">
            <img
              src="/images/logo-vertical-blanc.webp"
              alt="Logo Support Connecté"
              width={34}
              height={34}
              className="h-[34px] w-[34px] shrink-0 object-contain"
            />

            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight text-white">
                Support Connecté
              </span>
              <small className="mt-1 text-xs leading-tight text-gray-400">
                Back-office
              </small>
            </div>
          </div>
          <nav aria-label="Principal">
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === ADMIN_BASE}
                className={on(n.to) ? "on" : undefined}
                aria-current={on(n.to) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon n={n.icon} />
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="side-foot">
            <span className="me">
              <b>{label[0]?.toUpperCase()}</b>
              {label}
              <small>Administrateur</small>
            </span>
            <button
              className="icon-btn light"
              onClick={logout}
              aria-label="Se déconnecter"
            >
              <Icon n="out" />
            </button>
          </div>
        </aside>
        {open && <div className="side-veil" onClick={() => setOpen(false)} />}
        <div className="main">
          <div className="top-mob">
            <button
              className="icon-btn"
              onClick={() => setOpen(true)}
              aria-label="Menu"
            >
              <Icon n="menu" />
            </button>
            <img
              src="/images/logo-noir.webp"
              alt="Support Connecté"
              width={104}
              height={24}
              className="h-6 w-[104px] object-contain"
            />
            <b>Back-office</b>
          </div>
          <main className="content">
            <ToastProvider>
              <div key={pathname + search} className="page-in">
                {children ?? (
                  <Suspense
                    fallback={
                      <div style={{ minHeight: "60vh" }} aria-busy="true" />
                    }
                  >
                    <Outlet />
                  </Suspense>
                )}

                {/* {children ?? (
                  <Suspense
                    fallback={
                      <div style={{ minHeight: "60vh" }} aria-busy="true" />
                    }
                  >
                    <Outlet />
                  </Suspense>
                )} */}
              </div>
            </ToastProvider>
          </main>
        </div>
        <nav className="tabbar" aria-label="Navigation mobile">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === ADMIN_BASE}
              className={on(n.to) ? "on" : undefined}
            >
              <Icon n={n.icon} />
              <span>{n.label.split(" ")[0]}</span>
            </NavLink>
          ))}
          <button onClick={logout}>
            <Icon n="out" />
            <span>Quitter</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
