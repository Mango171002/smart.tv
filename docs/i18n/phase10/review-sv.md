# Swedish (sv-SE) localisation review — SYGMA TV+ (phase 10)

Files edited: `/home/user/p10/src/i18n/dictionaries/sv.ts` (27 changes), `/home/user/p10/src/content/sv/info.ts` (16 changes).
Backups of the pre-review files: `(review workspace) sv.ts.orig` and `(review workspace) info.ts.orig`.

**Limitations:** I am a language model, not a native Swedish speaker. These are the judgements of a careful non-native reviewer. A native Swedish copywriter should check this before publication, especially the items under "Unverified".

## Summary

- **Before: 8/10.** The phase 8 Swedish was already good. The « du » register was consistent, the terminology was mostly stable (paket, provperiod, pengarna-tillbaka-garanti, ångerrätt, aktivering, support), *tv* was lowercase in running text, ” ” quotes were used and prices were in the right format. What remained were literal calques from English ("Vilka länder är tillgängliga?", "Här för dig", "Bli aktiverad", "Betalsätten förklarade", "felskärmen"). There were also a few grammar slips: «ingen debiteras automatiskt» reads as "nobody is charged", "Med den gratis provperioden kan du kontrollera", "i natten", and the doubled «först … först». "skatter" (plural) appeared where Swedish uses "skatt". One "100 %" in the plan trust cards had a normal space instead of a non-breaking space.
- **After: 9/10.** I removed the calques and fixed the slips. "skatt" is now used the same way everywhere, and the alt texts read more naturally. No meaning, promise, figure, placeholder, bold pair, link or layout-limited string was changed. A few consent, guarantee and legal wordings would still read better. Those need owner or legal approval and are listed below.

Quality gate after the edits:
- `I18N_LANG=sv npx vitest run tests/unit/translations.test.ts`: 16/16 passed.
- `npx tsc --noEmit | grep -E "dictionaries/sv|content/sv"`: printed nothing.
- `npx vitest run tests/unit/language-switcher.test.ts`: 10/10 passed.
- One change I tried was reverted because the gate rejected it. `aboutFacts[1].small` «New Mexico, USA» is identical to the English and was flagged as untranslated, so it stays «New Mexico i USA».

Strings with layout limits that I did not touch: every `nav.*` string, `footer.chips`, plan feature lines, taglines and notes, all of `plans.compare.*`, `hero.checks`, the benefit titles and texts, and `meta.homeTitle`. The other meta titles and descriptions I changed are still within their limits: devices description 141 characters, ordering-payment description 149.

## Changes made

### `src/i18n/dictionaries/sv.ts`

| Key path | Before | After | Reason |
|---|---|---|---|
| `common.countrySearch` | Skriv ett land… | Sök land… | Standard Swedish wording for a search placeholder; "Skriv ett land" is a calque of "Type a country". |
| `meta.plansDescription` | Jämför abonnemangstider och antal … | Jämför abonnemangsperioder och antal … | Matches the term "period" used in the simulator and help pages. "abonnemangstid" suggests a binding period. |
| `featured.items[0].alt` | … matchställ kämpar om bollen … | … matchställ som kämpar om bollen … | Same participial «som …» structure as the other alt texts. The finite verb read like a broken sentence. |
| `featured.items[1].alt` | … ovanför en stad i natten | … ovanför en stad om natten | "om natten" is the idiomatic phrase; "i natten" means "tonight" or "into the night". |
| `featured.items[6].alt` | Söt 3D-robot och räv som ser lyktor stiga över en sagodal | Söt 3D-robot och räv som tittar på lyktor som stiger över en sagodal | More natural Swedish for "watching lanterns rise". |
| `featured.items[7].alt` | Övergiven clownmask på en regnig, mörk gata en natt | Övergiven clownmask på en mörk och regnig gata om natten | "en natt" is a calque of "at night"; the new adjective order is more natural. |
| `featured.items[13].alt` | Forsränningslag som paddlar genom forsen nedanför ett vattenfall | Forsränningslag som paddlar genom forsande vatten nedanför ett vattenfall | Removes the forsränning/forsen repetition and renders "white water". |
| `plans.sub` | … i HD upp till 4K i mån av tillgång. | … i HD och upp till 4K i mån av tillgång. | "i HD upp till 4K" is too compressed in Swedish. The fixed qualifier is kept. |
| `plans.footnote` | … exklusive skatter. … | … exklusive skatt. … | Swedish price wording uses the singular ("exklusive skatt"). |
| `plans.trust[1].text` | 7 dagar, 100 % återbetalning (normal space) | 7 dagar, 100 % återbetalning (non-breaking space) | Brief rule: a non-breaking space before %. This was the only instance with a normal space. |
| `plans.trust[2].title` | Här för dig | Vi hjälper dig | "Här för dig" is a calque of "Here to help"; "Vi hjälper dig" is idiomatic. |
| `plans.matrixCaption` | Priser i {currency}, exklusive skatter. | Priser i {currency}, exklusive skatt. | Same "skatt" term as above. |
| `plans.extraStreams` | Priser för 1 skärm. Extra skärm … | Priserna gäller 1 skärm. Extra skärm … | More natural Swedish for "Prices for 1 screen". |
| `plans.details[1].title` | Skatter | Skatt | Same "skatt" term. |
| `content.categories[3].text` | … och verkliga berättelser | … och sanna berättelser | "true stories" is "sanna berättelser" in Swedish. |
| `devices.sub` | … Kontrollera din enhet med den gratis provperioden. | … Testa din enhet under den gratis provperioden. | A trial is something you test *during* ("under"), not *with* ("med"). |
| `devices.checklistTitle` | Med den gratis provperioden kan du kontrollera | Under den gratis provperioden kan du kontrollera | Same reason. |
| `preview.title` | En upplevelse på alla skärmar. | Samma upplevelse på alla skärmar. | "En upplevelse" reads as "an experience", not "one and the same experience". |
| `how.steps[2].title` | Bli aktiverad | Få åtkomst | "Bli aktiverad" is a calque of "Get activated". The new wording matches "Få din åtkomst" in the help pages. |
| `cta.text` | … i HD upp till 4K i mån av tillgång – … | … i HD och upp till 4K i mån av tillgång – … | Same as `plans.sub`; qualifier kept. |
| `faq.items[0].a` | … och skicka det korta beställningsformuläret … | … och skicka in det korta beställningsformuläret … | You "skicka in" a form in Swedish. |
| `faq.items[1].q` | Vilka länder är tillgängliga? | I vilka länder finns tjänsten? | Calque: in Swedish countries are not "tillgängliga"; the service "finns" in them. |
| `faq.items[3].a` | … per år (exklusive skatter) … Skatter och slutpris visas alltid … | … per år (exklusive skatt) … Skatt och slutpris visas alltid … | Same "skatt" term. Prices, percentages and non-breaking spaces unchanged. |
| `faq.items[4].q` | Kan jag säga upp? | Kan jag säga upp abonnemanget? | "säga upp" needs an object in Swedish. Only the question changed; the answer is untouched. |
| `checkout.taxes` | Skatter | Skatt | Same "skatt" term; matches the 0,00 USD value. |
| `checkout.doneTitle` | Beställningen är mottagen! | Vi har tagit emot din beställning! | More natural and warmer; the old title reads like an official notice. |

### `src/content/sv/info.ts`

| Key path | Before | After | Reason |
|---|---|---|---|
| `about.sections[who].body[1].p` | … med 1 enhet som ingår och upp till 4. | … med 1 enhet som ingår och möjlighet till upp till 4. | "och upp till 4" had nothing to attach to. Figures kept. |
| `about.sections[how].body[0].p` | Vi aktiverar ditt abonnemang först: du betalar först när din åtkomst är aktiv. | Vi aktiverar ditt abonnemang först – du betalar inte förrän din åtkomst är aktiv. | Removes the confusing «först … först» (two meanings of "först"). Same meaning: you pay only once access is active. |
| `about.sections[payment].body[2].note` | … – ingen debiteras automatiskt på den här webbplatsen. … | … – inget debiteras automatiskt på den här webbplatsen. … | «ingen debiteras» reads as "nobody is charged". «inget debiteras» matches the site-wide promise «Inget debiteras på den här webbplatsen». |
| `topics[getting-started].sections[steps].steps[3].text` | För en beställning aktiverar vi … | Vid en beställning aktiverar vi … | Swedish uses "Vid" (on/for an order) here; "För" is a calque. |
| `topics[devices].description` | … Antal enheter och hur du kollar din. | … Antal enheter och hur du testar din. | "kollar" is too colloquial for a search snippet; also consistent with "testa". Same length (141). |
| `topics[free-trial].sections[request].steps[1].text` | … – och godkänn att bli kontaktad. | … – och godkänn att vi kontaktar dig. | More idiomatic. This is an instruction, not the consent checkbox text. |
| `topics[free-trial].sections[cost].body[0].p` | Provperioden tar slut av sig själv: … | Provperioden upphör automatiskt: … | Idiomatic wording for "ends by itself"; same meaning (nothing to cancel). |
| `topics[ordering-payment].description` | … sedan betalar du. Betalsätten förklarade. | … sedan betalar du. Betalsätten i korthet. | "Betalsätten förklarade" is a calque of "Payment methods explained". 149 characters. |
| `topics[ordering-payment].sections[prices].title` | Priser och skatter | Priser och skatt | Same "skatt" term. |
| `topics[ordering-payment].sections[prices].body[0].p` | … (USD) exklusive skatter, … | … (USD) exklusive skatt, … | Same "skatt" term. |
| `topics[ordering-payment].sections[pay].body[2].note` | … ; ingen debiteras automatiskt på den här webbplatsen. … | … ; inget debiteras automatiskt på den här webbplatsen. … | Same as the About payment note. |
| `topics[troubleshooting].sections[login].body[0].p` | … skicka ett foto av felskärmen till oss. | … skicka ett foto av skärmen med felmeddelandet till oss. | "felskärmen" is not idiomatic Swedish; this renders "the error screen". |
| `topics[troubleshooting].sections[mobile].title` | Uppspelningen stannar på mobildata | Uppspelningen avbryts på mobildata | "avbryts" is the natural verb for playback stopping. |
| `topics[contact-support].sections[languages].title` | Vilka språk? | På vilka språk? | Swedish needs the preposition ("which languages can I write in"). |
| `topics[contact-support].sections[include].body[0].list[1]` | Din enhet, dess märke och modell. | Vilken enhet du har, med märke och modell. | "dess" is stiff and literal. |
| `topics[refunds].summary` | 7 dagars pengarna-tillbaka-garanti, så begär du. | 7 dagars pengarna-tillbaka-garanti – så gör du. | "så begär du" had no object. Same meaning (how to ask). |
| `ui.popular` | Vanliga frågor | Populära frågor | It clashed with the FAQ link label «Vanliga frågor» (`hubRelated`, `footer.helpFaq`, `faq.title`); it now renders "Popular questions". |

Tried and reverted: `ui.aboutFacts[1].small` «New Mexico i USA» → «New Mexico, USA». The gate flags it as identical to the English. Changing it would mean adding it to `tests/unit/i18n-allow/sv.json`, which I was not allowed to edit.

## Terminology

| Concept | Swedish term enforced |
|---|---|
| plan | paket (Starter / Plus / Ultra+ stay as names) |
| subscription | abonnemang; to subscribe: teckna abonnemang |
| duration / term | period (12, 24, 36 månader); abonnemangsperiod |
| yearly plan | årspaket |
| free trial | (gratis) provperiod; CTA «Testa gratis» / «Begär en (gratis) provperiod» |
| money-back guarantee | pengarna-tillbaka-garanti («7 dagars pengarna-tillbaka-garanti») |
| refund | återbetalning |
| withdrawal right (EU/UK) | ångerrätt («14 dagars ångerrätt») |
| activation | aktivering; to activate access: aktivera din åtkomst |
| access | åtkomst |
| login / access details | inloggningsuppgifter |
| support | support / supporten / supportteam (no «kundtjänst» on the site) |
| automatic renewal | automatisk förnyelse (only plan cards use the shortened «autoförnyelse», for layout) |
| no commitment | ingen bindningstid |
| nothing is charged on this site | Inget debiteras på den här webbplatsen |
| usually (times) | vanligtvis («Oftast» only in the compact helpFacts card) |
| taxes | skatt (singular): «exklusive skatt», label «Skatt» |
| device / screen | enhet; skärm only where the English says "screen" |
| order / order form / order number | beställning / beställningsformulär / ordernummer |
| payment method | betalsätt |
| email channel / email message | e-post / mejl |
| TV (running text) | tv, tv-guide, live-tv (product names keep Smart TV, Android TV, Fire TV, Apple TV) |
| where available | i mån av tillgång (fixed qualifier) |
| country calling code | landsnummer |
| FAQ | Vanliga frågor; Help hub quick questions: Populära frågor |
| quotes | ” ” (Swedish style) |
| price format | 59 USD, 0,00 USD, 20 % (non-breaking spaces) |

## Needs owner/legal approval

I did not change any of these. Each one touches consent, privacy, guarantee, refund or licensing wording.

1. **`consent.text`** (cookie banner). "mäta vår publik" is a calque (French "mesurer notre audience"). "Inget sätts förrän …" is vague; it is not clear *what* is set.
   Proposed: «Med ditt samtycke använder vi cookies för att mäta trafiken på webbplatsen (Google Analytics, Microsoft Clarity) och resultatet av våra annonskampanjer (marknadsföring). Inga cookies sätts förrän du har gjort ditt val. Du kan när som helst ändra ditt val under ”Cookieinställningar”.»
   Legal should confirm that "Inga cookies" is accurate. The English "Nothing is set" may deliberately exclude the strictly necessary cookie that remembers the choice. If so, use «Inga valfria cookies sätts …».
2. **`consent.analyticsText`**: «Publikmätning och förbättring av webbplatsen …». Proposed: «Besöksstatistik och förbättring av webbplatsen (Google Analytics, Microsoft Clarity).» "Publikmätning" is a calque.
3. **`consent.necessaryText`**: «Alltid på» → proposed «Alltid aktiva» (more standard in Swedish cookie banners).
4. **Contact consent checkboxes**: `forms.consent`, `checkout.consentMain`, `checkout.consentLabel`. «Jag godkänner att bli kontaktad …» is grammatical but stiff.
   Proposed: «Jag godkänner att ni kontaktar mig om den här förfrågan / om min beställning. …» The rest stays as is: «Uppgifterna raderas inom 12 månader [om jag inte tecknar abonnemang].»
5. **`checkout.trust[1]`**: «7 dagars pengarna tillbaka» is ungrammatical as a noun phrase. Proposed: «Pengarna tillbaka i 7 dagar», or the full term «7 dagars pengarna-tillbaka-garanti» if the layout allows.
6. **`plans.trust[1].title`**: «Pengarna tillbaka». The English title is "Money-back guarantee". To match the English and the site term, use «Pengarna-tillbaka-garanti» (25 characters, against 20 in English). This needs a layout check and approval because it names the guarantee.
7. **`topics[refunds].sections[how]`**: «… till det betalsätt du använde». Proposed: «… via samma betalsätt som du använde.» This is clearer about where the money goes.
8. **`topics[refunds].intro`**: «… få sedan full återbetalning om du inte är nöjd inom 7 dagar från aktiveringen». This copies an English ambiguity: is it satisfaction within 7 days, or a request within 7 days? Proposed, matching the rule elsewhere: «Testa först. Är du inte nöjd får du full återbetalning om du hör av dig inom 7 dagar från aktiveringen. …»
9. **`topics[refunds].description`**: «… 14 dagars ångerrätt i EU och UK, och hur du begär den.» "den" grammatically points to «ångerrätt», not to the refund. Proposed: «… i EU och UK – så går det till.» (fits ≤ 155).
10. **`legal.docs.refunds.metaDescription`**: «ingen autoförnyelse» is non-standard. The standard «ingen automatisk förnyelse» gives 161 characters, over the 155 limit. A shorter version (154) would need dropping «gratis», so this is an owner decision.
11. **`footer.compliance2`**: «Varje land öppnas först när sändningstillstånden är på plats.» "Varje land öppnas" is odd: a country is not "opened". Also, «sändningstillstånd» is a specific Swedish regulatory term for broadcasting licences, which may imply more than "broadcasting authorisations".
    Proposed: «Tjänsten lanseras i ett land först när de nödvändiga tillstånden finns på plats.» This is a licensing claim, so it needs approval.
12. **`about…support.note`**, for information only: the English says "the website itself is in English". The Swedish, like the validated French, says «våra juridiska dokument är skrivna på engelska», which is the accurate statement for a translated site. I left it as is. Please confirm this adaptation is intended for all languages.

## Unverified / for the native reviewer

- **«Så funkar det»** (`nav.how`, `hero.ctaSecondary`) is colloquial but common on Swedish brand sites. «Så fungerar det» is longer, and `nav.*` cannot grow.
- **«Ingen autoförnyelse»** (plan cards): a short, not fully standard compound, kept for the 22-character limit. «Förnyas ej automatiskt» is exactly 22 characters, but it is longer than the current text, which the brief forbids.
- **«Din data säljs aldrig»**: "din data" is common usage; Språkrådet also accepts it. «Dina uppgifter säljs aldrig» is the more formal choice. Not changed, because it is a privacy statement.
- **«Smart TV»** is capitalised in running text (meta description, devices.sub), as the brief requires for product names. A Swedish editor might prefer «smart-tv» as the generic category.
- **«mejl» vs «e-post»**: I kept «mejl» for an email message and «e-post» for the channel. Both are Språkrådet-approved. Confirm the mix is acceptable.
- **«Begär en (gratis) provperiod»** is slightly formal for a CTA. «Starta din gratis provperiod» or «Prova gratis» would be more casual, but «Starta» could imply instant access, which would change the meaning.
- **«Mest kompletta paketet»** (Ultra+ note) is headline style without «Vårt»/«Det». Grammatically acceptable, but «Vårt mest kompletta paket» is longer than allowed.
- **«surfabonnemang»** (troubleshooting) for "data plan": acceptable, but «mobilabonnemang» or «surfpott» may be preferred.
- **«orange och gröna matchställ»**: uninflected «orange» is accepted; «orangea» is also possible.
- **«Brödsmulor»** (breadcrumb aria label): standard on Swedish sites; «Brödsmulenavigering» is the alternative.
- **«Oftast < 1 timme»** (helpFacts) is the only place "usually" is not «vanligtvis», for card width.
- **`LANGUAGE_LABEL.sv` = «Språk»** in `src/i18n/switcher.ts`: correct, natural Swedish for "Language". No change needed; I did not edit that file. The nb value «Språk» is also correct Bokmål.
- **Process note:** in one read-only shell command I accidentally included `git log --oneline -1`, with its output discarded. No git command changed anything, and no file other than the two Swedish files was edited. My scratchpad backups and the edit script are outside the repository.
