import type { FicheRecord, Onglet } from "../../../../types";

/** Props communes à toutes les vues d'onglet de la fiche publique. */
export interface ViewProps {
  tab: Onglet;
  fiche: FicheRecord;
}
