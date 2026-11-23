# D9 — Cookie policy and consent banner: corrected draft (for owner / legal approval)

Status: **DRAFT, not published.** Nothing in `src/content/legal.ts` or in the banner dictionaries has been changed.
Prepared by the phase 13 security audit (agent D, 23/11/2026) from measurements on the release candidate `5c3635f`.
Each text below must be approved by the owner and a lawyer before it replaces the current text. The 8 banner
languages (en, fr, de, es, it, nl, sv, nb) must then be translated from the approved English text.

## 1. What was measured

Method: Chromium (Playwright), a fresh profile for each scenario, home page, then `/legal/cookies`; cookies, localStorage
and sessionStorage read after 6–8 s on each page; every third-party request recorded.

- **Local production-like build** (`npm run build` + `next start`, analytics allowed by the QA flag
  `sygma_analytics_force`). Vendor library files were allowed to download (`gtag/js`, `gtm.js`, Clarity tag); every
  hit (collect, conversion, remarketing, pixel) was **aborted**, so no measurement data reached Google or Microsoft.
  Exception, reported in the security report (D13-017): in a first run, the Google Ads remarketing endpoint answered as a
  "script" and was let through twice (page URL `127.0.0.1`, headless browser, no personal data).
- **Live https://sygmatv.com** (read-only): before any choice and after « Decline all » only; every third-party request
  was recorded and aborted, nothing was accepted on the live site.

| Scenario | Cookies | localStorage / sessionStorage | Third-party requests |
|---|---|---|---|
| (a) Before any choice — local | none | none (only the QA flag) | **none** |
| (a) Before any choice — live | none | none | `static.cloudflareinsights.com/beacon.min.js` (Cloudflare Web Analytics, injected by Cloudflare; cookie-less) |
| (b) « Decline all » — local | none | `sygma_consent` = `{"v":2,"analytics":"denied","marketing":"denied","ts":…}` | **none** |
| (b) « Decline all » — live | none | `sygma_consent` (as above) | Cloudflare Web Analytics beacon only |
| (c) « Accept all » — local | `_ga`, `_ga_258WWPPN8Y` (400 d), `_clck` (365 d), `_gcl_au` (90 d) on the site; `CLID` on `www.clarity.ms` (365 d); first run also `IDE` (400 d) and `test_cookie` on `.doubleclick.net` | `sygma_consent`, `_gcl_ls` (localStorage); `_cltk` (sessionStorage) | GA4 (`analytics.google.com`, `www.google-analytics.com`, `stats.g.doubleclick.net`, `www.google.com/g/collect`), Clarity (`*.clarity.ms/collect`, `c.clarity.ms/c.gif`), **Google Ads** (`googleads.g.doubleclick.net/pagead/viewthroughconversion/18577285546`, `www.google.com/rmkt/collect/…`, `www.google.com/pagead/1p-user-list/…`, `www.google.com/ccm/collect`, `ad.doubleclick.net/ccm/s/collect`) |
| Analytics only (Customize) — local | `_ga`, `_ga_258WWPPN8Y`, `_clck`; `CLID` (clarity.ms) | `_cltk` | GA4 + Clarity only; the no-ads CSP is active, **no advertising request** |
| Marketing only (Customize) — local | `_gcl_au` | `_gcl_ls` | Google Ads only (GTM container) |
| Withdrawal (Accept all → Cookie settings → Decline all) — local, RC | first-party cookies removed; `CLID` (third-party, cannot be removed by the site) stays | **`_gcl_ls` and `_cltk` stayed** | none after the reload |
| Withdrawal — after fix D13-006 | idem | `_gcl_ls` and `_cltk` removed (E2E `consent-storage.spec.ts`) | none |

Conclusions:
- **No script loads and nothing is stored before a choice**, and nothing after « Decline all » (local and live). The
  banner sentence « Nothing is set until you choose » is accurate for cookies and storage.
- The only request made for every visitor is **Cloudflare Web Analytics** (cookie-less, no storage). It is not mentioned
  in the cookie policy.
- The GTM container `GTM-MGCLXP5L` (public file, read 23/11/2026) contains a Google tag for **Google Ads
  AW-18577285546**, one conversion tag and the conversion linker. Its default configuration sends **remarketing**
  (audience lists) as well as conversion measurement. **No Meta or TikTok tag** is configured.
- The current policy says « **No advertising cookie is used at the moment** » — this is no longer true once a visitor
  accepts Marketing (`_gcl_au`, `_gcl_ls`, Google cookies on `doubleclick.net` / `google.com`).

## 2. Inventory (cookies and browser storage)

« Set before consent » = observed before the visitor made any choice.

| Name | Provider | Type / domain | Purpose | Category | Duration | Set before consent | Evidence |
|---|---|---|---|---|---|---|---|
| `sygma_consent` | SYGMA TV+ | localStorage, sygmatv.com | Remembers your cookie choices (Analytics, Marketing) and the date | Strictly necessary | Until you change it or the policy version changes | **No** (written when you choose) | measured |
| — (no cookie) | Cloudflare Web Analytics | request to `cloudflareinsights.com` | Anonymous page-load statistics (performance, pages viewed); no cookie, no storage | Strictly necessary / exempt audience measurement (to be confirmed by legal) | — | **Yes — request only, nothing stored** | measured (live) |
| `__cf_bm`, `cf_clearance` | Cloudflare | cookie, sygmatv.com | Bot protection / security challenge, only if Cloudflare suspects automated traffic | Strictly necessary | 30 min / up to 1 year | Not observed (only when a challenge is shown) | vendor documentation |
| `_ga` | Google Analytics 4 | cookie, sygmatv.com | Distinguishes visitors for audience statistics | Analytics | 2 years (browsers may cap at 400 days) | No | measured |
| `_ga_258WWPPN8Y` | Google Analytics 4 | cookie, sygmatv.com | Keeps the session state for audience statistics | Analytics | 2 years (browsers may cap at 400 days) | No | measured |
| `_clck` | Microsoft Clarity | cookie, sygmatv.com | Keeps a Clarity visitor ID and preferences | Analytics | 1 year | No | measured |
| `_clsk` | Microsoft Clarity | cookie, sygmatv.com | Links page views into one session recording | Analytics | 1 day | No | vendor documentation (not observed: hits were blocked) |
| `_cltk` | Microsoft Clarity | sessionStorage, sygmatv.com | Session tracking | Analytics | Until the tab is closed | No | measured |
| `CLID` | Microsoft Clarity | cookie, www.clarity.ms (third party) | Identifies the first Clarity visit of the browser | Analytics | 1 year | No | measured |
| `MUID`, `ANONCHK`, `SM`, `MR` | Microsoft (Clarity / Bing) | cookies, clarity.ms / bing.com (third party) | Microsoft user ID and service cookies used by Clarity | Analytics | MUID 1 year, ANONCHK 10 min, SM session, MR 7 days | No | vendor documentation (not observed: hits were blocked) |
| `_gcl_au` | Google Ads (conversion linker, via GTM) | cookie, sygmatv.com | Links visits to ad clicks to measure conversions | Marketing | 90 days | No | measured |
| `_gcl_ls` | Google Ads (conversion linker) | localStorage, sygmatv.com | Same purpose as `_gcl_au`, kept in browser storage | Marketing | Until deleted | No | measured |
| `_gcl_aw`, `_gcl_gb`, `_gcl_dc` | Google Ads | cookie, sygmatv.com | Stores the ad-click identifier when you arrive from a Google ad | Marketing | 90 days | No | vendor documentation (only after an ad click) |
| `IDE` | Google (DoubleClick) | cookie, .doubleclick.net (third party) | Advertising: conversion measurement and remarketing (showing our ads to past visitors) | Marketing | 13 months (browsers may cap at 400 days) | No | measured (first run) |
| `test_cookie` | Google (DoubleClick) | cookie, .doubleclick.net (third party) | Checks whether the browser accepts cookies | Marketing | 15 minutes | No | measured (first run) |
| Google cookies on `google.com` (e.g. `NID`, `__Secure-3PSID…` when signed in to Google) | Google | third party | Advertising preferences, remarketing lists | Marketing | up to 2 years | No | vendor documentation |
| `_fbp`, `_fbc` (Meta), `_ttp`, `tt_*` (TikTok) | — | — | **Not used today** (no Meta / TikTok tag in GTM). The site already removes them on withdrawal for the future. | Marketing | — | No | container read 23/11/2026 |

Not listed publicly: `sygma_analytics_force` (localStorage) is a QA switch for the team's own browsers, never set for
visitors.

## 3. Proposed cookie policy text (English) — replaces the `COOKIES` sections of `src/content/legal.ts`

**Your choice**
> Optional cookies and similar technologies (local storage) are only used if you accept them in the cookie banner,
> separately for Analytics and Marketing. If you decline, the site works the same. Strictly necessary storage and our
> cookie-less statistics are always used.

**Always on (no consent needed)**

| Name | Provider | Purpose | Duration |
|---|---|---|---|
| sygma_consent (local storage) | SYGMA TV+ | Remembers your cookie choices | Until you change them |
| No cookie | Cloudflare Web Analytics | Anonymous, cookie-less statistics on page loads and performance | — |
| __cf_bm, cf_clearance | Cloudflare | Protects the site against bots (only if a security check is shown) | 30 minutes / up to 1 year |

**Analytics (only with your consent)**

| Name | Provider | Purpose | Duration |
|---|---|---|---|
| _ga, _ga_* | Google Analytics | Audience measurement | 2 years |
| _clck, _clsk, _cltk (session storage) | Microsoft Clarity | How the site is used, to improve it | 1 year / 1 day / session |
| CLID, MUID (on clarity.ms / bing.com) | Microsoft | Clarity visitor identification | 1 year |

**Marketing (only with your consent)**

| Name | Provider | Purpose | Duration |
|---|---|---|---|
| _gcl_au, _gcl_aw, _gcl_ls (local storage) | Google Ads | Measures which ads lead to a visit or a request | 90 days (local storage: until deleted) |
| IDE, test_cookie (on doubleclick.net) and Google cookies | Google | Measures our ads and shows our ads to people who visited the site (remarketing) | up to 13 months |

> We do not use Meta or TikTok cookies today. If we add other advertising partners, we will update this page and ask
> for your consent again.

**Changing your choice**
> Click « Cookie settings » at the bottom of any page. When you withdraw a consent, we delete the cookies and stored
> data that our site can delete and reload the page. Cookies set by Google or Microsoft on their own domains can only be
> deleted in your browser settings.

Legal points to decide (owner / lawyer): whether Cloudflare Web Analytics may stay outside consent in every target
country; whether the consent choice should expire (e.g. ask again after 12 months — needs a code change); whether
remarketing (ad personalisation) is wanted at launch — it can be switched off in Google Ads / the GTM Google tag
(`allow_ad_personalization_signals: false`) without a site deploy.

## 4. Proposed banner wording (English; to be translated into the 7 other languages)

Current texts (identical meaning in all 8 languages) name **Meta and TikTok**, which are not used, and describe
Marketing as « measurement » only, while Google Ads remarketing is active.

| Key | Current (en) | Proposed (en) |
|---|---|---|
| `text` | With your consent, we use cookies to measure our audience (Google Analytics, Microsoft Clarity) and our advertising campaigns (marketing). Nothing is set until you choose. You can change your choice at any time in « Cookie settings ». | With your consent, we use cookies to measure our audience (Google Analytics, Microsoft Clarity) and, for marketing, to measure our Google ads and show them to people who visited our site. Nothing is set until you choose. You can change your choice at any time in « Cookie settings ». |
| `necessaryText` | Remembers your cookie choice. Always on, no tracking. | Remembers your cookie choice and protects the site. Always on, no tracking. Anonymous cookie-less statistics (Cloudflare). |
| `analyticsText` | Audience measurement and site improvement (Google Analytics, Microsoft Clarity). | (unchanged) |
| `marketingText` | Measurement of our advertising campaigns (Google Ads, Meta, TikTok). | Measurement of our ads and showing our ads to past visitors (Google Ads). |

When Meta or TikTok tags are added in GTM (phase 2), `marketingText` and the policy must name them **before** the tags
are published, and `consentVersion` (src/config/analytics.ts) should be bumped so every visitor is asked again.
