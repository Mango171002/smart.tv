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
7. Contrôles SEO avant, pendant et après l'ouverture : voir la checklist ci-dessous.

## Checklist SEO de lancement d'un pays (validée le 18/11/2026)
Une version n'est ouverte que lorsque **toutes** les cases sont cochées. Rien n'est publié sans l'autorisation explicite du propriétaire.

### A. Prérequis bloquants (propriétaire)
- [ ] Droits de diffusion confirmés par écrit pour le pays (chaînes et VOD).
- [ ] Grille de prix du pays validée dans sa devise, TVA / taxes comprises ou indiquées selon le pays ; aucun prix converti automatiquement.
- [ ] Obligations légales locales validées par un juriste (mentions, rétractation, médiateur, cookies, données personnelles).
- [ ] Textes du pays relus par un locuteur natif ; aucune page générée ou dupliquée pour « remplir » la version.

### B. Contenu et métadonnées (aperçu privé)
- [ ] Chaque page a un titre unique ≤ 60 caractères et une description unique ≤ 155 caractères, fondée sur des faits de la page.
- [ ] Pas de contenu identique entre deux pays de même langue : une page n'existe dans une version que si elle y apporte une vraie différence (sinon renvoi vers la version qui l'héberge, comme les guides `/fr-fr`).
- [ ] Données structurées valides (Organization, WebSite, BreadcrumbList, FAQPage si FAQ) ; devise et langue du pays ; outil « Résultats enrichis » de Google sans erreur.
- [ ] Images : texte alternatif dans la langue du pays ; aucun logo ou marque de tiers.

### C. Technique (aperçu privé, puis build de production)
- [ ] Statut `preview` → `live` dans `src/i18n/locales.ts` (une seule ligne) ; les versions `preview` et `disabled` restent hors sitemap et en `noindex`.
- [ ] Balise `canonical` = l'URL de la version elle-même (jamais une autre version).
- [ ] `hreflang` réciproques entre toutes les versions live de la page, avec `x-default` → `/` et le repli de langue (`fr` → `/fr-fr`).
- [ ] Sitemap : la version apparaît avec ses alternates ; `lastmod` uniquement là où une date est imprimée sur la page.
- [ ] `robots` : `index, follow` sur la version ; l'aperçu `preview.sygmatv.com` reste protégé et en `noindex`.
- [ ] Commande : refusée côté serveur tant que la version n'est pas `live` ; e-mails et fiche Telegram dans la langue et la devise du pays.
- [ ] GA4 : `content_group` = la version ; événements clés inchangés ; aucune modification du suivi Google Ads.
- [ ] Tests : `npx vitest run`, Playwright production et aperçu, accessibilité (axe) sans violation, Lighthouse mobile ≥ 90 sur l'accueil et une page légale de la version.
- [ ] Non-régression de `/` : HTML identique hors changements prévus.

### D. Mise en ligne (après autorisation explicite)
- [ ] Déploiement isolé (uniquement les commits approuvés).
- [ ] Contrôle en ligne : statut 200, canonical, hreflang, sitemap, `X-Robots-Tag` absent sur la version.
- [ ] Search Console : sitemap soumis à nouveau, inspection de 3 à 5 URL de la version, demande d'indexation de l'accueil de la version.
- [ ] Bing Webmaster Tools : sitemap soumis (propriété importée depuis la Search Console).
- [ ] IndexNow : envoi automatique après le déploiement (pages ajoutées ou modifiées), ou workflow manuel « IndexNow (manual) » en mode `all`.

### E. Suivi
- [ ] J+7, J+14, J+30 : pages indexées de la version (Search Console › Indexation › Pages), erreurs `hreflang`, impressions et clics par pays.
- [ ] Conversions organiques (essais et pré-inscriptions, canal « Organic Search ») par version dans GA4.

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
