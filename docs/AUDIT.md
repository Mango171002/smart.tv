# Audit — réel vs simulé (8 novembre 2026)

## 1. Prototype d'origine (`prototype/index.html`)

| Élément | État dans le prototype |
|---|---|
| Navigation sticky, menu mobile, hero, bénéfices, catégories, appareils, étapes, FAQ, footer | **Réel** (HTML/CSS statique) |
| Sélecteur d'offre (région, durée, flux) | **Réel côté UI**, mais prix = `base × (1 + (flux−1)×0,55) × taux de change fictif` calculé dans le navigateur |
| Prix USD/CAD/EUR | **Simulés** (conversion FX fictive, interdite en production par le cahier des charges) |
| Paiement en 3 étapes | **Simulé** — aucun envoi réseau |
| Sélecteur de langue | **Simulé** (FR/DE désactivés) |
| Backend, commandes, paiement, activation, CRM, e-mail, support, catalogue, analytics, pages légales | **Inexistants** |
| Accessibilité du modal | Partielle : pas de piège de focus, ESC/restauration du focus OK |

## 2. Ce qui est désormais réel dans cette version

| Fonctionnalité | Statut |
|---|---|
| Application Next.js 16 (App Router, TypeScript strict, Tailwind v4) | ✅ Réel |
| 7 pages × 2 langues (EN/FR) + 5 pages légales (brouillons) + 404 localisée | ✅ Réel, pré-rendues au build (SSG) |
| Routage par langue (cookie → Accept-Language → EN), hreflang, canonical, sitemap, robots | ✅ Réel |
| Bundle Cloudflare Workers (OpenNext) testé dans le runtime workerd : 42/42 E2E | ✅ Réel — mise en ligne à connecter depuis le tableau de bord Cloudflare |
| Grilles tarifaires **par marché** (centimes, sans conversion), lues depuis Supabase avec repli statique | ✅ Réel — mais les **montants restent indicatifs** (`status = illustrative`) |
| Devis serveur `/api/quote` (le client ne décide jamais du prix) | ✅ Réel |
| Formulaires « question » et « notification de lancement » → table `contact_requests` | ✅ Réel (base de **développement**) |
| Paiement en 3 étapes avec montant confirmé par le serveur | ⚠️ **Simulé** volontairement : aucune commande, aucun paiement |
| `/api/checkout` | 🔒 Verrouillé (403 `sales_disabled` + liste des blocages) |
| `/api/webhooks/payment` (signature HMAC, idempotence) | ⚠️ Prêt mais **désactivé** (aucun prestataire, aucun secret) |
| Schéma commandes / clients / webhooks + machine d'états + audit | ✅ Réel en base, **non utilisé** par l'UI tant que la vente est bloquée |
| Espace client, authentification, factures | ❌ Phase 2 (schéma et RLS prêts) |
| Catalogue sous licence, logos, appareils vérifiés | ❌ Bloqué juridiquement — catégories génériques uniquement |
| Taxes | ❌ Non calculées (« Non calculé » affiché) |
| Analytics / cookies | ❌ Aucun (pas de bannière nécessaire) |

## 3. Écarts corrigés par rapport au prototype

- Piège de focus clavier dans le dialogue de paiement + retour du focus + `aria-current="step"`.
- Tableaux défilants accessibles au clavier (`scrollable-region-focusable`).
- Libellé du logo conforme au texte visible (`label-content-name-mismatch`).
- Lien d'évitement « Aller au contenu », `prefers-reduced-motion`, cibles tactiles ≥ 44 px.
- Couleurs alignées sur la palette validée du cahier des charges (`#080D18`, `#D9B76F`, …) — le prototype utilisait des valeurs voisines (`#080f1e`, `#e6bd68`).
- Plus de multiplication FX : chaque marché a sa propre grille (les valeurs indicatives reproduisent exactement l'affichage du prototype).
