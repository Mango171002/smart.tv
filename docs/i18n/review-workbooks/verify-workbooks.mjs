#!/usr/bin/env node
// Checks the review workbooks against the CURRENT site files. Read-only.
//
//   node --experimental-strip-types --no-warnings docs/i18n/review-workbooks/verify-workbooks.mjs
//
// 1. every « English reference » and « Current translation » cell (CSV and XLSX) equals the text loaded from
//    src/i18n/dictionaries/<lang>.ts and src/content/<lang>/info.ts (the TS files are imported, so template literals
//    are resolved exactly as the site renders them);
// 2. the CSV and the XLSX « Strings » sheet are identical, IDs and keys are unique, rows are sorted by priority;
// 3. the reviewer columns and the « Sign-off » sheet are empty (status pending), the decision dropdown, frozen header
//    and filter are present, no sheet is protected;
// 4. row reconciliation with the Phase 13 pack (docs/i18n/phase13/review-<lang>.md): pack + added − removed = workbook,
//    and every pack key no longer listed is explained (gone from the source, or now identical to English and < 30 chars).
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseCsv, readTable } from './import-review.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const SRC = path.join(ROOT, 'src') + '/';
const LANGS = ['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'];

// Resolve the « @/ » alias and extension-less relative imports of the TS sources.
const hooks = `
import { existsSync, statSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';
const SRC = ${JSON.stringify(SRC)};
export async function resolve(spec, ctx, next) {
  let p = null;
  if (spec.startsWith('@/')) p = SRC + spec.slice(2);
  else if ((spec.startsWith('./') || spec.startsWith('../')) && ctx.parentURL?.startsWith('file:')) p = path.resolve(path.dirname(fileURLToPath(ctx.parentURL)), spec);
  if (p) for (const c of [p, p + '.ts', p + '.tsx', p + '/index.ts']) if (existsSync(c) && statSync(c).isFile() && /\\.tsx?$/.test(c)) return next(pathToFileURL(c).href, ctx);
  return next(spec, ctx);
}`;
register('data:text/javascript,' + encodeURIComponent(hooks));

const flat = (v, p, out) => {
  if (typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number') out[p] = v;
  else if (Array.isArray(v)) v.forEach((x, i) => flat(x, `${p}[${i}]`, out));
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) flat(v[k], p ? `${p}.${k}` : k, out);
  return out;
};
const info = await import(pathToFileURL(SRC + 'content/info.ts').href);
const source = {};
for (const l of ['en', ...LANGS]) {
  const d = (await import(pathToFileURL(SRC + `i18n/dictionaries/${l}.ts`).href)).default;
  source[l] = { dict: flat(d, '', {}), info: flat(info.getInfo(l), '', {}) };
}
const lookup = (l, key) => (key.startsWith('info:') ? source[l].info[key.slice(5)] : source[l].dict[key]);

const xlsxMeta = (file) => JSON.parse(execFileSync('python3', ['-c', `import json,sys
from openpyxl import load_workbook
wb = load_workbook(sys.argv[1])
s, g = wb['Strings'], wb['Sign-off']
dv = [(str(d.sqref), d.formula1) for d in s.data_validations.dataValidation]
rev = sum(1 for r in s.iter_rows(min_row=2, min_col=12, max_col=16, values_only=True) for v in r if v not in (None, ''))
sign = [g.cell(row=r, column=2).value for r in list(range(4, 10)) + list(range(12, 16))]
json.dump({'sheets': wb.sheetnames, 'freeze': s.freeze_panes, 'filter': s.auto_filter.ref, 'dv': dv, 'reviewerCells': rev,
  'signoff': [v for v in sign if v not in (None, '')], 'protected': [w.title for w in wb.worksheets if w.protection.sheet],
  'rows': s.max_row - 1, 'signoffDv': [(str(d.sqref), d.formula1) for d in g.data_validations.dataValidation]}, sys.stdout)`, file], { encoding: 'utf8' }));

let failures = 0;
const fail = (msg) => { failures++; console.log(`  FAIL ${msg}`); };
const totals = {};
for (const l of LANGS) {
  const csvFile = path.join(HERE, `review-${l}.csv`);
  const xlsxFile = path.join(HERE, `review-${l}.xlsx`);
  const bom = fs.readFileSync(csvFile).subarray(0, 3).equals(Buffer.from([0xef, 0xbb, 0xbf]));
  const csv = readTable(csvFile);
  const xlsx = readTable(xlsxFile);
  console.log(`\n${l}: ${csv.length} rows (CSV), ${xlsx.length} rows (XLSX)`);
  if (!bom) fail('CSV has no UTF-8 BOM');
  if (csv.length !== xlsx.length) fail('CSV and XLSX row counts differ');
  // 1. source text
  let enBad = 0; let tBad = 0;
  for (const r of csv) {
    const en = lookup('en', r.Key); const t = lookup(l, r.Key);
    if (en !== r['English reference']) { enBad++; if (enBad <= 5) fail(`${r.ID} ${r.Key}: English reference differs from the source`); }
    if (t !== r['Current translation']) { tBad++; if (tBad <= 5) fail(`${r.ID} ${r.Key}: current translation differs from the source`); }
  }
  console.log(`  source match: English reference mismatches ${enBad}, current translation mismatches ${tBad}`);
  // 2. CSV = XLSX, unique, sorted
  let diff = 0;
  csv.forEach((r, i) => { for (const [h, v] of Object.entries(r)) if ((xlsx[i]?.[h] ?? '') !== v) { diff++; if (diff <= 5) fail(`${r.ID} column « ${h} »: CSV and XLSX differ`); } });
  console.log(`  CSV vs XLSX cell differences: ${diff}`);
  if (new Set(csv.map((r) => r.ID)).size !== csv.length) fail('duplicate IDs');
  if (new Set(csv.map((r) => r.Key)).size !== csv.length) fail('duplicate keys');
  if (csv.some((r, i) => i && r.Priority < csv[i - 1].Priority)) fail('rows not sorted by priority');
  const byP = {}; for (const r of csv) byP[r.Priority] = (byP[r.Priority] || 0) + 1;
  totals[l] = { rows: csv.length, ...byP };
  // 3. pending state and workbook features
  const meta = xlsxMeta(xlsxFile);
  const csvReviewer = csv.reduce((n, r) => n + ['Reviewer decision', 'Proposed text', 'Reviewer comment', 'Reviewer name', 'Date'].filter((h) => r[h] !== '').length, 0);
  if (csvReviewer || meta.reviewerCells) fail(`reviewer columns not empty (CSV ${csvReviewer}, XLSX ${meta.reviewerCells})`);
  if (meta.signoff.length) fail(`Sign-off sheet not empty: ${meta.signoff.join(', ')}`);
  if (meta.sheets.join('|') !== 'Instructions|Strings|Sign-off') fail(`sheets ${meta.sheets.join(', ')}`);
  if (meta.freeze !== 'A2') fail(`freeze panes ${meta.freeze}`);
  if (meta.filter !== `A1:P${csv.length + 1}`) fail(`filter ${meta.filter}`);
  if (!meta.dv.some(([ref, f]) => ref === `L2:L${csv.length + 1}` && f === '"Approved,Approved with change,Rejected,Question"')) fail('decision dropdown missing');
  if (!meta.signoffDv.some(([ref, f]) => ref === 'B8' && f === '"Approved,Approved with changes,Not approved"')) fail('overall-decision dropdown missing');
  if (meta.protected.length) fail(`protected sheets: ${meta.protected.join(', ')}`);
  console.log(`  pending: reviewer cells ${csvReviewer + meta.reviewerCells}, sign-off fields filled ${meta.signoff.length}; dropdowns, freeze A2, filter ${meta.filter}, protected sheets ${meta.protected.length}`);
  // 4. reconciliation with the Phase 13 pack
  const md = fs.readFileSync(path.join(ROOT, `docs/i18n/phase13/review-${l}.md`), 'utf8');
  const pack = new Set([...md.matchAll(/^\| [A-Z]{2}-P\d-\d{3} \| [^\n]*?\| `([^`]+)` \|/gm)].map((m) => m[1]));
  const now = new Set(csv.map((r) => r.Key));
  const added = [...now].filter((k) => !pack.has(k));
  const removed = [...pack].filter((k) => !now.has(k));
  const unexplained = removed.filter((k) => { const t = lookup(l, k); const en = lookup('en', k); return !(t === undefined || (t === en && String(en).length < 30)); });
  if (pack.size + added.length - removed.length !== now.size) fail('reconciliation arithmetic');
  if (unexplained.length) fail(`pack keys missing without reason: ${unexplained.join(', ')}`);
  console.log(`  pack ${pack.size} + added ${added.length} − removed ${removed.length} (all identical to English now: ${removed.map((k) => `${k} « ${lookup(l, k)} »`).join(', ') || 'none'}) = ${now.size}`);
}
console.log('\nRows per language and priority:', JSON.stringify(totals));
console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed.');
process.exit(failures ? 1 : 0);
