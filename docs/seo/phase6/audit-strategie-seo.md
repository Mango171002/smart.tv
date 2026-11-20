# Phase 6 — Audit SEO commercial et stratégie de référencement (20/11/2026)

**Audit et recommandations uniquement.** Branche isolée `claude/seo-phase6-audit`, créée depuis la production
`864f703` (indépendante de la Phase 5C). Aucun déploiement, aucune fusion, aucune modification du site, des
commandes, paiements, prix, e-mails, Telegram ou WhatsApp. `350882a` absent.

**Sources de cet audit** : pages publiques de https://sygmatv.com (robots.txt, sitemap, accueil, blog, 2 pages
légales, variantes d'hôte), code de production `864f703`, code de la branche Preview internationale `6f57746`,
3 mesures Lighthouse mobile (laboratoire), recherches web sur la composition des pages de résultats (qualitatif).
**Aucune donnée Search Console, aucun volume de recherche, aucune position** : ils ne sont pas disponibles ici et ne
sont pas inventés.

---

## Synthèse — ce qu'il faut faire d'abord

1. **Décider du positionnement « IPTV » avant toute page qui vise ces mots.** Les pages de résultats pour
   « IPTV subscription », « abonnement IPTV » ou « IPTV free trial » sont dominées par des pages parasites et des
   revendeurs ; Google rétrograde les sites qui reçoivent beaucoup de notifications de droit d'auteur valides et
   Google Ads n'accepte pas la promotion de contenus protégés sans autorisation. Avec des droits de diffusion non
   établis (marchés `licensed: false`), viser ces requêtes expose la marque plus qu'elle ne lui rapporte.
2. **Sortir de la page unique.** Le site n'a qu'une page commerciale indexable (l'accueil, avec des ancres
   `#plans`, `#how`, `#faq`) : impossible de répondre à des intentions différentes (essai, appareils, installation,
   prix, remboursement). Les pages About et Help center de la Phase 5C sont prêtes ; les guides d'installation
   dépendent de la vérification des applications.
3. **Assainir la seule page commerciale.** Le H1 (« Sports »), les volumes de chaînes et de films, le replay et
   « The best IPTV experience » sont des allégations non prouvées sur la page qui porte tout le référencement.
4. **Mesurer.** Aucune vérification Search Console n'est visible dans le dépôt ni dans le HTML : confirmer l'accès
   (propriété de domaine par DNS possible) et exporter une base de référence avant tout changement.

---

## 1. Audit SEO de l'existant

### 1.1 Pages indexables (production) et pages en Preview

| URL | Statut | robots | Sitemap | Observation |
|---|---|---|---|---|
| `/` | 200 | `index, follow` | oui (sans `lastmod`) | Seule page commerciale. Titre « SYGMA TV+ — International Streaming Subscription », H1 « Premium streaming. Sports, Movies, Live TV. », ~430 mots dans `<main>`, JSON-LD `Organization` + `WebSite` |
| `/legal/terms`, `/legal/privacy`, `/legal/cookies`, `/legal/refunds`, `/legal/imprint` | 200 | `index, follow` | oui (`lastmod` réels) | Titres et descriptions uniques ; pas de JSON-LD (normal) |
| `/blog` | 200 | `noindex, follow` | non | « First articles coming soon » — exclusion volontaire et correcte tant qu'il est vide ; non lié depuis la navigation |
| `/about`, `/help/*` | 404 / 308 → `/#faq` | — | non | Prêtes dans la branche Phase 5C (désactivées) |
| `/en` | 308 → `/` | — | — | Une seule version anglaise, à la racine |
| 404 | 404 | `noindex` | — | Page 404 à la charte (déployée) |

**Preview internationale** (branche `claude/seo-phase1-preview`, environnement protégé par mot de passe,
`X-Robots-Tag: noindex`) : 6 versions en `preview` (`fr-fr`, `fr-be`, `fr-ch`, `fr-ca`, `en-gb`, `en-ca`) et 5
désactivées (`fr-ma`, `de-de`, `de-ch`, `es-es`, `nl-be`). Contenu FR : accueil, FAQ, 9 guides d'installation
(brouillons), pages légales. **Rien de cela n'est indexable** ; une version ne passe `live` qu'après validation des
droits de diffusion, des prix et des mentions légales du pays (règle du code).

### 1.2 Constats classés

**P0 — bloquant pour l'objectif (plus de demandes d'abonnement depuis Google)**

| # | Constat | Preuve | Action |
|---|---|---|---|
| P0-1 | **Risque « IPTV » non arbitré.** Les requêtes cibles sont des requêtes à haut risque juridique et réputationnel. | Pages de résultats observées le 20/11/2026 : « IPTV subscription plans » et « IPTV Smarters Pro compatible subscription » renvoient surtout des pages hébergées sur des domaines tiers (dépôts de code, PDF sur des domaines publics, blogs de boutiques), typiques du « parasite SEO » ; « abonnement IPTV essai gratuit » renvoie des comparatifs d'affiliation. Base de données : marchés US/CA/EU `licensed=false`. | Décision du propriétaire (§2.3) avant toute page visant « IPTV ». Ne pas créer de page de vente « IPTV » tant que les droits ne sont pas établis. |
| P0-2 | **Une seule URL commerciale indexable.** Prix, essai, appareils, installation, remboursement, FAQ : tout est sur `/` via des ancres. | Liens internes de l'accueil : `/#plans`, `/#how`, `/#faq`, `/#featured` + pages légales uniquement. Sitemap : 6 URL. | Publier les pages Phase 5C (après leurs décisions) puis les guides vérifiés (§3). |
| P0-3 | **Allégations non prouvées sur la page qui porte tout le référencement.** | HTML de `/` : H1 « Sports, Movies, Live TV » ; « Access up to 35,000+ TV channels and 200,000+ movies & series » ; comparatif « +12,000 … +35,000 » chaînes, « +100,000 … +200,000 » VOD ; « replay » (6 occurrences) ; « Ready to watch TV from around the world? » ; FAQ « Which countries are available? The United States, Canada and Europe. » | Appliquer les formulations prudentes déjà préparées (Phase 5C, `validation-finale.md` §4) et §4 ci-dessous. |

**P1 — important**

| # | Constat | Preuve | Action |
|---|---|---|---|
| P1-1 | Mesure absente du dépôt | Aucun `google-site-verification` ni `msvalidate.01` dans le code ou le HTML ; une clé IndexNow est publiée et le workflow IndexNow est en mode essai. | Vérifier la propriété Search Console (domaine, DNS) et Bing Webmaster ; checklist §6. **À vérifier** : la propriété peut déjà exister via DNS. |
| P1-2 | Titre et H1 de l'accueil peu alignés sur ce que cherchent les visiteurs, H1 porteur d'une allégation | Titre « …International Streaming Subscription » ; H1 « Premium streaming. Sports, Movies, Live TV. » | Copywriting §5 (variante A maintenant, B après preuve des droits sportifs). |
| P1-3 | Données d'entité incomplètes | JSON-LD : `sameAs` Facebook = lien de partage (`/share/…`), WhatsApp sans forme canonique ; `contactPoint.availableLanguage` = anglais seul (le support parle 6 langues) ; pas de `foundingDate`. | Mettre à jour lors de la publication 5C (`foundingDate: "2026"`, 6 langues, URL canoniques confirmées par le propriétaire). |
| P1-4 | Aucune page d'aide à l'installation publiée, alors que l'accueil promet « Step-by-step guide per device » | Allégation D1 ; guides EN en brouillon (Phase 5B), guides FR en Preview. | Plan de vérification des applications puis guides (§3). |
| P1-5 | Pied de page avec allégations (sports, chaînes internationales, « HD to 4K ») sur toutes les pages | Corrigé dans la branche Phase 5C (non déployé). | Déployer avec la Phase 5C sur autorisation. |

**P2 — utile**

| # | Constat | Preuve | Action |
|---|---|---|---|
| P2-1 | Double redirection pour `http://www.sygmatv.com/` | `http://www` → 301 `https://www` → 308 `https://sygmatv.com/` (2 sauts) | Règle Cloudflare unique `http://www` → `https://sygmatv.com/`. Impact faible. |
| P2-2 | Accueil sans `lastmod` dans le sitemap | Choix délibéré (date réelle seulement) | Garder ; ajouter un `lastmod` réel quand le contenu de l'accueil change. |
| P2-3 | Performance mobile (laboratoire) bonne | Lighthouse mobile ×3 sur `/` : performance 92 / 93 / 97, LCP 1,9 / 2,8 / 2,2 s, TBT 320 / 190 / 130 ms, CLS 0 ; SEO 100, accessibilité 100. Image du hero préchargée en priorité haute ; 38 images sur 40 en chargement différé. | Données terrain **à vérifier** (rapport Core Web Vitals de la Search Console ; le site est peut-être trop récent pour CrUX). |
| P2-4 | Pas de `hreflang` | Une seule langue en ligne | Correct ; à ajouter seulement quand une seconde version sera `live`. |

Non-problèmes (pas d'action) : absence de `meta keywords`, longueur des textes, nombre de H1, `priority`/`changefreq`
du sitemap, `noindex` du blog vide, `Disallow: /api/`.

---

## 2. Recherche de mots-clés et intentions

### 2.1 Méthode et limites

Analyse qualitative des pages de résultats (recherches du 20/11/2026, résultats « US ») et du métier. **Volumes :
non mesurés** (à obtenir dans la Search Console après publication ; Google Keyword Planner peut restreindre ces
termes). **Positions : non mesurées.**

### 2.2 Tableau des mots-clés et intentions

| Requête (EN / FR) | Intention | Ce que montre la page de résultats | Adéquation SYGMA TV+ | Risque | Page cible | Décision |
|---|---|---|---|---|---|---|
| iptv subscription / abonnement iptv | Transactionnelle | Pages parasites, revendeurs, comparatifs « best » | Faible tant que les droits ne sont pas établis | **Élevé** (droit d'auteur, rétrogradation, Ads) | — | **Ne pas cibler** avant preuve des droits |
| iptv subscription plans / abonnement iptv prix | Commerciale | Idem ; prix « teaser » | Moyenne (formules réelles) | Élevé | `/` (#plans) puis éventuellement `/plans` | Après droits ; formuler « streaming plans » |
| iptv for smart tv / iptv smart tv samsung lg | Mixte : comment faire + achat | Guides d'installation génériques | **Bonne** si l'application est vérifiée | Moyen (marques d'appareils citées en texte seulement) | `/guides/smart-tv`, `/help/devices` | **Prioritaire après vérification des apps** |
| iptv free trial / test iptv gratuit 24h | Transactionnelle | Listes d'essais 24 h, certains payants | Bonne (essai gratuit réel, sans carte) | Élevé (même univers) | `/help/free-trial` | Page utile publiée avec la 5C ; ne pas viser le mot « IPTV » |
| iptv smarters compatible subscription | Navigationnelle / transactionnelle | Guides promotionnels liés à des vendeurs | Inconnue (app non vérifiée : fiche Google Play introuvable lors du contrôle 5C) | **Élevé** (marque tierce, affiliation implicite) | Guide par appareil, mention textuelle de l'app | **Bloqué** jusqu'à vérification M7 ; jamais « official » ni logo |
| iptv setup guide / installer iptv | Informationnelle | Guides génériques, souvent de vendeurs | **Bonne** | Faible si étapes testées, boutiques officielles uniquement | `/guides` + guides | Prioritaire après vérification |
| sygma tv, sygma tv+ | Navigationnelle (marque) | — (à mesurer) | **Excellente** | Nul | `/`, `/about` | À protéger : About, `Organization`, profils sociaux |
| streaming subscription for smart tv / abonnement streaming smart tv | Commerciale | (non observé) | Bonne, formulation sûre | Faible | `/`, `/help/devices` | Cible principale « sûre » |
| what is iptv / iptv c'est quoi / iptv légal | Informationnelle | (non observé) | Bonne pour l'éducation | Moyen : ne pas affirmer que SYGMA TV+ est « legal IPTV » sans licences | Article de blog | Possible, rédaction neutre |
| best iptv / meilleur iptv | Comparative | Listes d'affiliation | Mauvaise (auto-classement non crédible) | Élevé | — | **Ne pas cibler** |
| iptv france / iptv uk / iptv usa | Locale transactionnelle | — | Dépend des droits par pays | **Élevé** | — | **Interdit** avant droits du pays (F1) |

### 2.3 Décision requise : usage du mot « IPTV »

| Option | Description | Avantages | Risques |
|---|---|---|---|
| **A (recommandée maintenant)** | Positionnement « streaming subscription / abonnement streaming », sans viser « IPTV » dans les titres, H1 ou URL. Le mot peut apparaître dans un article explicatif neutre. | Cohérent avec des droits non établis ; compatible Ads ; image premium | Moins de trafic sur ces requêtes (qui sont aussi les plus risquées) |
| B (après preuve des droits) | Titres « Live TV & IPTV subscription » sur l'accueil et les formules, avec les catégories effectivement licenciées | Couvre l'intention exacte | Concurrence saturée de spam ; vigilance juridique continue |
| C (déconseillée) | Pages dédiées « IPTV subscription », « IPTV free trial », « IPTV Smarters subscription » | — | Rétrogradation, retraits, refus publicitaires, contradiction avec F1 |

---

## 3. Architecture SEO proposée

### 3.1 Principes

- **Une page par besoin réel du visiteur**, jamais une page par mot-clé.
- **Une langue = une version** tant que le contenu ne change pas par pays. Les versions par pays (`fr-fr`, `fr-be`,
  `fr-ch`, `fr-ca`, `en-gb`, `en-ca`) ne se justifient que si **prix, devise, mentions légales ou disponibilité**
  diffèrent réellement — et seulement après validation des droits du pays. Sinon : une seule version FR, sans copies.
- `hreflang` uniquement entre versions publiées et équivalentes, avec `x-default` → anglais.
- Pas de pages « IPTV + ville/pays », pas de listes « best IPTV », pas de pages de marque d'application non vérifiée,
  pas de listes de chaînes non licenciées.

### 3.2 Arborescence (anglais à la racine ; français quand une version FR sera `live`)

| URL | Type | Utilité pour le visiteur | Statut / condition |
|---|---|---|---|
| `/` | Commerciale | Offre, formules, essai, FAQ courte | En ligne — corriger les allégations (P0-3) |
| `/plans` *(optionnel)* | Commerciale | Comparatif détaillé des 3 formules, durées, appareils, remise | Seulement si le contenu dépasse la section `#plans` ; sinon garder l'ancre (pas de doublon) |
| `/about` | Confiance | Société, parcours, support | Prête (5C) |
| `/help` + 7 sujets | Assistance | Essai, commande, appareils, dépannage, contact, remboursement | Prête (5C) |
| `/guides` + `/guides/<plateforme>` (Smart TV, Android TV/Google TV, Fire TV, Apple TV, iPhone/iPad, Android, ordinateur) | Assistance + acquisition | **Compatibilité et installation sur la même page** (évite des pages « compatibilité » minces en double) | Après vérification des apps et test réel par plateforme (plan 5B) |
| `/blog/<article>` | Informationnelle | Sujets utiles (§3.3) | Lever le `noindex` du blog quand 3 articles existent |
| `/legal/*` | Légale | — | En ligne |
| `/fr/…` ou `/fr-fr/…` | Version FR | Mêmes pages, traduites | Après droits FR ; une seule version si le contenu ne diffère pas par pays |

### 3.3 Pages utiles vs pages « à mots-clés »

| Utile (à faire) | Uniquement pour capter des mots-clés (à éviter) |
|---|---|
| Guides par plateforme testés (étapes, captures, problèmes fréquents) | « IPTV subscription USA / UK / France » sans différence réelle |
| Help center (essai, commande assistée, remboursement) | « Best IPTV 2026 » / « Top 10 IPTV » |
| Article « What is IPTV? How to choose a legal service » (neutre, sans promesse) | « IPTV Smarters subscription » sans app vérifiée |
| Article « Wi-Fi or cable for streaming? Stop buffering » | Pages de listes de chaînes ou de compétitions sans droits |
| Article « How to check your TV before subscribing » (relié à l'essai) | Pages « free IPTV » |

---

## 4. Copywriting — pages prioritaires (propositions, non appliquées)

Contraintes respectées : pas de licences ni droits revendiqués, pas de « toutes les chaînes », pas de 4K garantie,
pas de détail fournisseur ou panneau, délais « usually ». Longueurs : titres ≤ 60, descriptions ≤ 155 caractères
(suffixe « | SYGMA TV+ » compris).

### 4.1 Accueil

| Élément | Actuel | Variante A — maintenant | Variante B — après preuve des droits (sports, chaînes) |
|---|---|---|---|
| Title | SYGMA TV+ — International Streaming Subscription | **SYGMA TV+ — Streaming subscription for TV, mobile & computer** (60) | SYGMA TV+ — Live TV, sports, movies & series subscription (57) |
| Meta description | SYGMA TV+: One World. Endless Entertainment. International streaming plans for 1 to 4 devices on Smart TV, mobile and computer. Order online in minutes. | **Live TV, movies and series on Smart TV, mobile and computer. Yearly plans from $59, free 24-hour trial, 24/7 support in 6 languages.** (132) | Live TV, sports, movies and series on Smart TV, mobile and computer. Yearly plans from $59, free 24-hour trial and 24/7 multilingual support. (141) |
| H1 | Premium streaming. Sports, Movies, Live TV. | **Premium streaming. Movies, series and live TV.** | Premium streaming. Live TV, sports, movies and series. |
| Accroche | A complete streaming experience: live sports, on-demand movies and series, and international channels on all your screens. | **Movies, series and live TV on your TV, mobile and computer — with a free trial first and a real team to help you on WhatsApp.** | Ajouter les catégories licenciées, par pays |
| Bandeau final | Access up to 35,000+ TV channels and 200,000+ movies & series, in HD to 4K HDR… | **Live TV, movies and series on all your screens, in HD to 4K where available. Free trial first, 7-day money-back guarantee.** | Volumes uniquement avec contrats à l'appui |
| FAQ « Which countries are available? » | The United States, Canada and Europe. | **Our team confirms availability for your country before you order — ask for a free trial to check it on your own device.** | Liste des pays effectivement licenciés |

Prix « $59 » : à synchroniser avec la base de prix (source de vérité) au moment de la publication.

### 4.2 Version française (quand `live`)

| Élément | Proposition |
|---|---|
| Title accueil | SYGMA TV+ — Abonnement streaming TV, mobile et ordinateur (57) |
| Meta accueil | TV en direct, films et séries sur Smart TV, mobile et ordinateur. Formules annuelles, essai gratuit de 24 h et assistance 24/7 en 6 langues. (140) |
| H1 accueil | Le streaming premium. Films, séries et TV en direct. |
| Formules | Abonnement et tarifs : Starter, Plus, Ultra+ \| SYGMA TV+ (56) |
| Essai | Essai gratuit 24 h : testez SYGMA TV+ \| SYGMA TV+ (49) |
| Guides | Guides d'installation : TV, boîtiers, mobile \| SYGMA TV+ |

### 4.3 Formules (`#plans` ou `/plans`)

- Title : **Plans and prices: Starter, Plus, Ultra+ | SYGMA TV+** (51)
- Description : **Compare SYGMA TV+ yearly plans: 1 to 4 devices, 12 to 36 months, from $59 a year. Free 24-hour trial first, 7-day money-back guarantee.** (135)
- Introduction : « Three yearly plans, 1 device included and up to 4. Choose 12, 24 or 36 months — longer plans cost less per year. Order with a short form: our team activates your access on WhatsApp, and you pay after activation. »
- Lignes du comparatif : supprimer les volumes de chaînes et de films, le replay, les niveaux « Priority / VIP » et « Premium servers » ; « TV guide (EPG) where available » ; « HD to 4K where available ».
- Ultra+ : « Our most complete plan · 4K/HDR where available. » (au lieu de « The best IPTV experience »).

### 4.4 Guides (après vérification)

- Hub : **Setup guides for TV, streaming devices & mobile | SYGMA TV+** (59) — « Step-by-step setup guides for SYGMA TV+ on Smart TV, streaming devices, mobile and computer, tested by our team. Need help? We reply 24/7. » (138)
- Smart TV : **Set up SYGMA TV+ on a Samsung or LG Smart TV | SYGMA TV+** (56) — « How to install and set up SYGMA TV+ on a Samsung or LG Smart TV: the app to use, where to enter your details and what to do if it does not work. » (144)
- Gabarit : avant de commencer → application (boutique officielle uniquement) → étapes testées (date + appareil + version) → problèmes fréquents → support. Pas de sideloading, pas d'APK, pas de logo tiers.

### 4.5 Articles (informationnels)

- **What is IPTV? How to choose a legal service | SYGMA TV+** (55) — « IPTV explained in plain words: how TV over the internet works, what you need at home, and the checks to make before you pay for any service. » (140)
- **Wi-Fi or cable for streaming? Stop buffering | SYGMA TV+** (56) — « Why streams buffer and how to fix it: router placement, Ethernet, 5 GHz Wi-Fi and device updates. Practical checks you can do in ten minutes. » (141)

---

## 5. Google Search Console

**État du dépôt** : aucune balise de vérification Google ou Bing, aucun fichier HTML de vérification ; une clé
IndexNow est publiée (fichier à la racine) et un workflow IndexNow existe (manuel + post-déploiement en mode
essai, `INDEXNOW_ENABLED` non activée). **Je n'ai pas accès à la Search Console** : aucune donnée n'est citée.

### Checklist (à faire par le propriétaire ou avec un accès délégué en lecture)

| # | Contrôle | Où | Ce qu'on attend |
|---|---|---|---|
| 1 | Propriété **Domaine** `sygmatv.com` vérifiée (DNS TXT) | Paramètres › Propriétaires | Couvre http/https et www |
| 2 | Sitemap `https://sygmatv.com/sitemap.xml` soumis | Sitemaps | Statut « Opération réussie », 6 URL découvertes |
| 3 | **Indexation réelle** | Pages (Indexation) + Inspection d'URL des 6 URL | 6 indexées ; aucune page `/fr-*`, `/en-gb`, `/blog`, `/api` |
| 4 | Canonique choisie par Google = déclarée | Inspection d'URL | `https://sygmatv.com/` pour l'accueil |
| 5 | **Impressions, clics, CTR, position moyenne** | Performances › Résultats de recherche, 3 et 16 mois | Base de référence exportée (CSV) avant tout changement |
| 6 | **Requêtes IPTV** | Filtre Requête « contient » `iptv` ; puis `abonnement`, `trial`, `smart tv` | Volume réel d'impressions de ces requêtes pour le site |
| 7 | **Pages les plus visibles** | Onglet Pages, trié par impressions | Accueil vs pages légales |
| 8 | Pays et appareils | Onglets Pays, Appareils | Marchés réellement touchés (à comparer aux droits) |
| 9 | Actions manuelles et sécurité | Sécurité et actions manuelles | Aucune |
| 10 | Core Web Vitals (terrain) | Expérience | « Bon » ou « données insuffisantes » |
| 11 | Bing Webmaster Tools | Import depuis la Search Console | Mêmes contrôles ; IndexNow manuel |
| 12 | Liaison GA4 ↔ Search Console | Admin GA4 | Croiser requêtes et `generate_lead` |

---

## 6. Plan d'action sur 90 jours

| Semaines | Actions | Conditions | Indicateur à suivre |
|---|---|---|---|
| 1–2 | Accès Search Console + Bing ; export de référence ; décision « IPTV » (option A/B) ; décisions Phase 5C (CGU, pied de page) | Propriétaire, juriste | Base exportée, décisions écrites |
| 2–4 | Déployer la Phase 5C (pied de page, About, Help center en `live`, CGU/remboursement si validés) ; accueil variante A ; JSON-LD `Organization` complété ; règle de redirection `http://www` | Autorisation explicite | URL du sitemap (6 → 15), aucune erreur d'indexation |
| 4–8 | Vérification réelle des applications par plateforme (plan 5B) ; publication des guides vérifiés (3 premières plateformes) ; maillage depuis Help › Devices et l'accueil | Tests datés, noms d'apps confirmés | Impressions sur requêtes « set up / install / smart tv » |
| 6–10 | 3 articles utiles (§4.5 + « check your TV ») ; levée du `noindex` du blog | Relecture | Impressions d'articles, clics vers l'essai |
| 8–12 | Version FR si droits FR validés (une seule version si contenu identique par pays) ; `hreflang` | Droits du pays, prix, mentions | Indexation FR, impressions FR |
| Continu | Revue mensuelle Search Console : requêtes en position 8–20 à améliorer, CTR faible, pages qui perdent | Accès | Clics, CTR, `generate_lead` par page d'entrée |

Aucun engagement de position ou de trafic : on suit les mécanismes (indexation, impressions, CTR) et les demandes
d'essai / commandes attribuées à la recherche naturelle.

---

## 7. À vérifier avant toute publication

1. **Droits de diffusion** par pays et par catégorie (sports, chaînes internationales, VOD, replay) — conditionne la
   variante B, les versions pays et toute mention « IPTV » commerciale.
2. **Applications** par plateforme : nom exact, disponibilité en boutique officielle par pays, test réel daté.
3. **Volumes et qualité** (35 000+ chaînes, 200 000+ films, 4K/HDR, EPG, replay) : preuve technique ou retrait.
4. **Prix** affichés dans les métadonnées = base de prix au jour de publication.
5. **CGU et remboursement** alignés sur la commande assistée (Phase 5C, juriste).
6. **Profils sociaux** (`sameAs`) : URL canoniques confirmées par le propriétaire.
7. **Accès Search Console / Bing** et export de référence.
8. **Marques tierces** (Samsung, LG, Amazon, Apple, Google, applications) : citées en texte pour désigner un appareil,
   sans logo ni suggestion de partenariat.
9. **Autorisation explicite** du propriétaire pour chaque déploiement.

---

## Sources consultées (recherches du 20/11/2026)

- Composition des résultats « IPTV subscription plans », « IPTV Smarters Pro compatible subscription setup guide »,
  « abonnement IPTV essai gratuit » (recherche web, résultats US) — observation qualitative uniquement.
- Google Search Central — Spam policies : https://developers.google.com/search/docs/essentials/spam-policies
- Google Search Central — Site reputation abuse (11/2024) : https://developers.google.com/search/blog/2024/11/site-reputation-abuse
- Rétrogradation des sites recevant beaucoup de notifications de droit d'auteur valides (« Pirate update ») : https://searchengineland.com/dmca-requests-now-used-in-googles-ranking-algorithm-130118 ; https://torrentfreak.com/google-downranks-65000-pirate-sites-in-search-results-180629/
- Google Ads policies (droit d'auteur, comportement malhonnête) : https://support.google.com/adspolicy/answer/6008942
