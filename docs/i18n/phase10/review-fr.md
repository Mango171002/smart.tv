# SYGMA TV+ French (fr) launch review: phase 10

Files edited: `/home/user/p10/src/i18n/dictionaries/fr.ts` (11 strings) and `/home/user/p10/src/content/fr/info.ts` (13 strings, including 2 that `ORDER_STEPS` shares between About and Help › Ordering). No key, placeholder, `**bold**` pair, href, id, slug, icon, price, figure or duration changed. Every figure is the same as the English (`french-consistency.test.ts` checks this). In the table, `~` stands for U+00A0.

## Summary

**Quality before: 8/10. After: 8.5/10.**

The typography was already clean when I started:
- U+00A0 before every `? ! : ;` and inside `« »`.
- Curly apostrophes `’` everywhere.
- `20~%` and `59~$~US`.

The register already used *vous* everywhere, and the key terms were already consistent. Phases 7B and 7D had fixed the main problems (« appareil » as the counting unit, « Multi-écrans », the price format and the hero sentence), and I did not undo any of those decisions.

What remained were calques and stiff phrasing, for example:
- « Combien ça coûte ? » (too casual)
- « Quels pays sont disponibles ? »
- « Une seule expérience sur tous les écrans »
- « Profitez de votre expérience »
- « Vérifiez le vôtre », where « le vôtre » has no clear noun to refer to
- « histoire… histoires vraies », which repeats a word
- « Démarrer ne prend que quelques étapes »
- « dans ma boutique »

Two legal meta descriptions were also too long: privacy (161 characters) and cookies (160). Both are now ≤ 155.

These are polish fixes, not corrections of mistakes. A native reviewer still has to confirm the remaining stylistic choices listed below.

## Changes made

| Key | Before | After | Reason |
|---|---|---|---|
| `fr.hero.lead` | … — avec d’abord un essai gratuit, et une vraie équipe qui vous accompagne… | … — avec un essai gratuit d’abord et une vraie équipe qui vous accompagne… | « avec d’abord » plus the comma before « et » read awkwardly; more natural word order, 1 character shorter |
| `fr.content.categories[3].text` | Nature, histoire, science et histoires vraies | Nature, histoire, sciences et faits réels | Avoids repeating « histoire/histoires »; « sciences » is the usual plural for documentary genres; shorter |
| `fr.devices.sub` | … Vérifiez le vôtre avec l’essai gratuit. | … Vérifiez votre appareil avec l’essai gratuit. | « le vôtre » had no noun to refer to (« appareil » is not in the sentence) |
| `fr.devices.checklist[2]` | Le nombre d’appareils pouvant regarder en même temps | Le nombre d’appareils utilisables en même temps | A device does not « regarder »; shorter |
| `fr.preview.title` | Une seule expérience sur tous les écrans. | La même expérience sur tous les écrans. | « Une seule expérience » is a calque of "One experience"; the intended meaning is "the same experience" |
| `fr.how.steps[3].text` | Profitez de votre expérience | Profitez de vos programmes | Calque of "Enjoy your experience"; shorter; no claim added |
| `fr.faq.items[1].q` | Quels pays sont disponibles~? | Dans quels pays le service est-il disponible~? | A country is not "available"; the service is available in a country |
| `fr.faq.items[3].q` | Combien ça coûte~? | Combien coûte l’abonnement~? | « ça » is too casual for a site that uses *vous* |
| `fr.forms.send` | Envoyer la question | Envoyer ma question | Matches the other first-person buttons (« Enregistrer mes choix », « Confirmer ma commande »); same length |
| `fr.legal.docs.privacy.metaDescription` (161 → 155) | … données collectées, utilisation, protection, durée de conservation et vos droits. Nous ne vendons jamais vos données. | … données collectées, usage, protection, durée de conservation et vos droits. Nous ne vendons jamais vos données. | Length limit; « usage » = "why we use it"; every item kept |
| `fr.legal.docs.cookies.metaDescription` (160 → 148) | … Les cookies facultatifs ne sont déposés qu’avec votre accord, modifiable à tout moment. | … Cookies facultatifs uniquement avec votre accord, modifiable à tout moment. | Was also over 155 (not flagged in the brief); same meaning, snippet style |
| `ORDER_STEPS[0].text` (About + Help › Ordering) | Choisissez la formule, la durée… | Sélectionnez la formule, la durée… | The step title already says « Choisissez votre formule » |
| `ORDER_STEPS[3].text` (About + Help › Ordering) | L’activation a lieu généralement dans l’heure… | L’activation a généralement lieu dans l’heure… | Natural adverb position; « généralement » (= "usually") kept |
| `ABOUT.sections[who].body[1].p` | Les formules sont annuelles (12, 24 ou 36 mois), pour 1 appareil inclus et jusqu’à 4. | Les formules sont annuelles (12, 24 ou 36 mois)~: 1 appareil inclus, jusqu’à 4 au choix. | « pour 1 appareil inclus et jusqu’à 4 » was ungrammatical; same facts (1 included, up to 4) |
| `ABOUT.sections[links].links[2].text` | Choisissez votre formule et voyez le prix | Choisissez votre formule et découvrez son prix | « voyez le prix » is clumsy |
| `HELP_HUB_FR.intro` | … Toujours bloqué~? Notre équipe est disponible 24/7. | … Besoin d’aide supplémentaire~? Notre équipe est disponible 24/7. | Calque of "Still stuck?"; also gender-neutral |
| `HELP_TOPICS_FR[getting-started].intro` | Démarrer ne prend que quelques étapes. … | Quelques étapes suffisent pour démarrer. … | Unnatural construction |
| `HELP_TOPICS_FR[devices].description` (148 → 152) | … Nombre d’appareils et vérification du vôtre. | … Nombre d’appareils et comment vérifier le vôtre. | Closer to "how to check yours"; still within 70–155 |
| `HELP_TOPICS_FR[free-trial].sections[request].steps[1].text` | Votre nom complet, votre adresse e-mail et votre numéro… du pays, et acceptez d’être contacté. | Indiquez votre nom complet, votre adresse e-mail et votre numéro… du pays, puis acceptez d’être contacté. | The sentence was a list of nouns followed by an imperative; now one consistent imperative sentence |
| `HELP_TOPICS_FR[ordering-payment].description` (148 → 154) | … puis vous payez. Les moyens de paiement. | … puis vous payez. Moyens de paiement détaillés. | The final fragment did not mean anything; closer to "Payment methods explained" |
| `HELP_TOPICS_FR[troubleshooting].sections[store].title` | Je ne trouve pas l’application dans ma boutique | Je ne trouve pas l’application dans la boutique d’applications | « ma boutique » reads as "my shop" |
| `HELP_TOPICS_FR[refunds].summary` | Satisfait ou remboursé 7 jours, comment demander. | Satisfait ou remboursé 7 jours~: la marche à suivre. | « , comment demander. » read as a broken fragment |
| `HELP_TOPICS_FR[refunds].sections[how].title` | Comment demander | Comment demander un remboursement | The heading alone had no object |
| `INFO_UI_FR.helpFacts[3].v` | Généralement < 1 h (plain spaces) | Généralement <~1~h | Non-breaking spaces so « < 1 h » cannot wrap across lines |

Not changed on purpose. These were checked and either kept or recorded as earlier decisions:
- « Sans reconduction »
- « TV en direct et VOD »
- « Fonction »
- « Idéale pour la plupart des foyers »: « meilleur rapport qualité-prix » is not allowed, because superlatives are banned by test
- « e-mail »
- the `59~$~US` price format
- « Multi-écrans »
- « Réponses rapides »
- `meta.homeDescription`: « essai gratuit de 24 h » would make it 157 characters, so « essai gratuit 24 h » stays

## Terminology

| Concept | French term (consistent everywhere) |
|---|---|
| plan | formule (« Recommandée », feminine) |
| free trial | essai gratuit (« essai gratuit de 24 h » / « pendant 24 heures ») |
| money-back guarantee | « Satisfait ou remboursé 7 jours », « remboursé à 100 % », « remboursement intégral » |
| withdrawal right | droit de rétractation (de 14 jours) |
| no automatic renewal | « ne se renouvellent jamais automatiquement »; on the plan cards « Sans reconduction » (22-character limit) |
| activation | activation / « active votre accès » |
| support | assistance (« Assistance 24/7 », « Contacter l’assistance »); « support » never appears in the French text |
| device (counting unit) | appareil; « écrans » only in the label « Multi-écrans » and for generic screens |
| login details | identifiants |
| contact details | coordonnées |
| email | e-mail (« adresse e-mail ») |
| bundle | bouquet (Essentiel / Étendu / Complet) |
| usually | généralement / habituel, always « non garanti » / « et non d’une garantie contractuelle » |

## Needs owner/legal approval

I did not apply any of these. Proposed wording only.

1. **`fr.footer.compliance2`** (licensing claim). « Chaque pays n’ouvre qu’une fois les autorisations de diffusion obtenues. » A country does not "open"; the service opens in a country. Proposed: « Le service n’ouvre dans chaque pays qu’une fois les autorisations de diffusion obtenues. » This goes from 72 to 88 characters, so the footer width needs checking. Also confirm that « obtenues » matches the English "in place".
2. **`fr.legal.docs.terms.metaDescription`** leaves out the English "fair use". Proposed (155 characters): « Conditions d’utilisation de SYGMA TV+ : commande, essai gratuit, formules et paiement, renouvellement, remboursements, usage raisonnable, droit applicable. » This drops « en langage clair ». The legal pages only render in English today, so this text is not shown.
3. **`fr.legal.docs.refunds.metaDescription`** leaves out the English "no automatic renewal". Proposed (153 characters): « Remboursements SYGMA TV+ : essai gratuit de 24 h, 100 % remboursé sous 7 jours après activation, rétractation de 14 jours (UE, R.-U.), sans reconduction. » This text is not rendered either, for the same reason.
4. **Help › Refunds, guarantee**: « sans justification » for "no questions asked". A more idiomatic option is « sans avoir à vous justifier ». The meaning is the same, but it is a refund promise.
5. **Help › Ordering, contract**: « Le contrat commence lorsque… ». The idiomatic legal phrasing is « Le contrat prend effet lorsque notre équipe confirme votre commande. »
6. **Help › Refunds, how**: « Vous êtes remboursé sous 14 jours, sur le moyen de paiement utilisé. » Optional: « …, via le moyen de paiement utilisé. »
7. **`fr.plans.details[3]`**: « Le droit légal de rétractation s’applique toujours. » This translates the English faithfully. Legal should confirm that "always" holds once a digital service has started (EU waiver rules); if it changes, the English has to change too.

## Unverified / for the native reviewer

- `featured.items[12].alt` « Joueuse de tennis »: the gender comes from the earlier translation and needs checking against the image. `items[0].alt` « maillots rouge et bleu »: if each team wears one colour, « rouges et bleus » is correct.
- « box Wi-Fi » / « box internet » (Help › Devices, Troubleshooting) is natural in France and Belgium. Canada and Switzerland say « routeur / modem ». This conflicts with the "no country-specific wording" rule. « routeur Wi-Fi » is a possible neutral option.
- « palet » (hockey alt text) is the France term; Québec says « rondelle ».
- `free-trial.description`: « Comment demander l’essai et la suite » is understandable but vague. There is no room under 155 for « ce qui se passe ensuite ».
- `coverage.title`: « Où nous sommes disponibles. » is a fragment, as in the English. A possible alternative is « Où le service est disponible. »
- `INFO_UI_FR.content.lastReviewed`: « Dernière révision : ». « Dernière mise à jour : » is more usual, but it does not mean exactly "reviewed".
- Masculine generic forms: « contacté », « inscrit », « satisfait », « remboursé ». The convention needs confirming.
- « conseils streaming », « abonnement(s) streaming »: common in marketing, but « de streaming » is the strictly grammatical form.
- « Envoi… » (button state) could be « Envoi en cours… » if the button width allows.
- `LANGUAGE_LABEL.fr` = « Langue » in `/home/user/p10/src/i18n/switcher.ts` is correct and natural as the switcher button and mobile section label, so no change is needed (report only). The aria label `nav.language` is « Langue d’affichage », which is also fine.

## Tests

- `npx vitest run tests/unit/french.test.ts`: passed (with `french-consistency.test.ts`: 25/25).
- `npx tsc --noEmit 2>&1 | grep -E "dictionaries/fr|content/fr"`: prints nothing.
- `npx vitest run` (full suite): 293–295 of 296 passed. The 1–3 failures are all in `translations.test.ts` and concern only **nl** (home description at 156 characters, About description at 157) and **sv** (`aboutFacts[1].small` still in English). The failure count changed between runs, which suggests other files were being edited at the same time. **No failure involves French**; `translations.test.ts` does not cover fr.
- No test, e2e spec or component references any of the French strings I changed (checked with grep).

*Limitations: this review was done by a language model (Claude), not a native French speaker. A native France-French reviewer should sign it off, ideally with a Canadian or Swiss check of the regional items above.*
