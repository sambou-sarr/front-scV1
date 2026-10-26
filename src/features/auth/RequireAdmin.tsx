import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { errMsg, errorStatus } from "../../lib/apiError";
import { useSession } from "../../lib/session";
import { verifyAdminSession } from "./auth.service";

/**
 * Garde de route du back-office : réservé aux comptes administrateurs.
 * - sans session → /admin/login (en mémorisant la page demandée) ;
 * - session de client → /admin/login avec un message (on ne mélange pas les deux espaces) ;
 * - session sans rôle connu (ancienne session) → le rôle est vérifié une fois auprès de l'API.
 * Comme <RequireAuth>, il réagit en direct à la fin de session (déconnexion, 401, expiration, autre onglet).
 * Sans enfant, rend la route imbriquée (`<Outlet />`).
 */
export default function RequireAdmin({ children }: { children?: ReactNode }) {
  const session = useSession();
  const { pathname, search } = useLocation();
  const role = session?.user.role;
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!session || role) return;
    let on = true;
    verifyAdminSession().catch((e: unknown) => {
      if (on && errorStatus(e) !== 401 && errorStatus(e) !== 403)
        setProblem(errMsg(e));
    });
    return () => {
      on = false;
    };
  }, [session, role]);

  const from = pathname + search;
  if (!session)
    return <Navigate to="/admin/login" replace state={{ from }} />;
  if (role === "CLIENT")
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from, notice: "Ce compte n’est pas administrateur." }}
      />
    );
  if (problem)
    return (
      <Navigate to="/admin/login" replace state={{ from, notice: problem }} />
    );
  if (!role) return <div style={{ minHeight: "100vh" }} aria-busy="true" />;
  return <>{children ?? <Outlet />}</>;
}
