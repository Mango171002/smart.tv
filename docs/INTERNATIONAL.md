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

## Phase 2 (18/11/2026, aperçu uniquement)
- **Pages légales en français** (`src/content/fr/legal.ts`) : traduction fidèle des 5 pages anglaises, même structure (test). Seule adaptation : « prix dans la devise de votre pays » au lieu de « USD ».
- **FAQ** (`src/content/fr/faq.ts`, page `/fr-fr/faq`) : 10 questions, réponses limitées aux faits vérifiés ; 6 reprises à l'identique sur l'accueil. Données structurées `FAQPage` + `BreadcrumbList`.
- **Guides d'installation** (`src/content/fr/guides.ts`, `/fr-fr/guides` + 7 pages) : Smart TV (Samsung, LG), Android TV / Google TV, Fire TV, Apple TV, iPhone et iPad, Android, ordinateur. Un seul jeu de guides par langue (hébergé par `/fr-fr`) : les autres versions françaises y renvoient, pas de pages dupliquées.
- **Versions en aperçu** : `/fr-be`, `/fr-ch`, `/fr-ca`, `/en-gb`, `/en-ca` — dictionnaire de la langue + vraies différences du pays (`src/i18n/variants.ts` : devise et taxes, orthographe en-GB, « courriel » au Québec, réponse « prix » de la FAQ). Pas de prix, pas de commande.

## Points à valider avant toute mise en production
### Juridique (juriste)
1. Traduction des CGU, confidentialité, cookies, remboursement, mentions légales (fidélité et termes juridiques).
2. **Médiateur de la consommation** : obligatoire pour vendre à des consommateurs en France (Code de la consommation, art. L612-1) — absent aujourd'hui.
3. **Hébergeur et directeur de la publication** dans les mentions légales (LCEN, art. 6) : retirés à la demande du propriétaire, exigés pour un site visant la France.
4. **Rétractation de 14 jours** pour un service commencé immédiatement (accord exprès, remboursement au prorata) et **formulaire type de rétractation**.
5. Droit applicable (Nouveau-Mexique) face aux règles impératives des pays ciblés.
6. RGPD : représentant dans l'UE / au Royaume-Uni (art. 27), autorité de contrôle citée par pays.
7. Suisse : pas de droit légal de rétractation pour la vente en ligne (réponse FAQ adaptée) ; nLPD. Canada : lois provinciales (Québec : loi 96, Loi sur la protection du consommateur). Royaume-Uni : Consumer Contracts Regulations, UK GDPR.
8. TVA (guichet unique OSS pour l'UE, TVA britannique, TPS/TVQ au Canada, TVA suisse).
### Commercial / produit (propriétaire)
9. **Droits de diffusion** de chaque pays ciblé.
10. **Grilles de prix** par devise (EUR, CHF, GBP, CAD) — aucune n'existe ; aucun prix n'est affiché.
11. Chiffres « +35 000 chaînes », « +200 000 films et séries » (non vérifiés).
12. **Application à installer par appareil** : les guides ne la nomment pas ; à compléter dès confirmation par l'équipe (nom exact, appareils réellement compatibles).
13. Moyens de paiement réellement acceptés (FAQ « paiement » volontairement générique).
14. Relecture native : français de France, de Belgique, de Suisse et du Québec ; anglais britannique et canadien.
