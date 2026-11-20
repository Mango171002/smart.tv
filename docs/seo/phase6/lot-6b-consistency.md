# Lot 6B — Cohérence éditoriale et préparation finale (20/11/2026)

Branche isolée `claude/seo-phase6b-consistency`, créée depuis le lot 6A `76d0e03` (branches 5C et 6A non
modifiées). **Rien n'est déployé ni fusionné.** Aucune migration. Prix, formules, simulateur, logique et statuts de
commande, API, e-mails, WhatsApp, Telegram, paiements, base de données et configuration de production : **non
modifiés**. Nouvelles pages toujours désactivées. `350882a` absent.

Parcours de référence (propriétaire) : 1) choix de l'abonnement → 2) formulaire de commande → 3) contact WhatsApp →
4) **activation avant paiement** → 5) **paiement après activation** → 6) commande marquée payée (« Converti ») **après
confirmation du paiement**.

---

## 1. Inventaire des incohérences détectées

| # | Où | Texte actuel | Problème | Traitement |
|---|---|---|---|---|
| I1 | **Fenêtre de commande** (étape « Review & confirm ») | « Nothing is charged on this site. Our team confirms your order and payment with you on WhatsApp. » | Ambigu : laisse penser que le paiement est réglé avant l'activation | **Corrigé** (§2) |
| I2 | **CGU §2** « How ordering works » (publiées) | « …our team contacts you on WhatsApp to confirm your order and payment, then activates your access. » | Paiement placé avant l'activation | Proposition juridique (§3) — non modifié |
| I3 | **CGU §4** « Plans, prices and payment » | « Payment is arranged with our team when your order is confirmed. » | Moment du paiement inexact | Proposition (§3) |
| I4 | **CGU §1** | « …and, once subscriptions open, the SYGMA TV+ streaming service. » | Formulation de pré-lancement | Proposition (§3) |
| I5 | **CGU §5**, politique de remboursement, FAQ, Help › Refunds | « within 7 days of activation » | Le délai commence avant le paiement (paiement après activation) | Question juridique (§3) |
| I6 | **E-mail automatique « How was your SYGMA TV+ trial? »** (relance 24 h après l'essai) | Points forts codés en dur : « Email support », « 7-day replay », « International channels », « 14-day replay » (`src/lib/email/plans.ts`) | Contredit l'accueil 6A (replay et chaînes internationales retirés, support 24/7) | **E-mails hors périmètre** : proposition (§4, E1) — non modifié |
| I7 | Même e-mail — slogans des formules | Repris du site : après déploiement de 6A, « Great value for most homes » et « The complete experience » remplaceront « The best balance » et « The ultimate experience » | Effet indirect du lot 6A sur un e-mail (aucun code e-mail modifié) — plutôt positif (moins de superlatifs) | À connaître avant déploiement |
| I8 | Même e-mail — texte | « We hope you enjoyed your favourite sports, movies, series and live TV. » | Mention des sports (droits non établis) | Proposition (§4, E2) |
| I9 | **CGU §3** « The Service » | « Live TV channels, sports, movies and series… Picture quality (HD to 4K HDR)… » | Sports et 4K HDR non prouvés | Proposition (§3) |
| I10 | **Fenêtre de commande** — ligne « Taxes $0.00 USD » ; formules « Prices … before taxes » ; Help « The final price, taxes included… » | — | Question fiscale (E1), pas éditoriale | Question pour le conseil fiscal (§3) |
| I11 | Accueil — « How it works » : Explore plans → Order → Get activated (« Quickly, on WhatsApp ») → Start watching | — | Cohérent mais ne mentionne pas le paiement (incomplet, pas faux) | Proposition facultative (§2.2) |
| I12 | Écran final de commande | « Our team will contact you on WhatsApp shortly to activate your access. A confirmation has been sent to {email}. » | Cohérent ; pourrait annoncer les instructions de paiement | Proposition facultative (§2.2) |
| I13 | Accueil — maillage | Aucun lien depuis le contenu de l'accueil vers About / Help (seulement en-tête et pied de page quand les pages seront actives) | Maillage interne faible | Proposition SEO (§5) |

**Cohérents (aucune action)** : accueil 6A (FAQ « you pay after activation »), About et Help center (activation puis
paiement, confirmation par e-mail après paiement), e-mail « Your order has been received! » (« guide you through the
activation process »), e-mail « Your subscription is now active! » (confirme le paiement : correct si « Converti » est
cliqué après confirmation du paiement, règle d'équipe), e-mails d'essai, `/api/health` (`assisted`, ventes
automatiques désactivées).

---

## 2. Textes corrigés (avant / après)

### 2.1 Modification appliquée (formulation éditoriale ambiguë)

| Où | Avant | Après |
|---|---|---|
| Fenêtre de commande, étape « Review & confirm » (`checkout.productionNote`) | Nothing is charged on this site. Our team confirms your order and payment with you on WhatsApp. | **Nothing is charged on this website. Once you confirm, our team contacts you on WhatsApp, activates your access, then sends you the payment instructions.** |

Formulaire, champs, boutons, étapes, prix, taxes affichées et comportement : inchangés (captures avant/après).

### 2.2 Propositions facultatives (non appliquées)

| Où | Actuel | Proposition |
|---|---|---|
| Écran final de commande (`checkout.doneText`) | Our team will contact you on WhatsApp shortly to activate your access. A confirmation has been sent to {email}. | Our team will contact you on WhatsApp shortly to activate your access and share the payment instructions. A confirmation has been sent to {email}. |
| Accueil « How it works », étape 3 | Get activated — Quickly, on WhatsApp | Get activated — On WhatsApp, then you pay |
| Accueil « How it works », étape 4 | Start watching — Enjoy your experience | (inchangé) |

---

## 3. Propositions juridiques à faire valider (non validées juridiquement)

> **Ces formulations ne sont pas juridiquement validées.** Elles décrivent le parcours réel et doivent être revues
> par un juriste avant toute publication. Les CGU et la politique de remboursement publiées ne sont pas modifiées.

| Document | Texte publié | Proposition |
|---|---|---|
| CGU §1 | These Terms govern your use of sygmatv.com and, once subscriptions open, the SYGMA TV+ streaming service. … | These Terms govern your use of sygmatv.com and of the SYGMA TV+ streaming service. … |
| CGU §2 | …our team contacts you on WhatsApp to confirm your order and payment, then activates your access. The contract starts when we confirm your order. | Trial requests are free and create no obligation; one free trial per customer. When you order on the site, nothing is charged there. Our team contacts you on WhatsApp to confirm your order, then activates your access. You pay after activation, using one of the payment methods offered by our team. Your order is recorded as paid only once your payment has been received and confirmed; we then send you an email confirming your subscription, with your order number. The contract starts when we confirm your order. |
| CGU §3 | Live TV channels, sports, movies and series on compatible devices. … Picture quality (HD to 4K HDR) depends on your plan… | Live TV, movies and series on compatible devices. Content depends on the licences available in each country and may change. Picture quality depends on your plan, the content, your device and your internet connection. |
| CGU §4 | …Payment is arranged with our team when your order is confirmed. … | …Payment is arranged with our team on WhatsApp and is due once your access has been activated; no payment is taken on the website. … |
| CGU §5 / politique de remboursement | …within 7 days of activation… | …within 7 days of your payment… (décision du propriétaire, soumise au juriste) |

**Questions pour l'examen juridique**
1. **Rétractation (UE / R-U)** : point de départ des 14 jours (conclusion du contrat, avant le paiement) ; recueil du
   consentement exprès à l'exécution immédiate d'un service numérique et information sur la perte éventuelle du
   droit de rétractation ; remboursement au prorata après le début de l'exécution.
2. **Remboursement** : 7 jours « à compter du paiement » vs « de l'activation » ; articulation avec les 14 jours.
3. **Fourniture de services numériques avant paiement** : délai de paiement, suspension de l'accès si le paiement
   n'arrive pas (délai à fixer par le propriétaire), conséquences contractuelles.
4. **Moment de formation du contrat** : « when we confirm your order » reste-t-il adapté ?
5. **Taxes** : « before taxes » / « Taxes $0.00 USD » / « final price, taxes included » — règles fiscales par pays.
6. **Essai unique par client** : clause à ajouter.

---

## 4. Affirmations nécessitant une vérification (sports, contenus, chaînes)

Aucun visuel remplacé, aucune section supprimée. Alternatives neutres proposées pour validation.

| # | Où | Texte / visuel | Vérification nécessaire | Alternative neutre proposée |
|---|---|---|---|---|
| S1 | Accueil, catégories | Carte « Sports » (« Depending on the channels available in your country ») + photo de baseball | Droits sportifs par pays | Garder avec preuve ; sinon remplacer la carte par « Entertainment » (ex. « Shows, music and more ») avec un visuel non sportif |
| S2 | Accueil, carrousel « Highlights » | 6 tuiles sportives : Football night, Basketball, American football, Ice hockey, Motorsport, Tennis (photos d'action) | Droits par discipline | Remplacer par des genres non sportifs (Music, Travel, Cooking, Reality) ou réduire à une tuile « Sports — where available » |
| S3 | Carrousel | Mention « International » sur les 15 tuiles | Disponibilité internationale des genres | Retirer la mention ou la remplacer par « Varies by country » |
| S4 | Carrousel | Genres films/séries (Anime, Comedy, Crime series, Fantasy series, Adventure film, Animation, Kids & family, Family fantasy, Documentaries) | Droits VOD (A9) | Ajouter sous le carrousel : « Genres shown as examples. What is available depends on your country. » |
| S5 | Accueil, catégories | « Live TV — Channels organised by region, depending on your country » + présentatrice TV | Droits de retransmission (A5/A6) | Garder (déjà qualifié) ; preuve requise pour toute liste de chaînes |
| S6 | Formules | « Essential / Extended / Complete bundle », « Our widest selection » | Composition réelle des bouquets par formule | Décrire les bouquets une fois les contrats confirmés |
| S7 | Formules | « +30 days free » (Plus, Ultra+) | Conditions et durée de l'offre (E2) | Ajouter conditions / date de fin |
| S8 | Formules | 4K / HDR / guide TV (qualifiés « where available ») | Preuve technique (B1, A8) | Déjà prudent |
| S9 | Appareils | Smart TV, Android TV, Fire TV, Apple TV, Mobile & tablet, PC & Mac | Application disponible et testée par plateforme (B4) | Garder les catégories ; noms de plateformes après vérification |
| S10 | CGU §3 (lecture seule) | « sports », « HD to 4K HDR » | Idem S1/S8 | §3 ci-dessus |
| S11 | E-mail de relance d'essai (lecture seule) | « favourite sports, movies, series and live TV » ; « 7-day replay », « 14-day replay », « International channels », « Email support » | Idem + cohérence avec le site | **E1** : remplacer les points forts par « Essential bundle · HD & Full HD · 24/7 support » / « Extended bundle · 4K Ultra HD · 24/7 support » / « Complete bundle · 4K Ultra HD & HDR · 24/7 support » ; **E2** : « We hope you enjoyed your movies, series and live TV. » — lot e-mails séparé, sur autorisation |
| S12 | Image de partage (Open Graph) | « One World. Endless Entertainment. — International streaming subscription » | — | Cohérente (slogan) ; à aligner sur le titre 6A lors d'une prochaine refonte (facultatif) |

---

## 5. Cohérence SEO (build avec l'URL de production)

| Page | Title | Description | H1 | Données structurées | Liens internes (contenu) |
|---|---|---|---|---|---|
| `/` | SYGMA TV+ — Streaming subscription for TV, mobile & computer (60) | 147 car. | Premium streaming. Movies, Series, Live TV. | Organization (foundingDate 2026, 6 langues) + WebSite | `/legal/refunds`, `/legal/privacy` |
| `/about` *(désactivée)* | About us: company, support and commitments \| SYGMA TV+ (54) | 144 | About SYGMA TV+ | BreadcrumbList + AboutPage | Help, contact, CGU, remboursement, mentions |
| `/help` *(désactivée)* | Help center: trials, orders, devices and refunds \| SYGMA TV+ (60) | 142 | Help center | BreadcrumbList + CollectionPage | 7 sujets, About, CGU, remboursement |
| `/help/ordering-payment` | Ordering and payment: how it works \| SYGMA TV+ (46) | 146 | Ordering and payment | BreadcrumbList + WebPage | Help, sujets voisins, CGU |

Constats :
- Un seul H1 par page, titres et descriptions uniques, discours identique (activation puis paiement, 24/7, 6 langues).
- Accueil : dans le HTML, les H3 des cartes de formules et du simulateur apparaissent après le dernier H2 (contenu
  diffusé en flux par Next.js) ; l'ordre visuel est correct et ce n'est pas un problème d'indexation — aucune action.
- **Maillage (proposition)** : quand le Help center sera publié, ajouter sous la FAQ de l'accueil un lien « More
  answers in our Help center » → `/help`, et dans la réponse « Can I subscribe now? » un lien vers
  `/help/ordering-payment`.
- Help hub : les 7 cartes n'ont pas de titre de section ; proposition : H2 « Help topics » (facultatif).

---

## 6. Fichiers modifiés (lot 6B)

| Fichier | Modification |
|---|---|
| `src/i18n/dictionaries/en.ts` | `checkout.productionNote` (1 ligne) |
| `tests/unit/home-claims.test.ts` | Test : la note de la fenêtre de commande décrit activation puis instructions de paiement |
| `docs/seo/phase6/lot-6b-consistency.md` | Ce document |

---

## 7. Résultats des tests

| Contrôle | Résultat |
|---|---|
| TypeScript | OK |
| ESLint | 0 erreur (4 avertissements identiques à la production) |
| Unitaires | **124/124** |
| E2E mode `off` (ordinateur + mobile ; commande, simulateur, prix, axe, analytics, 404, responsive) | **163 réussis, 0 échec** — avec Inter et **sans Inter** (conditions de la CI) |
| E2E mode `preview` (About, Help, responsive 9 pages × 7 largeurs, statut commercial) | **46 réussis, 0 échec** |
| Accessibilité axe WCAG 2.1 AA | **0 violation** : accueil + 9 pages (ordinateur + mobile) ; fenêtre de commande, étape de vérification (ordinateur + mobile) |
| SEO | §5 |
| Aucun changement fonctionnel | Formulaire, champs, boutons, étapes, prix, taxes affichées : identiques (tests E2E de commande + captures) |

## 8. Comparaison avec la production (`864f703`), mode `off`, 169 URL

| Groupe | Pages | Origine |
|---|---|---|
| Accueil : titre, description, H1, textes, formules, FAQ (liens), JSON-LD, texte de la fenêtre de commande | `/`, `/?utm_source=x` | Lots 6A + 6B |
| Pied de page (slogan, texte, pastille « HD to 4K » retirée) | `/blog`, 5 pages légales, `/legal/terms?gclid=t` | Phase 5C |
| `/api/health` : `mode: "assisted"` (ventes automatiques toujours désactivées) | API | Phase 5C |
| Nouvelles pages | `/about` 404, `/help` → `/#faq` (inchangé) | Désactivées |
| Toutes les autres URL | — | Identiques |

## 9. Points bloquants avant publication

1. **CGU §1–§5 et politique de remboursement** alignées sur « activation puis paiement » (§3), après avis juridique —
   sinon l'accueil, la fenêtre de commande et les nouvelles pages contredisent les CGU publiées.
2. **Sports / contenus** (S1–S4) : décision sur les droits, ou alternatives neutres.
3. **E-mail de relance d'essai** (I6–I8) : lot e-mails séparé, sur autorisation — sinon il continue d'annoncer le
   replay et les chaînes internationales.
4. **Questions fiscales** (I10).
5. Point de départ du délai « activation en moins d'une heure » (confirmation de la commande sur WhatsApp).
6. Votre autorisation explicite ; ordre recommandé : 5C + 6A + 6B ensemble, mode `off`, puis activation des pages.
