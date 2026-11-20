# Phase 6C.1 — Audit juridique des textes (20/11/2026)

**Lot strictement documentaire.** Branche `claude/seo-phase6c1-legal` (base 6B `7285837`). Aucune page publique,
aucun texte du site, aucun e-mail, aucune commande, aucun prix, aucun paiement, WhatsApp, Telegram ou configuration
de production n'est modifié. Rien n'est déployé ni fusionné. `350882a` absent.

**Avertissement** : ce document n'est pas un avis juridique. Il identifie des contradictions et des ambiguïtés pour
un juriste qualifié dans les pays concernés.

## Parcours commercial réel (référence, inchangé)

1. Le client choisit son abonnement sur sygmatv.com.
2. Il remplit le formulaire de commande (rien n'est débité sur le site).
3. L'équipe le contacte sur WhatsApp.
4. L'accès est **activé avant le paiement**.
5. Le client **paie après l'activation**, par un moyen proposé par l'équipe.
6. La commande est marquée **payée uniquement après confirmation du paiement** (« Converti »), ce qui envoie l'e-mail
   « Your subscription is now active! » avec le numéro de commande.

## Textes examinés

| Texte | Source | Statut |
|---|---|---|
| Conditions générales (8 sections, « Last updated: 17 November 2026 ») | `src/content/terms.ts` → `/legal/terms` | **Publié** |
| Politique de remboursement (5 sections, « 16 November 2026 ») | `src/content/legal.ts` (`REFUNDS`) → `/legal/refunds` | **Publié** |
| Mentions légales | `src/content/legal.ts` (`IMPRINT`) + `src/config/site.ts` | Publié |
| Politique de confidentialité (passages commandes, factures, conservation) | `src/content/legal.ts` (`PRIVACY`) | Publié |
| FAQ de l'accueil | `src/i18n/dictionaries/en.ts` (`faq`) | Publié (version 6A/6B en branche) |
| Fenêtre de commande | `en.ts` (`checkout`) | Publié (note corrigée en 6B, branche) |
| About, Help Center | `src/content/en/info.ts` | Prêts, **désactivés** |

## 1. Contradictions avec le parcours réel

| # | Texte publié | Où | Contradiction | Gravité |
|---|---|---|---|---|
| C1 | « …our team contacts you on WhatsApp to confirm your order **and payment, then activates** your access. » | CGU §2 | Paiement placé **avant** l'activation | **Élevée** |
| C2 | « Payment is arranged with our team **when your order is confirmed**. » | CGU §4 | Moment du paiement inexact (il intervient après l'activation) | **Élevée** |
| C3 | « These Terms govern your use of sygmatv.com and, **once subscriptions open**, the SYGMA TV+ streaming service. » | CGU §1 | Formulation de pré-lancement : les abonnements sont vendus | Moyenne |
| C4 | « …a full refund if you ask within 7 days **of activation** » / « Ask within 7 days **of activation** and we refund 100% » | CGU §5, politique de remboursement, FAQ, Help › Refunds | Le délai commence **avant** le paiement ; un client qui paie au 6ᵉ jour n'a plus qu'un jour | **Élevée** |
| C5 | « After the first 7 days, we refund the unused part of your subscription. » | Remboursement (UE/R-U) | « 7 premiers jours » de quoi ? (activation, paiement, contrat) — non défini | Moyenne |
| C6 | « You are refunded within 14 days, **to the payment method you used**. » | Remboursement | Moyens de paiement manuels (Western Union, MoneyGram, USDT, virement) : remboursement « sur le même moyen » parfois impossible ou coûteux ; frais non traités | Moyenne |
| C7 | « The contract starts when we confirm your order. » | CGU §2 | Cohérent avec le parcours, mais conséquences non décrites : que se passe-t-il si le client activé ne paie pas ? | Moyenne |
| C8 | « Live TV channels, **sports**, movies and series… Picture quality (HD to **4K HDR**)… » | CGU §3 | Allégations non prouvées (droits sportifs, 4K HDR) — retirées ailleurs (6A, pied de page 5C) | Moyenne |
| C9 | « Prices are shown in USD before taxes; the final price, taxes included, is always displayed before payment. » | CGU §4 | Fenêtre de commande : « Taxes $0.00 USD » ; aucune règle fiscale configurée ; le « prix final » est affiché **avant la commande**, pas « avant le paiement » (qui a lieu sur WhatsApp) | Moyenne (fiscal) |
| C10 | « Promotions such as “+30 days free” apply under the conditions shown at purchase. » | CGU §4 | Aucune condition n'est affichée sur le site | Moyenne |

## 2. Ambiguïtés et lacunes

| # | Sujet | Constat | Où le traiter |
|---|---|---|---|
| A1 | Début de l'abonnement | Non défini : date d'activation, de paiement ou de confirmation ? (impacte la durée de 12/24/36 mois) | CGU « Subscription term » |
| A2 | Délai de paiement après activation | Absent | CGU « Payment » — **décision** |
| A3 | Suspension pour non-paiement | Absente | CGU « Suspension » — **décision** |
| A4 | Essai gratuit | Durée (24 h) dans la politique de remboursement, mais « un essai par client » n'est écrit nulle part dans les CGU (alors que l'aide le dit) | CGU « Free trial » |
| A5 | Moyens de paiement | Listés dans About/Help (6 moyens) mais absents des CGU | CGU « Payment » |
| A6 | Assistance | 24/7, réponse habituelle < 1 h, 6 langues : absent des CGU (à garder non contractuel) | CGU « Customer support » |
| A7 | Réclamations | Aucune procédure (contact, délai de réponse, médiation) | CGU « Complaints » |
| A8 | Résiliation par le client / par l'entreprise | Seul « Serious breaches may lead to suspension » existe | CGU « Termination and suspension » |
| A9 | Identifiants et sécurité du compte | Absent | CGU « Your access » |
| A10 | Âge / capacité | Absent | CGU « Who can order » — **décision** |
| A11 | Modification des prix | Absent (prix dans la base, modifiables) | CGU « Prices » |
| A12 | Dysfonctionnement du service | « cannot guarantee uninterrupted access » ; aucun remède décrit (remboursement partiel, prolongation) | CGU + politique de remboursement |
| A13 | Droit de rétractation (UE/R-U) | Mentionné (14 jours) sans point de départ ni traitement de l'exécution immédiate d'un service numérique | **Juriste** |
| A14 | Droit applicable | « laws of the State of New Mexico, United States » + protection impérative du pays de résidence : à confirmer (marchés, établissement) | **Juriste** |
| A15 | Marchés desservis | FAQ publiée (production) : « The United States, Canada and Europe » ; configuration : marchés `licensed: false` ; 6A retire la liste | **Décision** + droits |
| A16 | Droits de distribution | Les CGU disent « Content depends on the licences available in each country » sans que des licences soient établies | **Décision** (formulation prudente proposée) |
| A17 | Facture | Confidentialité : « plan, price, order reference **and invoice** » ; en pratique : e-mail de confirmation avec numéro de commande (pas de facture PDF vérifiée) | Confidentialité (lot séparé) |

## 3. Dispositions exactes à conserver

- Rien n'est débité sur le site ; pas de données de carte stockées.
- Pas de renouvellement automatique.
- Usage personnel dans le foyer, nombre d'appareils de la formule ; partage et revente interdits ; suspension en cas
  de manquement grave.
- Disponibilité non garantie ; pas de responsabilité pour la connexion ou l'équipement du client ; aucune limitation
  de responsabilité interdite par la loi.
- Notification des changements importants des CGU par e-mail.
- Données personnelles : renvoi vers la politique de confidentialité.
- Identité de l'opérateur : renvoi vers les mentions légales (Sygma TV LLC, publiée).
- Droits légaux des consommateurs toujours préservés.

## 4. Cohérence entre les textes (après lots 6A/6B, en branche)

| Sujet | Accueil / FAQ | Fenêtre de commande | About / Help | CGU publiées | Remboursement publié |
|---|---|---|---|---|---|
| Ordre activation → paiement | Oui | Oui (6B) | Oui | **Non** (C1, C2) | — |
| Rien n'est débité sur le site | Oui | Oui | Oui | Oui | — |
| Point de départ du remboursement | Activation | — | Activation | Activation | Activation (**C4**) |
| Essai unique | — | — | Oui | **Absent** (A4) | — |
| Moyens de paiement | — | — | 6 moyens | **Absents** (A5) | « même moyen » (C6) |

Propositions : `terms-proposal-en.md`, `refund-proposal-en.md` ; décisions : `questions-validation.md` ;
avant/après : `comparison.md`.
