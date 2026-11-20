# Audit du parcours commercial réel — SYGMA TV+ (20/11/2026)

**Audit uniquement.** Aucun code, texte, prix, commande, automatisation, base de données ou valeur de configuration
n'a été modifié. Sources : code de production `864f703` (identique sur ce point à la branche
`claude/seo-phase5c-preview`), base Supabase de production (lecture seule, **comptages agrégés uniquement**),
journal d'envoi Brevo (lecture seule, sujets et étiquettes uniquement). Aucune donnée personnelle n'est reproduite.

## Tableau de synthèse

| Fonctionnalité | Présente dans le code | Vérifiée en fonctionnement | Système utilisé | Contradiction éventuelle | Correction recommandée |
|---|---|---|---|---|---|
| Formulaire de commande (« Order now ») | Oui — `CheckoutDialog.tsx` (formule, durée, appareils, e-mail, pays, WhatsApp, consentement) | Oui — 10 commandes enregistrées | Site → `POST /api/contact` (type `launch_waitlist`) | Nom technique hérité « pré-inscription / waitlist » pour de vraies commandes | Aucune (nom interne) ; ne pas confondre avec `/api/checkout` |
| Prix affiché avant envoi | Oui — `POST /api/quote` (prix calculé par le serveur, `chargeable: false`) | Oui | Supabase (`priceSource: database`) | — | — |
| Paiement en ligne automatique | **Non** — `/api/checkout` verrouillé (403 `sales_disabled`, puis 501 `payment_provider_not_integrated`), appelé par **aucune** page | Oui (verrouillé) | — | Aucune, le site dit « Nothing is charged on this site » | Ne jamais présenter de checkout automatique |
| Enregistrement des demandes | Oui — table `contact_requests` (insertion seule par le site, lecture réservée au serveur) | Oui — 10 commandes, 8 demandes d'essai | Supabase | — | — |
| Table `orders` (commandes payées en ligne) | Oui (préparée : `draft → pending_payment → paid → fulfilling → fulfilled`) | **Inutilisée** (0 ligne), comme `payment_webhook_events` (0) | Supabase | — | Aucune : réservée à un futur paiement en ligne |
| Statuts de commande | Oui — fiches `ops_cards` : `new` (🟡 Nouveau) → `contacted` (🔵 Contacté) → `converted` (🟢 Converti) / `lost` (⚪ Sans suite), annulation possible | Oui — 11 Nouveau, 3 Contacté, 3 Converti | Supabase + bot Telegram | « Converti » signifie dans le code « paiement reçu **et** abonnement activé » | Voir §4 (moment du clic « Converti ») |
| Notification de l'équipe | Oui — fiche en direct dans le groupe Telegram (sujets commandes / support / alertes), journal des actions, `/attente`, `/stats` | Oui (17 fiches créées, 15 actions d'équipe) | Bot Telegram « SYGMA Operations Bot » | — | — |
| E-mail « commande reçue » | Oui — `preregistration_received`, envoyé immédiatement | Oui — délivré (dont 1 client réel, le 16/11) | Brevo (API transactionnelle) | Aucune | — |
| E-mail « demande d'essai reçue » | Oui — `trial_received` | Oui | Brevo | — | — |
| E-mail « essai activé » | Oui — `trial_started`, au clic « 🎁 Essai envoyé » | Oui (2 envois) | Brevo + bot | — | — |
| Relance 24 h après l'essai (3 offres) | Oui — `trial_followup`, tâche horaire | Oui (2 envois) | Cron Cloudflare (`17 * * * *`) → `/api/cron/review-invites` | — | — |
| E-mail « abonnement actif » | Oui — `request_confirmed`, au clic « 🎉 Converti » | Oui — délivré et ouvert (1 client réel le 16/11 + tests) | Brevo + bot | Affirme « **Your payment has been confirmed** », « Payment Status: **Paid** », « **Amount Paid** » | Voir §4 et §5 |
| Facturation automatique | **Partielle** — numéro séquentiel `SYG-AAAA-NNNN` attribué au clic « Converti » (une fois par commande) + montant calculé au prix actuel du site | Oui — 3 numéros attribués | Supabase (`ops_invoice`) + e-mail Brevo (HTML) | Ce n'est pas une facture au sens strict : pas de document, montant = prix catalogue au moment du clic (pas le montant réellement payé ni une remise négociée) | Voir §4 |
| Facture PDF | **Non** — aucune bibliothèque PDF, aucune pièce jointe | **Non vérifiable depuis le dépôt** : aucun e-mail SYGMA TV+ avec facture dans Brevo (90 j) ; si un autre outil la produit, il n'est pas relié au dépôt | — | Les factures PDF visibles dans le même compte Brevo (« Ta facture … FAC-2026-… ») appartiennent à une **autre marque** du compte, pas à SYGMA TV+ | Fournir un exemple réel, ou ne pas promettre de PDF |
| Demande d'avis après 3 jours | Oui — `review_invite` (Trustpilot), une seule fois, 3 jours après « Converti », sans relance ni incitation | Oui — 3 envois ; chaîne complète vérifiée pour 1 client réel : commande 16/11 → Converti 16/11 → avis 19/11 | Cron Cloudflare + Supabase + Brevo | — | — |
| Messages préenregistrés (WhatsApp) | **Non** dans le dépôt (aucun texte WhatsApp prérempli, aucune intégration WhatsApp Business) | **Non vérifiable depuis le dépôt** | Probablement réponses rapides de WhatsApp Business (externe) | — | Me transmettre les textes pour aligner les pages |
| Activation de l'abonnement | **Non** dans le code (`activationProvider: null`) | **Non vérifiable depuis le dépôt** (faite à la main par l'équipe) | Panneau du fournisseur, hors dépôt | — | — |
| Paiement après activation | **Non** dans le code (aucune étape de paiement) | **Non vérifiable depuis le dépôt** (WhatsApp) | Moyens M1, hors site | CGU, pages 5C, e-mail « Converti » et fenêtre de commande placent le paiement **avant** l'activation | Voir §5 |
| Une seule période d'essai par client | **Non** (aucune contrainte en base) | Contrôle manuel par l'équipe (non vérifiable) | — | CGU muettes | Phrase à ajouter (§5) |
| Surveillance | Oui — contrôle horaire : site, base, e-mail, bot ; alerte Telegram | Oui | GitHub Actions « Monitor » + `/api/cron/monitor` | — | — |

## 1. Parcours client exact

1. **Choix** sur sygmatv.com (formule, durée, nombre d'appareils) ; prix calculé par le serveur.
2. **Formulaire** (« Order now ») : e-mail, pays, numéro WhatsApp, appareil, consentement → `POST /api/contact`.
   Rien n'est débité. Écran « Order sent » + e-mail **« Your order has been received! »**.
3. **Notification équipe** : fiche 🟡 Nouveau dans Telegram (sujet « commandes »).
4. **Contact WhatsApp** par l'équipe (bouton 📞 Contacté — aucun e-mail).
5. **Activation** par l'équipe (hors site).
6. **Paiement** par le client après activation (hors site, moyens M1).
7. **« 🎉 Converti »** : numéro `SYG-AAAA-NNNN` + e-mail **« Your SYGMA TV+ Subscription Is Now Active! »**.
8. **3 jours plus tard** : e-mail d'avis Trustpilot (automatique).

Variante essai : formulaire « Free trial » → e-mail « trial request received » → fiche Telegram → « 🎁 Essai envoyé » →
e-mail « trial is active » → 24 h plus tard, e-mail avec les 3 formules.

## 2. Automatisations identifiées

| Déclencheur | Automatisation | Vérifiée |
|---|---|---|
| Envoi du formulaire de commande | E-mail « order received » + fiche Telegram (et avis « même personne » si nouvelle commande du même e-mail) | Oui |
| Envoi d'une demande d'essai | E-mail « trial request received » + fiche Telegram | Oui |
| Demande de support | Fiche Telegram (sujet « support »), pas d'e-mail automatique | Oui (code) |
| Clic « Essai envoyé » | E-mail « trial is active » (une fois) | Oui |
| 24 h après « Essai envoyé » (si ni converti ni perdu) | E-mail de relance avec les 3 formules et les prix actuels | Oui |
| Clic « Converti » | Numéro de commande séquentiel + e-mail « subscription is now active » (une fois) | Oui |
| 3 jours après « Converti » | E-mail d'avis Trustpilot (une fois, retenté en cas d'échec) | Oui |
| Toutes les heures | Contrôle site / base / e-mail / bot, alerte Telegram | Oui |
| `/testemail` (admins) | E-mails d'exemple vers la boîte de l'équipe uniquement | Oui (code) |
| Messages WhatsApp préenregistrés, activation, encaissement, facture PDF | — | Non vérifiables depuis le dépôt |

Observation : le compte Brevo est partagé avec une autre marque (envois de factures, relances, codes). Sans effet sur
SYGMA TV+ dans le code, mais la réputation d'envoi est commune ; à garder en tête si la délivrabilité baisse.

## 3. Pourquoi `/api/health` indique `prelaunch` et `salesEnabled: false`

- `mode: "prelaunch"` est une **valeur fixe** écrite dans `src/app/api/health/route.ts` : elle ne lit aucun réglage
  et ne pilote rien.
- `salesEnabled` est le résultat du **verrou de vente en ligne** (`src/config/launch-gate.ts`). Il ne concerne que
  `POST /api/checkout`, le futur **paiement automatique sur le site**, qui n'est appelé par aucune page. Bloqueurs
  actuels : `SALES_ENABLED=false` (wrangler.jsonc), aucun prestataire de paiement, aucun prestataire d'activation,
  règles fiscales absentes, aucun territoire sous licence, domaine non renseigné dans la configuration.
- Le **formulaire de commande assisté** passe par `/api/contact`, contrôlé uniquement par `FEATURE_CONTACT_FORM=true`
  et Supabase : il fonctionne **indépendamment** de ce verrou.
- En base, les marchés US/CA/EU ont `licensed=false`, `sales_enabled=false` : ces drapeaux ne protègent que la table
  `orders` (paiement en ligne, 0 ligne), pas `contact_requests`.
- Qui lit `/api/health` : le test après déploiement et le moniteur horaire, qui vérifient seulement `"status":"ok"`.

**Conclusion** : il n'y a pas de dysfonctionnement. `salesEnabled: false` veut dire « pas de paiement automatique sur
le site », ce qui est exact pour une vente assistée. `prelaunch` est en revanche un libellé trompeur.
**Ne pas** passer `SALES_ENABLED` à `true` : cela ne changerait rien au formulaire et lèverait un verrou prévu pour
un paiement en ligne qui n'existe pas (la route répondrait alors 501). Option (sur votre accord, plus tard) :
remplacer le libellé fixe par `mode: "assisted"` ou ajouter `ordering: "assisted"` — changement neutre pour les moniteurs.

## 4. Fonctionnement de la facturation

- Au clic **« Converti »** : la base attribue un numéro séquentiel `SYG-2026-0001, 0002…` (une seule fois par
  commande, conservé même après annulation puis nouveau clic), horodaté.
- L'e-mail « Your subscription is now active! » affiche : numéro de commande, formule, durée, appareils,
  **« Amount Paid »** (prix catalogue actuel recalculé au moment du clic), **« Payment Status: Paid »**,
  « Subscription Status: Active ».
- **Pas de PDF**, pas de document de facture, pas de mentions de facture (vendeur, client, taxes) : c'est une
  **confirmation de commande avec numéro**, pas une facture au sens légal.
- **Point à trancher** : l'e-mail affirme que le paiement est reçu. Il n'est exact que si « Converti » est cliqué
  **après le paiement**. Si l'équipe clique « Converti » à l'activation (avant paiement), l'e-mail est inexact.
  Recommandation : consigne d'équipe « Converti = paiement reçu » (aucun changement de code) ; plus tard, si souhaité,
  une action distincte « Activé » avec son propre e-mail.
- Le montant affiché est le prix du site au moment du clic : une remise ou un prix négocié sur WhatsApp n'y apparaît pas.

## 5. Incohérences de contenu et textes proposés (non appliqués)

| Où | Texte actuel | Problème | Texte proposé (exact) |
|---|---|---|---|
| CGU §2 « How ordering works » | « our team contacts you on WhatsApp to confirm your order and payment, then activates your access. » | Paiement placé avant l'activation | « When you order on the site, nothing is charged there. Our team contacts you on WhatsApp to confirm your order and activates your access; you then pay with one of the payment methods offered by our team. The contract starts when we confirm your order. » *(relecture juridique)* |
| CGU §3 « Plans, prices and payment » | « Payment is arranged with our team when your order is confirmed. » | Idem | « Payment is arranged with our team on WhatsApp and is due once your access has been activated. » *(relecture juridique)* |
| CGU §1 | « …and, once subscriptions open, the SYGMA TV+ streaming service. » | Laisse croire que les abonnements ne sont pas ouverts | « These Terms govern your use of sygmatv.com and of the SYGMA TV+ streaming service. » *(relecture juridique)* |
| CGU (nouvelle phrase) | — | Essai unique non écrit | « One free trial per customer. » |
| Politique de remboursement | « Ask within 7 days of activation… » | Si le client paie quelques jours après l'activation, sa fenêtre de 7 jours est déjà entamée | « Ask within 7 days of your payment… » ou « …of activation or payment, whichever is later » *(décision + relecture juridique)* |
| Fenêtre de commande (`productionNote`) | « Our team confirms your order and payment with you on WhatsApp. » | Ordre ambigu | « Nothing is charged on this site. Our team contacts you on WhatsApp, activates your access, and you pay after activation. » |
| E-mail « subscription is now active » | « Your payment has been confirmed, and your subscription has been successfully activated. » ; « Amount Paid » ; « Payment Status: Paid » | Exact seulement si « Converti » = paiement reçu | Garder si consigne « Converti = paiement reçu » ; sinon « Your subscription has been successfully activated. » et « Amount » + statut retiré |
| E-mail « order received » | « …guide you through the activation process. » | Cohérent | — |
| Accueil, étapes « Get activated — Quickly, on WhatsApp » et FAQ « contacts you on WhatsApp to activate your access » | — | Cohérents | Option : ajouter « You pay after activation. » à la FAQ « Can I order online? » |
| **Pages 5C** (About §3 et §6, Getting started, Ordering and payment, données `usualActivation`) | « Confirm and pay » puis « Start watching » ; « activated within an hour **after your payment is confirmed** » ; « Once your order is confirmed on WhatsApp, our team arranges the payment » | **Inversent le parcours réel** | Voir §6 |
| Pages 5C « amount paid » / « confirmation email with your order number and the amount paid » | — | Dépend de §4 | « …a confirmation email with your order number. » |
| `/api/health` `mode: "prelaunch"` | — | Libellé technique trompeur (non public) | Option §3 |

## 6. Modifications proposées pour la Phase 5C (après votre validation)

1. `OWNER_FACTS.usualActivation` : « within an hour after your order is confirmed on WhatsApp ».
2. Étapes (About §3, Getting started, Ordering §1) — 5 étapes :
   1. **Choose your plan** — « Pick your plan, its duration and the number of devices on our website. The price is shown straight away. »
   2. **Send your order** — « Fill in a short form with your email, country and WhatsApp number. Nothing is charged on this website. You receive an email confirming that we received your order. »
   3. **We contact you on WhatsApp** — « Our team confirms your order and sends you your access details and setup instructions. »
   4. **Your access is activated** — « Usually within an hour after your order is confirmed. »
   5. **You pay after activation** — « Once your access is active, you pay with one of the payment methods our team offers. You then receive a confirmation email with your order number. »
3. « How do I pay? » : « You pay after your access has been activated, never on this website. Our team sends you the payment options on WhatsApp. Accepted methods: … » (+ note « arranged manually by our team »).
4. « How long does activation take? » : « Your access is usually activated within an hour after your order is confirmed on WhatsApp — a usual time, not a guarantee. »
5. About §6 renommée « Activation, payment and confirmation » (même ordre que le parcours) ; « amount paid » retiré tant que §4 n'est pas tranché.
6. Ajouter une ligne « Automatic emails » (sans promesse de PDF) : « You receive an email when we receive your order and when your subscription is confirmed. »
7. Ne **pas** mentionner : facture PDF, messages WhatsApp préenregistrés, paiement en ligne, avis (l'invitation Trustpilot reste un e-mail, pas une promesse).
8. Tests : remplacer les garde-fous « payment before activation » par « pay after activation » ; conserver l'interdiction de « instant », « guaranteed », « checkout », « PDF ».

Aucun de ces changements n'est fait. Les CGU, la politique de remboursement, la fenêtre de commande et les e-mails
relèvent de la production et nécessitent votre décision (et une relecture juridique pour les CGU / remboursements).
