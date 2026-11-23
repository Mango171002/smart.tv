# Dutch (nl-NL) localisation review: SYGMA TV+

Files edited: `/home/user/p10/src/i18n/dictionaries/nl.ts` and `/home/user/p10/src/content/nl/info.ts`. No other file was touched and no git command was run.

**Limitations:** I am a language model with strong Dutch, not a native speaker from the Netherlands. A native reviewer should still read the site before it is published, especially the items in the last two sections.

## Summary

- **Before: 7.5/10.** The translation was accurate and complete. Terminology was mostly consistent (abonnement, proefperiode, geld-terug-garantie, herroepingsrecht, klantenservice), and the « je » register, `USD 59` prices with a non-breaking space and « waar beschikbaar » were applied correctly. It still read as translated in a few dozen places: English calques (« Hoe langer je kiest », « Geniet van je ervaring », « Klaar om te helpen », « Vind hieronder », « Betaalmethoden uitgelegd », « kom snel terug »), Dutch word-order slips (verb clusters not at the end of subclauses), pronouns with no antecedent (« het jouwe », « die »), ungrammatical buttons (« Verder naar controleren ») and stiff validation messages (« Ga ermee akkoord dat … »).
- **After: 8.5/10.** All 53 changes are wording only: no change of meaning, claim, figure, price or link. Some remaining weaknesses are in consent, refund, privacy, licensing and payment wording, which I was not allowed to change (see « Needs owner/legal approval »). A few short labels also cannot be improved within the length limits.
- **Gate:** all pass.
  - `I18N_LANG=nl npx vitest run tests/unit/translations.test.ts`: 16/16.
  - `npx tsc --noEmit | grep -E "dictionaries/nl|content/nl"`: no output.
  - `npx vitest run tests/unit/language-switcher.test.ts`: 10/10.
- **Length-limited strings:** no limited string got longer. `nav.how` went from « Hoe het werkt » to « Zo werkt het », one character shorter. `cta.trust[0]` and `request.trust[2]` (« Vrijblijvend ») are shorter too.
- **Switcher label:** `LANGUAGE_LABEL.nl = 'Taal'` in `src/i18n/switcher.ts` is correct and natural. No change needed (report only, file not edited).

## Changes made

The before and after columns show the unique source fragment that was replaced, so some cells give only part of the string.

| Key path | Before | After | Reason |
|---|---|---|---|
| `common.skipToContent` | skipToContent: 'Naar de inhoud' | skipToContent: 'Direct naar de inhoud' | Standard Dutch wording for a skip link. |
| `nav.how` | how: 'Hoe het werkt', | how: 'Zo werkt het', | More idiomatic NL navigation label; 1 character shorter (header width). |
| `hero.ctaSecondary` | ctaSecondary: 'Hoe het werkt' | ctaSecondary: 'Zo werkt het' | Consistency with nav.how. |
| `hero.lead` | — eerst gratis proberen, en een echt team dat je via WhatsApp helpt met de installatie. | — met eerst een gratis proefperiode en een echt team dat je via WhatsApp helpt met de installatie. | Stray comma before « en » and unbalanced coordination (infinitive + noun phrase); now parallel like the English « with a free trial first and a real team ». |
| `hero.visualLabel` | 'Een jachtluipaard die bij zonsondergang een gazelle achternazit over de savanne' | 'Een jachtluipaard dat bij zonsondergang een gazelle over de savanne achternazit' | Word order (verb cluster at the end of the subclause) and relative pronoun for « het (jacht)luipaard ». |
| `featured.items[5].alt` | alt: 'American footballspelers in oranje en groene tenues tackelen elkaar op het veld' | alt: 'Footballspelers in oranje en groene tenues tackelen elkaar op het veld' | « American footballspelers » is a spelling problem (English word group + Dutch compound); « footballspelers » is unambiguous next to the title « Amerikaans voetbal ». |
| `featured.items[7].alt` | alt: 'Achtergelaten clownsmasker op een donkere, regenachtige straat bij nacht' | alt: 'Achtergelaten clownsmasker op een donkere straat in de regen, bij nacht' | « regenachtige straat » is unidiomatic (regenachtig describes weather). |
| `featured.items[11].badge` | badge: 'DOCS', title: 'Documentaires' | badge: 'DOCU', title: 'Documentaires' | « DOCS » is English; « docu » is the usual Dutch short form. |
| `plans.footnote` | Content en aantal zenders kunnen per land verschillen. | Het aanbod en het aantal zenders kunnen per land verschillen. | Missing articles; « content » → « aanbod » (term used in the navigation). |
| `plans.trust[2].title` | title: 'Klaar om te helpen' | title: 'We helpen je graag' | « Klaar om te helpen » is a calque of « Here to help ». |
| `plans.trust[3].text` | text: 'Alles zichtbaar vóór je koopt' | text: 'Je ziet alles voordat je koopt' | More natural sentence instead of a stilted participle phrase. |
| `plans.simulatorEyebrow` | simulatorEyebrow: 'Abonnementssimulator' | simulatorEyebrow: 'Prijscalculator' | « simulator » is an anglicism here; « prijscalculator » is the usual Dutch name for this tool. |
| `plans.simulatorPoints[0]` | 'Hoe langer je kiest, hoe meer je bespaart: tot −{pct}%.' | 'Hoe langer de looptijd, hoe meer je bespaart: tot −{pct}%.' | « Hoe langer je kiest » is a literal calque (means « the longer you take to choose »). |
| `plans.simulatorSub` | en het aantal apparaten, en zie direct je prijs.' | en het aantal apparaten, en je ziet direct je prijs.' | Imperative « en zie » is unidiomatic; statement reads naturally. |
| `devices.sub` | Controleer het jouwe met de gratis proefperiode. | Test je eigen apparaat met de gratis proefperiode. | « Controleer het jouwe » is awkward (pronoun without clear antecedent). |
| `devices.guidesText` | 'Onze klantenservice helpt je stap voor stap om de dienst op je apparaat in te stellen.' | 'Onze klantenservice helpt je stap voor stap bij het instellen van de dienst op je apparaat.' | « helpen bij » is the idiomatic construction. |
| `devices.checklist[0]` | 'Welke apps officieel worden ondersteund op je apparaat' | 'Welke apps officieel op je apparaat worden ondersteund' | Word order (verb cluster at the end). |
| `devices.checklist[1]` | 'Welke internetsnelheid minimaal wordt aanbevolen voor HD en 4K' | 'Welke minimale internetsnelheid we aanraden voor HD en 4K' | Stilted passive; natural active phrasing. |
| `how.steps[3].text` | text: 'Geniet van je ervaring' | text: 'En geniet ervan' | « Geniet van je ervaring » is a calque of « Enjoy your experience ». |
| `cta.trust[0]` | trust: ['Geen verplichtingen', 'Gegevens nooit verkocht', '24/7 klantenservice'] | trust: ['Vrijblijvend', 'Gegevens nooit verkocht', '24/7 klantenservice'] | « Vrijblijvend » is the idiomatic Dutch for « No commitment » (shorter). |
| `blog.sub` | De eerste artikelen worden nu geschreven. | We schrijven nu de eerste artikelen. | Active voice, more natural. |
| `blog.empty` | 'Nog geen artikelen — kom snel terug.' | 'Nog geen artikelen — kijk binnenkort nog eens.' | « kom snel terug » is a calque of « come back soon ». |
| `faq.items[3].a` | met 20% korting bij 24 maanden en 30% korting bij 36 maanden | met 20% korting bij een looptijd van 24 maanden en 30% korting bij 36 maanden | « korting bij 24 maanden » is elliptic; wording only, same figures. |
| `help.sub` | 'Vind hieronder antwoorden of stuur ons een vraag.' | 'Hieronder vind je antwoorden, of stuur ons je vraag.' | « Vind hieronder » is a calque of « Find below ». |
| `help.supportTitle` | 'Hulp nodig of een proefperiode?' | 'Hulp nodig of wil je een proefperiode?' | Elliptic coordination was ungrammatical-sounding in Dutch. |
| `help.contactSub` | 'Je aanvraag wordt geregistreerd en we antwoorden per e-mail.' | 'We registreren je vraag en antwoorden per e-mail.' | A question is not an « aanvraag »; active voice. |
| `request.trust[2]` | trust: ['Gegevens nooit verkocht', 'Snel antwoord', 'Geen verplichtingen'] | trust: ['Gegevens nooit verkocht', 'Snel antwoord', 'Vrijblijvend'] | Same as cta.trust[0]. |
| `request.supportIntro` | we nemen per e-mail of telefoon contact met je op.' | we nemen per e-mail of telefonisch contact met je op.' | « telefonisch contact opnemen » is the idiomatic collocation. |
| `request.successText` | Ons team neemt per e-mail of telefoon contact met je op.' | Ons team neemt per e-mail of telefonisch contact met je op.' | Same as request.supportIntro. |
| `request.errors.consent` | consent: 'Ga ermee akkoord dat we contact met je opnemen over je aanvraag.' | consent: 'Geef aan dat we over je aanvraag contact met je mogen opnemen.' | Imperative « Ga ermee akkoord » is unnatural for a validation message; same meaning (tick the consent box). The consent checkbox text itself is unchanged. |
| `checkout.headSub` | ons team activeert snel je toegang.' | ons team activeert je toegang snel.' | Natural adverb placement. |
| `checkout.review` | review: 'Verder naar controleren' | review: 'Bestelling controleren' | « Verder naar controleren » is ungrammatical; standard Dutch e-commerce button. |
| `checkout.doneText` | Er is een bevestiging verstuurd naar {email}.' | We hebben een bevestiging gestuurd naar {email}.' | Active voice, natural. |
| `checkout.errors.consent` | consent: 'Ga ermee akkoord dat we contact met je opnemen over je bestelling.' | consent: 'Geef aan dat we over je bestelling contact met je mogen opnemen.' | Same as request.errors.consent. |
| `coverage.sub` | Content kan per land verschillen.' | Het aanbod kan per land verschillen.' | Missing article; « content » → « aanbod ». |
| `meta.plansDescription` | 'Vergelijk de looptijden en het aantal apparaten tegelijk voor de Verenigde Staten, Canada en Europa. Prijzen in USD.' | 'Vergelijk de looptijden en het aantal apparaten waarop je tegelijk kunt kijken, voor de Verenigde Staten, Canada en Europa. Prijzen in USD.' | « het aantal apparaten tegelijk » is elliptic (simultaneous streams). |
| `ABOUT.description` | Hoe het werkt, beloften en klantenservice.' | Werkwijze, beloften en klantenservice.' | « Hoe het werkt, beloften en …» mixed a clause with nouns and lacked « onze »; a clean noun list keeps the description ≤ 155. |
| `HELP_HUB.description` | problemen oplossen, terugbetaling en de klantenservice.' | problemen oplossen, terugbetaling en contact met de klantenservice.' | EN « how to contact our support team »; « antwoorden over … de klantenservice » was vague. |
| `getting-started.intro` | 'Aan de slag gaan kost maar een paar stappen. | 'Aan de slag gaan doe je in een paar stappen. | « kost maar een paar stappen » is unidiomatic. |
| `getting-started.sections.steps[2].text` | stuurt je inloggegevens en vertelt je welke app je installeert.' | stuurt je inloggegevens en vertelt je welke app je moet installeren.' | « welke app je installeert » reads as a statement, not « which app to install ». |
| `devices.description` | Hoeveel apparaten mogen en hoe je het jouwe test.' | Het aantal apparaten en hoe je je eigen apparaat test.' | « Hoeveel apparaten mogen » is incomplete; « het jouwe » awkward (fits 155). |
| `devices.sections.categories.p` | 'Samen met je inloggegevens vertelt ons team je welke app je op je apparaat installeert, en het helpt je bij de installatie.' | 'Samen met je inloggegevens laat ons team je weten welke app je op je apparaat moet installeren, en we helpen je bij de installatie.' | « het helpt je » (het = team) is clumsy; « welke app je … moet installeren ». |
| `free-trial.description` | Zo vraag je die aan en wat er daarna gebeurt — niets betalen, niets opzeggen. | Hoe aanvragen werkt en wat er daarna gebeurt — niets betalen, niets opzeggen. | « die » had no antecedent; clauses now parallel. |
| `free-trial.sections.request.title` | title: 'Hoe vraag ik die aan?' | title: 'Hoe vraag ik de proefperiode aan?' | « die » had no antecedent in the heading (also used in the table of contents). |
| `free-trial.sections.request.steps[0].text` | text: 'Kies “Gratis proberen” bovenaan elke pagina.' | text: 'Klik op “Gratis proberen” bovenaan elke pagina.' | « Kies “…” » for a button is a calque of « Select »; « Klik op » is standard. |
| `free-trial.sections.request.steps[2].text` | text: 'Ons team neemt via WhatsApp contact met je op met je inloggegevens en de app die je installeert.' | text: 'Ons team stuurt je via WhatsApp je inloggegevens en vertelt je welke app je moet installeren.' | Double « met … met » and « de app die je installeert »; same facts (contact on WhatsApp, login details, app to install). |
| `free-trial.sections.check.title` | title: 'Wat controleer ik tijdens de proefperiode?' | title: 'Wat kan ik tijdens de proefperiode testen?' | More natural question; matches the « Of … » list items. |
| `free-trial.sections.check.list[1]` | 'Of het beeld vloeiend is op je internetverbinding.' | 'Of het beeld vloeiend loopt via je internetverbinding.' | « vloeiend lopen » / « via je verbinding » are the natural collocations. |
| `ordering-payment.description` | verstuur het formulier, ons team neemt via WhatsApp contact op en activeert je toegang, daarna betaal je. Betaalmethoden uitgelegd. | formulier versturen, contact en activering via WhatsApp, daarna betalen. Met uitleg over de betaalmethoden. | « neemt contact op » lacked « met je »; « Betaalmethoden uitgelegd » is a calque; same steps in the same order (form → WhatsApp contact → activation → payment). |
| `ordering-payment.sections.order.p` | Kies “Nu bestellen” in het onderdeel Abonnementen om te beginnen.' | Klik om te beginnen op “Nu bestellen” in het onderdeel Abonnementen.' | Same as the free-trial step (« Klik op »). |
| `contact-support.description` | in zes talen. Wat je vermeldt voor een sneller antwoord. | in zes talen. Tips voor een sneller antwoord. | Loose fragment « Wat je vermeldt … ». |
| `contact-support.sections.reach.list[2]` | 'Het contactformulier: kies “Contact” onderaan elke pagina.' | 'Het contactformulier: klik op “Contact” onderaan elke pagina.' | Same as the other « Klik op » fixes. |
| `contact-support.sections.include.title` | title: 'Wat je vermeldt', body | title: 'Wat je het best vermeldt', body | « Wat je vermeldt » is an incomplete heading (EN « What to include »). |

## Terminology

| Concept (EN) | Dutch term enforced | Notes |
|---|---|---|
| plan / subscription | abonnement | Exception: « plan » stays in `plans.tiers.ultra.note` because of the length limit (see below). |
| bundle / package | pakket | |
| free trial | (gratis) proefperiode | Button and nav label: « Gratis proberen ». Footer chip: « Gratis proef » (13-character limit). |
| money-back guarantee | geld-terug-garantie | Short form: « 7 dagen geld terug ». |
| withdrawal right | herroepingsrecht | « 14 dagen herroeping » in meta descriptions. |
| refund | terugbetaling / terugbetalen | |
| activation | activering | Kept, not changed to « activatie ». Both are correct Dutch and the file already used « activering » everywhere, including refund sentences I may not touch. Switching would create the inconsistency the review is meant to remove. |
| support | klantenservice | Never « support » or « helpdesk ». |
| help centre | helpcentrum | |
| content / catalogue | aanbod (running text) / catalogus | « content » kept only in compounds: on-demandcontent, contentcategorieën. |
| device / screen / stream | apparaat; scherm where the English says screen | |
| duration | looptijd | |
| order / to order | bestelling / bestellen | « bestelnummer » for the order number, « bestelreferentie » for the order reference, as in the English. |
| login details | inloggegevens | |
| setup | installatie | |
| no commitment | vrijblijvend | |
| price calculator (plan simulator) | prijscalculator | |
| taxes | belastingen | Not « btw », to keep the English's generic meaning. |
| where available | waar beschikbaar | Fixed qualifier. |
| TV / live TV / TV guide | tv / live-tv / tv-gids | Lowercase in running text. Product names unchanged: Smart TV, Android TV, Fire TV, Apple TV. |
| e-mail / Wi-Fi | e-mail / wifi (wifirouter) | |
| call to click | « Klik op “…” » | Replaces the calque « Kies “…” ». |

## Needs owner/legal approval

These items are not changed, because they are consent, refund, privacy, licensing, payment or legal wording.

1. **`consent.text`**. The wording repeats « te meten … te meten », and « ons bereik » is marketing jargon. Proposed: « Met je toestemming gebruiken we cookies om het bezoek aan onze website (Google Analytics, Microsoft Clarity) en onze advertentiecampagnes (marketing) te meten. Er wordt niets geplaatst voordat je een keuze maakt. Je kunt je keuze altijd wijzigen via ‘Cookie-instellingen’. »
2. **`consent.analyticsText`**. Proposed: « Meting van het websitebezoek en verbetering van de website (Google Analytics, Microsoft Clarity). »
3. **`plans.details[3].text`** (refunds). The word order is clumsy. Proposed: « Eerst gratis proberen, daarna volledige terugbetaling als je daar binnen 7 dagen na activering om vraagt. Het wettelijke herroepingsrecht blijft altijd van toepassing. »
4. **`faq.items[4].a`**. In « Vraag het … aan », « het » has no antecedent. Proposed: « Abonnementen worden nooit automatisch verlengd. Vraag binnen 7 dagen na activering een terugbetaling aan en je krijgt 100% terug. Klanten in de EU en het VK behouden daarnaast hun herroepingsrecht van 14 dagen. »
5. **`faq.items[5].a`** (privacy). The participle fragment « Alleen de gegevens die je ons stuurt, gebruikt om … » is ungrammatical in Dutch. Proposed: « Alleen de gegevens die je ons zelf stuurt. We gebruiken ze alleen om je aanvraag en je abonnement af te handelen, en we verkopen je gegevens nooit. »
6. **`legal.docs.terms.metaDescription`**. It leaves out « fair use » and « free » from the English. Proposed (149 characters): « Voorwaarden van SYGMA TV+: bestellen, gratis proefperiode, abonnementen, betaling, verlenging, terugbetaling, redelijk gebruik en toepasselijk recht. »
7. **`legal.docs.privacy.metaDescription`**. It leaves out « why we use it », and the list ends without « en ». Proposed (about 150 characters): « Privacybeleid van SYGMA TV+: welke gegevens we verzamelen en waarom, hoe we ze beschermen, hoelang we ze bewaren en je rechten. We verkopen ze nooit. »
8. **`legal.docs.terms.intro`**. « met je consumentenrechten altijd beschermd » is a calque. Proposed: « … in duidelijke taal, waarbij je rechten als consument altijd beschermd blijven. »
9. **`footer.compliance2`** (licensing). « rond zijn » is too informal for a licensing statement. Proposed: « Elk land wordt pas opengesteld zodra de uitzendvergunningen geregeld zijn. »
10. **`OWNER_FACTS.paymentMethods[0]`**. « Creditcard (Visa / Mastercard) » is narrower than the English « Visa / Mastercard card », which also covers debit cards. Proposed: « Kaart (Visa / Mastercard) », matching de and sv, or simply « Visa / Mastercard ».
11. **`refunds` topic, `guarantee` section**. « Vraag het … aan » has no antecedent, and « geblokkeerd » is stronger than the English « suspended ». Proposed: « Niet tevreden? Vraag binnen 7 dagen na activering een terugbetaling aan en je krijgt 100% terug, zonder vragen. Eén terugbetaling per klant; niet mogelijk voor accounts die zijn opgeschort wegens het delen of doorverkopen van toegang. » The same « Vraag het aan » pattern is in `refunds.summary` (« zo vraag je het aan »), which is acceptable.
12. **`ordering-payment` topic, `contract` section**. Dutch legal register would be: « De overeenkomst gaat in wanneer ons team je bestelling bevestigt. »
13. **`plans.tiers.plus.tagline`**. « Ideaal voor de meeste huishoudens » is softer and different from the English « Great value… ». An option within 34 characters is « Voordelig voor de meeste gezinnen » (33). It is a small commercial nuance, so it is the owner's call.
14. **`plans.terms.lifetime`**. « Levenslang » can sound like a prison sentence in Dutch. It is common for « levenslange licentie », but as a standalone duration label the owner may prefer « Lifetime ». That would need an allow-list entry in `tests/unit/i18n-allow/nl.json`. This is a business label, so I did not change it.

## Unverified / for the native reviewer

- **`plans.tiers.ultra.note`**: « Ons meest complete plan » uses the anglicism « plan ». « abonnement » or « pakket » would exceed the 62-character limit together with the required qualifier. Native reviewer: accept, or shorten another part of the note.
- **`footer.chips[1]`**: « Gratis proef » is clipped. Better options are longer than allowed, since the chip may not get longer.
- **`nav.*`**:
  - « Gratis proberen » is kept: « Probeer gratis » is one character shorter but less natural.
  - « Abonnementen » could become « Prijzen » (7 characters) if the header needs room, but that shifts the meaning slightly.
- **`devices.items[3].text`**: « desktop-app ». By Taalunie rules it would be « desktopapp », since there is no vowel clash. I kept the hyphen for readability.
- **« Klik op “…” »**: used in the help texts. On touch devices « Tik op » would be more exact. « Klik op » is the usual neutral web wording.
- **`checkout.review`**: the button now reads « Bestelling controleren », while step 2 is called « Controleren en bevestigen ». Please check in context.
- **`plans.simulatorEyebrow`**: « Prijscalculator » should be checked visually above « Stel je abonnement samen, bespaar tot …% ».
- **Smaller wording points** to check:
  - « **1 apparaat** verbonden » (alternative: « gekoppeld »).
  - « Hoofdapparaat ».
  - « HD- en Full HD-beeld » hyphenation.
  - « Juridische informatie » for « Legal notice » (alternative: « Bedrijfsgegevens » or « Colofon »).
  - The repetition « Gebruikelijke reactietijd / Gebruikelijke tijd, geen garantie » in `INFO_UI.helpFacts[1]`.
- **`featured.items[12].alt`**: « Tennisspeelster » assumes the person in the image is a woman. Check the image.
- **`featured.items[11].badge`**: « DOCU » replaces « DOCS ». Check that the badge width is fine.
- **Typography**: quotation marks are mixed. The consent banner uses ‘…’ and the info pages use “…”. Both are accepted in Dutch. Pick one house style if wanted.
