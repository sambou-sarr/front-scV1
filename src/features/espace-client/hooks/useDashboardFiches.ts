import { useQuery } from "@tanstack/react-query";
import { getDashboardFiche } from "../espaceClient.service";
import { isAuthFailure } from "../../../lib/apiError";

export const dashboardFichesKey = ["client", "dashboard", "fiches"] as const;

/** Fiches du client connecté. À invalider après une modification : queryClient.invalidateQueries({ queryKey: dashboardFichesKey }). */
export const useDashboardFiches = (options: { enabled?: boolean } = {}) =>
  useQuery({
    enabled: options.enabled ?? true,
    queryKey: dashboardFichesKey,
    queryFn: ({ signal }) => getDashboardFiche(signal),
    staleTime: 60_000,
    // Inutile de réessayer une session expirée ou un accès refusé
    retry: (n, e) => !isAuthFailure(e) && n < 2,
  });
