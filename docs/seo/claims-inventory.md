# Inventaire des allégations commerciales — sygmatv.com (phase 5B, 20/11/2026)

**Statut : audit seulement. Aucun texte du site n'a été modifié.** Les propositions de reformulation sont des
suggestions à valider par le propriétaire ; rien ne sera publié sans sa décision.

Source : textes publics du code de production `24cdc49` (`src/i18n/dictionaries/en.ts`, numéros de ligne à ce
commit), vérifiés sur https://sygmatv.com le 20/11/2026.

Règle appliquée : une allégation est publiable si une **preuve écrite** existe (contrat, licence, mesure,
procédure interne appliquée). Les volumes de contenus, chaînes, sports et pays dépendent des **droits de
diffusion**, qui ne sont pas établis à ce jour : ils sont classés en risque élevé tant que la preuve manque.

## A. Catalogue, contenus et droits — risque **élevé**

| # | Texte exact | Emplacement | Preuve nécessaire | Recommandation |
|---|---|---|---|---|
| A1 | « Access up to **35,000+ TV channels and 200,000+ movies & series**, in HD to 4K HDR, from multiple countries » | `en.ts:313` (bandeau final de l'accueil) | Licences / contrats couvrant ces volumes, par pays | Retirer les volumes tant que les droits ne sont pas établis. Suggestion : « Live TV, movies and series on all your screens, in HD to 4K where available — from {price}/month. » |
| A2 | Comparatif « Live TV channels » **+12,000 / +25,000 / +35,000** | `en.ts:137` (tableau « Compare the plans ») | Idem, par formule | Retirer la ligne chiffrée ou la remplacer par des niveaux qualitatifs validés (Essential / Extended / Complete bundle). |
| A3 | Comparatif « Movies & series (VOD) » **+100,000 / +150,000 / +200,000** | `en.ts:138` ; gabarit `en.ts:163` (cartes de formules) | Idem | Retirer la ligne chiffrée tant que les droits ne sont pas établis. |
| A4 | « **Live sports** », « Football, basketball, motorsport and more », « Sports & entertainment » | `en.ts:80`, `:259`, `:188`, `:540`, `:542` | Droits sportifs par compétition et par pays | Ne citer aucun sport ni compétition sans droits ; formulation générique seulement si un contrat la couvre. |
| A5 | « **International channels** » (Ultra+), « channels from around the world », « International channels, organised by region », « TV from around the world » | `en.ts:142`, `:204`, `:257`, `:261`, `:309`–`312` | Droits de retransmission des chaînes concernées, par territoire | À justifier ; sinon formulation neutre (« a selection of channels, depending on your country »). |
| A6 | « National channels & news » (Starter) | `en.ts:173` | Idem | À justifier. |
| A7 | « **7-day / 14-day replay** » | `en.ts:145`, `:192`, `:208` | Droits de rattrapage (souvent distincts des droits de direct) + fonction réellement fournie | À justifier ou retirer. |
| A8 | « TV guide (EPG) included » | `en.ts:144`, `:176`, `:191`, `:207` | Fonction réellement fournie dans l'application remise au client | À confirmer techniquement. |
| A9 | Catégories « Documentaries », « Cinema, series and on-demand content » | `en.ts:260`, `:262` | Droits VOD | À justifier. |

## B. Qualité et technique — risque **moyen**

| # | Texte exact | Emplacement | Preuve nécessaire | Recommandation |
|---|---|---|---|---|
| B1 | « in HD, Full HD, **4K and HDR** quality », « 4K Ultra HD », « 4K Ultra HD & HDR », « HD to 4K » | `en.ts:124`, `:139`–`141`, `:189`, `:205`, `:543` | Flux 4K/HDR réellement disponibles (la mention « where available » est déjà présente `:150`, `:196`, `:212`) | Garder « where available » partout où 4K/HDR est cité. |
| B2 | « Stable streaming servers: Standard / **High stability / Premium** », « Stabilised streaming », « Premium servers » | `en.ts:143`, `:175`, `:190`, `:206` | Différence technique mesurable entre formules (infrastructure, disponibilité) | Retirer ou décrire un engagement vérifiable. |
| B3 | « **Designed for all your devices** », « on all your screens », « Works on most screens » | `en.ts:153`, `:80`, `:542`, `:268` | Liste d'applications/appareils testés | Préférer « Works on Smart TV, streaming devices, mobile and computer — check yours with the free trial » (déjà la logique `:268`). |
| B4 | Barre d'appareils « Smart TV, Android TV, Fire TV, Apple TV, Mobile & tablet, PC & Mac » ; « Compatible TV apps », « Browser or desktop app » | `en.ts:154`, `:270`–`273` | Une application officielle disponible et testée sur chaque plateforme | À confirmer avec le nom des applications (prérequis des guides). |

## C. Superlatifs — risque **moyen** (non démontrables)

| # | Texte exact | Emplacement | Recommandation |
|---|---|---|---|
| C1 | « **The best IPTV experience** · 4K/HDR where available. » | `en.ts:212` | Retirer « the best » et « IPTV » (terme associé au streaming non autorisé, sensible pour les règles publicitaires). Suggestion : « Our most complete plan · 4K/HDR where available. » |
| C2 | « The best balance » (Plus) | `en.ts:185` | Suggestion : « Our recommended plan » (déjà utilisé `:196`) ou « Great value for most homes ». |
| C3 | « The ultimate experience » (Ultra+) | `en.ts:201` | Suggestion : « Our most complete plan ». |
| C4 | « Premium streaming. » (H1), « A complete streaming experience », « A modern streaming experience » | `en.ts:78`, `:80`, `:542` | Faible risque (registre de marque) ; à garder si le propriétaire l'assume. |

## D. Service et assistance — risque **moyen**

| # | Texte exact | Emplacement | Constat | Recommandation |
|---|---|---|---|---|
| D1 | « Quick setup — **Step-by-step guide per device** » | `en.ts:157` | **Aucun guide publié** à ce jour (`/blog` vide, guides EN en préparation). | Corriger dès maintenant (ex. « Our team guides you on WhatsApp ») ou attendre la publication des guides. |
| D2 | « Here to help — **Help centre** and email support », « Visit the help centre » | `en.ts:159`, `:365` | Il n'existe pas de centre d'aide, seulement la FAQ de l'accueil. | « FAQ and email support » / « Read the FAQ », ou créer un vrai centre d'aide. |
| D3 | Support « Email / **Priority / VIP priority** », « **VIP** priority support » | `en.ts:148`, `:194`, `:210` | Nécessite une procédure d'assistance différenciée effectivement appliquée (délais par formule). | À documenter (délais) ou retirer la différenciation. |
| D4 | « Fast reply », « Get activated — Quickly, on WhatsApp », « our team activates your access quickly » | `en.ts:391`, `:302`, `:445` | Délais réels non publiés. | Garder sans chiffre, ou publier un délai réellement tenu. |
| D5 | « Order online **in minutes** », « Order in **a few seconds** », « In less than a minute », « get your price instantly » | `en.ts:6`, `:364`, `:301`, `:224` | Plausible pour le formulaire ; l'activation dépend de l'équipe. | Faible risque ; garder la distinction commande / activation. |

## E. Conditions commerciales — à **maintenir cohérentes** (preuve = CGV / procédures)

| # | Texte exact | Emplacement | Constat | Recommandation |
|---|---|---|---|---|
| E1 | « Prices in US dollars (USD), **before taxes** » vs « Taxes **$0.00 USD** » au paiement | `en.ts:125`, `:473` | Les deux mentions peuvent sembler contradictoires (« hors taxes » puis taxes à zéro). | À clarifier avec le conseil fiscal (aucune modification de prix/commande dans cette phase). |
| E2 | « **+30 days free** » (Plus, Ultra+) | `en.ts:127`, `:147` | Promotion : conditions et durée à préciser (les CGV renvoient aux conditions « au moment de l'achat »). | Préciser les conditions ou la date de fin. |
| E3 | « save up to 30% », « −20 % / −30 % » | `en.ts:217`–`219`, FAQ `:350` | Conforme à la grille D54 (remises réelles). | OK. |
| E4 | Essai gratuit 24 h, « 7-day money-back guarantee, 100% refunded », 14 jours de rétractation UE/R-U, « Plans never renew automatically » | `en.ts:40`, `:158`, `:247`, `:354`, pages légales | Conformes aux CGV et à la politique de remboursement publiées. | OK — à garder alignés avec les CGV (relecture juridique prévue). |
| E5 | « No commitment », « Transparent prices », « Everything shown before you buy », « Price confirmed by our server » | `en.ts:317`, `:551`, `:160`, `:474` | Cohérents avec le parcours actuel (prix confirmé par l'API). | OK. |

## F. Confiance et conformité — à **garder vraies**

| # | Texte exact | Emplacement | Recommandation |
|---|---|---|---|
| F1 | « **Each country opens only once broadcasting authorisations are in place.** » | `en.ts:552` | Engagement fort et juste : il **impose** de ne publier ni pays ni catalogue sans autorisation. Cohérent avec A1–A9 : les volumes affichés aujourd'hui le contredisent tant que les droits ne sont pas établis. |
| F2 | « No fake reviews » | `en.ts:551` | OK (aucun avis affiché). |
| F3 | « Secure & private », « We never sell your data » | `en.ts:317`, `:391`, `:454`, `:543`, `legal.ts` | OK si les pratiques restent celles décrites dans la politique de confidentialité. |

## Priorités proposées

1. **Avant toute campagne ou page pays** : A1–A3 (volumes), A4–A7 (sports, chaînes internationales, replay), C1 (« The best IPTV experience »).
2. **Rapidement** : D1 et D2 (fonctions annoncées qui n'existent pas encore), E1 (cohérence taxes).
3. **Ensuite** : B2, D3, C2–C3, E2.

Chaque correction sera préparée en Preview avec un test de non-régression, puis déployée uniquement sur
autorisation explicite.
