import type { ComponentType } from "react";
import type { TabType } from "../../../../types";
import type { ViewProps } from "./types";
import AvisView from "./views/AvisView";
import BiensView from "./views/BiensView";
import CatalogueView from "./views/CatalogueView";
import GalerieView from "./views/GalerieView";
import HorairesView from "./views/HorairesView";
import LiensView from "./views/LiensView";
import LocalisationView from "./views/LocalisationView";
import MenuView from "./views/MenuView";
import PresentationView from "./views/PresentationView";
import RappelView from "./views/RappelView";
import RendezvousView from "./views/RendezvousView";
import ReseauxView from "./views/ReseauxView";
import TexteView from "./views/TexteView";
import VideosView from "./views/VideosView";

/**
 * Registre des vues : un composant par type d'onglet.
 * `Record<TabType, …>` est exhaustif : ajouter un type d'onglet fait échouer le typecheck
 * tant qu'il n'a pas de vue ici (symétrique de `editor/ContentEditor.tsx`).
 */
const TAB_VIEWS: Record<TabType, ComponentType<ViewProps>> = {
  presentation: PresentationView,
  reseaux: ReseauxView,
  horaires: HorairesView,
  catalogue: CatalogueView,
  menu: MenuView,
  biens: BiensView,
  galerie: GalerieView,
  videos: VideosView,
  liens: LiensView,
  rappel: RappelView,
  rendezvous: RendezvousView,
  localisation: LocalisationView,
  avis: AvisView,
  texte: TexteView,
};

export default function SectionBody(props: ViewProps) {
  const View = TAB_VIEWS[props.tab.type];
  return <View {...props} />;
}
