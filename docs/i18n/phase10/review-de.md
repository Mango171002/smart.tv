# German (de) localisation review — SYGMA TV+

Files edited: `/home/user/p10/src/i18n/dictionaries/de.ts`, `/home/user/p10/src/content/de/info.ts` (nothing else; no git command run).
Limitations: this review was done by a language model, not a native German speaker. It needs a final pass by a native (DE/CH) copywriter before publication.

## Summary

- **Before: 7/10.** Grammar and formality (Sie) were sound, prices/NBSPs/qualifiers were correct and the gate passed. But the text had a recurring unidiomatic trial term („Test anfordern“, „der Test“, which reads like an exam or a medical test), calques („ein echtes Team“, „ein echter Mensch“, „Alles sichtbar“, „Nichts, was Sie nicht brauchen“, „Wählen Sie … „Kontakt““ for *select*), English em dashes instead of the German Gedankenstrich (–), several sentence fragments in meta descriptions, a few grammar slips (shared adjective across genders, „dauert … Schritte“, missing modal verb, „Ihres“), and inconsistent terms (Paket/Tarif, Zahlungsoptionen/Zahlungsmethoden, „Rechtliche Dokumente“/„Rechtsdokumente“).
- **After: 8.5/10.** One term per concept, German typography, and natural form and CTA wording. What still keeps it below 9 is the legal and commercial wording I was not allowed to change (see „Needs owner/legal approval“, especially the plan-card line „Verlängert sich nicht“), plus a few style choices a native should confirm.
- **Changes:** 91 edits (42 in de.ts, 49 in info.ts). No key, placeholder, `**bold**` pair, href, id, slug, icon, figure, price or NBSP was changed. No length-limited string got longer: `nav.*`, `footer.chips`, plan features, taglines, notes, banner checks and `meta.homeTitle` are untouched. `benefits[3].title` and `plans.compare.included` changed at the same length.
- **Gate (all green after the edits):** `I18N_LANG=de npx vitest run tests/unit/translations.test.ts` → 16/16 passed. `npx tsc --noEmit | grep -E "dictionaries/de|content/de"` → no output. `npx vitest run tests/unit/language-switcher.test.ts` → 10/10 passed.
- **`LANGUAGE_LABEL.de` in `/home/user/p10/src/i18n/switcher.ts` = 'Sprache':** correct and natural (report only, not edited). It is consistent with `nav.language` = 'Anzeigesprache' (the aria label).

## Changes made

The before and after columns show the exact segment that was replaced (enough to locate it uniquely in the file). ␣ = non-breaking space; ⏎ = line break inside the replaced segment.

| key path | before | after | reason |
|---|---|---|---|
| de.ts · `meta.plansDescription` | Vergleichen Sie Laufzeiten und die Zahl gleichzeitig | Vergleichen Sie Laufzeiten und die Anzahl gleichzeitig | „Anzahl“ is the standard term (used everywhere else on the site). |
| de.ts · `meta.devicesDescription` | Unterstützte Gerätekategorien und so funktioniert die Einrichtung. | Unterstützte Gerätekategorien und Ablauf der Einrichtung. | Ungrammatical mix of noun phrase and clause. |
| de.ts · `hero.lead` | Filme, Serien und Live-TV auf Ihrem Fernseher, Smartphone und Computer — zuerst kostenlos testen, und ein echtes Team richtet alles mit Ihnen über WhatsApp ein. | Filme, Serien und Live-TV auf Ihrem Fernseher, Smartphone und Computer – mit kostenlosem Testzugang vorab und persönlicher Einrichtung durch unser Team per WhatsApp. | Calque „ein echtes Team“; German dash (–); „per WhatsApp“ as everywhere else. |
| de.ts · `benefits[3].title` | { title: 'Kostenloser Test', text: 'Erst testen, dann zahlen' } | { title: 'Kostenlos testen', text: 'Erst testen, dann zahlen' } | „Test“ alone reads as an exam/check; same wording as the header CTA (same length, 16). |
| de.ts · `featured.items[6].alt` | alt: 'Niedlicher 3D-Roboter und Fuchs beobachten | alt: 'Ein niedlicher 3D-Roboter und ein Fuchs beobachten | Grammar: the adjective/article must not be shared by two nouns of different gender. |
| de.ts · `plans.sub` | 'Filme, Serien und Live-TV, in HD bis 4K je nach Verfügbarkeit.' | 'Filme, Serien und Live-TV in HD bis 4K, je nach Verfügbarkeit.' | Comma placement: qualifier attaches to the quality range. |
| de.ts · `plans.compare.included` | feature: 'Leistung', ⏎       included: 'Inklusive', | feature: 'Leistung', ⏎       included: 'Enthalten', | Pairs with „Nicht enthalten“ (table aria-labels); same length. |
| de.ts · `plans.trust[3].text` | text: 'Alles sichtbar, bevor Sie kaufen' | text: 'Alles auf einen Blick, bevor Sie kaufen' | Idiomatic; „Alles sichtbar“ is a calque. |
| de.ts · `plans.extraStreams` | Preise für 1 Gerät. Zusätzliches Gerät (bis zu 4): | Preise für 1 Gerät. Jedes weitere Gerät (bis zu 4): | Idiomatic price-list wording. |
| de.ts · `content.categories[3].text` | 'Natur, Geschichte, Wissenschaft und wahre Geschichten' | 'Natur, Geschichte, Wissenschaft und wahre Begebenheiten' | Avoids „Geschichte … Geschichten“; „wahre Begebenheiten“ is the German idiom for true stories. |
| de.ts · `devices.title` | 'Gemacht für Ihre Lieblingsbildschirme.' | 'Gemacht für Ihre Lieblingsgeräte.' | „Lieblingsbildschirme“ is an unnatural coinage. |
| de.ts · `devices.sub` | Prüfen Sie Ihr Gerät mit dem kostenlosen Test. | Prüfen Sie Ihr Gerät mit dem kostenlosen Testzugang. | Terminology: free trial = „kostenloser Testzugang“. |
| de.ts · `devices.checklistTitle` | 'Mit dem kostenlosen Test können Sie prüfen' | 'Mit dem kostenlosen Testzugang können Sie prüfen' | Terminology. |
| de.ts · `preview.title` | 'Ein Erlebnis auf jedem Bildschirm.' | 'Dasselbe Erlebnis auf jedem Bildschirm.' | „Ein Erlebnis“ reads as „an (exciting) event“; „one = the same“ intended. |
| de.ts · `how.sub` | 'Alles, was Sie brauchen. Nichts, was Sie nicht brauchen.' | 'Alles, was Sie brauchen. Nichts Überflüssiges.' | Literal calque replaced by the German idiom (shorter). |
| de.ts · `how.steps[0].text` | text: 'Wählen Sie Ihr Paket' } | text: 'Wählen Sie Ihren Tarif' } | Terminology: plan = „Tarif“ („Paket“ is reserved for the content bundle). |
| de.ts · `cta.text` | je nach Verfügbarkeit — ab {price}/Monat. | je nach Verfügbarkeit – ab {price}/Monat. | German dash (Gedankenstrich –). |
| de.ts · `cta.trial` | trial: 'Kostenlosen Test anfordern', | trial: 'Jetzt kostenlos testen', | Natural German CTA (shorter); „Test anfordern“ sounds like ordering an exam. |
| de.ts · `blog.empty` | 'Noch keine Artikel — schauen Sie bald wieder vorbei.' | 'Noch keine Artikel – schauen Sie bald wieder vorbei.' | German dash. |
| de.ts · `blog.metaDescription` | 'SYGMA TV+ Blog: Einrichtungsanleitungen | 'Blog von SYGMA TV+: Einrichtungsanleitungen | „SYGMA TV+ Blog“ is an English-style compound (German would need hyphens). |
| de.ts · `faq.items[0].a` | senden Sie das kurze Bestellformular: Unser Team | senden Sie das kurze Bestellformular ab: Unser Team | Verb: „ein Formular absenden“. |
| de.ts · `faq.items[0].a (2)` | Sie können auch zuerst einen kostenlosen Test anfordern. | Sie können auch zuerst einen kostenlosen Testzugang anfordern. | Terminology. |
| de.ts · `faq.items[1].a` | Fordern Sie einen kostenlosen Test an, um den Dienst | Fordern Sie einen kostenlosen Testzugang an, um den Dienst | Terminology. |
| de.ts · `faq.items[2].a` | Fordern Sie einen kostenlosen Test an, um Ihr Gerät zu prüfen. | Fordern Sie einen kostenlosen Testzugang an, um Ihr Gerät zu prüfen. | Terminology. |
| de.ts · `help.supportTitle` | 'Brauchen Sie Hilfe oder einen Test?' | 'Brauchen Sie Hilfe oder einen Testzugang?' | Terminology. |
| de.ts · `help.supportSub` | Stellen Sie Ihre Frage oder fordern Sie einen Test an: | Stellen Sie Ihre Frage oder fordern Sie einen Testzugang an: | Terminology. |
| de.ts · `request.trialTitle` | trialTitle: 'Test anfordern', | trialTitle: 'Testzugang anfordern', | Terminology. |
| de.ts · `request.namePlaceholder` | namePlaceholder: 'Ihr vollständiger Name', | namePlaceholder: 'Ihr Vor- und Nachname', | Standard German form wording. |
| de.ts · `request.trialIntro` | unser Team meldet sich wegen Ihres Tests bei Ihnen. | unser Team meldet sich wegen Ihres Testzugangs bei Ihnen. | Terminology. |
| de.ts · `request.nameLabel` | nameLabel: 'Vollständiger Name', | nameLabel: 'Vor- und Nachname', | Standard German form label (matches placeholder). |
| de.ts · `request.errors.generic` | consent: 'Bitte stimmen Sie zu, wegen Ihrer Anfrage kontaktiert zu werden.', ⏎       rateLimited: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.', ⏎       generic: 'Etwas ist schiefgelaufen. | consent: 'Bitte stimmen Sie zu, wegen Ihrer Anfrage kontaktiert zu werden.', ⏎       rateLimited: 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.', ⏎       generic: 'Da ist etwas schiefgelaufen. | More natural German error message. |
| de.ts · `forms.successSupport` | 'Vielen Dank — Ihre Frage wurde erfasst.' | 'Vielen Dank – Ihre Frage wurde erfasst.' | German dash. |
| de.ts · `forms.successWaitlist` | 'Vielen Dank — Sie stehen auf unserer Liste.' | 'Vielen Dank – Sie stehen auf unserer Liste.' | German dash. |
| de.ts · `forms.errors.generic` | unavailable: 'Dieses Formular ist vorübergehend nicht verfügbar.', ⏎       generic: 'Etwas ist schiefgelaufen. | unavailable: 'Dieses Formular ist vorübergehend nicht verfügbar.', ⏎       generic: 'Da ist etwas schiefgelaufen. | More natural German error message. |
| de.ts · `checkout.headSub` | 'Hinterlassen Sie Ihre Daten: Unser Team aktiviert Ihren Zugang schnell.' | 'Geben Sie Ihre Daten an – unser Team aktiviert Ihren Zugang schnell.' | „Daten hinterlassen“ is a calque of „leave your details“ for a form field set. |
| de.ts · `checkout.doneTitle` | doneTitle: 'Bestellung erhalten!', | doneTitle: 'Bestellung eingegangen!', | Idiomatic confirmation wording. |
| de.ts · `checkout.errors.region` | region: 'Bitte wählen Sie Ihr Land.', | region: 'Bitte wählen Sie Ihr Land aus.', | Standard form wording („auswählen“). |
| de.ts · `checkout.errors.generic` | unavailable: 'Bestellungen sind vorübergehend nicht möglich.', ⏎       generic: 'Etwas ist schiefgelaufen. | unavailable: 'Bestellungen sind vorübergehend nicht möglich.', ⏎       generic: 'Da ist etwas schiefgelaufen. | More natural German error message. |
| de.ts · `legal.docs.terms.intro` | 'Die Regeln für die Nutzung von SYGMA TV+ — in klarer Sprache, | 'Die Regeln für die Nutzung von SYGMA TV+ – in klarer Sprache, | Typography only (German dash); wording unchanged. |
| de.ts · `legal.docs.terms.metaDescription` | 'SYGMA TV+ Nutzungsbedingungen in klarer Sprache: Bestellung, Gratis-Test, | 'Nutzungsbedingungen von SYGMA TV+ in klarer Sprache: Bestellung, Testzugang, | Brand compound fixed; trial terminology. List of topics unchanged. |
| de.ts · `legal.docs.privacy.intro` | 'Was wir erheben, warum, und Ihre Rechte — kurz gefasst.' | 'Was wir erheben, warum, und Ihre Rechte – kurz gefasst.' | Typography only (German dash). |
| de.ts · `footer.legalLanguageNote` | 'Rechtliche Dokumente sind auf Englisch verfügbar.' | 'Rechtsdokumente sind auf Englisch verfügbar.' | One term with the Help pages („Rechtsdokumente“); shorter. |
| info.ts · `ORDER_STEPS[1].title` | { title: 'Bestellung senden', text: | { title: 'Bestellung absenden', text: | Verb: „absenden“. |
| info.ts · `ORDER_STEPS[1].text` | Sie erhalten eine E-Mail, die den Eingang Ihrer Bestellung bestätigt. | Sie erhalten eine Eingangsbestätigung per E-Mail. | Standard German term „Eingangsbestätigung“. |
| info.ts · `ORDER_STEPS[5].text` | 'Sobald wir Ihre Zahlung erhalten und bestätigt haben, erhalten Sie eine E-Mail mit Ihrer Bestellnummer | 'Sobald Ihre Zahlung bei uns eingegangen und bestätigt ist, erhalten Sie eine E-Mail mit Ihrer Bestellnummer | Removes „erhalten … erhalten“ repetition; same facts. |
| info.ts · `CONFIRMATION_EMAIL` | const CONFIRMATION_EMAIL = 'Sobald wir Ihre Zahlung erhalten und bestätigt haben, erhalten Sie | const CONFIRMATION_EMAIL = 'Sobald Ihre Zahlung bei uns eingegangen und bestätigt ist, erhalten Sie | Same repetition fix. |
| info.ts · `about.description` | 'SYGMA TV+ ist eine Marke für digitale Unterhaltung der Sygma TV LLC, 2026 in den USA gegründet. | 'SYGMA TV+ ist eine Marke der Sygma TV LLC für digitale Unterhaltung, 2026 in den USA gegründet. | Ambiguous genitive („Unterhaltung der Sygma TV LLC“). |
| info.ts · `about.sections.who[1].p` | 'Die Tarife laufen jährlich (12, 24 oder 36 Monate), mit 1 Gerät inklusive und bis zu 4 Geräten. Vor dem Kauf können Sie den Dienst mit einem kostenlosen Test auf | 'Die Tarife laufen jährlich (12, 24 oder 36 Monate); 1 Gerät ist inklusive, bis zu 4 sind möglich. Vor dem Kauf können Sie den Dienst mit einem kostenlosen Testzugang auf | Clumsy construction; trial terminology. |
| info.ts · `about.sections.who[0].p` | `SYGMA TV+ — „One World. Endless Entertainment.“ — ist | `SYGMA TV+ – „One World. Endless Entertainment.“ – ist | German dashes. |
| info.ts · `about.sections.how[0].p` | und ein echter Mensch aus unserem Team übernimmt alles Weitere per WhatsApp. | und ein Mitglied unseres Teams kümmert sich persönlich per WhatsApp um alles Weitere. | Calque „ein echter Mensch“; „persönlich“ keeps the „real person“ meaning. |
| info.ts · `about.sections.how[2].p` | `Noch unsicher? Fordern Sie zuerst einen kostenlosen ${TRIAL_ADJ}-Test an: nichts zu bezahlen, nichts zu kündigen.` | `Noch unsicher? Fordern Sie zuerst einen kostenlosen ${TRIAL_ADJ}-Testzugang an: Sie zahlen nichts und müssen nichts kündigen.` | Terminology; full sentence instead of infinitive fragments. |
| info.ts · `about.sections.payment[0].p` | Wir aktivieren zuerst Ihr Abo — in der Regel ${F.usualActivation} — und Sie | Wir aktivieren zuerst Ihr Abo – in der Regel ${F.usualActivation} – und Sie | German dashes. |
| info.ts · `about.sections.payment[2].note` | per WhatsApp abgewickelt — keine wird automatisch | per WhatsApp abgewickelt – keine wird automatisch | German dash. |
| info.ts · `about.sections.links[0].text` | text: 'Test, Bestellung, Geräte, Erstattungen' } | text: 'Testzugang, Bestellung, Geräte, Erstattungen' } | Terminology. |
| info.ts · `hub.metaTitle` | metaTitle: 'Hilfe-Center: Test, Bestellung und Erstattung', | metaTitle: 'Hilfe-Center: Testzugang, Bestellung, Erstattung', | Terminology (60 chars with brand). |
| info.ts · `hub.description` | 'Antworten zum kostenlosen Test von SYGMA TV+, | 'Antworten zum kostenlosen Testzugang von SYGMA TV+, | Terminology. |
| info.ts · `hub.intro` | `Klare Antworten zu kostenlosem Test, Bestellung, Zahlung, Geräten und Erstattungen. | `Klare Antworten zum kostenlosen Testzugang, zu Bestellung, Zahlung, Geräten und Erstattungen. | Grammar (article) and terminology. |
| info.ts · `hub.popular[2].q` | q: 'Ist der Test wirklich kostenlos?' | q: 'Ist der Testzugang wirklich kostenlos?' | Terminology. |
| info.ts · `topics.getting-started.description` | bis zum Streamen: kostenloser Test, Bestellformular, | bis zum Streamen: kostenloser Testzugang, Bestellformular, | Terminology. |
| info.ts · `topics.getting-started.intro` | 'Der Einstieg dauert nur wenige Schritte. Sie können mit einem kostenlosen Test beginnen oder direkt bestellen.' | 'Der Einstieg gelingt in wenigen Schritten. Sie können mit einem kostenlosen Testzugang beginnen oder direkt bestellen.' | „dauert … Schritte“ is a collocation error; terminology. |
| info.ts · `topics.getting-started.steps[0].text` | 'Wählen Sie im Bereich Tarife den Tarif, die Laufzeit | 'Wählen Sie im Bereich „Tarife“ Ihren Tarif, die Laufzeit | Section name in quotes; avoids „Tarife den Tarif“. |
| info.ts · `topics.getting-started.steps[1]` | { title: 'Test oder Bestellung', text: 'Fordern Sie einen kostenlosen Test an oder | { title: 'Testzugang oder Bestellung', text: 'Fordern Sie einen kostenlosen Testzugang an oder | Terminology. |
| info.ts · `topics.getting-started.steps[3].text` | aktivieren wir zuerst Ihr Abo — in der Regel | aktivieren wir zuerst Ihr Abo – in der Regel | German dash. |
| info.ts · `topics.getting-started.steps[4].text` | 'Installieren Sie die App, geben Sie Ihre Zugangsdaten ein und starten Sie einen Stream.' | 'Installieren Sie die App, geben Sie Ihre Zugangsdaten ein und starten Sie die Wiedergabe.' | Natural German („einen Stream starten“ is jargon). |
| info.ts · `topics.getting-started.good-to-know[1]` | 'Sie bezahlen nach der Aktivierung Ihres Abos, mit einer Zahlungsmethode | 'Sie bezahlen nach der Aktivierung Ihres Abos mit einer Zahlungsmethode | Superfluous comma. |
| info.ts · `topics.getting-started.good-to-know[2]` | 'Ein kostenloser Test pro Kunde.', ⏎         'Jeder Tarif enthält 1 Gerät; Sie können weitere hinzufügen, bis zu 4.', | 'Ein kostenloser Testzugang pro Kunde.', ⏎         'Jeder Tarif enthält 1 Gerät; Sie können weitere hinzufügen, insgesamt bis zu 4.', | Terminology; „insgesamt“ makes the existing 4-device total unambiguous (same rule as „1 inklusive, bis zu 4“). |
| info.ts · `topics.devices.description` | Wie viele Geräte möglich sind und wie Sie Ihres prüfen. | Wie viele Geräte möglich sind und wie Sie Ihr Gerät prüfen. | Awkward pronoun „Ihres“. |
| info.ts · `topics.devices.intro` | Mit dem kostenlosen Test prüfen Sie Ihr eigenes Gerät | Mit dem kostenlosen Testzugang prüfen Sie Ihr eigenes Gerät | Terminology. |
| info.ts · `topics.devices.categories[1].p` | sagt Ihnen unser Team, welche App Sie auf Ihrem Gerät installieren, und hilft | sagt Ihnen unser Team, welche App Sie auf Ihrem Gerät installieren sollen, und hilft | Missing modal verb. |
| info.ts · `topics.devices.quality.p` | Eine stabile Verbindung — idealerweise per Netzwerkkabel oder mit dem Gerät nahe am WLAN-Router — macht | Eine stabile Verbindung – idealerweise per Netzwerkkabel oder mit dem Gerät nahe am WLAN-Router – macht | German dashes. |
| info.ts · `topics.devices.check.p` | `Fordern Sie einen kostenlosen ${TRIAL_ADJ}-Test an: Sie testen den Dienst | `Fordern Sie einen kostenlosen ${TRIAL_ADJ}-Testzugang an: So testen Sie den Dienst | Terminology. |
| info.ts · `topics.free-trial.name/title` | slug: 'free-trial', name: 'Kostenloser Test', icon: 'calendar', ⏎     title: 'Der kostenlose Test', ⏎     metaTitle: 'Kostenloser Test: So testen Sie SYGMA TV+', | slug: 'free-trial', name: 'Kostenloser Testzugang', icon: 'calendar', ⏎     title: 'Der kostenlose Testzugang', ⏎     metaTitle: 'Testzugang: So testen Sie SYGMA TV+ kostenlos', | Terminology (metaTitle 57 chars with brand). |
| info.ts · `topics.free-trial.description` | So fordern Sie den Test an – nichts zu zahlen, nichts zu kündigen.` | So fordern Sie den Testzugang an – nichts zu zahlen, nichts zu kündigen.` | Terminology. |
| info.ts · `topics.free-trial.intro` | `Mit dem kostenlosen Test können Sie SYGMA TV+ | `Mit dem kostenlosen Testzugang können Sie SYGMA TV+ | Terminology. |
| info.ts · `topics.free-trial.request[0].text` | text: 'Wählen Sie oben auf einer beliebigen Seite „Kostenlos testen“.' } | text: 'Klicken Sie oben auf einer beliebigen Seite auf „Kostenlos testen“.' } | „Wählen“ for „select“ a button is a calque. |
| info.ts · `topics.free-trial.request[1].text` | text: 'Ihr vollständiger Name, Ihre E-Mail-Adresse | text: 'Ihr Vor- und Nachname, Ihre E-Mail-Adresse | Matches the form label. |
| info.ts · `topics.free-trial.cost.p` | 'Ja. Eine Testanfrage ist kostenlos und unverbindlich. Der Test endet von selbst: Sie müssen nichts kündigen. Ein kostenloser Test pro Kunde.' | 'Ja. Eine Testanfrage ist kostenlos und unverbindlich. Der Testzugang endet von selbst: Sie müssen nichts kündigen. Ein kostenloser Testzugang pro Kunde.' | Terminology only. |
| info.ts · `topics.free-trial.check.title` | title: 'Was sollte ich während des Tests prüfen?' | title: 'Was sollte ich während des Testzeitraums prüfen?' | Terminology: the period = „Testzeitraum“. |
| info.ts · `topics.ordering-payment.description` | dann zahlen Sie. Die Zahlungsmethoden. | dann zahlen Sie. Zahlungsmethoden erklärt. | Sentence fragment („Payment methods explained“); exactly 155 chars. |
| info.ts · `topics.ordering-payment.order.p` | Wählen Sie im Bereich Tarife „Jetzt bestellen“, um zu beginnen. | Klicken Sie zum Start im Bereich „Tarife“ auf „Jetzt bestellen“. | Calque „wählen“; section name in quotes. |
| info.ts · `topics.ordering-payment.pay.p` | 'Sie bezahlen, nachdem Ihr Zugang aktiviert wurde — nie auf dieser Website. Hier werden weder eine Zahlung noch Kartendaten verlangt: Unser Team sendet Ihnen die Zahlungsoptionen per WhatsApp. Akzeptierte Methoden:' | 'Sie bezahlen, nachdem Ihr Zugang aktiviert wurde – nie auf dieser Website. Hier werden weder eine Zahlung noch Kartendaten verlangt: Unser Team sendet Ihnen die Zahlungsmethoden per WhatsApp. Akzeptierte Zahlungsmethoden:' | German dash; one term „Zahlungsmethoden“. |
| info.ts · `topics.ordering-payment.activation.p` | ${F.usualActivation} — ein üblicher Wert, keine Garantie. | ${F.usualActivation} – ein üblicher Wert, keine Garantie. | German dash. |
| info.ts · `topics.ordering-payment.emails[0]` | 'Direkt nach dem Absenden des Formulars: eine E-Mail, die den Eingang Ihrer Bestellung bestätigt.' | 'Direkt nach dem Absenden des Formulars: eine Eingangsbestätigung per E-Mail.' | Standard term „Eingangsbestätigung“. |
| info.ts · `topics.ordering-payment.prices.p` | bevor Sie Ihre Bestellung senden. Längere Laufzeiten kosten weniger pro Jahr: Die aktuellen Preise finden Sie im Bereich Tarife. | bevor Sie Ihre Bestellung absenden. Längere Laufzeiten kosten weniger pro Jahr: Die aktuellen Preise finden Sie im Bereich „Tarife“. | Verb „absenden“; section name in quotes. |
| info.ts · `topics.troubleshooting.stutter.p` | 'Starten Sie Ihren Internet-Router und Ihr Gerät neu. | 'Starten Sie Ihren Router und Ihr Gerät neu. | „Internet-Router“ is redundant in German. |
| info.ts · `topics.troubleshooting.mobile.title` | title: 'Die Wiedergabe stoppt bei mobilen Daten' | title: 'Die Wiedergabe bricht über mobile Daten ab' | Natural German phrasing. |
| info.ts · `topics.contact-support.description` | `Erreichen Sie den Support von SYGMA TV+ ${F.supportHours} per E-Mail, WhatsApp oder Kontaktformular, in sechs Sprachen. Was Sie für eine schnellere Antwort angeben.` | `Support von SYGMA TV+: ${F.supportHours} per E-Mail, WhatsApp oder Kontaktformular, in sechs Sprachen – und was Sie für eine schnellere Antwort angeben sollten.` | Sentence fragment fixed; shortened to stay ≤ 155 (148 rendered). |
| info.ts · `topics.contact-support.reach[2]` | 'Das Kontaktformular: Wählen Sie „Kontakt“ unten auf einer beliebigen Seite.' | 'Kontaktformular: Klicken Sie unten auf einer beliebigen Seite auf „Kontakt“.' | Calque „wählen“; list style matches „E-Mail: …“. |
| info.ts · `ui.hubContact` | 'Keine Antwort gefunden? Schreiben Sie uns — nennen Sie | 'Keine Antwort gefunden? Schreiben Sie uns – nennen Sie | German dash. |
| info.ts · `ui.content.related` | related: 'Verwandte Seiten', | related: 'Weiterführende Seiten', | „Verwandte Seiten“ is a calque of „related pages“. |
| info.ts · `ui.actions.trial` | actions: { trial: 'Kostenlosen Test anfordern', | actions: { trial: 'Jetzt kostenlos testen', | Same CTA as the home page (shorter). |

## Terminology

| Concept (EN) | German term enforced | Notes |
|---|---|---|
| plan | **Tarif** (pl. Tarife) | „Paket“ only for the content bundle (Basis-/Erweitertes/Komplett-Paket) |
| subscription | **Abo** | „Abo abschließen“; „Streaming-Abo“ |
| free trial (the offer you request) | **kostenloser Testzugang** | gets login details, so „Zugang“; „Testanfrage“ = the request (email subject) |
| trial period | **Testzeitraum** | „während des Testzeitraums“ |
| trial CTA | **Kostenlos testen** / **Jetzt kostenlos testen** | header keeps „Kostenlos testen“ |
| try before you pay | Erst testen, dann zahlen | |
| money-back guarantee | **Geld-zurück-Garantie** („7 Tage Geld-zurück-Garantie“) | short chip: „7 Tage Geld zurück“ |
| withdrawal right | **Widerrufsrecht** („14-tägiges Widerrufsrecht“) | see the approval item for the refunds page, which still says „14 Tage Widerruf“ |
| refund | **Erstattung** | |
| activation | **Aktivierung** / aktivieren | |
| order / order form | **Bestellung** / Bestellformular, „absenden“ | |
| order received (email) | **Eingangsbestätigung** | |
| login details | **Zugangsdaten** | |
| payment method | **Zahlungsmethode** | „Zahlungsoptionen“ removed |
| support | **Support** (Support-Team) | standard German industry term |
| usually (times) | **in der Regel** (tile: „Meist“) | never a guarantee |
| where available | **je nach Verfügbarkeit** | fixed qualifier |
| device | **Gerät** | „Bildschirm“ only where the English means the screen itself |
| on WhatsApp | **per WhatsApp** | |
| legal documents | **Rechtsdokumente** („auf Englisch“) | |
| help centre | **Hilfe-Center** | |
| full name (forms) | **Vor- und Nachname** | |
| optional (forms) | **freiwillig** | |
| data never sold | **Kein Datenverkauf** / „Wir verkaufen Ihre Daten nie.“ | |
| free (tight labels) | „gratis“ only where length forces it (+30 Tage gratis, chip „Gratis testen“, home description); otherwise „kostenlos“ | |

## Needs owner/legal approval

I did **not** change any of these. Each one touches a commercial promise, a legal statement, a consent or privacy text, or a claim.

1. **`plans.tiers.{starter,plus,ultra}.features[3].text` 'Verlängert sich nicht'.** **High priority.** In German this reads as „cannot be renewed“, but the English means „no automatic renewal“ (customers may renew manually). Proposed: **'Läuft automatisch aus'** (21 characters, the same length), or 'Ohne Auto-Verlängerung' (22, at the limit).
2. **`plans.tiers.ultra.features[1].text` 'Die **größte** Auswahl'.** The English „Our widest selection“ is relative to our own plans; the German can read as an absolute market superlative. The French precedent („Sélection la plus large“) was accepted. Options: 'Unsere **größte** Auswahl' (23 characters, over the 22 limit) or '**Maximale** Auswahl' (17).
3. **`plans.details[3].text` (Erstattung).** Proposed: 'Erst kostenlos testen, dann volle Erstattung, wenn Sie sie innerhalb von 7 Tagen nach der Aktivierung beantragen. Gesetzliche Widerrufsrechte gelten immer.' The changes are „diese … verlangen“ → „sie … beantragen“, which is more natural German with the same meaning.
4. **info `topics.refunds` › `withdrawal.p` 'Sie haben zusätzlich 14 Tage Zeit für Ihren Widerruf.'** Proposed: 'Sie haben zusätzlich ein 14-tägiges Widerrufsrecht.' This uses the same legal term as the FAQ and About pages.
5. **Refund meta descriptions** (`legal.docs.refunds.metaDescription` and info `topics.refunds.description`). The text has the brand order „SYGMA TV+ Erstattungen“, the informal „keine Auto-Verlängerung“ and „14 Tage Widerruf“. Proposed: 'Erstattungen bei SYGMA TV+: 24 Stunden gratis testen, 100␣% zurück binnen 7 Tagen ab Aktivierung, 14 Tage Widerrufsrecht (EU, UK), keine automatische Verlängerung.' Check that it stays at 155 characters or fewer, and shorten if needed. Also `topics.refunds.summary`: use „–“ instead of the comma.
6. **`consent.text` 'Vor Ihrer Auswahl wird nichts gesetzt.'** Proposed: 'Bevor Sie eine Auswahl treffen, werden keine Cookies gesetzt.' This is clearer, with the same meaning, but it is consent text.
7. **„Auf dieser Website wird nichts abgebucht“** (`checkout.offerText`, `checkout.intro`, `checkout.productionNote`, and several places in info.ts). „abgebucht“ suggests a bank debit specifically. Proposed: „Auf dieser Website bezahlen Sie nichts.“ or „Auf dieser Website erfolgt keine Zahlung.“ This is a business statement, so the owner should choose.
8. **`plans.terms.lifetime` 'Lebenslang' and `plans.extraStreams` '+{life} lebenslang'.** „Lebenslang“ also evokes a life sentence, and a „lifetime“ promise has legal weight in DE. Options are „Lifetime“ (common in DE marketing) or „Dauerhaft“. „Unbefristet“ would change the legal meaning, so the owner should decide.
9. **info `topics.ordering-payment` › `contract.p` 'Der Vertrag beginnt, wenn …'.** The idiomatic German legal phrase is „Der Vertrag kommt zustande, wenn unser Team Ihre Bestellung bestätigt.“ That is contract formation, which is legally not the same as „start“, so legal should confirm.
10. **`legal.docs.terms.metaDescription` „faire Nutzung“.** The usual German term is „Fair-Use-Regeln“ or „angemessene Nutzung“. Legal should confirm the term used in the (English) Terms. (I changed only the brand construction and the trial term in this string.)
11. **`footer.compliance2` 'Sendegenehmigungen'.** This is a licensing claim. Legal should confirm whether „Senderechte“, „Übertragungsrechte“ or „Lizenzen“ is the right term for „broadcasting authorisations“.
12. **Consent lines** (`forms.consent`, `checkout.consentSub`, `checkout.consentLabel`) 'Daten werden innerhalb von 12 Monaten gelöscht'. „Ihre Daten werden …“ would be more natural; unchanged because this is consent text.
13. **info `topics.devices` › `how-many.p` 'weitere Geräte hinzufügen, bis zu 4'.** Optional: add „insgesamt“, as I did in „Gut zu wissen“, so it reads as a total of 4 rather than 4 extra. I left this paragraph unchanged because it also contains the sharing and reselling prohibition.

## Unverified / for the native reviewer

- **„Testzugang“ instead of „Test“, „Probeabo“ or „Testabo“:** I chose it because the trial delivers login details and is not a subscription. A German copywriter should confirm the preference for this market.
- **„Smart TV“ vs „Smart-TV“:** Duden spells it „Smart-TV“, and the plural in prose is already „Smart-TVs“. I kept the singular „Smart TV“ because the brief lists it as a product name to keep. Decide whether prose should use „Smart-TV“.
- **„Multiscreen“** (footer chip, ≤ 13 characters): an anglicism, but I found no German alternative that fits. „Mehrere Geräte“ is 14 characters.
- **„Bestellreferenz“ vs „Bestellnummer“:** if they are the same identifier, use „Bestellnummer“ everywhere (more natural). Kept as is because the English also has two terms.
- **„Klicken Sie … auf“:** standard German web copy; on touch devices some sites prefer „tippen“/„wählen“.
- **Swiss readers write „ss“, not „ß“:** the brief mandates ß. No change.
- **Other style choices to confirm:** „News“ (waitlist, blog), „Hilfe-Center“ vs „Hilfecenter“, „Brotkrümelnavigation“ (aria label), and the headline-style fragment „Zahlungsmethoden erklärt.“ (ordering-payment description, exactly 155 characters).
- **`meta.homeTitle`** keeps the em dash „ — “ because the gate requires the prefix „SYGMA TV+ — “. Every other dash is now „ – “.
- **Process note:** the shared scratchpad folder `.../scratchpad/p10/` is used by several reviewers at once. My first backup `info.ts.orig` was overwritten by another language's agent (it now holds Norwegian). I rebuilt exact German baselines by reverse-applying my edits: `(review workspace) de-review-baseline-dict.ts` and `(review workspace) de-review-baseline-info.ts`. The edit script is `(review workspace) de_edits.py`.
