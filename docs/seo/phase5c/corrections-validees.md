# Phase 5C — Corrections validées le 20/11/2026 (parcours commercial réel)

Branche isolée `claude/seo-phase5c-preview`. **Rien n'est déployé, fusionné ni publié.** Aucune modification des
prix, des commandes, du formulaire, des API commerciales, des e-mails, de WhatsApp, des CGU ni de la politique de
remboursement publiées. Aucune migration. `350882a` absent. Nouvelles pages toujours désactivées par défaut.

## 1. Parcours réel retenu (décision du propriétaire)

1. Le client choisit son pack sur sygmatv.com.
2. Il remplit le formulaire rapide (« Order now »).
3. L'équipe le contacte sur WhatsApp.
4. L'équipe active son abonnement.
5. Le client paie (moyens proposés par l'équipe, hors site).
6. Après réception **et confirmation** du paiement, l'équipe clique « 🎉 Converti » dans Telegram, ce qui envoie
   l'e-mail « Your subscription is now active! » (numéro de commande, détails, confirmation du paiement).

**Consigne d'équipe** : « Converti » uniquement après réception et confirmation du paiement. C'est une règle de
fonctionnement, pas un changement de code : la logique du bot et l'e-mail restent strictement identiques.

## 2. Modifications faites dans la branche

| Fichier | Modification |
|---|---|
| `src/app/api/health/route.ts` | `mode: "prelaunch"` → `mode: "assisted"` (libellé seul). `salesEnabled` reste calculé par le verrou de lancement et vaut `false` ; `SALES_ENABLED=false` inchangé. Dépendances vérifiées : seul le contrôle `"status":"ok"` est lu (moniteur horaire, test après déploiement). |
| `src/content/en/info.ts` | Parcours en 6 étapes (About, Ordering and payment), « Activation, then payment » (Getting started), « When and how do I pay? », « Which emails will I receive? », activation habituelle « within an hour after your order is confirmed on WhatsApp », e-mail de confirmation décrit après réception et confirmation du paiement (jamais « invoice », « PDF » ni « amount paid »), engagement « pays ouverts seulement avec autorisations » retiré des nouvelles pages (non vérifié, M8). |
| `src/app/[locale]/help/page.tsx` | Bandeau « Activation » : « Before payment, after your order is confirmed ». |
| `src/components/info.module.css` | Étapes sur 3 colonnes (6 étapes = 2 rangées de 3) ; mobile inchangé (1 colonne). |
| `tests/unit/api.test.ts` | Nouveau test : `/api/health` = `{ status: "ok", mode: "assisted", salesEnabled: false }`. |
| `tests/unit/info-pages.test.ts` | Garde-fous : ordre formulaire → WhatsApp → activation → paiement → e-mail ; interdiction de « activated … after your payment », « confirm … and pay », « arrange the payment », « amount paid », « checkout », « invoice », « PDF ». |
| `tests/e2e/commerce.spec.ts` (nouveau) | `/api/health` en mode `assisted` avec `salesEnabled: false` ; `/api/checkout` toujours verrouillé (403 `sales_disabled`). |
| `tests/e2e/content-pages.spec.ts` | Libellé du sommaire « When and how do I pay? ». |

Point à confirmer : l'information M2 (activation en moins d'une heure) était formulée « après confirmation du
paiement ». Avec l'activation avant paiement, elle est désormais rattachée à la **confirmation de la commande sur
WhatsApp**. Merci de confirmer ce point de départ avant publication.

## 3. Proposition de remboursement « 7 jours à compter du paiement » (documentation uniquement)

**Non appliquée** : la politique publiée (« 7 days of activation ») reste en ligne et les nouvelles pages la
reprennent telle quelle tant qu'elle n'a pas changé. À faire valider par un juriste.

| Document | Texte publié | Proposition |
|---|---|---|
| Politique de remboursement, « Satisfied or refunded — 7 days » | « Not satisfied? Ask within 7 days of activation and we refund 100%, no questions asked. One refund per customer; not available for accounts suspended for sharing or reselling access. » | « Not satisfied? Ask within 7 days of your payment and we refund 100%, no questions asked. One refund per customer; not available for accounts suspended for sharing or reselling access. » |
| CGU, « Renewal, refunds and withdrawal » | « …you get a full refund if you ask within 7 days of activation (“Satisfied or refunded”). » | « …you get a full refund if you ask within 7 days of your payment (“Satisfied or refunded”). » |
| Méta-description de la politique | « 100% refund within 7 days of activation » | « 100% refund within 7 days of payment » |
| Accueil (bloc Refunds, FAQ) | « …a full refund if you ask within 7 days of activation » | « …within 7 days of your payment » |
| Nouvelles pages (About, Help › Refunds) | reprennent la politique publiée | mises à jour **en même temps** que la politique |

Questions pour le juriste : point de départ du délai de rétractation de 14 jours (UE / R-U) quand l'accès est
fourni **avant** le paiement ; recueil du consentement à l'exécution immédiate d'un service numérique ; cas d'un
client activé qui ne paie pas.

## 4. Formulations de pré-lancement devenues incohérentes (signalées, non modifiées)

| Où | Texte | Visible ? | Proposition |
|---|---|---|---|
| CGU §1 | « …and, once subscriptions open, the SYGMA TV+ streaming service. » | **Oui** (`/legal/terms`) | « These Terms govern your use of sygmatv.com and of the SYGMA TV+ streaming service. » *(juriste)* |
| CGU §2 « How ordering works » | « …to confirm your order and payment, then activates your access. » | **Oui** | « …our team contacts you on WhatsApp to confirm your order and activates your access; you then pay with one of the payment methods offered by our team. The contract starts when we confirm your order. » *(juriste)* |
| CGU §3 « Plans, prices and payment » | « Payment is arranged with our team when your order is confirmed. » | **Oui** | « Payment is arranged with our team on WhatsApp once your access has been activated. » *(juriste)* |
| Fenêtre de commande (note) | « Our team confirms your order and payment with you on WhatsApp. » | **Oui** (étape de vérification) | « Our team contacts you on WhatsApp, activates your access, and you pay after activation. » |
| `/api/health` | `mode: "prelaunch"` | Technique | **Corrigé dans la branche** (`assisted`) |
| Dictionnaire `compliance2` | « Each country opens only once broadcasting authorisations are in place. » | **Non** (texte non affiché sur le site ; il figurait seulement dans la première version de la page About, retiré) | Ne pas l'afficher tant que M8 n'est pas prouvé |
| Commentaires de code (`terms.ts` « before subscriptions open », `legal.ts` « before launch ») | — | Non | Mettre à jour avec la relecture juridique |
| Noms internes `launch_waitlist`, `preregistration_received` | — | Non (l'objet de l'e-mail est déjà « Your order has been received! ») | Aucun changement (touche aux commandes et e-mails) |
| Blog « First articles coming soon » | — | Oui (`/blog`) | Sans lien avec la vente ; à garder ou à retirer quand le blog sera alimenté |

Correction d'un document précédent : `finalisation.md` indiquait que la phrase « Each country opens only once
broadcasting authorisations are in place » figurait dans le pied de page. Vérification du 20/11/2026 : elle n'est
affichée sur **aucune** page en ligne.

## 5. Points encore bloquants avant publication des pages

1. Confirmation du point de départ « moins d'une heure » (§2).
2. CGU §1–§3 et fenêtre de commande alignées sur « paiement après activation » (relecture juridique) — sinon les
   nouvelles pages contredisent les CGU publiées.
3. Décision juridique sur le remboursement « 7 jours à compter du paiement » (§3).
4. Allégations du gabarit commun A4 (sports), A5 (chaînes internationales), B1 (« HD to 4K »), D2 (« Help centre ») —
   `finalisation.md` §2.
5. Allégations P0 de l'accueil (A1–A3 volumes, A6, A7 replay, C1) et P1 (D1 guides, D3 « VIP priority », B4) —
   `finalisation.md` §2.
6. Données structurées de l'accueil (langues du support, `foundingDate`) à aligner au moment de la publication.
7. Factures PDF et messages WhatsApp : non vérifiables depuis le dépôt, donc non mentionnés (rien à faire avant
   publication, sauf si vous souhaitez les décrire plus tard).
8. Votre validation explicite, puis déploiement avec l'interrupteur `off` (site identique), puis activation `live`.
