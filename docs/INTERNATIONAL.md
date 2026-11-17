# Versions internationales (SEO) — mode d'emploi

Décisions : D69 (phase 1, 17/11/2026), D42 annulée.

## Principe
- `src/i18n/locales.ts` est la **seule** source : une ligne par version (URL, langue, `hreflang`, marché de prix, monnaie, état).
- États : **en ligne** (publique, indexable, commandes ouvertes) · **aperçu** (uniquement sur l'environnement privé) · **désactivée** (déclarée, jamais construite).
- `/` reste la version anglaise (USD), `hreflang="en"` + `x-default`. Les autres versions ont un préfixe sans barre finale : `/fr-fr`, `/fr-fr/legal/terms`…
- Pas de redirection automatique selon l'IP ou la langue du navigateur.

## Ce qui est automatique
- `hreflang` (pages + sitemap) entre versions **en ligne** uniquement, avec `x-default` vers `/`.
- Canonical vers soi-même, `<html lang>`, Open Graph, JSON-LD `WebSite` dans la langue (une seule `Organization`).
- Formats de date, nombre et monnaie selon la version.
- Prix : grille du marché de la version, lue en base, dans sa monnaie. **Jamais de conversion.** Sans grille complète : « Prix bientôt disponibles ».
- Commandes : refusées par le serveur pour toute version qui n'est pas en ligne (`src/lib/validation.ts`).

## Aperçu privé
- Worker séparé `sygma-tv-preview`, https://preview.sygmatv.com (`wrangler.preview.jsonc`, workflow `.github/workflows/preview.yml`, branche `claude/seo-phase1-preview`).
- Mot de passe : secret GitHub `PREVIEW_PASSWORD` (sans lui, l'aperçu reste verrouillé, HTTP 503). Identifiant : n'importe lequel.
- Tout est `noindex`, toutes les routes `/api/*` sont refusées sauf `/api/health`, aucune tâche planifiée, aucun secret de production.
- Tests : `npx playwright test -c playwright.preview.config.ts` (voir l'en-tête du fichier).

## Ouvrir un pays (checklist)
1. Droits de diffusion vérifiés pour ce pays (écrit).
2. Grille de prix fixe dans la monnaie du pays, validée par le propriétaire, ajoutée en base (migration, marché + prix).
3. Dictionnaire de la langue relu par un natif ; variantes du pays si besoin.
4. Pages légales traduites et relues (CGU, remboursement, confidentialité, cookies, mentions).
5. Migration : `contact_requests.locale` accepte la nouvelle version ; e-mails et fiches Telegram dans la bonne langue / monnaie.
6. Statut `preview` → vérification sur l'aperçu → statut `live` (une seule ligne) → déploiement sur autorisation.
7. Search Console / Bing : soumettre le sitemap, surveiller les erreurs `hreflang`.
