/**
 * IndexNow (Bing, Yandex, Seznam, Naver… — Google does not use it): tells search engines which PUBLIC
 * pages of sygmatv.com were added, changed or removed, right after a production deployment.
 *
 * Safety rules (SEO phase 4, owner decision 18/11/2026):
 *  - only https://sygmatv.com URLs listed in the LIVE sitemap are ever sent (indexable pages only);
 *  - never from the preview (preview.sygmatv.com is refused, and so is any run in preview mode);
 *  - the key is public by design (it is served at /<key>.txt): it only proves we own the host.
 * Pure functions here; network calls are in scripts/indexnow.mjs.
 */

export const HOST = 'sygmatv.com';
export const ORIGIN = `https://${HOST}`;
export const INDEXNOW_KEY = 'f85f4dfde89fac6180f91862b82fea4c';
export const KEY_LOCATION = `${ORIGIN}/${INDEXNOW_KEY}.txt`;
export const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Throws unless the run targets the production host from a non-preview build. */
export function assertProductionTarget(env = {}) {
  const mode = env.NEXT_PUBLIC_SITE_MODE || env.SITE_MODE || '';
  if (mode === 'preview') throw new Error('IndexNow refused: preview mode never submits URLs.');
  const site = env.NEXT_PUBLIC_SITE_URL;
  if (site && new URL(site).host !== HOST) throw new Error(`IndexNow refused: site URL ${site} is not ${ORIGIN}.`);
}

/** True only for an https URL on the production host (no preview, no www, no other host). */
export function isPublicUrl(u) {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && url.host === HOST && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** <loc> entries of a sitemap, production URLs only. */
export function sitemapUrls(xml) {
  return [...String(xml).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
    .map((m) => m[1].replace(/&amp;/g, '&'))
    .filter(isPublicUrl);
}

const decode = (s) =>
  s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

/**
 * What a search engine reads on a page, without anything that changes at every build or request
 * (scripts, build hashes, nonces, analytics beacons): title, meta tags, canonical, hreflang, JSON-LD
 * and the visible text. Two fingerprints differ only when the indexable content changed.
 */
export function fingerprint(html) {
  const h = String(html);
  const head = [
    ...(h.match(/<title>[^<]*<\/title>/g) ?? []),
    ...(h.match(/<meta (?:name|property)="(?:description|robots|og:[a-z:_]+|twitter:[a-z:_]+)" content="[^"]*"/g) ?? []),
    ...(h.match(/<link rel="(?:canonical|alternate)"[^>]*>/g) ?? []),
    ...(h.match(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g) ?? []),
  ];
  const body = (h.match(/<body[\s\S]*<\/body>/) ?? [h])[0];
  const text = decode(
    body
      .replace(/<script\b[\s\S]*?<\/script>/g, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/g, ' ')
      .replace(/<noscript\b[\s\S]*?<\/noscript>/g, ' ')
      .replace(/<!--[\s\S]*?-->/g, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
  return [...head.map((x) => x.replace(/\/_next\/static\/[^"' )]+/g, '')), text].join('\n');
}

/**
 * URLs to notify: pages added to the sitemap, pages whose fingerprint changed, and pages removed from
 * the sitemap (IndexNow also expects removed URLs, so engines recrawl them and see the 404/redirect).
 * A page that could not be read before or after (null) is skipped: nothing is sent on a guess.
 */
export function changedUrls(before, after) {
  const out = [];
  for (const [url, fp] of Object.entries(after)) {
    if (fp === null) continue;
    if (!(url in before)) out.push(url);
    else if (before[url] !== null && before[url] !== fp) out.push(url);
  }
  for (const url of Object.keys(before)) if (!(url in after)) out.push(url);
  return out.filter(isPublicUrl);
}

/** IndexNow JSON body (https://www.indexnow.org/documentation). */
export function payload(urls) {
  const urlList = [...new Set(urls)].filter(isPublicUrl);
  if (urlList.length === 0) throw new Error('No public URL to submit.');
  if (urlList.length > 10000) throw new Error('IndexNow accepts at most 10,000 URLs per request.');
  return { host: HOST, key: INDEXNOW_KEY, keyLocation: KEY_LOCATION, urlList };
}

/** Human meaning of the IndexNow answer. */
export function describeStatus(status) {
  return (
    {
      200: 'OK — URLs received.',
      202: 'Accepted — the key is being validated, URLs received.',
      400: 'Bad request — invalid format.',
      403: 'Forbidden — the key file was not found or does not match.',
      422: 'Unprocessable — URLs do not belong to the host or the key does not match.',
      429: 'Too many requests — try again later.',
    }[status] ?? `Unexpected status ${status}.`
  );
}
