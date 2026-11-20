# Phase 5C — Étape 1 : décisions sur les 25 allégations commerciales

**Statut : revue seulement — aucun texte commercial n'a été modifié.** Source : `docs/seo/claims-validation.md`
(emplacements exacts dans `src/i18n/dictionaries/en.ts`, commit de production `864f703`, inchangé depuis `24cdc49`
pour ces textes). Les nouvelles pages (About, Help center) **n'utilisent aucune** de ces allégations (test automatique).

Colonne « Bloquer ? » : **Oui** = ne pas publier de nouvelle page, campagne, page pays ou communication qui reprend
l'allégation tant que la preuve n'est pas fournie ou le texte remplacé. Les textes déjà en ligne restent inchangés
jusqu'à votre décision.

## Priorité P0 — à trancher avant toute campagne, page pays ou publication des nouvelles pages

| ID | Allégation actuelle | Preuve exigée | Risque | Formulation recommandée | Bloquer ? |
|---|---|---|---|---|---|
| A1 | « Access up to 35,000+ TV channels and 200,000+ movies & series… from multiple countries » | Licences/contrats couvrant ces volumes, par pays | Élevé | « Live TV, movies and series on all your screens, in HD to 4K where available — from {price}/month. » | **Oui** |
| A2 | Comparatif « Live TV channels: +12,000 / +25,000 / +35,000 » | Idem, par formule | Élevé | Supprimer la ligne (ou « Channel bundle: Essential / Extended / Complete ») | **Oui** |
| A3 | « Movies & series (VOD): +100,000 / +150,000 / +200,000 » | Droits VOD | Élevé | Supprimer la ligne et le compteur des cartes | **Oui** |
| A4 | « Live sports », « Football, basketball, motorsport and more », « Sports & entertainment » | Droits sportifs par compétition et territoire | Élevé | Ne pas citer le sport sans droits | **Oui** |
| A5 | « International channels », « channels from around the world », « TV from around the world » | Droits de retransmission par territoire | Élevé | « A selection of channels, depending on your country » | **Oui** |
| A6 | « National channels & news » | Idem A5 | Élevé | « Essential channel bundle » | **Oui** |
| A7 | « 7-day / 14-day replay » | Droits de rattrapage + fonction réelle dans l'application | Élevé | Retirer jusqu'à preuve | **Oui** |
| C1 | « The best IPTV experience » | Non démontrable ; terme « IPTV » sensible | Moyen (règles publicitaires) | « Our most complete plan · 4K/HDR where available. » | **Oui** |

## Priorité P1 — fonctions annoncées qui n'existent pas encore, cohérence

| ID | Allégation actuelle | Preuve exigée | Risque | Formulation recommandée | Bloquer ? |
|---|---|---|---|---|---|
| D1 | « Quick setup — Step-by-step guide per device » | Guides publiés | Moyen | « Our team guides you step by step on WhatsApp » (ou garder une fois les guides en ligne) | **Oui** (inexact aujourd'hui) |
| D2 | « Help centre and email support » / « Visit the help centre » | Centre d'aide existant | Moyen | Deviendra **vrai** à la publication du Help center de cette phase ; sinon « FAQ and email support » | **Oui** jusqu'à publication du Help center |
| E1 | « Prices in USD, before taxes » ↔ « Taxes $0.00 USD » au paiement | Avis fiscal | Moyen | À clarifier avec le conseil fiscal (aucun changement de prix ici) | Non (à clarifier) |
| E2 | « +30 days free » (Plus, Ultra+) | Conditions de la promotion | Moyen | Préciser les conditions ou la date de fin | Non (à préciser) |
| D3 | Support « Email / Priority / VIP priority » | Délais d'assistance par formule réellement appliqués | Moyen | « Email & WhatsApp support » identique pour tous, ou publier les délais réels | **Oui** pour toute nouvelle communication |
| A8 | « TV guide (EPG) included » | Fonction réelle dans l'application remise (test) | Moyen | Garder si confirmé, sinon « TV guide where available » | Non (vérification technique) |
| B4 | Liste « Smart TV, Android TV, Fire TV, Apple TV, Mobile & tablet, PC & Mac » | Application officielle confirmée et testée par plateforme | Moyen | Ne garder que les plateformes confirmées | **Oui** pour les guides (plan de vérification) |

## Priorité P2 — qualité, superlatifs secondaires

| ID | Allégation actuelle | Preuve exigée | Risque | Formulation recommandée | Bloquer ? |
|---|---|---|---|---|---|
| B2 | « Stable streaming servers: Standard / High stability / Premium », « Premium servers » | Différence technique mesurable | Moyen | Supprimer la ligne et les puces « servers » | **Oui** pour toute nouvelle communication |
| B1 | « HD, Full HD, 4K and HDR », « 4K Ultra HD & HDR », « HD to 4K » | Flux 4K/HDR fournis | Moyen | Garder avec « where available » partout | Non |
| B3 | « Designed for all your devices », « Works on most screens » | Liste d'appareils testés | Moyen | « Works on Smart TV, streaming devices, mobile and computer » | Non |
| A9 | « Documentaries », « Cinema, series and on-demand content » | Droits VOD | Moyen | Garder la catégorie sans promesse de titres, si droits prouvés | Non (lié à A3) |
| C2 | « The best balance » | Non démontrable | Faible | « Our recommended plan » | Non |
| C3 | « The ultimate experience » | Non démontrable | Faible | « Our most complete plan » | Non |

## Priorité P3 — à conserver (cohérents ou de registre de marque)

| ID | Allégation actuelle | Constat | Recommandation | Bloquer ? |
|---|---|---|---|---|
| C4 | « Premium streaming. », « A complete / modern streaming experience » | Registre de marque | Garder si vous l'assumez | Non |
| D4 | « Fast reply », « Quickly, on WhatsApp » | Sans chiffre | Garder sans chiffre | Non |
| D5 | « Order online in minutes / in a few seconds » | Concerne le formulaire | Garder | Non |
| F1 | « Each country opens only once broadcasting authorisations are in place. » | Engagement juste | Garder — il impose de traiter A1–A7 | Non |

**Note sur le gabarit commun** : l'en-tête et le pied de page (« Live Sports • Movies • Series • Live TV », « A modern
streaming experience with live sports, movies, series and international channels », pastille « HD to 4K ») figurent
sur **toutes** les pages, y compris les futures pages About et Help center. Tant que A4/A5/B1 ne sont pas tranchés,
ces pages hériteront de ces mentions.
