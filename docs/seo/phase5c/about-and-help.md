# Phase 5C — Étapes 2 et 3 : page « About us » et Help center

**Statut : implémentés dans la branche isolée `claude/seo-phase5c-preview`, NON publiés.** Les pages n'existent pas
en production (interrupteur `NEXT_PUBLIC_CONTENT_PAGES` non défini) ; elles ne sont visibles qu'en build `preview`,
avec `noindex`. Contenu : `src/content/en/info.ts`.

Règle de rédaction : **uniquement des faits déjà vérifiés et publiés** (CGU, remboursement, confidentialité, mentions
légales, FAQ, formulaires de commande et d'essai, coordonnées de `src/config/site.ts`) **et les informations M1–M10
validées par le propriétaire le 20/11/2026**, sauf M6, M7 et M8 (non vérifiables, non publiées — voir `finalisation.md`). Aucune chaîne, aucun sport,
aucun volume, aucune qualité d'image, aucun superlatif, aucun nom d'application (test automatique bloquant).

## 1. Page About us — `/about` (version finalisée)

| Section | Contenu (résumé) | Source |
|---|---|---|
| Hero | Marque internationale de divertissement numérique, créée aux États-Unis en 2026 ; 4 chiffres clés (2026 / Sygma TV LLC / 24/7 / 6 langues) | M10, mentions légales, M3, M4 |
| Who we are | Marque de Sygma TV LLC (Nouveau-Mexique) ; formules 12/24/36 mois, 1 à 4 appareils ; essai gratuit | Mentions légales, CGU |
| Company information | Société, création 2026, siège, immatriculation, EIN, e-mail, téléphone/WhatsApp | `site.ts`, M10 |
| How the service works | 4 étapes : choisir → coordonnées (rien n'est débité sur le site) → confirmation et paiement avec l'équipe → activation habituellement en moins d'une heure | CGU, M2 |
| Our commitments | Prix final affiché, pas de renouvellement automatique, remboursement 7 j + rétractation 14 j UE/R-U, données jamais vendues, pas de faux avis, pays ouverts seulement avec autorisations | CGU, Remboursement, Confidentialité, F1 |
| Multilingual support | 24/7, réponse habituelle < 1 h (« not a contractual guarantee »), 6 langues, site en anglais | M3, M4 |
| Payment, activation and confirmation | 6 moyens (paiement organisé manuellement par l'équipe, rien de débité sur le site), activation habituelle, e-mail de confirmation (n° de commande, montant payé) | M1, M2, code (e-mail d'activation) |
| Useful links | Help center, support, formules, remboursement, CGU, mentions légales | — |
| Contact us | E-mail, téléphone, boutons « Request a free trial », « Contact support », « See the plans » | — |

## 2. Help center — architecture

```
/help                        Hub (CollectionPage) — 7 cartes + encadré contact
├── /help/getting-started    Getting started
├── /help/devices            Supported devices
├── /help/free-trial         Free trial
├── /help/ordering-payment   Ordering and payment
├── /help/troubleshooting    Troubleshooting
├── /help/contact-support    Contact support
└── /help/refunds            Refunds and cancellations (→ politique complète /legal/refunds)
```

Chaque sujet : fil d'Ariane, H1, introduction, sections numérotées en questions/réponses, « Last reviewed », encadré
contact, liens vers les autres sujets (et vers `/legal/refunds` ou `/#plans` selon le sujet).

## 3. Métadonnées relevées sur les pages (build preview, 20/11/2026)

| URL | H1 | Titre (caractères) | Description (caractères) | Données structurées | robots (preview) |
|---|---|---|---|---|---|
| `/about` | About SYGMA TV+ | About us: company, support and commitments \| SYGMA TV+ (54) | SYGMA TV+ is a digital-entertainment brand of Sygma TV LLC, established in the United States in 2026. How it works, our commitments and support. (144) | BreadcrumbList, AboutPage | noindex, follow |
| `/help` | Help center | Help center: trials, orders, devices and refunds \| SYGMA TV+ (60) | Answers about the SYGMA TV+ free trial, ordering and payment, supported devices, troubleshooting, refunds and how to contact our support team. (142) | BreadcrumbList, CollectionPage | noindex, follow |
| `/help/getting-started` | Getting started with SYGMA TV+ | Getting started with SYGMA TV+ \| SYGMA TV+ (42) | How SYGMA TV+ works, from choosing a plan to watching: free trial, order on the website, payment and activation with our team on WhatsApp. (138) | BreadcrumbList, WebPage | noindex, follow |
| `/help/devices` | Supported devices | Supported devices: TV, streaming devices, mobile \| SYGMA TV+ (60) | SYGMA TV+ is used on Smart TVs, streaming boxes and sticks, smartphones, tablets and computers. How many devices you can use and how to check yours. (148) | BreadcrumbList, WebPage | noindex, follow |
| `/help/free-trial` | The free trial | Free trial: how to test SYGMA TV+ \| SYGMA TV+ (45) | Test SYGMA TV+ free for 24 hours on your own device before you buy. How to request your trial and what happens next — nothing to pay, nothing to cancel. (152) | BreadcrumbList, WebPage | noindex, follow |
| `/help/ordering-payment` | Ordering and payment | Ordering and payment: how it works \| SYGMA TV+ (46) | How to order SYGMA TV+: choose your plan online, confirm with our team on WhatsApp, pay by card, PayPal, transfer or other methods. Activation explained. (153) | BreadcrumbList, WebPage | noindex, follow |
| `/help/troubleshooting` | Troubleshooting | Troubleshooting: playback, login and app issues \| SYGMA TV+ (59) | Fix common SYGMA TV+ issues: stuttering picture, login details refused, app not found in your store, app closing, playback on mobile data. (138) | BreadcrumbList, WebPage | noindex, follow |
| `/help/contact-support` | Contact our support team | Contact support: email and WhatsApp, 24/7 \| SYGMA TV+ (53) | Reach SYGMA TV+ support 24/7 by email, WhatsApp or the contact form, in six languages. What to include for a faster answer. (123) | BreadcrumbList, WebPage | noindex, follow |
| `/help/refunds` | Refunds and cancellations | Refunds: 7-day money-back and withdrawal \| SYGMA TV+ (52) | SYGMA TV+ refunds: free trial first, 100% refund within 7 days of activation, 14-day withdrawal for EU and UK customers, and how to ask. (136) | BreadcrumbList, WebPage | noindex, follow |

## 4. Informations manquantes (première version) — **traitées le 20/11/2026, voir `finalisation.md` §1**

| # | Information | Où elle serait utile | Pourquoi elle manque |
|---|---|---|---|
| M1 | **Moyens de paiement** acceptés | Ordering and payment | Les CGU disent seulement « arranged with our team » |
| M2 | **Délai d'activation** après confirmation | Getting started, Ordering | Aucun délai publié (« quickly ») |
| M3 | **Horaires et délai de réponse** du support | Contact support, About | `supportHours` non renseigné |
| M4 | **Langues** de l'assistance (anglais ? français ?) | Contact support | Non documenté (phrase retirée) |
| M5 | **Une seule période d'essai** par personne/foyer ? | Free trial | Non documenté |
| M6 | **Facture / reçu** remis au client et sous quelle forme | Ordering and payment | L'e-mail de confirmation actuel ne contient ni facture ni montant (D57) |
| M7 | **Applications par appareil** (noms, boutiques) | Supported devices, Troubleshooting | Plan de vérification des guides (5B) |
| M8 | **Liste des pays** exacte au-delà de « United States, Canada and Europe » | Getting started | Libellé actuel de la FAQ conservé tel quel |
| M9 | Statut **pré-lancement** (les CGU mentionnent « once subscriptions open ») | About, Ordering | À clarifier pour que les pages et les CGU disent la même chose |
| M10 | Date de création / présentation de l'équipe (facultatif) | About | Non fourni |

## 5. Design

Même charte que les pages légales (sections numérotées colorées, icônes, encadré lumineux de contact), fil
d'Ariane discret, grille de cartes responsive pour le hub, étapes numérotées, pastilles (langues, moyens de paiement), sommaire,
sujet précédent/suivant (`src/components/info.module.css`, chargé uniquement par ces pages). Aperçus ordinateur et mobile joints au rapport de session.
