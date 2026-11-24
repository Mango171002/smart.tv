#!/usr/bin/env node
// Reads a returned native-review file (CSV, or the .xlsx workbook) and prints the reviewer's decisions per key.
// It never writes into src/: the integration lead applies accepted changes by hand, after the checks it prints.
//
//   node docs/i18n/review-workbooks/import-review.mjs <returned file> [more files] [--json] [--ref <original.csv>]
//
// CSV: UTF-8 (with or without BOM), separator « , » or « ; » (Excel in many European locales saves with « ; »).
// XLSX: read through python3 + openpyxl (sheet « Strings »); without them, save the Strings sheet as « CSV UTF-8 ».
// The original CSV shipped next to this script (review-<lang>.csv) is the reference for the locked columns A–K.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HEADER = ['ID', 'Priority', 'Risk', 'Page / URL', 'Location', 'Key', 'English reference', 'Current translation', 'Max length', 'Flags', 'AI note or question', 'Reviewer decision', 'Proposed text', 'Reviewer comment', 'Reviewer name', 'Date'];
const LOCKED = HEADER.slice(0, 11);
const DECISIONS = ['Approved', 'Approved with change', 'Rejected', 'Question'];

export function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const first = text.slice(0, text.search(/\r?\n/) >>> 0);
  const count = (ch) => first.split(ch).length;
  const sep = count(';') > count(',') ? ';' : count('\t') > count(',') ? '\t' : ',';
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === sep) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x !== ''));
}

export function readXlsx(file) {
  const py = `import json,sys
from openpyxl import load_workbook
ws = load_workbook(sys.argv[1], read_only=True, data_only=True)['Strings']
out = [['' if v is None else (v.strftime('%Y-%m-%d') if hasattr(v, 'strftime') else str(v)) for v in r] for r in ws.iter_rows(values_only=True)]
json.dump([r for r in out if any(x != '' for x in r)], sys.stdout, ensure_ascii=False)`;
  try {
    return JSON.parse(execFileSync('python3', ['-c', py, file], { encoding: 'utf8', maxBuffer: 64 << 20 }));
  } catch (e) {
    throw new Error(`Cannot read ${file} as .xlsx (needs python3 with openpyxl). Save the « Strings » sheet as CSV UTF-8 and import that file. (${e.message.split('\n')[0]})`);
  }
}

export function readTable(file) {
  const text = /\.xlsx$/i.test(file) ? null : fs.readFileSync(file, 'utf8');
  if (text && text.includes('\uFFFD')) throw new Error(`${file} is not UTF-8: save it again as « CSV UTF-8 » (Excel) or with the UTF-8 character set (LibreOffice).`);
  const rows = text === null ? readXlsx(file) : parseCsv(text);
  const head = rows[0].map((h) => h.trim());
  const missing = HEADER.filter((h) => !head.includes(h));
  if (missing.length) throw new Error(`${file}: missing column(s) ${missing.join(', ')} — was the header row changed?`);
  return rows.slice(1).map((r) => Object.fromEntries(HEADER.map((h) => [h, (r[head.indexOf(h)] ?? '').replace(/\r\n/g, '\n')])));
}

const placeholders = (s) => (s.match(/\{[a-zA-Z0-9]+\}/g) || []).sort().join(' ');
const bold = (s) => (s.match(/\*\*/g) || []).length;
function lengthCheck(max, text) {
  if (!max) return null;
  const m = max.match(/^(\d+)(?:–(\d+))?/);
  if (!m) return null;
  const [lo, hi] = m[2] ? [Number(m[1]), Number(m[2])] : [0, Number(m[1])];
  let t = /without \*\*/.test(max) ? text.replace(/\*\*/g, '') : text;
  if (/incl\. « \| SYGMA TV\+ »/.test(max)) t += ' | SYGMA TV+';
  const n = t.length;
  return { n, ok: n >= lo && n <= hi, range: m[2] ? `${lo}–${hi}` : `≤ ${hi}` };
}
const fileFor = (key, lang) => (key.startsWith('info:') ? `src/content/${lang}/info.ts` : `src/i18n/dictionaries/${lang}.ts`);

function main(argv) {
  const json = argv.includes('--json');
  const refIdx = argv.indexOf('--ref');
  const refArg = refIdx >= 0 ? argv[refIdx + 1] : null;
  const files = argv.filter((a, i) => !a.startsWith('--') && !(refIdx >= 0 && i === refIdx + 1));
  if (!files.length) { console.error('usage: node import-review.mjs <returned .csv or .xlsx> [...] [--json] [--ref original.csv]'); process.exit(2); }
  const report = [];
  let problems = 0;
  for (const file of files) {
    const rows = readTable(file);
    const lang = (rows[0]?.ID.match(/^([A-Z]{2})-/)?.[1] || '').toLowerCase();
    const refFile = refArg || path.join(HERE, `review-${lang}.csv`);
    const ref = fs.existsSync(refFile) ? new Map(readTable(refFile).map((r) => [r.ID, r])) : null;
    const warn = [];
    const changes = [];
    const counts = Object.fromEntries(DECISIONS.map((d) => [d, 0]));
    let pending = 0;
    const seen = new Set();
    for (const r of rows) {
      const id = r.ID;
      if (seen.has(id)) warn.push(`${id}: duplicate row`);
      seen.add(id);
      const o = ref?.get(id);
      if (ref && !o) warn.push(`${id}: unknown ID (not in ${path.basename(refFile)})`);
      if (o) for (const h of LOCKED) if (o[h] !== r[h]) warn.push(`${id}: locked column « ${h} » differs from the original workbook`);
      const d = r['Reviewer decision'].trim();
      const proposed = r['Proposed text'];
      if (!d) { pending++; if (proposed.trim()) warn.push(`${id}: proposed text without a decision`); continue; }
      if (!DECISIONS.includes(d)) { warn.push(`${id}: unknown decision « ${d} »`); continue; }
      counts[d]++;
      if (!r['Reviewer name'].trim() || !r.Date.trim()) warn.push(`${id}: decision without reviewer name or date`);
      if (d === 'Approved with change' && !proposed.trim()) warn.push(`${id}: « Approved with change » without a proposed text`);
      if ((d === 'Rejected' || d === 'Question') && !r['Reviewer comment'].trim()) warn.push(`${id}: « ${d} » without a comment`);
      if (d === 'Approved' && !proposed.trim()) continue;
      const checks = [];
      const legal = /legal sign-off/.test(r.Flags);
      if (proposed.trim()) {
        if (placeholders(proposed) !== placeholders(r['Current translation'])) checks.push(`PLACEHOLDERS differ (${placeholders(r['Current translation']) || 'none'} → ${placeholders(proposed) || 'none'})`);
        if (bold(proposed) !== bold(r['Current translation'])) checks.push('** BOLD PAIRS differ');
        if (proposed === r['Current translation']) checks.push('proposed text equals the current text');
        const len = lengthCheck(r['Max length'], proposed);
        if (len) checks.push(`length ${len.n} (${len.range}) ${len.ok ? 'ok' : 'OVER LIMIT: layout check needed'}`);
      }
      if (legal) checks.push('LEGAL SIGN-OFF REQUIRED before applying (meaning must not change)');
      changes.push({ id, priority: r.Priority, key: r.Key, file: fileFor(r.Key, lang), decision: d, current: r['Current translation'], proposed, comment: r['Reviewer comment'], reviewer: r['Reviewer name'], date: r.Date, flags: r.Flags, checks });
    }
    problems += warn.length;
    report.push({ file, lang, rows: rows.length, pending, counts, changes, warnings: warn });
  }
  if (json) { console.log(JSON.stringify(report, null, 1)); return; }
  for (const f of report) {
    console.log(`\n== ${f.lang} · ${f.file}`);
    console.log(`rows ${f.rows} · decided ${f.rows - f.pending} · pending ${f.pending} · ${DECISIONS.map((d) => `${d}: ${f.counts[d]}`).join(' · ')}`);
    for (const d of ['Approved with change', 'Rejected', 'Question', 'Approved']) {
      const list = f.changes.filter((c) => c.decision === d);
      if (!list.length) continue;
      console.log(`\n--- ${d} (${list.length})${d === 'Approved with change' ? ' — apply by hand in the file shown, then run the tests' : ''}`);
      for (const c of list) {
        console.log(`${c.id}  ${c.key}  [${c.file}]`);
        console.log(`  current : « ${c.current} »`);
        if (c.proposed) console.log(`  proposed: « ${c.proposed} »`);
        if (c.comment) console.log(`  comment : ${c.comment}`);
        if (c.checks.length) console.log(`  checks  : ${c.checks.join(' · ')}`);
        console.log(`  reviewer: ${c.reviewer || '?'} ${c.date || ''}`);
      }
    }
    if (f.warnings.length) { console.log(`\n--- Warnings (${f.warnings.length})`); for (const w of f.warnings) console.log(`  ${w}`); }
  }
  console.log(`\nNothing was written. Validation status stays « pending » until the Sign-off sheet is signed by a native reviewer.${problems ? ` ${problems} warning(s) above.` : ''}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main(process.argv.slice(2));
