// Builds responsive, compressed versions of the hero banner photo.
// Source (kept in the repo): assets/hero/hero-source.png
// Output: public/images/hero-<width>.avif|webp     Run: npm run hero
import sharp from 'sharp';
import { mkdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SRC = fileURLToPath(new URL('../assets/hero/hero-source.png', import.meta.url));
const OUT = fileURLToPath(new URL('../public/images/', import.meta.url));
const HERO_WIDTHS = [640, 1080, 1440, 1920];
// Full banner (21:9), no crop.
const CROP = { left: 0, top: 0, width: 1920, height: 819 };
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

// Second hero slide (baseball), same frame: assets/hero/hero-baseball-source.png → public/images/hero-baseball-<w>.avif|webp
const SRC2 = fileURLToPath(new URL('../assets/hero/hero-baseball-source.png', import.meta.url));
for (const w of HERO_WIDTHS) {
  const base = sharp(SRC2).extract(CROP).resize({ width: Math.min(w, CROP.width), withoutEnlargement: true });
  await base.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}hero-baseball-${w}.avif`);
  await base.clone().webp({ quality: 74, effort: 6 }).toFile(`${OUT}hero-baseball-${w}.webp`);
  const kb = (f) => (statSync(f).size / 1024).toFixed(0);
  console.log(`hero-baseball-${w}: avif ${kb(`${OUT}hero-baseball-${w}.avif`)} KB`);
}

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
const SCENES = ['football', 'american-football', 'hockey', 'basketball', 'adventure', 'crime', 'fantasy', 'comedy', 'tennis', 'motorsport', 'family', 'docs'];
for (const scene of SCENES) {
  const src = fileURLToPath(new URL(`../assets/featured/featured-${scene}.png`, import.meta.url));
  for (const w of [480, 960]) {
    const base = sharp(src).resize({ width: w, height: Math.round((w * 9) / 16), fit: 'cover' });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${OUT}featured-${scene}-${w}.avif`);
    await base.clone().webp({ quality: 72, effort: 6 }).toFile(`${OUT}featured-${scene}-${w}.webp`);
  }
  const kb = (f) => (statSync(f).size / 1024).toFixed(0);
  console.log(`featured-${scene}: avif ${kb(`${OUT}featured-${scene}-480.avif`)}/${kb(`${OUT}featured-${scene}-960.avif`)} KB`);
}

// Plan cards artwork (assets/plans/plan-<tier>.png → public/images/plan-<tier>-<w>.avif|webp)
for (const tier of ['starter', 'plus', 'ultra']) {
  const src = fileURLToPath(new URL(`../assets/plans/plan-${tier}.png`, import.meta.url));
  for (const w of [480, 960]) {
    const base = sharp(src).resize({ width: w });
    await base.clone().avif({ quality: 50, effort: 6 }).toFile(`${OUT}plan-${tier}-${w}.avif`);
    await base.clone().webp({ quality: 72, effort: 6 }).toFile(`${OUT}plan-${tier}-${w}.webp`);
  }
  console.log(`plan-${tier}: avif ${(statSync(`${OUT}plan-${tier}-480.avif`).size / 1024).toFixed(0)}/${(statSync(`${OUT}plan-${tier}-960.avif`).size / 1024).toFixed(0)} KB`);
}

// "One experience on every screen" device images (assets/screens/screen-<device>.png)
const SCREENS = { tv: [640, 1280], laptop: [520, 1040], phone: [240, 480] };
for (const [device, widths] of Object.entries(SCREENS)) {
  const src = fileURLToPath(new URL(`../assets/screens/screen-${device}.png`, import.meta.url));
  for (const w of widths) {
    const base = sharp(src).resize({ width: w });
    await base.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}screen-${device}-${w}.avif`);
    await base.clone().webp({ quality: 74, effort: 6 }).toFile(`${OUT}screen-${device}-${w}.webp`);
  }
  console.log(`screen-${device}: avif ${widths.map((w) => (statSync(`${OUT}screen-${device}-${w}.avif`).size / 1024).toFixed(0)).join('/')} KB`);
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
