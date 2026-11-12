# IPTV International — site de pré-lancement

> **Mode pré-lancement.** Le site présente l'offre et enregistre de vraies pré-inscriptions
> (Supabase). **Aucune vente ni aucun paiement** tant que les licences de diffusion, l'entité
> juridique et le prestataire de paiement ne sont pas en place (verrou `src/config/launch-gate.ts`
> + contraintes en base). `GlobalTV+` reste un **nom provisoire** (configurable).

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

**Déploiement actuel :** GitHub Actions (`.github/workflows/deploy-cloudflare.yml`) déploie à chaque
push sur `https://sygmatv.com`. Il nécessite un seul secret
GitHub : `CLOUDFLARE_API_TOKEN` (Settings → Secrets and variables → Actions).

La configuration non secrète (URL Supabase, clé publishable, options) est déjà dans
`wrangler.jsonc` et `.env.production`. **Aucun secret n'est requis** pour le prototype.


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
