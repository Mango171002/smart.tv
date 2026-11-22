# Phase 7C — French release readiness (22 November 2026)

Branch `claude/seo-phase7c-french-release`, from Phase 7B `e5ac628`. Production reference `864f703`.
`350882a` never included. Nothing merged, deployed or published. **French stays unpublished**: the release flag is
off and absent from every production configuration.

## 1. What changed

| Area | Change |
|---|---|
| Release flag | `NEXT_PUBLIC_RELEASED_LANGUAGES` (build time, default empty). `fr` listed → French promoted from « preview » to « enabled »: built in production, indexable, sitemap + hreflang. Only a « preview » language (complete dictionary) can be released. Not set in `.env.production`, `wrangler.jsonc`, `open-next.config.ts`, `next.config.ts` or any workflow (unit test). |
| hreflang / sitemap | Legal pages declared English-only (`PAGE_AVAILABILITY`): never an alternate pointing to `/fr/legal/*` (a redirect). Released: reciprocal `en` / `fr` / `x-default` on translated pages, same set in the sitemap. |
| USD display | One French format everywhere: « 59 $ US », « 4,92 $ US / mois », order window « 69 $ US », taxes « 0,00 $ US », FAQ « 59 $ US ». English unchanged (`$59`, `$69 USD`). New display helper `src/lib/money-display.ts`; `src/lib/pricing.ts` (amounts and rules) untouched. |
| Security / privacy wording (French) | Unsupported phrases removed: « Sécurisé et confidentiel » (×3), « Données protégées », « Votre vie privée compte », « enregistrée de façon sécurisée », « Sûr et privé ». Replaced by the documented fact « Données jamais vendues » (privacy policy and FAQ: « We never sell your data »), or « Essai gratuit » in the narrow footer chip. |
| French 404 | Unknown `/fr/…` URLs (preview or released) → HTTP 404, French page (« Cette page n’existe pas. », title « Page introuvable », link to `/fr`) inside the French layout, `noindex`. English 404 pages unchanged. |
| Consistency | Every French text carries the same figures as its English source (automated test); one deviation fixed (Troubleshooting description said « 4G/5G », English says « mobile data »). |

## 2. Consistency audit (French vs current English, legal documents excluded)

Automated (`tests/unit/french.test.ts`, `french-consistency.test.ts`, `release-flag.test.ts`): same structure, keys,
placeholders, icons, links and figures; titles ≤ 60 and descriptions ≤ 155; activation before payment; refund facts;
« selon disponibilité » qualifiers; no claim beyond the English.

Manual review — intentional differences from the English, all more conservative or required by the layout:

| # | English | French | Reason |
|---|---|---|---|
| 1 | « Secure & private », « Data Protected », « Your privacy matters », « stored securely » | « Données jamais vendues », « Essai gratuit » (footer chip), « Votre demande est enregistrée… » | No evidence for security claims; the French uses the documented fact. **The English still shows these phrases — owner decision proposed below.** |
| 2 | Legal links | « (en anglais) » added; footer note « Documents juridiques disponibles en anglais. » | Legal pages are not translated |
| 3 | « the website itself is in English » | « nos documents juridiques sont rédigés en anglais » | The site now exists in French |
| 4 | « No automatic renewal », « Live TV & on demand », « Great value for most homes », « Feature », « Multi-device » | « Sans reconduction », « TV en direct et VOD », « Idéale pour la plupart des foyers », « Fonction », « Multi-écrans » | One-line limits in plan cards, table and footer (fallback fonts) |
| 5 | `$59`, `$69 USD` | « 59 $ US », « 69 $ US » | French convention, currency explicit (not the Canadian dollar) |

No difference in facts: plans and prices (59 / 69 / 99 USD per year, −20 % over 24 months, −30 % over 36 months),
1 device included and up to 4, free trial 24 h, 7-day money-back from activation, 14-day withdrawal EU/UK, no
automatic renewal, support 24/7 in six languages, six payment methods, activation before payment, nothing charged on
the website, company details.

**Proposal for the owner (not done — English production text):** align the English trust phrases the same way
(« Secure & private » → « We never sell your data »; « stored securely » → « stored »), in a separate English lot.

## 3. Verification

| Check | Result |
|---|---|
| TypeScript, ESLint | 0 errors |
| Unit tests | 180 / 180 |
| E2E — production build (CI configuration) | see section 5 |
| E2E — content pages preview | see section 5 |
| E2E — French preview | see section 5 |
| E2E — French released (flag on) | see section 5 |
| English output vs Phase 7B | 232 URLs identical in the three content-page modes; CSS byte-identical |
| French released: canonical | Self-referencing on every French page |
| French released: hreflang | `/` ↔ `/fr`, `/about` ↔ `/fr/about`, `/help` ↔ `/fr/help`, `/help/<topic>` ↔ `/fr/help/<topic>`: `en`, `fr`, `x-default` (→ English), identical on both sides; none on legal pages and on noindex pages |
| French released: sitemap | Each translated page listed in both languages with the same `xhtml:link` set; no `/fr/legal`, no blog |
| French released: robots | Indexable French pages `index, follow`; no `X-Robots-Tag` |
| Production configuration | `/fr` and `/fr/*` → 308 to the English page; no French URL, link or alternate |

## 4. Release procedure (only after written authorisation)

1. Native review sign-off of the French texts (list in `lot-7b-french.md`, section 5; items 4 and 8 — footer chips and price format — are settled by this lot).
2. Deploy the English lots first if wanted (5C/6A/6B), then release French in a separate deployment.
3. Set `NEXT_PUBLIC_RELEASED_LANGUAGES=fr` for the production build (repository variable or `.env.production`), with
   the content pages `live` if About/Help should be published in both languages.
4. Build, run the full test suite with `E2E_RELEASED=fr`, deploy.
5. After deployment: check `/fr`, `/fr/help`, `/fr/about` (200, `index, follow`, hreflang), `/fr/legal/privacy` (308),
   `/fr/nope` (404), `sitemap.xml` (French entries with alternates); Search Console: submit the sitemap, inspect
   `/fr`, open a report for the `/fr/` folder; Bing: same.
6. Rollback: remove the variable and redeploy — `/fr/*` redirects to English again (308).

## 5. Deployment-readiness checklist

| # | Item | Status |
|---|---|---|
| 1 | French dictionary complete (100 % of English keys) | Done |
| 2 | French About + Help center (7 topics) | Done |
| 3 | Prices displayed in one explicit USD format | Done |
| 4 | No unsupported security / privacy claim in French | Done |
| 5 | Figures and facts identical to English (automated) | Done |
| 6 | French 404 (HTTP 404, French text) | Done — body completed in the browser (see 7) |
| 7 | hreflang reciprocity and sitemap alternates (released) | Done, tested |
| 8 | Legal pages: English only, no alternate, `/fr/legal/*` → 308 | Done |
| 9 | Release flag off in production configuration | Done, tested |
| 10 | English output unchanged | Done, 232 URLs identical, CSS identical |
| 11 | Native review of French wording | **Owner — pending** |
| 12 | Decision on English trust phrases (section 2) | **Owner — pending** |
| 13 | Distribution rights for France, Canada, Switzerland, Luxembourg | **Owner — pending** |
| 14 | Legal pages in French (optional) | **Owner / legal — pending** |
| 15 | French transactional emails (optional, separate authorised lot) | Not started (emails not to be modified) |
| 16 | Written authorisation to set the release flag and deploy | **Owner — pending** |

## 6. Files

New: `src/lib/money-display.ts`, `src/app/[locale]/page-not-found/page.tsx`, `src/app/[locale]/page-not-found/not-found.tsx`,
`tests/unit/release-flag.test.ts`, `tests/unit/french-consistency.test.ts`, this document.

Changed: `src/i18n/locales.ts` (release flag), `src/lib/seo.ts` (legal pages English-only), `next.config.ts` (fallback
rewrite for unknown French URLs), `src/i18n/dictionaries/fr.ts`, `src/content/fr/info.ts`, `src/app/[locale]/page.tsx`,
`src/components/PlanConfigurator.tsx`, `src/components/CheckoutDialog.tsx` (display helper), `src/components/Footer.tsx`
(chip icon), `tests/e2e/french.spec.ts`, `tests/e2e/site.spec.ts`, `tests/e2e/responsive.spec.ts`.

Not changed: legal documents, pricing logic and amounts, orders, checkout, payments, emails, WhatsApp, Telegram,
database, CSS, English texts.

## 7. Known limitation

French 404 page: with Next.js 16 and the experimental global 404 used by the English site, the server answers HTTP 404
with a minimal document and the browser completes the French page (title, text, layout). Search engines rely on the
404 status, which is correct. Without JavaScript the page body is empty. A server-rendered French 404 would need either
a request proxy (middleware) or dropping the experimental global 404 — both affect the English site and are left for a
later, separate decision.
