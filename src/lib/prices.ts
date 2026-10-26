import { useContent } from './content';

/*
  Prix « à partir de », modifiables dans le back-office (onglet « Contenu du site ») :
    contenu.prix     → une ligne par prestation (création de contenu, digital, impression, IA)
    immobilier.prix  → formules promoteurs + prestations immobilières
  Les deux blocs sont fusionnés : un prix saisi pour « visite-3d » s'affiche sur les deux pages.
  Valeur vide ou absente = rien d'affiché (la prestation reste « sur devis »).
*/
export function usePrices(): (id: string) => string {
  const contenu = useContent('contenu.prix', {}) as Record<string, unknown>;
  const immo = useContent('immobilier.prix', {}) as Record<string, unknown>;
  return (id: string) => {
    const v = immo[id] || contenu[id];
    return typeof v === 'string' ? v.trim() : '';
  };
}
