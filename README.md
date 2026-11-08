# IPTV International — site vitrine (prototype non commercial)

> ⚠️ **Prototype de design.** Aucune vente, aucun paiement, aucune activation. Les droits de
> redistribution, les prix, les territoires et l'identité commerciale ne sont **pas vérifiés**.
> `GlobalTV+` est un **nom provisoire**.

**Hébergement : GitHub (code + CI) · Supabase (base de données) · Cloudflare Workers (site).**
Aucune installation locale n'est nécessaire.

Next.js 16 · TypeScript · Tailwind v4 · OpenNext Cloudflare · Supabase (Postgres 17, RLS) · Vitest · Playwright + axe.

## Mise en ligne sur Cloudflare (une seule fois, depuis le navigateur)

1. Cloudflare → **Workers & Pages** → **Create** → **Import a repository**.
2. Autoriser GitHub et choisir `Mango171002/smart.tv`.
3. Paramètres du projet :

   | Champ | Valeur |
   |---|---|
   | Project name | `iptv-international` (doit être identique au `name` de `wrangler.jsonc`) |
   | Production branch | `claude/intelligent-shannon-uwa4fi` (ou `main` après fusion) |
   | Build command | `npx opennextjs-cloudflare build` |
   | Deploy command | `npx opennextjs-cloudflare deploy` |
   | Root directory | `/` |

4. **Deploy**. Chaque push sur la branche redéploie automatiquement le site.

   variable de build `NEXT_PUBLIC_SITE_URL` (Settings → Build → Variables) puis redéployer, pour des
   URL canoniques et un sitemap exacts.

La configuration non secrète (URL Supabase, clé publishable, options) est déjà dans
`wrangler.jsonc` et `.env.production`. **Aucun secret n'est requis** pour le prototype.

Alternative : workflow GitHub manuel `.github/workflows/deploy-cloudflare.yml` (nécessite les
secrets `CLOUDFLARE_API_TOKEN` et `CLOUDFLARE_ACCOUNT_ID`, à créer par vous).

## Contrôles automatiques (GitHub Actions)

À chaque push : lint, typecheck, tests unitaires/API, build Next.js, tests E2E desktop + mobile
avec audit d'accessibilité, build du bundle Cloudflare, et migrations + 48 tests de sécurité SQL
sur PostgreSQL.

## Pages

`/{en|fr}` accueil · `/plans` offres + grille complète · `/devices` · `/coverage` · `/help`
(FAQ, question, notification de lancement) · `/legal/{terms,privacy,cookies,refunds,imprint}` (brouillons).
Les URL sans langue (`/`, `/plans`…) redirigent selon le cookie de langue, puis le navigateur.

## API (Cloudflare Worker)

| Route | Description |
|---|---|
| `POST /api/quote` | Devis faisant foi, calculé côté serveur (validation, same-origin, 60 req/min/IP) |
| `POST /api/contact` | Question / liste de lancement → Supabase (`anon`, INSERT seul), consentement obligatoire, pot de miel, limite par IP + limite en base |
| `POST /api/checkout` | **Verrouillé** : 403 `sales_disabled` avec la liste des blocages |
| `POST /api/webhooks/payment` | Vérification HMAC + enregistrement idempotent ; désactivé sans secret |
| `GET /api/health` | État, mode, source des prix |

## Structure

```
src/app/[locale]/…        pages pré-rendues, layout, 404
src/app/api/…             routes serveur (exécutées dans le Worker)
src/components/…          UI (configurateur, paiement simulé, formulaires…)
src/config/site.ts        configuration business (null = décision en attente)
src/config/launch-gate.ts verrou de lancement
src/lib/…                 prix, validation, sécurité, Supabase (serveur uniquement)
src/i18n/…                dictionnaires EN/FR
supabase/migrations/      schéma, RLS, privilèges explicites
supabase/tests/           tests SQL de sécurité
wrangler.jsonc            configuration Cloudflare Worker
open-next.config.ts       adaptateur OpenNext
docs/                     audit, décisions, base de données, cahier des charges d'origine
prototype/                prototype HTML d'origine (référence)
```

## Commandes (pour un développeur, facultatif)

| Commande | Rôle |
|---|---|
| `npm run dev` · `npm run build` | Next.js |
| `npm run lint` · `npm run typecheck` · `npm test` | Qualité et tests unitaires |
| `npm run test:e2e` | E2E (après `npm run build`) ; `E2E_BASE_URL=<url>` pour cibler un site déjà en ligne |
| `npm run cf:preview` | Aperçu dans le runtime Cloudflare (workerd) |
| `npm run db:test` | Migrations + tests SQL sur un PostgreSQL local |

Voir [`docs/AUDIT.md`](docs/AUDIT.md), [`docs/DECISIONS.md`](docs/DECISIONS.md) et [`docs/DATABASE.md`](docs/DATABASE.md).
