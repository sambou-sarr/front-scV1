import type { RefObject } from "react";
import type { FicheRecord } from "../../../../types";
import { resolveStickerSection } from "../../lib/stickerSections";
import Fiche from "../Fiche";
import StickerSection from "./StickerSection";

/**
 * Choisit ce qu'affiche /s/:slug/:section : la section demandée si elle existe et si la formule y a droit,
 * sinon la fiche complète (formule sans stickers, section masquée, supprimée, inconnue ou pas activée).
 * Seule une section ACTIVÉE par l'administration est servie au public ; `preview` lève cette exigence.
 */
export default function StickerSectionView({
  fiche,
  section,
  scrollerRef,
  preview = false,
}: {
  fiche: FicheRecord;
  section: string;
  scrollerRef?: RefObject<HTMLDivElement>;
  /** Aperçu (administration, éditeur) : n'exige pas que la section soit activée. */
  preview?: boolean;
}) {
  const resolved = resolveStickerSection(fiche, section, {
    requireActive: !preview,
  });
  if ("tab" in resolved)
    return <StickerSection fiche={fiche} tab={resolved.tab} />;
  return <Fiche key={fiche.id} fiche={fiche} scrollerRef={scrollerRef} />;
}
