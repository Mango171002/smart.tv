/**
 * « À propos » + Centre d'aide en français (phase 7B — PREVIEW ONLY, not published).
 *
 * Faithful translation of src/content/en/info.ts (owner-validated facts, 20/11/2026): same facts, same order of
 * the ordering flow (commande → contact WhatsApp → activation → paiement → confirmation du paiement), same
 * « usually » wording for times (jamais une garantie contractuelle). No claim added. Language level: no
 * country-specific wording for France, Canada, Switzerland or Luxembourg.
 * Links: French pages under /fr (same English slugs); legal documents stay in English (/legal/*).
 * To be reviewed by a native speaker before publication (docs/seo/phase7/lot-7b-french.md).
 */
import { siteConfig } from '@/config/site';
import type { InfoPage, InfoUi } from '@/content/en/info';

export const INFO_REVIEWED_FR = '20 novembre 2026';

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';
/** « 24 hours » → « 24 heures ». */
const TRIAL = (siteConfig.trialDuration ?? '24 hours').replace(/^(\d+) hours?$/, (_, n: string) => (n === '1' ? '1 heure' : `${n} heures`));
/** « 24 heures » → « 24 h » (« un essai gratuit de 24 h »). */
const TRIAL_SHORT = TRIAL.replace(/ heures?$/, '\u00a0h');

const N = '\u00a0';

export const OWNER_FACTS_FR = {
  established: '2026',
  basedIn: 'États-Unis',
  supportHours: '24/7',
  usualReply: 'moins d’une heure',
  usualActivation: 'dans l’heure qui suit la confirmation de votre commande sur WhatsApp',
  languages: ['Anglais', 'Français', 'Arabe', 'Allemand', 'Espagnol', 'Italien'],
  paymentMethods: ['Carte Visa / Mastercard', 'PayPal', 'Cryptomonnaie (USDT via Binance)', 'Virement bancaire', 'Western Union', 'MoneyGram'],
} as const;

const F = OWNER_FACTS_FR;

const ORDER_STEPS = [
  { title: 'Choisissez votre formule', text: 'Sélectionnez la formule, la durée et le nombre d’appareils sur notre site. Le prix s’affiche immédiatement.' },
  { title: 'Envoyez votre commande', text: 'Remplissez le court formulaire de commande : votre e-mail, votre pays et votre numéro WhatsApp. Rien n’est débité sur ce site. Vous recevez un e-mail confirmant la réception de votre commande.' },
  { title: 'Nous vous contactons sur WhatsApp', text: 'Un membre de notre équipe vous contacte sur WhatsApp pour confirmer votre commande.' },
  { title: 'Nous activons votre abonnement', text: `Nous vous envoyons vos identifiants et les instructions d’installation sur WhatsApp. L’activation a généralement lieu ${F.usualActivation}.` },
  { title: 'Vous payez', text: 'Une fois votre accès activé, vous payez avec l’un des moyens de paiement proposés par notre équipe.' },
  { title: 'Paiement confirmé', text: 'Lorsque nous avons reçu et confirmé votre paiement, vous recevez un e-mail confirmant que votre abonnement est actif, avec votre numéro de commande.' },
];
const CONFIRMATION_EMAIL = 'Lorsque nous avons reçu et confirmé votre paiement, vous recevez un e-mail confirmant que votre abonnement est actif, avec votre numéro de commande et le détail de votre abonnement.';
const LANGS = `${F.languages.slice(0, -1).map((l) => l.toLowerCase()).join(', ')} ou ${F.languages[F.languages.length - 1]!.toLowerCase()}`;

// ---------------------------------------------------------------- À propos
export const ABOUT_FR: InfoPage = {
  slug: 'about',
  name: 'À propos',
  title: 'À propos de SYGMA TV+',
  metaTitle: 'À propos : société, assistance et engagements',
  description: 'SYGMA TV+ est une marque de divertissement numérique de Sygma TV LLC, créée aux États-Unis en 2026. Fonctionnement, engagements et assistance.',
  intro: `SYGMA TV+ est une marque internationale de divertissement numérique, créée aux ${F.basedIn} en ${F.established}. Nous proposons des abonnements streaming pour votre TV, votre mobile et votre ordinateur, avec une assistance client ${F.supportHours} en six langues.`,
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Qui sommes-nous',
      body: [
        { p: `SYGMA TV+ — «${N}One World. Endless Entertainment.${N}» — est une marque de ${siteConfig.legalEntity}, société créée en ${F.established} et immatriculée dans l’État du Nouveau-Mexique, aux États-Unis.` },
        { p: 'Les formules sont annuelles (12, 24 ou 36 mois) : 1 appareil inclus, jusqu’à 4 au choix. Avant d’acheter, vous pouvez tester le service sur votre propre appareil grâce à un essai gratuit.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Informations sur la société',
      body: [
        { facts: [
          ['Société', siteConfig.legalEntity],
          ['Création', F.established],
          ['Siège social', siteConfig.legalAddress],
          ['Immatriculation', 'États-Unis (Nouveau-Mexique)'],
          ['EIN', siteConfig.companyNumber],
          ['E-mail', siteConfig.supportEmail],
          ['Téléphone / WhatsApp', siteConfig.supportPhone],
        ] },
      ],
    },
    {
      id: 'how', icon: 'rocket', title: 'Comment fonctionne le service',
      body: [
        { p: 'Vous commandez avec un court formulaire, puis une vraie personne de notre équipe prend le relais sur WhatsApp. Nous activons d’abord votre abonnement : vous ne payez qu’une fois votre accès activé.' },
        { steps: ORDER_STEPS },
        { p: `Vous hésitez encore${N}? Demandez d’abord un essai gratuit de ${TRIAL_SHORT} : rien à payer, rien à résilier.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'Nos engagements',
      body: [
        { list: [
          'Des prix clairs : le prix est affiché sur notre site avant votre commande, et vous ne payez qu’après l’activation de votre abonnement.',
          'Aucun renouvellement automatique : c’est vous qui décidez de renouveler.',
          'Satisfait ou remboursé pendant 7 jours après l’activation ; les clients de l’UE et du Royaume-Uni conservent en outre leur droit de rétractation de 14 jours.',
          'Vos données servent uniquement à traiter votre demande et votre abonnement. Nous ne les vendons jamais.',
          'Aucun faux avis.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'users', title: 'Une assistance multilingue',
      body: [
        { p: `Notre assistant automatisé est disponible ${F.supportHours}, avec une assistance humaine si nécessaire. Nous répondons généralement en ${F.usualReply}. Il s’agit de notre délai de réponse habituel, et non d’une garantie contractuelle.` },
        { chips: [...F.languages], label: 'Langues de l’assistance' },
        { note: 'Notre équipe d’assistance parle ces six langues ; nos documents juridiques sont rédigés en anglais.' },
      ],
    },
    {
      id: 'payment', icon: 'card', title: 'Activation, paiement et confirmation',
      body: [
        { p: `Rien n’est débité sur ce site. Nous activons d’abord votre abonnement — généralement ${F.usualActivation} — et vous payez une fois votre accès activé, avec l’un de ces moyens :` },
        { chips: [...F.paymentMethods], label: 'Moyens de paiement' },
        { note: 'Chaque paiement est organisé manuellement avec notre équipe sur WhatsApp — aucun n’est débité automatiquement sur ce site. Notre équipe vous indique les moyens disponibles pour votre commande.' },
        { p: CONFIRMATION_EMAIL },
      ],
    },
    {
      id: 'links', icon: 'info', title: 'Liens utiles',
      body: [
        { links: [
          { href: '/fr/help', label: 'Centre d’aide', text: 'Essai, commande, appareils, remboursements' },
          { href: '/fr/help/contact-support', label: 'Contacter l’assistance', text: `E-mail ou WhatsApp, ${F.supportHours}` },
          { href: '/fr#plans', label: 'Formules', text: 'Choisissez votre formule et découvrez son prix' },
          { href: '/legal/refunds', label: 'Remboursements et annulations', text: 'Satisfait ou remboursé 7 jours (en anglais)' },
          { href: '/legal/terms', label: 'Conditions d’utilisation', text: 'Les règles, en langage clair (en anglais)' },
          { href: '/legal/imprint', label: 'Mentions légales', text: 'Informations sur la société (en anglais)' },
        ] },
      ],
    },
  ],
  prelaunch: {
    sections: {
      how: { body: [
        { p: 'Vous commandez avec un court formulaire, puis une vraie personne de notre équipe prend le relais sur WhatsApp. Nous activons d’abord votre abonnement : vous ne payez qu’une fois votre accès activé.' },
        { steps: ORDER_STEPS },
        { p: `Les essais gratuits ouvriront bientôt${N}: vous pourrez tester le service pendant ${TRIAL} avant d’acheter.` },
      ] },
    },
  },
};

// ---------------------------------------------------------------- Centre d'aide
export const HELP_HUB_FR = {
  name: 'Centre d’aide',
  title: 'Centre d’aide',
  metaTitle: 'Centre d’aide : essai, commande, remboursement',
  description: 'Réponses sur l’essai gratuit SYGMA TV+, la commande et le paiement, les appareils compatibles, le dépannage, les remboursements et l’assistance.',
  intro: `Des réponses claires sur l’essai gratuit, la commande, le paiement, les appareils et les remboursements. Besoin d’aide supplémentaire${N}? Notre assistant automatisé est disponible ${F.supportHours}, avec une assistance humaine si nécessaire.`,
  popular: [
    { q: 'Quand et comment payer ?', href: '/fr/help/ordering-payment#pay' },
    { q: 'Combien de temps prend l’activation ?', href: '/fr/help/ordering-payment#activation' },
    { q: 'L’essai est-il vraiment gratuit ?', href: '/fr/help/free-trial#cost' },
    { q: 'Quels appareils puis-je utiliser ?', href: '/fr/help/devices#categories' },
    { q: 'En combien de temps l’assistance répond-elle ?', href: '/fr/help/contact-support#availability' },
    { q: 'Comment être remboursé ?', href: '/fr/help/refunds#how' },
  ],
};

export const HELP_TOPICS_FR: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Bien démarrer', icon: 'rocket',
    title: 'Bien démarrer avec SYGMA TV+',
    metaTitle: 'Bien démarrer avec SYGMA TV+',
    description: 'Le fonctionnement de SYGMA TV+, du choix de la formule au visionnage : essai gratuit, commande, contact et activation sur WhatsApp, puis paiement.',
    summary: 'Du choix de la formule à votre premier visionnage.',
    intro: 'Quelques étapes suffisent pour démarrer. Vous pouvez commencer par un essai gratuit ou commander directement.',
    prelaunch: { intro: 'Les commandes en ligne et les essais gratuits ouvriront bientôt. Voici comment se passera votre démarrage.' },
    sections: [
      { id: 'steps', icon: 'rocket', title: 'Les étapes', body: [{ steps: [
        { title: 'Choisissez votre formule', text: 'Dans la section Formules, choisissez la formule, la durée (12, 24 ou 36 mois) et le nombre d’appareils.' },
        { title: 'Essai ou commande', text: 'Demandez un essai gratuit, ou envoyez votre commande avec le court formulaire : votre adresse e-mail, votre pays et votre numéro WhatsApp.' },
        { title: 'Nous vous contactons sur WhatsApp', text: 'Notre équipe vous contacte sur WhatsApp, vous envoie vos identifiants et vous indique l’application à installer.' },
        { title: 'Activation, puis paiement', text: `Pour une commande, nous activons d’abord votre abonnement — généralement ${F.usualActivation}. Vous payez une fois votre accès activé.` },
        { title: 'Regardez', text: 'Installez l’application, saisissez vos identifiants et lancez un programme.' },
      ] }] },
      { id: 'good-to-know', icon: 'info', title: 'Bon à savoir', body: [{ list: [
        'Rien n’est débité sur ce site.',
        'Vous payez après l’activation de votre abonnement, avec un moyen de paiement proposé par notre équipe.',
        'Un seul essai gratuit par client.',
        'Chaque formule inclut 1 appareil ; vous pouvez en ajouter, jusqu’à 4.',
        'Les formules ne se renouvellent jamais automatiquement.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Appareils compatibles', icon: 'devices',
    title: 'Appareils compatibles',
    metaTitle: 'Appareils compatibles : TV, boîtiers, mobile',
    description: 'SYGMA TV+ s’utilise sur Smart TV, boîtiers et clés de streaming, smartphones, tablettes et ordinateurs. Nombre d’appareils et comment vérifier le vôtre.',
    summary: 'TV, boîtiers de streaming, mobile et ordinateur.',
    intro: 'SYGMA TV+ s’utilise sur les TV, les boîtiers de streaming, les mobiles et les ordinateurs. L’essai gratuit vous permet de vérifier votre appareil et votre connexion avant d’acheter.',
    sections: [
      { id: 'categories', icon: 'devices', title: 'Quels appareils ?', body: [{ list: [
        'Les Smart TV.',
        'Les boîtiers et clés de streaming.',
        'Les smartphones et tablettes.',
        'Les ordinateurs.',
      ] }, { p: 'Avec vos identifiants, notre équipe vous indique l’application à installer sur votre appareil et vous aide à la configurer.' }] },
      { id: 'how-many', icon: 'users', title: 'Combien d’appareils en même temps ?', body: [{ p: 'Chaque formule inclut 1 appareil. Vous pouvez en ajouter lors de la commande, jusqu’à 4. L’abonnement est réservé à un usage personnel au sein de votre foyer : le partage ou la revente de l’accès ne sont pas autorisés.' }] },
      { id: 'quality', icon: 'activity', title: 'Qualité d’image', body: [{ p: 'La qualité d’image dépend de votre formule, du contenu, de votre appareil et de votre connexion internet. Une connexion stable — idéalement un câble réseau, ou un appareil proche de votre box Wi-Fi — fait toute la différence.' }] },
      { id: 'check', icon: 'check', title: 'Vérifiez d’abord votre appareil', body: [{ p: `Demandez un essai gratuit de ${TRIAL_SHORT} : vous testez le service sur votre propre appareil et votre connexion avant d’acheter.` }] },
    ],
  },
  {
    slug: 'free-trial', name: 'Essai gratuit', icon: 'calendar',
    title: 'L’essai gratuit',
    metaTitle: 'Essai gratuit : comment tester SYGMA TV+',
    description: `Testez SYGMA TV+ gratuitement pendant ${TRIAL} sur votre appareil avant d’acheter. Comment demander l’essai et la suite — rien à payer, rien à résilier.`,
    summary: `${TRIAL[0]!.toUpperCase()}${TRIAL.slice(1)}, gratuit, rien à résilier.`,
    intro: `L’essai gratuit vous permet de tester SYGMA TV+ pendant ${TRIAL} sur votre propre appareil et votre connexion, avant de vous décider.`,
    prelaunch: { sections: { request: { body: [{ p: 'Les demandes d’essai gratuit ouvriront bientôt. D’ici là, aucun essai ne peut être obtenu par e-mail ni par un autre moyen.' }] } } },
    sections: [
      { id: 'request', icon: 'rocket', title: 'Comment le demander ?', body: [{ steps: [
        { title: 'Ouvrez le formulaire', text: `Sélectionnez «${N}Essai gratuit${N}» en haut de n’importe quelle page.` },
        { title: 'Laissez vos coordonnées', text: 'Indiquez votre nom complet, votre adresse e-mail et votre numéro de téléphone avec l’indicatif du pays, puis acceptez d’être contacté.' },
        { title: 'Recevez votre accès', text: 'Notre équipe vous contacte sur WhatsApp avec vos identifiants et l’application à installer.' },
      ] }] },
      { id: 'cost', icon: 'tag', title: 'Est-il vraiment gratuit ?', body: [{ p: 'Oui. Une demande d’essai est gratuite et n’engage à rien. L’essai prend fin de lui-même : il n’y a rien à résilier. Un seul essai gratuit par client.' }] },
      { id: 'check', icon: 'check', title: 'Que vérifier pendant l’essai ?', body: [{ list: [
        'Que l’application fonctionne sur votre appareil.',
        'Que l’image est fluide avec votre connexion internet.',
        'Le nombre d’appareils dont vous aurez besoin.',
        'Comment nous joindre si l’installation ne fonctionne pas.',
      ] }] },
    ],
  },
  {
    slug: 'ordering-payment', name: 'Commande et paiement', icon: 'card',
    title: 'Commande et paiement',
    metaTitle: 'Commande et paiement : comment ça marche',
    description: 'Commander SYGMA TV+ : envoyez le formulaire, notre équipe vous contacte sur WhatsApp et active votre accès, puis vous payez. Moyens de paiement détaillés.',
    summary: 'Formulaire de commande, activation, puis paiement.',
    intro: 'Vous commandez avec un court formulaire. Notre équipe vous contacte sur WhatsApp et active votre accès, et vous payez après l’activation. Rien n’est débité sur ce site.',
    prelaunch: { sections: { order: { title: 'Comment se passera la commande', body: [
      { p: 'Les commandes en ligne ouvriront bientôt. Vous pouvez déjà comparer les formules, les durées et les prix dans la section Formules.' },
      { steps: ORDER_STEPS },
    ] } } },
    sections: [
      { id: 'order', icon: 'rocket', title: 'Comment commander ?', body: [
        { p: `La commande se fait en six étapes, du formulaire sur notre site à la confirmation de votre paiement. Sélectionnez «${N}Commander${N}» dans la section Formules pour commencer.` },
        { steps: ORDER_STEPS },
      ] },
      { id: 'pay', icon: 'card', title: 'Quand et comment payer ?', body: [
        { p: 'Vous payez après l’activation de votre accès — jamais sur ce site. Aucun paiement ni aucune coordonnée bancaire ne vous sont demandés ici : notre équipe vous envoie les options de paiement sur WhatsApp. Moyens acceptés :' },
        { chips: [...F.paymentMethods], label: 'Moyens de paiement' },
        { note: 'Tous les paiements sont organisés manuellement avec notre équipe ; aucun n’est débité automatiquement sur ce site. Notre équipe vous indique les moyens disponibles pour votre commande.' },
      ] },
      { id: 'activation', icon: 'clock', title: 'Combien de temps prend l’activation ?', body: [{ p: `Notre équipe active généralement votre accès ${F.usualActivation} — un délai habituel, non garanti. Vous payez une fois votre accès activé.` }] },
      { id: 'emails', icon: 'mail', title: 'Quels e-mails vais-je recevoir ?', body: [{ list: [
        'Juste après l’envoi du formulaire : un e-mail confirmant la réception de votre commande.',
        CONFIRMATION_EMAIL,
      ] }] },
      { id: 'prices', icon: 'tag', title: 'Prix et taxes', body: [{ p: 'Les prix sont indiqués en dollars américains (USD), hors taxes, et le prix de votre formule est affiché avant l’envoi de votre commande. Plus la durée est longue, moins le prix annuel est élevé : consultez les prix actuels dans la section Formules.' }] },
      { id: 'contract', icon: 'scale', title: 'Quand mon abonnement commence-t-il ?', body: [{ p: 'Le contrat commence lorsque notre équipe confirme votre commande. Les formules ne se renouvellent jamais automatiquement.' }] },
    ],
  },
  {
    slug: 'troubleshooting', name: 'Dépannage', icon: 'activity',
    title: 'Dépannage',
    metaTitle: 'Dépannage : lecture, identifiants, application',
    description: 'Résoudre les problèmes courants sur SYGMA TV+ : image saccadée, identifiants refusés, application introuvable ou qui se ferme, lecture en données mobiles.',
    summary: 'Image, identifiants et application.',
    intro: 'La plupart des problèmes viennent de la connexion ou d’une faute de frappe dans les identifiants. Essayez d’abord ces étapes.',
    sections: [
      { id: 'stutter', icon: 'activity', title: 'L’image saccade ou se fige', body: [{ p: 'Redémarrez votre box internet et votre appareil. Utilisez un câble réseau si possible, ou rapprochez l’appareil de votre box Wi-Fi, puis réessayez.' }] },
      { id: 'login', icon: 'lock', title: 'Mes identifiants sont refusés', body: [{ p: 'Vérifiez les espaces et les majuscules/minuscules, ou copiez-collez les identifiants depuis notre message WhatsApp. Si cela ne fonctionne toujours pas, envoyez-nous une photo de l’écran d’erreur.' }] },
      { id: 'store', icon: 'tv', title: 'Je ne trouve pas l’application dans la boutique d’applications', body: [{ p: 'Les boutiques d’applications dépendent du modèle de l’appareil et du pays. Envoyez-nous la marque, le modèle et l’année de votre appareil : nous vous dirons ce qui fonctionne.' }] },
      { id: 'crash', icon: 'pause', title: 'L’application se ferme toute seule', body: [{ p: 'Redémarrez l’appareil, installez les mises à jour disponibles du système et de l’application, puis réessayez.' }] },
      { id: 'mobile', icon: 'devices', title: 'La lecture s’arrête en données mobiles', body: [{ p: 'La qualité dépend de votre réseau mobile et de votre forfait. Passez en Wi-Fi si possible.' }] },
      { id: 'still', icon: 'mail', title: 'Toujours un problème ?', body: [{ p: `Contactez-nous ${F.supportHours} avec le modèle de votre appareil et une photo du message d’erreur : nous répondons généralement en ${F.usualReply}.` }] },
    ],
  },
  {
    slug: 'contact-support', name: 'Contacter l’assistance', icon: 'mail',
    title: 'Contacter notre équipe d’assistance',
    metaTitle: 'Assistance : e-mail et WhatsApp, 24/7',
    description: `Contactez l’assistance SYGMA TV+ ${F.supportHours} par e-mail, WhatsApp ou formulaire, en six langues. Ce qu’il faut indiquer pour une réponse plus rapide.`,
    summary: `${F.supportHours}, e-mail ou WhatsApp, six langues.`,
    intro: `Contactez-nous par e-mail ou sur WhatsApp. Notre assistant automatisé est disponible ${F.supportHours}, avec une assistance humaine si nécessaire.`,
    prelaunch: {
      description: `Contactez l’assistance SYGMA TV+ ${F.supportHours} par e-mail ou WhatsApp, en six langues. Ce qu’il faut indiquer pour une réponse plus rapide.`,
      sections: { reach: { body: [{ list: [`E-mail : ${EMAIL}.`, `WhatsApp ou téléphone : ${PHONE}.`] }] } },
    },
    sections: [
      { id: 'reach', icon: 'mail', title: 'Comment nous joindre', body: [{ list: [
        `E-mail : ${EMAIL}.`,
        `WhatsApp ou téléphone : ${PHONE}.`,
        `Le formulaire de contact : sélectionnez «${N}Contact${N}» en bas de n’importe quelle page.`,
      ] }] },
      { id: 'availability', icon: 'clock', title: 'Quand répondez-vous ?', body: [{ p: `Notre assistant automatisé est disponible ${F.supportHours}, avec une assistance humaine si nécessaire. Nous répondons généralement en ${F.usualReply}. Il s’agit de notre délai de réponse habituel, et non d’une garantie contractuelle.` }] },
      { id: 'languages', icon: 'globe', title: 'Dans quelles langues ?', body: [
        { p: `Vous pouvez nous écrire en ${LANGS}.` },
        { chips: [...F.languages], label: 'Langues de l’assistance' },
        { note: 'Nos documents juridiques sont rédigés en anglais.' },
      ] },
      { id: 'include', icon: 'pencil', title: 'Ce qu’il faut indiquer', body: [{ list: [
        'Votre référence de commande, si vous en avez une.',
        'Votre appareil, sa marque et son modèle.',
        'Ce que vous faisiez quand le problème est apparu, et une photo du message d’erreur.',
      ] }] },
    ],
  },
  {
    slug: 'refunds', name: 'Remboursements', icon: 'refund',
    title: 'Remboursements et annulations',
    metaTitle: 'Remboursements : 7 jours et rétractation',
    description: 'Remboursements SYGMA TV+ : essai gratuit d’abord, 100 % remboursé sous 7 jours après activation, rétractation de 14 jours (UE et Royaume-Uni).',
    summary: 'Satisfait ou remboursé 7 jours : la marche à suivre.',
    intro: 'Essayez d’abord, puis faites-vous rembourser intégralement si vous n’êtes pas satisfait dans les 7 jours suivant l’activation. La politique complète figure sur notre page Remboursements (en anglais).',
    sections: [
      { id: 'guarantee', icon: 'refund', title: 'Satisfait ou remboursé 7 jours', body: [{ p: 'Pas satisfait ? Faites votre demande dans les 7 jours suivant l’activation et nous vous remboursons à 100 %, sans justification. Un seul remboursement par client ; non disponible pour les comptes suspendus pour partage ou revente de l’accès.' }] },
      { id: 'withdrawal', icon: 'scale', title: 'Clients de l’UE et du Royaume-Uni', body: [{ p: 'Vous disposez en outre de 14 jours pour vous rétracter. Après les 7 premiers jours, nous remboursons la partie non utilisée de votre abonnement.' }] },
      { id: 'how', icon: 'mail', title: 'Comment demander un remboursement', body: [{ p: `Envoyez votre référence de commande à ${EMAIL} ou sur WhatsApp. Vous êtes remboursé sous 14 jours, sur le moyen de paiement utilisé.` }] },
      { id: 'after', icon: 'pause', title: 'Après ces délais', body: [{ p: 'Les abonnements ne sont pas remboursables après ces délais, sauf si la loi l’exige. Ils ne se renouvellent jamais automatiquement.' }] },
    ],
  },
];

/** Interface labels of the About / Help pages. */
export const INFO_UI_FR: InfoUi = {
  home: 'Accueil',
  breadcrumb: 'Fil d’Ariane',
  support: 'Assistance',
  popular: 'Questions fréquentes',
  topics: 'Sujets d’aide',
  glance: 'L’assistance en un coup d’œil',
  helpFacts: [
    { k: 'Disponibilité', v: F.supportHours, small: 'E-mail et WhatsApp' },
    { k: 'Délai de réponse habituel', v: 'Moins d’une heure', small: 'Délai habituel, non garanti' },
    { k: 'Langues', v: String(F.languages.length), small: F.languages.join(' · ') },
    { k: 'Activation', v: 'Généralement < 1 h', small: 'Avant le paiement, après confirmation de votre commande' },
  ],
  aboutFacts: [
    { k: 'Création', v: F.established, small: F.basedIn },
    { k: 'Société', v: siteConfig.legalEntity ?? '', small: 'Nouveau-Mexique, États-Unis' },
    { k: 'Assistance', v: F.supportHours, small: `Répond généralement en ${F.usualReply}` },
    { k: 'Langues de l’assistance', v: String(F.languages.length), small: F.languages.join(' · ') },
  ],
  aboutContact: `Des questions sur SYGMA TV+${N}? Notre assistant automatisé est disponible ${F.supportHours}, avec une assistance humaine si nécessaire.`,
  hubContact: 'Vous ne trouvez pas votre réponse ? Écrivez-nous — indiquez votre appareil et, si vous en avez une, votre référence de commande.',
  topicContact: `Besoin d’aide${N}? Contactez-nous par e-mail ou sur WhatsApp. Notre assistant automatisé est disponible ${F.supportHours}, avec une assistance humaine si nécessaire.`,
  hubRelated: [
    { href: '/fr/about', label: 'À propos' },
    { href: '/fr#faq', label: 'FAQ' },
    { href: '/legal/refunds', label: 'Remboursements et annulations (en anglais)' },
    { href: '/legal/terms', label: 'Conditions d’utilisation (en anglais)' },
  ],
  refundPolicy: { href: '/legal/refunds', label: 'Politique de remboursement complète (en anglais)' },
  terms: { href: '/legal/terms', label: 'Conditions d’utilisation (en anglais)' },
  allTopics: 'Tous les sujets d’aide',
  prevTopic: 'Sujet précédent',
  nextTopic: 'Sujet suivant',
  content: {
    contactUs: 'Nous contacter',
    email: 'E-mail',
    phone: 'Téléphone / WhatsApp',
    related: 'Pages associées',
    onThisPage: 'Sur cette page',
    lastReviewed: 'Dernière révision : ',
  },
  actions: { trial: 'Demander un essai gratuit', support: 'Contacter l’assistance', plans: 'Voir les formules', plansHref: '/fr#plans' },
};
