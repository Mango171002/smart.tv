// Builds the responsive, compressed site images (AVIF + WebP) from the sources kept in assets/:
//   assets/categories/cat-<key>.png  → public/images/cat-<key>-<w>.avif|webp
//   assets/featured/featured-<scene>.png → public/images/featured-<scene>-<w>.avif|webp
//   assets/plans/plan-<tier>.png      → public/images/plan-<tier>-<w>.avif|webp
//   assets/cta/cta-earth.png          → public/images/cta-earth-<w>.avif|webp
// The hero banner is made of videos (public/videos), not built here.   Run: npm run hero
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../public/images/', import.meta.url));
mkdirSync(OUT, { recursive: true });

// Category cards artwork (assets/categories/cat-<key>.png → public/images/cat-<key>-<w>.avif|webp)
const CATS = ['sports', 'movies', 'live', 'streaming'];
const CAT_WIDTHS = [400, 800];
for (const key of CATS) {
  const src = fileURLToPath(new URL(`../assets/categories/cat-${key}.png`, import.meta.url));
  for (const w of CAT_WIDTHS) {
    const base = sharp(src).resize({ width: w, withoutEnlargement: true });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${OUT}cat-${key}-${w}.avif`);
    await base.clone().webp({ quality: 72, effort: 6 }).toFile(`${OUT}cat-${key}-${w}.webp`);
    const kb = (f) => (statSync(f).size / 1024).toFixed(0);
    console.log(`cat-${key}-${w}: avif ${kb(`${OUT}cat-${key}-${w}.avif`)} KB, webp ${kb(`${OUT}cat-${key}-${w}.webp`)} KB`);
  }
}

// "Most watched" carousel artwork (assets/featured/featured-<scene>.png → public/images/featured-<scene>-<w>.avif|webp), 16:9 cover crop
const SCENES = ['football', 'american-football', 'hockey', 'basketball', 'adventure', 'crime', 'fantasy', 'comedy', 'tennis', 'motorsport', 'family', 'docs', 'animation', 'anime', 'family-fantasy'];
for (const scene of SCENES) {
  const src = fileURLToPath(new URL(`../assets/featured/featured-${scene}.png`, import.meta.url));
  for (const w of [480, 960]) {
    const base = sharp(src).resize({ width: w, height: Math.round((w * 9) / 16), fit: 'cover' });
    await base.clone().avif({ quality: 42, effort: 7 }).toFile(`${OUT}featured-${scene}-${w}.avif`);
    await base.clone().webp({ quality: 72, effort: 6 }).toFile(`${OUT}featured-${scene}-${w}.webp`);
  }
  const kb = (f) => (statSync(f).size / 1024).toFixed(0);
  console.log(`featured-${scene}: avif ${kb(`${OUT}featured-${scene}-480.avif`)}/${kb(`${OUT}featured-${scene}-960.avif`)} KB`);
}

// Plan cards artwork (assets/plans/plan-<tier>.png → public/images/plan-<tier>-<w>.avif|webp)
for (const tier of ['starter', 'plus', 'ultra']) {
  const src = fileURLToPath(new URL(`../assets/plans/plan-${tier}.png`, import.meta.url));
  for (const w of [480, 640, 960]) {
    const base = sharp(src).resize({ width: w });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${OUT}plan-${tier}-${w}.avif`);
    await base.clone().webp({ quality: 72, effort: 6 }).toFile(`${OUT}plan-${tier}-${w}.webp`);
  }
  console.log(`plan-${tier}: avif ${(statSync(`${OUT}plan-${tier}-480.avif`).size / 1024).toFixed(0)}/${(statSync(`${OUT}plan-${tier}-960.avif`).size / 1024).toFixed(0)} KB`);
}

// Closing CTA earth artwork (assets/cta/cta-earth.png → public/images/cta-earth-<w>.avif|webp)
{
  const src = fileURLToPath(new URL('../assets/cta/cta-earth.png', import.meta.url));
  for (const w of [640, 1200]) {
    const base = sharp(src).resize({ width: w });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${OUT}cta-earth-${w}.avif`);
    await base.clone().webp({ quality: 72, effort: 6 }).toFile(`${OUT}cta-earth-${w}.webp`);
  }
}
