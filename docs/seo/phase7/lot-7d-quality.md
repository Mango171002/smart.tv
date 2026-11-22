# Phase 7D — Final quality and SEO readiness (22 November 2026)

Branch `claude/seo-phase7d-quality`, from Phase 7C `970c92d`. Production reference `864f703`. `350882a` never included.
Nothing merged, deployed or published. French stays unpublished (release flag off).

## 1. English security / privacy wording aligned with the verified French

Only facts that are documented on the site remain: the privacy policy and the FAQ state « We never sell your data ».
No new promise is introduced; the legal documents and their own page descriptions are not changed.

| Place (English interface) | Phase 7C (production text) | Phase 7D | French (7C) |
|---|---|---|---|
| Home banner feature bar | Data Protected | Data Never Sold | Données jamais vendues |
| Final call to action (trust line) | Secure & private | Data never sold | Données jamais vendues |
| FAQ highlights | Your privacy matters | Data never sold | Données jamais vendues |
| Trial / support window (trust line) | Secure & private | Data never sold | Données jamais vendues |
| Order window (trust line) | Secure & private | Data never sold | Données jamais vendues |
| Footer chip | Secure & private | Free trial | Essai gratuit |
| Help text `help.contactSub` (not displayed today) | Your request is stored securely and we reply by email. | Your request is recorded and we reply by email. | Votre demande est enregistrée et nous répondons par e-mail. |

Not changed (outside the interface claims): the cookie-banner title « Cookies & privacy »; the legal pages and their meta
descriptions (« how we protect it », « consumer rights always protected »), which describe the legal documents.
Transactional emails contain no such claim (checked, not modified).

These are the **only intentional English differences** with Phase 7C (section 6).

## 2. French 404 without JavaScript — investigation

Today (7C): unknown `/fr/…` URLs answer **HTTP 404** (correct for search engines); the page body (French text, layout)
is completed in the browser. Without JavaScript the body is empty.

| Option | Tested | Result |
|---|---|---|
| A. Keep the current behaviour | Yes (7C, E2E) | Status 404 correct, French page with JavaScript; empty body without JavaScript. No risk. |
| B. Disable `experimental.globalNotFound` | Yes (prototype) | **Does not fix it**: `/fr/…` still an empty shell; English 404 unchanged. Rejected (no gain, risk on the English 404). |
| C. Nested 404 boundary (route group with its own layout and `not-found`) | Yes (prototype) | **Does not fix it** (same empty shell). Rejected. |
| D. Request proxy (`src/proxy.ts`, Next.js 16 middleware) rewriting unknown `/fr/…` to a static French 404 page | Yes (prototype) | French page rendered on the server, **but HTTP 200** (Next.js ignores the status of a rewrite) = soft 404. Rejected. |
| E. Cloudflare Worker post-processing (`worker.ts`): when the site answers 404 for a `/fr/…` URL, return the pre-rendered French 404 page **with status 404** | Design + mechanism check | Server-rendered French 404, status 404, no JavaScript needed, no change to Next.js routing; applies only to `/fr/…` 404 answers (none in production today: `/fr` redirects). |

**Recommendation: E**, as a small separate lot after approval (it changes the deployment entry `worker.ts`, so it is
not implemented here):

1. A static page `/fr/page-introuvable` (French 404 content, `noindex`, built only when French is built).
2. In `worker.ts`, wrap `fetch`: if the response is 404, the method is GET, the path starts with `/fr/` and the request
   accepts HTML, call the same OpenNext handler for `/fr/page-introuvable` (an internal call, no network) and return its
   body with status 404 and its headers.
3. Unit test with a mocked handler; check with `npm run cf:preview` (local Worker) before any deployment.

Until then, A remains acceptable: search engines rely on the 404 status, which is correct.

## 3. SEO audit (crawler, three configurations)

Crawler (`seo_audit.py`, scratchpad): sitemap + every internal link; for each page status, title, description, h1,
canonical, robots (meta + header), `lang`, hreflang; reciprocity and targets; sitemap vs indexable pages; duplicates.

| Configuration | Pages crawled | Indexable | Sitemap | hreflang pages | Issues |
|---|---|---|---|---|---|
| Production as configured today (content pages off, French off) | 8 | 6 | 6 | 0 | none ¹ |
| Production with About / Help `live` (French off) | 16 | 15 | 15 | 0 | none |
| French released + About / Help `live` | 26 | 25 | 25 | 20 (10 EN ↔ 10 FR) | none |

¹ The crawler's seed list includes `/about`, which is a 404 while the content pages are off (expected; not linked).

Checked for every indexable page: one H1; title ≤ 60; description 70–155; unique titles and descriptions;
self-referencing canonical; `lang` = page language; listed in the sitemap; hreflang `en` / `fr` / `x-default` including
itself, every target indexable and returning the same set, identical to the sitemap alternates; no sitemap URL that is
redirected, noindex or missing. Not indexable by design: `/blog`, `/fr/blog` (no articles), 404 pages, French preview.

Observation (no action needed): the home canonical / hreflang is written `https://sygmatv.com` (Next.js drops the root
slash) while the sitemap lists `https://sygmatv.com/`; both designate the same root URL for search engines.

## 4. French translation review (prices, devices, mobile)

| Point | Decision |
|---|---|
| Prices | One format everywhere (7C): « 59 $ US », « 4,92 $ US / mois », « 69 $ US », « 0,00 $ US » |
| Counting unit | « appareil » for plans and prices (« 1 appareil connecté », « Appareil supplémentaire », « Jusqu’à 4 appareils », « appareils simultanés ») — was mixed with « écran » |
| Marketing label | « Multi-écrans » everywhere (banner bar, benefits, FAQ highlight, footer) — was « Multi-appareils » in three places |
| Generic screens | « tous vos écrans », « vos écrans préférés » kept (not a count) |
| Hero sentence | « une vraie équipe qui vous accompagne sur WhatsApp pour l’installation » (was « pour vous installer », ambiguous) |
| FAQ eyebrow | « Réponses rapides » (was « Les réponses d’abord », literal) |
| Mobile layouts | Responsive E2E at 7 widths with fallback fonts on every French page (section 5) |

Automated: figures identical to English, terminology rules (`tests/unit/french-consistency.test.ts`).
Still for the native reviewer: « Sans reconduction », « TV en direct et VOD », « Fonction », « e-mail » vs « courriel ».

## 5. Tests

| Check | Result |
|---|---|
| TypeScript, ESLint | 0 errors (4 existing warnings in unrelated files) |
| Unit tests | 184 / 184 |
| E2E — production build (CI configuration, fallback fonts) | 165 passed, 0 failed |
| E2E — content pages preview | 205 passed, 0 failed |
| E2E — French preview + content pages | 255 passed, 0 failed |
| E2E — French released (flag on) + content pages | 255 passed, 0 failed |
| Accessibility (axe WCAG 2.1 AA), responsive (7 widths), order / trial windows, API regression | included above, all passing |
| CSS | byte-identical to Phase 7C |

## 6. English public pages vs Phase 7C

232 URLs compared (HTML, headers, status) in the three content-page modes, then a visible-text diff of every difference.

| Mode | Identical | Different | Differences (all intentional, section 1) |
|---|---|---|---|
| Content pages off (production today) | 223 | 9 | `/`: Data Protected → Data Never Sold; Your privacy matters → Data never sold; Secure & private → Data never sold (call to action); footer chip Secure & private → Free trial. 7 other pages (`/blog`, legal pages): footer chip only |
| Content pages preview | 219 | 13 | Same, plus the footer chip on `/about`, `/help` and topics |
| Content pages live | 219 | 13 | Same as preview |

The order, trial and support windows (rendered in the browser) show « Data never sold » instead of « Secure & private »
(covered by E2E). No other text, link, status, header, metadata or style differs.

## 7. Release flag

`NEXT_PUBLIC_RELEASED_LANGUAGES` is empty by default and absent from `.env.production`, `wrangler.jsonc`,
`open-next.config.ts`, `next.config.ts` and every workflow (unit test `tests/unit/release-flag.test.ts`). Production
build: `/fr`, `/fr/*` → 308 to the English page; no French URL, link or alternate.

## 8. Final SEO release-readiness report

**Technically ready**: English and French SEO (metadata, canonical, hreflang, sitemap, robots, indexing rules) verified in
production, content-live and French-released configurations; release flag off by default; all tests green.

Remaining blockers before any release (owner decisions):

| # | Blocker | Owner action |
|---|---|---|
| 1 | Deploy decision for the English lots (5C About/Help `live`, 6A, 6B, 7D English wording) | Approve and schedule |
| 2 | Native French review (« Sans reconduction », « TV en direct et VOD », « Fonction », « e-mail » / « courriel », overall tone) | Reviewer sign-off |
| 3 | Distribution rights for France, Canada, Switzerland, Luxembourg before French goes public | Confirm in writing |
| 4 | French 404 without JavaScript (option E, `worker.ts`) | Approve the small lot, or accept option A |
| 5 | Legal pages stay English (note + `hreflang="en"`) or French versions after legal validation | Decide |
| 6 | Written authorisation to set `NEXT_PUBLIC_RELEASED_LANGUAGES=fr` and deploy | Pending |

Non-blocking: French transactional emails (separate lot); a visible language switcher (not built yet — hreflang
already links the versions for search engines).
