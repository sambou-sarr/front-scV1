import type { Page } from '@playwright/test';

/** Toutes les pages du site, avec le titre attendu (règles V6). */
export const PAGES: [string, RegExp][] = [
  ['/', /Redéfinissons\s*vôtre relation client\./],
  ['/cartes-connectees', /Votre carte n’est\s*plus une carte,\s*c’est votre univers\./],
  ['/qr-smart', /Un petit support\.\s*Un grand résultat\./],
  ['/panneaux-baches', /Votre message digital\s*en grand format\./],
  ['/branding-intelligent', /Vos tenues deviennent\s*votre univers digital\./],
  ['/creation-contenu', /Du tournage\s*à la bâche,\s*une seule équipe\./],
  ['/promoteur-immobilier', /Boostez votre\s*pré-commercialisation\./],
  ['/secteurs', /Une solution adaptée\s*à chaque métier\./],
  ['/a-propos', /Des supports\s*qui créent du lien\./],
  ['/contact', /Votre prochain point de contact\s*commence ici\./],
  ['/mentions-legales', /Mentions légales/],
  ['/confidentialite', /Politique de confidentialité/],
];

/** Formulations interdites (cahier des charges V6, règles de marque). */
export const INTERDIT: [RegExp, string][] = [
  [/\b48\s?h(eures)?\b/i, 'promesse « 48 h »'],
  [/cinq jours ouvrés|5 jours ouvrés/i, 'promesse « cinq jours ouvrés »'],
  [/QR Smart Réduction/i, 'ancien nom « QR Smart Réduction »'],
  [/Teranga Festival/i, 'ancien polo Teranga Festival'],
  [/\bbrod(é|ée|és|ées|erie)\b/i, 'broderie (marquage : sérigraphie ou transfert uniquement)'],
  [/\b88\s?%/, 'statistique des 88 % (non sourcée)'],
];

/** Collecte les erreurs JavaScript et les erreurs de console d'une page. */
export function erreurs(page: Page): string[] {
  const out: string[] = [];
  page.on('pageerror', (e) => out.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|fonts\.g/.test(m.text())) out.push(m.text()); });
  return out;
}

/** Fait défiler toute la page (déclenche les animations au scroll et les chargements différés). */
export async function parcourir(page: Page): Promise<void> {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(40); }
  await page.evaluate(() => window.scrollTo(0, 0));
}
