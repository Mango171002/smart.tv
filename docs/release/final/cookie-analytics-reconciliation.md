# F14 — Cookie and analytics reconciliation (for owner / legal approval)

Status: **PROPOSAL, nothing published.** `src/content/legal.ts`, the banner dictionaries (`consent.*`) and the analytics
configuration (`src/config/analytics.ts`, GTM, Google Ads, GA4, Clarity, Cloudflare) are **unchanged**.
Prepared 24/11/2026 on the release candidate `7a6577f` (branch `claude/f14-cookies`). Builds on the Phase 13 audit
(`docs/release/phase13/d9-cookie-policy-draft.md`, `docs/release/phase13/security-report.md` D13-002 / D13-006 / D13-017)
without redoing it.

**Bottom line.** The consent *mechanism* is correct: no optional script, cookie or storage before a valid choice, nothing
after « Decline all », Consent Mode « denied » is the first dataLayer entry, withdrawal unloads everything.
**No Critical finding** (no optional tracking loads before consent in the site's code). The *texts* are wrong: the
policy says « No advertising cookie is used at the moment » while Google Ads (conversion linker + remarketing) runs after
Marketing consent; the banner names Meta and TikTok, which are not configured; Cloudflare Web Analytics (every visitor,
cookie-less, injected by Cloudflare) and Clarity's third-party cookies / session replays are not disclosed.
**Recommended option: switch Google Ads remarketing off in GTM / Google Ads (no deploy), then publish the corrected texts
(version A below) in one deploy.**

---

## 1. Measurements (24/11/2026)

### 1.1 Method — local production-like build of the RC

`rm -rf .next && npm run -s build && npx next start -p 3561 -H 127.0.0.1`; Chromium (Playwright), fresh context per
scenario; QA flag `sygma_analytics_force=1` (lets the banner and analytics run on 127.0.0.1 as on sygmatv.com).
**Every request to a host other than 127.0.0.1 was intercepted with `route` and ABORTED** and its URL recorded — so the
vendor libraries (gtag.js, gtm.js, Clarity) never ran, and **no event was sent to any analytics or advertising system**.
Pages: `/` and `/legal/cookies`; state read 4.5 s after each step (the deferred start has a 3 s idle timeout). Nothing was
accepted on https://sygmatv.com (only a read-only `curl` of the home HTML, see 1.3).

Because the libraries were aborted, the cookies they *would* write are taken from the Phase 13 measurement
(23/11/2026, RC `5c3635f`, same analytics code, same GTM container version 2 — see 1.4) and labelled as such.

### 1.2 Results — what the site sets and what would be requested

| Scenario | Cookies | localStorage | sessionStorage | Third-party requests (all aborted) | Consent Mode in dataLayer |
|---|---|---|---|---|---|
| (0) Host not allowed (no QA flag — any host except sygmatv.com) | none | none | none | **none** | `default` all denied; banner not shown |
| (a) Before any choice — `/` and `/legal/cookies` | none | `sygma_analytics_force` (QA flag only) | none | **none** | `default` all denied (1st entry), no update |
| (b) « Decline all », then reload | none | + `sygma_consent` = `{"v":2,"analytics":"denied","marketing":"denied","ts":…}` | none | **none** | `default` only |
| (c) Customize → Analytics only (and after reload) | none (vendors aborted) | `sygma_consent` analytics granted / marketing denied | none | `www.googletagmanager.com/gtag/js?id=G-258WWPPN8Y`, `www.clarity.ms/tag/ze1jvwh69q` — **no GTM, no ads host** | `default` → `update` analytics_storage granted, ad_* denied → `js` → `config G-258WWPPN8Y`; extra « no ads » CSP active; Clarity `consentv2` ad_Storage denied |
| (d) Customize → Marketing only (and after reload) | none (vendors aborted) | `sygma_consent` analytics denied / marketing granted | none | `www.googletagmanager.com/gtm.js?id=GTM-MGCLXP5L` only — **no GA4, no Clarity** | `default` → `update` ad_storage / ad_user_data / ad_personalization granted, analytics denied → `gtm.js` |
| (e) « Accept all » (and after reload) | none (vendors aborted) | `sygma_consent` both granted | none | gtag/js G-258WWPPN8Y, Clarity tag ze1jvwh69q, gtm.js GTM-MGCLXP5L — each **once** | `default` → `update` all granted → `js` → `config` → `gtm.js` |
| (f) Withdraw after (e): footer « Cookie settings » → « Decline all » | none | `sygma_consent` both denied | none | **none after the reload** (also after navigating to `/legal/cookies`) | `default` only |

What the vendor libraries write once they are allowed to run (Phase 13, local build, hits aborted):

| Consent | Cookies | Browser storage | Requests the libraries make |
|---|---|---|---|
| Analytics | `_ga`, `_ga_258WWPPN8Y` (400 d), `_clck` (365 d) on the site; `CLID` on `www.clarity.ms` (365 d) | `_cltk` (sessionStorage) | GA4 `*.google-analytics.com/g/collect`, `analytics.google.com`; Clarity `*.clarity.ms/collect`, `c.clarity.ms/c.gif`. The « no ads » CSP blocks the GA4→Ads link pings (`pagead2.googlesyndication.com/ccm/collect`). |
| Marketing | `_gcl_au` (90 d) on the site; `IDE` (400 d), `test_cookie` on `.doubleclick.net` | `_gcl_ls` (localStorage) | Google Ads: `googleads.g.doubleclick.net/pagead/viewthroughconversion/18577285546` (page-level remarketing hit), `www.google.com/rmkt/collect/…`, `www.google.com/pagead/1p-user-list/…`, `www.google.com/ccm/collect`, `ad.doubleclick.net/ccm/s/collect` |
| Withdrawal | first-party cookies **and** `_gcl_ls` / `_cltk` removed (fix D13-006); third-party `CLID`, `IDE` stay (another domain — only the browser can delete them) | | none after the reload |

Confirmed:
- **Optional tracking is blocked before valid consent** (a, 0) **and after « Decline all »** (b) and **after withdrawal** (f):
  zero third-party requests, zero cookies, only the consent record / QA flag in storage.
- **Consent Mode defaults (all four signals denied, `wait_for_update: 500`) are set before GTM / gtag load**: the inline
  `<script id="consent-default">` in `<head>` is always the first dataLayer entry; the visitor's `update` is pushed
  before `config` and before `gtm.js` (also asserted by `analytics-seo.spec.ts`, « Google Consent Mode default and CSP »).
- Analytics and Marketing are independent: Analytics never requests GTM or an advertising host; Marketing never requests
  GA4 or Clarity.

### 1.3 Live site (read-only)

`curl` of https://sygmatv.com/ with a browser `Accept`/`User-Agent` (no cookie jar, nothing executed): Cloudflare injects
`<script … src="https://static.cloudflareinsights.com/beacon.min.js/…" data-cf-beacon=…>` into the HTML. No `Set-Cookie`
header. This beacon is **not in the repository** (Cloudflare Web Analytics « automatic setup » on the zone) and is loaded
for **every visitor, before any choice** (Phase 13 browser measurement on live: the only request before a choice and after
« Decline all »). It sets no cookie and no storage.

### 1.4 What the GTM container would load (read-only download)

`curl https://www.googletagmanager.com/gtm.js?id=GTM-MGCLXP5L` (static script download, 24/11/2026) — **container
version 2**, unchanged since Phase 13:

| GTM tag (function) | ID / settings | Fires on | Consent required | Effect |
|---|---|---|---|---|
| Google tag (`__dest_aw`) | **AW-18577285546** | `gtm.init` = **every page** once GTM loads | ad_storage, ad_user_data, ad_personalization | Google Ads page-level hit: **remarketing audience** + conversion linker (`_gcl_au`, `_gcl_ls`) |
| Google Ads conversion (`__awct`) | conversion 18577285546 / label `dM1jCPDXjbkdEKrDq5pF`; value, currency, order ID = `event_id`; conversion linker on; enhanced conversions **off**; restricted data processing off | `sygma.generate_lead` with `lead_type = order` | ad_storage, ad_user_data | Order-request conversion. **Never fires today**: orders are closed (`FEATURE_CONTACT_FORM=false`), so no order lead event is pushed |
| `__rep` remote config, `__ccd_ads_first/last`, `__ogt_auto_events` (all automatic events **off**), `__ogt_1p_data_v2` (user-provided data **off**) | AW-18577285546 | `gtm.js` / internal | — | Google tag plumbing; no extra data |
| GA4, Microsoft Clarity, **Meta (fbq / connect.facebook.net)**, **TikTok (ttq / analytics.tiktok.com)**, Microsoft UET (bat.bing.com), LinkedIn, Hotjar, custom HTML | — | — | — | **Not present** (no occurrence in the container) |

For completeness, the GA4 Google tag `gtag/js?id=G-258WWPPN8Y` (loaded by the site itself after Analytics consent, also
downloaded read-only): GA4 destination with Google signals disallowed in all regions, data-transmission control « no
advertising », email auto-redaction on, a **linked Google Ads destination present but paused**, and GA4 enhanced
measurement **on** (scroll, outbound clicks, form interactions, file downloads, video, site search, browser-history page
changes). The site additionally sets `allow_google_signals: false` and `allow_ad_personalization_signals: false`.

So, today, **Marketing consent = Google Ads remarketing + conversion-linker cookies only**; there is no Meta or TikTok tag.

---

## 2. Inventory — every cookie, storage key and third-party integration actually present

« Set before consent » = observed before the visitor made any choice. Evidence: M = measured 24/11 (this run);
P13 = measured 23/11 (Phase 13, vendor libraries running, hits aborted); C = GTM / gtag container read 24/11; V = vendor
documentation only (not observable without letting hits through or without an ad click).

| Name | Provider | Type / domain | Purpose | Consent category | Duration | Set before consent | Where configured | Evidence |
|---|---|---|---|---|---|---|---|---|
| `sygma_consent` | SYGMA TV+ | localStorage, sygmatv.com | Stores the two choices (`analytics`, `marketing`), policy version `v: 2`, timestamp | Strictly necessary | No expiry; asked again when `consentVersion` changes | **No** (written on the click) | `src/config/analytics.ts` (`consentKey`, `consentVersion`), `src/lib/analytics.ts` `saveConsent` | M |
| `sygma_analytics_force` | SYGMA TV+ (team QA) | localStorage | Lets analytics run on a non-production host for QA | n/a (never set for visitors) | Until removed | n/a | `src/config/analytics.ts` `forceKey` | M (set by the test itself) |
| Cloudflare Web Analytics beacon | Cloudflare | script `static.cloudflareinsights.com`, data to `cloudflareinsights.com`; **no cookie, no storage** | Anonymous page-view and performance statistics | Treated as exempt (owner decision 14/11/2026) — **legal to confirm** | — | **Yes — request on every page, nothing stored** | Cloudflare dashboard (zone sygmatv.com, automatic setup); CSP in `next.config.ts` | live HTML (1.3) + P13 |
| `__cf_bm`, `cf_clearance` | Cloudflare | cookie, sygmatv.com | Bot protection / security challenge | Strictly necessary | 30 min / up to 1 year | Not observed (only if Cloudflare challenges the visitor) | Cloudflare dashboard | V |
| `_ga` | Google Analytics 4 | cookie, sygmatv.com | Distinguishes visitors for audience statistics | Analytics | 2 years (Chrome caps at 400 days) | No | `ANALYTICS.ga4MeasurementId` = G-258WWPPN8Y, `loadGa()` | P13 |
| `_ga_258WWPPN8Y` | Google Analytics 4 | cookie, sygmatv.com | Session state | Analytics | 2 years (400 days) | No | idem | P13 |
| `_clck` | Microsoft Clarity | cookie, sygmatv.com | Clarity visitor ID and preferences | Analytics | 1 year | No | `ANALYTICS.clarityProjectId` = ze1jvwh69q, `loadClarity()` | P13 |
| `_clsk` | Microsoft Clarity | cookie, sygmatv.com | Joins page views into one session recording | Analytics | 1 day | No | idem | V |
| `_cltk` | Microsoft Clarity | sessionStorage, sygmatv.com | Session tracking | Analytics | Until the tab is closed (removed on withdrawal) | No | idem | P13 |
| `CLID` | Microsoft Clarity | cookie, www.clarity.ms (third party) | First Clarity visit of the browser | Analytics | 1 year | No | idem | P13 |
| `MUID`, `ANONCHK`, `SM`, `MR` | Microsoft (Clarity / Bing) | cookies, clarity.ms / bing.com (third party) | Microsoft user ID and service cookies used by Clarity | Analytics | MUID ≈ 13 months, ANONCHK 10 min, SM session, MR 7 days | No | idem | V |
| Clarity session replays / heatmaps | Microsoft Clarity | data sent to `*.clarity.ms` | Records clicks, scrolling, page content (the order and request windows are masked: `data-clarity-mask`) | Analytics | Clarity retention (project settings) | No | Clarity project settings; `CheckoutDialog.tsx`, `RequestDialog.tsx` | code + P13 |
| `_gcl_au` | Google Ads (conversion linker, via GTM) | cookie, sygmatv.com | Links visits / requests to ad clicks | Marketing | 90 days | No | GTM-MGCLXP5L v2, Google tag AW-18577285546 | P13 + C |
| `_gcl_ls` | Google Ads (conversion linker) | localStorage, sygmatv.com | Same as `_gcl_au`, in browser storage | Marketing | Until deleted (removed on withdrawal) | No | idem | P13 |
| `_gcl_aw`, `_gcl_gb`, `_gcl_dc` | Google Ads | cookie, sygmatv.com | Ad-click identifier (only when arriving from a Google ad) | Marketing | 90 days | No | idem | V |
| `IDE` | Google (DoubleClick) | cookie, .doubleclick.net (third party) | Ad measurement **and remarketing** | Marketing | 13 months in Europe, up to 2 years elsewhere (400 days in Chrome) | No | idem | P13 |
| `test_cookie` | Google (DoubleClick) | cookie, .doubleclick.net | Checks that cookies work | Marketing | 15 min | No | idem | P13 |
| Google cookies on `google.com` (e.g. `NID`; `__Secure-3P…` if signed in) | Google | third party | Ad preferences, remarketing lists | Marketing | up to 2 years | No | idem | V |
| Google Ads remarketing audience | Google Ads AW-18577285546 | hits to `googleads.g.doubleclick.net/pagead/viewthroughconversion`, `google.com/rmkt/collect`, `google.com/pagead/1p-user-list` | Adds the browser to a « past visitors » list | Marketing | Google Ads list membership duration (account setting) | No | Google tag in GTM (every page), Google Ads audience settings | P13 + C |
| Google Ads order conversion | Google Ads | `__awct` tag | Counts order requests from ads | Marketing | — | No (never fires while orders are closed) | GTM trigger `sygma.generate_lead` + `lead_type = order` | C |
| `_fbp`, `_fbc` (Meta), `_ttp`, `tt_*`, `ttcsid` (TikTok), `_uet*` (Microsoft Ads) | — | — | **Not used** (no tag in GTM v2). The site already deletes them on withdrawal, and the CSP already allows Meta / TikTok hosts « so that phase 2 needs no deploy » | Marketing | — | No | `src/lib/analytics.ts` `MARKETING_COOKIES`, `next.config.ts` `ADS_SCRIPTS` / `ADS_HITS` | C |

---

## 3. Mismatches — policy vs banner vs actual behaviour

Severity: Critical (optional tracking before consent) · High · Medium · Low · Info.

| # | Sev. | Topic | Cookie policy (`legal.ts`) says | Banner (`consent.*`, 8 languages) says | Actual behaviour |
|---|---|---|---|---|---|
| M1 | **High** | Advertising cookies | « **No advertising cookie is used at the moment.** » Table lists only `sygma_consent`, `_ga`, `_clck/_clsk` | Marketing = « Measurement of our advertising campaigns (Google Ads, Meta, TikTok) » | After Marketing consent: Google Ads `_gcl_au`, `_gcl_ls`, `IDE`, `test_cookie` and Google cookies |
| M2 | **High** | Remarketing | Not mentioned | « measure … our advertising campaigns » — measurement only | Google tag AW-18577285546 fires on **every page** with `ad_personalization` granted → remarketing audience hits. The conversion tag itself never fires today (orders closed) |
| M3 | **High** (legal decision) | Cloudflare Web Analytics | Not mentioned | Strictly necessary = « Always on, no tracking. » | Beacon loaded for every visitor before any choice (edge-injected); no cookie, no storage. Not Critical under the brief's rule because it stores/reads nothing and was an explicit owner decision (14/11/2026); **if legal concludes it needs consent in a target market, it becomes Critical** — fix without deploy: Cloudflare dashboard › Web Analytics › sygmatv.com › disable automatic setup or choose the « excluding EU visitor data » mode where offered |
| M4 | Medium | Meta / TikTok | Not mentioned | Named as Marketing partners (all 8 languages) | Not configured anywhere (GTM v2). The CSP pre-allows their hosts, so a GTM publish could add them **without** a site deploy, i.e. without updated texts |
| M5 | Medium | Clarity scope | `_clck, _clsk` « Usage analysis » | « Audience measurement and site improvement » | Also `_cltk` (sessionStorage), third-party `CLID` / `MUID` on clarity.ms / bing.com, **session replays and heatmaps** |
| M6 | Medium | Privacy policy purposes | « To improve the site, only if you accepted analytics cookies » | — | No purpose for ad measurement / remarketing (Marketing) nor for Cloudflare statistics |
| M7 | Low | Storage vs cookie | Table header « Cookie »; `sygma_consent` listed as a cookie | « Nothing is set until you choose » | `sygma_consent` is **localStorage**; Google Ads / Clarity also use local/session storage. The banner sentence is **accurate** (measured) |
| M8 | Low | Withdrawal | « You can also delete cookies in your browser » | « change your choice at any time » | Site deletes its first-party cookies **and** the withdrawn tags' storage, then reloads; third-party `CLID`, `IDE`… stay (browser only). Worth saying |
| M9 | Low | Durations | `_ga` 2 years, `_clck/_clsk` 1 year / 1 day | — | Correct; Chrome caps at 400 days. Google Ads 90 days / 13 months missing |
| M10 | Info | GA4 settings | Not mentioned | — | Google signals off, ad personalisation off, GA4→Ads link paused + blocked by CSP without Marketing — a reassuring fact worth one sentence |
| M11 | Info | Consent lifetime | « Until you change it » | — | Choice never expires (no re-ask after 6–13 months as some regulators recommend). Owner/legal decision; needs a small code change |
| M12 | Info (analytics accuracy, not privacy) | GA4 page views | — | — | GA4 enhanced measurement « page changes based on browser history events » is on **and** the site sends its own `page_view` on in-site navigation (`trackPageView`). Check in GA4 DebugView once; if doubled, turn the history option off in GA4 (no deploy) |

Consistent (no change needed): « Nothing is set until you choose »; « If you decline, the site works the same »; « Cookie
settings » in the footer; Analytics and Marketing are separate choices; « Save my choices » never grants more than ticked.

---

## 4. Owner options (recommended first)

### Option 1 — RECOMMENDED: remarketing off now (no deploy), corrected texts version A (one deploy)

1. **GTM** (owner, live change without site deploy): container GTM-MGCLXP5L › Google tag `AW-18577285546` › Configuration
   settings › add parameter `allow_ad_personalization_signals` = `false` › Submit › Publish (becomes version 3).
   **Google Ads**: Tools › Audience manager / Data manager › Google tag › turn off audience (remarketing) data collection
   for the site, and do not run campaigns targeting a « website visitors » list. Keep the conversion action.
2. Verify read-only: `curl -s 'https://www.googletagmanager.com/gtm.js?id=GTM-MGCLXP5L' | grep -o '"version":"[0-9]*"'`
   shows a version > 2 and the parameter `allow_ad_personalization_signals`.
3. Publish the policy text **A** (§5) and banner texts **A** (§6) in the next deploy, after legal review. **No need to bump
   `consentVersion`**: the scope becomes narrower than what visitors already agreed to.
4. Optional hard guarantee (code, deploy, test): in `src/lib/analytics.ts` `googleConsentFor`, send
   `ad_personalization: 'denied'` whatever the choice (one line), and assert it in `tests/unit/consent-mapping.test.ts` and
   the « Customize → Marketing only » E2E. Then remarketing cannot be re-enabled by a GTM change alone.

Why: while orders are closed the conversion tag cannot fire, so remarketing is the only advertising data flow — and it is
the one neither the policy nor the banner discloses. Switching it off makes past consents consistent with what was said,
needs no deploy, and keeps conversion measurement (and the 90-day ad-click linker) ready for when orders open.

### Option 2 — keep remarketing: disclose it and ask everyone again

Publish policy text **B** and banner texts **B** (§5, §6); bump `consentVersion` from 2 to 3 in `src/config/analytics.ts`
(one line, deploy) so every visitor is asked again — consents given under « measurement » do not cover remarketing.
Until that deploy, remarketing runs on consents that were not informed of it (the M2 exposure continues).

### Option 3 — most conservative: no advertising until orders open

Pause the Google tag and the conversion tag in GTM (no deploy) or set `gtmEnabled: false` (deploy). Banner: keep the
Marketing choice with text A (nothing would load), or remove it in a later release. Loses the ad-click linker data for
campaigns run before the opening.

### Meta and TikTok (all options)

Remove them from the banner now (texts A/B below do). If they are ever added in GTM: first publish policy + banner texts
naming them, bump `consentVersion`, **then** publish the GTM tags. Because the CSP already allows their hosts, make it a
written rule for whoever edits GTM (or remove `connect.facebook.net`, `analytics.tiktok.com`, `*.tiktok.com`,
`www.facebook.com` from `next.config.ts` until then, so the browser refuses them even after a GTM change).

### Other decisions for legal

- Cloudflare Web Analytics outside consent (M3): keep (disclosed as in text A/B), or disable in the Cloudflare dashboard, or
  move it behind Analytics consent (code change: manual beacon in `startAnalytics`).
- Consent lifetime (M11): e.g. ask again after 12 months (code change, `readConsentState` + timestamp).

---

## 5. Proposed cookie policy text (English, ready to paste) — replaces `const COOKIES` in `src/content/legal.ts`

Version **A** (Option 1 / 3 — no remarketing). Also set the cookie policy's « Last updated » to the publication date
(`cookies: { updated: … }`; today it shares `UPDATED = '16 November 2026'`). Type-checked against `LegalSection`.

```ts
const COOKIES: LegalSection[] = [
  {
    id: 'principle',
    icon: 'cookie',
    title: 'Your choice',
    body: [
      { p: 'We use optional cookies and similar technologies (data kept in your browser) only if you accept them in the cookie banner, separately for « Analytics » and « Marketing ». If you decline, the site works the same.' },
      { p: 'Strictly necessary storage and our anonymous, cookie-free page statistics are always on.' },
    ],
  },
  {
    id: 'necessary',
    icon: 'shield',
    title: 'Always on',
    body: [
      { table: {
        head: ['Name', 'Provider', 'Purpose', 'Duration'],
        rows: [
          ['sygma_consent (browser storage)', 'SYGMA TV+', 'Remembers your cookie choices and when you made them', 'Until you change them'],
          ['No cookie', 'Cloudflare Web Analytics', 'Anonymous statistics on pages viewed and loading speed. Nothing is stored on your device', '—'],
          ['__cf_bm, cf_clearance', 'Cloudflare', 'Protects the site against bots, only if a security check is shown', '30 minutes / up to 1 year'],
        ],
      } },
    ],
  },
  {
    id: 'analytics',
    icon: 'activity',
    title: 'Analytics (only with your consent)',
    body: [
      { table: {
        head: ['Name', 'Provider', 'Purpose', 'Duration'],
        rows: [
          ['_ga, _ga_*', 'Google Analytics', 'Counts visits and shows how the site is used', '2 years'],
          ['_clck, _clsk, _cltk (browser storage)', 'Microsoft Clarity', 'Shows how pages are used (clicks, scrolling, session replays) so we can improve them', '1 year / 1 day / until you close the tab'],
          ['CLID, MUID and other Microsoft cookies (on clarity.ms and bing.com)', 'Microsoft', 'Recognises your browser for Microsoft Clarity', 'Up to 13 months'],
        ],
      } },
      { p: 'Google Analytics runs with Google signals and ad personalisation turned off. Our order and request windows are hidden from Clarity recordings.' },
    ],
  },
  {
    id: 'marketing',
    icon: 'tag',
    title: 'Marketing (only with your consent)',
    body: [
      { table: {
        head: ['Name', 'Provider', 'Purpose', 'Duration'],
        rows: [
          ['_gcl_au, _gcl_aw, _gcl_ls (browser storage)', 'Google Ads', 'Links your visit to the Google ad you clicked, so we know which ads lead to visits and requests', '90 days (browser storage: until you withdraw consent)'],
          ['IDE, test_cookie (on doubleclick.net) and other Google cookies', 'Google', 'Measures the results of our Google ads', '13 months in Europe, up to 2 years elsewhere'],
        ],
      } },
      { p: 'We do not use these cookies to show you personalised ads. We do not use Meta (Facebook, Instagram) or TikTok advertising cookies. If we add an advertising partner or a new purpose, we will update this page and ask for your consent again.' },
    ],
  },
  {
    id: 'control',
    icon: 'pencil',
    title: 'Changing your choice',
    body: [
      { p: 'Click « Cookie settings » at the bottom of any page. When you withdraw a consent, we delete the cookies and browser storage that our site can delete and reload the page.' },
      { p: 'Cookies that Google or Microsoft set on their own domains (for example IDE or CLID) can only be deleted in your browser settings.' },
    ],
  },
];
```

Version **B** (Option 2 — remarketing kept) = version A with these two replacements in the `marketing` section:

- second row, purpose: `'Measures the results of our Google ads and shows our ads to people who visited our site (remarketing)'`
- paragraph: `'With your consent, Google may add your browser to a list of visitors of our site so that our ads can be shown to you on other websites (remarketing). We do not use Meta (Facebook, Instagram) or TikTok advertising cookies. If we add an advertising partner or a new purpose, we will update this page and ask for your consent again.'`

Privacy policy (`PRIVACY`, section `purposes`) — proposed list item to add after « To improve the site, … » (both versions):
`'To measure our advertising, only if you accepted marketing cookies; and anonymous, cookie-free page statistics (Cloudflare).'`

---

## 6. Proposed banner wording — `consent.*`, all 8 languages

**All non-English texts: AI draft, native + legal review pending.** Unchanged keys are repeated so each block is complete.
Changed keys: `text`, `necessaryText`, `analyticsText`, `marketingText` (titles and buttons unchanged — they are already
accurate and short). Version A = Option 1 / 3; version B = Option 2 (only `text` and `marketingText` differ). Tone kept:
de « Sie », fr « vous », es/it/nl/sv/nb informal « tú / tu / je / du » as today; each language keeps its own quote marks.

### en — English (source text; legal review pending)

| Key | Version A (recommended) | Version B (remarketing) |
|---|---|---|
| title | Cookies & privacy | = A |
| text | With your consent, we use cookies to measure our audience (Google Analytics, Microsoft Clarity) and the results of our Google ads (marketing). Nothing is set until you choose. You can change your choice at any time in « Cookie settings ». | With your consent, we use cookies to measure our audience (Google Analytics, Microsoft Clarity) and, for marketing, to measure our Google ads and show them to people who have visited our site. Nothing is set until you choose. You can change your choice at any time in « Cookie settings ». |
| policy | Cookie policy | = A |
| acceptAll / declineAll / customize / save | Accept all / Decline all / Customize / Save my choices | = A |
| necessaryTitle | Strictly necessary | = A |
| necessaryText | Remembers your cookie choice and protects the site. Always on. Also always on: anonymous page statistics without cookies (Cloudflare). | = A |
| analyticsTitle | Analytics | = A |
| analyticsText | Audience measurement and how pages are used (clicks, scrolling, session replays), to improve the site (Google Analytics, Microsoft Clarity). | = A |
| marketingTitle | Marketing | = A |
| marketingText | Measures which of our Google ads lead to visits and requests (Google Ads). | Measures our Google ads and shows our ads to people who have visited our site (Google Ads remarketing). |
| settings | Cookie settings | = A |

### fr — Français (AI draft, native + legal review pending)

| Key | Version A (recommended) | Version B (remarketing) |
|---|---|---|
| title | Cookies et confidentialité | = A |
| text | Avec votre accord, nous utilisons des cookies pour mesurer notre audience (Google Analytics, Microsoft Clarity) et les résultats de nos annonces Google (marketing). Rien n’est déposé avant votre choix. Vous pouvez le modifier à tout moment dans « Paramètres des cookies ». | Avec votre accord, nous utilisons des cookies pour mesurer notre audience (Google Analytics, Microsoft Clarity) et, côté marketing, pour mesurer nos annonces Google et les présenter aux personnes qui ont déjà visité notre site. Rien n’est déposé avant votre choix. Vous pouvez le modifier à tout moment dans « Paramètres des cookies ». |
| policy | Politique de cookies | = A |
| acceptAll / declineAll / customize / save | Tout accepter / Tout refuser / Personnaliser / Enregistrer mes choix | = A |
| necessaryTitle | Strictement nécessaires | = A |
| necessaryText | Mémorise votre choix concernant les cookies et protège le site. Toujours actif. Également toujours actives : des statistiques de pages anonymes, sans cookies (Cloudflare). | = A |
| analyticsTitle | Mesure d’audience | = A |
| analyticsText | Mesure d’audience et utilisation des pages (clics, défilement, enregistrements de sessions) pour améliorer le site (Google Analytics, Microsoft Clarity). | = A |
| marketingTitle | Marketing | = A |
| marketingText | Mesure des visites et des demandes générées par nos annonces Google (Google Ads). | Mesure de nos annonces Google et affichage de nos annonces aux personnes ayant visité notre site (remarketing Google Ads). |
| settings | Paramètres des cookies | = A |

### de — Deutsch (AI draft, native + legal review pending)

| Key | Version A (recommended) | Version B (remarketing) |
|---|---|---|
| title | Cookies & Datenschutz | = A |
| text | Mit Ihrer Einwilligung verwenden wir Cookies, um unsere Reichweite (Google Analytics, Microsoft Clarity) und die Ergebnisse unserer Google-Anzeigen (Marketing) zu messen. Vor Ihrer Auswahl wird nichts gesetzt. Sie können Ihre Auswahl jederzeit unter „Cookie-Einstellungen“ ändern. | Mit Ihrer Einwilligung verwenden wir Cookies, um unsere Reichweite zu messen (Google Analytics, Microsoft Clarity) und – für Marketing – unsere Google-Anzeigen zu messen und sie Personen zu zeigen, die unsere Website besucht haben. Vor Ihrer Auswahl wird nichts gesetzt. Sie können Ihre Auswahl jederzeit unter „Cookie-Einstellungen“ ändern. |
| policy | Cookie-Richtlinie | = A |
| acceptAll / declineAll / customize / save | Alle akzeptieren / Alle ablehnen / Anpassen / Auswahl speichern | = A |
| necessaryTitle | Unbedingt erforderlich | = A |
| necessaryText | Speichert Ihre Cookie-Auswahl und schützt die Website. Immer aktiv. Ebenfalls immer aktiv: anonyme Seitenstatistik ohne Cookies (Cloudflare). | = A |
| analyticsTitle | Analyse | = A |
| analyticsText | Reichweitenmessung und Nutzung der Seiten (Klicks, Scrollen, Sitzungsaufzeichnungen), um die Website zu verbessern (Google Analytics, Microsoft Clarity). | = A |
| marketingTitle | Marketing | = A |
| marketingText | Misst, welche unserer Google-Anzeigen zu Besuchen und Anfragen führen (Google Ads). | Misst unsere Google-Anzeigen und zeigt unsere Anzeigen Personen, die unsere Website besucht haben (Google Ads Remarketing). |
| settings | Cookie-Einstellungen | = A |

### es — Español (AI draft, native + legal review pending)

| Key | Version A (recommended) | Version B (remarketing) |
|---|---|---|
| title | Cookies y privacidad | = A |
| text | Con tu consentimiento, usamos cookies para medir nuestra audiencia (Google Analytics, Microsoft Clarity) y los resultados de nuestros anuncios de Google (marketing). No se instala nada hasta que elijas. Puedes cambiar tu elección en cualquier momento en «Configuración de cookies». | Con tu consentimiento, usamos cookies para medir nuestra audiencia (Google Analytics, Microsoft Clarity) y, para marketing, para medir nuestros anuncios de Google y mostrarlos a quienes han visitado nuestra web. No se instala nada hasta que elijas. Puedes cambiar tu elección en cualquier momento en «Configuración de cookies». |
| policy | Política de cookies | = A |
| acceptAll / declineAll / customize / save | Aceptar todas / Rechazar todas / Personalizar / Guardar mis preferencias | = A |
| necessaryTitle | Estrictamente necesarias | = A |
| necessaryText | Recuerdan tu elección sobre las cookies y protegen la web. Siempre activas. También siempre activas: estadísticas anónimas de páginas sin cookies (Cloudflare). | = A |
| analyticsTitle | Analítica | = A |
| analyticsText | Medición de audiencia y uso de las páginas (clics, desplazamiento, grabaciones de sesiones) para mejorar la web (Google Analytics, Microsoft Clarity). | = A |
| marketingTitle | Marketing | = A |
| marketingText | Medición de las visitas y solicitudes que generan nuestros anuncios de Google (Google Ads). | Medición de nuestros anuncios de Google y visualización de nuestros anuncios a quienes han visitado nuestra web (remarketing de Google Ads). |
| settings | Configuración de cookies | = A |

### it — Italiano (AI draft, native + legal review pending)

| Key | Version A (recommended) | Version B (remarketing) |
|---|---|---|
| title | Cookie e privacy | = A |
| text | Con il tuo consenso usiamo i cookie per misurare il nostro pubblico (Google Analytics, Microsoft Clarity) e i risultati dei nostri annunci Google (marketing). Nulla viene installato finché non scegli. Puoi modificare la tua scelta in qualsiasi momento da «Impostazioni cookie». | Con il tuo consenso usiamo i cookie per misurare il nostro pubblico (Google Analytics, Microsoft Clarity) e, per il marketing, per misurare i nostri annunci Google e mostrarli a chi ha visitato il nostro sito. Nulla viene installato finché non scegli. Puoi modificare la tua scelta in qualsiasi momento da «Impostazioni cookie». |
| policy | Informativa sui cookie | = A |
| acceptAll / declineAll / customize / save | Accetta tutti / Rifiuta tutti / Personalizza / Salva le mie scelte | = A |
| necessaryTitle | Strettamente necessari | = A |
| necessaryText | Memorizzano la tua scelta sui cookie e proteggono il sito. Sempre attivi. Sempre attive anche le statistiche anonime delle pagine, senza cookie (Cloudflare). | = A |
| analyticsTitle | Statistiche | = A |
| analyticsText | Misurazione del pubblico e uso delle pagine (clic, scorrimento, registrazioni delle sessioni) per migliorare il sito (Google Analytics, Microsoft Clarity). | = A |
| marketingTitle | Marketing | = A |
| marketingText | Misurazione delle visite e delle richieste generate dai nostri annunci Google (Google Ads). | Misurazione dei nostri annunci Google e visualizzazione dei nostri annunci a chi ha visitato il nostro sito (remarketing Google Ads). |
| settings | Impostazioni cookie | = A |

### nl — Nederlands (AI draft, native + legal review pending)

| Key | Version A (recommended) | Version B (remarketing) |
|---|---|---|
| title | Cookies en privacy | = A |
| text | Met je toestemming gebruiken we cookies om ons bereik te meten (Google Analytics, Microsoft Clarity) en de resultaten van onze Google-advertenties (marketing). Er wordt niets geplaatst voordat je een keuze maakt. Je kunt je keuze altijd wijzigen via ‘Cookie-instellingen’. | Met je toestemming gebruiken we cookies om ons bereik te meten (Google Analytics, Microsoft Clarity) en, voor marketing, om onze Google-advertenties te meten en ze te tonen aan mensen die onze website hebben bezocht. Er wordt niets geplaatst voordat je een keuze maakt. Je kunt je keuze altijd wijzigen via ‘Cookie-instellingen’. |
| policy | Cookiebeleid | = A |
| acceptAll / declineAll / customize / save | Alles accepteren / Alles weigeren / Aanpassen / Mijn keuzes opslaan | = A |
| necessaryTitle | Strikt noodzakelijk | = A |
| necessaryText | Onthoudt je cookiekeuze en beschermt de website. Altijd actief. Ook altijd actief: anonieme paginastatistieken zonder cookies (Cloudflare). | = A |
| analyticsTitle | Statistieken | = A |
| analyticsText | Bereikmeting en gebruik van de pagina’s (klikken, scrollen, sessie-opnames) om de website te verbeteren (Google Analytics, Microsoft Clarity). | = A |
| marketingTitle | Marketing | = A |
| marketingText | Meting van de bezoeken en aanvragen die onze Google-advertenties opleveren (Google Ads). | Meting van onze Google-advertenties en het tonen van onze advertenties aan mensen die onze website hebben bezocht (Google Ads-remarketing). |
| settings | Cookie-instellingen | = A |

### sv — Svenska (AI draft, native + legal review pending)

| Key | Version A (recommended) | Version B (remarketing) |
|---|---|---|
| title | Cookies och integritet | = A |
| text | Med ditt samtycke använder vi cookies för att mäta vår publik (Google Analytics, Microsoft Clarity) och resultaten av våra Google-annonser (marknadsföring). Inget sätts förrän du har gjort ditt val. Du kan när som helst ändra ditt val under ”Cookieinställningar”. | Med ditt samtycke använder vi cookies för att mäta vår publik (Google Analytics, Microsoft Clarity) och, för marknadsföring, för att mäta våra Google-annonser och visa dem för personer som har besökt vår webbplats. Inget sätts förrän du har gjort ditt val. Du kan när som helst ändra ditt val under ”Cookieinställningar”. |
| policy | Cookiepolicy | = A |
| acceptAll / declineAll / customize / save | Godkänn alla / Avvisa alla / Anpassa / Spara mina val | = A |
| necessaryTitle | Strikt nödvändiga | = A |
| necessaryText | Kommer ihåg ditt cookieval och skyddar webbplatsen. Alltid på. Också alltid på: anonym sidstatistik utan cookies (Cloudflare). | = A |
| analyticsTitle | Statistik | = A |
| analyticsText | Publikmätning och hur sidorna används (klick, scrollning, sessionsinspelningar) för att förbättra webbplatsen (Google Analytics, Microsoft Clarity). | = A |
| marketingTitle | Marknadsföring | = A |
| marketingText | Mätning av besök och förfrågningar som våra Google-annonser leder till (Google Ads). | Mätning av våra Google-annonser och visning av våra annonser för personer som har besökt vår webbplats (Google Ads-remarketing). |
| settings | Cookieinställningar | = A |

### nb — Norsk bokmål (AI draft, native + legal review pending)

| Key | Version A (recommended) | Version B (remarketing) |
|---|---|---|
| title | Informasjonskapsler og personvern | = A |
| text | Med ditt samtykke bruker vi informasjonskapsler (cookies) til å måle trafikken på nettstedet (Google Analytics, Microsoft Clarity) og resultatene av Google-annonsene våre (markedsføring). Ingenting lagres før du har valgt. Du kan når som helst endre valget ditt under «Cookie-innstillinger». | Med ditt samtykke bruker vi informasjonskapsler (cookies) til å måle trafikken på nettstedet (Google Analytics, Microsoft Clarity) og, for markedsføring, til å måle Google-annonsene våre og vise dem til personer som har besøkt nettstedet. Ingenting lagres før du har valgt. Du kan når som helst endre valget ditt under «Cookie-innstillinger». |
| policy | Retningslinjer for cookies | = A |
| acceptAll / declineAll / customize / save | Godta alle / Avvis alle / Tilpass / Lagre valgene mine | = A |
| necessaryTitle | Strengt nødvendige | = A |
| necessaryText | Husker valget ditt om informasjonskapsler og beskytter nettstedet. Alltid på. Også alltid på: anonym sidestatistikk uten informasjonskapsler (Cloudflare). | = A |
| analyticsTitle | Analyse | = A |
| analyticsText | Trafikkmåling og hvordan sidene brukes (klikk, rulling, øktopptak) for å forbedre nettstedet (Google Analytics, Microsoft Clarity). | = A |
| marketingTitle | Markedsføring | = A |
| marketingText | Måling av besøk og forespørsler som Google-annonsene våre gir (Google Ads). | Måling av Google-annonsene våre og visning av annonsene våre for personer som har besøkt nettstedet (Google Ads-remarketing). |
| settings | Cookie-innstillinger | = A |

Implementation notes for whoever applies the approved texts: the strings go into `src/i18n/dictionaries/<lang>.ts`
(`consent`), keys unchanged, so `tests/unit/translations.test.ts` (same keys in every language) still applies; the
Customize view shows `analyticsText` / `marketingText` under each checkbox — check the banner on a 320 px phone after the
change (`tests/e2e/analytics-seo.spec.ts` « the banner never covers the order window » and the axe checks).

---

## 7. Technical guarantees and test evidence

| Guarantee | Evidence (spec › test) |
|---|---|
| Before any choice: no third-party request at all (any host, Google, Microsoft, Meta, TikTok, Cloudflare…), no cookie, no storage except the QA flag, on `/` and `/legal/cookies`; Consent Mode default « denied » is dataLayer[0] | **new** `tests/e2e/consent-no-tracking.spec.ts` › « before any choice … » (every non-site request aborted and recorded) |
| On any host other than sygmatv.com (no QA flag): no banner, no request | **new** › « without the QA flag … » |
| « Decline all »: zero third-party requests now, after a reload and after a navigation; only `sygma_consent` stored | **new** › « Decline all … »; `analytics-seo.spec.ts` › « nothing loads before a choice; Decline all keeps everything off » |
| Analytics only: only gtag/js + Clarity requested; never GTM / DoubleClick / Ads / Meta / TikTok; « no ads » CSP active; ad signals denied | **new** › « Analytics only … »; `analytics-seo` › « Customize → Analytics only: GA4 + Clarity, no GTM, ads consent denied »; `tests/unit/consent-mapping.test.ts` |
| Marketing only: only GTM; never GA4 / Clarity | **new** › « Marketing only … »; `analytics-seo` › « Customize → Marketing only … » |
| Accept all: each script once; one page view per path | `analytics-seo` › « Accept all loads GA4, Clarity and GTM once … » |
| Consent Mode: default first, update before `config` and before `gtm.js` | `analytics-seo` › « Google Consent Mode default and CSP » (default « denied » is the very first dataLayer entry …; the update reaches Google before the first tag request) |
| Withdrawal: scripts unloaded (reload), first-party cookies removed, `_gcl_ls` / `_cltk` removed, zero third-party requests afterwards | **new** › « withdrawal after Accept all … »; `analytics-seo` › « withdrawing consent unloads analytics and removes its cookies », « withdrawing Marketing only … »; `consent-storage.spec.ts` (2 tests) |
| Old consent (v1) is asked again | `analytics-seo` › « a choice made under the previous policy … » |
| No personal data in events | `analytics-seo` › « plan view, plan selection, checkout and lead — without personal data » (skipped while orders are closed); `src/lib/analytics.ts` `adPayload` allow-list |

Gap closed by this work: the existing specs stub only the Google / Microsoft hosts (and fulfil them with empty scripts), so a
request to any other host (Meta, TikTok, Cloudflare, a new vendor) would not have been caught. The new spec aborts and
records **every** non-site request and asserts the exact set per scenario.

Not covered by automated tests (cannot be, locally): the Cloudflare edge-injected beacon (live only), what the GTM / Google
Ads / GA4 / Clarity consoles are configured to do server-side (checked by reading the public container files, §1.4).

### Validation run (24/11/2026, RC `7a6577f` + this commit)

- `npx tsc --noEmit`: pass · `npx eslint .`: pass · `npx vitest run`: 34 files, 679 tests passed.
- Production-like build (`rm -rf .next && npm run -s build`), E2E on port 3561, `--workers=2 --trace off`, desktop + mobile,
  Chromium additionally started with DNS disabled for every host except 127.0.0.1 (belt and braces: nothing un-intercepted
  can leave the machine): `consent-no-tracking.spec.ts` + `consent-storage.spec.ts` + `analytics-seo.spec.ts` —
  **76 passed, 4 skipped** (the order-flow tests, skipped while orders are closed), 0 failed.
- Read-only downloads: `gtm.js?id=GTM-MGCLXP5L` (container v2) and `gtag/js?id=G-258WWPPN8Y`; `curl` of the live home HTML.
  No event, hit or pixel was sent; nothing was accepted on sygmatv.com.
