import { useSession } from "../../../lib/session";
import { useDashboardFiches } from "./useDashboardFiches";

/**
 * Le visiteur est-il le propriétaire de cette fiche publique ? Vrai seulement s'il est connecté ET que la fiche
 * figure parmi les siennes (GET client/dashboard/fiches). Un visiteur anonyme ne déclenche aucune requête.
 *
 * Seul endroit à changer si l'API indique un jour la propriété dans la réponse publique (ex. `isOwner`).
 */
export function useIsFicheOwner(slug: string): boolean {
  const session = useSession();
  const mine = useDashboardFiches({
    enabled: Boolean(session) && slug.length > 0,
  });
  return Boolean(session) && Boolean(mine.data?.some(f => f.slug === slug));
}
