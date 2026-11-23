# Phase 13 — safe fixes for the integration lead

**What this is.** A short list of clear, non-contractual grammar, typography and consistency errors that the AI review
(Phase 13 agent B) is confident about. Each one changes form only: no meaning, figure, price, placeholder, claim, legal
or consent wording. They are **not** native-validated: the rows stay « pending native review » in the language files
(flag `SAFE-FIX SF-nn`), and a native reviewer may still prefer other wording.

**When to apply.** After the claims rewrite (sports « International » labels, device brand names, « 24/7 support in 6
languages », WhatsApp mentions) has landed, because it edits the same files. None of the strings below is part of that
rewrite: every string that mentions WhatsApp or « 6 languages » was left out on purpose. Line numbers are those of
`5c3635f`; re-locate by the exact text if the rewrite moved lines.

**Checks after applying.** `npx vitest run tests/unit/translations.test.ts tests/unit/copy-polish.test.ts
tests/unit/prelaunch-copy.test.ts tests/unit/support-wording.test.ts tests/unit/info-pages.test.ts`, and for SF-03 /
SF-06 (footer chips) `tests/e2e/responsive.spec.ts` in the preview build (chips must stay inside their column at the
8 tested widths). All proposed strings fit the existing limits (footer chips ≤ 16; Help descriptions 70–155 unchanged in
length).

In the « Current » and « Proposed » columns the text is exact; `—` is U+2014 (em dash) and `–` is U+2013 (en dash).

## English source: « email », not « e-mail »

The English site writes « email » everywhere else (`tests/unit/copy-polish.test.ts` enforces it outside the prelaunch
block, which was owned by another agent in Phase 12).

| ID | File:line | Key | Current | Proposed |
|---|---|---|---|---|
| SF-01 | `src/i18n/dictionaries/en.ts:392` | `prelaunch.contactNote` | « Orders and free trials cannot be arranged by e-mail or any other channel yet. » | « Orders and free trials cannot be arranged by email or any other channel yet. » |
| SF-02 | `src/content/en/info.ts:256` | Help › Free trial › prelaunch `sections.request.body[0].p` | « Free trial requests are opening soon. Until then, a trial cannot be arranged by e-mail or in any other way. » | « Free trial requests are opening soon. Until then, a trial cannot be arranged by email or in any other way. » |

Not included: `prelaunch.pagesText` (`en.ts:403`, same « e-mail ») because it mentions WhatsApp: fix it in the claims
rewrite.

## Footer chips: use the site term now that the limit is 16

Phase 10 kept clipped forms only because the old chip limit was 13 characters. Phase 12 raised it to 16
(`tests/unit/translations.test.ts:156`), so the site's own free-trial term now fits.

| ID | File:line | Key | Current | Proposed | Length |
|---|---|---|---|---|---|
| SF-03 | `src/i18n/dictionaries/it.ts:594` | `footer.chips[1]` | « Prova gratis » | « Prova gratuita » (as `nav.trial`, `benefits[3].title`) | 14 / 16 |
| SF-06 | `src/i18n/dictionaries/nl.ts:593` | `footer.chips[1]` | « Gratis proef » | « Gratis proberen » (as `nav.trial`, `benefits[3].title`) | 15 / 16 |

## Dutch and Norwegian: spaced en dash « – », not the English em dash « — »

Dutch (gedachtestreepje) and Norwegian Bokmål (tankestrek, Språkrådet) use a spaced en dash in running text. The rest of
both dictionaries already does (`tests/unit/copy-polish.test.ts:52` checks it, leaving out `hero.lead` and `cta.text`,
which were edited in parallel in Phase 12). Only the dash changes; spaces and words stay.

| ID | File:line | Key | Current | Proposed |
|---|---|---|---|---|
| SF-04 | `src/i18n/dictionaries/nl.ts:325` | `cta.text` | « Live-tv, films en series op je tv, mobiel en computer, in HD tot 4K waar beschikbaar — vanaf {price}/maand. » | « Live-tv, films en series op je tv, mobiel en computer, in HD tot 4K waar beschikbaar – vanaf {price}/maand. » |
| SF-05 | `src/i18n/dictionaries/nb.ts:324` | `cta.text` | « Direkte-TV, filmer og serier på TV, mobil og datamaskin, i HD og opptil 4K der tilgjengelig — fra {price}/måned. » | « Direkte-TV, filmer og serier på TV, mobil og datamaskin, i HD og opptil 4K der tilgjengelig – fra {price}/måned. » |
| SF-07 | `src/content/nl/info.ts:58` | About › Who we are `sections[0].body[0].p` (template literal) | « SYGMA TV+ — “One World. Endless Entertainment.” — is een merk van ${siteConfig.legalEntity}, een bedrijf dat in ${F.established} is opgericht en geregistreerd staat in de staat New Mexico, Verenigde Staten. » | « SYGMA TV+ – “One World. Endless Entertainment.” – is een merk van ${siteConfig.legalEntity}, een bedrijf dat in ${F.established} is opgericht en geregistreerd staat in de staat New Mexico, Verenigde Staten. » |
| SF-08 | `src/content/nl/info.ts:196` | Help › Devices › Picture quality `sections[2].body[0].p` | « De beeldkwaliteit hangt af van je abonnement, de content, je apparaat en je internetverbinding. Een stabiele verbinding — liefst een netwerkkabel, of een apparaat dicht bij je wifirouter — maakt het grootste verschil. » | « De beeldkwaliteit hangt af van je abonnement, de content, je apparaat en je internetverbinding. Een stabiele verbinding – liefst een netwerkkabel, of een apparaat dicht bij je wifirouter – maakt het grootste verschil. » |
| SF-09 | `src/content/nl/info.ts:204` | Help › Free trial `description` (template literal, renders « 24 uur ») | « Probeer SYGMA TV+ ${TRIAL} gratis op je eigen apparaat voordat je koopt. Hoe aanvragen werkt en wat er daarna gebeurt — niets betalen, niets opzeggen. » | « Probeer SYGMA TV+ ${TRIAL} gratis op je eigen apparaat voordat je koopt. Hoe aanvragen werkt en wat er daarna gebeurt – niets betalen, niets opzeggen. » |
| SF-10 | `src/content/nl/info.ts:336` | `INFO_UI.hubContact` | « Staat je antwoord er niet bij? Schrijf ons — vermeld je apparaat en, als je die hebt, je bestelreferentie. » | « Staat je antwoord er niet bij? Schrijf ons – vermeld je apparaat en, als je die hebt, je bestelreferentie. » |
| SF-11 | `src/content/nb/info.ts:56` | About › Who we are `sections[0].body[0].p` (template literal) | « SYGMA TV+ — «One World. Endless Entertainment.» — er et merke fra ${siteConfig.legalEntity}, et selskap etablert i ${F.established} og registrert i delstaten New Mexico i USA. » | « SYGMA TV+ – «One World. Endless Entertainment.» – er et merke fra ${siteConfig.legalEntity}, et selskap etablert i ${F.established} og registrert i delstaten New Mexico i USA. » |
| SF-12 | `src/content/nb/info.ts:194` | Help › Devices › Picture quality `sections[2].body[0].p` | « Bildekvaliteten avhenger av abonnementet, innholdet, enheten og internettforbindelsen din. En stabil forbindelse — helst med nettverkskabel, eller med enheten nær Wi-Fi-ruteren — betyr mest. » | « Bildekvaliteten avhenger av abonnementet, innholdet, enheten og internettforbindelsen din. En stabil forbindelse – helst med nettverkskabel, eller med enheten nær Wi-Fi-ruteren – betyr mest. » |
| SF-13 | `src/content/nb/info.ts:202` | Help › Free trial `description` (template literal, renders « 24 timer ») | « Test SYGMA TV+ gratis i ${TRIAL} på din egen enhet før du kjøper. Slik ber du om prøveperioden og hva som skjer etterpå — ingenting å betale eller si opp. » | « Test SYGMA TV+ gratis i ${TRIAL} på din egen enhet før du kjøper. Slik ber du om prøveperioden og hva som skjer etterpå – ingenting å betale eller si opp. » |
| SF-14 | `src/content/nb/info.ts:334` | `INFO_UI.hubContact` | « Finner du ikke svaret? Skriv til oss — oppgi enheten din og eventuelt ordrereferansen din. » | « Finner du ikke svaret? Skriv til oss – oppgi enheten din og eventuelt ordrereferansen din. » |

Not included, same dash issue but the sentence mentions WhatsApp (claims rewrite): `hero.lead` (nl.ts:99, nb.ts:98);
About › Activation, payment and confirmation `body[0]` and `body[2]` note; Help › Getting started step 4; Help ›
Ordering and payment › « When and how do I pay? » and « How long does activation take? » (nl/info.ts:107, 109, 169,
240, 244; nb/info.ts:105, 107, 167, 238, 242). Apply the en dash when those sentences are rewritten. The title prefix
« SYGMA TV+ — » in `meta.homeTitle` stays (required by test). `legal.docs.*` intros are not rendered (legal pages are
English only).

## Considered and left to the native reviewer or to legal (not safe)

- German « kostenloser Test » vs the site term « kostenloser Testzugang » (`how.note`, `prelaunch.home.howNote`,
  `prelaunch.home.trialGuarantee`, `prelaunch.metaDescription`): consistent with the terminology table, but the
  description cannot take the long form within 155 characters, so the four strings should be decided together by a
  native reviewer (review-de.md, P1).
- Spanish spaced rayas and Italian em dashes: the fix (comma, brackets, or attached rayas) is a wording choice.
- Spanish « prueba gratis » → « prueba gratuita » in `prelaunch.metaDescription` (fits, 152/155) and `prelaunch.trialTitleA`:
  terminology, but also a tone choice for a heading; in review-es.md.
- Swedish `Om oss: företaget, support och åtaganden` (mixed definite forms), French `faq.eyebrow` repetition, Dutch
  `plans.finalPrice` « Jouw prijs »: stylistic.
- English guillemets in `consent.text` (L-030): consent text, legal sign-off. English US/UK spelling mix (L-031): owner's
  choice.
- French « Sans reconduction », Swedish « Ingen autoförnyelse », Norwegian « Ingen autofornyelse », « Pengene
  tilbake », and every Phase 11 register item: contractual meaning, legal sign-off.
