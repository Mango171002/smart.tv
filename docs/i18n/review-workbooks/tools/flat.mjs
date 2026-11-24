// Flattens the dictionaries and the About / Help content of a source tree into one JSON (key path -> rendered string).
//   REVIEW_SRC=<src dir> node --experimental-strip-types --no-warnings --import ./register-hooks.mjs flat.mjs <out.json>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const L = ['en', 'fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'];
const R = path.resolve(process.env.REVIEW_SRC || 'src') + '/';
const out = process.argv[2];
const flat = (v, p, o) => { if (typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number') o[p] = v; else if (Array.isArray(v)) v.forEach((x, i) => flat(x, `${p}[${i}]`, o)); else if (v && typeof v === 'object') for (const k of Object.keys(v)) flat(v[k], p ? `${p}.${k}` : k, o); return o; };
const info = await import(pathToFileURL(R + 'content/info.ts').href);
const res = { dict: {}, info: {}, infoClosed: {} };
for (const l of L) {
  res.dict[l] = flat((await import(pathToFileURL(R + `i18n/dictionaries/${l}.ts`).href)).default, '', {});
  res.info[l] = flat(info.getInfo(l), '', {});
  res.infoClosed[l] = flat(info.infoFor(l, false), '', {});
}
fs.writeFileSync(out, JSON.stringify(res));
console.log(`${out}: ${Object.keys(res.dict.en).length} dictionary keys, ${Object.keys(res.info.en).length} About/Help keys`);
