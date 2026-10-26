import type { TabEditorProps } from "../types";

/** Éditeur de contenu de l'onglet « horaires ». */
export default function HorairesEditor({ fiche, upD }: TabEditorProps) {
  const d = fiche.data;
  // ADAPTATION (hors référence) : une fiche neuve de l'API n'a AUCUN horaire en base. On affiche donc
  // toujours les 7 jours ; un jour laissé vide n'est pas enregistré. Avec des données déjà complètes
  // (cas de la référence), le rendu et le comportement sont identiques.
  const JOURS = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  const H = d.horaires || [];
  const valeur = (j: string) => H.find(h => h.jour === j)?.horaire ?? "";
  return (
    <div className="ed-hours">
      {JOURS.map(jour => (
        <label key={jour}>
          <span>{jour}</span>
          <input
            value={valeur(jour)}
            onChange={ev =>
              upD({
                horaires: JOURS.map(x => ({
                  jour: x,
                  horaire: x === jour ? ev.target.value : valeur(x),
                })).filter(h => h.horaire !== ""),
              })
            }
          />
        </label>
      ))}
    </div>
  );
}
