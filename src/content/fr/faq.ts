/**
 * FAQ française (SEO international, phase 2 — 18/11/2026).
 *
 * Réponses fondées uniquement sur ce qui est vérifié aujourd'hui : fonctionnement de la commande
 * (site → WhatsApp), essai gratuit de 24 heures, formules et nombre d'appareils, absence de
 * renouvellement automatique, « satisfait ou remboursé 7 jours », droit de rétractation UE/R-U,
 * contacts officiels. Aucun prix, délai, débit ou moyen de paiement n'est inventé.
 * `home` : questions reprises (même texte) dans la FAQ de la page d'accueil française.
 */
import { siteConfig } from '@/config/site';

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  /** Internal links shown under the answer (path without the version prefix). */
  links?: Array<{ label: string; path: string }>;
  home?: boolean;
}

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';

export const FR_FAQ: FaqItem[] = [
  {
    id: 'commande',
    home: true,
    q: 'Comment se passe une commande ?',
    a: 'Choisissez votre formule, sa durée et le nombre d’appareils, puis laissez vos coordonnées. Rien n’est débité sur le site : notre équipe vous contacte sur WhatsApp pour confirmer votre commande et le paiement, puis active votre accès.',
    links: [{ label: 'Voir les formules', path: '#plans' }],
  },
  {
    id: 'essai',
    home: true,
    q: 'Puis-je essayer avant d’acheter ?',
    a: 'Oui. Demandez un essai gratuit de 24 heures : notre équipe vous envoie les instructions sur WhatsApp pour tester le service sur votre propre appareil et votre propre connexion. L’essai s’arrête de lui-même, il n’y a rien à résilier.',
  },
  {
    id: 'prix',
    home: true,
    q: 'Combien coûte un abonnement ?',
    a: 'Trois formules annuelles sont proposées — Starter, Plus et Ultra+ — sur 12, 24 ou 36 mois, avec une remise sur les durées longues. Les prix en euros s’afficheront dans la section Formules dès leur validation ; le prix final, taxes comprises, est toujours indiqué avant le paiement.',
  },
  {
    id: 'paiement',
    q: 'Comment se règle le paiement ?',
    a: 'Le paiement se règle avec notre équipe sur WhatsApp, au moment de la confirmation de votre commande : elle vous indique les moyens de paiement disponibles. Aucun paiement ni aucune coordonnée bancaire n’est demandé sur ce site.',
  },
  {
    id: 'appareils',
    q: 'Sur combien d’appareils puis-je regarder ?',
    a: 'Chaque formule inclut 1 appareil, et vous pouvez en ajouter jusqu’à 4 utilisés en même temps. L’abonnement est destiné à un usage personnel au sein de votre foyer : le partage ou la revente de l’accès ne sont pas autorisés.',
  },
  {
    id: 'compatibilite',
    home: true,
    q: 'Quels appareils sont compatibles ?',
    a: 'Smart TV, Android TV et Google TV, Fire TV, Apple TV, iPhone et iPad, smartphones et tablettes Android, et ordinateurs. Avec vos accès, notre équipe vous indique l’application à utiliser sur votre appareil. Nos guides d’installation vous accompagnent pas à pas, et l’essai gratuit permet de vérifier votre appareil.',
    links: [{ label: 'Guides d’installation', path: '/guides' }],
  },
  {
    id: 'connexion',
    q: 'Quelle connexion internet faut-il ?',
    a: 'Une connexion stable est nécessaire. La qualité d’image, de la HD à la 4K HDR, dépend de votre formule, du contenu, de votre appareil et de votre connexion. Un câble réseau ou un Wi-Fi proche de votre box améliore la stabilité, et l’essai gratuit vous permet de vérifier le résultat chez vous.',
  },
  {
    id: 'renouvellement',
    home: true,
    q: 'L’abonnement se renouvelle-t-il automatiquement ?',
    a: 'Non. Aucune formule ne se renouvelle automatiquement : à la fin de votre abonnement, c’est vous qui décidez de renouveler ou non.',
  },
  {
    id: 'remboursement',
    home: true,
    q: 'Puis-je être remboursé ?',
    a: 'Oui. Si vous n’êtes pas satisfait, demandez-le dans les 7 jours suivant l’activation et vous êtes remboursé à 100 %. Vous disposez aussi d’un droit de rétractation de 14 jours : après les 7 premiers jours, la partie non utilisée de l’abonnement vous est remboursée.',
    links: [{ label: 'Remboursement et résiliation', path: '/legal/refunds' }],
  },
  {
    id: 'assistance',
    q: 'Comment contacter l’assistance ?',
    a: `Écrivez-nous à ${EMAIL} ou sur WhatsApp au ${PHONE}, ou utilisez le bouton « Assistance » en bas de l’écran. Indiquez votre référence de commande si vous en avez une : nous vous répondrons plus vite.`,
  },
];
