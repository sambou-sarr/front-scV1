import { test, expect } from '@playwright/test';

test('/admin sans session : renvoi vers la connexion du back-office', async ({ page }) => {
  await page.goto('/admin/fiches');
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.locator('h1')).toHaveText('Back-office');
});

test('connexion admin : formulaire présent et pas de défilement horizontal', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.getByPlaceholder('E-mail')).toBeVisible();
  const largeur = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(largeur).toBeLessThanOrEqual(1);
});
