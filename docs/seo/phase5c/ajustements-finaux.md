# Phase 5C — Derniers ajustements : CGU, remboursement, pied de page (20/11/2026)

Branche isolée `claude/seo-phase5c-preview` (base `1d52e1e`). **Rien n'est déployé ni fusionné.** Les fichiers
juridiques publiés (`src/content/terms.ts`, `src/content/legal.ts`) **ne sont pas modifiés** : les formulations
ci-dessous sont des propositions à valider (propriétaire + juriste). Parcours commercial, commandes, e-mails,
Telegram et WhatsApp : non modifiés. `350882a` absent.

> **Correction de numérotation.** Sur la page CGU publiée, les sections sont numérotées : 01 *About these Terms*,
> 02 *How ordering works*, 03 *The Service*, 04 *Plans, prices and payment*, 05 *Renewal, cancellation and refunds*.
> Mes rapports précédents appelaient « §3 » la section *Plans, prices and payment* : c'est la **§4**. Les
> propositions couvrent donc §1 à §5 (le paiement est en §4, le remboursement en §5).

## 1. CGU — propositions (non appliquées)

| § | Texte publié (exact) | Proposition (exacte) | Motif |
|---|---|---|---|
| **01** About these Terms | « These Terms govern your use of sygmatv.com and, once subscriptions open, the SYGMA TV+ streaming service. By using the website or submitting a form, you accept them. The operator’s full identity is published in our Legal notice. » | « These Terms govern your use of sygmatv.com and of the SYGMA TV+ streaming service. By using the website or submitting a form, you accept them. The operator’s full identity is published in our Legal notice. » | Formulation de pré-lancement : les abonnements sont ouverts |
| **02** How ordering works | « Trial requests are free and create no obligation. When you order on the site, nothing is charged there: our team contacts you on WhatsApp to confirm your order and payment, then activates your access. The contract starts when we confirm your order. » | « Trial requests are free and create no obligation; one free trial per customer. When you order on the site, nothing is charged there. Our team contacts you on WhatsApp to confirm your order, then activates your access. You pay after activation, using one of the payment methods offered by our team. Once your payment has been received and confirmed, we send you an email confirming your subscription, with your order number. The contract starts when we confirm your order. » | Parcours réel : activation **avant** paiement, confirmation **après** paiement ; essai unique |
| **03** The Service *(facultatif, cohérence avec le pied de page)* | « Live TV channels, sports, movies and series on compatible devices. Content depends on the licences available in each country and may change. Picture quality (HD to 4K HDR) depends on your plan, the content, your device and your internet connection. » | « Live TV, movies and series on compatible devices. Content depends on the licences available in each country and may change. Picture quality depends on your plan, the content, your device and your internet connection. » | Retire « sports » et « 4K HDR » (non prouvés), comme le pied de page |
| **04** Plans, prices and payment | « Starter, Plus and Ultra+ plans for 12, 24 or 36 months, with 1 device included and up to 4. Prices are shown in USD before taxes; the final price, taxes included, is always displayed before payment. Payment is arranged with our team when your order is confirmed. Promotions such as “+30 days free” apply under the conditions shown at purchase. » | « Starter, Plus and Ultra+ plans for 12, 24 or 36 months, with 1 device included and up to 4. Prices are shown in USD before taxes; the final price, taxes included, is always displayed before payment. Payment is arranged with our team on WhatsApp and is due once your access has been activated; no payment is taken on the website. Promotions such as “+30 days free” apply under the conditions shown at purchase. » | Moment du paiement |
| **05** Renewal, cancellation and refunds | « …and you get a full refund if you ask within 7 days of activation (“Satisfied or refunded”)… » | « …and you get a full refund if you ask within 7 days of your payment (“Satisfied or refunded”)… » | Délai à compter du paiement (§2 ci-dessous) |

Date : `TERMS_UPDATED` passerait de « 17 November 2026 » à la date de publication.

**Questions pour le juriste**
1. Client activé qui ne paie pas : faut-il un délai de paiement et une suspension (« If payment is not received
   within [X] days of activation, we may suspend your access ») ? Le délai [X] est à fixer par vous — non inventé ici.
2. « The contract starts when we confirm your order » : reste-t-il adapté quand l'accès est fourni avant le paiement ?
3. Consommateurs UE / R-U : point de départ des 14 jours de rétractation (conclusion du contrat, donc avant le
   paiement) et recueil du consentement à l'exécution immédiate d'un service numérique.

## 2. Politique de remboursement — proposition « 7 jours à compter du paiement » (non appliquée)

| Section | Texte publié (exact) | Proposition (exacte) |
|---|---|---|
| Satisfied or refunded — 7 days | « Not satisfied? Ask within 7 days of activation and we refund 100%, no questions asked. One refund per customer; not available for accounts suspended for sharing or reselling access. » | « Not satisfied? Ask within 7 days of your payment and we refund 100%, no questions asked. One refund per customer; not available for accounts suspended for sharing or reselling access. » |
| EU and UK customers | « You also have 14 days to withdraw. After the first 7 days, we refund the unused part of your subscription. » | « You also have 14 days from the conclusion of your contract to withdraw. Within 7 days of your payment you are refunded in full; after that, we refund the unused part of your subscription. » *(à valider : articulation des deux délais)* |
| Free trial first / How to ask / After that | inchangés | inchangés |
| Méta-description de la page | « SYGMA TV+ refunds: free 24-hour trial first, 100% refund within 7 days of activation, 14-day withdrawal for EU and UK customers, no automatic renewal. » | « SYGMA TV+ refunds: free 24-hour trial first, 100% refund within 7 days of payment, 14-day withdrawal for EU and UK customers, no automatic renewal. » (147 caractères) |

À aligner **le même jour** (sinon contradictions) :

| Où | Texte publié | Proposition |
|---|---|---|
| Accueil, bloc « Refunds » | « …a full refund if you ask within 7 days of activation… » | « …a full refund if you ask within 7 days of your payment… » |
| Accueil, FAQ | « Ask within 7 days of activation and we refund you 100%. » | « Ask within 7 days of your payment and we refund you 100%. » |
| Nouvelles pages : About (engagements), Help › Refunds (intro, §1, description) | « 7 days of activation » / « 7-day money-back guarantee after activation » | « 7 days of your payment » ; description : « SYGMA TV+ refunds: free trial first, 100% refund within 7 days of payment, 14-day withdrawal for EU and UK customers, and how to ask. » (133 caractères) |

## 3. Pied de page — version préparée dans la branche (appliquée, non déployée)

| Élément | Production | Branche |
|---|---|---|
| Slogan | « Live Sports • Movies • Series • Live TV » | « Movies • Series • Live TV » |
| Texte « About SYGMA TV+ » | « A modern streaming experience with live sports, movies, series and international channels on all your devices. » | « A modern streaming experience for movies, series and live TV on your TV, mobile and computer. » |
| Pastilles | Multi-device · **HD to 4K** · Secure & private | Multi-device · Secure & private |

- « HD to 4K » retiré : **aucune preuve technique** n'est disponible dans le dépôt (A8/B1). Il pourra revenir sous la
  forme « HD to 4K where available » avec une preuve.
- Les icônes des pastilles sont désormais associées à leur libellé (et non à leur position), pour que « Secure &
  private » garde son bouclier.
- Fichiers : `src/i18n/dictionaries/en.ts` (3 lignes), `src/components/Footer.tsx` (association icône ↔ libellé),
  nouveau test `tests/unit/footer-claims.test.ts` (aucun « sport », « international », « channel », « HD », « 4K »,
  « HDR », « all your devices » dans le pied de page).

## 4. Différences exactes avec la production (mode `off`, 169 URL comparées)

**Un seul groupe de différences**, identique sur les **9 pages qui affichent le pied de page** : `/`,
`/?utm_source=x`, `/blog`, `/legal/cookies`, `/legal/imprint`, `/legal/privacy`, `/legal/refunds`, `/legal/terms`,
`/legal/terms?gclid=t`.

```diff
- <p class="footer-tagline">Live Sports • Movies • Series • Live TV
+ <p class="footer-tagline">Movies • Series • Live TV
- <p>A modern streaming experience with live sports, movies, series and international channels on all your devices.
+ <p>A modern streaming experience for movies, series and live TV on your TV, mobile and computer.
- <li><svg …(icône éclair)…></svg> HD to 4K</li>
```

Aucune autre différence : statuts et redirections, titres, méta-descriptions, `robots`, canoniques, données
structurées (JSON-LD), scripts de consentement / GA4 / GTM, sitemap, robots.txt. La page 404 n'a pas de pied de page
(inchangée). CSS : uniquement les 2 règles du pied de page déjà validées (+ utilitaire `.grid` inutilisé).

## 5. Impacts SEO

| Changement | Impact | Commentaire |
|---|---|---|
| Pied de page (9 pages) | **Neutre à négligeable** | Texte de gabarit répété sur toutes les pages, faible poids. Aucun lien ajouté ou retiré, aucun titre, méta, canonique ou JSON-LD modifié. Les mots « live sports » et « international channels » restent dans le corps de l'accueil (A4/A5 non traités à cette étape) : la pertinence thématique de l'accueil ne change pas. Les pages légales ne ciblent pas ces requêtes. |
| Pied de page — conformité | Positif | Moins d'allégations non prouvées sur toutes les pages (règles publicitaires Google Ads, qualité du contenu). |
| CGU §1–§5 *(quand appliquées)* | Neutre | Changement de contenu de `/legal/terms` ; la date « Last updated » et le `lastmod` du sitemap suivront `TERMS_UPDATED` (mécanisme existant). |
| Remboursement *(quand appliqué)* | Neutre | Méta-description `/legal/refunds` mise à jour (147 caractères, dans la limite de 155) ; `lastmod` suit la date de la politique. |
| Nouvelles pages | Aucun à cette étape | Toujours désactivées (`off`) ; le Help › Refunds devra être aligné en même temps que la politique. |

Recommandation après déploiement (sur autorisation) : aucune demande d'indexation nécessaire pour le pied de page ;
pour les CGU et la politique de remboursement, inspection d'URL dans la Search Console et IndexNow manuel des deux
pages.

## 6. Tests

| Contrôle | Résultat |
|---|---|
| TypeScript, ESLint | OK (0 erreur ; 4 avertissements identiques à la production) |
| Tests unitaires | 116/116 (dont 2 nouveaux : pied de page) |
| Comparaison production ↔ branche (`off`), 169 URL | 1 groupe de différences = le pied de page (ci-dessus) |
| E2E mode `off` (ordinateur + mobile) | 163 réussis, 0 échec |
| E2E mode `preview` (nouvelles pages, responsive 9 pages × 7 largeurs, statut commercial) | 46 réussis, 0 échec ; axe WCAG 2.1 AA : 0 violation (9 pages × 2 appareils) |
| Pied de page 320 → 1920 px | Aucun chevauchement ni débordement |
