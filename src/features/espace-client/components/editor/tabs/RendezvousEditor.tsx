import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « rendezvous ». */
export default function RendezvousEditor({ upD, fiche }: TabEditorProps) {
  const d = fiche.data;
  const rdv = d.rendezVous || { label: "", url: "" };
  return (
    <div className="ed-items">
      <label>
        <span>Libellé du bouton</span>
        <input
          value={rdv.label}
          maxLength={80}
          placeholder="Ex. Prendre rendez-vous"
          onChange={ev =>
            upD({ rendezVous: { ...rdv, label: ev.target.value } })
          }
        />
      </label>
      <label>
        <span>Lien de réservation</span>
        <input
          value={rdv.url}
          placeholder="https://..."
          onChange={ev => upD({ rendezVous: { ...rdv, url: ev.target.value } })}
        />
      </label>
    </div>
  );
}
