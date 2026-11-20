# Phase 5B — préparation de la croissance SEO (branche isolée `claude/seo-phase5b-preview`)

Base : code de production `24cdc49`. **Rien n'est déployé.** Aucune modification de prix, commande, base de
données, GA4, GTM, Google Ads ou consentement ; aucune version internationale activée ; branche Preview
internationale non fusionnée ; `350882a` exclu.

## 1. Page 404 à la charte (implémentée, testée, non déployée)

**Cause en production** : la mise en page racine est le segment dynamique `app/[locale]` avec
`dynamicParams = false`. Une adresse inconnue au premier niveau (`/nope`) échoue au contrôle de langue et reçoit la
404 par défaut de Next.js (sans `lang`, sans navigation) ; les adresses plus profondes étaient réécrites vers une
route « attrape-tout » qui produisait un document d'erreur.

**Correction** :
- `src/app/global-not-found.tsx` (option `experimental.globalNotFound` de Next.js 16, prévue pour ce cas) :
  document HTML complet, styles et logo du site, textes du dictionnaire anglais, bouton « Back to home », liens
  Plans / How it works / Help / FAQ / Contact support et liens légaux. Composant serveur : aucun JavaScript client,
  aucune bannière de consentement, aucune mesure d'audience (comme la 404 actuelle).
- Suppression de la réécriture `fallback` vers `/en/:path` et de la route `src/app/[locale]/[...rest]` (elles ne
  servaient qu'à atteindre une 404 stylée).

**Comportement vérifié** (`next start` et OpenNext 1.20.16 + `wrangler dev`, configuration de production) :

| Adresse | Avant (prod) | Après (5B) |
|---|---|---|
| `/nope`, `/nope/deeper`, `/legal/xyz`, `/blog/x`, `/index.html`, `/LEGAL/TERMS`, `/nope?utm_source=x` | 404, page Next.js par défaut | **404**, « Page not found \| SYGMA TV+ », `lang="en"`, une seule balise `robots: noindex`, aucune canonique, aucun `hreflang`, cache `private, no-store` |
| `/api/nope` | 404 | 404 + `X-Robots-Tag: noindex` (inchangé) |
| `/`, `/legal/*`, `/blog`, `robots.txt`, `sitemap.xml`, `manifest` | 200 | **identiques octet pour octet** (hors scripts de données React, découpés différemment par l'environnement) |
| `/en/nope` | 308 → `/nope` | 308 → `/nope` (404 à la charte) |

**Tests** : unitaires 100/100 ; E2E 157 réussis, 3 ignorés, 0 échec (dont 14 nouveaux tests 404 ordinateur +
mobile, 2 tests axe WCAG 2.1 AA sur la 404, non-régression des routes existantes). Captures avant/après dans le
rapport de session.

**Plan de déploiement isolé (sur autorisation explicite uniquement)** : avance rapide de la branche de production
`24cdc49` → commit 404 de cette branche (les documents `docs/seo/*` peuvent l'accompagner, ils ne changent rien au
site) ; contrôles après déploiement : 404 sur 7 formes d'adresses, pages existantes inchangées, Search Console
(aucune page valide ne doit passer en 404). Retour arrière : Cloudflare › Workers › Deployments › Rollback, puis
`git revert`.

## 2. Pôle de guides en anglais

- Architecture : `docs/seo/guides-en-architecture.md` (adresses, gabarits, métadonnées, `BreadcrumbList`,
  maillage, sitemap, conditions de publication bloquantes).
- Brouillons des 8 pages : `docs/seo/guides-en-drafts.md` — **non publiés, non branchés**. 18 étapes marquées
  `[VERIFY ON DEVICE]`, noms d'applications `[TO BE CONFIRMED]`.

## 3. Lien Telegram des données structurées (`sameAs`) et autres profils

Constat (20/11/2026, pages publiques consultées en lecture seule) :

| Profil `sameAs` (source `src/config/site.ts`) | Constat | Recommandation |
|---|---|---|
| `https://t.me/+2ee4Cu9x-nw1ZWVk` | **Lien d'invitation** d'une chaîne « SYGMA TV+ » sans nom public (page Telegram : « Join Channel », 1 abonné). Un lien d'invitation n'est pas une identité stable (il peut être révoqué ou régénéré). | **Retirer des données structurées.** Le garder seulement comme lien « rejoindre » dans le pied de page si souhaité. Si la chaîne devient publique avec un nom (`@…`), utiliser `https://t.me/<nom>` partout. Ne pas utiliser `t.me/sygmatv` ni `t.me/sygma_tv` : rien ne prouve qu'ils appartiennent à la marque. |
| `https://www.facebook.com/share/14unqXhVYRr/` | **Lien de partage** qui redirige (302) vers `https://www.facebook.com/profile.php?id=61596514232617`. | Utiliser l'adresse du profil (ou son nom d'utilisateur Facebook s'il en a un). |
| `https://whatsapp.com/channel/0029Vb96DpII1rchcsE0tC0V` | Redirige (302) vers `https://www.whatsapp.com/channel/…`. | Utiliser la forme `www.whatsapp.com`. |
| `https://www.youtube.com/@SYGMATV`, `https://www.tiktok.com/@sygma.tv` | 200. | OK. |
| `https://www.instagram.com/sygmatv` | Page de connexion pour les robots : non vérifiable automatiquement. | Confirmer que le compte appartient à la marque. |

Correction proposée (**non appliquée**, pour préserver la configuration SEO de production) : dans
`src/components/StructuredData.tsx`, exclure les liens d'invitation des `sameAs`
(`.filter((v) => !/^https:\/\/t\.me\/\+/.test(v))`) et, dans `src/config/site.ts`, remplacer les adresses Facebook et
WhatsApp par leurs formes canoniques. Changement limité au JSON-LD de l'accueil (et aux liens du pied de page pour
Facebook/WhatsApp) ; test unitaire et E2E à l'appui.

## 4. Allégations commerciales

Inventaire complet avec emplacements, preuves nécessaires et suggestions : `docs/seo/claims-inventory.md`.
Points prioritaires : volumes de chaînes et de films (35 000+ / 200 000+), sports et chaînes internationales,
replay, « The best IPTV experience », et deux fonctions annoncées qui n'existent pas encore (« Step-by-step guide per
device », « Help centre »).
