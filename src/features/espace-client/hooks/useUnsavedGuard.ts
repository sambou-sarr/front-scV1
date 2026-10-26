import { useEffect } from "react";

const MESSAGE = "Vous avez des modifications non enregistrées. Quitter cette page ?";

/**
 * Protège un brouillon non enregistré :
 *  - fermeture / rechargement / lien externe : confirmation native du navigateur (beforeunload) ;
 *  - clic sur un lien interne (menu latéral, « ← Tableau de bord »…) : confirmation avant de naviguer.
 *
 * L'app utilise <BrowserRouter> : `useBlocker` (réservé aux routeurs « data ») n'y est pas disponible,
 * d'où l'écoute des clics en phase de capture, avant le gestionnaire de <Link>.
 * Limite connue : les boutons Précédent / Suivant du navigateur ne sont pas interceptés.
 */
export function useUnsavedGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || (link.target && link.target !== "_self") || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return; // lien externe : géré par beforeunload
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // ancre
      if (!window.confirm(MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [active]);
}
