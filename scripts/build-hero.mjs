// Builds responsive, compressed versions of the hero banner photo.
// Source (kept in the repo): assets/hero/hero-source.png
// Output: public/images/hero-<width>.avif|webp     Run: npm run hero
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../assets/hero/hero-source.png', import.meta.url));
const OUT = fileURLToPath(new URL('../public/images/', import.meta.url));
const HERO_WIDTHS = [480, 768, 1080, 1440];
// Trim the empty dark margins of the generated banner (16:9 kept) so the scene appears larger.
const CROP = { left: 96, top: 54, width: 1480, height: 833 };
mkdirSync(OUT, { recursive: true });

const meta = await sharp(SRC).metadata();
for (const w of HERO_WIDTHS) {
  const base = sharp(SRC).extract(CROP).resize({ width: Math.min(w, CROP.width), withoutEnlargement: true });
  await base.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}hero-${w}.avif`);
  await base.clone().webp({ quality: 74, effort: 6 }).toFile(`${OUT}hero-${w}.webp`);
  const kb = (f) => (statSync(f).size / 1024).toFixed(0);
  console.log(`hero-${w}: avif ${kb(`${OUT}hero-${w}.avif`)} KB, webp ${kb(`${OUT}hero-${w}.webp`)} KB`);
}
console.log(`source ${meta.width}x${meta.height}`);
