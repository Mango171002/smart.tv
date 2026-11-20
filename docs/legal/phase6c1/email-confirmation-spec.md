# Spécification — date de confirmation du paiement dans l'e-mail « Your subscription is now active! » (DECISION-21)

**Statut : spécification uniquement — rien n'est implémenté.** Aucun template d'e-mail, service d'envoi, automatisation,
statut, paiement, API ou schéma n'est modifié. L'implémentation attend une autorisation explicite.

## 1. Texte proposé

Ligne ajoutée au tableau « Your Subscription Details », juste après « Order Number » :

| Libellé | Valeur (exemple) |
|---|---|
| **Payment confirmed on** | **20 November 2026, 18:00 UTC** |

Version texte brut (e-mail multipart) : `Payment confirmed on: 20 November 2026, 18:00 UTC`

Le reste de l'e-mail est inchangé (sujet, numéro de commande, formule, durée, appareils, montant, « Payment Status:
Paid », « Subscription Status: Active », instructions, signature).

Aucun texte n'indique que c'est la date du virement du client : le libellé « Payment confirmed on » désigne la date de
**validation interne** (DECISION-20). Phrase facultative sous le tableau, à valider :
« This is the date our team confirmed your payment; your 7-day “Satisfied or refunded” period starts the next day. »
(ne l'ajouter qu'après validation juridique de la politique de remboursement).

## 2. Source exacte de la date (vérifiée en lecture seule le 20/11/2026)

| Élément | Constat |
|---|---|
| Colonne | `public.contact_requests.invoice_issued_at`, type `timestamp with time zone` (production) |
| Écriture | Uniquement par la fonction `public.ops_invoice(p_request uuid)` (`SECURITY DEFINER`, exécutable par `service_role` seulement) : si `invoice_number` est vide, elle prend `now()`, attribue `SYG-AAAA-NNNN` et enregistre la date ; sinon elle renvoie le numéro et la date existants (`new: false`). Aucune autre fonction ne l'écrit ; les rôles `anon` et `authenticated` ne peuvent pas la modifier |
| Déclenchement | Bouton Telegram « 🎉 Converti » → `ops_apply(…, 'convert')` (statut `converted`) → si succès et demande ≠ support : `sendConversionEmail()` → `ops_invoice` (`src/lib/telegram/ops.ts`) |
| Valeur transmise | `ops_invoice` renvoie `issued_at` ; `sendConversionEmail` le place déjà dans `invoice.issuedAt`, transmis au template. **Le template ne l'affiche pas aujourd'hui** (`src/lib/email/templates.ts`) |
| Fuseau de la base | `UTC` ; la valeur est absolue (horodatage avec fuseau) |
| Données réelles (agrégées) | 3 numéros émis, 3 avec date, 0 sans action « Converti » ; écart avec le premier « Converti » : 0 s (arrondi) ; aucune commande convertie deux fois |

### Confirmations demandées

| Question | Réponse |
|---|---|
| `invoice_issued_at` est-il enregistré lors de la validation manuelle ? | **Oui** — uniquement à la suite d'un « Converti » réussi (action manuelle Telegram) |
| Représente-t-il la première confirmation ? | **Oui, avec une nuance** : c'est la date de la **première attribution réussie du numéro de commande**. `ops_invoice` est appelée juste après `ops_apply`, dans une requête séparée (pas la même transaction). Si cet appel échouait (base indisponible), la commande resterait « Converti » sans numéro ni date ; le numéro et la date seraient alors attribués lors d'un nouveau « Converti » (après annulation), donc plus tard. Ce cas ne s'est jamais produit (0 sur 3) |
| Annulation puis nouveau « Converti » ? | La date **ne change pas** (numéro et date conservés) ; l'e-mail **n'est pas renvoyé** (`new: false`) |
| Réouverture admin (« Converti » → « Contacté ») puis nouveau « Converti » ? | Même comportement : date d'origine conservée, pas de nouvel e-mail |
| La date peut-elle être récupérée pour l'e-mail ? | **Oui** — déjà disponible dans `invoice.issuedAt` au moment de l'envoi |
| L'ajout modifie-t-il les déclencheurs ou les destinataires ? | **Non** — seul le rendu du template change ; `sendConversionEmail`, l'appel `sendCustomerEmail('request_confirmed', r.email, …)` et les conditions d'envoi restent identiques |

### Incertitudes signalées (non supposées)

1. **Format exact renvoyé** par PostgREST pour `issued_at` (ex. `2026-11-20T18:00:00.730417+00:00`) : à confirmer par un
   test d'intégration ; `new Date()` l'interprète correctement en local (vérifié).
2. **Erreur humaine** : si « Converti » est cliqué avant réception des fonds (contraire à DECISION-20), la date
   enregistrée sera trop tôt et **ne peut pas être corrigée** par l'outil actuel (aucune fonction de correction). Une
   procédure de correction (avec trace) serait à définir si nécessaire.
3. **Demandes d'essai** : un « Converti » sur une demande d'essai (type `trial_request`) attribue aussi un numéro et
   envoie le même e-mail — comportement existant, à confirmer comme voulu.
4. **E-mail non envoyé** (`failed` / `not_configured`) : pas de renvoi automatique ; la date reste en base et peut être
   communiquée par le support.

## 3. Format UTC

- Calcul à partir de la valeur enregistrée (jamais de la date d'envoi de l'e-mail, ni de l'heure du serveur d'envoi).
- Composition explicite (le format anglais standard insère « at ») :
  `<jour sans zéro> <mois en anglais> <année>, <HH>:<MM> UTC` — ex. `20 November 2026, 18:00 UTC`.
- Fuseau `UTC` forcé ; heures sur 24 h ; minutes tronquées (les secondes ne sont pas affichées, l'heure n'est jamais
  arrondie vers le haut).
- Valeur absente ou invalide → la ligne n'est pas affichée (l'e-mail part comme aujourd'hui).

## 4. Cas particuliers à couvrir

| Cas | Comportement attendu |
|---|---|
| Premier « Converti » réussi | Ligne affichée avec la date enregistrée |
| Annulation + nouveau « Converti » | Aucun nouvel e-mail ; date inchangée |
| Réouverture admin + « Converti » | Idem |
| Confirmation à 23:59:59 UTC | Date du jour même ; délai de 7 jours à partir du lendemain |
| Confirmation à 00:00:00 UTC | Date du jour même |
| Fractions de seconde (microsecondes) | Ignorées, pas d'arrondi vers la minute suivante |
| `issuedAt` vide ou invalide | Ligne absente, e-mail inchangé par ailleurs |
| E-mail de test `/testemail actif` | L'exemple utilise aujourd'hui `new Date(0)` → afficherait « 1 January 1970, 00:00 UTC » : **remplacer par une date d'exemple réaliste** lors de l'implémentation (`src/lib/telegram/ops.ts`, données de test seulement) |
| Montant absent (prix introuvable) | Ligne de date affichée quand même |

## 5. Tests nécessaires (lors de l'implémentation)

1. Unitaires (`tests/unit/email.test.ts`) :
   - `renderEmail('request_confirmed', { invoice: { number, issuedAt: '2026-11-20T18:00:00Z' } })` contient
     « Payment confirmed on » et « 20 November 2026, 18:00 UTC » (HTML et texte brut) ;
   - `2026-11-20T23:59:59.999+00:00` → « 20 November 2026, 23:59 UTC » ;
   - `2026-11-20T18:00:00.730417+00:00` (microsecondes) → « 20 November 2026, 18:00 UTC » ;
   - `issuedAt` vide / invalide → pas de ligne, pas d'erreur ;
   - indépendance du fuseau du serveur (exécuter avec `TZ=America/Los_Angeles` et `TZ=Asia/Tokyo`) ;
   - les autres lignes et le sujet sont inchangés (instantané du rendu).
2. Unitaire de non-régression des déclencheurs : `sendConversionEmail` n'envoie qu'un e-mail quand `new: true`, aucun
   quand `new: false` (simulation de `ops_invoice`).
3. Test manuel : `/testemail actif` vers la boîte de l'équipe uniquement, après mise à jour de l'exemple.

## 6. Fichiers à modifier plus tard (sur autorisation)

| Fichier | Modification prévue |
|---|---|
| `src/lib/email/templates.ts` | Fonction de format UTC ; ligne « Payment confirmed on » dans `request_confirmed` (HTML + texte) |
| `src/lib/telegram/ops.ts` | **Uniquement** la date de l'exemple `/testemail` (`SAMPLE` → date réaliste) ; aucune logique de conversion modifiée |
| `tests/unit/email.test.ts` | Tests du §5 |

Aucun changement de base de données, de fonction SQL, de statut, de déclencheur, de destinataire ni de service d'envoi.
