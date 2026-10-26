import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Les demandes partent vers VITE_LEAD_ENDPOINT (adresse factice https://lead.test/…) : on les intercepte.
async function capturer(page: Page): Promise<Record<string, unknown>[]> {
  const recues: Record<string, unknown>[] = [];
  await page.route('https://lead.test/**', async (route) => {
    recues.push(JSON.parse(route.request().postData() ?? '{}'));
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  return recues;
}

test('Contact : objet présélectionné par l’adresse, champs obligatoires, envoi', async ({ page }) => {
  const recues = await capturer(page);
  await page.goto('/contact?sujet=qr#formulaire');
  await expect(page.locator('.cf-subj label.on').first()).toContainText('QR Smart');
  await page.locator('.cf button[type=submit]').click();
  await expect(page.locator('.cf .ld-err, .cf em[role=alert]').first()).toBeVisible();
  await page.locator('.cf input[autocomplete=name]').fill('Awa Ndiaye');
  await page.locator('.cf input[type=tel]').fill('+221 77 123 45 67');
  await page.locator('.cf button[type=submit]').click();
  await expect(page.locator('.cf-done')).toBeVisible();
  expect(recues).toHaveLength(1);
  expect(recues[0]).toMatchObject({ name: 'Awa Ndiaye', phone: '+221 77 123 45 67', products: ['QR Smart'], source: 'site', website: '' });
});

test('Promoteur et immobilier : devis agence avec le site internet de l’agence', async ({ page }) => {
  const recues = await capturer(page);
  await page.goto('/promoteur-immobilier');
  await page.locator('#agences .btn-red').first().click();
  await page.locator('.qf-cat button', { hasText: 'Site internet' }).first().click();
  await page.locator('.qf-act .btn-red').click();
  await page.locator('.qf input[autocomplete=name]').fill('Agence Test');
  await page.locator('.qf input[type=tel]').fill('771234567');
  await page.locator('.qf button[type=submit]').click();
  await expect.poll(() => recues.length).toBe(1);
  expect(recues[0]).toMatchObject({ sector: 'immobilier', profil: 'agence', pole: 'immobilier' });
  expect(recues[0].services).toContain('site-agence');
});

test('menu Nos solutions : six entrées dont Promoteur et immobilier', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'menu déroulant : vérifié sur ordinateur');
  await page.goto('/');
  const liens = page.locator('.dd-p a');
  await expect(liens).toHaveCount(6);
  await expect(liens.last()).toHaveText(/Promoteur et immobilier/);
});
