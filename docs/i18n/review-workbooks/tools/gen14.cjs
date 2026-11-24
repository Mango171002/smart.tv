/* eslint-disable @typescript-eslint/no-require-imports -- standalone Node (CommonJS) reviewer tool, not site code */
// Row generator of the Phase 13 native-review pack (docs/i18n/phase13), reused for the review workbooks: rendering scope,
// priorities, locations, risk, legal flags, layout limits and AI notes (notes.cjs, register.cjs). Changes from the pack's
// generator: the « CLAIMS » placeholders are dropped (claims D6/D8 landed in aad188e; `claims()` now returns the
// claims-sensitive topics for the « claims » flag), new Phase 13 keys are placed, and rows whose text changed since the
// pack (build/pack-flat.json, the files of 5c3635f) get a « new / rewritten / safe fix applied » note instead of the old one.
// Reads build/flat.json (current files, from flat.mjs). Used as a module by build.cjs (see regenerate.sh).
const fs = require('fs');
const path = require('path');
const BUILD = process.env.REVIEW_BUILD || path.join(__dirname, 'build');
const F = require(path.join(BUILD, 'flat.json')); // current files (flat.mjs)
const NOTES = require('./notes.cjs');
const REG = require('./register.cjs');
// Run directly (node gen14.cjs [dir]) it also writes the pack-style review-<lang>.md tables, for comparison only.
const OUT = process.argv[2] || path.join(BUILD, 'pack-md');
if (require.main === module) fs.mkdirSync(OUT, { recursive: true });
const OLD = require(path.join(BUILD, 'pack-flat.json')); // the Phase 13 pack's inputs (5c3635f), to mark rows changed since the pack
const LANGS = ['fr', 'de', 'es', 'it', 'nl', 'sv', 'nb'];
const NAME = { fr: 'French', de: 'German', es: 'Spanish', it: 'Italian', nl: 'Dutch', sv: 'Swedish', nb: 'Norwegian Bokmål' };

// ------------------------------------------------------------------ rendering scope
const NOT_RENDERED = /^(meta\.(plansTitle|plansDescription|devicesTitle|devicesDescription|coverageTitle|coverageDescription|helpTitle|helpDescription|notFoundTitle|legalTitle)$|common\.(prototypeNotice|notCalculated|months|stream|learnMore|illustrative)$|hero\.stamp$|plans\.(matrixTitle|matrixCaption|extraStreams|detailsTitle|details|footnote|source|terms\.lifetime)|devices\.|preview\.|helpCta\.|help\.|forms\.(?!consent$)|checkout\.(consentLabel|intro)$|coverage\.|footer\.(concept|complianceTitle|compliance|compliance2)$|legal\.)/;
const CODE = /\.(icon|href|cat|slug|id|plansHref|accent)$|values\[[1-9]\]$/; // values[0]: the comparison « Support » row text (same in the three plan columns)

// ------------------------------------------------------------------ priorities
function dictPriority(k) {
  if (/^prelaunch\./.test(k)) return 1;
  if (/^faq\.items\[\d\]\.link\.label$/.test(k)) return 3;
  if (/^faq\./.test(k)) return 1;
  if (/^(consent\.|footer\.(legalLinks|legalTitle|legalLanguageNote|entity$))/.test(k)) return 3;
  if (/^(checkout\.(consentMain|consentSub|marketingLabel|errors\.consent)|forms\.consent|request\.errors\.consent)$/.test(k)) return 3;
  if (/^(plans\.|checkout\.(summary\.|plan$|subtotal$)|markets\.|nav\.|hero\.cta|cta\.(choose|trial)$|how\.cta$|notFound\.(home|support)$|blog\.back$|featured\.(prev|next)$|common\.(perMonth|month|device|devices|streams|pending|close|back)$)/.test(k)) return 2;
  if (/^(checkout|request|forms)\.|^common\.country/.test(k)) return 5;
  return 4;
}
const INFO_LEGAL_LINK = /^(ui\.(hubRelated\[[23]\]|refundPolicy|terms)\.label|about\.sections\[6\]\.body\[0\]\.links\[[345]\]\.(label|text))$/;

// ------------------------------------------------------------------ locations
const lp = (l) => (l === 'en' ? '' : `/${l}`);
function dictLocation(k, l) {
  const h = `${lp(l)}/`;
  const R = [
    [/^prelaunch\.(orderTitle)/, `${h} order window heading (CheckoutDialog) + simulator button while closed (PlanConfigurator)`],
    [/^prelaunch\.(orderText|back|close)$/, `${h} order window (CheckoutDialog › PrelaunchNotice)`],
    [/^prelaunch\.trial/, `${h} trial window (RequestDialog) + closing-banner button (CtaBanner) + Help/About trial button`],
    [/^prelaunch\.support/, `${h} support window (RequestDialog)`],
    [/^prelaunch\.(contactLead|contactNote)$/, `${h} order / trial / support windows (PrelaunchNotice)`],
    [/^prelaunch\.faq/, `${h}#faq (Sections › Faq) + FAQPage JSON-LD`],
    [/^prelaunch\.metaDescription$/, `${h} meta description, og:description, twitter:description`],
    [/^prelaunch\.pages/, `${lp(l)}/about, ${lp(l)}/help, ${lp(l)}/help/* (PrelaunchBanner; pages live on staging only)`],
    [/^prelaunch\.home\.heroLead$/, `${h} Hero lead`],
    [/^prelaunch\.home\.(orderBenefit|trialBenefit)/, `${h} Benefits bar`],
    [/^prelaunch\.home\.(orderStepText|activationStepText|howNote)$/, `${h}#how (HowItWorks)`],
    [/^prelaunch\.home\.setupText$/, `${h}#plans trust bar, first item (Sections › PlanExtras)`],
    [/^prelaunch\.home\.supportBenefitText$/, `${h} Benefits bar, support item`],
    [/^prelaunch\.home\.compareSupport$/, `${h}#plans comparison table, « Support » row, every plan (Sections › PlanExtras)`],
    [/^prelaunch\.home\.trialGuarantee$/, `${h}#plans simulator point (PlanConfigurator) + CtaBanner`],
    [/^faq\.items\[\d\]\.(q|a)$/, `${h}#faq (Sections › Faq) + FAQPage JSON-LD`],
    [/^faq\./, `${h}#faq (Sections › Faq)`],
    [/^consent\./, 'every page: cookie banner and settings (ConsentBanner)'],
    [/^footer\.entity$/, 'every page: Footer, legal-entity line (« {entity} » = Sygma TV LLC)'],
    [/^footer\./, 'every page: Footer'],
    [/^(checkout\.(consentMain|consentSub|marketingLabel|errors\.consent))$/, `${h} order form (CheckoutDialog), hidden while closed`],
    [/^(forms\.consent|request\.errors\.consent)$/, `${h} trial / support form (RequestDialog), hidden while closed`],
    [/^plans\.compare\./, `${h}#plans comparison table (Sections › PlanExtras)`],
    [/^plans\.(devicesBar|trust)/, `${h}#plans devices bar / trust row (Sections › PlanExtras)`],
    [/^plans\.tiers\./, `${h}#plans plan cards (PlanConfigurator)`],
    [/^plans\.(eyebrow|title|titleHl|sub)$/, `${h}#plans section heading (page.tsx)`],
    [/^plans\./, `${h}#plans simulator (PlanConfigurator)`],
    [/^checkout\.(summary\.|plan$|subtotal$)/, `${h} order window summary box, also while closed (CheckoutDialog)`],
    [/^markets\./, `${h}#plans simulator region (PlanConfigurator)`],
    [/^nav\.(support|supportLabel)$/, 'every page: floating support button (SupportButton)'],
    [/^nav\.language$/, 'every page: language switcher (LanguageSwitcher)'],
    [/^nav\./, 'every page: Header'],
    [/^hero\./, `${h} Hero`],
    [/^benefits/, `${h} Benefits bar`],
    [/^featured\./, `${h} Featured carousel`],
    [/^content\./, `${h} ContentCategories`],
    [/^how\./, `${h}#how (HowItWorks)`],
    [/^cta\./, `${h} closing banner (CtaBanner)`],
    [/^blog\./, `${lp(l)}/blog (noindex)`],
    [/^notFound\./, '404 page'],
    [/^meta\.siteTitle$/, 'layout default title (all pages without their own title)'],
    [/^meta\./, `${h} title tag / meta description (page.tsx); the open text is also the layout default description`],
    [/^common\.skipToContent$/, 'every page: skip link (layout)'],
    [/^common\.country/, 'country pickers in the order / trial forms (CountryPicker)'],
    [/^common\./, 'windows and simulator (shared labels)'],
    [/^checkout\./, `${h} order form (CheckoutDialog), hidden while closed`],
    [/^request\./, `${h} trial / support form (RequestDialog), hidden while closed`],
  ];
  for (const [re, loc] of R) if (re.test(k)) return loc;
  return h;
}
const SLUGS = {}; for (const [k, v] of Object.entries(F.info.en)) { const m = k.match(/^topics\[(\d)\]\.slug$/); if (m) SLUGS[m[1]] = v; }
function infoLocation(k, l) {
  const pre = /\.prelaunch\./.test(k) ? ' (prelaunch variant)' : '';
  let m;
  const sec = (base, rest) => { const s = rest.match(/sections\[(\d)\]/); const id = s ? F.info.en[`${base}.sections[${s[1]}].id`] : null; const pid = rest.match(/prelaunch\.sections\.(\w+)/); return id ? `#${id}` : pid ? `#${pid[1]}` : ''; };
  if ((m = k.match(/^about\.(.*)$/))) return `${lp(l)}/about${sec('about', m[1])} (InfoContent)${pre}`;
  if (/^hub\./.test(k)) return `${lp(l)}/help (Help hub)`;
  if ((m = k.match(/^topics\[(\d)\]\.(.*)$/))) return `${lp(l)}/help/${SLUGS[m[1]]}${sec(`topics[${m[1]}]`, m[2])} (InfoContent)${pre}`;
  if (/^ui\./.test(k)) return 'About / Help pages (shared UI)';
  return 'About / Help';
}

// ------------------------------------------------------------------ open-only and claims-rewrite rows
const OPEN_ONLY = {
  'plans.previewCheckout': 'prelaunch.orderTitleA + orderTitleHl', 'cta.trial': 'prelaunch.trialTitleA + trialTitleHl', 'hero.lead': 'prelaunch.home.heroLead',
  'benefits[0].title': 'prelaunch.home.orderBenefitTitle', 'benefits[0].text': 'prelaunch.home.orderBenefitText', 'benefits[3].text': 'prelaunch.home.trialBenefitText',
  'plans.simulatorPoints[3]': 'prelaunch.home.trialGuarantee', 'how.steps[1].text': 'prelaunch.home.orderStepText', 'how.steps[2].text': 'prelaunch.home.activationStepText',
  'how.note': 'prelaunch.home.howNote', 'cta.text2': 'prelaunch.home.trialGuarantee', 'meta.homeDescription': 'prelaunch.metaDescription',
  'benefits[4].text': 'prelaunch.home.supportBenefitText', 'plans.trust[0].text': 'prelaunch.home.setupText', 'plans.compare.rows[6].values[0]': 'prelaunch.home.compareSupport',
  'faq.items[0].a': 'prelaunch.faqSubscribe', 'faq.items[1].a': 'prelaunch.faqCountries', 'faq.items[2].a': 'prelaunch.faqDevices',
};
const SIX = { en: /\b(6|six) languages/i, fr: /\b(6|six) langues/i, de: /\b(6|sechs) Sprachen/i, es: /\b(6|seis) idiomas/i, it: /\b(6|sei) lingue/i, nl: /\b(6|zes) talen/i, sv: /\b(6|sex) språk/i, nb: /\b(6|seks) språk/i };
function claims(k, text, l, src) {
  // Phase 13 claims D6/D8 landed (aad188e): no « CLAIMS » placeholder any more. This returns the claims-sensitive
  // topics of the row, for the « claims » flag (keep the qualifier, add no claim).
  const en = src === 'dict' ? F.dict.en[k] || '' : F.info.en[k] || '';
  const why = [];
  if (/24\/7/.test(en)) why.push('24/7 = automated assistant');
  if (/where available|available in your country|depend(s|ing) on (your|the) (country|channels)|may vary|vary by country/i.test(en) || (src === 'dict' && /^featured\.items\[\d+\]\.region$/.test(k))) why.push('availability qualifier');
  if (/WhatsApp|\bphone\b/i.test(en)) why.push('contact channel');
  if (src === 'dict' && /^(plans\.devicesBar\.items\[\d\]|checkout\.deviceOptions\[\d\])$/.test(k)) why.push('device category');
  if (/\b4K\b|HDR/.test(en)) why.push('picture quality');
  return why;
}

// ------------------------------------------------------------------ legal-adjacent rows
const LEGAL_WORDS = /guarant|garant|rembours|reembols|rimbors|geld-terug|geld zurück|geld terug|terugbetal|pengarna|pengene|refund|refus|erstatt|återbetal|widerruf|rétract|desist|recesso|herroep|ångerrätt|angrerett|withdraw|satisfait|soddisfatti|money-back|tilbake-garanti/i;
const LEGAL_DICT = /^(consent\.|footer\.entity$|faq\.items\[[345]\]\.|plans\.tiers\.\w+\.features\[3\]\.text$|plans\.trust\[[13]\]\.|plans\.simulatorPoints\[[23]\]$|cta\.(text2|trust\[[01]\])$|how\.note$|prelaunch\.(orderText|home\.(howNote|trialGuarantee))$|checkout\.(offerTitle|offerText|productionNote|trust\[[01]\]|consentMain|consentSub|marketingLabel|errors\.consent|taxes|taxesValue)$|forms\.consent$|request\.(errors\.consent|trust\[[02]\])$|footer\.(legalLinks|legalLanguageNote)|hero\.checks\[1\]$|faq\.highlights\[2\]$|plans\.compare\.rows\[[45]\]\.label$|plans\.bonus$)/;
const LEGAL_INFO = /^(topics\[6\]\.|topics\[3\]\.sections\[[1245]\]|topics\[3\]\.(intro|description)$|about\.sections\[3\]\.body\[0\]\.list\[[0-3]\]$|about\.sections\[5\]\.body\[[023]\]|about\.sections\[4\]\.body\[0\]\.p$|topics\[0\]\.sections\[1\]\.body\[0\]\.list|topics\[1\]\.sections\[1\]\.body\[0\]\.p$|topics\[2\]\.sections\[1\]\.body\[0\]\.p$|topics\[5\]\.sections\[1\]\.body\[0\]\.p$|ui\.helpFacts\[1\]\.small$|ui\.(hubRelated\[[23]\]|refundPolicy|terms)\.label$|about\.sections\[6\]\.body\[0\]\.links\[[345]\]\.)/;

// ------------------------------------------------------------------ layout limits (tests/unit/translations.test.ts, prelaunch-copy.test.ts, french.test.ts)
function limit(k, src, l) {
  const cardOnlyEnforcedFor = l === 'fr' ? ' (guide: not test-enforced for fr)' : '';
  if (src === 'dict') {
    if (k === 'meta.homeTitle') return { max: 60, note: 'starts with « SYGMA TV+ — »' };
    if (k === 'meta.homeDescription' || k === 'prelaunch.metaDescription') return { min: 70, max: 155 };
    if (k === 'blog.metaDescription') return { max: 155, en: cardOnlyEnforcedFor };
    if (/^plans\.tiers\.\w+\.features\[\d\]\.text$/.test(k)) return { max: 22, plain: true, en: cardOnlyEnforcedFor };
    if (/^plans\.tiers\.\w+\.tagline$/.test(k)) return { max: 34, en: cardOnlyEnforcedFor };
    if (/^plans\.tiers\.\w+\.note$/.test(k)) return { max: 70, en: cardOnlyEnforcedFor };
    if (/^footer\.chips\[\d\]$/.test(k)) return { max: 16, en: cardOnlyEnforcedFor };
    if (k === 'plans.compare.feature') return { max: 10, en: cardOnlyEnforcedFor };
    if (/^hero\.checks\[\d\]$/.test(k)) return { max: 24, en: cardOnlyEnforcedFor };
    if (/^benefits\[\d\]\.title$/.test(k)) return { max: 20, en: cardOnlyEnforcedFor };
    if (/^benefits\[\d\]\.text$/.test(k)) return { max: 35, en: cardOnlyEnforcedFor };
    if (k === 'prelaunch.home.orderBenefitTitle') return { max: 20 };
    if (/^prelaunch\.home\.(orderBenefitText|trialBenefitText)$/.test(k)) return { max: 35 };
    if (k === 'footer.tagline') return { max: 34, en: cardOnlyEnforcedFor };
    return null;
  }
  if (/^(about|hub|topics\[\d\])\.metaTitle$/.test(k)) return { max: 60, suffix: ' | SYGMA TV+' };
  if (/^(about|hub|topics\[\d\])\.(prelaunch\.)?description$/.test(k)) return { min: 70, max: 155 };
  return null;
}
function limitCell(lim, text) {
  if (!lim) return '';
  const t = lim.plain ? text.replace(/\*\*/g, '') : text;
  const n = (lim.suffix ? t + lim.suffix : t).length;
  const ok = n <= lim.max && (lim.min === undefined || n >= lim.min);
  const range = lim.min !== undefined ? `${lim.min}–${lim.max}` : `≤ ${lim.max}`;
  return `${n} / ${range}${lim.suffix ? ' with the brand suffix' : ''}${lim.plain ? ' (without **)' : ''} ${ok ? 'ok' : '**OVER**'}${lim.en || ''}`;
}

// ------------------------------------------------------------------ risk
const ASSISTIVE = /(\.alt|artAlt|visualLabel|globeAlt|pauseVideo|playVideo|carouselLabel|slideLabel|skipToContent|toggleMenu|nav\.label|nav\.language|nav\.supportLabel|featured\.(prev|next)|checkout\.summary\.changeLabel)$/;
function risk(k, src, pri, legal, l) {
  if (legal) return 'high';
  if (src === 'info') return /\.prelaunch\./.test(k) ? 'medium' : 'low';
  if (pri === 5) return 'low';
  if (OPEN_ONLY[k]) return 'medium';
  if (/^prelaunch\.pages/.test(k)) return 'medium';
  if (ASSISTIVE.test(k)) return 'medium';
  if (/^(blog|notFound)\./.test(k)) return 'medium';
  if (/^meta\.siteTitle$/.test(k)) return 'medium';
  if (/^common\.(close|back|pending)$/.test(k)) return 'medium';
  if (/^nav\.(trial|getStarted)$/.test(k)) return 'high';
  return 'high';
}

// ------------------------------------------------------------------ helpers
const words = (s) => (String(s).replace(/\*\*|\{[a-z0-9]+\}/gi, ' ').match(/[\p{L}\p{N}][\p{L}\p{N}’'\-+.%/]*/gu) || []).length;
const cell = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\*/g, '\\*').replace(/\n/g, ' ');
const q = (s) => `« ${cell(s)} »`;

// ------------------------------------------------------------------ rows
function rowsFor(l) {
  const rows = [];
  const notes = NOTES[l] || {};
  const regKeys = new Map();
  for (const r of REG[l] || []) for (const k of r.keys) {
    if (k === 'info:*abgebucht') { for (const [ik, iv] of Object.entries(F.info[l])) if (typeof iv === 'string' && /abgebucht/.test(iv) && !/\.prelaunch\./.test(ik)) regKeys.set(`info:${ik}`, (regKeys.get(`info:${ik}`) || []).concat(r.id)); }
    else regKeys.set(k, (regKeys.get(k) || []).concat(r.id));
  }
  // dictionary
  for (const [k, en] of Object.entries(F.dict.en)) {
    if (typeof en !== 'string' || CODE.test(k) || NOT_RENDERED.test(k)) continue;
    const t = F.dict[l][k];
    if (t === en && en.length < 30) continue; // brand / technical names identical to English
    const pri = dictPriority(k);
    const legalReg = regKeys.get(k);
    const legal = pri === 3 || Boolean(legalReg) || LEGAL_DICT.test(k) || LEGAL_WORDS.test(en);
    rows.push(mk(l, 'dict', k, k, en, t, pri, legal, legalReg, notes[k]));
  }
  // About / Help
  const closed = F.infoClosed[l];
  for (const [k, en] of Object.entries(F.info.en)) {
    if (typeof en !== 'string' || CODE.test(k) || /facts\[\d\]\[1\]$|^reviewed$|^supportHours$/.test(k)) continue;
    const t = F.info[l][k];
    if (t === undefined) continue;
    if (t === en && en.length < 30) continue;
    const isPre = /\.prelaunch\./.test(k);
    if (isPre && Object.entries(F.info[l]).some(([kk, vv]) => !/\.prelaunch\./.test(kk) && vv === t)) continue; // prelaunch copy of an open block
    const pri = isPre ? 1 : INFO_LEGAL_LINK.test(k) ? 3 : 6;
    const legalReg = regKeys.get(`info:${k}`);
    const legal = pri === 3 || Boolean(legalReg) || LEGAL_INFO.test(k) || LEGAL_WORDS.test(en);
    const r = mk(l, 'info', k, `info:${k}`, en, t, pri, legal, legalReg, notes[`info:${k}`]);
    if (!isPre && closed[k] !== t) r.open = 'replaced or removed while orders are closed (prelaunch variant or trial-button label)';
    rows.push(r);
  }
  const grp = (r) => (r.pri !== 1 ? 0 : r.src === 'info' ? 2 : /^prelaunch\./.test(r.k) ? 0 : 1);
  return rows.map((r, i) => [r, i]).sort((a, b) => a[0].pri - b[0].pri || grp(a[0]) - grp(b[0]) || a[1] - b[1]).map(([r]) => r);
}
function cleanNote(n) {
  return n
    .replace(/ The text line below is in the WhatsApp rewrite\./, '')
    .replace(/The 24\/7 line below is in the claims rewrite: decide together\./, 'The 24/7 line below now names the automated assistant (Phase 13): decide together.')
    .replace(/ Mentions WhatsApp: claims rewrite\./, '')
    .replace(/ \(Phase 12 L-023; hero\.lead is in the WhatsApp rewrite\)/, ' (Phase 12 L-023)')
    .replace(/ hero\.lead is in the WhatsApp rewrite\./, '');
}
function mk(l, src, k, nk, en, t, pri, legal, legalReg, note) {
  const why = claims(k, t, l, src);
  const r = { l, src, k, en, t, pri, legal, legalReg, why, notes: [], safe: null };
  r.loc = src === 'dict' ? dictLocation(k, l) : infoLocation(k, l);
  r.risk = risk(k, src, pri, legal, l);
  r.lim = limitCell(limit(k, src, l), t);
  if (src === 'dict' && OPEN_ONLY[k]) r.open = `replaced while orders are closed by \`${OPEN_ONLY[k]}\``;
  const S = src === 'dict' ? 'dict' : 'info';
  const oldT = OLD[S][l][k], oldEn = OLD[S].en[k];
  const noteText = note ? cleanNote(typeof note === 'string' ? note : note.n) : '';
  const safeId = note && typeof note === 'object' ? note.safe : null;
  if (oldEn === undefined) { r.changed = 'new'; r.notes.push('New string in Phase 13 (aad188e): AI draft not covered by the earlier review; check in full.'); }
  else if (oldT !== t && safeId) { r.changed = safeId; r.safe = safeId; r.notes.push(`Safe fix ${safeId} applied (b7772bd): ${noteText} AI fix: please confirm.`); }
  else if (oldT !== t) { r.changed = 'claims'; r.notes.push('Rewritten in Phase 13 claims D6/D8 (aad188e): new AI text, not covered by the earlier review; check in full.'); }
  else { if (noteText) r.notes.push(noteText); if (safeId) r.safe = safeId; if (oldEn !== en) r.notes.push('English reference changed in Phase 13 (« e-mail » → « email », SF-01/SF-02); translation unchanged.'); }
  if (l === 'es' && / — /.test(t) && !note && !/^SYGMA TV\+ — /.test(t)) r.notes.push('Spaced raya: Spanish attaches the rayas to the inserted words (« —…— ») or uses commas or brackets (Phase 12 L-024).');
  if ((l === 'nl' || l === 'nb') && / — /.test(t) && !r.safe && !/^SYGMA TV\+ — /.test(t)) r.notes.push('Spaced em dash: use a spaced en dash « – » (Phase 12 L-023).');
  if (src === 'dict' && k === 'plans.compare.rows[6].values[0]') r.notes.push('Same text in the three plan columns.');
  if (src === 'dict' && /^faq\.items\[\d\]\.(q|a)$/.test(k)) r.notes.push('Also published in the FAQPage JSON-LD.');
  if (/^faq\.items\[[3-5]\]\.a$/.test(k) || (legalReg && legalReg.length)) { /* flagged below */ }
  return r;
}

// ------------------------------------------------------------------ per-language guidance
const RULES = {
  fr: [
    'Register: « vous » everywhere. Language level: international French, no France-only wording where a neutral term exists (Canada, Switzerland, Belgium, Luxembourg also read this page).',
    'Typography: U+00A0 (no-break space) before « : ; ? ! » and inside « » (checked by script: clean in `fr.ts` and `fr/info.ts`); curly apostrophe ’; capital accents (« À propos », « États-Unis »).',
    'Numbers and prices: « 59 $ US », « 20 % » (U+00A0). Do not change any figure or price.',
    'Dashes: the spaced « — » around inserted phrases is acceptable in French; a period or comma is often more natural (see notes).',
    'Gender: masculine generic is used (« contacté », « satisfait », « Prêt à commencer ? »). Confirm the convention; changes in consent text need legal sign-off.',
    '« e-mail » is used throughout; « courriel » is the Québec/OQLF term. Decide for Canadian readers.',
  ],
  de: [
    'Register: « Sie » everywhere. One German page also serves Switzerland and Austria; « ß » is used (brief decision; Swiss readers write « ss »).',
    'Typography: „…“ quotes; spaced en dash « – » (no em dash except the title prefix « SYGMA TV+ — », required by test); « 20 % » with U+00A0; « 59 USD ».',
    'Compounds: « 24/7-Support », « Smart-TVs » (Duden) vs product label « Smart TV »: decide one spelling for running text.',
    'Short labels may use « gratis »; running text uses « kostenlos » (Phase 10 rule).',
  ],
  es: [
    'Register: « tú » to the customer, « nosotros » for the brand; customer-voice questions are impersonal or first person singular, never « vosotros » (Phase 10 rule).',
    'Typography: «…» quotes; every « ? » and « ! » is opened with « ¿ » and « ¡ » (test-enforced); « 20 % » with U+00A0 (RAE); « 59 USD ».',
    'Rayas: Spanish attaches the raya to the inserted words (« —normalmente en la hora siguiente— »). The current spaced « — » (about 10 strings) follows English style: native to decide (Phase 12 L-024).',
    'Variant: Spain Spanish (« ordenador », « móvil », « tele »); « wifi » lowercase (RAE).',
  ],
  it: [
    'Register: « tu » to the customer; customer-voice questions address the company with « voi » (« Quando rispondete? »), which is the neutral Italian way (Phase 10 rule).',
    'Typography: «…» quotes without inner spaces; « 20% » without a space (current house style); « 59 USD »; curly apostrophe ’.',
    'Dashes: Italian usually uses a spaced en dash « – »; the current text uses the spaced em dash « — » in about 10 strings. Native to decide.',
    'Masculine generic forms (« Pronto a iniziare? », « soddisfatto ») and the slash form « ricontattato/a » in consent text (legal sign-off).',
  ],
  nl: [
    'Register: « je » (unstressed), « jouw » only where stressed; the company is « we / ons ».',
    'Typography: quotes are mixed (‘…’ in the cookie banner, “…” on the content pages): pick one house style. « 20% » without a space; prices « USD 59 » (test-enforced).',
    'Dashes: Dutch uses a spaced en dash « – » (gedachtestreepje). The dictionary is already clean except `hero.lead` and `cta.text`; About/Help still have 9 strings with em dashes (4 are safe fixes; 5 are sentences that mention WhatsApp, under rewrite).',
    'Lowercase « tv », « live-tv », « tv-gids » in running text; product names keep their spelling (Smart TV, Android TV…).',
    'Human support is in English for Dutch customers (Phase 11 owner decision): keep the approved sentence « Onze medewerkers helpen je in het Engels. » wherever it appears.',
  ],
  sv: [
    'Register: « du »; the company is « vi ». Customer-voice questions address the company with « ni » (« När svarar ni? »).',
    'Typography: ”…” quotes (Swedish style); spaced en dash « – »; « 20 % » with U+00A0; « 59 USD »; lowercase « tv », « live-tv ».',
    '« mejl » for an email message, « e-post » for the channel (both Språkrådet-approved; Phase 10).',
    'Human support is in English for Swedish customers (Phase 11 owner decision): keep « Vår personal hjälper dig på engelska. ».',
  ],
  nb: [
    'Register: « du »; the company is « vi / teamet vårt ». Customer-voice questions use « dere » for the company.',
    'Typography: «…» quotes; spaced en dash « – » (tankestrek, Språkrådet). The dictionary is clean except `hero.lead` and `cta.text`; About/Help still have 9 strings with em dashes (4 are safe fixes; 5 are sentences that mention WhatsApp, under rewrite). « 20 % » with U+00A0; « 59 USD ».',
    '« TV » uppercase with suffixes (« TV-en », « Smart-TV-er » in running text, « Smart TV » as a label).',
    'Plural of « abonnement » is « abonnementer » (Bokmål); the zero plural is Nynorsk.',
    'Human support is in English for Norwegian customers (Phase 11 owner decision): keep « Medarbeiderne våre hjelper deg på engelsk. ».',
  ],
};
const TERMS = {
  fr: [['plan', 'formule', '« plan » never in the text; « forfait » once, for a mobile data plan (correct)'], ['subscription', 'abonnement', ''], ['device', 'appareil', '« écrans » only in « Multi-écrans »'], ['free trial', 'essai gratuit', ''], ['order', 'commande / commander', ''], ['support', 'assistance', '« support » only in the address support@sygmatv.com'], ['money-back guarantee', 'Satisfait ou remboursé 7 jours', 'legal sign-off for any change']],
  de: [['plan', 'Tarif', '« Paket » only for the content bundle'], ['subscription', 'Abo', ''], ['device', 'Gerät', ''], ['free trial', 'kostenloser Testzugang (CTA « Kostenlos testen »)', '**« kostenloser Test » in `how.note`, `prelaunch.home.howNote`, `prelaunch.home.trialGuarantee`, `prelaunch.metaDescription`** (see P1)'], ['order', 'Bestellung / bestellen', '« Bestellreferenz » and « Bestellnummer » both used, as in English'], ['support', 'Support', ''], ['money-back guarantee', 'Geld-zurück-Garantie', 'legal sign-off for any change']],
  es: [['plan', 'plan', ''], ['subscription', 'suscripción', ''], ['device', 'dispositivo', '« pantalla(s) » only for screens'], ['free trial', 'prueba gratuita', '« prueba gratis » kept only for length: `nav.trial`, `footer.chips[1]`, `benefits[3].title`, `prelaunch.trialTitleA`, `prelaunch.metaDescription` (the last two can take « gratuita », see P1)'], ['order', 'pedido', ''], ['support', 'soporte', '« atención al cliente » once (About intro, under rewrite)'], ['money-back guarantee', 'garantía de reembolso', 'legal sign-off for any change']],
  it: [['plan', 'piano', ''], ['subscription', 'abbonamento', ''], ['device', 'dispositivo', ''], ['free trial', 'prova gratuita', '**« Prova gratis » only in `footer.chips[1]`: safe fix SF-03**'], ['order', 'ordine', ''], ['support', 'assistenza', ''], ['money-back guarantee', 'Soddisfatti o rimborsati (per 7 giorni)', 'legal sign-off for any change']],
  nl: [['plan / subscription', 'abonnement', '« plan » no longer used (fixed in Phase 12)'], ['device', 'apparaat', ''], ['free trial', 'gratis proefperiode (CTA « Gratis proberen »)', '**« Gratis proef » only in `footer.chips[1]`: safe fix SF-06**'], ['order', 'bestelling / bestellen', ''], ['support', 'klantenservice', ''], ['money-back guarantee', 'geld-terug-garantie', 'legal sign-off for any change']],
  sv: [['plan', 'paket', ''], ['subscription', 'abonnemang', ''], ['device', 'enhet', ''], ['free trial', 'gratis provperiod (CTA « Testa gratis »)', ''], ['order', 'beställning', '« köp » once in `hub.metaTitle` (see P6)'], ['support', 'support / supporten', 'no « kundtjänst »'], ['money-back guarantee', 'pengarna-tillbaka-garanti', 'short « Pengarna tillbaka » forms are register items sv 5 / sv 6']],
  nb: [['plan / subscription', 'abonnement', '« pakke » only for the content bundle'], ['device', 'enhet', ''], ['free trial', 'gratis prøveperiode (CTA « Prøv gratis »)', ''], ['order', 'bestilling', '« ordrenummer / ordrereferanse » for the order number, as in English'], ['support', 'kundestøtte', ''], ['money-back guarantee', 'pengene-tilbake-garanti', '« Pengene tilbake » (plans.trust[1].title) is Phase 12 L-036, owner/legal']],
};

// Phase 12 localisation audit (40 findings): current status, checked against the files of 5c3635f.
const P12 = [
  ['L-001', 'all', 'Fixed', 'While closed, `plans.previewCheckout` is replaced by the « Orders opening soon » label (`src/lib/prelaunch-copy.ts`).'],
  ['L-002', 'all', 'Fixed', '`cta.trial` and the Help/About trial button use the « Free trials opening soon » label while closed.'],
  ['L-003', 'all', 'Fixed', 'FAQ answers 1–3 swapped for `prelaunch.faqSubscribe`, `faqCountries`, `faqDevices` (page and JSON-LD, `src/lib/faq.ts`).'],
  ['L-004', 'all', 'Fixed', '`prelaunch.metaDescription` while closed; Organization/WebSite JSON-LD use the English prelaunch description.'],
  ['L-005', 'all', 'Partly fixed', 'Hero lead, benefits 1 and 4, simulator point, How-it-works steps and note, banner line now have prelaunch variants. Still shown while closed: WhatsApp lines (`benefits[4].text`, `plans.compare.rows[6]`, `plans.trust[0]`) — in the claims rewrite.'],
  ['L-006', 'nl sv nb', 'Open (claims rewrite)', '« 24/7 support in 6 languages » is being rewritten by the claims workstream.'],
  ['L-007', 'nl sv nb', 'Fixed', '`prelaunch.contactNote` now ends with the approved English-support sentence.'],
  ['L-008', 'all', 'Mitigated', 'About/Help prelaunch variants and banner exist (staging); production pages still unpublished. The « How the service works » intro and steps are kept by design while closed.'],
  ['L-009', 'fr', 'Open (owner/legal)', '« Sans reconduction » unchanged.'],
  ['L-010', 'all', 'Open (owner/legal)', 'Cookie policy vs Marketing consent category.'],
  ['L-011', 'fr de es it nl sv nb', 'Open (owner/legal)', 'Legal pages in English only.'],
  ['L-012', 'nl', 'Fixed', '« Ons meest complete abonnement · … ».'],
  ['L-013', 'nb', 'Fixed', '« Vårt mest komplette abonnement · … ».'],
  ['L-014', 'es', 'Fixed', '« Nuestro plan más completo · … ».'],
  ['L-015', 'fr es it nl nb', 'Fixed', '`how.steps[0].text` uses the plan term.'],
  ['L-016', 'es it nl sv nb', 'Fixed', '`benefits[1].text` uses the device term.'],
  ['L-017', 'fr de es it', 'Open (native + owner)', 'Plus tagline still says « ideal ».'],
  ['L-018', 'fr es it', 'Addressed', 'fr `Sélection **maximale**`, es `Nuestra **mayor** oferta`, it `La **massima** scelta`: native to confirm.'],
  ['L-019', 'sv nb', 'Open (owner/legal)', '« Ingen autoförnyelse » / « Ingen autofornyelse » unchanged.'],
  ['L-020', 'it', 'Fixed', 'Summary box and `prelaunch.orderText` both say « La tua scelta ».'],
  ['L-021', 'nl', 'Fixed', '« Je keuze » everywhere.'],
  ['L-022', 'nb', 'Fixed', '« Valget ditt vises nedenfor … ».'],
  ['L-023', 'nl nb', 'Partly fixed', '`blog.empty` fixed; `cta.text` and 4 About/Help strings per language are safe fixes; `hero.lead` and 5 About/Help sentences that mention WhatsApp wait for the claims rewrite.'],
  ['L-024', 'es', 'Open (native)', 'Spaced rayas unchanged.'],
  ['L-025', 'de', 'Partly fixed', 'Footer chip « Kostenlos testen » fixed; `how.note` and the new prelaunch notes still say « kostenloser Test ».'],
  ['L-026', 'de', 'Fixed', '« Mehrere Geräte ».'],
  ['L-027', 'nl', 'Open (native)', '« Tv en mobiel », « Flexibel abonnement » unchanged.'],
  ['L-028', 'de', 'Fixed', '« Loslegen ».'],
  ['L-029', 'en', 'Fixed', '« Choose {plan} ».'],
  ['L-030', 'en', 'Open', 'Guillemets in the English consent text (consent text: legal sign-off).'],
  ['L-031', 'en', 'Open', '« e-mail » in three English prelaunch strings (two are safe fixes SF-01, SF-02; `prelaunch.pagesText` is in the WhatsApp rewrite); US « Customize » next to UK « organised », « Catalogue ».'],
  ['L-032', 'en', 'Open (owner)', 'Title Case in a few English headings.'],
  ['L-033', 'en', 'Open (owner/legal)', 'English legal calque « Satisfied or refunded ».'],
  ['L-034', 'en', 'Open (owner/legal)', 'Tense mismatch in the English Terms.'],
  ['L-035', 'es it', 'Open (native + owner)', '« Siempre a tu lado » / « Sempre al tuo fianco » unchanged.'],
  ['L-036', 'nb', 'Open (owner/legal)', '« Pengene tilbake » unchanged.'],
  ['L-037', 'sv es', 'Fixed', '`footer.faq` key: « Vanliga frågor », « Preguntas frecuentes ».'],
  ['L-038', 'all', 'Fixed', 'English and translations now say « shown below for reference ».'],
  ['L-039', 'nb', 'Open (owner/legal)', 'Mixed « cookies » / « informasjonskapsler » in the banner.'],
  ['L-040', 'es', 'Open (native)', '« Es hora de empezar a ver. » unchanged.'],
];

const PRI = {
  1: 'P1 — Prelaunch block, FAQ and prelaunch variants',
  2: 'P2 — Plans, simulator, order summary, buttons and navigation',
  3: 'P3 — Legal-adjacent: consent banner, cookie and legal link labels (legal sign-off needed)',
  4: 'P4 — Other home copy, metadata and structured data',
  5: 'P5 — Order and request forms (hidden while orders are closed)',
  6: 'P6 — About and Help pages',
};

function render(l, rows) {
  const L = l.toUpperCase();
  const counters = {};
  const byP = (p) => rows.filter((r) => r.pri === p);
  for (const r of rows) { counters[r.pri] = (counters[r.pri] || 0) + 1; r.id = `${L}-P${r.pri}-${String(counters[r.pri]).padStart(3, '0')}`; }
  const o = [];
  o.push(`# ${NAME[l]} (${l}) native-speaker review pack — Phase 13`);
  o.push('');
  o.push(`**Status: pending native review.** Every row below is an AI translation that no native speaker has validated. Notes and suggestions are an AI review (Claude), not a native-speaker validation and not legal advice. Nothing in this file is « validated ».`);
  o.push('');
  o.push(`Source: branch \`claude/p13-l10n\` (release candidate \`5c3635f\`), files \`src/i18n/dictionaries/${l}.ts\`, \`src/content/${l}/info.ts\`, \`src/lib/prelaunch-copy.ts\`. Strings are quoted exactly as in the files (French no-break spaces included); in the tables \`*\` and \`|\` are escaped so they display literally. How to use this pack: [README.md](README.md).`);
  o.push('');
  // summary
  o.push('## Summary');
  o.push('');
  o.push('| Priority | Rows | Words (current text) | High | Medium | Low | Legal sign-off | Claims rewrite | Safe fix |');
  o.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|');
  let tot = [0, 0, 0, 0, 0, 0, 0, 0];
  for (const p of [1, 2, 3, 4, 5, 6]) {
    const rs = byP(p); const w = rs.reduce((a, r) => a + words(r.t), 0);
    const c = [rs.length, w, rs.filter((r) => r.risk === 'high').length, rs.filter((r) => r.risk === 'medium').length, rs.filter((r) => r.risk === 'low').length, rs.filter((r) => r.legal).length, rs.filter((r) => r.why.length).length, rs.filter((r) => r.safe).length];
    tot = tot.map((x, i) => x + c[i]);
    o.push(`| ${PRI[p].split(' — ')[0]} | ${c.join(' | ')} |`);
  }
  o.push(`| **Total** | ${tot.map((x) => `**${x}**`).join(' | ')} |`);
  o.push('');
  o.push('Risk: **high** = visible now (prelaunch) on the home page, in the order/trial/support windows, in the FAQ or in search metadata, or legal-adjacent; **medium** = assistive text (alt, aria), secondary pages (blog, 404), open-orders text that returns when orders open, About/Help prelaunch variants; **low** = forms hidden while closed and About/Help pages (unpublished in production). Word counts use the Phase 12 method (rendered strings only; placeholders and `**` ignored).');
  o.push('');
  // rules
  o.push('## 1. Language rules for the reviewer');
  o.push('');
  for (const s of RULES[l]) o.push(`- ${s}`);
  o.push('- Meaning: English is the functional reference only. Prefer natural, professional wording over a literal rendering, but keep every fact, figure, price, duration, placeholder (`{n}`, `{price}`…) and `**bold**` pair, and never add a claim (superlatives, « live sports », « international channels », volumes, « IPTV », « VIP », « replay » are blocked by test).');
  o.push('');
  o.push('## 2. Terminology');
  o.push('');
  o.push('| Concept | Term used on the site | Notes from this review |');
  o.push('|---|---|---|');
  for (const [c, t, n] of TERMS[l]) o.push(`| ${c} | ${t} | ${n || 'Consistent (checked by script over the dictionary and About/Help).'} |`);
  o.push('');
  // P12
  o.push('## 3. Phase 12 localisation audit: status in this language');
  o.push('');
  o.push('| Finding | Status | Current state |');
  o.push('|---|---|---|');
  for (const [id, langs, st, txt] of P12) if (langs === 'all' || langs.split(' ').includes(l)) o.push(`| ${id} | ${st} | ${txt} |`);
  o.push('');
  // legal
  o.push('## 4. Legal sign-off needed (no rewording of contractual meaning proposed)');
  o.push('');
  o.push('These rows are **contractual or privacy wording**. The native reviewer may comment on grammar and naturalness, but any change needs the owner or the legal reviewer. The « register suggestion » is the Phase 10/11 AI proposal, copied for reference: it is not applied and not endorsed here.');
  o.push('');
  o.push('### 4a. Phase 11 sensitive-wording register (« REQUIRES OWNER/LEGAL APPROVAL »)');
  o.push('');
  o.push('| Register ID | Category | Key | Current text (exact) | Register suggestion (not applied) |');
  o.push('|---|---|---|---|---|');
  for (const r of REG[l]) {
    const keys = [];
    for (const k of r.keys) {
      if (k === 'info:*abgebucht') { for (const [ik, iv] of Object.entries(F.info[l])) if (typeof iv === 'string' && /abgebucht/.test(iv) && !/\.prelaunch\./.test(ik)) keys.push(`info:${ik}`); }
      else keys.push(k);
    }
    keys.forEach((k, i) => {
      const t = k.startsWith('info:') ? F.info[l][k.slice(5)] : F.dict[l][k];
      if (t === undefined) throw new Error(`missing ${l} ${k}`);
      o.push(`| ${i === 0 ? r.id : '〃'} | ${i === 0 ? r.cat : ''} | \`${k}\` | ${q(t)} | ${i === 0 ? cell(r.prop) : ''} |`);
    });
  }
  o.push('');
  const p12legal = { fr: [['L-009', '`plans.tiers.*.features[3].text`', 'Can read as « non-renewable ». Owner/legal; Phase 12 suggestion « Sans reconduction tacite » (24 characters, over the 22-character card guide).']], sv: [['L-019', '`plans.tiers.*.features[3].text`', 'Non-standard « autoförnyelse » on the plan cards. Owner/legal; Phase 12 suggestion « Förnyas inte automatiskt » (24 > 22: layout check).']], nb: [['L-019', '`plans.tiers.*.features[3].text`', 'Non-standard « autofornyelse ». Owner/legal; Phase 12 suggestion « Fornyes ikke automatisk » (23 > 22: layout check).'], ['L-036', '`plans.trust[1].title`', '« Pengene tilbake » drops « garanti ». Owner/legal; Phase 12 suggestion « Pengene-tilbake-garanti ».'], ['L-039', '`consent.title`, `consent.policy`, `consent.settings`, `footer.legalLinks.cookies`', 'Mixed « informasjonskapsler » / « cookies ». Owner/legal to choose one term.']] };
  o.push('### 4b. Other owner/legal points from Phase 12');
  o.push('');
  o.push('| Finding | Key | Point |');
  o.push('|---|---|---|');
  for (const [id, k, t] of p12legal[l] || []) o.push(`| ${id} | ${k} | ${t} |`);
  o.push('| L-010 | `consent.marketingTitle`, `consent.marketingText` | The banner asks for Marketing consent (Google Ads, Meta, TikTok) while the English cookie policy lists no advertising cookie. Owner/legal. |');
  o.push('| L-011 | footer legal links, `footer.legalLanguageNote`, FAQ « (in English) » link labels | Legal documents exist in English only; legal to confirm whether local-language terms are required before a public release in this language. |');
  o.push('');
  o.push('Every other row flagged « LEGAL » in the tables below (refunds, renewal, withdrawal, payment, taxes, consent, data, guarantees, « not a guarantee » disclaimers) follows the same rule: **contractual meaning: do not change without legal**.');
  o.push('');
  // claims
  const cr = rows.filter((r) => r.why.length);
  o.push('## 5. Strings in the claims rewrite (skipped here)');
  o.push('');
  o.push(`Another workstream is rewriting these claims in all languages right now: sports « International » labels, device brand names, « 24/7 support in 6 languages » and WhatsApp mentions. ${cr.length} rows of this file are affected; they stay in the tables with their current text, marked « CLAIMS », and carry no proposal. Review the new text when it lands.`);
  o.push('');
  // metadata
  o.push('## 6. Metadata and structured data');
  o.push('');
  o.push('| Key | Where | Current text | Length |');
  o.push('|---|---|---|---|');
  const metaKeys = [['meta.homeTitle', 'home title tag'], ['meta.siteTitle', 'default title suffix'], ['prelaunch.metaDescription', 'home description while closed (now)'], ['meta.homeDescription', 'home description when open (CLAIMS)'], ['blog.metaDescription', 'blog'], ['notFound.metaTitle', '404 title']];
  for (const [k, w] of metaKeys) { const t = F.dict[l][k]; const lim = limit(k, 'dict', l); o.push(`| \`${k}\` | ${w} | ${q(t)} | ${lim ? limitCell(lim, t) : `${t.length}`} |`); }
  for (const [k, t] of Object.entries(F.info[l])) if (/^(about|hub|topics\[\d\])\.(metaTitle|description|prelaunch\.description)$/.test(k)) { const lim = limit(k, 'info', l); o.push(`| \`info:${k}\` | ${infoLocation(k, l).replace(/ \(.*$/, '')} | ${q(t)} | ${limitCell(lim, t)} |`); }
  o.push('');
  o.push('Structured data: the Organization and WebSite JSON-LD descriptions are the **English** home description on every language page (test-enforced: one entity, one value) — nothing to translate. The FAQPage JSON-LD repeats the visible FAQ of this page (P1 rows marked « JSON-LD »).');
  o.push('');
  // tables
  let sec = 7;
  for (const p of [1, 2, 3, 4, 5, 6]) {
    o.push(`## ${sec++}. ${PRI[p]}`);
    o.push('');
    if (p === 6) o.push('Pages `/about`, `/help`, `/help/<topic>`: unpublished in production (`NEXT_PUBLIC_CONTENT_PAGES` unset), live on staging with the prelaunch variants. Shared texts (order steps, payment methods) appear once per page in the files and once per row here.\n');
    if (p === 5) o.push('Hidden while orders are closed (`FEATURE_CONTACT_FORM=false`); needed before orders open.\n');
    o.push('| ID | Page / location | Key | English reference | Current translation | Risk | Layout limit | Flags | Reviewer question / AI suggestion |');
    o.push('|---|---|---|---|---|---|---|---|---|');
    for (const r of byP(p)) {
      const flags = ['PENDING'];
      if (r.legal) flags.push(`LEGAL${r.legalReg ? ` (${r.legalReg.join(', ')})` : ''}: contractual meaning: do not change without legal`);
      if (r.why.length) flags.push('CLAIMS');
      if (r.safe) flags.push(`SAFE-FIX ${r.safe}`);
      if (r.open) flags.push('OPEN-ONLY');
      const notes = [...r.notes];
      if (r.open) notes.push(`Open-orders text: ${r.open}. Shown again when orders open.`);
      o.push(`| ${r.id} | ${cell(r.loc)} | \`${r.src === 'info' ? 'info:' : ''}${r.k}\` | ${q(r.en)} | ${q(r.t)} | ${r.risk} | ${r.lim} | ${flags.join('; ')} | ${cell(notes.join(' '))} |`);
    }
    o.push('');
  }
  return o.join('\n');
}

module.exports = { rowsFor, render, PRI, NAME, LANGS, limit, words, RULES, TERMS };
if (require.main === module) {
const summary = {};
for (const l of LANGS) {
  const rows = rowsFor(l);
  fs.writeFileSync(`${OUT}/review-${l}.md`, render(l, rows) + '\n');
  summary[l] = {};
  for (const p of [1, 2, 3, 4, 5, 6]) { const rs = rows.filter((r) => r.pri === p); summary[l][p] = { rows: rs.length, words: rs.reduce((a, r) => a + words(r.t), 0), high: rs.filter((r) => r.risk === 'high').length, legal: rs.filter((r) => r.legal).length, claims: rs.filter((r) => r.why.length).length }; }
}
// English reference word counts (same rows, English text)
const enRows = rowsFor('fr');
summary.en = {}; for (const p of [1, 2, 3, 4, 5, 6]) { const rs = enRows.filter((r) => r.pri === p); summary.en[p] = { words: rs.reduce((a, r) => a + words(r.en), 0) }; }
fs.writeFileSync(`${BUILD}/summary.json`, JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary));
}
