import { TAB_TYPES, TEMPLATES, visibleTabs } from "../../../lib/plans";
import type { FicheRecord, Onglet } from "../../../types";

/*
  Stickers « par section » : un QR collé sur une table, une vitrine… ouvre UNE section de la fiche
  (le menu, les biens…) au lieu de la fiche entière. Cette logique est PURE (sans React ni réseau) :
  c'est le contrat entre la page publique, l'éditeur et, plus tard, la gestion des stickers (code /q/:code).

  URL : /s/:slug/:section   (le préfixe /s évite tout conflit avec /f/:slug, qui peut être servi ailleurs)
*/

export const STICKER_PREFIX = "/s";

/** Pro et Signature seulement (l'Essentielle n'a pas de stickers par section). */
export const hasStickers = (fiche: Pick<FicheRecord, "formule">): boolean =>
  fiche.formule === "pro" || fiche.formule === "signature";

/**
 * Clé d'une section dans l'URL : le type de l'onglet (lisible et stable : « menu », « biens »),
 * sauf pour les onglets personnalisés (plusieurs possibles) qui utilisent leur identifiant.
 */
export const sectionKey = (tab: Onglet): string =>
  tab.type === "texte" ? tab.id : tab.type;

export const stickerPath = (slug: string, key: string): string =>
  `${STICKER_PREFIX}/${encodeURIComponent(slug)}/${encodeURIComponent(key)}`;

export const sectionTitle = (tab: Onglet): string =>
  tab.titre || TAB_TYPES[tab.type].label;

export type StickerResolution =
  | { tab: Onglet }
  /** On retombe sur la fiche complète : formule sans stickers, ou section masquée / supprimée / inconnue. */
  | { fallback: "plan" | "missing" };

export function resolveStickerSection(
  fiche: FicheRecord,
  key: string,
): StickerResolution {
  if (!hasStickers(fiche)) return { fallback: "plan" };
  // `visibleTabs` applique déjà les droits de la formule et écarte les onglets masqués.
  const tab = visibleTabs(fiche).find(
    t => t.id === key || sectionKey(t) === key,
  );
  return tab ? { tab } : { fallback: "missing" };
}

export interface StickerSectionInfo {
  key: string;
  tab: Onglet;
  /** Section conseillée pour le secteur d'activité de la fiche (menu pour un restaurant, biens pour l'immobilier…). */
  primary: boolean;
}

/** Sections qu'un sticker peut ouvrir : celle du secteur d'abord, puis les autres dans l'ordre de la fiche. */
export function stickerSections(fiche: FicheRecord): StickerSectionInfo[] {
  if (!hasStickers(fiche)) return [];
  const tabs = visibleTabs(fiche);
  const wanted = fiche.data.secteur ? TEMPLATES[fiche.data.secteur].tabs : [];
  const primaryType = wanted.find(type => tabs.some(t => t.type === type));
  const infos = tabs.map(tab => ({
    key: sectionKey(tab),
    tab,
    primary: tab.type === primaryType,
  }));
  return [...infos.filter(i => i.primary), ...infos.filter(i => !i.primary)];
}
