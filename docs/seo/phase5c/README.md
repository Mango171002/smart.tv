# Phase 5C — Contenu SEO et confiance (branche isolée `claude/seo-phase5c-preview`)

Base : production `864f703`. Rien n'est déployé ni publié. Aucune migration, aucun changement de prix, de commande,
de GA4, GTM, Google Ads ou consentement, Preview internationale intacte, `350882a` exclu.

| Livrable | Document |
|---|---|
| 1. Revue des 25 allégations (priorités, preuves, formulations, blocage) | `claims-decisions.md` |
| 2. Page About us (proposition implémentée, non publiée) | `about-and-help.md` §1 |
| 3. Help center : architecture, brouillons (implémentés, non publiés), informations manquantes | `about-and-help.md` §2–4 ; contenu `src/content/en/info.ts` |
| 4. Aperçus ordinateur et mobile | joints au rapport de session (build `preview`) |
| 5. Plan SEO technique (adresses, métadonnées, maillage, fil d'Ariane, données structurées, sitemap) | `technical-seo-plan.md` |
| 6. Tests et risques | `technical-seo-plan.md` §7–8 |
| 7. **Finalisation (20/11/2026)** : M1–M10, allégations P0/P1 bloquées, décisions A4/A5/B1/D2, contradictions, pied de page, tests | **`finalisation.md`** |

Voir les pages en local :

```bash
NEXT_PUBLIC_CONTENT_PAGES=preview npx next build && NEXT_PUBLIC_CONTENT_PAGES=preview npx next start
```

Tests des pages (build preview) : `E2E_CONTENT_PAGES=preview npx playwright test tests/e2e/content-pages.spec.ts tests/e2e/responsive.spec.ts`.
