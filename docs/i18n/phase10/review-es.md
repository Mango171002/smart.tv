# SYGMA TV+ — Spanish (es-ES) localisation review, phase 10

Files edited: `src/i18n/dictionaries/es.ts` and `src/content/es/info.ts`. No other file was touched and no git command was run.
Backups of the files as they were before this review: `(review workspace) esit-review/orig/es.dict.ts` and `.../orig/es.info.ts`.

Gates:
- `I18N_LANG=es npx vitest run tests/unit/translations.test.ts`: 17/17 passed.
- `npx tsc --noEmit | grep -E "dictionaries/(es|it)|content/(es|it)"`: printed nothing.

## Summary

**Quality before: 7.5/10. After: 8.5/10.**

Before: the phase-8 Spanish was accurate and faithful. It followed the brief: Spain Spanish (móvil, ordenador), « tú », ¿…? ¡…!, « según disponibilidad », the reviewed date, `59 USD` with a non-breaking space, and legal links marked « (en inglés) ». The problems were:
- **Mixed terminology.** It used « garantía de devolución » where the agreed term is « garantía de reembolso ». It used « prueba gratis » everywhere, where the agreed term is « prueba gratuita ». It mixed « sitio / sitio web / web ».
- **Two « vosotros » forms** in the customer's voice: « ¿Guardáis…? » and « ¿Cuándo respondéis? ».
- **A few calques and clumsy phrasings:**
  - « equipo real » can be read as "royal team".
  - « placándose ».
  - « hasta un −30 % ».
  - « A disfrutar / Disfruta de… » repeats the same verb.
  - « pueden reproducir » has no object.
  - « empieza a reproducir ».
  - « es lo que más se nota ».
  - « ¿Sigues atascado? » is gendered.
  - « Preguntas populares ».
  - The badge « DOCS » means "documents" in Spanish.
  - The FAQ eyebrow and sub-title both said « Respuestas rápidas ».
  - English-style em dashes in short messages (« Gracias — … »).
- **Indicative instead of subjunctive** in « Cuando hemos recibido… recibes… », which refers to the future.

After: terminology is unified, the register is consistent, and the calques and grammar issues are fixed. No figure, promise, price, duration, device count or legal statement changed. Refund, withdrawal and consent sentences got terminology changes only; any rewording of their substance is proposed below for approval, not applied. The remaining points are cosmetic or limited by string length (see "Unverified").

## Changes made

### `src/i18n/dictionaries/es.ts` (34 entries)

| Key path | Before | After | Reason |
|---|---|---|---|
| `consent.analyticsText` | …y mejora del sitio (Google… | …y mejora de la web (Google… | Use « web » everywhere (Spain usage; already used in info.ts) |
| `common.prototypeNotice` | PRUEBA GRATIS · Pruébalo antes de pagar · Garantía de devolución de 7 días | PRUEBA GRATUITA · Pruébalo antes de pagar · Garantía de reembolso de 7 días | Terminology (prueba gratuita, garantía de reembolso) |
| `hero.lead` | …— primero con una prueba gratis, y con un equipo real que te ayuda a configurarlo todo por WhatsApp. | …— con una prueba gratuita para empezar y un equipo de verdad que te ayuda a configurarlo todo por WhatsApp. | « equipo real » is ambiguous (real = royal); clumsy « primero con…, y con… »; terminology. Same meaning, no sport |
| `featured.items[11].badge` | DOCS | DOCUMENTALES | « docs » means "documentos" in Spanish; Italian already uses the full word (11 px badge, fits) |
| `featured.items[5].alt` | …naranja y verde placándose en el campo | …naranja y verde haciendo un placaje en el campo | « placarse » (reflexive) is unnatural |
| `plans.trust[1].title` | Garantía de devolución | Garantía de reembolso | Terminology (shorter) |
| `plans.simulatorPoints[0]` | Cuanto más larga sea la duración, más ahorras: hasta un −{pct} %. | Cuanto más tiempo elijas, más ahorras: hasta un {pct} % menos. | « hasta un −30 % » is not idiomatic; same figure and placeholder |
| `plans.simulatorPoints[3]` | Primero, prueba gratis; garantía de devolución de 7 días. | Prueba gratuita primero y garantía de reembolso de 7 días. | « Primero, prueba gratis » can be read as an imperative; terminology |
| `plans.details[3].text` | Primero, prueba gratis; después, reembolso íntegro… | Primero, prueba gratuita; después, reembolso íntegro… | Terminology only; the refund and withdrawal wording is unchanged |
| `devices.sub` | …Compruébalo en el tuyo con la prueba gratis. | …con la prueba gratuita. | Terminology |
| `devices.checklistTitle` | Con la prueba gratis, puedes comprobar | Con la prueba gratuita puedes comprobar | Terminology; unnecessary comma |
| `devices.checklist[2]` | Cuántos dispositivos pueden reproducir a la vez | Cuántos dispositivos puedes usar a la vez | « reproducir » needs an object; same meaning |
| `how.steps[3]` | A disfrutar / Disfruta de tu experiencia | Empieza a ver / Disfruta de la experiencia | Title and text repeated « disfrutar »; closer to "Start watching" |
| `how.note` | Prueba gratis · Garantía de devolución de 7 días | Prueba gratuita · Garantía de reembolso de 7 días | Terminology |
| `cta.text2` | Primero, prueba gratis; garantía de devolución de 7 días. | Prueba gratuita primero y garantía de reembolso de 7 días. | Same as `simulatorPoints[3]` |
| `cta.trial` | Solicitar una prueba gratis | Solicitar una prueba gratuita | Terminology |
| `blog.empty` | Todavía no hay artículos — vuelve pronto. | Todavía no hay artículos. Vuelve pronto. | English-style dash |
| `faq.eyebrow` | Respuestas rápidas | Resuelve tus dudas | Duplicated the sub-title « Respuestas rápidas a… » |
| `faq.items[0].a` | …y activa tu acceso, y tú pagas después… También puedes pedir primero una prueba gratis. | …y activa tu acceso; tú pagas después… …una prueba gratuita. | « , y … , y » chain; terminology; activation-then-payment order unchanged |
| `faq.items[1].a` | Pide una prueba gratis para comprobar… | Pide una prueba gratuita para comprobar… | Terminology |
| `faq.items[2].a` | Pide una prueba gratis para comprobar tu dispositivo. | Pide una prueba gratuita… | Terminology |
| `faq.items[5].q` | ¿Guardáis mis datos personales? | ¿Se guardan mis datos personales? | Register decision (see Terminology); the answer is unchanged |
| `forms.successSupport` | Gracias — hemos registrado tu pregunta. | Gracias. Hemos registrado tu pregunta. | English-style dash |
| `forms.successWaitlist` | Gracias — ya estás en nuestra lista. | Gracias. Ya estás en nuestra lista. | English-style dash |
| `request.trialHeadHl` | prueba gratis | prueba gratuita | Terminology (headline « Solicita tu prueba gratuita ») |
| `checkout.offerTitle` | Garantía de devolución de 7 días | Garantía de reembolso de 7 días | Terminology |
| `checkout.offerText` | En este sitio no se cobra nada. | En esta web no se cobra nada. | « web » consistency (same length) |
| `checkout.trust[1]` | Devolución en 7 días | Reembolso en 7 días | Terminology (« devolución » alone suggests returning goods) |
| `checkout.intro` | En este sitio no se cobra nada. Nuestro equipo… | En esta web no se cobra nada. Nuestro equipo… | « web » consistency |
| `checkout.productionNote` | En este sitio web no se cobra nada. … | En esta web no se cobra nada. … | « web » consistency |
| `checkout.returnToSite` | Volver al sitio web | Volver a la web | « web » consistency (shorter) |
| `legal.docs.terms.metaDescription` | …pedido, prueba gratis, planes… | …pedido, prueba gratuita, planes… | Terminology (151 characters) |
| `legal.docs.refunds.intro` | Primero, prueba gratis; después, reembolso íntegro en un plazo de 7 días. | Primero, prueba gratuita; después, reembolso íntegro en un plazo de 7 días. | Terminology only |
| `footer.compliance` | Sin opiniones falsas · Prueba gratis · Garantía de devolución de 7 días · Precios transparentes | Sin opiniones falsas · Prueba gratuita · Garantía de reembolso de 7 días · Precios transparentes | Terminology |

### `src/content/es/info.ts` (36 entries)

| Key path | Before | After | Reason |
|---|---|---|---|
| `ORDER_STEPS[4]` (About « Cómo funciona » and Ordering steps) | Pagas / Cuando tu acceso ya está activo, pagas con uno de los métodos… | Realizas el pago / Una vez activo tu acceso, pagas con uno de los métodos… | A bare « Pagas » as a step title; lighter sentence; order unchanged |
| `ORDER_STEPS[5].text` | Cuando hemos recibido y confirmado tu pago, recibes un correo electrónico que confirma que tu suscripción está activa, con tu número de pedido. | Cuando hayamos recibido y confirmado tu pago, recibirás un correo electrónico en el que te confirmamos que tu suscripción está activa, con tu número de pedido. | Subjunctive after « cuando » with future meaning; removes « que confirma que » |
| `CONFIRMATION_EMAIL` (About payment, Ordering « emails ») | Cuando hemos recibido… recibes un correo electrónico que confirma que… | Cuando hayamos recibido… recibirás un correo electrónico en el que te confirmamos que… | Same as above; still "not a PDF invoice" |
| `about.description` | …Cómo funciona, compromisos y soporte. | …Cómo funciona, nuestros compromisos y el soporte. | Telegraphic (151 characters) |
| `about.sections.who.body[1].p` | …con una prueba gratis. | …con una prueba gratuita. | Terminology |
| `about.sections.how.body[2].p` | …Pide primero una prueba gratis de 24 horas… | …una prueba gratuita de 24 horas… | Terminology |
| `about.sections.commitments.list[2]` | Garantía de devolución de 7 días tras la activación; … | Garantía de reembolso de 7 días tras la activación; … | Terminology only; withdrawal wording unchanged |
| `about.sections.links.links[3].text` | Garantía de devolución de 7 días (en inglés) | Garantía de reembolso de 7 días (en inglés) | Terminology |
| `hub.description` | …la prueba gratis de SYGMA TV+, …, solución de problemas, … | …la prueba gratuita de SYGMA TV+, …, problemas técnicos, … | Terminology; « problemas técnicos » keeps it at 153 characters (≤ 155) |
| `hub.intro` | …¿Sigues atascado? Nuestro equipo… | …¿Todavía tienes dudas? Nuestro equipo… | Gender-neutral, more natural |
| `topics[getting-started].description` | …prueba gratis, formulario… | …prueba gratuita, formulario… | Terminology (153 characters) |
| `topics[getting-started].intro` | …con una prueba gratis o… | …con una prueba gratuita o… | Terminology |
| `topics[getting-started].sections.steps.steps[1].text` | Solicita una prueba gratis o… | Solicita una prueba gratuita o… | Terminology |
| `topics[getting-started].sections.steps.steps[4].text` | …introduce tus datos de acceso y empieza a reproducir. | …introduce tus datos de acceso e inicia la reproducción. | « empezar a reproducir » with no object; repeated the step title |
| `topics[getting-started].sections.good-to-know.list[2]` | Una sola prueba gratis por cliente. | Una sola prueba gratuita por cliente. | Terminology |
| `topics[devices].intro` | SYGMA TV+ se usa en teles, … Con la prueba gratis… | …en televisores, … Con la prueba gratuita… | Colloquial « teles » in the Help centre; terminology |
| `topics[devices].sections.quality.body[0].p` | …es lo que más se nota. | …es lo que más influye. | "makes the biggest difference": « se nota » is off |
| `topics[devices].sections.check.body[0].p` | Pide una prueba gratis de 24 horas: pruebas el servicio… | Pide una prueba gratuita de 24 horas: así pruebas el servicio… | Terminology; flow |
| `topics[free-trial].name` | Prueba gratis | Prueba gratuita | Terminology (cards, breadcrumbs) |
| `topics[free-trial].title` | La prueba gratis | La prueba gratuita | Terminology |
| `topics[free-trial].metaTitle` | Prueba gratis: cómo probar SYGMA TV+ | Prueba gratuita: cómo probar SYGMA TV+ | Terminology (50/60 characters with the brand suffix) |
| `topics[free-trial].intro` | La prueba gratis te permite… | La prueba gratuita te permite… | Terminology |
| `topics[free-trial].sections.cost.body[0].p` | …Una sola prueba gratis por cliente. | …Una sola prueba gratuita por cliente. | Terminology |
| `topics[ordering-payment].description` | Cómo pedir SYGMA TV+: envía el formulario de pedido, … Métodos de pago. | Cómo pedir SYGMA TV+: envía el formulario, … Te explicamos los métodos de pago. | The bare « Métodos de pago. » read like a list label ("Payment methods explained"); 154 characters |
| `topics[ordering-payment].sections.pay.body[0].p` | Aquí no se te pide ningún pago ni datos de tarjeta… | Aquí no te pedimos ningún pago ni datos de tarjeta… | « se te pide » is awkward; the company speaks as « nosotros » |
| `topics[troubleshooting].sections.still.body[0].p` | Contacta con nosotros 24/7 indicando el modelo de tu dispositivo y con una foto del mensaje de error: … | Contacta con nosotros 24/7 con el modelo de tu dispositivo y una foto del mensaje de error, si lo hay: … | The two complements were not parallel; « si lo hay » renders "any error message"; « normalmente responde en menos de una hora » unchanged |
| `topics[contact-support].description` | …Qué incluir para recibir respuesta antes. | …Qué incluir para que te respondamos antes. | More natural |
| `topics[contact-support].sections.availability.title` | ¿Cuándo respondéis? | ¿Cuándo responde el soporte? | Register decision; matches the hub question « ¿Cuánto tarda en responder el soporte? » |
| `topics[contact-support].sections.include.list[0]` | Tu referencia de pedido, si tienes una. | Tu referencia de pedido, si la tienes. | Calque of "if you have one" |
| `topics[refunds].description` | …prueba gratis primero, … | …prueba gratuita primero, … | Terminology (153 characters) |
| `topics[refunds].summary` | Garantía de devolución de 7 días y cómo pedirla. | Garantía de reembolso de 7 días y cómo solicitarlo. | Terminology; « pedirla » pointed at the guarantee, not the refund |
| `topics[refunds].sections.guarantee.title` | Garantía de devolución de 7 días | Garantía de reembolso de 7 días | Terminology (body unchanged, see approvals) |
| `ui.popular` | Preguntas populares | Preguntas habituales | Calque of "Popular questions" |
| `ui.aboutFacts[2].small` | Responde normalmente en menos de una hora | Suele responder en menos de una hora | More natural; still "usually", not a guarantee |
| `ui.topicContact` | ¿Sigues necesitando ayuda? … | ¿Necesitas más ayuda? … | More natural |
| `ui.actions.trial` | Solicitar una prueba gratis | Solicitar una prueba gratuita | Terminology (same as `cta.trial`) |

Unchanged on purpose: every `nav.*` string, `footer.chips`, every plan-card feature line, tagline and note, `plans.compare.*`, `hero.checks`, the benefit titles and texts, `meta.homeTitle`, and every price, figure, placeholder, `**bold**` pair, href, id, slug and icon.

## Terminology

| Concept | Spanish term used | Notes |
|---|---|---|
| Free trial | **prueba gratuita** | Used in all running text, headings, help pages and buttons. **« Prueba gratis »** stays only where the gratuita form does not fit the length limit: `nav.trial` (header width), `footer.chips[1]` (≤ 13), `benefits[3].title` (must not grow), `meta.homeDescription` (« prueba gratuita » makes it 156 > 155) and `legal.docs.refunds.metaDescription`. It also stays in the help step that quotes the header button: « Selecciona «Prueba gratis» ». The adjective in « ¿Es gratis de verdad? », « Solicitar una prueba es gratis » and « Prueba SYGMA TV+ gratis » is ordinary Spanish, not the product term. |
| Money-back guarantee | **garantía de reembolso** (de 7 días) | Replaces « garantía de devolución » everywhere (« devolución » suggests returning goods). The verb « te devolvemos el 100 % » stays where it is idiomatic. |
| Withdrawal right | **derecho de desistimiento** | Unchanged and consistent. |
| Refund / cancellation | reembolso / cancelación (« ¿Puedo cancelar? », « Reembolsos y cancelaciones ») | Unchanged. |
| Plan / subscription | **plan** (tier: Starter, Plus, Ultra+) / **suscripción** (the contract) | « abono » is not used, to avoid a third term. |
| Activation | **activación**, « activamos tu acceso / tu suscripción » | Unchanged. |
| Support | **soporte** (equipo de soporte, Contactar con soporte) | « atención al cliente » not introduced, to keep one term. |
| Website | **web** (« en esta web », « Volver a la web ») | Kept as is: footer column heading « Sitio » and the legal-notice phrase « sitio web publicado por ». |
| Multi-device | **Multipantalla** | Same in hero, benefits, FAQ highlights and footer chip. |
| Quotation marks | «…» | Already in use; no curly English quotes remain. |

**Register decision (« tú » / « vosotros »).** The brand speaks to the customer as **tú** and about itself as **nosotros**: « te contactamos », « nuestro equipo », « te respondemos ». « Vosotros » is correct Spain Spanish when a customer addresses the team. However, the FAQ and Help questions are written in the customer's voice, and the other questions are all first person singular or impersonal (« ¿Puedo cancelar? », « ¿Qué dispositivos son compatibles? », « ¿Cuánto tarda en responder el soporte? »). Two isolated « vosotros » forms therefore broke that uniformity. So the rule is now: **customer-voice questions are impersonal or first person singular; no « vosotros » anywhere.** This also keeps the copy neutral for readers outside Spain. Changed: `faq.items[5].q` and `topics[contact-support].sections.availability.title`. After the change, a scan for -áis / -éis forms finds none.

## Needs owner/legal approval

None of these is applied. Each proposed wording keeps the English meaning.

1. **`faq.items[4].a` (cancel / refund).** « Pídelo en los 7 días siguientes… » does not say what is being asked for.
   Proposed: « Los planes nunca se renuevan automáticamente. Si nos lo pides en los 7 días siguientes a la activación, te devolvemos el 100 %. Los clientes de la UE y del Reino Unido conservan además su derecho de desistimiento de 14 días. »
2. **`topics[refunds].sections.guarantee.body[0].p`.** « Pídelo » has the same problem, and « sin preguntas » is a calque of "no questions asked".
   Proposed: « ¿No estás satisfecho? Solicita el reembolso en los 7 días siguientes a la activación y te devolvemos el 100 %, sin tener que dar explicaciones. Un solo reembolso por cliente; no disponible para cuentas suspendidas por compartir o revender el acceso. »
3. **`topics[refunds].intro`.** « …si no quedas satisfecho, te devolvemos todo en los 7 días siguientes… » can be read as "we refund within 7 days" instead of "if you ask within 7 days".
   Proposed: « Primero pruebas y, si no quedas satisfecho en los 7 días siguientes a la activación, te reembolsamos el importe íntegro. La política completa está en nuestra página de Reembolsos (en inglés). »
4. **`legal.docs.refunds.metaDescription`.** « 100 % devuelto » is telegraphic. « prueba gratis » stays because of the length limit.
   Proposed (154 characters): « Reembolsos SYGMA TV+: prueba gratis de 24 h, reembolso del 100 % en 7 días tras activar, desistimiento de 14 días (UE y R. U.), sin renovación automática. »
5. **`footer.compliance2` (licensing statement).** « Cada país se abre solo cuando… » is unidiomatic.
   Proposed: « Solo abrimos el servicio en cada país cuando están vigentes las autorizaciones de emisión. »
6. **`forms.consent`, `checkout.consentSub`, `checkout.consentLabel` (consent and data retention).** « Datos eliminados en un plazo de 12 meses » is a telegraphic past participle.
   Proposed (optional): « …Tus datos se eliminan en un plazo de 12 meses. » and « …Mis datos se eliminarán en un plazo de 12 meses si no me suscribo. »
7. **`plans.details[3].text`.** « El derecho legal de desistimiento se aplica siempre » is fine.
   Optional, more idiomatic: « Siempre se respeta el derecho de desistimiento previsto por la ley. »
8. **Already applied, please confirm.** Renaming the guarantee from « Garantía de devolución » to « Garantía de reembolso », for consistency with the Spanish name the owner wants for the English "money-back guarantee" (legal pages are in English).

## Unverified / for the native reviewer

- **Home and site titles.** `meta.siteTitle` / `meta.homeTitle` say « Suscripción streaming para TV, móvil y ordenador ». « Suscripción de streaming » is more correct but makes `homeTitle` 64 > 60. Kept.
- **Plan-card limits.** « No se renueva solo » (feature line, « Sin renovación automática » is 25 > 22) and « Plan más completo · … » (note, the article would exceed the limit) are slightly telegraphic.
- **Other short labels.** `plans.compare.feature` « Función » (≤ 10). `nav.language` « Idioma de visualización ». `hero.pauseVideo` / `playVideo` say « vídeo del banner ».
- **Em dashes.** Spaced English-style « — » remains as a separator in about 20 longer sentences and in the required « SYGMA TV+ — » title prefix. Spanish norm is closed rayas (« —…— »). It is a typographic choice; please confirm.
- **Masculine generic forms.** « ¿No estás satisfecho? » and « si no quedas satisfecho » remain. `cta.title` « Es hora de empezar a ver. » avoids « ¿Listo…? » for the same reason.
- **Badge width.** « DOCUMENTALES » (12 characters) is the longest carousel badge. It should fit the 11 px badge, but check it visually at 320 px.
- **Device vocabulary.** « Reproductores y sticks de TV / de streaming » for "TV boxes & sticks", and « wifi » (lowercase, RAE).
- **Fact label.** « Fundación » for "Established"; « Año de fundación » is an option if the fact tile is wide enough.
- **`OWNER_FACTS.usualActivation`.** « en la hora siguiente a la confirmación de tu pedido por WhatsApp » is correct. An alternative is « en menos de una hora desde que confirmamos tu pedido por WhatsApp ». Owner fact; kept.
- **`LANGUAGE_LABEL.es`** in `src/i18n/switcher.ts` = « Idioma ». Correct and idiomatic; no change needed (report only, not edited).
- **Code comment.** A comment in `src/content/es/info.ts` line 15 still says « una prueba gratis de 24 horas ». Comment only, no output.

_Limitations: this review was done by an AI model, not a native Spanish speaker. A native es-ES reviewer should check it before publication._
