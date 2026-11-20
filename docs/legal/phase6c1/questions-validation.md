# Phase 6C.1 — Décisions et questions pour validation juridique (20/11/2026)

Aucune réponse n'est supposée. Les propositions (`terms-proposal-en.md`, `refund-proposal-en.md`) utilisent les
identifiants ci-dessous comme emplacements à compléter.

## A. Décisions du propriétaire (avant passage chez le juriste)

| ID | Décision | Situation actuelle (constatée) | Options / précisions attendues |
|---|---|---|---|
| DECISION-01 | **Pays d'établissement de l'entreprise** et **droit applicable** | Mentions légales : Sygma TV LLC, Albuquerque, Nouveau-Mexique (États-Unis), EIN publié ; CGU : droit du Nouveau-Mexique + protection impérative du pays de résidence du consommateur | Confirmer ; préciser si d'autres entités vendent dans certains pays |
| DECISION-02 | **Marchés desservis** | FAQ en production : « The United States, Canada and Europe » ; configuration : marchés US/CA/EU `licensed: false` ; versions FR/BE/CH/CA/UK en Preview ; cible déclarée (M8) : FR, BE, CH, UK, CA, US, DE, ES, IT, NL | Liste des pays où l'on vend réellement ; règle si un client d'un autre pays commande |
| DECISION-03 | **Identité juridique du vendeur** par marché | Une seule entité publiée | Même entité partout ? Représentant UE/R-U nécessaire ? (juriste) |
| DECISION-04 | **Moment de formation du contrat** | CGU : « when we confirm your order » | Confirmation WhatsApp, activation ou confirmation du paiement |
| DECISION-05 | **Délai de paiement après activation** | Aucun | Nombre de jours |
| DECISION-06 | **Suspension en cas de non-paiement** | Aucune règle | Préavis, étapes (rappel WhatsApp/e-mail), rétablissement |
| DECISION-07 | **Début de la durée d'abonnement** (12/24/36 mois) | Non défini | Activation ou confirmation du paiement |
| DECISION-08 | **Taxes** : affichage et traitement | « USD, before taxes » ; fenêtre de commande « Taxes $0.00 USD » ; aucune règle fiscale configurée | Avis d'un conseil fiscal par pays (TVA UE/R-U, taxes de vente US, TPS/TVH Canada) |
| DECISION-09 | **Droits de distribution des contenus** | Non établis (marchés `licensed: false`) | Contrats / licences par pays et catégorie ; à défaut, formulation neutre (proposée) |
| DECISION-10 | **Âge minimum** pour commander | Non précisé | Âge (souvent 18 ans) |
| DECISION-11 | **Point de départ du remboursement commercial** | 7 jours après **activation** | A activation · **B paiement confirmé (recommandé)** · C le plus tardif des deux · D mixte |
| DECISION-12 | **Dysfonctionnement** | Aucun remède écrit | Délai de rétablissement (ex. 72 h) ; prolongation ou remboursement au prorata |
| DECISION-13 | **Remboursement au prorata après 7 jours** | Publié pour UE/R-U seulement | Garder, étendre à tous, ou remplacer par le calcul légal |
| DECISION-14 | **Méthodes et frais de remboursement** | « to the payment method you used » | Cas Western Union, MoneyGram, USDT (taux de change), virement ; qui paie les frais |
| DECISION-15 | **Liste des moyens de paiement** dans les CGU | Listés dans About/Help (M1) | Confirmer la liste et les frais éventuels |
| DECISION-16 | **Promotions** (« +30 days free ») | Conditions non publiées | Conditions, durée, date de fin |
| DECISION-17 | **Réclamations** | Aucune procédure | Délai d'accusé de réception et de réponse ; organisme de médiation éventuel |
| DECISION-18 | **Essai gratuit** | 24 h, « un par client » (aide) | Confirmer et inscrire dans les CGU |

## B. Questions pour le juriste

**Droit de rétractation et services numériques**
1. Pour les consommateurs UE et R-U : point de départ du délai de 14 jours lorsque le contrat est formé avant le
   paiement (DECISION-04).
2. Démarrage du service pendant le délai : forme et moment de la demande expresse et de la reconnaissance du
   consommateur ; possibilité de retenir un montant proportionnel à la période d'utilisation ; la proposition
   **n'affirme pas** que le droit disparaît à l'activation.
3. Formulaire de rétractation à fournir ; mentions d'information précontractuelle (sur le site et dans l'échange
   WhatsApp ?).
4. Application aux clients hors UE/R-U (États-Unis, Canada, Suisse…) : existe-t-il des droits équivalents à refléter ?

**Remboursement**
5. Validité de l'option B (7 jours après confirmation du paiement) et articulation avec les 14 jours légaux.
6. Remboursement sur un autre moyen que celui utilisé ; frais à la charge de qui ; crypto-monnaie (montant en USD ou
   en USDT ?).
7. Remèdes légaux en cas de non-conformité d'un service numérique (UE) et leur articulation avec la garantie
   commerciale.

**Paiement après activation**
8. Clauses de délai de paiement et de suspension (DECISION-05/06) : formulation, préavis, absence de pénalités abusives.
9. Conséquences d'un non-paiement sur le contrat (résolution, recouvrement).

**Formation du contrat, droit applicable, juridiction**
10. Moment de formation du contrat (DECISION-04) et preuve (WhatsApp, e-mail).
11. Clause de droit applicable (Nouveau-Mexique) face aux règles impératives des pays de résidence ; clause de
    juridiction.
12. Organismes de règlement des litiges à citer par marché ; obligations d'information spécifiques.

**Contenus et droits**
13. Formulation des CGU sur les contenus tant que les droits de distribution ne sont pas établis (DECISION-09) ;
    risques liés aux mentions publiées (sports, chaînes internationales).

**Taxes et facturation**
14. Affichage des prix (« before taxes » / « taxes included ») et obligations de facturation par pays (DECISION-08) ;
    cohérence avec la politique de confidentialité qui mentionne une « invoice ».

## C. Clauses marquées « ⚖ Legal review » dans les propositions

- CGU : 1.2, 2.2, 5.3, 6.1, 6.4, 10.3, 11.2, 12.3, 13, 14.3, 17.1.
- Remboursement : choix Partie A, 3.4, 4, 5.1 (formulaire), 6.2, 6.3.
