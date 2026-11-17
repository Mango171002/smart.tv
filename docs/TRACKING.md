# Tracking — architecture hybride (phase 1)

| Consentement | Outils | Chargement |
|---|---|---|
| Strictement nécessaire | choix des cookies (`localStorage.sygma_consent`, v2) | toujours |
| **Analytics** | GA4 `G-258WWPPN8Y` (gtag), Microsoft Clarity `ze1jvwh69q` | après consentement Analytics |
| **Marketing** | Google Tag Manager `GTM-MGCLXP5L` (plateformes publicitaires uniquement) | après consentement Marketing |

- Configuration centrale : `src/config/analytics.ts` (IDs publics, `gtmEnabled` = interrupteur général de GTM).
- Logique : `src/lib/analytics.ts` — `track()` envoie à GA4 (inchangé) **et**, pour les événements publicitaires, pousse un message GTM.
- Google Consent Mode : `analytics_storage` ← Analytics ; `ad_storage`, `ad_user_data`, `ad_personalization` ← Marketing (`default` avant la 1re balise Google, `update` ensuite).
- Retrait d'un consentement : cookies de la catégorie supprimés (`_ga*`, `_clck`, `_clsk` / `_gcl_*`, `_fbp`, `_fbc`, `_ttp`, `_uet*`) + rechargement de la page.

## Contrat dataLayer (pour la phase 2, dans GTM)

Chaque événement publicitaire est précédé d'un nettoyage, puis :

```js
dataLayer.push({ sygma: null, event_id: null });
dataLayer.push({
  event: 'sygma.generate_lead',          // nom propre à GTM : GA4 ne le lit pas (aucun doublon)
  event_id: '3f2b…-uuid',                // unique, pour dédoublonner avec les envois serveur (phase 3)
  sygma: { event_name: 'generate_lead', lead_type: 'order', currency: 'USD', value: 69, item_id: 'plus-12m-1' },
});
```

| `event` | Quand | Paramètres `sygma.*` |
|---|---|---|
| `sygma.view_item` | une carte de plan est visible (1 fois par plan et par page) | `currency`, `value`, `items[]` |
| `sygma.begin_checkout` | ouverture de la fenêtre de commande | `currency`, `value`, `items[]` |
| `sygma.generate_lead` | demande **enregistrée** par le serveur (commande ou essai) | `lead_type`, `currency`, `value`, `item_id` |
| `sygma.contact_whatsapp` | clic sur un lien WhatsApp | `link_type`, `placement` |
| `purchase` | **jamais depuis le navigateur** : envoyé par le serveur après « Converti » (phase 3) | — |

`items[]` : `item_id`, `item_name`, `item_category`, `item_variant`, `price`, `quantity` uniquement. Les paramètres passent par une liste blanche (`adPayload`) : aucune donnée personnelle (nom, e-mail, téléphone) ne peut y entrer.

### Mise en place dans GTM (phase 2, non commencée)
- Variables « Data Layer » : `event_id`, `sygma.value`, `sygma.currency`, `sygma.items`, `sygma.lead_type`, `sygma.item_id`.
- Déclencheurs « Événement personnalisé » : `sygma.view_item`, `sygma.begin_checkout`, `sygma.generate_lead`, `sygma.contact_whatsapp`.
- Chaque balise : « Paramètres de consentement → consentement supplémentaire requis : `ad_storage` ».
- **Aucune balise GA4 dans GTM.** Enhanced Conversions / Advanced Matching désactivés (pas de données personnelles).

## Google Consent Mode v2 et blocage publicitaire

| Choix | analytics_storage | ad_storage | ad_user_data | ad_personalization | Chargé | Requêtes pub |
|---|---|---|---|---|---|---|
| Aucun choix / Refus total | denied | denied | denied | denied | rien | aucune |
| Analytics uniquement | granted | denied | denied | denied | GA4 + Clarity | **bloquées par le navigateur** |
| Marketing uniquement | denied | granted | granted | granted | GTM | autorisées |
| Acceptation totale | granted | granted | granted | granted | GA4 + Clarity + GTM | autorisées |

- Défaut « denied » pour les quatre signaux dans le `<head>` de chaque page, puis `update` (fonction `googleConsentFor`, `src/lib/analytics.ts`).
- Sans Marketing, une CSP supplémentaire (`<meta id="sygma-no-ads-csp">`) n'autorise que les domaines Analytics pour le réseau et les images : la destination Google Ads liée au tag GA4 (AW-18577285546) ne peut plus envoyer ses pings « sans cookie » (`pagead2.googlesyndication.com/ccm/collect`).
- Retrait d'un consentement : `update` « denied », suppression des cookies, rechargement. Ajout du Marketing après coup : rechargement (le blocage ne peut pas être levé sur la page en cours).

## Retour arrière
- GTM : publier la version précédente (immédiat).
- Site : `gtmEnabled: false` puis déploiement, ou rollback Cloudflare vers la version précédente.
