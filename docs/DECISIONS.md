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
| D13 | Hébergement sur **Cloudflare Workers** via l'adaptateur officiel OpenNext (`@opennextjs/cloudflare`) | Demande du propriétaire (GitHub + Supabase + Cloudflare). Garde le rendu serveur, les API et les en-têtes de sécurité. |
| D14 | Cache des pages = assets statiques (pas de R2/KV) ; pages pré-rendues au build | Aucune ressource Cloudflare payante à créer. Les prix affichés sont ceux du dernier build ; le devis `/api/quote` relit la base (cache 5 min). |
| D15 | Redirection de langue via `redirects` de `next.config.ts` (cookie `NEXT_LOCALE` → Accept-Language → EN) au lieu d'un Proxy | Le Proxy Next 16 tourne en mode Node, support seulement expérimental sur Cloudflare. |
| D16 | Clé Supabase **publishable** et URL commitées (`wrangler.jsonc`, `.env.production`) | Clé conçue pour être publique, protégée par RLS + GRANT explicites ; aucun secret dans le dépôt. |
| D17 | **Thème « Dark Tech Blue »** (noir + bleu électrique/cyan, grille technique, surfaces vitrées, lueurs) à la place du noir et or | Décision du propriétaire le 08/11/2026 ; remplace la palette or du cahier des charges. Contrastes vérifiés WCAG AA (axe). Couleurs centralisées : tokens CSS dans `globals.css`, palette SVG dans `src/components/visuals/palette.ts`. |
| D18 | Visuels **originaux en SVG** (maquettes d'interface, art abstrait par catégorie, illustrations d'appareils) | Aucun droit tiers, aucun coût de génération, aucune requête réseau supplémentaire. |
| D12 | ~~Pages en `noindex`~~ → **indexation ouverte** depuis le 09/11/2026 (`NEXT_PUBLIC_ALLOW_INDEXING=true`) | Passage en pré-lancement à la demande du propriétaire. |
| D19 | **Mode pré-lancement** (09/11/2026) : mentions « prototype / démo » retirées ; le parcours de commande devient une **pré-inscription réelle** (offre, région, appareil → `contact_requests`) ; prix présentés comme « prix de lancement prévus, hors taxes » | Demande du propriétaire de « tout activer ». La **vente réelle reste verrouillée** : aucun prestataire de paiement et aucune licence de diffusion vérifiée ; l'activer serait illégal et techniquement impossible. |

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
