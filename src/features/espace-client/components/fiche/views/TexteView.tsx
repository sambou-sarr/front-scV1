import type { ViewProps } from "../types";

/** Contenu de l'onglet « texte » vu par le visiteur. */
export default function TexteView({ tab }: ViewProps) {
  return <p className="f-txt">{tab.contenu}</p>;
}
