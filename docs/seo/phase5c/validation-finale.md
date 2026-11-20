# Phase 5C — Revue finale avant publication (20/11/2026)

Branche isolée `claude/seo-phase5c-preview` (base revue : `45e05c7`). **Rien n'est déployé, fusionné ni publié.**
Parcours commercial, prix, commandes, paiements, e-mails, factures, Telegram, WhatsApp, CGU et politique de
remboursement : **non modifiés**. Nouvelles pages toujours désactivées par défaut. `350882a` absent.

## 1. UI / UX (ordinateur et mobile)

| Contrôle | Résultat |
|---|---|
| 9 pages × 6 largeurs (320, 375, 768, 1024, 1366, 1920 px) | Aucun défilement horizontal, aucun élément hors de la colonne (54/54) |
| Accessibilité axe WCAG 2.1 AA, 9 pages × ordinateur + mobile | **0 violation** |
| Navigation clavier (lien d'évitement, sommaire, cartes) | OK (test E2E) |
| Tailles de cible (WCAG 2.2, 24 px) | Sommaire et fil d'Ariane portés à 24 px ; liens de contact (23 px) et pied de page (19 px, espacés de ≥ 14 px) conformes par l'exception d'espacement |
| Hiérarchie des titres | 1 H1 par page, H2 ensuite, aucun saut de niveau |

Corrections faites pendant cette revue (nouvelles pages uniquement, sans effet sur la production) :
1. **320 px** : les sections débordaient de 26 px (bord droit coupé, sans défilement). Cause : la grille partagée
   des pages légales prend la largeur de l'élément le plus large (encadré contact). Corrigé dans le module CSS des
   nouvelles pages (`.info`). **Le même défaut existe sur les pages légales en production** (non modifiées ici) :
   correction recommandée dans un lot séparé.
2. **Cibles tactiles** du sommaire (16 px) et du fil d'Ariane (20 px) → 24 px.
3. **Pied de page (mode preview/live)** : « Help / FAQ » devenait redondant avec « Help center » → libellé « FAQ »
   (même lien `/#faq`). En mode `off` (production), le libellé reste « Help / FAQ ».
4. Test responsive étendu aux 9 pages avec un contrôle « sections dans la colonne ».

## 2. SEO

| Contrôle | Résultat |
|---|---|
| Titres | 9 uniques, 42 à 60 caractères (suffixe « \| SYGMA TV+ » compris) |
| Descriptions | 9 uniques, 123 à 152 caractères |
| Canoniques / Open Graph | `https://sygmatv.com/<chemin>` (vérifié avec l'URL de production ; en local, `.env.local` donne `localhost`, sans effet sur le déploiement) |
| `robots` | `preview` : `noindex, follow` ; `live` : `index, follow` (vérifié par une compilation locale `live`, non déployée) |
| Sitemap | `off` / `preview` : 6 URL (inchangé) ; `live` : 15 URL, `lastmod` 2026-11-20 ; robots.txt inchangé |
| Données structurées | `BreadcrumbList` (positions 1…n, URL absolues) + `AboutPage` (→ `#organization`), `CollectionPage` (`hasPart` 7 sujets), `WebPage` (`isPartOf` le hub) ; JSON valide ; pas de `FAQPage` ni `HowTo` |
| Liens internes | Tous en 200 (13 destinations), toutes les ancres existent (y compris `/help/ordering-payment#pay`, `/help/refunds#how`…) |
| hreflang | Aucun (comme le reste du site) |

## 3. Promesses commerciales

Lecture intégrale du texte visible des 9 pages : aucun volume, chaîne, sport, pays, qualité chiffrée, superlatif,
nom d'application, facture PDF, paiement en ligne ni délai garanti (garde-fous automatiques en plus). Les délais
sont toujours « usually » et « not a contractual guarantee ». Seules affirmations héritées : le **gabarit commun**
(pied de page) — voir §4 (A4, A5, B1).

## 4. Allégations P0/P1 encore bloquées — formulations prudentes proposées (non appliquées)

| ID | Texte en ligne | Où | Formulation prudente proposée |
|---|---|---|---|
| A1 | « Access up to 35,000+ TV channels and 200,000+ movies & series… » | Accueil, bandeau final | « Live TV, movies and series on all your screens, in HD to 4K where available. » |
| A2 | « Live TV channels: +12,000 / +25,000 / +35,000 » | Comparatif | Supprimer la ligne |
| A3 | « Movies & series (VOD): +100,000 / +150,000 / +200,000 » | Comparatif, cartes | Supprimer la ligne et le compteur |
| A4 | « Live Sports • Movies • Series • Live TV » ; « …with live sports… » ; « Football, basketball, motorsport and more » | **Pied de page (toutes les pages, y compris les nouvelles)**, accueil | « Movies • Series • Live TV » ; « A modern streaming experience for movies, series and live TV on your devices. » ; retirer les sports nommés |
| A5 | « International channels », « TV from around the world » ; « …and international channels… » | Accueil, Ultra+, **pied de page** | « A selection of channels, depending on your country. » (et texte du pied de page de la ligne A4) |
| A6 | « National channels & news » | Starter | « Essential channel bundle » |
| A7 | « 7-day / 14-day replay » | Formules | Retirer tant que la preuve manque |
| C1 | « The best IPTV experience » | Ultra+ | « Our most complete plan · 4K/HDR where available. » |
| B1 | Pastille « HD to 4K » | **Pied de page** | « HD to 4K where available » |
| D1 | « Step-by-step guide per device » | Accueil | « Our team guides you step by step on WhatsApp. » |
| D2 | « Help centre and email support », « Visit the help centre » | Accueil | Devient exact **si** le Help center est publié dans le même déploiement ; sinon « FAQ and email support » |
| D3 | « Email / Priority / VIP priority » support | Formules | « 24/7 email & WhatsApp support » (identique pour toutes les formules) |
| B4 | « Smart TV, Android TV, Fire TV, Apple TV, Mobile & tablet, PC & Mac » | Accueil | « Smart TV, streaming devices, mobile and computer — check yours with the free trial. » |
| A8 | « TV guide (EPG) included » | Formules | « TV guide (EPG) where available » |
| E1 | « before taxes » ↔ « Taxes $0.00 USD » | Formules, fenêtre de commande | À clarifier avec le conseil fiscal |
| E2 | « +30 days free » | Plus, Ultra+ | Préciser conditions et date de fin |

## 5. Cohérence avec les CGU et la politique de remboursement publiées (non modifiées)

| # | Document publié | Nouvelles pages | Statut |
|---|---|---|---|
| 1 | CGU §2 : « confirm your order **and payment, then** activates your access » | Activation, **puis** paiement | **Contradiction** |
| 2 | CGU §3 : « Payment is arranged with our team **when your order is confirmed** » | « You pay **after your access has been activated** » | **Contradiction** |
| 3 | CGU §1 : « …and, **once subscriptions open**, the SYGMA TV+ streaming service » | Service présenté comme disponible | **Contradiction** (formulation de pré-lancement) |
| 4 | CGU : « The contract starts when we confirm your order » | Identique | Cohérent |
| 5 | CGU : prix final affiché avant paiement | « price shown before you send your order » | Cohérent |
| 6 | CGU : rien sur l'essai unique | « One free trial per customer » | Lacune (à ajouter aux CGU) |
| 7 | Remboursement : « within 7 days of **activation** », remboursement sur le moyen de paiement utilisé, 14 jours UE/R-U, une fois par client | Reprend la politique mot pour mot | Cohérent avec le texte publié ; **incohérent avec le parcours** (le délai démarre avant le paiement) → proposition « 7 jours à compter du paiement » (`corrections-validees.md` §3, juriste) |
| 8 | Fenêtre de commande : « Our team confirms your order and payment with you on WhatsApp » | Activation puis paiement | Ambigu |

Formulations proposées : `corrections-validees.md` §3–§4.

## 6. Pied de page

7 largeurs (320, 375, 768, 1024, 1366, 1440, 1920 px) : aucun chevauchement, aucun débordement, pastilles et icônes
dans leur colonne (test automatique + captures). Correction CSS globale limitée à 2 règles (déjà validées).

## 7. Checklist GO / NO-GO

| # | Critère | Statut |
|---|---|---|
| 1 | Pages complètes, design, responsive, accessibilité | ✅ GO |
| 2 | SEO technique (titres, descriptions, canoniques, données structurées, liens, sitemap `live`) | ✅ GO |
| 3 | Aucune promesse non justifiée dans les nouvelles pages | ✅ GO |
| 4 | Site identique en mode `off` (169 URL, 0 différence ; CSS = correctif du pied de page) | ✅ GO |
| 5 | `/api/health` `assisted`, `salesEnabled: false`, checkout verrouillé, formulaire de commande inchangé | ✅ GO |
| 6 | Tests (unitaires, E2E off et preview, axe, responsive) et CI | ✅ GO |
| 7 | CGU §1–§3 alignées sur « activation puis paiement » (sinon les pages contredisent les CGU) | ❌ **NO-GO** — décision + juriste |
| 8 | Politique de remboursement : point de départ du délai (activation ou paiement) | ⚠️ À trancher (pages cohérentes avec le texte publié) |
| 9 | Gabarit commun sur les nouvelles pages : A4 (sports), A5 (chaînes internationales), B1 (« HD to 4K ») | ❌ **NO-GO** — votre décision (options §4) |
| 10 | D2 « Help centre » sur l'accueil | ✅ si publication `live` ; sinon corriger D2 |
| 11 | Délai « moins d'une heure » rattaché à la confirmation de la commande sur WhatsApp | ⚠️ Confirmation du propriétaire |
| 12 | Allégations P0 de l'accueil (A1–A3, A6, A7, C1) et P1 (D1, D3, B4) | ⚠️ Ne bloquent pas les nouvelles pages (elles ne les reprennent pas), mais bloquent toute campagne |
| 13 | À faire au moment de la publication : date « Last reviewed », JSON-LD de l'accueil (6 langues, `foundingDate`) | ⚠️ Petit lot de publication |
| 14 | Pages légales en production : débordement de 26 px à 320 px (existant) | ⚠️ Lot séparé recommandé |
| 15 | Votre autorisation explicite de déploiement | ❌ En attente |

**Verdict** : techniquement prêt ; publication **NO-GO** tant que les points 7 et 9 ne sont pas tranchés (et 15).
