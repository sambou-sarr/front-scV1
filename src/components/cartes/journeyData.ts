import { DEMO_PAGE } from '../../data/content';
export { JOURNEY } from '../../data/cartes';
// Démo de taps : reprend la page de démonstration commune (PLACEHOLDER, voir PhoneMockup.tsx)
// tileFor : index de l'action de la page → index de la tuile qui s'allume en même temps
export const DEMO: { taps: [number, string, string][]; tileFor: Record<number, number> } = { taps: DEMO_PAGE.taps, tileFor: { 1: 2, 2: 0, 3: 1, 4: 5, 5: 4 } };
