# IPTV International — site vitrine (prototype non commercial)

> ⚠️ **Prototype de design.** Aucune vente, aucun paiement, aucune activation. Les droits de
> redistribution, les prix, les territoires et l'identité commerciale ne sont **pas vérifiés**.
> `GlobalTV+` est un **nom provisoire**.

Next.js 16 · TypeScript · Tailwind v4 · Supabase (Postgres 17, RLS) · Vitest · Playwright + axe.

## Démarrage

```bash
npm install
cp .env.example .env.local   # puis renseigner SUPABASE_PUBLISHABLE_KEY (facultatif)
npm run dev                  # http://localhost:3000
```

Sans variables Supabase, le site fonctionne avec la grille indicative intégrée et les
formulaires de contact sont désactivés.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build de production / serveur |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm test` | Tests unitaires et API (Vitest, 50 tests) |
| `npm run test:e2e` | E2E Playwright desktop + mobile, accessibilité axe (lancer `npm run build` avant) |
| `npm run db:test` | Migrations + seed + 48 tests de sécurité SQL sur un PostgreSQL local |
| `node scripts/generate-prototype-prices.mjs` | Régénère la grille indicative et `supabase/seed.sql` |

Dans un environnement où Chromium est préinstallé : `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run test:e2e`.

## Pages

`/{en|fr}` accueil · `/plans` offres + grille complète · `/devices` · `/coverage` · `/help`
(FAQ, question, notification de lancement) · `/legal/{terms,privacy,cookies,refunds,imprint}` (brouillons).

## API

| Route | Description |
|---|---|
| `POST /api/quote` | Devis faisant foi, calculé côté serveur (validation zod, same-origin, 60 req/min/IP) |
| `POST /api/contact` | Question / liste de lancement → Supabase (`anon`, INSERT seul), consentement obligatoire, pot de miel, 5 req/10 min/IP + limite en base |
| `POST /api/checkout` | **Verrouillé** : 403 `sales_disabled` avec la liste des blocages |
| `POST /api/webhooks/payment` | Vérification HMAC + enregistrement idempotent ; désactivé sans secret |
| `GET /api/health` | État, mode, source des prix |

## Structure

```
src/app/[locale]/…        pages (SSG/ISR), layout, 404
src/app/api/…             routes serveur
src/components/…          UI (configurateur, dialogue de paiement simulé, formulaires…)
src/config/site.ts        configuration business (placeholders = décisions en attente)
src/config/launch-gate.ts verrou de lancement
src/lib/…                 prix, validation, sécurité, Supabase (serveur uniquement)
src/i18n/…                dictionnaires EN/FR
supabase/migrations/      schéma, RLS, privilèges explicites
supabase/tests/           tests SQL de sécurité
docs/                     audit, décisions, base de données, cahier des charges d'origine
prototype/                prototype HTML d'origine (référence)
```

Voir [`docs/AUDIT.md`](docs/AUDIT.md), [`docs/DECISIONS.md`](docs/DECISIONS.md) et [`docs/DATABASE.md`](docs/DATABASE.md).
