import { I } from "../Icon";
import { wa } from "../format";
import type { ViewProps } from "../types";

/** Contenu de l'onglet « rendezvous » vu par le visiteur. */
export default function RendezvousView({ fiche }: ViewProps) {
  const d = fiche.data;
  return (
    <a
      className="f-btn gold"
      href={d.rendezVous?.url || wa(fiche.whatsapp, d.messageWhatsapp)}
      target="_blank"
      rel="noreferrer"
    >
      <I n="cal" s={16} />
      {d.rendezVous?.label || "Prendre rendez-vous"}
    </a>
  );
}
