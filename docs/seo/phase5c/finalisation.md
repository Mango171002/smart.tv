# Phase 5C — Finalisation About us, Help center et contenu SEO (20/11/2026)

> **Mise à jour** : le parcours a été corrigé (activation avant paiement) après l'audit du parcours commercial —
> voir `audit-parcours-commercial.md` et `corrections-validees.md`, qui priment sur ce document.

**Statut : préparé et testé dans la branche isolée `claude/seo-phase5c-preview` (base production `864f703`).
Rien n'est déployé, fusionné ni publié.** Interrupteur `NEXT_PUBLIC_CONTENT_PAGES` non défini par défaut (= `off`) :
en production, les pages n'existent pas et le site reste identique, sauf la correction du pied de page (§5), qui ne
sera livrée qu'avec votre autorisation.

## 1. Informations M1–M10 : traitement dans les pages

| # | Information validée | Utilisée ? | Formulation retenue / raison |
|---|---|---|---|
| M1 | Visa/Mastercard, PayPal, USDT/Binance, virement, Western Union, MoneyGram | **Oui** (About §6, Ordering §2) | Liste en pastilles + « Every method is arranged manually by our team — none is charged automatically on this website. Our team confirms which method applies to your order. » **Vérifié dans le code** : le site ne demande ni paiement ni carte (`CheckoutDialog` envoie une demande ; paiement géré par l'équipe). Aucun paiement automatique n'existe aujourd'hui. |
| M2 | Activation < 1 h après confirmation du paiement | **Oui** | « usually activated within an hour after your payment is confirmed » — jamais « instant » (test bloquant). |
| M3 | Support 24/7, réponse habituelle < 1 h | **Oui** | « available 24/7 and usually replies in under an hour. This is our usual reply time, not a contractual guarantee. » |
| M4 | Assistance EN, FR, AR, DE, ES, IT | **Oui** | 6 pastilles + « the website itself is in English ». |
| M5 | Un seul essai gratuit par client | **Oui** (Getting started, Free trial) | « One free trial per customer ». ⚠ Les CGU ne le disent pas (voir §3). |
| M6 | Facture PDF envoyée par e-mail | **Non** | **Non vérifiable dans le code** : aucune génération ni pièce jointe PDF. L'e-mail d'activation (flux Telegram « Converti ») contient numéro de commande, montant payé, statut « Paid » (HTML). Les pages disent seulement : « an email confirming your subscription, with your order number and the amount paid ». |
| M7 | IPTV Smarters Pro, IBO Player | **Non** | Non vérifiés (fiche Google Play `com.nst.iptvsmarterstvbox` : 404 ; site iptvsmarters.com injoignable ; IBO Player : tarification/activation inconnues). Aucun nom d'application ni guide non testé n'est publié (test bloquant). |
| M8 | Marchés FR, BE, CH, UK, CA, US, DE, ES, IT, NL | **Non** | Droits non vérifiés : aucune liste de pays dans les pages (test bloquant sur les noms de pays). La section « Where is SYGMA TV+ offered? » a été retirée de Getting started. |
| M9 | Site en ligne, commandes acceptées | **Partiellement** | Les pages décrivent le parcours de commande au présent. Contradictions relevées (§3), CGU non modifiées. |
| M10 | SYGMA TV+, créée en 2026, États-Unis, marque internationale de divertissement numérique | **Oui** | « an international digital-entertainment brand, established in the United States in 2026 » ; aucun fondateur, aucune équipe, aucun détail inventé. |

Ces valeurs sont centralisées dans `OWNER_FACTS` (`src/content/en/info.ts`) : une seule source pour toutes les pages.

## 2. Allégations P0/P1 encore bloquées

Aucune de ces allégations n'apparaît dans les nouvelles pages (test automatique). Elles restent **en ligne sur
l'accueil et dans le gabarit commun** tant que vous ne décidez pas ; rien n'a été modifié silencieusement.

| ID | Priorité | Allégation en ligne | Où | Preuve manquante | Proposition | Statut |
|---|---|---|---|---|---|---|
| A1 | P0 | « 35,000+ TV channels and 200,000+ movies & series » | Accueil (bandeau final) | Licences/contrats par pays | Retirer les volumes | **Bloquée** |
| A2 | P0 | « +12,000 / +25,000 / +35,000 » chaînes | Comparatif des formules | Idem | Retirer la ligne | **Bloquée** |
| A3 | P0 | « +100,000 / +150,000 / +200,000 » VOD | Comparatif, cartes | Droits VOD | Retirer la ligne | **Bloquée** |
| A4 | P0 | « Live sports », « Football, basketball, motorsport… » | Accueil, **pied de page et en-tête de pied** (« Live Sports • Movies • Series • Live TV », « …with live sports… ») | Droits sportifs | Voir décision ci-dessous | **Bloquée — décision requise** |
| A5 | P0 | « International channels », « TV from around the world » | Accueil, formule Ultra+, **pied de page** (« …international channels… ») | Droits de retransmission | Voir décision ci-dessous | **Bloquée — décision requise** |
| A6 | P0 | « National channels & news » | Formule Starter | Idem | « Essential channel bundle » | **Bloquée** |
| A7 | P0 | « 7-day / 14-day replay » | Formules | Droits de rattrapage + fonction réelle | Retirer | **Bloquée** |
| C1 | P0 | « The best IPTV experience » | Formule Ultra+ | Non démontrable, terme sensible | « Our most complete plan · 4K/HDR where available. » | **Bloquée** |
| D1 | P1 | « Step-by-step guide per device » | Accueil | Guides publiés (dépend de M7) | « Our team guides you step by step on WhatsApp » | **Bloquée** |
| D2 | P1 | « Help centre and email support », « Visit the help centre » | Accueil | Centre d'aide en ligne | Devient vraie à la publication `live` | **Bloquée jusqu'à publication** |
| D3 | P1 | Support « Email / Priority / VIP priority » | Formules | Délais par formule appliqués | ⚠ Contredit désormais M3 (24/7 et < 1 h pour tous) : « 24/7 email & WhatsApp support » identique | **Bloquée** |
| B4 | P1 | « Smart TV, Android TV, Fire TV, Apple TV, Mobile & tablet, PC & Mac » | Accueil | Applications confirmées par plateforme (M7) | Garder seulement les plateformes testées | **Bloquée pour les guides** |
| E1 | P1 | « before taxes » ↔ « Taxes $0.00 USD » | Formules, paiement | Avis fiscal | À clarifier (aucun changement de prix ici) | À clarifier |
| E2 | P1 | « +30 days free » | Formules | Conditions de la promotion | Préciser conditions / fin | À préciser |
| A8 | P1 | « TV guide (EPG) included » | Formules | Test dans l'application remise | Garder si confirmé | À vérifier |

### Décisions demandées : A4, A5, B1, D2 (gabarit commun, présent sur toutes les pages)

| ID | Texte du gabarit | Option 1 (recommandée) | Option 2 | Option 3 |
|---|---|---|---|---|
| A4 | Slogan du pied de page « Live Sports • Movies • Series • Live TV » ; texte « A modern streaming experience with live sports, movies, series and international channels on all your devices. » | Retirer « Live Sports » : « Movies • Series • Live TV » et « A modern streaming experience for movies, series and live TV on your devices. » | Garder, en fournissant les droits sportifs (par compétition et territoire) | Garder en l'état (risque accepté par écrit) |
| A5 | « …international channels… » (même texte) | Retirer « international channels » (texte de l'option 1 ci-dessus) | « …a selection of channels, depending on your country » | Garder avec preuve des droits |
| B1 | Pastille « HD to 4K » | « HD to 4K where available » (cohérent avec les formules) | Garder « HD to 4K » (4K effectivement fourni) | — |
| D2 | « Help centre and email support », « Visit the help centre » (accueil) | Garder et publier le Help center (`live`) **dans le même déploiement** | Remplacer par « FAQ and email support » / « Read the FAQ » si la publication est reportée | — |

Aucune de ces options n'est implémentée : elles touchent des textes de production et attendent votre choix.

## 3. Contradictions et éléments restant à prouver

| # | Constat (vérifié le 20/11/2026) | Conflit avec | Proposition |
|---|---|---|---|
| 1 | `/api/health` en ligne : `mode: "prelaunch"`, `salesEnabled: false` | M9 « le site accepte des commandes » | Clarifier : si les ventes sont ouvertes, activer `SALES_ENABLED` (décision distincte, hors de cette phase) ; sinon les pages ne doivent pas être publiées en l'état. |
| 2 | CGU §1 : « …and, once subscriptions open, the SYGMA TV+ streaming service » | M9 | Relecture juridique des CGU (non modifiées, conformément à la consigne). |
| 3 | Marchés `US` / `CA` / `EU` avec `licensed: false` dans la configuration | M8 (10 pays visés) et M9 | Aucun pays cité dans les pages ; FAQ de l'accueil « United States, Canada and Europe » à revoir avec les droits. |
| 4 | Engagement F1 « Each country opens only once broadcasting authorisations are in place » (repris dans la première version d'About ; **non affiché sur le site en ligne**, vérifié le 20/11 — retiré d'About, voir `corrections-validees.md`) | Commandes acceptées sans droits établis (M8) | Garder F1 seulement si les autorisations existent pour les pays ouverts ; sinon le reformuler avec un avocat. |
| 5 | CGU muettes sur « un seul essai par client » (la politique de remboursement dit « One refund per customer ») | M5 publié dans le Help center | Ajouter une phrase aux CGU lors de la prochaine relecture juridique : « One free trial per customer. » |
| 6 | Aucune facture PDF dans le code | M6 | Fournir un exemple d'e-mail réel avec PDF, ou développer la facture (lot séparé). Non publié d'ici là. |
| 7 | Applications M7 non vérifiables | M7, D1, B4 | Plan de vérification 5B (`docs/seo/guides-verification-plan.md`) : nom exact, boutique officielle, test réel daté. |
| 8 | Tous les paiements sont manuels | M1 | Confirmer que chaque prestataire (PayPal, Binance, Western Union, MoneyGram, acquéreur carte) accepte ce type d'activité ; sinon retirer la méthode de la liste (`OWNER_FACTS.paymentMethods`). |
| 9 | Données structurées de l'accueil : `contactPoint.availableLanguage` = anglais seulement ; pas de `foundingDate` | M4, M10 | À aligner **au moment de la publication** (6 langues, `foundingDate: "2026"`) — non modifié ici pour garder l'accueil identique. |
| 10 | D3 « Priority / VIP priority support » | M3 (même délai pour tous) | Voir tableau §2. |
| 11 | D4 « Fast reply » | M3 | Compatible ; pourrait devenir « Usually replies in under an hour ». |

## 4. Pages

- `/about` : hero (4 chiffres clés : création 2026 / États-Unis, Sygma TV LLC / Nouveau-Mexique, support 24/7,
  6 langues), sommaire, Who we are, Company information, How the service works (4 étapes), Our commitments,
  Multilingual support, Payment, activation and confirmation, Useful links, Contact us (+ boutons essai, support, formules).
- `/help` : hero, « Popular questions » (6 liens directs vers les réponses), 7 cartes de sujets, bandeau
  disponibilité / délai habituel / langues / activation, encadré contact avec boutons.
- `/help/<sujet>` (7) : sommaire, sections numérotées, étapes illustrées, encadré contact avec bouton adapté au sujet,
  sujet précédent / suivant, liens connexes.
- Charte : couleurs de la marque (#070D17, #D1FE17, #F044C4, #19D3F3, #6878FF), mêmes composants que les pages
  légales, colonne de lecture de 900 px comme les pages légales, aucun superlatif.

## 5. Pied de page (correction préparée, non déployée)

| Largeur | Production (avant) | Branche 5C (après) |
|---|---|---|
| 320 px | Pastilles : dépassent la colonne de 43 px ; icônes sociales : 6 px dans la marge | Aucun dépassement |
| 375 px | Pastilles : 18 px | Aucun |
| 768 / 1024 px | Aucun | Aucun |
| 1366 px | Pastilles : 47 px hors colonne, **chevauchent « Links » de 14 px** | Aucun (« Secure & private » passe à la ligne) |
| 1440 / 1920 px | Aucun | Aucun |

Aucun défilement horizontal de page, avant comme après. Cause : interdiction de retour à la ligne (`nowrap`) imposée aux pastilles à toutes les
largeurs ; correction : retour à la ligne seulement si la place manque. Icônes sociales : écart réduit à 4 px sous
340 px (cibles tactiles de 44 × 44 px conservées). CSS ajouté (2 règles, `src/app/globals.css`) :

```css
.footer ul.footer-chips { flex-wrap:wrap; row-gap: 8px; }
@media (max-width: 340px) { .footer ul.footer-social { gap: 4px; } }
```

## 6. Tests (20/11/2026)

| Contrôle | Résultat |
|---|---|
| TypeScript | OK |
| ESLint | 0 erreur ; 4 avertissements **identiques à la production** (fichiers non modifiés) |
| Tests unitaires | **112/112** |
| Comparaison production `864f703` ↔ branche (mode `off`), 169 adresses (dont `/about`, `/help`, `/help/*`, `/en/*`) | **0 différence** (statut, redirection, `X-Robots-Tag`, HTML visible, JSON-LD, scripts de consentement / GA4 / GTM) |
| CSS global (mode `off`) | Seules différences : les 2 règles du pied de page + utilitaire `.grid` généré par Tailwind (lu dans `info.module.css`), **utilisé par aucun élément** des 169 pages |
| E2E mode `off` (ordinateur + mobile) | **161 réussis, 0 échec** (39 ignorés : tests propres au mode preview) |
| E2E mode `preview` (pages + responsive) | **38 réussis, 0 échec** : 9 pages × 2 appareils (200, titre ≤ 60, description ≤ 155, canonique, `noindex, follow`, 1 H1, fil d'Ariane + `BreadcrumbList`, type de page), faits du propriétaire, sommaire, précédent/suivant, boutons ouvrant les fenêtres essai/support, navigation clavier, axe WCAG 2.1 AA (`/about`, `/help`, `/help/refunds`) |
| Responsive (320, 375, 768, 1024, 1366, 1440, 1920 px) | `/`, `/legal/terms`, `/about`, `/help`, `/help/ordering-payment` : aucun défilement horizontal, pastilles et icônes dans leur colonne |
| Sitemap | `off` et `preview` : 6 URL (inchangé) ; `live` : 15 URL (test unitaire) |
| Non modifiés (vérifié par `git diff 864f703`) | prix, commande, checkout, API, base de données/migrations, GA4, GTM, Google Ads, consentement, CGU et pages légales |
| Commit interdit `350882a` | Absent de l'historique de la branche |
