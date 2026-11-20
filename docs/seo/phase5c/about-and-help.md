# Phase 5C — Étapes 2 et 3 : page « About us » et Help center

**Statut : implémentés dans la branche isolée `claude/seo-phase5c-preview`, NON publiés.** Les pages n'existent pas
en production (interrupteur `NEXT_PUBLIC_CONTENT_PAGES` non défini) ; elles ne sont visibles qu'en build `preview`,
avec `noindex`. Contenu : `src/content/en/info.ts`.

Règle de rédaction : **uniquement des faits déjà vérifiés et publiés** (CGU, remboursement, confidentialité, mentions
légales, FAQ, formulaires de commande et d'essai, coordonnées de `src/config/site.ts`). Aucune chaîne, aucun sport,
aucun volume, aucune qualité d'image, aucun superlatif, aucun nom d'application (test automatique bloquant).

## 1. Page About us — `/about`

| Section | Contenu (résumé) | Source vérifiée |
|---|---|---|
| Who we are | SYGMA TV+ (« One World. Endless Entertainment. »), service exploité par Sygma TV LLC, société du Nouveau-Mexique ; formules de 12/24/36 mois, 1 appareil inclus jusqu'à 4 ; essai gratuit | Mentions légales, CGU |
| Company information | Société, adresse du siège, immatriculation, EIN, e-mail, téléphone/WhatsApp | `site.ts` (Mentions légales) |
| How the service works | Choix de la formule → coordonnées (rien n'est débité sur le site) → confirmation et paiement avec l'équipe sur WhatsApp → accès et application | CGU « How ordering works », formulaire de commande |
| Our commitments | Prix final TTC affiché avant paiement ; pas de renouvellement automatique ; remboursement 7 jours + rétractation 14 jours UE/R-U ; données jamais vendues ; pas de faux avis ; pays ouverts seulement avec autorisations de diffusion | CGU, Remboursement, Confidentialité, pied de page |
| Customer support | E-mail, WhatsApp, renvoi vers le Help center | Mentions légales |
| Contact us (encadré) | E-mail et téléphone cliquables, liens Help center / Plans / Mentions légales / CGU | — |

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

## 3. Métadonnées relevées sur les pages (build preview)

| URL | H1 | Titre (caractères) | Description (caractères) | Données structurées |
|---|---|---|---|---|
| `/about` | About SYGMA TV+ | About us: company, support and commitments \| SYGMA TV+ (54) | SYGMA TV+ is operated by Sygma TV LLC (New Mexico, USA). How the service works, our commitments and how to reach our support team. (130) | BreadcrumbList, AboutPage |
| `/help` | Help center | Help center: trials, orders, devices and refunds \| SYGMA TV+ (60) | Answers about the SYGMA TV+ free trial, ordering and payment, supported devices, troubleshooting, refunds and how to contact our support team. (142) | BreadcrumbList, CollectionPage |
| `/help/getting-started` | Getting started with SYGMA TV+ | Getting started with SYGMA TV+ \| SYGMA TV+ (42) | How SYGMA TV+ works, from choosing a plan to watching: free trial, order on the website, activation on WhatsApp and where the service is offered. (145) | BreadcrumbList, WebPage |
| `/help/devices` | Supported devices | Supported devices: TV, streaming devices, mobile \| SYGMA TV+ (60) | SYGMA TV+ works on Smart TVs, streaming boxes and sticks, smartphones, tablets and computers. How many devices you can use and how to check yours. (146) | BreadcrumbList, WebPage |
| `/help/free-trial` | The free trial | Free trial: how to test SYGMA TV+ \| SYGMA TV+ (45) | Test SYGMA TV+ free for 24 hours on your own device before you buy. How to request your trial and what happens next — nothing to pay, nothing to cancel. (152) | BreadcrumbList, WebPage |
| `/help/ordering-payment` | Ordering and payment | Ordering and payment: how it works \| SYGMA TV+ (46) | How to order SYGMA TV+: choose your plan online, confirm with our team on WhatsApp, then pay. Prices, taxes and renewal explained. (130) | BreadcrumbList, WebPage |
| `/help/troubleshooting` | Troubleshooting | Troubleshooting: playback, login and app issues \| SYGMA TV+ (59) | Fix common SYGMA TV+ issues: stuttering picture, login details refused, app not found in your store, app closing, playback on mobile data. (138) | BreadcrumbList, WebPage |
| `/help/contact-support` | Contact our support team | Contact support: email and WhatsApp \| SYGMA TV+ (47) | How to reach SYGMA TV+ support by email, WhatsApp or the contact form, and what to include in your message to get a faster answer. (130) | BreadcrumbList, WebPage |
| `/help/refunds` | Refunds and cancellations | Refunds: 7-day money-back and withdrawal \| SYGMA TV+ (52) | SYGMA TV+ refunds: free trial first, 100% refund within 7 days of activation, 14-day withdrawal for EU and UK customers, and how to ask. (136) | BreadcrumbList, WebPage |

## 4. Informations manquantes — à confirmer par le propriétaire (non écrites dans les pages)

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
d'Ariane discret, grille de cartes responsive pour le hub (`src/components/info.module.css`, chargé uniquement par
ces pages). Aperçus ordinateur et mobile joints au rapport de session.
