# Décisions prises et décisions en attente

## Décisions techniques prises de façon autonome

| # | Décision | Raison |
|---|---|---|
| D1 | Next.js 16 App Router + TypeScript strict + Tailwind v4 | Architecture suggérée par le cahier des charges (§5). |
| D2 | Design porté tel quel en CSS (tokens `@theme`) plutôt que réécrit en classes utilitaires | Fidélité maximale au design « Dark Cinematic Premium » validé. |
| D3 | i18n maison (dictionnaires TS, `/en` `/fr`) sans bibliothèque | 2 langues seulement ; TypeScript garantit la parité des clés. |
| D4 | Le navigateur ne parle **jamais** à Supabase : tout passe par les routes `/api/*` et les composants serveur | CSP `connect-src 'self'`, aucune clé exposée, validation + rate limiting centralisés. |
| D5 | Prix indicatifs **figés par marché** (générés une fois depuis le prototype par `scripts/generate-prototype-prices.mjs`) et marqués `illustrative` | Respecte « pas de conversion FX en production » tout en conservant l'affichage validé. |
| D6 | Le projet Supabase « Smart TV » (créé le 08/11/2026, vide, sans branche) est traité comme **environnement de développement** | Aucune donnée ni trafic de production ; aucune branche Supabase créée (option payante = transaction financière non autorisée). |
| D7 | Formulaire contact via la clé **publishable** (rôle `anon`, INSERT seul) plutôt que la clé secrète | La clé secrète n'est pas nécessaire et n'a pas été créée/récupérée (pas de modification de secrets). |
| D8 | Rate limiting en mémoire (par instance) + limitation **en base** (5/h par e-mail, 120/min global, code `PT429` → HTTP 429) | Défense en profondeur ; à remplacer par Redis/Upstash en multi-instance. |
| D9 | CSP avec `'unsafe-inline'` pour les scripts | Nécessaire au rendu statique Next.js sans nonce ; passer aux nonces si les pages deviennent dynamiques. |
| D10 | Conservation proposée des demandes de contact : 12 mois | Valeur raisonnable à faire valider par un juriste (affichée comme « brouillon »). |
| D11 | Marché `EU` avec `tax_inclusive_pricing = true` | Obligation d'affichage TTC B2C dans l'UE ; à confirmer par le conseil fiscal. |
| D12 | Pages en `noindex,nofollow` + `robots.txt` bloquant tant que `NEXT_PUBLIC_ALLOW_INDEXING≠true` | Le site n'est pas une offre commerciale. |

## Décisions business en attente (bloquantes pour le lancement)

Toutes sont des `null` dans `src/config/site.ts` et apparaissent dans `/api/checkout` → `blockers` :

- [ ] Nom de marque (actuellement le placeholder `GlobalTV+`) et domaine — dépôt de marque UE/US/CA
- [ ] Autorisation écrite du fournisseur pour la redistribution, par territoire, chaînes et VOD
- [ ] Droit d'utiliser logos, affiches, marques
- [ ] Entité juridique, adresse, immatriculation, TVA
- [ ] Prix réels **par marché**, règles fiscales, renouvellement, essai, remboursement
- [ ] Prestataire de paiement (après underwriting) et prestataire d'activation
- [ ] Contact support et horaires
- [ ] Textes juridiques (CGV, confidentialité, cookies, remboursement, mentions légales) rédigés par un juriste

## Procédure pour ouvrir la vente (plus tard)

1. Renseigner `src/config/site.ts` avec les informations **vérifiées**.
2. En base : `markets.licensed = true` puis `sales_enabled = true` pour le marché concerné, et insérer des `prices` avec `status = 'approved'` (la base refuse toute commande `pending_payment` sinon).
3. Intégrer le paiement hébergé du prestataire dans `/api/checkout` (commande `draft` côté serveur avec `idempotency_key`).
4. Configurer `PAYMENT_WEBHOOK_SECRET` et `SUPABASE_SECRET_KEY` côté serveur uniquement.
5. Mettre `SALES_ENABLED=true`.
