# Performance et qualité — audits Lighthouse

Mesures Lighthouse 13.6 sur le site en ligne (`/fr`, Cloudflare Workers).

## Avant l'ajout des visuels (8 novembre 2026)

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO* | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Mobile | 100 | 100 | 100 | 66 | 0,9 s | 80 ms | 0 |
| Ordinateur | 100 | 100 | 100 | 66 | 0,3 s | 0 ms | 0 |

\* **SEO 66 = volontaire.** Le seul point en échec est « la page est bloquée à l'indexation » :
le prototype est servi en `noindex` et `robots.txt` bloque tout. Passer
`NEXT_PUBLIC_ALLOW_INDEXING=true` au lancement donne 100.

## Après l'ajout des visuels SVG (8 novembre 2026)

| Profil | Performance | Accessibilité | Bonnes pratiques | SEO* | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Mobile | 98 | 100 | 100 | 66 | 0,9 s | 170 ms | 0 |
| Ordinateur | 100 | 100 | 100 | 66 | 0,3 s | 0 ms | 0 |

Les visuels n'ont pas dégradé l'affichage (LCP et CLS identiques) ; le léger écart mobile (TBT
80 → 170 ms, dans la marge de variation d'une mesure) reste très en dessous du seuil de 200 ms.

## Optimisation du 9 novembre 2026 (score retombé à 97-99)

Cause : TBT passé de 80 ms à 110-120 ms après l'ajout des visuels et de la pré-inscription.

| Correctif | Effet |
|---|---|
| Illustrations servies en **fichiers SVG statiques** (`public/visuals`, générés par `npm run visuals` à partir des composants) au lieu de SVG intégré — Next.js dupliquait le SVG dans la charge RSC | HTML de `/fr` : **132 Ko → 47 Ko** (gzip 18 → 9,5 Ko) ; fichiers SVG mis en cache (18 Ko au total) |
| Fenêtre de pré-inscription **chargée à la demande** (`next/dynamic`, préchargée au survol/focus du bouton) | ≈ 30 Ko de JavaScript en moins au démarrage |
| `browserslist` moderne (Chrome/Edge/Firefox 111+, Safari 16.4+) | Suppression des polyfills inutiles (≈ 14 Ko) |

## Suivi continu

Voir le résumé du workflow « Deploy to Cloudflare » (onglet Actions de GitHub) : chaque déploiement
relance Lighthouse sur le site en ligne et **échoue si Performance, Accessibilité ou Bonnes
pratiques passent sous 90**.

## Choix qui gardent le site rapide

- Visuels en **SVG intégré** (pas d'images bitmap, aucune requête supplémentaire, rendu net sur tous les écrans).
- Pages pré-rendues au build et servies depuis le cache statique de Cloudflare.
- Pas de police web à télécharger (pile système), pas de script tiers, pas d'analytics.
- JavaScript client limité aux composants interactifs (menu, configurateur, paiement simulé, formulaires).
