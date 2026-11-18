#!/usr/bin/env node
/**
 * IndexNow submissions for sygmatv.com (see scripts/indexnow-lib.mjs for the safety rules).
 *
 *   node scripts/indexnow.mjs snapshot --out before.json      fingerprints of the live sitemap pages
 *   node scripts/indexnow.mjs changed --before before.json    pages added / changed / removed since the snapshot
 *   node scripts/indexnow.mjs all                             every page of the live sitemap (country launch)
 *   node scripts/indexnow.mjs urls https://sygmatv.com/a ...  explicit pages (must be in the live sitemap)
 *
 * Dry run by default: nothing is sent without --send. Before sending, the key file must be live and match.
 */
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import {
  ENDPOINT,
  INDEXNOW_KEY,
  KEY_LOCATION,
  ORIGIN,
  assertProductionTarget,
  changedUrls,
  describeStatus,
  fingerprint,
  payload,
  sitemapUrls,
} from './indexnow-lib.mjs';

const UA = 'SYGMA-IndexNow/1.0 (+https://sygmatv.com)';
const args = process.argv.slice(2);
const cmd = args[0];
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const summary = (line) => {
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);
};

async function get(url) {
  const res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000) });
  return { status: res.status, text: res.status === 200 ? await res.text() : '' };
}

async function liveSitemap() {
  const { status, text } = await get(`${ORIGIN}/sitemap.xml`);
  if (status !== 200) throw new Error(`sitemap.xml answered ${status}`);
  return sitemapUrls(text);
}

async function snapshot() {
  const out = {};
  for (const url of await liveSitemap()) {
    try {
      const { status, text } = await get(url);
      out[url] = status === 200 ? fingerprint(text) : null;
    } catch {
      out[url] = null;
    }
  }
  return out;
}

async function send(urls) {
  const body = payload(urls);
  summary(`IndexNow: ${body.urlList.length} URL(s)\n${body.urlList.map((u) => `- ${u}`).join('\n')}`);
  if (!flag('--send')) return summary('Dry run: nothing sent (add --send).');
  const key = await get(KEY_LOCATION);
  if (key.status !== 200 || key.text.trim() !== INDEXNOW_KEY) {
    return summary(`Not sent: key file ${KEY_LOCATION} answered ${key.status} or does not match.`);
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8', 'user-agent': UA },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });
  summary(`IndexNow answered ${res.status}: ${describeStatus(res.status)}`);
  if (res.status >= 400) process.exitCode = 1;
}

async function main() {
  assertProductionTarget(process.env);
  if (cmd === 'snapshot') {
    const file = opt('--out') ?? 'indexnow-before.json';
    const snap = await snapshot();
    writeFileSync(file, JSON.stringify(snap));
    return console.log(`Snapshot of ${Object.keys(snap).length} page(s) written to ${file}.`);
  }
  if (cmd === 'changed') {
    const file = opt('--before') ?? 'indexnow-before.json';
    let before;
    try {
      before = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      return summary(`No snapshot (${file}): nothing compared, nothing sent.`);
    }
    const urls = changedUrls(before, await snapshot());
    if (urls.length === 0) return summary('IndexNow: no public page changed — nothing to send.');
    return send(urls);
  }
  if (cmd === 'all') return send(await liveSitemap());
  if (cmd === 'urls') {
    const live = new Set(await liveSitemap());
    const wanted = args.slice(1).filter((a) => !a.startsWith('--'));
    const refused = wanted.filter((u) => !live.has(u));
    if (refused.length) throw new Error(`Not in the live sitemap (not indexable): ${refused.join(', ')}`);
    return send(wanted);
  }
  console.log('Usage: node scripts/indexnow.mjs snapshot|changed|all|urls [--send]');
  process.exitCode = 2;
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
