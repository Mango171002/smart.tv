# SYGMA TV+ — Italian (it-IT) localisation review, phase 10

Files edited: `src/i18n/dictionaries/it.ts` and `src/content/it/info.ts`. No other file was touched and no git command was run.
Backups of the files as they were before this review: `(review workspace) esit-review/orig/it.dict.ts` and `.../orig/it.info.ts`.

Gates:
- `I18N_LANG=it npx vitest run tests/unit/translations.test.ts`: 16/16 passed.
- `npx tsc --noEmit | grep -E "dictionaries/(es|it)|content/(es|it)"`: printed nothing.

## Summary

**Quality before: 8/10. After: 8.5–9/10.**

Before: the phase-8 Italian was already good: natural, consistent « tu », a correct « dove disponibile » qualifier, `59 USD` with a non-breaking space, and good commercial idioms (« Soddisfatti o rimborsati », « Nessun tacito rinnovo », « Senza vincoli »). Remaining problems:
- **Typography:** English curly quotes “…” in four help texts, and French-style spaced guillemets « … » in the cookie banner. Italian uses «…» without spaces.
- **Inconsistent spelling:** « Multi-dispositivo » (hyphenated) next to « Multischermo » for the same concept.
- **Odd negation:** « non è temporaneamente disponibile » means "is not temporarily available".
- **Calques and awkward phrasing:**
  - « Prima le risposte ».
  - « si placcano ».
  - « fino al −30% ».
  - « possono guardare » with devices as the subject.
  - « fa più differenza ».
  - « sullo stesso metodo di pagamento ».
  - « che conferma che ».
- **Tense:** present tense where the future fits (« Quando abbiamo ricevuto… ricevi »).
- **A label clash:** « Domande frequenti » was used for the Help hub's popular questions as well as the FAQ.
- **Gender:** « Non sei ancora sicuro? » is masculine-only.
- **Repetition:** « tutto … tutto » in the hero lead.

After: these are fixed. No figure, promise, price, duration, device count or legal statement changed. Refund, withdrawal and consent sentences got only grammar or typography fixes (a preposition); substantive rewordings are proposed for approval below.

## Changes made

### `src/i18n/dictionaries/it.ts` (19 entries)

| Key path | Before | After | Reason |
|---|---|---|---|
| `consent.text` | …da « Impostazioni cookie ». | …da «Impostazioni cookie». | Italian guillemets take no inner spaces (that is French typography) |
| `hero.lead` | …— con una prova gratuita prima di tutto e un team vero che ti aiuta a configurare tutto su WhatsApp. | …— con una prova gratuita per iniziare e un team in carne e ossa che ti aiuta a configurare tutto su WhatsApp. | « tutto … tutto » repetition; « team vero » is flat. Same meaning, no sport |
| `hero.checks[2]` | Multi-dispositivo | Multischermo | One term per concept; footer chip (≤ 13) can only be « Multischermo »; shorter |
| `benefits[2].title` | Multi-dispositivo | Multischermo | Same reason (shorter, ≤ 20) |
| `faq.highlights[1]` | Multi-dispositivo | Multischermo | Same reason |
| `featured.items[5].alt` | …maglie arancioni e verdi si placcano in campo | …maglie arancioni e verdi impegnati in un placcaggio in campo | « placcarsi » (reflexive) is unnatural |
| `featured.items[10].alt` | Auto da corsa nera e verde lime affronta una curva… | Auto da corsa nera e verde lime che affronta una curva… | Fragment without a relative; aligned with the other alt texts (« Megattera che salta… ») |
| `plans.tiers.plus.note` | Il piano che consigliamo · 4K e Guida TV dove disponibile. | …· 4K e guida TV dove disponibile. | Lowercase mid-sentence (same length) |
| `plans.tiers.ultra.note` | Il piano più completo · 4K/HDR e Guida TV dove disponibile. | …· 4K/HDR e guida TV dove disponibile. | Same as above |
| `plans.simulatorPoints[0]` | Più lunga è la durata, più risparmi: fino al −{pct}%. | Più a lungo ti abboni, più risparmi: fino al {pct}% in meno. | « fino al −30% » is not idiomatic; same figure and placeholder |
| `devices.checklist[2]` | Quanti dispositivi possono guardare contemporaneamente | Quanti dispositivi puoi usare contemporaneamente | Devices do not « guardare »; same meaning |
| `blog.empty` | Ancora nessun articolo — torna presto. | Ancora nessun articolo. Torna a trovarci presto. | English-style dash; idiomatic closing |
| `faq.eyebrow` | Prima le risposte | Togliti ogni dubbio | Calque of "Answers first"; the sub-title already says « Risposte rapide… » |
| `faq.items[0].a` | …e attiva il tuo accesso, e paghi dopo l’attivazione. | …e attiva il tuo accesso; tu paghi dopo l’attivazione. | « , e … , e » chain; activation-then-payment order unchanged |
| `forms.errors.unavailable` | Questo modulo non è temporaneamente disponibile. | Questo modulo è temporaneamente non disponibile. | Negation scope (the old wording meant "not temporarily available") |
| `checkout.errors.unavailable` | Gli ordini non sono temporaneamente disponibili. | Gli ordini sono temporaneamente non disponibili. | Same as above |
| `forms.successSupport` | Grazie — la tua domanda è stata registrata. | Grazie, la tua domanda è stata registrata. | English-style dash |
| `forms.successWaitlist` | Grazie — ora sei nella nostra lista. | Grazie, ora sei nella nostra lista. | English-style dash |
| `checkout.verifying` | Conferma del prezzo… | Conferma del prezzo in corso… | Shows it is a progress state (matches « Invio in corso… ») |

### `src/content/it/info.ts` (16 entries)

| Key path | Before | After | Reason |
|---|---|---|---|
| `about.sections.who.body[0].p` | SYGMA TV+ — “One World. Endless Entertainment.” — … | SYGMA TV+ — «One World. Endless Entertainment.» — … | Italian quotation marks |
| `about.sections.how.body[2].p` | Non sei ancora sicuro? Chiedi prima… | Hai ancora qualche dubbio? Chiedi prima… | Gender-neutral |
| `ORDER_STEPS[1].text` | …Nessun addebito su questo sito. Ricevi un’email che conferma… | …Riceverai un’email che conferma… | Future tense, consistent with the next steps |
| `ORDER_STEPS[4].title` | Paghi | Effettui il pagamento | A bare « Paghi » as a step title |
| `ORDER_STEPS[5].text` | Quando abbiamo ricevuto e confermato il tuo pagamento, ricevi un’email che conferma che il tuo abbonamento è attivo, con il numero d’ordine. | Quando avremo ricevuto e confermato il tuo pagamento, riceverai un’email con la conferma che il tuo abbonamento è attivo e il numero d’ordine. | Future tense; removes « che conferma che »; same content (still not an invoice) |
| `CONFIRMATION_EMAIL` | Quando abbiamo ricevuto… ricevi un’email che conferma che il tuo abbonamento è attivo, con il numero d’ordine e i dettagli dell’abbonamento. | Quando avremo ricevuto… riceverai un’email con la conferma che il tuo abbonamento è attivo, il numero d’ordine e i dettagli dell’abbonamento. | Same as above |
| `hub.description` | Risposte su prova gratuita SYGMA TV+, … | Risposte su prova gratuita di SYGMA TV+, … | Missing preposition (147 characters) |
| `topics[devices].sections.quality.body[0].p` | …è ciò che fa più differenza. | …è il fattore che conta di più. | « fare più differenza » is a calque |
| `topics[free-trial].sections.request.steps[0].text` | Seleziona “Prova gratuita” in alto su qualsiasi pagina. | Seleziona «Prova gratuita» in alto in qualsiasi pagina. | Quotation marks; preposition (« in qualsiasi pagina ») |
| `topics[ordering-payment].sections.order.body[0].p` | …seleziona “Ordina ora” nella sezione Piani. | …seleziona «Ordina ora» nella sezione Piani. | Quotation marks |
| `topics[troubleshooting].sections.still.body[0].p` | …indicando il modello del tuo dispositivo e con una foto dell’eventuale messaggio di errore: … | …indicando il modello del tuo dispositivo e allegando una foto dell’eventuale messaggio di errore: … | The two complements were not parallel; « di solito risponde » unchanged |
| `topics[contact-support].sections.reach.list[0]` | Via email: support@… | Email: support@… | Parallel with « WhatsApp o telefono: … » |
| `topics[contact-support].sections.reach.list[2]` | …seleziona “Contatti” in fondo a qualsiasi pagina. | …seleziona «Contatti» in fondo a qualsiasi pagina. | Quotation marks (matches `footer.contact`) |
| `topics[refunds].metaTitle` | Rimborsi: garanzia di 7 giorni e recesso | Rimborso entro 7 giorni e diritto di recesso | « garanzia » suggests a product warranty; fixed terms « diritto di recesso »; 56/60 characters with the suffix; same facts |
| `topics[refunds].sections.how.body[0].p` | …Ricevi il rimborso entro 14 giorni, sullo stesso metodo di pagamento che hai usato. | …con lo stesso metodo di pagamento che hai usato. | Wrong preposition; meaning unchanged |
| `ui.popular` | Domande frequenti | Domande più comuni | Clashed with the FAQ section name; "Popular questions" |

Unchanged on purpose:
- Every `nav.*` string, `footer.chips`, every plan-card feature line (including '**1 dispositivo** attivo'), every tagline, `plans.compare.*`, `meta.homeTitle`, and every price, figure, placeholder, `**bold**` pair, href, id, slug and icon.
- `hero.checks` and the benefit titles changed only to the shorter « Multischermo ».

## Terminology

| Concept | Italian term used | Notes |
|---|---|---|
| Free trial | **prova gratuita** | Consistent. « Prova gratis » survives only in `footer.chips[1]`, because « Prova gratuita » is 14 > 13. |
| Money-back guarantee | **Soddisfatti o rimborsati** (per 7 giorni) | The standard Italian commercial formula. « Rimborso entro 7 giorni » is used where a noun phrase is needed (trust chip, summaries, refunds meta title). « garanzia » is no longer used for this concept. |
| Withdrawal right | **diritto di recesso** (14 giorni) | Consistent. |
| Cancel | **disdire / disdetta** | Correct for subscriptions. « Rimborsi e disdette » is used throughout. |
| Plan / subscription | **piano** (tier) / **abbonamento** (the contract) | Consistent. |
| No automatic renewal | « Nessun tacito rinnovo » (card lines, ≤ 22) / « nessun rinnovo automatico », « non si rinnovano mai automaticamente » (running text) | Both are idiomatic and mean the same. The short form is kept because of the length limit. |
| Activation | **attivazione** | Consistent. |
| Support | **assistenza** (Centro assistenza, Contatta l’assistenza) | Consistent. |
| Multi-device | **Multischermo** | Unified (was mixed with « Multi-dispositivo »). |
| TV guide | « Guida TV (EPG) » as a label; « guida TV » lowercase mid-sentence | |
| Quotation marks | «…» without inner spaces | All “…” and « … » occurrences fixed. |
| Register | « tu » to the customer; customer-voice questions use **voi** for the company (« Conservate i miei dati personali? », « Quando rispondete? ») | In Italian, voi is the normal, neutral way to address a company. It does not clash with the brand's « tu », so it is kept on purpose. |

## Needs owner/legal approval

None of these is applied. Each proposed wording keeps the English meaning.

1. **`faq.items[4].a`.** « Chiedi entro 7 giorni… e ti rimborsiamo » has no object.
   Proposed: « I piani non si rinnovano mai automaticamente. Se lo chiedi entro 7 giorni dall’attivazione, ti rimborsiamo al 100%. I clienti di UE e Regno Unito mantengono inoltre il diritto di recesso di 14 giorni. »
2. **`topics[refunds].sections.guarantee.body[0].p`.** « senza domande » is a calque.
   Proposed: « Non sei soddisfatto? Chiedi il rimborso entro 7 giorni dall’attivazione e ti rimborsiamo al 100%, senza bisogno di giustificazioni. Un solo rimborso per cliente; non disponibile per gli account sospesi per condivisione o rivendita dell’accesso. »
3. **`footer.compliance2` (licensing statement).** In « Ogni paese viene aperto solo dopo aver ottenuto le autorizzazioni di trasmissione », the subject of « aver ottenuto » is unclear: grammatically it is the country.
   Proposed: « Apriamo il servizio in ciascun paese solo quando le autorizzazioni di trasmissione sono in vigore. »
4. **`forms.consent`, `checkout.consentMain`, `checkout.consentLabel` (consent).** « essere ricontattato/a » is idiomatic in Italian forms.
   Optional: « essere contattato/a » (the first contact is ours). Keep the « Dati cancellati entro 12 mesi » wording, or « I dati vengono cancellati entro 12 mesi ».
5. **Already applied, please confirm.** `topics[refunds].metaTitle` now reads « Rimborso entro 7 giorni e diritto di recesso ». It drops « garanzia » because "warranty" is a different legal concept in Italian. The facts (7 days, withdrawal) are unchanged.

## Unverified / for the native reviewer

- **Home and site titles.** `meta.siteTitle` / `meta.homeTitle` say « Abbonamento streaming TV, smartphone e computer ». « …streaming per TV… » would make `homeTitle` 63 > 60. Kept.
- **Masculine generic forms.** « Pronto a iniziare? » (`cta.title`) and « Non sei soddisfatto? » / « se non sei soddisfatto » remain. A gender-neutral alternative for the CTA would be « Vuoi iniziare a guardare? », which is longer.
- **Marketing word choices.** « Togliti ogni dubbio » (new FAQ eyebrow) and « un team in carne e ossa » (hero lead) are idiomatic choices; please confirm they fit the brand tone.
- **« La società dietro SYGMA TV+. »** (`legal.docs.imprint.intro`) is a slight calque of "the company behind". It is acceptable in modern marketing copy; kept.
- **« politica di rimborso »** in the FAQ link labels and `ui.refundPolicy`. It is widely used; « condizioni di rimborso » is an alternative.
- **Short labels.** « Lingua di visualizzazione » (`nav.language`), « Funzione » (`plans.compare.feature`), « Home » and « Menu » (allow-listed).
- **Swiss Italian.** No Swiss-specific terms are used. « dati cancellati », « paese » and « tasse » work for both Italy and Switzerland.
- **`LANGUAGE_LABEL.it`** in `src/i18n/switcher.ts` = « Lingua ». Correct; no change needed (report only, not edited).

_Limitations: this review was done by an AI model, not a native Italian speaker. A native it-IT reviewer should check it before publication._
