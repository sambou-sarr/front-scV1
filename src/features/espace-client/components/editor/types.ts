import type { FicheData, FicheRecord, Onglet, Plan } from "../../../../types";

/** Props communes à tous les éditeurs de contenu d'onglet (`editor/tabs/*`). */
export interface TabEditorProps {
  tab: Onglet;
  fiche: FicheRecord;
  plan: Plan;
  /** Modifie un champ d'identité de la fiche. */
  up: (patch: Partial<FicheRecord>) => void;
  /** Modifie une ou plusieurs clés de `fiche.data`. */
  upD: (patch: Partial<FicheData>) => void;
  setTabs: (t: Onglet[]) => void;
  tabs: Onglet[];
}
