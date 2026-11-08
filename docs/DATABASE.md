# Base de données Supabase — projet « Smart TV » (développement)

Projet : `gsxgfefpkosrlflggdxv` (eu-central-1, Postgres 17). Migrations dans `supabase/migrations/`, appliquées dans l'ordre :

| Migration | Contenu |
|---|---|
| `…100000_baseline_privileges` | **Désactive l'exposition automatique** : révoque les privilèges par défaut de `anon`, `authenticated`, `service_role` (tables, séquences, fonctions) et `EXECUTE` par défaut à `PUBLIC`. Crée le schéma `private` (non exposé). |
| `…100100_catalog` | `markets`, `plans`, `prices` (+ trigger de cohérence devise ↔ marché, index unique « un prix ouvert par marché/offre »). |
| `…100200_customers_orders` | `customers` (créé automatiquement à l'inscription Auth), `orders`, `order_events`, `payment_webhook_events`, machine d'états, verrou de lancement, journal d'audit. |
| `…100300_contact_requests` | Demandes de support / liste de lancement + limitation anti-abus en base. |
| `…100400_api_privileges_rls` | RLS sur toutes les tables + **GRANT explicites** table par table, colonne par colonne. |
| `…100500_harden_platform_function` | Retire `EXECUTE` aux rôles API sur la fonction plateforme `rls_auto_enable()` (la protection reste active). |

`supabase/seed.sql` (généré) : 3 marchés non licenciés, 16 offres, 48 prix `illustrative`. Idempotent, ne supprime rien.

## Matrice des privilèges (moindre privilège)

| Table | anon | authenticated | service_role |
|---|---|---|---|
| markets, plans, prices | SELECT (actifs / prix en cours) | SELECT | SELECT, INSERT, UPDATE |
| contact_requests | INSERT (9 colonnes), **aucune lecture** | idem | SELECT, INSERT, UPDATE |
| customers | — | SELECT/UPDATE **sa ligne** (nom, pays, langue, consentement marketing) | SELECT, UPDATE |
| orders | — | SELECT **ses commandes** | SELECT, INSERT, UPDATE |
| order_events | — | SELECT de **ses** commandes | SELECT (écriture par trigger) |
| payment_webhook_events | — | — | SELECT, INSERT, UPDATE |

Aucun rôle API n'a `DELETE`/`TRUNCATE`. Le schéma `private` est inaccessible aux rôles API.

## Règles garanties par la base (indépendamment de l'application)

- `sales_enabled` impossible sans `licensed` (contrainte CHECK).
- Une commande naît en `draft` ; transitions autorisées uniquement : draft→pending_payment/cancelled, pending_payment→paid/failed/cancelled, failed→pending_payment/cancelled, paid→fulfilling/refunded, fulfilling→fulfilled/failed, fulfilled→refunded.
- Passage en `pending_payment` refusé si le marché n'est pas licencié + ouvert, si le prix n'est pas `approved`, ou si les CGV ne sont pas acceptées.
- Le sous-total doit égaler le prix serveur ; prix/montants/e-mail figés après `draft`.
- Chaque création / changement de statut est tracé dans `order_events` (acteur = rôle JWT).
- Idempotence : `orders.idempotency_key` unique, `(provider, provider_event_id)` unique pour les webhooks.
- Aucun identifiant, URL M3U ou secret d'activation n'est stocké.

## Tests

`supabase/tests/rls_and_privileges.test.sql` — 48 assertions (structure, non-exposition des nouvelles tables, intégrité, cycle de vie des commandes, isolation anon / Alice / Bob, throttling). Exécuté :

- en local sur PostgreSQL 16 avec émulation des rôles Supabase : `npm run db:test` ;
- sur le projet distant dans une transaction **annulée** (aucune donnée conservée) : 48/48 OK.

Vérification Data API en direct (clé publishable) : `prices` 200, `orders` / `payment_webhook_events` / RPC `rls_auto_enable` → 401 `permission denied`.

Advisors Supabase après migration : sécurité — 1 INFO attendue (`payment_webhook_events` sans policy : réservé au serveur) ; performance — index non encore utilisés (base vide).

## Ajouter une table (procédure)

1. Nouvelle migration `supabase/migrations/<timestamp>_<nom>.sql`.
2. `alter table … enable row level security;` + policies.
3. `grant` explicites au(x) rôle(s) strictement nécessaires — rien n'est exposé sinon.
4. Ajouter des assertions dans le fichier de test, `npm run db:test`, puis appliquer sur le projet de dev.
5. Régénérer `src/lib/supabase/database.types.ts`.
