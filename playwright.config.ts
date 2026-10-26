import { defineConfig, devices } from '@playwright/test';

// Tests de bout en bout du site (Chromium, bureau et mobile).
//   npm run test:e2e                      → construit le site, le sert sur :4173 et lance les tests
//   E2E_BASE_URL=https://… npm run test:e2e → teste un site déjà en ligne (préproduction)
// Les demandes partent vers une adresse factice interceptée par les tests : aucune donnée n'est envoyée.
const external = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: external ?? 'http://localhost:4173', locale: 'fr-FR', timezoneId: 'Africa/Dakar', trace: 'retain-on-failure' },
  projects: [
    { name: 'bureau', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: external ? undefined : {
    command: process.env.CI ? 'npm run preview -- --port 4173 --strictPort' : 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { VITE_LEAD_ENDPOINT: 'https://lead.test/lead-intake' },
  },
});
