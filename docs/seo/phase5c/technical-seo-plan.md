# Phase 5C — Étape 4 : plan SEO technique, tests et risques

## 1. Interrupteur de publication (`NEXT_PUBLIC_CONTENT_PAGES`, lu à la compilation)

| Valeur | Effet | Usage |
|---|---|---|
| non défini (**production actuelle**) | Routes absentes (404), `/help` → 308 `/#faq` (inchangé), sitemap inchangé, aucun nouveau lien. **Site identique** (169 adresses comparées, 0 différence ; seule exception : la correction CSS du pied de page). | Production jusqu'à décision |
| `preview` | Pages rendues avec `noindex, follow`, **hors sitemap** ; menu « Help » → `/help` ; pied de page : « Help center », « About us » | Revue privée, tests, aperçus |
| `live` | Pages indexables, ajoutées au sitemap avec la date « Last reviewed », liens actifs | Publication (sur autorisation) |

Fichiers : `src/config/content-pages.ts`, `next.config.ts` (réécritures `/about`, `/help`, `/help/:topic` et
suppression de la redirection `/help` → `/#faq` **uniquement** si l'interrupteur est actif).

## 2. Adresses

- `/about`, `/help`, `/help/<sujet>` (7 sujets) — minuscules, tirets, sans barre finale, sans paramètre.
- Une seule adresse par page, canonique vers elle-même ; `/en/about`, `/en/help…` → 308 vers l'adresse sans préfixe
  (règle existante) ; adresses inconnues sous `/help/` → 404 à la charte (`dynamicParams = false`).
- `/help` remplace la redirection historique vers `/#faq` au moment de la publication (pas de perte : la FAQ reste sur
  l'accueil et le Help center y renvoie).

## 3. Métadonnées

- Titre unique ≤ 60 caractères (suffixe « | SYGMA TV+ » compris), description unique de 90 à 155 caractères
  (tableau dans `about-and-help.md`, test unitaire bloquant).
- Canonique absolue, Open Graph / X (image de partage existante), `robots` selon l'interrupteur.
- Un seul H1 par page ; « Last reviewed: {date} » visible = `lastmod` du sitemap.

## 4. Maillage interne (actif en `preview` et `live` seulement)

- En-tête : « Help » → `/help` (au lieu de `/#faq`).
- Pied de page, colonne « Links » : « Help center », « About us ».
- Hub → 6 « Popular questions » (liens directs vers les réponses, ex. `/help/ordering-payment#pay`) + 7 sujets (cartes).
- Chaque sujet → sommaire interne, sujet précédent/suivant, hub, page utile (`/legal/refunds`, `/legal/terms`, `/#plans`), boutons essai/support.
- About → Help center, Contact support, Plans, Refunds, CGU, Mentions légales (cartes « Useful links »).
- Ancres descriptives, aucun « click here ».

## 5. Fil d'Ariane et données structurées

- Fil d'Ariane visible (`nav aria-label="Breadcrumb"`, `aria-current="page"`) + `BreadcrumbList` identique (positions 1…n, URL absolues).
- `/about` : `AboutPage` (`about` et `mainEntity` → `#organization`, déjà décrite sur l'accueil).
- `/help` : `CollectionPage` avec `hasPart` (les 7 sujets).
- `/help/<sujet>` : `WebPage` `isPartOf` le hub.
- **Non utilisés** : `FAQPage` (résultats enrichis FAQ retirés de Google Search en 2026), `HowTo` (retiré). Le contenu
  en questions/réponses reste lisible pour les moteurs sans balisage dédié.

## 6. Sitemap

- `off` / `preview` : 6 URL actuelles (inchangé, test unitaire).
- `live` : + `/about`, `/help`, 7 × `/help/<sujet>` = 15 URL, `lastmod` = date « Last reviewed » (2026-11-20).
- Après publication : soumission du sitemap dans la Search Console et Bing, inspection de `/about`, `/help` et 2 sujets,
  IndexNow manuel (workflow « IndexNow (manual) », mode `urls`).

## 7. Tests réalisés (branche isolée)

| Contrôle | Résultat |
|---|---|
| Types, lint | OK |
| Tests unitaires | **112/112** (dont : longueurs titres/descriptions, unicité, absence d'allégations non vérifiées, faits société issus de la configuration, sitemap off/preview/live) |
| Comparaison production `864f703` ↔ branche (interrupteur off), 169 adresses dont `/about`, `/help`, `/help/*` | **0 différence** (statut, redirection, HTML visible, JSON-LD) ; CSS : seulement la correction du pied de page (+ utilitaire `.grid` inutilisé) |
| E2E mode production (off) | **161 réussis**, 0 échec (dont : pages absentes, `/help` → `/#faq`, aucun lien ajouté, sitemap inchangé) |
| E2E mode preview | **38/38** (9 pages : 200, titre ≤ 60, description ≤ 155, canonique, `noindex`, 1 H1, fil d'Ariane + `BreadcrumbList`, type de page, absence d'allégations, faits société, cartes et liens, navigation, axe WCAG 2.1 AA sur `/about`, `/help`, `/help/refunds` ordinateur + mobile, sommaire, précédent/suivant, boutons, clavier) |
| Responsive 320 → 1920 px (7 largeurs) | Aucun défilement horizontal ; pastilles et icônes du pied de page dans leur colonne |

## 8. Risques et mesures

| Risque | Niveau | Mesure |
|---|---|---|
| Publication accidentelle | Faible | Interrupteur absent en production = routes inexistantes ; test E2E « off » dans la CI |
| Pages indexées avant validation | Faible | `noindex` en `preview`, hors sitemap ; seul `live` les rend indexables |
| Contenu inexact | Moyen | Faits des pages légales + M1–M5, M9 (partiel), M10 validés ; M6, M7, M8 non publiés ; délais écrits « usually » (test bloquant) ; contradictions listées dans `finalisation.md` §3 |
| Incohérence avec les allégations du gabarit (en-tête, pied de page) | Moyen | Trancher A4/A5/B1 (voir `claims-decisions.md`) avant ou avec la publication |
| Promesse « Help centre » (D2) | — | Devient vraie à la publication ; sinon corriger D2 |
| `/help` changeait de comportement | Faible | Redirection historique conservée tant que `off` ; à la publication, `/help` devient la page d'aide (aucune perte de lien) |
| Chevauchement des pastilles du pied de page (1101–1400 px et < 400 px) | Faible (déjà en production) | **Corrigé dans la branche** (`finalisation.md` §5), non déployé |
| JavaScript client | Négligeable | En-tête et pied de page lisent l'interrupteur à la compilation : HTML identique en `off` ; seuls les noms de fichiers JS changent |

## 9. Mise en production proposée (sur autorisation explicite, plus tard)

1. Vos décisions : A4/A5/B1 pour le gabarit, D2, contradictions de `finalisation.md` §3 (statut pré-lancement, CGU).
2. Relecture finale des textes ; mise à jour de « Last reviewed ».
3. Déploiement du code avec l'interrupteur **off** (site identique, vérifiable), puis activation `live` par une
   variable de compilation dans le workflow de production (changement isolé et réversible), contrôles en ligne,
   Search Console, IndexNow manuel.
