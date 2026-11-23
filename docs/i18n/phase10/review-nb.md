# Norwegian Bokmål (nb) localisation review — SYGMA TV+

Files edited: `/home/user/p10/src/i18n/dictionaries/nb.ts`, `/home/user/p10/src/content/nb/info.ts` (nothing else).
Backups of the pre-review files: `(review workspace) nb.ts.orig`, `(review workspace) info.ts.orig`.

**Limitations:** this review was done by an AI model, not a native Norwegian speaker. The edits follow Språkrådet conventions as far as I know them, but a native Bokmål copywriter should check them before publication (the files remain marked PREVIEW ONLY).

## Summary

- **Before: 7/10.** The translation was accurate and faithful, with correct figures, the « du » register throughout, «…» quotes, correct hyphenation (pengene-tilbake-garanti, direkte-TV, TV-en, smart-TV-er) and correctly placed non-breaking spaces. It also had a grammar slip (« Fleksible abonnement », a Nynorsk-style zero plural next to « abonnementer » everywhere else), a number of English calques (« Svar først », « Bli aktivert », « et ekte team », « utgjør den største forskjellen », « uten spørsmål », « Velg mitt abonnement », « Spørsmål om opplevelsen? », « i HD til 4K »), and missing articles (« Med gratis prøveperiode kan du… »). Wording was inconsistent in places (« betalingsalternativene » vs « betalingsmåter »; « før avgifter » rather than the idiomatic « eksklusive avgifter »). The privacy meta description was 160 characters (over the 155 limit) and dropped « how long we keep it ».
- **After: about 8.5/10.** The calques and grammar slips are fixed, the terminology is consistent and the sentences flow more naturally. All figures, placeholders, **bold** pairs, links and length limits are kept, and no commercial or legal meaning was changed. The remaining issues are owner or legal decisions (see below) and a few length-locked strings.

Gate after edits:
- `I18N_LANG=nb npx vitest run tests/unit/translations.test.ts`: 16/16 passed.
- `npx tsc --noEmit | grep -E "dictionaries/nb|content/nb"`: printed nothing.
- `npx vitest run tests/unit/language-switcher.test.ts`: 10/10 passed.

No `nav.*`, `footer.chips`, plan feature, tagline, note or comparison-table string was changed. Hero check and benefit title « Fleksible løsninger » (19 characters) are shorter than before (20).

## Changes made

60 strings changed: 32 in `nb.ts` and 28 in `info.ts`. « ⍽ » below stands for the existing non-breaking space, which was preserved.

### src/i18n/dictionaries/nb.ts

| Key path | Before | After | Reason |
|---|---|---|---|
| meta.homeDescription | …Årsabonnement for 1 til 4 enheter… | …Årsabonnementer for 1 til 4 enheter… | EN plural « Yearly plans »; consistent plural « -er ». Now 155 characters. |
| meta.plansDescription | Sammenlign abonnementslengder og antall samtidige enheter for USA, Canada og Europa. Priser i USD. | Sammenlign abonnementenes varighet og antall samtidige enheter i USA, Canada og Europa. Priser i USD. | « abonnementslengder » is unidiomatic; « varighet » is the simulator term. |
| hero.lead | …— med gratis prøveperiode først og et ekte team som hjelper deg i gang på WhatsApp. | …— med en gratis prøveperiode først og et team av ekte mennesker som hjelper deg i gang på WhatsApp. | Missing article; « et ekte team » is a calque of « a real team ». |
| hero.checks[3] | Fleksible abonnement | Fleksible løsninger | Zero plural is not standard Bokmål for « abonnement » (-er), and « Fleksible abonnementer » (22) would lengthen a length-locked string. See Unverified. |
| benefits[1].title | Fleksible abonnement | Fleksible løsninger | Same as above; « abonnementer » would be 22 > 20. |
| featured.items[11].badge | DOKU | DOKUMENTAR | « DOKU » is a German abbreviation. 10 characters, the same as the validated sv « DOKUMENTÄR ». |
| plans.sub | Filmer, serier og direkte-TV, i HD til 4K der tilgjengelig. | Filmer, serier og direkte-TV i HD og opptil 4K der tilgjengelig. | « i HD til 4K » is a calque; qualifier kept. |
| plans.footnote | …(USD), før avgifter. … | …(USD), eksklusive avgifter. … | Idiomatic price wording (same meaning: « before taxes »). |
| plans.matrixCaption | Priser i {currency}, før avgifter. | Priser i {currency}, eksklusive avgifter. | Same as above. |
| content.title | Innhold for alle interesser. | Innhold for enhver smak. | Natural idiom for « for every interest ». |
| content.categories[1].text | Kino, serier og innhold på forespørsel | Kinofilmer, serier og innhold på forespørsel | « Kino » (the venue) as a content type is odd. |
| devices.sub | …Sjekk din egen med gratis prøveperiode. | …Sjekk din egen enhet med en gratis prøveperiode. | Missing noun and article. |
| devices.checklistTitle | Med gratis prøveperiode kan du sjekke | I den gratis prøveperioden kan du sjekke | Missing article, unnatural. |
| devices.checklist[1] | Anbefalt minste internetthastighet for HD og 4K | Anbefalt minimumshastighet på internett for HD og 4K | « minste internetthastighet » is clumsy. |
| how.steps[2].title | Bli aktivert | Få tilgang | Calque of « Get activated »; text « Raskt, på WhatsApp » unchanged. |
| cta.text | …, i HD til 4K der tilgjengelig — fra {price}/måned. | …, i HD og opptil 4K der tilgjengelig — fra {price}/måned. | Same fix as plans.sub; avoids « fra … til … fra ». |
| cta.choose | Velg mitt abonnement | Velg abonnement | Calque « Choose my plan »; Norwegian buttons use the bare noun. |
| faq.eyebrow | Svar først | Spørsmål og svar | « Svar først » is a literal calque; « Spørsmål og svar » is the standard Norwegian label. |
| faq.items[0].q | Kan jeg abonnere nå? | Kan jeg tegne abonnement nå? | Idiomatic « tegne abonnement ». |
| faq.items[1].q | Hvilke land er tilgjengelige? | Hvilke land er tjenesten tilgjengelig i? | Countries are not « available »; the service is. |
| faq.items[3].a | …per år (før avgifter), med 20⍽% rabatt over 24 måneder og 30⍽% rabatt over 36 måneder. Avgifter og endelig pris vises alltid før du kjøper noe. | …per år (eksklusive avgifter), med 20⍽% rabatt for 24 måneder og 30⍽% rabatt for 36 måneder. Avgifter og sluttpris vises alltid før du kjøper. | « rabatt over 24 måneder » is a calque; idiomatic tax wording; prices and figures unchanged. |
| helpCta.title | Spørsmål om opplevelsen? | Spørsmål om tjenesten? | « opplevelsen » is a calque of « the experience ». |
| request.supportIntro | …og spørsmålet ditt: vi tar kontakt på e-post eller telefon. | …og spørsmålet ditt, så tar vi kontakt på e-post eller telefon. | Natural « …, så … » construction instead of the English colon. |
| checkout.headSub | Legg igjen opplysningene dine: teamet vårt aktiverer tilgangen din raskt. | Legg igjen opplysningene dine, så aktiverer teamet vårt tilgangen din raskt. | Same as above. |
| checkout.offerText | Ingenting belastes på dette nettstedet. | Du blir ikke belastet på dette nettstedet. | More natural phrasing of « Nothing is charged on this site »; same meaning. |
| checkout.intro | Ingenting belastes på dette nettstedet. Teamet vårt… | Du blir ikke belastet på dette nettstedet. Teamet vårt… | Same as above; used consistently everywhere. |
| checkout.productionNote | Ingenting belastes på dette nettstedet. Når du har bekreftet… | Du blir ikke belastet på dette nettstedet. Når du har bekreftet… | Same as above. |
| checkout.trust[1] | 7 dager pengene tilbake | Pengene tilbake i 7 dager | Word order was ungrammatical. Not a length-locked string (+2 characters). |
| checkout.errors.unavailable | Bestilling er midlertidig utilgjengelig. | Det er midlertidig ikke mulig å bestille. | « Bestilling er … utilgjengelig » is unidiomatic. |
| legal.docs.terms.intro | …— på et enkelt språk, og forbrukerrettighetene dine er alltid beskyttet. | …— forklart enkelt, og forbrukerrettighetene dine er alltid ivaretatt. | « på et enkelt språk » is a calque of « in plain language ». « ivaretatt » is the usual word for rights being protected; same meaning. |
| legal.docs.terms.metaDescription | Brukervilkårene for SYGMA TV+ på et enkelt språk: … | Brukervilkårene for SYGMA TV+ forklart enkelt: … | Same as above (151 characters). |
| legal.docs.privacy.metaDescription | Personvernerklæringen for SYGMA TV+: hvilke data vi samler inn, hvorfor, hvordan vi beskytter og lagrer dem, og rettighetene dine. Vi selger aldri dataene dine. (160 characters) | Personvern hos SYGMA TV+: hvilke data vi samler inn og hvorfor, hvordan de beskyttes, hvor lenge de lagres og rettighetene dine. Vi selger dem aldri. (149 characters) | Was over the 155 limit; restores the EN « how long we keep it ». « Data never sold » statement kept. |

### src/content/nb/info.ts

| Key path | Before | After | Reason |
|---|---|---|---|
| ORDER_STEPS[1].text (About + Ordering) | …WhatsApp-nummer. Ingenting belastes på dette nettstedet. Du får… | …WhatsApp-nummer. Du blir ikke belastet på dette nettstedet. Du får… | Consistent natural phrasing. |
| about.description | …Slik fungerer tjenesten, våre forpliktelser og kundestøtte. | …Les om tjenesten, forpliktelsene våre og kundestøtten. | The list was ungrammatical (« Slik fungerer » + nouns). Now 143 characters. |
| about.sections.who.body[1] | Abonnementene gjelder per år (12, 24 eller 36 måneder)… | Abonnementene tegnes for hele år (12, 24 eller 36 måneder)… | « gjelder per år » is unidiomatic for « Plans are yearly ». |
| about.sections.how.body[0] | …og en ekte person fra teamet vårt tar det videre på WhatsApp. Vi aktiverer abonnementet ditt før du betaler: du betaler ikke før tilgangen din er aktiv. | …og et ekte menneske fra teamet vårt følger opp på WhatsApp. Vi aktiverer abonnementet ditt først, og du betaler ikke før tilgangen din er aktiv. | Calque « takes it from there »; the previous sentence said « before you pay » twice. |
| about.sections.support.body[0] | …Dette er vår vanlige svartid, ikke en kontraktsfestet garanti. | …Dette er den vanlige svartiden vår, ikke en avtalefestet garanti. | Postposed possessive and the more common « avtalefestet »; « not a guarantee » kept. |
| about.sections.payment.body[0] | Ingenting belastes på dette nettstedet. Vi aktiverer… | Du blir ikke belastet på dette nettstedet. Vi aktiverer… | Consistent phrasing. |
| about.sections.payment.body[2].note | …— ingenting belastes automatisk på dette nettstedet. … | …— ingen betaling trekkes automatisk på dette nettstedet. … | Natural « trekkes » for automatic charges. |
| about.sections.links[4].text | Reglene, på et enkelt språk (på engelsk) | Reglene, forklart enkelt (på engelsk) | Calque; also avoided repeating « på ». |
| hub.description | Svar om gratis prøveperiode hos SYGMA TV+, bestilling og betaling, … kundestøtte. | Få svar om SYGMA TV+: gratis prøveperiode, bestilling og betaling, … kundestøtten. | « prøveperiode hos SYGMA TV+, bestilling… » read as if the brand applied only to the trial. Now 143 characters. |
| hub.popular[4].q | Hvor raskt svarer kundestøtte? | Hvor raskt svarer kundestøtten? | Definite form needed as the subject. |
| topics.getting-started.description | …fra valg av abonnement til du ser på: … | …fra du velger abonnement til du er i gang: … | « til du ser på » is awkward. Now 155 characters. |
| topics.getting-started.intro | Det tar bare noen få steg å komme i gang. … | Du kommer i gang med noen få steg. … | « bare » added emphasis not in the EN; more natural. |
| topics.getting-started.steps[3].title | Aktivering, så betaling | Først aktivering, så betaling | Natural « først … så … ». |
| topics.getting-started.good-to-know[0] | Ingenting belastes på dette nettstedet. | Du blir ikke belastet på dette nettstedet. | Consistent phrasing. |
| topics.devices.intro | …Med gratis prøveperiode kan du sjekke… | …Med den gratis prøveperioden kan du sjekke… | Missing article. |
| topics.devices.quality | …— utgjør den største forskjellen. | …— betyr mest. | Calque of « makes the biggest difference ». |
| topics.devices.check | Be om en gratis prøveperiode på 24 timer: du tester tjenesten… | Be om en gratis prøveperiode på 24 timer, så kan du teste tjenesten… | Natural construction. |
| topics.free-trial.intro | Med gratis prøveperiode kan du teste SYGMA TV+… | Med den gratis prøveperioden kan du teste SYGMA TV+… | Missing article. |
| topics.free-trial.cost | …Prøveperioden avsluttes av seg selv: … | …Prøveperioden avsluttes automatisk: … | Natural wording for « ends by itself ». |
| topics.ordering-payment.intro | …Ingenting belastes på dette nettstedet. | …Du blir ikke belastet på dette nettstedet. | Consistent phrasing. |
| topics.ordering-payment.pay.body[0] | …sender deg betalingsalternativene på WhatsApp… | …sender deg betalingsmåtene på WhatsApp… | One term (« betalingsmåte ») per concept. |
| topics.ordering-payment.pay.body[2].note | …; ingenting belastes automatisk på dette nettstedet. … | …; ingen betaling trekkes automatisk på dette nettstedet. … | Same as the About note. |
| topics.ordering-payment.prices | Prisene vises i amerikanske dollar (USD) før avgifter, … | Prisene vises i amerikanske dollar (USD) eksklusive avgifter, … | Idiomatic tax wording, as in the dictionary. |
| topics.troubleshooting.login | …send oss et bilde av feilskjermen. | …send oss et bilde av skjermen med feilmeldingen. | « feilskjermen » is not idiomatic. |
| topics.troubleshooting.store | Appbutikkene avhenger av enhetsmodell og land. … din: vi forteller deg… | Utvalget i appbutikkene avhenger av enhetsmodell og land. … din, så forteller vi deg… | Literal calque; clarified to mean what the EN means. |
| topics.contact-support.availability | …Dette er vår vanlige svartid, ikke en kontraktsfestet garanti. | …Dette er den vanlige svartiden vår, ikke en avtalefestet garanti. | Same as the About support text. |
| topics.refunds.metaTitle | Refusjon: 7 dagers pengene-tilbake og angrerett | Refusjon: pengene tilbake i 7 dager og angrerett | « pengene-tilbake » without « garanti » is an incomplete compound. Total with « \| SYGMA TV+ » is exactly 60. |
| topics.refunds.guarantee | Ikke fornøyd? Be om det innen 7 dager…, så refunderer vi 100⍽%, uten spørsmål. … | Ikke fornøyd? Be om refusjon innen 7 dager…, så får du 100⍽% tilbake, uten at vi stiller spørsmål. … | « Be om det » had no referent; « uten spørsmål » is a calque of « no questions asked ». Guarantee, 7 days and 100 % unchanged. |

## Terminology

| Concept (EN) | Norwegian term enforced |
|---|---|
| plan / subscription | abonnement (pl. abonnementer, def. pl. abonnementene); « tegne abonnement » = subscribe |
| bundle / package (plan content) | pakke (Basispakke, Utvidet pakke, Komplett pakke) |
| free trial | (gratis) prøveperiode; button « Prøv gratis » |
| money-back guarantee | pengene-tilbake-garanti (« 7 dagers pengene-tilbake-garanti »); short form « pengene tilbake » |
| refund / refund (verb) | refusjon / refundere |
| withdrawal right | angrerett (« 14 dagers angrerett »); « Lovfestet angrerett » |
| activation | aktivering / aktivere tilgangen |
| support | kundestøtte (team: kundestøtteteamet; as subject: kundestøtten) |
| order | bestilling / bestille; order form = bestillingsskjema |
| order reference / number | ordrereferanse / ordrenummer (as in EN) |
| payment method | betalingsmåte |
| duration | varighet |
| device / stream / screen | enhet (stream is also translated « enhet », as before); skjerm where the EN says « screen » |
| live TV / on demand | direkte-TV / innhold på forespørsel (VOD in short labels) |
| TV guide | TV-guide (EPG), always with « der tilgjengelig » where the EN qualifies it |
| before taxes | eksklusive avgifter |
| nothing is charged on the website | Du blir ikke belastet på dette nettstedet / ingen betaling trekkes automatisk |
| usually … not a guarantee | vanligvis … ikke en (avtalefestet) garanti |
| login details | innloggingsopplysninger |
| cookies | informasjonskapsler (body text), « cookies » in labels (Cookie-innstillinger, Retningslinjer for cookies); left as it was, see Unverified |
| website | nettsted |
| plain language | forklart enkelt |
| no commitment | ingen binding |
| Smart TV | « Smart TV » as a product or category label; « smart-TV(-er) » as a common noun in running text |

## Needs owner/legal approval

I did not change any of these items.

1. **Withdrawal right named as « EU og Storbritannia » on a Norway-market page.** Norway is in the EEA, not the EU, and Norwegian consumers have a statutory 14-day angrerett under angrerettloven. Readers may conclude that the 14-day right does not apply to them. Affected strings: `faq.items[4].a`, `legal.docs.refunds.metaDescription`, info `about.commitments[2]`, `topics.refunds.description`, `topics.refunds.withdrawal` (section title « Kunder i EU og Storbritannia »). Proposed wording, if the owner or legal team confirms the right extends to EEA consumers: « Kunder i EØS (inkludert Norge) og Storbritannia har i tillegg 14 dagers angrerett. » Section title: « Kunder i EØS og Storbritannia ». This also affects the English source and every other language.
2. **Norwegian is not one of the six support languages.** The site is shown in Norwegian, but support is offered in EN/FR/AR/DE/ES/IT. The current text is accurate. Customers may still assume Norwegian support. The FR-validated adaptation « de juridiske dokumentene våre er på engelsk » replaced the EN « the website itself is in English », and it is accurate here. Proposed addition (an owner decision, since it adds a statement): in `about.support` note and `contact-support.languages` note, « Vi har foreløpig ikke kundestøtte på norsk – skriv gjerne til oss på engelsk. »
3. **« Priser … eksklusive avgifter » (before taxes) shown to Norwegian consumers.** Norwegian price-display rules (prisopplysningsforskriften, markedsføringsloven) generally require consumer prices to be shown as the total price including VAT. This is a business and legal question, not a wording one. I kept the EN meaning: `plans.footnote`, `plans.matrixCaption`, `faq.items[3].a`, info `ordering-payment.prices`.
4. **`legal.docs.refunds.metaDescription` omits « no automatic renewal ».** It also says « angrerett i EU og Storbritannia » where the EN says « for EU and UK customers ». I did not touch it because it is legal-page text. Proposed (151 characters): « Refusjon hos SYGMA TV+: prøv gratis i 24 timer, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett (EU/UK), ingen automatisk fornyelse. » The same « i EU » vs « for kunder i EU » point applies to info `topics.refunds.description`. Proposed (149 characters): « Refusjon hos SYGMA TV+: prøv gratis først, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett for kunder i EU/UK. Slik ber du om det. »
5. **Consent banner text (`consent.text`).** The current text is correct but mixes « informasjonskapsler » and « cookies ». « måle trafikken » is slightly narrower than « audience measurement ». Proposed, for consent and legal sign-off only: « Hvis du samtykker, bruker vi informasjonskapsler (cookies) til å måle trafikken på nettstedet (Google Analytics, Microsoft Clarity) og effekten av annonsekampanjene våre (markedsføring). Ingenting lagres før du har valgt. Du kan når som helst endre valget under «Cookie-innstillinger». »
6. **Consent and data-retention lines** (`forms.consent`, `checkout.consentSub`, `checkout.consentLabel`: « Dataene slettes innen 12 måneder »). These are correct; I left them alone. « Opplysningene dine slettes innen 12 måneder » would be slightly more natural, but this needs privacy sign-off.

## Unverified / for the native reviewer

- **« Fleksible løsninger »** (hero check and benefit title) replaces « Fleksible abonnement ». I believe standard Bokmål requires « abonnementer »; the zero plural is Nynorsk, although it is seen in Norwegian telecom marketing. « Fleksible abonnementer » is 22 characters, too long for the benefit title (≤ 20) and +2 for the length-locked hero check. If the owner accepts +2 characters in the hero (limit 24), use « Fleksible abonnementer » there. « løsninger » is slightly vaguer than « plans ».
- **Plan tagline « God verdi for de fleste hjem »** (Plus) is a mild anglicism (« great value »). Better options are longer than the current 28 characters (« Mye for pengene for de fleste hjem » is 34). « Mye for pengene » (15) is shorter but drops « for most homes ». Left unchanged.
- **Plan feature « Ingen autofornyelse »** (≤ 22). « autofornyelse » is informal; « Ingen automatisk fornyelse » is 26 and does not fit. Left unchanged.
- **« Du blir ikke belastet på dette nettstedet »** replaced « Ingenting belastes på dette nettstedet » in 7 places, plus 2 « ingen betaling trekkes automatisk ». A native should confirm this is the preferred register.
- **« eksklusive avgifter »** vs « før avgifter ». Both are understandable; « eksklusive » (or « ekskl. avgifter ») is what Norwegian shops use.
- **« Få tilgang »** for « Get activated » (how.steps). « Aktivering » would be an alternative noun form.
- **FAQ eyebrow « Spørsmål og svar »** sits above the title « Ofte stilte spørsmål », so « spørsmål » is repeated. « Før du starter » is an alternative.
- **Badge « DOKUMENTAR »** (10 characters, the same as sv) — check the badge width on 320 px cards.
- **nav.\***: not changed. Possible shorter labels, if the header needs space: `nav.plans` « Abonnementer » → « Priser » (more common in Norwegian navigation, but a slight meaning shift: plans → prices), `nav.toggleMenu` « Åpne eller lukk menyen » → « Vis/skjul meny ». « Slik fungerer det » is already the natural form.
- **plans.trust[1].title « Pengene tilbake »** drops « garanti » (EN « Money-back guarantee »). It is natural; « Pengene-tilbake-garanti » would be the faithful form if space allows. Left unchanged.
- **Other wording a native should confirm:**
  - « Wi-Fi » (Språkrådet recommends « wifi »).
  - « Cookie-innstillinger » / « Retningslinjer for cookies ». « Innstillinger for informasjonskapsler » and « Erklæring om informasjonskapsler » are the purer forms, but longer.
  - « Gå til innholdet » (« Hopp til hovedinnholdet » is also common).
  - « Brødsmulesti » is fine for an aria label.
  - « DOKUMENTAR » vs « DOK ».
- **switcher.ts `LANGUAGE_LABEL.nb` = 'Språk'**: correct and natural (the same word as sv). No change needed.
- **locales.ts `nativeName` 'Norsk bokmål'**: correct. Capital N only because it starts the label, lowercase « bokmål » as in CLDR and Språkrådet. An alternative some sites use is plain « Norsk », but « Norsk bokmål » is more precise. No change needed.
- **The `hreflang`/`htmlLang` value 'nb'** is correct for Bokmål. Some sites also add `no` as an alternate, but that is an SEO decision outside this review.
