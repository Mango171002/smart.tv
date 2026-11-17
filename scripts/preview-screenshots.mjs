// Screenshots of the PRIVATE PREVIEW (desktop + mobile), used by the « Preview » workflow.
// node scripts/preview-screenshots.mjs <base-url> <out-dir>   (password: env PREVIEW_PASSWORD)
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [base, out = 'preview-screenshots'] = process.argv.slice(2);
const password = process.env.PREVIEW_PASSWORD;
if (!base || !password) throw new Error('usage: PREVIEW_PASSWORD=… node scripts/preview-screenshots.mjs <base-url> [out-dir]');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const [tag, opts] of [
  ['desktop', { viewport: { width: 1440, height: 900 } }],
  ['mobile', { ...devices['Pixel 7'] }],
]) {
  const ctx = await browser.newContext({ ...opts, locale: 'fr-FR', httpCredentials: { username: 'team', password } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const [name, path] of [['accueil', '/fr-fr'], ['remboursement', '/fr-fr/legal/refunds'], ['blog', '/fr-fr/blog'], ['404', '/fr-fr/page-inconnue']]) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    // Reveal the animated sections, then go back to the top.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${tag}-${name}.png`, fullPage: true });
  }
  await page.goto(base + '/fr-fr', { waitUntil: 'networkidle' });
  if (tag === 'mobile') await page.getByRole('button', { name: /menu/i }).click();
  await page.getByRole('button', { name: 'Essai gratuit' }).first().click();
  await page.getByTestId('closed-notice').waitFor();
  await page.screenshot({ path: `${out}/${tag}-avis-bientot-disponible.png` });
  console.log(`${tag}: ${errors.length ? errors.join(' | ') : 'no JavaScript error'}`);
  await ctx.close();
}
await browser.close();
