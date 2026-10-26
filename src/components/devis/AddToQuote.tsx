import { quote, useQuote } from "./quoteStore";

// Bouton « Ajouter au devis » d'une prestation (bascule).
export default function AddToQuote({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const { selected } = useQuote();
  const on = selected.includes(id);
  return (
    <button
      type="button"
      className={`qa-add${on ? " on" : ""}`}
      aria-pressed={on}
      aria-label={`${on ? "Retirer du devis" : "Ajouter au devis"} : ${label}`}
      onClick={() => quote.toggle(id)}
    >
      <span aria-hidden="true">{on ? "✓" : "+"}</span>
      {on ? "Ajouté" : "Ajouter au devis"}
    </button>
  );
}
