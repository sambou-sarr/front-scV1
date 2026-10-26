import type { ComponentType } from "react";
import type { TabType } from "../../../../types";
import AvisEditor from "./tabs/AvisEditor";
import BiensEditor from "./tabs/BiensEditor";
import CatalogueEditor from "./tabs/CatalogueEditor";
import GalerieEditor from "./tabs/GalerieEditor";
import HorairesEditor from "./tabs/HorairesEditor";
import LiensEditor from "./tabs/LiensEditor";
import LocalisationEditor from "./tabs/LocalisationEditor";
import MenuEditor from "./tabs/MenuEditor";
import PresentationEditor from "./tabs/PresentationEditor";
import RappelEditor from "./tabs/RappelEditor";
import RendezvousEditor from "./tabs/RendezvousEditor";
import ReseauxEditor from "./tabs/ReseauxEditor";
import TexteEditor from "./tabs/TexteEditor";
import VideosEditor from "./tabs/VideosEditor";
import type { TabEditorProps } from "./types";

/**
 * Registre des éditeurs de contenu : un composant par type d'onglet.
 * `Record<TabType, …>` est volontairement exhaustif : ajouter un type d'onglet dans
 * `TabType` fait échouer le typecheck tant qu'il n'a pas d'éditeur ici (mettre `null`
 * pour un onglet sans contenu éditable).
 */
const TAB_EDITORS: Record<TabType, ComponentType<TabEditorProps> | null> = {
  presentation: PresentationEditor,
  texte: TexteEditor,
  horaires: HorairesEditor,
  menu: MenuEditor,
  biens: BiensEditor,
  catalogue: CatalogueEditor,
  galerie: GalerieEditor,
  videos: VideosEditor,
  liens: LiensEditor,
  rendezvous: RendezvousEditor,
  rappel: RappelEditor,
  avis: AvisEditor,
  reseaux: ReseauxEditor,
  localisation: LocalisationEditor,
};

/** Vrai si l'onglet de ce type a un panneau « Modifier ». */
export const isEditable = (type: TabType): boolean =>
  TAB_EDITORS[type] !== null;

export default function ContentEditor(props: TabEditorProps) {
  const Editor = TAB_EDITORS[props.tab.type];
  return Editor ? <Editor {...props} /> : null;
}
