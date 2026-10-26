import type { RefObject } from "react";
import type { FicheRecord } from "../../../../types";
import { resolveStickerSection } from "../../lib/stickerSections";
import Fiche from "../Fiche";
import StickerSection from "./StickerSection";

/**
 * Choisit ce qu'affiche /s/:slug/:section : la section demandée si elle existe et si la formule y a droit,
 * sinon la fiche complète (formule sans stickers, section masquée, supprimée ou inconnue).
 */
export default function StickerSectionView({
  fiche,
  section,
  scrollerRef,
}: {
  fiche: FicheRecord;
  section: string;
  scrollerRef?: RefObject<HTMLDivElement>;
}) {
  const resolved = resolveStickerSection(fiche, section);
  if ("tab" in resolved)
    return <StickerSection fiche={fiche} tab={resolved.tab} />;
  return <Fiche key={fiche.id} fiche={fiche} scrollerRef={scrollerRef} />;
}
