import { defineConfig, devices } from '@playwright/test';

/**
 * Tests of the PRIVATE PREVIEW (international versions). Target: the preview Worker, locally
 * (`wrangler dev -c wrangler.preview.jsonc --var PREVIEW_PASSWORD:…`) or deployed.
 *   E2E_BASE_URL=http://127.0.0.1:8799 PREVIEW_PASSWORD=… npx playwright test -c playwright.preview.config.ts
 */
const password = process.env.PREVIEW_PASSWORD ?? '';
export default defineConfig({
  testDir: 'tests/e2e-preview',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:8799',
    trace: 'off',
    httpCredentials: { username: 'team', password },
    launchOptions: { executablePath: process.env.PW_CHROMIUM_PATH || undefined },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
