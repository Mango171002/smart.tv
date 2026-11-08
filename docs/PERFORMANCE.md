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

## Après l'ajout des visuels

Voir le résumé du workflow « Deploy to Cloudflare » (onglet Actions de GitHub) : chaque déploiement
relance Lighthouse sur le site en ligne et **échoue si Performance, Accessibilité ou Bonnes
pratiques passent sous 90**.

## Choix qui gardent le site rapide

- Visuels en **SVG intégré** (pas d'images bitmap, aucune requête supplémentaire, rendu net sur tous les écrans).
- Pages pré-rendues au build et servies depuis le cache statique de Cloudflare.
- Pas de police web à télécharger (pile système), pas de script tiers, pas d'analytics.
- JavaScript client limité aux composants interactifs (menu, configurateur, paiement simulé, formulaires).
