# Sensitive wording register: Phase 11 (23 November 2026)

**What this is.** Every item from the « Needs owner/legal approval » sections of the Phase 10 reviews
([review-fr](../phase10/review-fr.md), [de](../phase10/review-de.md), [es](../phase10/review-es.md),
[it](../phase10/review-it.md), [nl](../phase10/review-nl.md), [sv](../phase10/review-sv.md),
[nb](../phase10/review-nb.md)): 65 items in total (fr 7, de 13, es 8, it 5, nl 14, sv 12, nb 6), with the current text,
the proposed text and a status.

**Who reviewed it.** These are **AI linguistic reviews** (Phase 10A and Phase 11). They are not an independent human
review and not a native-speaker validation. Nothing in this register is legal advice. Every item marked
« REQUIRES OWNER/LEGAL APPROVAL » stays unchanged on the site until the owner or the legal reviewer decides.

**Statuses**
- **APPLIED**: the change is on the site (the phase and commit are given).
- **REQUIRES OWNER/LEGAL APPROVAL**: refund, withdrawal, consent, privacy, contract, licensing, payment or tax wording.
  It is not changed. The proposed text is a suggestion only.
- **NOT RENDERED**: the string is in a dictionary but no page shows it. Checked with `grep` in `src/components`,
  `src/app` and `src/lib` (see « How NOT RENDERED was checked » at the end). If one of these strings is ever shown,
  the item becomes « REQUIRES OWNER/LEGAL APPROVAL ».

Two items cover a rendered part and a non-rendered part, so they are split into two rows (de 5a/5b, nb 4a/4b). The
tables below therefore have **67 rows for 65 items**.

## Summary

| Status | Rows |
|---|---|
| APPLIED | 9 (Phase 10: 4, Phase 11: 5) |
| REQUIRES OWNER/LEGAL APPROVAL | 36 |
| NOT RENDERED | 22 |
| **Total** | **67** |

| Category | Applied | Requires approval | Not rendered | Total |
|---|---|---|---|---|
| refund | 2 | 16 | 7 | 25 |
| consent-privacy | 0 | 13 | 1 | 14 |
| contract | 2 | 3 | 6 | 11 |
| licensing | 0 | 0 | 6 | 6 |
| withdrawal | 0 | 2 | 2 | 4 |
| payment | 1 | 1 | 0 | 2 |
| marketing | 2 | 0 | 0 | 2 |
| support | 2 | 0 | 0 | 2 |
| tax | 0 | 1 | 0 | 1 |
| **Total** | **9** | **36** | **22** | **67** |

| Language | Items | Applied | Requires approval | Not rendered |
|---|---|---|---|---|
| fr | 7 | 0 | 3 | 4 |
| de | 13 (14 rows) | 3 | 6 | 5 |
| es | 8 | 1 | 4 | 3 |
| it | 5 | 1 | 3 | 1 |
| nl | 14 | 2 | 6 | 6 |
| sv | 12 | 1 | 9 | 2 |
| nb | 6 (7 rows) | 1 | 5 | 1 |

**Points that also affect the English source**, so the owner should decide them for every language at once:
- **nb 1**: the withdrawal right is named « EU and UK ». Norway is in the EEA, so EEA wording may be needed.
- **nb 3**: prices are shown before taxes. Norwegian price rules generally require the total price, including VAT.
- **fr 7 / es 7 / de 3 / nl 3**: « statutory withdrawal rights always apply » once a digital service has started.
  This is not rendered today in any language.

## French (fr)

| # | Key / location | Current text | Proposed text | Category | Rationale | Status |
|---|---|---|---|---|---|---|
| fr 1 | `footer.compliance2` | Chaque pays n’ouvre qu’une fois les autorisations de diffusion obtenues. | Le service n’ouvre dans chaque pays qu’une fois les autorisations de diffusion obtenues. | licensing | A country does not « open »; the service opens in a country. Also confirm that « obtenues » matches the English « in place ». | NOT RENDERED |
| fr 2 | `legal.docs.terms.metaDescription` | Conditions d’utilisation de SYGMA TV+ en langage clair : commande, essai gratuit, formules et paiement, renouvellement, remboursements, droit applicable. | Conditions d’utilisation de SYGMA TV+ : commande, essai gratuit, formules et paiement, renouvellement, remboursements, usage raisonnable, droit applicable. | contract | « fair use » from the English is missing. | NOT RENDERED (legal pages exist in English only) |
| fr 3 | `legal.docs.refunds.metaDescription` | Remboursements SYGMA TV+ : essai gratuit de 24 h, remboursement à 100 % sous 7 jours après activation, rétractation de 14 jours (UE et Royaume-Uni). | Remboursements SYGMA TV+ : essai gratuit de 24 h, 100 % remboursé sous 7 jours après activation, rétractation de 14 jours (UE, R.-U.), sans reconduction. | refund | « no automatic renewal » from the English is missing. | NOT RENDERED (legal pages exist in English only) |
| fr 4 | Help › Refunds › `guarantee` | Pas satisfait ? Faites votre demande dans les 7 jours suivant l’activation et nous vous remboursons à 100 %, sans justification. … | … nous vous remboursons à 100 %, sans avoir à vous justifier. … | refund | More idiomatic for « no questions asked ». The meaning is the same, but it is a refund promise. | REQUIRES OWNER/LEGAL APPROVAL |
| fr 5 | Help › Ordering and payment › `contract` | Le contrat commence lorsque notre équipe confirme votre commande. | Le contrat prend effet lorsque notre équipe confirme votre commande. | contract | This is the idiomatic legal phrasing. | REQUIRES OWNER/LEGAL APPROVAL |
| fr 6 | Help › Refunds › `how` | … Vous êtes remboursé sous 14 jours, sur le moyen de paiement utilisé. | … Vous êtes remboursé sous 14 jours, via le moyen de paiement utilisé. | refund | Optional, more natural preposition. | REQUIRES OWNER/LEGAL APPROVAL |
| fr 7 | `plans.details[3]` | … Le droit légal de rétractation s’applique toujours. | No wording change; legal should confirm the statement. | withdrawal | Legal should confirm that « always » still holds once a digital service has started (EU waiver rules). If it does not, the English must change too. | NOT RENDERED (`plans.details` is not used by any component) |

## German (de)

| # | Key / location | Current text | Proposed text | Category | Rationale | Status |
|---|---|---|---|---|---|---|
| de 1 | `plans.tiers.*.features[3]` | Endet automatisch (was: Verlängert sich nicht) | Läuft automatisch aus (the report's proposal) | contract | « Verlängert sich nicht » read as « cannot be renewed ». The applied version « Endet automatisch » was used because « Läuft automatisch aus » wrapped at 1024 px. | APPLIED (Phase 10, commit 8946645) |
| de 2 | `plans.tiers.ultra.features[1]` | **Maximale** Auswahl (was: Die **größte** Auswahl) | Unsere **größte** Auswahl / **Maximale** Auswahl | marketing | « Die größte Auswahl » can read as the largest selection on the market. The English « Our widest selection » compares our own plans. « Maximale Auswahl » (16 characters) is a level within our own plans (Basis / Erweitert / Komplett) and makes no comparison with competitors. | APPLIED (Phase 11) |
| de 3 | `plans.details[3].text` | Erst kostenlos testen, dann volle Erstattung, wenn Sie diese innerhalb von 7 Tagen nach der Aktivierung verlangen. Gesetzliche Widerrufsrechte gelten immer. | … wenn Sie sie innerhalb von 7 Tagen nach der Aktivierung beantragen. Gesetzliche Widerrufsrechte gelten immer. | refund | More natural German, same meaning. | NOT RENDERED (`plans.details` is not used by any component) |
| de 4 | Help › Refunds › `withdrawal` | Sie haben zusätzlich 14 Tage Zeit für Ihren Widerruf. … | Sie haben zusätzlich ein 14-tägiges Widerrufsrecht. … | withdrawal | Uses the same legal term as the FAQ and the About page. | REQUIRES OWNER/LEGAL APPROVAL |
| de 5a | `legal.docs.refunds.metaDescription` | SYGMA TV+ Erstattungen: erst 24 Stunden gratis testen, 100 % Erstattung binnen 7 Tagen ab Aktivierung, 14 Tage Widerruf (EU, UK), keine Auto-Verlängerung. | Erstattungen bei SYGMA TV+: 24 Stunden gratis testen, 100 % zurück binnen 7 Tagen ab Aktivierung, 14 Tage Widerrufsrecht (EU, UK), keine automatische Verlängerung. (Keep it at 155 characters or fewer.) | refund | Brand order, informal « Auto-Verlängerung », « Widerruf » instead of « Widerrufsrecht ». | NOT RENDERED (legal pages exist in English only) |
| de 5b | Help › Refunds `description` and `summary` | Erstattungen bei SYGMA TV+: erst kostenlos testen, 100 % zurück binnen 7 Tagen ab Aktivierung, 14 Tage Widerruf für Kunden in EU und UK, so geht’s. / 7 Tage Geld-zurück-Garantie, so beantragen Sie sie. | Use « Widerrufsrecht » in the description; in the summary, use « – » instead of the comma. | refund | Same legal term as the rest of the site. | REQUIRES OWNER/LEGAL APPROVAL |
| de 6 | `consent.text` | … Vor Ihrer Auswahl wird nichts gesetzt. … | … Bevor Sie eine Auswahl treffen, werden keine Cookies gesetzt. … | consent-privacy | Clearer, same meaning, but it is consent text. | REQUIRES OWNER/LEGAL APPROVAL |
| de 7 | « Auf dieser Website wird nichts abgebucht » (`checkout.offerText`, `checkout.productionNote`, `checkout.intro`, info pages) | Auf dieser Website wird nichts abgebucht. | Auf dieser Website bezahlen Sie nichts. / Auf dieser Website erfolgt keine Zahlung. | payment | « abgebucht » suggests a bank debit specifically. This is a business statement. (`checkout.intro` is not rendered; the others are.) | REQUIRES OWNER/LEGAL APPROVAL |
| de 8 | `plans.terms.lifetime`, `plans.extraStreams` | Lebenslang / … +{life} lebenslang. | Lifetime / Dauerhaft (not « Unbefristet », which changes the legal meaning) | contract | « Lebenslang » also evokes a life sentence, and a « lifetime » promise has legal weight. | NOT RENDERED (lifetime is not offered in the simulator; `extraStreams` is not used) |
| de 9 | Help › Ordering and payment › `contract` | Der Vertrag beginnt, wenn unser Team Ihre Bestellung bestätigt. | Der Vertrag kommt zustande, wenn unser Team Ihre Bestellung bestätigt. | contract | Idiomatic, but this is contract formation, which is legally not the same as « start ». | REQUIRES OWNER/LEGAL APPROVAL |
| de 10 | `legal.docs.terms.metaDescription` | … Erstattung, faire Nutzung, geltendes Recht. | … Fair-Use-Regeln / angemessene Nutzung … | contract | The usual German term; legal should confirm the term used in the English Terms. | NOT RENDERED (legal pages exist in English only) |
| de 11 | `footer.compliance2` | Jedes Land wird erst freigeschaltet, wenn die Sendegenehmigungen vorliegen. | « Senderechte », « Übertragungsrechte » or « Lizenzen » instead of « Sendegenehmigungen » | licensing | Legal should confirm the right term for « broadcasting authorisations ». | NOT RENDERED |
| de 12 | `forms.consent`, `checkout.consentSub`, `checkout.consentLabel` | … Daten werden innerhalb von 12 Monaten gelöscht. | … Ihre Daten werden innerhalb von 12 Monaten gelöscht. | consent-privacy | More natural; consent text. (`checkout.consentLabel` is not rendered; the other two are.) | REQUIRES OWNER/LEGAL APPROVAL |
| de 13 | Help › Devices › `how-many` | Jeder Tarif enthält 1 Gerät. Bei der Bestellung können Sie weitere Geräte hinzufügen, insgesamt bis zu 4. … (was: … hinzufügen, bis zu 4.) | Add « insgesamt » | contract | It now clearly reads as 4 devices in total, not 4 extra, the same as « Gut zu wissen » and the English. The sharing/reselling sentence is unchanged. | APPLIED (Phase 11) |

## Spanish (es)

| # | Key / location | Current text | Proposed text | Category | Rationale | Status |
|---|---|---|---|---|---|---|
| es 1 | `faq.items[4].a` | … Pídelo en los 7 días siguientes a la activación y te devolvemos el 100 %. … | … Si nos lo pides en los 7 días siguientes a la activación, te devolvemos el 100 %. … | refund | « Pídelo » does not say what is asked for. | REQUIRES OWNER/LEGAL APPROVAL |
| es 2 | Help › Refunds › `guarantee` | ¿No estás satisfecho? Pídelo en los 7 días siguientes a la activación y te devolvemos el 100 %, sin preguntas. … | ¿No estás satisfecho? Solicita el reembolso en los 7 días siguientes a la activación y te devolvemos el 100 %, sin tener que dar explicaciones. … | refund | Same « Pídelo » problem; « sin preguntas » is a calque. | REQUIRES OWNER/LEGAL APPROVAL |
| es 3 | Help › Refunds `intro` | Primero pruebas y, si no quedas satisfecho, te devolvemos todo en los 7 días siguientes a la activación. … | Primero pruebas y, si no quedas satisfecho en los 7 días siguientes a la activación, te reembolsamos el importe íntegro. … | refund | It can be read as « we refund within 7 days » instead of « if you ask within 7 days ». | REQUIRES OWNER/LEGAL APPROVAL |
| es 4 | `legal.docs.refunds.metaDescription` | Reembolsos SYGMA TV+: prueba gratis de 24 h, 100 % devuelto en 7 días tras activar, … | Reembolsos SYGMA TV+: prueba gratis de 24 h, reembolso del 100 % en 7 días tras activar, desistimiento de 14 días (UE y R. U.), sin renovación automática. | refund | « 100 % devuelto » is telegraphic. | NOT RENDERED (legal pages exist in English only) |
| es 5 | `footer.compliance2` | Cada país se abre solo cuando están vigentes las autorizaciones de emisión. | Solo abrimos el servicio en cada país cuando están vigentes las autorizaciones de emisión. | licensing | Unidiomatic. | NOT RENDERED |
| es 6 | `forms.consent`, `checkout.consentSub`, `checkout.consentLabel` | … Datos eliminados en un plazo de 12 meses. | … Tus datos se eliminan en un plazo de 12 meses. / … Mis datos se eliminarán en un plazo de 12 meses si no me suscribo. | consent-privacy | Telegraphic past participle; consent text. | REQUIRES OWNER/LEGAL APPROVAL |
| es 7 | `plans.details[3].text` | … El derecho legal de desistimiento se aplica siempre. | Siempre se respeta el derecho de desistimiento previsto por la ley. (optional) | withdrawal | Optional, more idiomatic. | NOT RENDERED (`plans.details` is not used by any component) |
| es 8 | `plans.trust[1].title`, `prototypeNotice` | Garantía de reembolso (was: Garantía de devolución) | Keep | refund | Consistent Spanish name for the « money-back guarantee ». The owner is asked to confirm. | APPLIED (Phase 10, commit 93fe604) |

## Italian (it)

| # | Key / location | Current text | Proposed text | Category | Rationale | Status |
|---|---|---|---|---|---|---|
| it 1 | `faq.items[4].a` | … Chiedi entro 7 giorni dall’attivazione e ti rimborsiamo al 100%. … | … Se lo chiedi entro 7 giorni dall’attivazione, ti rimborsiamo al 100%. … | refund | « Chiedi » has no object. | REQUIRES OWNER/LEGAL APPROVAL |
| it 2 | Help › Refunds › `guarantee` | Non sei soddisfatto? Chiedi entro 7 giorni dall’attivazione e ti rimborsiamo al 100%, senza domande. … | Non sei soddisfatto? Chiedi il rimborso entro 7 giorni dall’attivazione e ti rimborsiamo al 100%, senza bisogno di giustificazioni. … | refund | « senza domande » is a calque. | REQUIRES OWNER/LEGAL APPROVAL |
| it 3 | `footer.compliance2` | Ogni paese viene aperto solo dopo aver ottenuto le autorizzazioni di trasmissione. | Apriamo il servizio in ciascun paese solo quando le autorizzazioni di trasmissione sono in vigore. | licensing | Grammatically, the subject of « aver ottenuto » is the country. | NOT RENDERED |
| it 4 | `forms.consent`, `checkout.consentMain`, `checkout.consentLabel` | Accetto di essere ricontattato/a in merito … Dati cancellati entro 12 mesi. | Accetto di essere contattato/a … (optional); « I dati vengono cancellati entro 12 mesi » (optional) | consent-privacy | The first contact comes from us; consent text. | REQUIRES OWNER/LEGAL APPROVAL |
| it 5 | Help › Refunds `metaTitle` | Rimborso entro 7 giorni e diritto di recesso | Keep | refund | « garanzia » was dropped because « warranty » is a different legal concept in Italian; the facts are unchanged. The owner is asked to confirm. | APPLIED (Phase 10, commit 93fe604) |

## Dutch (nl)

| # | Key / location | Current text | Proposed text | Category | Rationale | Status |
|---|---|---|---|---|---|---|
| nl 1 | `consent.text` | Met je toestemming gebruiken we cookies om ons bereik te meten (…) en onze advertentiecampagnes te meten (marketing). Er wordt niets geplaatst voordat je een keuze maakt. … | Met je toestemming gebruiken we cookies om het bezoek aan onze website (Google Analytics, Microsoft Clarity) en onze advertentiecampagnes (marketing) te meten. Er wordt niets geplaatst voordat je een keuze maakt. Je kunt je keuze altijd wijzigen via ‘Cookie-instellingen’. | consent-privacy | « te meten … te meten » repeats; « ons bereik » is jargon. | REQUIRES OWNER/LEGAL APPROVAL |
| nl 2 | `consent.analyticsText` | Bereikmeting en verbetering van de website (Google Analytics, Microsoft Clarity). | Meting van het websitebezoek en verbetering van de website (Google Analytics, Microsoft Clarity). | consent-privacy | Clearer. | REQUIRES OWNER/LEGAL APPROVAL |
| nl 3 | `plans.details[3].text` | Eerst gratis proberen, daarna volledige terugbetaling als je daarom vraagt binnen 7 dagen na activering. Het wettelijke herroepingsrecht geldt altijd. | Eerst gratis proberen, daarna volledige terugbetaling als je daar binnen 7 dagen na activering om vraagt. Het wettelijke herroepingsrecht blijft altijd van toepassing. | refund | Clumsy word order. | NOT RENDERED (`plans.details` is not used by any component) |
| nl 4 | `faq.items[4].a` | … Vraag het binnen 7 dagen na activering aan en je krijgt 100% terug. … | … Vraag binnen 7 dagen na activering een terugbetaling aan en je krijgt 100% terug. … | refund | « het » has no antecedent. | REQUIRES OWNER/LEGAL APPROVAL |
| nl 5 | `faq.items[5].a` | Alleen de gegevens die je ons stuurt, gebruikt om je aanvraag en je abonnement af te handelen. We verkopen je gegevens nooit. | Alleen de gegevens die je ons zelf stuurt. We gebruiken ze alleen om je aanvraag en je abonnement af te handelen, en we verkopen je gegevens nooit. | consent-privacy | The participle fragment is ungrammatical. | REQUIRES OWNER/LEGAL APPROVAL |
| nl 6 | `legal.docs.terms.metaDescription` | Algemene voorwaarden van SYGMA TV+ in duidelijke taal: bestellen, proefperiode, abonnementen, betaling, verlenging, terugbetaling en toepasselijk recht. | Voorwaarden van SYGMA TV+: bestellen, gratis proefperiode, abonnementen, betaling, verlenging, terugbetaling, redelijk gebruik en toepasselijk recht. | contract | « fair use » and « free » from the English are missing. | NOT RENDERED (legal pages exist in English only) |
| nl 7 | `legal.docs.privacy.metaDescription` | Privacybeleid van SYGMA TV+: welke gegevens we verzamelen, waarom, hoe we ze beschermen, hoelang we ze bewaren, je rechten. … | Privacybeleid van SYGMA TV+: welke gegevens we verzamelen en waarom, hoe we ze beschermen, hoelang we ze bewaren en je rechten. We verkopen ze nooit. | consent-privacy | The list ends without « en ». | NOT RENDERED (legal pages exist in English only) |
| nl 8 | `legal.docs.terms.intro` | De regels voor het gebruik van SYGMA TV+ — in duidelijke taal, met je consumentenrechten altijd beschermd. | … in duidelijke taal, waarbij je rechten als consument altijd beschermd blijven. | contract | Calque. | NOT RENDERED (legal pages exist in English only) |
| nl 9 | `footer.compliance2` | Elk land gaat pas open zodra de uitzendvergunningen rond zijn. | Elk land wordt pas opengesteld zodra de uitzendvergunningen geregeld zijn. | licensing | « rond zijn » is too informal for a licensing statement. | NOT RENDERED |
| nl 10 | info `OWNER_FACTS.paymentMethods[0]` | Kaart (Visa / Mastercard) (was: Creditcard (Visa / Mastercard)) | Kaart (Visa / Mastercard) | payment | « Creditcard » is narrower than the English « Visa / Mastercard card », which also covers debit cards. Now the same as de and sv. | APPLIED (Phase 11) |
| nl 11 | Help › Refunds › `guarantee` | Niet tevreden? Vraag het binnen 7 dagen na activering aan en we betalen 100% terug, zonder vragen. … geblokkeerd wegens … | Niet tevreden? Vraag binnen 7 dagen na activering een terugbetaling aan en je krijgt 100% terug, zonder vragen. … opgeschort wegens … | refund | « het » has no antecedent; « geblokkeerd » is stronger than « suspended ». | REQUIRES OWNER/LEGAL APPROVAL |
| nl 12 | Help › Ordering and payment › `contract` | Het contract begint wanneer ons team je bestelling bevestigt. | De overeenkomst gaat in wanneer ons team je bestelling bevestigt. | contract | Dutch legal register. | REQUIRES OWNER/LEGAL APPROVAL |
| nl 13 | `plans.tiers.plus.tagline` | Voordelig voor de meeste gezinnen (was: Ideaal voor de meeste huishoudens) | Voordelig voor de meeste gezinnen | marketing | The English is « Great value for most homes »; « Ideaal » was a different claim. 33 characters, within the limit of 34. | APPLIED (Phase 11) |
| nl 14 | `plans.terms.lifetime` | Levenslang | Lifetime (would need an allow-list entry in `tests/unit/i18n-allow/nl.json`) | contract | Can sound like a prison sentence as a standalone label. | NOT RENDERED (lifetime is not offered in the simulator) |

## Swedish (sv)

| # | Key / location | Current text | Proposed text | Category | Rationale | Status |
|---|---|---|---|---|---|---|
| sv 1 | `consent.text` | Med ditt samtycke använder vi cookies för att mäta vår publik (…) och våra annonskampanjer (marknadsföring). Inget sätts förrän du har gjort ditt val. … | Med ditt samtycke använder vi cookies för att mäta trafiken på webbplatsen (Google Analytics, Microsoft Clarity) och resultatet av våra annonskampanjer (marknadsföring). Inga cookies sätts förrän du har gjort ditt val. … (or « Inga valfria cookies » if the choice cookie is excluded) | consent-privacy | « mäta vår publik » is a calque; « Inget sätts » is vague. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 2 | `consent.analyticsText` | Publikmätning och förbättring av webbplatsen (Google Analytics, Microsoft Clarity). | Besöksstatistik och förbättring av webbplatsen (Google Analytics, Microsoft Clarity). | consent-privacy | « Publikmätning » is a calque. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 3 | `consent.necessaryText` | … Alltid på, ingen spårning. | … Alltid aktiva, ingen spårning. | consent-privacy | More standard in Swedish cookie banners. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 4 | `forms.consent`, `checkout.consentMain`, `checkout.consentLabel` | Jag godkänner att bli kontaktad om … | Jag godkänner att ni kontaktar mig om den här förfrågan / om min beställning. … | consent-privacy | Grammatical but stiff. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 5 | `checkout.trust[1]` | 7 dagars pengarna tillbaka | Pengarna tillbaka i 7 dagar / 7 dagars pengarna-tillbaka-garanti | refund | Ungrammatical as a noun phrase. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 6 | `plans.trust[1].title` | Pengarna tillbaka | Pengarna-tillbaka-garanti (25 characters; layout check needed) | refund | Matches the English « Money-back guarantee » and the site term. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 7 | Help › Refunds › `how` | … Du får pengarna tillbaka inom 14 dagar, till det betalsätt du använde. | … Du får pengarna tillbaka inom 14 dagar, via samma betalsätt som du använde. | refund | Clearer about where the money goes. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 8 | Help › Refunds `intro` | Testa först och få sedan full återbetalning om du inte är nöjd inom 7 dagar från aktiveringen. … | Testa först. Är du inte nöjd får du full återbetalning om du hör av dig inom 7 dagar från aktiveringen. … | refund | Ambiguity copied from the English: satisfaction within 7 days, or a request within 7 days. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 9 | Help › Refunds `description` | … 14 dagars ångerrätt i EU och UK, och hur du begär den. | … 14 dagars ångerrätt i EU och UK – så går det till. | refund | « den » grammatically points to « ångerrätt », not to the refund. | REQUIRES OWNER/LEGAL APPROVAL |
| sv 10 | `legal.docs.refunds.metaDescription` | … 14 dagars ångerrätt i EU/UK, ingen autoförnyelse. | ingen automatisk förnyelse (161 characters; shortening would drop « gratis ») | refund | « autoförnyelse » is non-standard. | NOT RENDERED (legal pages exist in English only) |
| sv 11 | `footer.compliance2` | Varje land öppnas först när sändningstillstånden är på plats. | Tjänsten lanseras i ett land först när de nödvändiga tillstånden finns på plats. | licensing | A country is not « opened »; « sändningstillstånd » is a specific Swedish regulatory term. | NOT RENDERED |
| sv 12 | About › `support` note | Vårt supportteam talar dessa sex språk, så personlig hjälp får du på engelska. Även våra juridiska dokument är skrivna på engelska. | (Phase 10 asked to confirm « legal documents in English » instead of « the website itself is in English ».) | support | The English source now also says « our legal documents are in English ». Phase 11 adds the owner decision that human help is in English for Swedish customers. | APPLIED (Phase 10 QA, commit 5c054bb; extended in Phase 11) |

## Norwegian Bokmål (nb)

| # | Key / location | Current text | Proposed text | Category | Rationale | Status |
|---|---|---|---|---|---|---|
| nb 1 | `faq.items[4].a`, `legal.docs.refunds.metaDescription`, info `about.commitments[2]`, `topics.refunds.description`, `topics.refunds.withdrawal` (title « Kunder i EU og Storbritannia ») | … Kunder i EU og Storbritannia har i tillegg 14 dagers angrerett. | Kunder i EØS (inkludert Norge) og Storbritannia har i tillegg 14 dagers angrerett. Section title: Kunder i EØS og Storbritannia. | withdrawal | Norway is in the EEA, not the EU, and Norwegian consumers have a statutory 14-day angrerett. Readers may conclude that the right does not apply to them. **This affects the English source and every language.** | REQUIRES OWNER/LEGAL APPROVAL |
| nb 2 | About › `support` note; Help › Contact support › `availability` and `languages` | About: Kundestøtteteamet vårt snakker disse seks språkene, så personlig hjelp får du på engelsk. De juridiske dokumentene våre er også på engelsk. Languages: Norsk er ikke blant dem: medarbeiderne våre hjelper deg gjerne på engelsk. … | Phase 10 proposal: « Vi har foreløpig ikke kundestøtte på norsk – skriv gjerne til oss på engelsk. » | support | Owner decision (Phase 11): human help is in English for nb, nl and sv customers. « foreløpig » (« for now ») was not used, because it would suggest that Norwegian support is coming. | APPLIED (Phase 11) |
| nb 3 | `plans.footnote`, `plans.matrixCaption`, `faq.items[3].a`, info `ordering-payment.prices` | … (eksklusive avgifter) … / Prisene vises i amerikanske dollar (USD) eksklusive avgifter … | No wording proposal; this is a business and legal decision. | tax | Norwegian price rules (prisopplysningsforskriften, markedsføringsloven) generally require consumer prices to include VAT. The English meaning is kept. (`plans.footnote` and `plans.matrixCaption` are not rendered; the FAQ and the Help page are.) | REQUIRES OWNER/LEGAL APPROVAL |
| nb 4a | `legal.docs.refunds.metaDescription` | Refusjon hos SYGMA TV+: gratis prøveperiode på 24 timer, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett i EU og Storbritannia. | Refusjon hos SYGMA TV+: prøv gratis i 24 timer, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett (EU/UK), ingen automatisk fornyelse. | refund | « no automatic renewal » is missing. | NOT RENDERED (legal pages exist in English only) |
| nb 4b | Help › Refunds `description` | Refusjon hos SYGMA TV+: prøv gratis først, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett i EU og Storbritannia, og slik ber du om det. | Refusjon hos SYGMA TV+: prøv gratis først, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett for kunder i EU/UK. Slik ber du om det. | refund | « i EU » vs the English « for EU and UK customers ». See also nb 1. | REQUIRES OWNER/LEGAL APPROVAL |
| nb 5 | `consent.text` | Med ditt samtykke bruker vi informasjonskapsler (cookies) til å måle trafikken på nettstedet (…) og annonsekampanjene våre (markedsføring). Ingenting lagres før du har valgt. … | Hvis du samtykker, bruker vi informasjonskapsler (cookies) til å måle trafikken på nettstedet (Google Analytics, Microsoft Clarity) og effekten av annonsekampanjene våre (markedsføring). Ingenting lagres før du har valgt. … | consent-privacy | Correct today. « måle trafikken » is slightly narrower than « audience measurement ». | REQUIRES OWNER/LEGAL APPROVAL |
| nb 6 | `forms.consent`, `checkout.consentSub`, `checkout.consentLabel` | … Dataene slettes innen 12 måneder. | … Opplysningene dine slettes innen 12 måneder. | consent-privacy | Slightly more natural; needs privacy sign-off. | REQUIRES OWNER/LEGAL APPROVAL |

## Phase 11 observations for the owner (not from Phase 10, not counted above)

- **« 24/7 support in 6 languages »** (all 8 languages: `meta.homeDescription`, `benefits`, `plans.trust`, hero checks;
  About intro « 24/7 customer support in six languages »). These lines combine two verified facts: the support is
  24/7 (automated assistant), and the team speaks six languages. Read together, they could be taken to mean human
  help 24/7 in six languages. These are short layout-limited labels taken from the English source, so they were not
  changed. The detailed pages give the approved wording. **For owner review (marketing).**
- **sv `faq.eyebrow` « Svar direkt »** (English « Answers first »). It is the label above the FAQ and refers to the
  written answers, not to support reply times. Left unchanged.

## How NOT RENDERED was checked

`grep -rn` in `src/components`, `src/app` and `src/lib` (23 November 2026, branch `claude/p11-localization`):
- `footer.compliance`, `footer.compliance2`, `coverage.*`, `plans.extraStreams`, `plans.details`, `plans.footnote`,
  `plans.matrixCaption`, `checkout.intro`, `checkout.consentLabel`: no reference outside the dictionaries.
- `plans.terms.lifetime`: `PlanConfigurator` offers only `SIM_TERMS = TERMS.filter((t) => t !== 'lifetime')`, so the
  selected term (and the checkout label built from it) is never `lifetime`.
- `legal.docs.*` (meta descriptions, intros): `src/app/[locale]/legal/[doc]/page.tsx` generates and serves only the
  default locale (`en`). Other languages link to the English pages.
