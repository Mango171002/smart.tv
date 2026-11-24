// Builds the review-workbook rows (one JSON per language) from the Phase 13 pack generator (gen14.cjs = gen.cjs
// repointed to the current branch files, CLAIMS placeholders dropped, rows changed since the pack marked).
const fs = require('fs');
const G = require('./gen14.cjs');
const path = require('path');
const BUILD = process.env.REVIEW_BUILD || path.join(__dirname, 'build');
const F = require(path.join(BUILD, 'flat.json'));
const OUT = path.join(BUILD, 'rows');
fs.mkdirSync(OUT, { recursive: true });

const EN = F.info.en;
const TOPIC_NAMES = {}; for (const [k, v] of Object.entries(EN)) { const m = k.match(/^topics\[(\d)\]\.name$/); if (m) TOPIC_NAMES[m[1]] = v; }
const FIELD = { metaTitle: 'title tag', description: 'meta description (also og/twitter)', intro: 'intro paragraph', summary: 'summary (Help hub card)', name: 'name (cards, breadcrumb, links)', title: 'page heading (H1)' };
const UI = [
  [/^ui\.(home|breadcrumb)$/, 'breadcrumb'],
  [/^ui\.(popular|topics|glance|allTopics)$/, 'Help hub headings'],
  [/^ui\.helpFacts/, 'Help hub « at a glance » facts'],
  [/^ui\.aboutFacts/, 'About « at a glance » facts'],
  [/^ui\.aboutContact$/, 'About contact box'],
  [/^ui\.hubContact$/, 'Help hub contact box'],
  [/^ui\.topicContact$/, 'Help topic pages contact box'],
  [/^ui\.hubRelated/, 'Help hub related links'],
  [/^ui\.(refundPolicy|terms)\./, 'Help topic related legal link'],
  [/^ui\.(prevTopic|nextTopic)$/, 'Help topic previous / next links'],
  [/^ui\.content\./, 'page body (contact box, related links, table of contents, last reviewed)'],
  [/^ui\.actions\./, 'call-to-action buttons'],
  [/^ui\.prelaunch\.topicContact$/, 'Help topic pages contact box'],
  [/^ui\.prelaunch\.availability$/, 'Help hub « at a glance » facts, first item (small text)'],
  [/^ui\.support$/, 'support heading'],
];

function infoPlace(k, l) {
  const lp = `/${l}`;
  const pre = /\.prelaunch\./.test(k) ? ' (prelaunch variant, shown while orders are closed)' : '';
  let m;
  const section = (base, rest) => {
    let id = null; let title = null;
    const s = rest.match(/^sections\[(\d+)\]/);
    if (s) { id = EN[`${base}.sections[${s[1]}].id`]; title = EN[`${base}.sections[${s[1]}].title`]; }
    const p = rest.match(/^prelaunch\.sections\.(\w+)/);
    if (p) { id = p[1]; const i = Object.entries(EN).find(([kk, vv]) => kk.startsWith(`${base}.sections[`) && kk.endsWith('.id') && vv === id); title = i ? EN[i[0].replace(/\.id$/, '.title')] : id; }
    const f = rest.replace(/^prelaunch\./, '');
    return { id, where: title ? `section « ${title} »${/^(prelaunch\.)?sections(\[\d+\]|\.\w+)\.title$/.test(rest) ? ' (heading)' : ''}` : FIELD[f] || f };
  };
  if ((m = k.match(/^about\.(.*)$/))) { const s = section('about', m[1]); return { page: `${lp}/about${s.id ? `#${s.id}` : ''}`, loc: `About › ${s.where}${pre}`, rank: 70 }; }
  if ((m = k.match(/^hub\.(.*)$/))) return { page: `${lp}/help`, loc: `Help hub › ${/^popular/.test(m[1]) ? 'popular questions' : FIELD[m[1]] || m[1]}`, rank: 80 };
  if ((m = k.match(/^topics\[(\d)\]\.(.*)$/))) { const base = `topics[${m[1]}]`; const s = section(base, m[2]); return { page: `${lp}/help/${EN[`${base}.slug`]}${s.id ? `#${s.id}` : ''}`, loc: `Help › ${TOPIC_NAMES[m[1]]} › ${s.where}${pre}`, rank: 81 + Number(m[1]) }; }
  if (/^ui\./.test(k)) { const u = UI.find(([re]) => re.test(k)); return { page: `${lp}/about, ${lp}/help, ${lp}/help/*`, loc: `About / Help shared UI › ${u ? u[1] : k.slice(3)}${pre}`, rank: 90 }; }
  return { page: `${lp}/about, ${lp}/help`, loc: 'About / Help', rank: 90 };
}

function dictPlace(loc, l) {
  const h = `/${l}/`;
  let m;
  if ((m = loc.match(/^every page: (.*)$/))) return { page: 'every page', loc: m[1], rank: 0 };
  if (loc.startsWith('layout default title')) return { page: 'every page', loc: 'default title (layout), pages without their own title', rank: 0 };
  if (loc === '404 page') return { page: `/${l}/<unknown URL> (404)`, loc: '404 page', rank: 60 };
  if (loc.startsWith('country pickers')) return { page: h, loc: 'order / trial forms › country picker (CountryPicker), hidden while closed', rank: 10 };
  if (loc.startsWith('windows and simulator')) return { page: h, loc: 'order / trial / support windows and simulator (shared labels)', rank: 10 };
  if ((m = loc.match(/^(\/\w\w\/about), (\/\w\w\/help), (\/\w\w\/help\/\*) (.*)$/))) return { page: `${m[1]}, ${m[2]}, ${m[3]}`, loc: `prelaunch banner (PrelaunchBanner); ${m[4].replace(/^\(PrelaunchBanner; (.*)\)$/, '$1')}`, rank: 69 };
  if ((m = loc.match(/^(\/\w\w\/(#\w+|blog)?) ?(.*)$/))) {
    const page = m[1]; const rest = m[3].replace(/^\(([^()]*)\)/, '$1');
    const rank = { '': 10, '#plans': 20, '#how': 30, '#faq': 40, blog: 50 }[m[2] || ''];
    return { page: m[2] === 'blog' ? `${h}blog` : page, loc: rest || 'home', rank };
  }
  throw new Error(`no page for ${loc}`);
}

function maxCell(lim) {
  if (!lim) return '';
  const range = lim.min !== undefined ? `${lim.min}–${lim.max}` : `${lim.max}`;
  const extra = [lim.suffix ? `incl. « ${lim.suffix.trim()} »` : '', lim.plain ? 'without **' : '', lim.en ? 'guide only for fr, not test-enforced' : ''].filter(Boolean);
  return `${range}${extra.length ? ` (${extra.join('; ')})` : ''}`;
}
function curLen(lim, t) { const s = lim.plain ? t.replace(/\*\*/g, '') : t; return (lim.suffix ? s + lim.suffix : s).length; }

const CONSENTISH = /^(consent\.|checkout\.(consentMain|consentSub|marketingLabel|errors\.consent)$|forms\.consent$|request\.errors\.consent$)/;
const LINK_LABEL = /^(footer\.(legalLinks\.|legalTitle$|legalLanguageNote$)|faq\.items\[\d\]\.link\.label$|ui\.(hubRelated\[\d\]|refundPolicy|terms)\.label$|about\.sections\[6\]\.body\[0\]\.links\[\d\]\.(label|text)$)/;

const summary = {};
for (const l of G.LANGS) {
  const L = l.toUpperCase();
  const rows = G.rowsFor(l).map((r, i) => {
    const place = r.src === 'dict' ? dictPlace(r.loc, l) : infoPlace(r.k, l);
    const key = (r.src === 'info' ? 'info:' : '') + r.k;
    const lim = G.limit(r.k, r.src, l);
    const flags = [];
    if (r.legal) {
      flags.push(`legal sign-off${r.legalReg ? ` (register ${r.legalReg.join(', ')})` : ''}`);
      if (r.k === 'footer.entity') flags.push('legal-entity facts: do not change');
      else if (!CONSENTISH.test(r.k) && !LINK_LABEL.test(r.k)) flags.push('contractual: do not change the meaning');
      else if (CONSENTISH.test(r.k)) flags.push('privacy / consent wording: do not change the meaning');
    }
    if (r.why.length || r.changed === 'claims' || /^prelaunch\.home\.(setupText|supportBenefitText|compareSupport)$/.test(r.k)) flags.push(`claims${r.why.length ? ` (${r.why.join(', ')})` : ' (Phase 13 D6/D8 text)'}: keep the qualifiers, add no claim`);
    if (lim) { const n = curLen(lim, r.t); const ok = n <= lim.max && (lim.min === undefined || n >= lim.min); flags.push(`layout: ${n} / ${maxCell(lim).split(' ')[0]}${ok ? '' : ' OVER LIMIT'}`); }
    if (r.open) flags.push('open-orders text (returns when orders open)');
    if (r.safe) flags.push(`safe fix ${r.safe}${r.changed === r.safe ? ' applied' : ''}`);
    const notes = [...r.notes];
    if (r.open) notes.push(`Open-orders text: ${r.open.replace(/`/g, '')}.`);
    return {
      order: i, rank: place.rank, key, pri: r.pri, risk: r.risk, page: place.page, loc: place.loc,
      en: r.en, t: r.t, max: maxCell(lim), flags: flags.join('; '), note: notes.join(' ').replace(/`/g, ''), src: r.src,
      file: r.src === 'info' ? `src/content/${l}/info.ts` : `src/i18n/dictionaries/${l}.ts`, changed: r.changed || '',
    };
  });
  rows.sort((a, b) => a.pri - b.pri || a.rank - b.rank || a.order - b.order);
  const n = {};
  for (const r of rows) { n[r.pri] = (n[r.pri] || 0) + 1; r.id = `${L}-P${r.pri}-${String(n[r.pri]).padStart(3, '0')}`; }
  fs.writeFileSync(`${OUT}/${l}.json`, JSON.stringify(rows, null, 1));
  summary[l] = { total: rows.length, byPri: [1, 2, 3, 4, 5, 6].map((p) => rows.filter((r) => r.pri === p).length), high: rows.filter((r) => r.risk === 'high').length, legal: rows.filter((r) => /legal sign-off/.test(r.flags)).length, claims: rows.filter((r) => /claims/.test(r.flags)).length, changed: rows.filter((r) => r.changed).length, layout: rows.filter((r) => r.max).length, over: rows.filter((r) => /OVER LIMIT/.test(r.flags)).length };
}
fs.writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 1));

// Language rules and terminology for the « Instructions » sheet (from the pack, with the dash counts made current).
const langinfo = {};
for (const l of G.LANGS) {
  const rows = JSON.parse(fs.readFileSync(`${OUT}/${l}.json`, 'utf8'));
  const n = rows.filter((x) => / — /.test(x.t) && !/^SYGMA TV\+ — /.test(x.t)).length;
  langinfo[l] = {
    name: G.NAME[l],
    rules: G.RULES[l].map((s) => s.replace(/`/g, '')
      .replace(/The dictionary is (already )?clean except hero\.lead and cta\.text; About\/Help still have 9 strings with em dashes \(4 are safe fixes; 5 are sentences that mention WhatsApp, under rewrite\)\./, `${n} rows still use the English spaced em dash « — » (marked in the AI note).`)
      .replace(/\(about 10 strings\)/, `(${n} rows)`).replace(/in about 10 strings/, `in ${n} rows`)
      .replace(/ \(checked by script: clean in fr\.ts and fr\/info\.ts\)/, '')),
    terms: G.TERMS[l].map(([c, t]) => [c, t]),
  };
}
fs.writeFileSync(path.join(BUILD, 'langinfo.json'), JSON.stringify(langinfo, null, 1));
console.log(JSON.stringify(summary));
