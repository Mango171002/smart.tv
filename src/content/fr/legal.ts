/**
 * Pages légales en français (SEO international, phase 2 — 18/11/2026).
 *
 * Traduction fidèle des textes anglais (src/content/terms.ts et src/content/legal.ts) : aucun
 * engagement, garantie ou information juridique nouvelle. Seule adaptation : la devise des prix
 * (« la devise de votre pays » au lieu de « USD »), puisque chaque version affiche sa propre grille.
 * Les points à faire valider par un juriste sont listés dans docs/INTERNATIONAL.md.
 */
import { siteConfig } from '@/config/site';
import type { LegalDocument, LegalSection } from '@/content/legal';
import type { LegalDoc } from '@/lib/routes';

const UPDATED = '18 novembre 2026';
const EMAIL = siteConfig.supportEmail ?? 'notre adresse d’assistance';
const OPERATOR = siteConfig.legalEntity ?? 'la société identifiée dans nos mentions légales';

const TERMS: LegalSection[] = [
  {
    id: 'acceptance',
    icon: 'info',
    title: 'À propos des présentes conditions',
    body: [
      { p: 'Les présentes conditions encadrent l’utilisation du site sygmatv.com et du service de streaming SYGMA TV+. En utilisant le site ou en envoyant un formulaire, vous les acceptez. L’identité complète de l’exploitant figure dans nos mentions légales.' },
    ],
  },
  {
    id: 'ordering',
    icon: 'rocket',
    title: 'Comment se passe une commande',
    body: [
      { p: 'Les demandes d’essai sont gratuites et sans engagement. Lorsque vous commandez sur le site, rien n’y est débité : notre équipe vous contacte sur WhatsApp pour confirmer votre commande et le paiement, puis active votre accès. Le contrat commence lorsque nous confirmons votre commande.' },
    ],
  },
  {
    id: 'service',
    icon: 'tv',
    title: 'Le service',
    body: [
      { p: 'Des chaînes de TV en direct, du sport, des films et des séries sur les appareils compatibles. Les contenus dépendent des licences disponibles dans chaque pays et peuvent évoluer. La qualité d’image (de la HD à la 4K HDR) dépend de votre formule, du contenu, de votre appareil et de votre connexion internet.' },
    ],
  },
  {
    id: 'plans',
    icon: 'tag',
    title: 'Formules, prix et paiement',
    body: [
      { p: 'Formules Starter, Plus et Ultra+ pour 12, 24 ou 36 mois, avec 1 appareil inclus et jusqu’à 4. Les prix sont affichés dans la devise de votre pays ; le prix final, taxes comprises, est toujours indiqué avant le paiement. Le paiement se règle avec notre équipe lors de la confirmation de votre commande. Les promotions comme « +30 jours offerts » s’appliquent dans les conditions indiquées au moment de l’achat.' },
    ],
  },
  {
    id: 'cancellation',
    icon: 'refund',
    title: 'Renouvellement, résiliation et remboursement',
    body: [
      { p: 'Un abonnement ne se renouvelle que si vous choisissez de le renouveler. Vous pouvez tester le service gratuitement avant d’acheter, et vous êtes remboursé intégralement si vous le demandez dans les 7 jours suivant l’activation (« Satisfait ou remboursé »). Les consommateurs de l’Union européenne et du Royaume-Uni disposent en outre d’un droit de rétractation de 14 jours. Les détails figurent dans notre page Remboursement et résiliation ; vos droits légaux de consommateur s’appliquent toujours.' },
    ],
  },
  {
    id: 'use',
    icon: 'ban',
    title: 'Utilisation loyale et licite',
    body: [
      { p: 'Votre abonnement est destiné à un usage personnel au sein de votre foyer, sur le nombre d’appareils prévu par votre formule. Il est interdit de partager ou de revendre votre accès, d’enregistrer ou de rediffuser les contenus, et de contourner les mesures de sécurité. Un manquement grave peut entraîner la suspension de votre compte.' },
    ],
  },
  {
    id: 'liability',
    icon: 'scale',
    title: 'Responsabilité et modifications',
    body: [
      { p: 'Nous faisons le nécessaire pour que le service reste disponible, mais nous ne pouvons pas garantir un accès sans interruption. Nous ne sommes pas responsables des problèmes causés par votre connexion ou votre équipement. Rien ne limite la responsabilité que la loi ne nous permet pas de limiter. Nous pouvons mettre à jour ces conditions et informerons les abonnés des changements importants par e-mail.' },
    ],
  },
  {
    id: 'law',
    icon: 'gavel',
    title: 'Données personnelles et droit applicable',
    body: [
      { p: 'Vos données personnelles sont traitées comme décrit dans notre politique de confidentialité. Les présentes conditions sont régies par le droit de l’État du Nouveau-Mexique (États-Unis) ; en tant que consommateur, vous conservez la protection des règles impératives de votre pays de résidence et pouvez saisir ses tribunaux.' },
    ],
  },
];

const PRIVACY: LegalSection[] = [
  {
    id: 'controller',
    icon: 'building',
    title: 'Qui sommes-nous',
    body: [
      { p: `${OPERATOR} exploite SYGMA TV+ et est responsable du traitement de vos données (coordonnées dans nos mentions légales). Pour toute question : ${EMAIL}.` },
    ],
  },
  {
    id: 'data',
    icon: 'database',
    title: 'Ce que nous collectons',
    body: [
      { list: [
        'Les informations que vous nous donnez : nom, e-mail, numéro de téléphone ou WhatsApp, pays, appareil, formule choisie et votre message.',
        'Votre commande : formule, prix, référence de commande et facture. Nous ne conservons jamais vos coordonnées bancaires.',
        'Des cookies, uniquement si vous les acceptez (voir notre politique cookies).',
      ] },
    ],
  },
  {
    id: 'purposes',
    icon: 'check',
    title: 'Pourquoi nous les utilisons',
    body: [
      { list: [
        'Pour répondre à votre demande et mettre en place votre essai gratuit.',
        'Pour fournir votre abonnement, l’assistance et votre facture.',
        'Pour vous envoyer nos actualités et nos offres, uniquement si vous l’avez accepté.',
        'Pour améliorer le site, uniquement si vous avez accepté les cookies de mesure d’audience.',
      ] },
      { p: 'Nous ne vendons jamais vos données.' },
    ],
  },
  {
    id: 'sharing',
    icon: 'lock',
    title: 'Comment nous les protégeons',
    body: [
      { p: 'Seuls notre équipe et des prestataires de confiance qui nous aident à faire fonctionner le service peuvent accéder à vos données, uniquement dans ce but et dans un cadre contractuel. Certains peuvent se trouver hors de votre pays ; ces transferts sont encadrés par des garanties appropriées. Nous ne communiquons des données aux autorités que lorsque la loi l’exige.' },
    ],
  },
  {
    id: 'retention',
    icon: 'clock',
    title: 'Combien de temps nous les conservons',
    body: [
      { p: 'Demandes qui ne débouchent pas sur un abonnement : 12 mois au maximum. Clients : pendant l’abonnement, puis 12 mois. Factures : aussi longtemps que la loi l’exige.' },
    ],
  },
  {
    id: 'rights',
    icon: 'user',
    title: 'Vos droits',
    body: [
      { p: `Vous pouvez accéder à vos données, les rectifier ou les supprimer, vous opposer à leur utilisation et retirer votre consentement à tout moment. Écrivez-nous à ${EMAIL} ; nous répondons dans un délai d’un mois. Vous pouvez aussi contacter l’autorité de protection des données de votre pays. Notre service est réservé aux adultes.` },
    ],
  },
];

const COOKIES: LegalSection[] = [
  {
    id: 'principle',
    icon: 'cookie',
    title: 'Votre choix',
    body: [
      { p: 'Les cookies facultatifs ne sont déposés que si vous les acceptez dans le bandeau cookies. Si vous les refusez, le site fonctionne de la même façon.' },
    ],
  },
  {
    id: 'list',
    icon: 'activity',
    title: 'Les cookies que nous utilisons',
    body: [
      { table: {
        head: ['Cookie', 'Finalité', 'Durée'],
        rows: [
          ['sygma_consent', 'Mémorise votre choix de cookies', 'Jusqu’à ce que vous le modifiiez'],
          ['_ga, _ga_*', 'Mesure d’audience (Google Analytics) — avec votre accord', '2 ans'],
          ['_clck, _clsk', 'Analyse de l’utilisation (Microsoft Clarity) — avec votre accord', '1 an / 1 jour'],
        ],
      } },
      { p: 'Aucun cookie publicitaire n’est utilisé pour le moment.' },
    ],
  },
  {
    id: 'control',
    icon: 'pencil',
    title: 'Modifier votre choix',
    body: [
      { p: 'Cliquez sur « Paramètres des cookies » en bas de n’importe quelle page. Vous pouvez aussi supprimer les cookies dans votre navigateur.' },
    ],
  },
];

const REFUNDS: LegalSection[] = [
  {
    id: 'trial',
    icon: 'rocket',
    title: 'D’abord un essai gratuit',
    body: [
      { p: `Testez gratuitement le service (${siteConfig.trialDuration === '24 hours' ? '24 heures' : 'essai court'}) sur votre propre appareil avant d’acheter. Rien à résilier.` },
    ],
  },
  {
    id: 'guarantee',
    icon: 'refund',
    title: 'Satisfait ou remboursé — 7 jours',
    body: [
      { p: 'Pas satisfait ? Faites-en la demande dans les 7 jours suivant l’activation et nous vous remboursons à 100 %, sans justification. Un remboursement par client ; non applicable aux comptes suspendus pour partage ou revente de l’accès.' },
    ],
  },
  {
    id: 'withdrawal',
    icon: 'scale',
    title: 'Clients de l’Union européenne et du Royaume-Uni',
    body: [
      { p: 'Vous disposez aussi de 14 jours pour vous rétracter. Après les 7 premiers jours, nous remboursons la partie non utilisée de votre abonnement.' },
    ],
  },
  {
    id: 'how',
    icon: 'mail',
    title: 'Comment faire la demande',
    body: [
      { p: `Envoyez votre référence de commande à ${EMAIL} ou sur WhatsApp. Vous êtes remboursé sous 14 jours, sur le moyen de paiement utilisé.` },
    ],
  },
  {
    id: 'after',
    icon: 'pause',
    title: 'Au-delà de ces délais',
    body: [
      { p: 'Les abonnements ne sont plus remboursables après ces délais, sauf si la loi l’impose. Ils ne se renouvellent jamais automatiquement.' },
    ],
  },
];

const IMPRINT: LegalSection[] = [
  {
    id: 'publisher',
    icon: 'building',
    title: 'Éditeur du site',
    body: [
      { facts: [
        ['Société', siteConfig.legalEntity],
        ['Adresse du siège', siteConfig.legalAddress],
        ['Immatriculée', siteConfig.legalCountry === 'United States (New Mexico)' ? 'États-Unis (Nouveau-Mexique)' : siteConfig.legalCountry],
        ['EIN (numéro fiscal fédéral américain)', siteConfig.companyNumber],
        ['E-mail', siteConfig.supportEmail],
        ['Téléphone / WhatsApp', siteConfig.supportPhone],
      ] },
    ],
  },
  {
    id: 'ip',
    icon: 'copyright',
    title: 'Propriété intellectuelle',
    body: [
      { p: 'Le nom SYGMA TV+, son logo et les contenus du site ne peuvent pas être reproduits sans notre autorisation écrite.' },
    ],
  },
];

export const FR_LEGAL_DOCUMENTS: Record<LegalDoc, LegalDocument> = {
  terms: { updated: UPDATED, sections: TERMS, contactIntro: 'Une question ? Notre équipe est là pour vous aider.' },
  privacy: { updated: UPDATED, sections: PRIVACY, contactIntro: 'Une question sur vos données ? Écrivez-nous.' },
  cookies: { updated: UPDATED, sections: COOKIES, contactIntro: 'Une question sur les cookies ? Écrivez-nous.' },
  refunds: { updated: UPDATED, sections: REFUNDS, contactIntro: 'Besoin d’un remboursement ? Contactez-nous avec votre référence de commande.' },
  imprint: { updated: UPDATED, sections: IMPRINT, contactIntro: 'Contacter l’éditeur :' },
};
