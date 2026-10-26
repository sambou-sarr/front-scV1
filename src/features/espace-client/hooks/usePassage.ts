import { useEffect, useRef } from "react";
import { api } from "../../../lib/api";

export type PassageSource = "qr" | "nfc" | "direct";

/**
 * Enregistre un passage (scan) sur une fiche publique, une seule fois par (fiche, source) grâce à une clé
 * d'idempotence. L'affichage reste disponible si le suivi statistique est momentanément indisponible.
 */
export function usePassage(
  slug: string,
  source: PassageSource,
  loaded: boolean,
) {
  const passageKey = useRef<{
    slug: string;
    source: PassageSource;
    key: string;
  } | null>(null);
  useEffect(() => {
    if (!loaded || !slug) return;
    if (
      !passageKey.current ||
      passageKey.current.slug !== slug ||
      passageKey.current.source !== source
    ) {
      passageKey.current = { slug, source, key: crypto.randomUUID() };
    }
    const idempotencyKey = passageKey.current.key;
    void api
      .post(`fiches/public/${encodeURIComponent(slug)}/passages`, {
        source,
        idempotencyKey,
      })
      .catch(() => {
        /* suivi statistique indisponible : sans conséquence pour l'affichage */
      });
  }, [loaded, slug, source]);
}
