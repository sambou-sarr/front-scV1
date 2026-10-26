import { test, expect } from '@playwright/test';
import { PAGES, INTERDIT, erreurs, parcourir } from './outils';

for (const [path, titre] of PAGES) {
  test(`${path} : titre V6, aucune erreur, pas de défilement horizontal`, async ({ page }) => {
    const err = erreurs(page);
    await page.goto(path);
    await expect(page.locator('h1').first()).toHaveText(titre);
    await parcourir(page);
    const largeur = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(largeur, 'défilement horizontal').toBeLessThanOrEqual(1);
    expect(err).toEqual([]);
  });
}

test('page inconnue : 404 propre', async ({ page }) => {
  await page.goto('/page-qui-n-existe-pas');
  await expect(page.locator('h1')).toHaveText('Cette page n’existe pas.');
});

test('ancienne adresse /secteurs/immobilier : même page que Promoteur et immobilier', async ({ page }) => {
  await page.goto('/secteurs/immobilier');
  await expect(page.locator('h1').first()).toHaveText(PAGES.find(([p]) => p === '/promoteur-immobilier')![1]);
});

test('règles de contenu : aucune formulation interdite (textes et textes alternatifs)', async ({ page }) => {
  test.setTimeout(180_000);
  for (const [path] of PAGES) {
    await page.goto(path);
    await page.locator('h1').first().waitFor();
    await parcourir(page);
    const texte = await page.evaluate(() => document.body.innerText + '\n' + [...document.querySelectorAll('[alt],[aria-label],[title]')]
      .map((e) => [e.getAttribute('alt'), e.getAttribute('aria-label'), e.getAttribute('title')].filter(Boolean).join(' ')).join('\n'));
    for (const [motif, regle] of INTERDIT) expect(texte, `${path} : ${regle}`).not.toMatch(motif);
  }
});
