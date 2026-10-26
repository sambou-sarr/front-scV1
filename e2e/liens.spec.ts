import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { PAGES, parcourir } from './outils';

// Chaque lien interne mène à une vraie page, et chaque ancre (#…) existe sur la page visée.
// '#devis' n'est pas une section : c'est un lien direct qui ouvre le formulaire de devis.
const ANCRES_SPECIALES = new Set(['devis']);
// Écarts connus, à corriger avant la mise en ligne (cahier des charges V6, exigences SITE-11 et SITE-12).
// Vider cette liste au fur et à mesure : le test signale aussi un écart corrigé qui y resterait.
const A_CORRIGER_AVANT_MISE_EN_LIGNE = new Set([
  '/#video',   // bouton « Voir la vidéo » de l'accueil : vidéo du hero à fournir
  '/equipe',   // « Découvrir l'équipe » (À propos) : page L'équipe pas encore créée
]);

async function ouvrir(page: Page, chemin: string) {
  await page.goto(chemin);
  await page.locator('h1').first().waitFor();          // pages chargées à la demande (Création de contenu, Immobilier)
  await page.waitForLoadState('networkidle');
}

test('liens internes et ancres', async ({ page }) => {
  test.setTimeout(300_000);
  const liens = new Map<string, string>();   // lien → page où il apparaît
  for (const [path] of PAGES) {
    await ouvrir(page, path);
    await parcourir(page);
    for (const href of await page.locator('a[href^="/"], a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''))) {
      const absolu = href.startsWith('#') ? (path === '/' ? '/' : path) + href : href;
      if (!liens.has(absolu)) liens.set(absolu, path);
    }
  }
  const casses: string[] = [], corriges: string[] = [];
  for (const [lien, origine] of liens) {
    const url = new URL(lien, 'http://x');
    await page.goto(url.pathname + url.search);
    let ok = true;
    if (await page.locator('main.notfound').count()) ok = false;
    else {
      await page.locator('h1').first().waitFor();
      const ancre = decodeURIComponent(url.hash.slice(1));
      if (ancre && !ANCRES_SPECIALES.has(ancre)) {
        ok = await page.locator(`[id="${ancre}"]`).first().waitFor({ state: 'attached', timeout: 4000 }).then(() => true, () => false);
      }
    }
    if (A_CORRIGER_AVANT_MISE_EN_LIGNE.has(lien)) { if (ok) corriges.push(lien); continue; }
    if (!ok) casses.push(`${lien} (depuis ${origine})`);
  }
  expect(casses, `${liens.size} liens vérifiés : liens cassés`).toEqual([]);
  expect(corriges, 'écarts corrigés : les retirer de A_CORRIGER_AVANT_MISE_EN_LIGNE').toEqual([]);
});
