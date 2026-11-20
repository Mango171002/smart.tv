# Phase 6 — Rapport SEO mis à jour avec la Search Console (20/11/2026)

**Documentation et recommandations uniquement.** Branche `claude/seo-phase6-audit` (base production `864f703`).
Aucun code applicatif modifié, aucun déploiement, aucune fusion, aucune migration. Phase 5C, commandes, paiements,
prix, e-mails, Telegram et WhatsApp : non touchés. `350882a` absent. Complète `audit-strategie-seo.md` (mots-clés,
architecture, copywriting détaillé), qui reste valable.

**Données Search Console** : fournies par le propriétaire le 20/11/2026 (je n'ai pas accès à la propriété). Les
autres constats viennent des pages publiques et du code de production.

---

## En bref

- **Indexation technique : en place, mais limitée.** L'accueil HTTPS est indexé avec la bonne canonique, HTTP
  redirige correctement, le sitemap est lu. Le site n'a que 6 URL à indexer, dont 2 pages légales que Google a
  explorées sans les indexer.
- **Visibilité organique : quasi nulle et non interprétable.** 5 impressions, 1 clic : aucun échantillon exploitable.
- **Positionnement commercial : inexistant.** Aucune requête visible ; la position moyenne 2 porte sur 5 impressions
  de requêtes masquées par Google — **ce n'est pas un classement sur « IPTV »** ni sur une requête commerciale.
- **Performances : correctes en laboratoire**, données réelles (terrain) inconnues.

La cause principale n'est pas technique : **il n'existe presque rien à classer** (une page commerciale, cinq pages
légales). Le levier est de publier des pages utiles (Phase 5C, puis guides vérifiés), en corrigeant d'abord les
allégations de l'accueil.

---

## 1. Diagnostic

### 1.1 Indexation technique

| URL | Dans le sitemap | Statut Search Console (propriétaire) | Lecture |
|---|---|---|---|
| `https://sygmatv.com/` | oui | **Indexée**, canonique HTTPS correcte | OK |
| `http://sygmatv.com/` | non | Non indexée — redirection vers HTTPS | Normal (page avec redirection) |
| `/legal/privacy` | oui | **Indexée** | OK |
| `/legal/cookies` | oui | **Indexée** | OK |
| `/legal/refunds` | oui | **Explorée, actuellement non indexée** | Voir triage |
| `/legal/imprint` | oui | **Explorée, actuellement non indexée** | Voir triage |
| `/legal/terms` | oui | **Non précisé** | **À vérifier** (Inspection d'URL) — c'est peut-être la 4ᵉ URL indexée |
| 3 autres URL non indexées | — | Non précisées | **À vérifier** dans « Pourquoi les pages ne sont pas indexées » ; probablement des variantes redirigées (`https://www…`, `/en`, `/help` → `/#faq`, `/legal/terms/`) — hypothèse, non confirmée |

Calculs : 4 URL indexées sur 10 connues de Google = 40 % ; sur les 6 URL du sitemap, 3 sont confirmées indexées
(accueil, privacy, cookies), 2 explorées non indexées (refunds, imprint), 1 non précisée (terms). Un nombre d'URL
exclues n'est pas un problème en soi : les redirections doivent rester hors de l'index.

**Triage « Explorée, actuellement non indexée » (refunds, imprint)** :
- Ce sont des pages légales sur un site très récent, avec peu de texte propre et un seul lien interne chacune
  (pied de page — observé : accueil, 1 lien vers chaque page légale, 0 dans le contenu principal). Google choisit
  souvent de ne pas indexer ce type de page au début.
- **Imprint** : sa non-indexation est acceptable (aucun intérêt de recherche) — pas d'action.
- **Refunds** : utile pour la confiance et les recherches « sygma tv refund ». Action : liens contextuels depuis le
  Help center (`/help/refunds` → `/legal/refunds`, déjà prêt en 5C) et depuis la FAQ « Can I cancel? ». Ne pas
  multiplier les demandes d'indexation ; une seule après publication des nouveaux liens.

**Sitemap** : 6 URL découvertes, « Opération effectuée », lu le 19/11/2026 — conforme au fichier en ligne (accueil
sans `lastmod` par choix, pages légales avec leur date réelle).

### 1.2 Visibilité organique réelle

| Mesure | Valeur | Calcul |
|---|---|---|
| Impressions | 5 | — |
| Clics | 1 | — |
| CTR | 20 % | 1 / 5 |
| Position moyenne | 2 | moyenne sur 5 impressions |
| Pays | États-Unis 3 (60 %), Argentine 1 (20 %), Irlande 1 (20 %) | sur 5 impressions |
| Appareils | Ordinateur 3 (60 %), mobile 2 (40 %) | sur 5 impressions |
| Requêtes visibles | 0 | — |

Lecture :
- 5 impressions ne permettent **aucune** conclusion (ni CTR, ni position, ni pays). Les analyses habituelles
  (requêtes proches de la première page, CTR anormaux, cannibalisation, pages en baisse) **ne s'appliquent pas** :
  elles demandent au minimum des centaines d'impressions.
- **Aucune requête visible** : Google n'affiche pas les requêtes très rares (requêtes anonymisées). Les 5 impressions
  viennent donc de requêtes non communiquées. Hypothèse la plus probable : recherches sur la marque (« sygma tv ») —
  **non vérifiable** avec ces données.
- **La position 2 n'est pas un classement sur « IPTV »** : aucune page du site ne cible ce terme, et la requête n'est
  pas connue.
- L'Argentine et l'Irlande ne sont pas des marchés visés : bruit statistique.

### 1.3 Positionnement commercial

Aucun : le site n'apparaît (au mieux) que sur sa marque. Pour exister sur des recherches à intention commerciale ou
pratique (« streaming subscription for smart tv », « set up … on Samsung TV », « free trial »), il faut des pages
dédiées et utiles. Les requêtes « IPTV » commerciales restent soumises à la décision sur les droits (§4).

### 1.4 Performances SEO

- **Laboratoire** (Lighthouse mobile, 3 mesures de l'accueil le 20/11/2026) : performance 92 / 93 / 97, LCP 1,9 /
  2,8 / 2,2 s, CLS 0, TBT 320 / 190 / 130 ms ; SEO 100, accessibilité 100. Résultats de diagnostic, pas un verdict.
- **Terrain (Core Web Vitals)** : **inconnu**. À lire dans Search Console › Expérience › Core Web Vitals
  (probablement « données insuffisantes » vu le trafic) ou dans PageSpeed Insights (section terrain, INP compris).

---

## 2. Optimisations techniques — audit

| Domaine | Constat (observé) | Recommandation |
|---|---|---|
| **Titre et meta de l'accueil** | Titre « SYGMA TV+ — International Streaming Subscription » ; description commençant par le slogan | Variante A : « SYGMA TV+ — Streaming subscription for TV, mobile & computer » (60) ; « Live TV, movies and series on Smart TV, mobile and computer. Yearly plans from $59, free 24-hour trial, 24/7 support in 6 languages. » (132) |
| **Titres des pages légales** | Uniques et descriptifs | Rien à changer |
| **H1 et structure** | H1 « Premium streaming. Sports, Movies, Live TV. » ; H2 « Ready to watch TV from around the world? » ; section « Most watched » avec badges « SPORTS » (Football night, Basketball) | H1 « Premium streaming. Movies, series and live TV. » ; H2 final sans « from around the world » ; badges sportifs retirés tant que les droits ne sont pas prouvés |
| **Maillage interne** | Accueil → seulement ses ancres (`#plans`, `#how`, `#faq`, `#featured`) et les 5 pages légales (pied de page) | Publier About + Help (5C) ; lien contextuel FAQ « Can I cancel? » → `/legal/refunds` ; plus tard guides depuis Help › Devices et l'accueil |
| **Sitemap et canoniques** | 6 URL, canoniques absolues, cohérentes avec la Search Console | Garder ; `lastmod` réel pour l'accueil quand son contenu change ; 15 URL après publication 5C |
| **Redirections** | HTTP → HTTPS correct (confirmé par la Search Console) ; `http://www` passe par 2 redirections | **Aucune modification** (pas de problème prouvé) ; simple observation |
| **Données structurées** | `Organization` + `WebSite` ; `availableLanguage` = anglais seul ; pas de `foundingDate` ; `sameAs` Facebook = lien de partage, WhatsApp sans forme canonique | Compléter (6 langues, `foundingDate: "2026"`) ; `sameAs` canoniques **après confirmation du propriétaire** ; pas de `Product`/`Offer` (n'apporterait pas de bénéfice certain et figerait des prix et allégations) |
| **Performances mobiles** | Bonnes en laboratoire | Surveiller les données terrain ; rien à faire maintenant |
| **Pages manquantes** | Pas d'About, d'aide, de guides ni d'articles ; blog vide en `noindex` | 5C (prêt) → guides vérifiés → 3 articles utiles |

---

## 3. Architecture SEO

| Page | Rôle | Statut | Condition de publication |
|---|---|---|---|
| **Accueil** `/` | Offre, formules, essai, FAQ courte | En ligne | Corriger les allégations (P0-2) |
| **About Us** `/about` | Confiance, société, commande assistée, support multilingue | Prête (5C) | Décisions 5C (CGU, pied de page) |
| **Help Center** `/help` + 7 sujets | Essai, commande, appareils, dépannage, contact, remboursement | Prêt (5C) | Idem |
| **Guides par appareil** `/guides/<plateforme>` | Compatibilité + installation sur la même page (pas de page « compatibilité » séparée) | À produire | Application vérifiée en boutique officielle + test réel daté |
| **Contenus informatifs** `/blog/<article>` | Questions générales (qu'est-ce que l'IPTV, Wi-Fi ou câble, vérifier sa TV) | À produire | Relecture ; lever le `noindex` du blog à partir de 3 articles |
| **Pages commerciales distinctes** (`/plans`, pages par catégorie de contenu) | Seulement si le contenu dépasse l'accueil | **Non** | Offres et droits vérifiés |
| **Versions pays** | — | Preview uniquement | Une version par langue ; versions pays seulement si prix, devise, mentions ou disponibilité diffèrent, après droits du pays |

À ne pas créer : pages « IPTV + pays », listes « best IPTV », listes de chaînes ou de compétitions, pages au nom
d'une application non vérifiée, copies de pages par pays.

---

## 4. Positionnement et usage du terme « IPTV »

| Usage | Exemples | Règle |
|---|---|---|
| **Informatif** (autorisé) | Article « What is IPTV? How to choose a legal service » ; dans un guide : « the app works with standard IPTV playlists » (si vérifié) | Neutre, éducatif, sans promesse de contenus ni de légalité du service |
| **Commercial** (bloqué) | Titres, H1 ou URL « IPTV subscription », « IPTV free trial », listes de chaînes, sports, compétitions | Seulement après preuve des droits (option B) ; aujourd'hui option A : « streaming subscription » |

Identité : premium et internationale (« One World. Endless Entertainment. »), commande assistée par une vraie
équipe, essai gratuit d'abord, support 24/7 en 6 langues, appareils courants. Jamais : licences ou droits revendiqués,
« toutes les chaînes / tous les matchs », 4K garantie, informations sur le fournisseur ou le panneau.
Textes détaillés : `audit-strategie-seo.md` §4 (accueil A/B, formules, guides, articles, version FR).

---

## 5. Priorités

| ID | Prio | Problème constaté | Solution proposée | Impact SEO attendu | Risque | Fichiers concernés |
|---|---|---|---|---|---|---|
| R1 | **P0** | Presque aucun contenu indexable (accueil + 5 pages légales) ; aucune requête visible | Publier About + Help center (Phase 5C, mode `live`) | Sitemap 6 → 15 URL ; premières pages capables de répondre à des recherches non liées à la marque ; liens internes vers `/legal/refunds` | Contradiction avec les CGU si les décisions 5C ne sont pas prises | Branche 5C : `src/content/en/info.ts`, `src/config/content-pages.ts` ; variable `NEXT_PUBLIC_CONTENT_PAGES=live` dans `.github/workflows/deploy-cloudflare.yml` |
| R2 | **P0** | Allégations non prouvées sur la seule page commerciale (H1 « Sports », 35 000+ chaînes, 200 000+ films, replay, « The best IPTV experience », pays, badges sportifs) | Variante A de l'accueil (textes prudents) | Neutre à positif : contenu fiable, compatible avec les règles Google Ads et de qualité ; perte possible du terme « live sports » (aucune visibilité mesurée dessus aujourd'hui) | Message commercial moins « sport » ; réversible avec preuves | `src/i18n/dictionaries/en.ts` (hero, catalogue, formules, CTA final, FAQ, « Most watched ») ; `src/components/Sections.tsx` si la structure du H1 change |
| R3 | **P0** | Usage commercial de « IPTV » non décidé | Décision écrite : option A maintenant | Définit les requêtes ciblées | Aucun technique | Aucun (décision) |
| R4 | **P0** | Pas de base de mesure exploitable | Export de référence (Performances 3 mois, Pages), Bing Webmaster, liaison GA4 ↔ Search Console | Permet de mesurer chaque lot | Aucun | Aucun |
| R5 | **P1** | Titre et description de l'accueil peu descriptifs | Variante A (§2) | Meilleure correspondance avec « streaming subscription for TV » ; CTR mesurable plus tard | Faible | `src/i18n/dictionaries/en.ts` (`homeTitle`, `homeDescription`, `siteTitle`) |
| R6 | **P1** | Entité incomplète dans le JSON-LD | `foundingDate`, 6 langues, `sameAs` canoniques confirmés | Meilleure compréhension de la marque (sans garantie de panneau de connaissance) | `sameAs` non confirmés = mauvaise association | `src/components/StructuredData.tsx`, `src/config/site.ts` |
| R7 | **P1** | Refunds explorée non indexée, liée seulement depuis le pied de page | Liens contextuels (FAQ « Can I cancel? », Help › Refunds) ; 1 demande d'indexation après publication | Meilleure découverte ; indexation non garantie | Aucun | `src/i18n/dictionaries/en.ts` + composant de la FAQ (`src/components/Sections.tsx`) ; 5C `info.ts` |
| R8 | **P1** | Aucun guide d'installation | Guides vérifiés (3 plateformes d'abord) | Premières requêtes pratiques non liées à la marque | Étapes non testées = mauvaise expérience → bloqué jusqu'aux tests | Nouveaux : `src/content/en/guides.ts`, `src/app/[locale]/guides/…` ; `src/app/sitemap.ts` |
| R9 | **P1** | Pied de page avec allégations sur toutes les pages | Déployer la version 5C | Neutre (texte de gabarit) ; conformité | Aucun | Branche 5C : `src/i18n/dictionaries/en.ts`, `src/components/Footer.tsx` |
| R10 | **P2** | Accueil sans `lastmod` | Date réelle lors des changements de contenu | Faible | Aucun | `src/lib/lastmod.ts`, `src/app/sitemap.ts` |
| R11 | **P2** | Blog vide | 3 articles informatifs, puis levée du `noindex` | Impressions informationnelles | Contenu mince si précipité | `src/app/[locale]/blog/page.tsx` + contenu |
| R12 | **P2** | Données terrain inconnues | Suivre le rapport Core Web Vitals | Aucun direct | Aucun | Aucun |
| R13 | **P2** | `http://www` en 2 redirections | Aucune modification (pas de problème prouvé) ; observation | — | Modifier sans besoin = risque inutile | — |
| R14 | **P2** | Version FR en Preview | Une version par langue après droits FR | Impressions FR | Copies par pays si mal fait | Branche Preview : `src/i18n/locales.ts` |

---

## 6. Plan d'action 30 / 60 / 90 jours

| Période | Actions | Préalables | Indicateurs |
|---|---|---|---|
| **J0–J30** | Décisions : option A « IPTV », A4/A5, CGU/remboursement (5C) ; export de référence Search Console ; Bing + GA4 ; inspection de `/legal/terms` et des 3 URL non précisées ; déploiement 5C (`live`) et du lot 6A (§9) | Votre autorisation ; juriste pour les CGU | URL du sitemap 6 → 15 ; statut des pages dans le rapport Pages ; aucune erreur |
| **J31–J60** | Vérification réelle des applications ; 3 premiers guides ; liens Help › Devices → guides ; suivi de « Explorée, non indexée » | Tests datés par plateforme | Pages indexées ; impressions sur requêtes d'installation ; premières requêtes visibles hors marque |
| **J61–J90** | Guides restants ; 3 articles + levée du `noindex` du blog ; version FR si droits FR ; première revue des requêtes (si le volume le permet : positions 8–20, CTR) | Droits FR ; volume suffisant | Clics, CTR, requêtes non liées à la marque, `generate_lead` par page d'entrée organique |

Aucun engagement de position ou de trafic.

---

## 7. Optimisations techniques réalisables immédiatement (après votre autorisation)

Sans dépendance aux droits, faible risque, dans la branche de développement :
1. Titre et description de l'accueil (variante A).
2. H1 de l'accueil sans « Sports » ; H2 final sans « from around the world ».
3. FAQ « Which countries are available? » : « Our team confirms availability for your country before you order — ask for a free trial to check it on your own device. »
4. Lien contextuel FAQ « Can I cancel? » → `/legal/refunds`.
5. Retrait des volumes (chaînes, films), du replay, de « The best IPTV experience », des niveaux « Priority / VIP » et « Premium servers » ; « where available » pour 4K et EPG.
6. JSON-LD : `foundingDate`, `availableLanguage` (6 langues). `sameAs` seulement après confirmation.
7. Publication de la Phase 5C (déjà prête, en attente de ses décisions).

## 8. Éléments bloqués avant publication

| Élément | Bloqué par |
|---|---|
| Toute page ou titre commercial « IPTV », versions pays, sports/chaînes internationales (variante B) | Preuve des droits de diffusion par pays et catégorie |
| Guides d'installation, noms d'applications, « IPTV Smarters compatible » | Vérification des applications (boutique officielle, test réel) |
| Publication `live` de la 5C | CGU §1–§5 et remboursement (juriste), décision pied de page |
| `sameAs` Facebook / WhatsApp canoniques | Confirmation du propriétaire |
| Prix dans les métadonnées | Synchronisation avec la base de prix au jour de publication |
| Tout déploiement | Votre autorisation explicite |

## 9. Prochain lot de développement proposé — « Lot 6A : accueil conforme et entité »

- **Contenu** : points 1 à 6 du §7 (dictionnaire anglais, composant de la FAQ pour le lien contextuel, JSON-LD).
- **Base** : à construire **par-dessus la Phase 5C validée** (même fichier `en.ts` que le pied de page) pour éviter
  les conflits, ou après son déploiement.
- **Hors périmètre** : prix, formulaire, commandes, e-mails, Telegram, WhatsApp, redirections, CGU.
- **Tests** : test unitaire « aucune allégation non prouvée » sur les textes de l'accueil (comme celui du pied de
  page) ; métadonnées de l'accueil (longueurs, unicité) ; E2E existants ; comparaison production ↔ branche avec la
  liste exacte des différences ; Lighthouse mobile.
- **Livraison** : branche isolée, captures avant/après, rapport, puis votre autorisation avant tout déploiement.
