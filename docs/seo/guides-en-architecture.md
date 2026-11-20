# Architecture SEO — pôle « Setup guides » en anglais (phase 5B, préparation)

**Statut : architecture proposée, NON implémentée et NON publiée.** Aucune route, aucune entrée de sitemap et
aucun lien n'existent dans le code. Les brouillons sont dans `docs/seo/guides-en-drafts.md`.

## 1. Objectif et intention de recherche

- Répondre à des recherches **pratiques et vérifiables** : « how to set up … on Fire TV / Samsung TV / Apple TV »,
  « watch on iPhone », « app keeps freezing on Fire Stick », etc. C'est la seule intention à forte valeur que le site
  peut servir honnêtement aujourd'hui, sans revendiquer de chaînes ni de contenus (droits non établis).
- Rendre vraie une promesse déjà affichée sur l'accueil : « Quick setup — Step-by-step guide per device »
  (`en.ts:157`, voir `claims-inventory.md` D1).
- Réduire la charge du support (étapes standard, dépannage) et rassurer avant l'essai gratuit.

## 2. Adresses (anglais = version internationale servie à la racine)

| Page | URL | Correspondance FR (Preview) |
|---|---|---|
| Pôle | `/guides` | `/fr-fr/guides` |
| Smart TV (Samsung, LG) | `/guides/smart-tv` | `/fr-fr/guides/smart-tv` |
| Android TV & Google TV | `/guides/android-tv` | `/fr-fr/guides/android-tv` |
| Fire TV | `/guides/fire-tv` | `/fr-fr/guides/fire-tv` |
| Apple TV | `/guides/apple-tv` | `/fr-fr/guides/apple-tv` |
| iPhone & iPad | `/guides/iphone-ipad` | `/fr-fr/guides/iphone-ipad` |
| Android phones & tablets | `/guides/android` | `/fr-fr/guides/android` |
| Computer (Windows, Mac) | `/guides/computer` | `/fr-fr/guides/ordinateur` |

- Minuscules, tirets, sans barre finale, sans paramètre ; une seule adresse par guide (canonique vers elle-même).
- Un seul jeu de guides par langue : `en-gb` / `en-ca`, s'ils ouvrent un jour, **renvoient** vers `/guides`
  (pas de copie), comme les versions FR renvoient vers `/fr-fr/guides` (logique `guidesFor()` existante en Preview).
- `hreflang` (uniquement quand les deux langues sont publiées) : `en` ↔ `fr-FR` (+ `fr`) + `x-default` → version EN.

## 3. Gabarit de page

Pôle `/guides` :
- H1 « Setup guides », introduction courte (rôle de l'équipe, accès envoyés sur WhatsApp).
- Grille de 7 cartes (icône de plateforme **générique**, aucun logo tiers), lien « Read the guide ».
- Bloc « Before you start » commun (connexion, accès WhatsApp), lien vers l'essai et vers la FAQ.

Guide `/guides/<appareil>` :
1. Fil d'Ariane visible : Home › Setup guides › {Device}.
2. H1 = titre du guide ; mention « Last reviewed: {date} » (date réelle de relecture → sert au `lastmod`).
3. Introduction (2–3 phrases, faits de plateforme).
4. « Before you start » (liste).
5. « Your access details » (bloc commun : identifiants + nom de l'application envoyés sur WhatsApp).
6. « Steps » (liste ordonnée, une action par étape).
7. « Common problems » (questions/réponses courtes).
8. « Need help? » + bouton essai gratuit + liens « Other guides ».

## 4. Métadonnées

- Titre ≤ 60 caractères, unique : « Set up SYGMA TV+ on Fire TV Stick & Cube » ; pôle : « Setup guides: TV, mobile & computer | SYGMA TV+ ».
- Description ≤ 155 caractères, factuelle, unique (brouillons fournis).
- `robots` : `index, follow` **seulement après validation** ; avant, la route n'existe pas en production.
- Open Graph / X : titre et description du guide, image de partage existante.

## 5. Données structurées

- `BreadcrumbList` sur le pôle et chaque guide (rich result pris en charge).
- **Pas** de `HowTo` (résultats enrichis retirés par Google) ni de `FAQPage` (résultats FAQ retirés de Google
  Search depuis 2026) : le contenu suffit.
- `Organization` reste sur l'accueil uniquement.

## 6. Maillage interne

- Liens vers `/guides` : menu principal (« Setup guides »), pied de page (colonne « Site »), section
  « Devices » de l'accueil (`guidesTitle` / `guidesText`), réponse FAQ « Which devices are compatible? ».
- Chaque guide → pôle, autres guides (même famille d'abord : TV ↔ boîtiers ; mobile ↔ tablette), formules (`/#plans`) et essai.
- Ancres descriptives (« Fire TV setup guide »), jamais « click here ».

## 7. Sitemap, indexation, IndexNow

- Ajout au sitemap **au moment de la publication seulement**, avec `lastmod` = date « Last reviewed » affichée.
- Après déploiement : inspection d'URL dans la Search Console pour le pôle + 2 guides ; IndexNow en envoi manuel
  (workflow « IndexNow (manual) », mode `urls`).
- Suivi : Search Console, filtre de page `/guides/` (impressions, clics, requêtes « set up / install »).

## 8. Conditions de publication (bloquantes)

1. **Nom de l'application officielle** à installer, confirmé par l'équipe **pour chaque plateforme**, disponible
   dans la boutique officielle de la plateforme et dans les pays visés.
2. **Test réel** de chaque étape sur un appareil de la plateforme (version récente), avec date et nom du testeur.
3. Aucune mention de chaînes, compétitions, contenus ou volumes ; aucune installation hors boutique officielle
   (pas de « sideloading », pas de fichier APK, pas d'« apps from unknown sources »).
4. Aucun logo ni marque tiers en image ; noms de plateformes cités en texte uniquement pour désigner l'appareil.
5. Relecture et validation écrite du propriétaire (technique + faits).
6. Mise à jour du texte de l'accueil `en.ts:157` (« Step-by-step guide per device ») seulement quand les guides sont en ligne.

## 9. Mise en œuvre prévue (après validation, en Preview d'abord)

- Contenu : `src/content/en/guides.ts` (même type `Guide` que `src/content/fr/guides.ts`).
- Routes : `src/app/[locale]/guides/page.tsx` et `src/app/[locale]/guides/[slug]/page.tsx` (`dynamicParams = false`,
  `generateStaticParams` sur les 7 guides), métadonnées via `buildMetadata`, `BreadcrumbList`.
- Sitemap : ajout des 8 URL avec `lastmod` réel ; tests unitaires (sitemap, métadonnées ≤ 60/155) et E2E
  (statut 200, canonique, fil d'Ariane, axe WCAG 2.1 AA, liens internes).
- Non-régression : HTML de `/` et des pages légales identique (hors liens ajoutés au menu/pied, validés au préalable).
