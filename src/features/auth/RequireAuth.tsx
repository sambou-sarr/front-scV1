import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "../../lib/session";

/**
 * Garde de route : sans session, renvoie vers /login en mémorisant la page demandée (`state.from`).
 * Réagit en direct : déconnexion, jeton refusé (401), jeton expiré ou déconnexion dans un autre onglet.
 * Sans enfant, rend la route imbriquée (`<Outlet />`).
 */
export default function RequireAuth({ children }: { children?: ReactNode }) {
  const session = useSession();
  const { pathname, search } = useLocation();
  if (!session)
    return <Navigate to="/login" replace state={{ from: pathname + search }} />;
  return <>{children ?? <Outlet />}</>;
}
