import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// Les demandes partent vers l'API et sont interceptées pour ne pas envoyer de données réelles.
async function capturer(page: Page): Promise<Record<string, unknown>[]> {
  const recues: Record<string, unknown>[] = [];
  await page.route('**/api/leads', async (route) => {
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
  expect(recues[0]).toMatchObject({
    intent: 'devis',
    name: 'Awa Ndiaye',
    phone: '+221 77 123 45 67',
    products: ['QR Smart'],
    source: 'site',
    website: '',
    consent_marketing: false,
  });
  expect(recues[0]).not.toHaveProperty('consent_at');
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
  expect(recues[0].intent).toBe('devis');
  expect(recues[0].consent_marketing).toBe(false);
});

test('Contact : formulaire lisible sur grand écran et sur mobile', async ({ page, isMobile }) => {
  await page.goto('/contact?sujet=devis#formulaire');
  const form = page.locator('.cf-card');
  await expect(form).toBeVisible();
  const bounds = await form.boundingBox();
  expect(bounds).not.toBeNull();
  if (isMobile) {
    expect(bounds!.width).toBeGreaterThan(300);
    const first = await page.locator('.cf-fields label').nth(0).boundingBox();
    const second = await page.locator('.cf-fields label').nth(1).boundingBox();
    expect(Math.abs(first!.x - second!.x)).toBeLessThan(2);
  } else {
    expect(bounds!.width).toBeGreaterThan(500);
  }
});

test('menu Nos solutions : six entrées dont Promoteur et immobilier', async ({ page, isMobile }) => {
  test.skip(!!isMobile, 'menu déroulant : vérifié sur ordinateur');
  await page.goto('/');
  const liens = page.locator('.dd-p a');
  await expect(liens).toHaveCount(6);
  await expect(liens.last()).toHaveText(/Promoteur et immobilier/);
});
