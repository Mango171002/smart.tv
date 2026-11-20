# Lot 6A — Optimisation SEO de l'accueil (20/11/2026)

Branche isolée `claude/seo-phase6a-home`, créée depuis la Phase 5C `7052460` (branche d'origine non modifiée).
**Rien n'est déployé ni fusionné.** Aucune migration. Prix, simulateur, formulaire de commande, API, e-mails,
Telegram, WhatsApp, CGU et politique de remboursement : **non modifiés**. `350882a` absent.

## 1. Modifications exactes

### Métadonnées (`src/i18n/dictionaries/en.ts` › `meta`)

| Élément | Avant | Après |
|---|---|---|
| Titre (`homeTitle`) | SYGMA TV+ — International Streaming Subscription | **SYGMA TV+ — Streaming subscription for TV, mobile & computer** (60 car.) |
| Description (`homeDescription`, aussi Open Graph, X et JSON-LD) | SYGMA TV+: One World. Endless Entertainment. International streaming plans for 1 to 4 devices on Smart TV, mobile and computer. Order online in minutes. | **Live TV, movies and series on Smart TV, mobile and computer. Yearly plans for 1 to 4 devices, a free 24-hour trial and 24/7 support in 6 languages.** (147 car., sans prix pour ne jamais devenir obsolète) |
| Titre par défaut (`siteTitle`) | International Streaming Subscription | Streaming subscription for TV, mobile & computer |

### Accueil — textes (`en.ts`)

| Section | Avant | Après |
|---|---|---|
| H1 (2ᵉ ligne) | Sports, Movies, Live TV. | **Movies, Series, Live TV.** |
| Accroche | A complete streaming experience: live sports, on-demand movies and series, and international channels on all your screens. | Movies, series and live TV on your TV, mobile and computer — with a free trial first and a real team to set you up on WhatsApp. |
| Pastilles du hero | … Email Support | … **24/7 Support** |
| Avantages | Email support — A team listening to you | **24/7 support — Email & WhatsApp, 6 languages** |
| Catégories (intro) | Live sports, movies, series and channels from around the world. Content can vary by country. | Movies, series, live TV and more. What is available depends on your country. |
| Carte sport | Live Sports — Football, basketball, motorsport and more | Sports — Depending on the channels available in your country |
| Carte Live TV | International channels, organised by region | Channels organised by region, depending on your country |
| Carrousel | Most watched (« Most watched genres ») | **Highlights** (« Featured genres ») — même contenu, mêmes animations |
| Formules (intro) | Movies, series, live TV channels and sports, in HD, Full HD, 4K and HDR quality. | Movies, series and live TV, in HD to 4K where available. |
| Starter | National channels & news ; Stabilised streaming ; TV guide (EPG) included ; Email support ; note « To discover the service. » | Live TV & on demand ; No automatic renewal ; TV guide (EPG) ; **24/7** support ; note « To discover the service · TV guide where available. » |
| Plus | « The best balance » ; Sports & entertainment ; 4K Ultra HD quality ; High-stability servers ; TV guide (EPG) included ; 7-day replay ; Priority support | « Great value for most homes » ; Live TV & on demand ; 4K Ultra HD quality ; No automatic renewal ; TV guide (EPG) ; **24/7** support ; note « Our recommended plan · 4K and TV guide where available. » |
| Ultra+ | « The ultimate experience » ; International channels ; Premium servers ; TV guide (EPG) included ; 14-day replay ; VIP priority support ; note « The best IPTV experience · 4K/HDR where available. » | « The complete experience » ; Our **widest** selection ; No automatic renewal ; TV guide (EPG) ; **24/7** support ; note « Our most complete plan · 4K/HDR and TV guide where available. » |
| Volumes par formule (cartes) | +12 000 / +25 000 / +35 000 chaînes ; +100 000 / +150 000 / +200 000 films et séries | **Masqués** via le mécanisme prévu (`src/config/catalogue.ts` → `null` « tant que non confirmé par écrit ») |
| Tableau comparatif | Lignes « Live TV channels », « Movies & series (VOD) », « International channels », « Stable streaming servers », « Replay » ; support « Email / Priority / VIP priority » | Lignes retirées ; « TV guide (EPG), where available » ; support « 24/7, email & WhatsApp » pour les 3 formules |
| Bandeau appareils | Designed for all your devices | Works on the screens you use (liste d'appareils inchangée) |
| Engagements | Quick setup — Step-by-step guide per device ; Here to help — Help centre and email support | Guided setup — Our team guides you on WhatsApp ; Here to help — 24/7 support in 6 languages |
| Compatibilité | Works on most screens. Try it on yours with the free trial. | Works on Smart TV, streaming devices, mobile and computer. Check yours with the free trial. |
| Bandeau final | Ready to watch TV from around the world? — Access up to 35,000+ TV channels and 200,000+ movies & series, in HD to 4K HDR, from multiple countries — from {price}/month. | **Ready to start watching?** — Live TV, movies and series on all your screens, in HD to 4K where available — from {price}/month. (prix toujours calculé par le serveur) |
| Bandeau final, réassurance | … Email support | … 24/7 support |
| FAQ « Can I subscribe now? » | …our team contacts you on WhatsApp to activate your access… | …send the short order form: our team contacts you on WhatsApp and activates your access, **and you pay after activation**… |
| FAQ « Which countries are available? » | The United States, Canada and Europe. Content can vary by country. | Our team confirms availability for your country before you order. Ask for a free trial to check the service on your own device. |
| FAQ « Can I cancel? » | (texte inchangé) | + lien **« Read our refund policy »** → `/legal/refunds` |
| FAQ « Do you store my personal data? » | …See our Privacy policy. (texte sans lien) | …We never sell your data. + lien **« Read our privacy policy »** → `/legal/privacy` |

Conservés : slogan, design, sections, animations, vidéo du hero, carrousel (15 genres), prix, remises, « +30 days
free », simulateur, boutons « Order now » / « Get … », fenêtre de commande, liste d'appareils, informations de
support vérifiées (24/7, e-mail, WhatsApp, 6 langues).

**Point à décider (A4)** : la carte « Sports » et les tuiles sportives du carrousel sont conservées (design) mais
qualifiées « depending on your country » / sans compétition nommée dans les textes ; à retirer si les droits sportifs
ne sont pas établis.

### Code

| Fichier | Modification |
|---|---|
| `src/config/catalogue.ts` | Volumes de chaînes/films par formule mis à `null` (affichage masqué, mécanisme existant) |
| `src/components/Sections.tsx` | FAQ : lien contextuel facultatif (`link: { href, label }`) affiché après la réponse |
| `src/components/StructuredData.tsx` | `foundingDate: "2026"` et `availableLanguage` = 6 langues, depuis `OWNER_FACTS` (même source que la page About) |
| `src/app/globals.css` | Liens des réponses FAQ visibles (lime, soulignés) ; **cartes de formules : correction d'un défaut existant en production** — le site ne charge pas la police Inter (il utilise celle de l'appareil) ; avec une police de repli large, les lignes de formules débordaient sur la carte voisine à 44 largeurs entre 910 et 1360 px (34 px de débordement même avec Inter entre 1040 et 1260 px). Correction : marges latérales des cartes réduites à 16 px entre 1001 et 1180 px (cartes de 225 à 260 px de large) et retour à la ligne autorisé en dernier recours. Résultat : **aucun retour à la ligne ni débordement de 320 à 1920 px** (pas de 10 px), avec Inter comme avec DejaVu Sans |

### Données structurées (accueil)

| Champ | Avant | Après |
|---|---|---|
| `Organization.foundingDate` | — | `2026` |
| `Organization.contactPoint.availableLanguage` | English | English, French, Arabic, German, Spanish, Italian |
| `Organization.description`, `WebSite.description` | ancienne description | nouvelle description |

`sameAs` non modifié (URL canoniques Facebook/WhatsApp : confirmation du propriétaire attendue).

## 2. Tests

| Contrôle | Résultat |
|---|---|
| TypeScript | OK |
| ESLint | 0 erreur (4 avertissements identiques à la production) |
| Unitaires | **123/123** (nouveau `home-claims.test.ts` : longueurs titre/description ; aucun volume, replay, superlatif, IPTV, VIP, « priority », serveurs, « around the world », « international channels », « help centre », « most watched » ; hero sans « sport » ; 4K/HDR et EPG qualifiés « where available » ; volumes masqués ; FAQ commande assistée + lien remboursement ; support 24/7, WhatsApp, 6 langues) |
| E2E mode `off` (ordinateur + mobile, dont commande, simulateur, prix, axe, analytics, 404, responsive) | **163 réussis, 0 échec** — avec Inter **et** sans Inter (conditions de la CI, police masquée via fontconfig) |
| E2E mode `preview` (About, Help, responsive 9 pages, statut commercial) | **46 réussis, 0 échec** |
| Nouveau contrôle responsive « lignes de formules sur une ligne et dans leur carte » (texte mesuré, 7 largeurs) | Réussi sur 6A ; **échoue sur la base 5C/production** (défaut existant, corrigé). Le test historique « fits on one line » ne voyait pas ce débordement (il mesurait la boîte, pas le texte) |
| Accessibilité axe WCAG 2.1 AA (accueil + 9 pages, ordinateur + mobile) | **0 violation** |
| SEO (build avec l'URL de production) | Titre 60, description 147, canonique `https://sygmatv.com`, `index, follow`, 1 H1, JSON-LD valide (`foundingDate`, 6 langues), liens FAQ → `/legal/refunds`, `/legal/privacy` |
| Première CI (run 237) | Échec sur « fits on one line » à 1024 px : la CI n'a pas Inter (lignes renvoyées à la ligne) — cause reproduite localement et corrigée ci-dessus |
| Lighthouse mobile (local, laboratoire, 2 mesures) | Avant 90 / 93 ; après 89 / 93 ; SEO, accessibilité, bonnes pratiques 100 ; CLS 0 (pas de différence significative) |
| Comparaison avant (5C `7052460`) / après, 169 URL | **Seul l'accueil change** (`/` et `/?utm_source=x`) : textes ci-dessus, titre, description, JSON-LD. Les 167 autres URL sont identiques |
| CSS global | `- .tier-features li{white-space:nowrap}` ; `+ .tier-features{min-width:0}` ; `+ .tier-features li{white-space:normal}` ; `+ @media (1001–1180 px) .tier-grid .tier-card{padding-left/right:16px}` ; `+ .faq p a{…}` (2 règles) |
| Prix / commande / e-mails / Telegram / WhatsApp | Aucun fichier concerné modifié (`git diff`) |

## 3. Cohérence avec les pages Phase 5C

- Commande assistée : FAQ de l'accueil « activates your access, and you pay after activation » = About › How the
  service works, Help › Ordering and payment, Getting started.
- Support : « 24/7 », « Email & WhatsApp », « 6 languages » = About, Help › Contact support.
- Remboursement : texte de la FAQ inchangé, identique à la politique publiée (« 7 days of activation ») et au Help ›
  Refunds ; la proposition « 7 jours à compter du paiement » reste en attente du juriste.
- Pays : plus aucune liste de pays, comme dans les pages 5C.

## 4. Points à surveiller avant déploiement

1. **CGU publiées** : la FAQ dit désormais « you pay after activation » ; les CGU §2/§4 disent l'inverse. À déployer
   avec la mise à jour des CGU (proposition 5C, juriste) ou après.
2. **A4** : carte « Sports » et tuiles sportives — décision sur les droits sportifs.
3. **Fenêtre de commande** : la note « Our team confirms your order and payment with you on WhatsApp » n'a pas été
   modifiée (expérience de commande préservée) ; formulation à aligner dans un lot séparé si souhaité.
4. Déploiement uniquement sur votre autorisation explicite.
