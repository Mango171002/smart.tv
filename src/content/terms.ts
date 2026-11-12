/**
 * Terms of Service — SYGMA TV+ (pre-launch version).
 *
 * Written to match what the site actually offers today: free pre-registration,
 * no payment, no contract until a purchase is confirmed. Must be reviewed by a
 * lawyer before subscriptions open (operator identity, governing law, taxes).
 */
export const TERMS_UPDATED = '13 November 2026';

export type TermsBlock = { p: string } | { list: string[] };

export interface TermsSection {
  id: string;
  icon: 'info' | 'building' | 'rocket' | 'tv' | 'user' | 'tag' | 'calendar' | 'refund' | 'devices' | 'ban' | 'copyright' | 'activity' | 'pause' | 'scale' | 'lock' | 'pencil' | 'gavel' | 'mail';
  title: string;
  body: TermsBlock[];
}

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'acceptance',
    icon: 'info',
    title: 'About these Terms',
    body: [
      { p: 'These Terms govern your use of sygmatv.com and, once subscriptions open, the SYGMA TV+ streaming service. By using the website or submitting a form, you accept them. The operator’s full identity is published in our Legal notice.' },
    ],
  },
  {
    id: 'pre-launch',
    icon: 'rocket',
    title: 'Pre-launch',
    body: [
      { p: 'SYGMA TV+ is in preparation. Pre-registration and trial requests are free and create no obligation. No payment is requested and no contract exists until you complete a purchase and receive our confirmation. Prices shown are planned launch prices.' },
    ],
  },
  {
    id: 'service',
    icon: 'tv',
    title: 'The Service',
    body: [
      { p: 'Live TV channels, sports, movies and series on compatible devices. Content depends on the licences available in each country and may change. Picture quality (HD to 4K HDR) depends on your plan, the content, your device and your internet connection.' },
    ],
  },
  {
    id: 'plans',
    icon: 'tag',
    title: 'Plans, prices and payment',
    body: [
      { p: 'Starter, Plus and Ultra+ plans for 12, 24 or 36 months, with 1 device included and up to 4. Prices are shown in USD before taxes; the final price, taxes included, is always displayed before payment. Payments are handled by a secure third-party provider. Promotions such as “+30 days free” apply under the conditions shown at purchase.' },
    ],
  },
  {
    id: 'cancellation',
    icon: 'refund',
    title: 'Renewal, cancellation and refunds',
    body: [
      { p: 'A subscription only renews if you choose to renew it, and you can stop renewal at any time. EU and UK consumers have a 14-day right of withdrawal. Details are in our Refunds & cancellations policy; your statutory consumer rights always apply.' },
    ],
  },
  {
    id: 'use',
    icon: 'ban',
    title: 'Fair and lawful use',
    body: [
      { p: 'Your subscription is for personal use in your household, on the number of devices your plan allows. Sharing or reselling your access, recording or redistributing content, and bypassing security measures are not allowed. Serious breaches may lead to suspension of your account.' },
    ],
  },
  {
    id: 'liability',
    icon: 'scale',
    title: 'Liability and changes',
    body: [
      { p: 'We work to keep the Service available but cannot guarantee uninterrupted access. We are not responsible for problems caused by your connection or equipment. Nothing limits liability that the law does not allow us to limit. We may update these Terms and will notify subscribers of important changes by email.' },
    ],
  },
  {
    id: 'law',
    icon: 'gavel',
    title: 'Privacy and governing law',
    body: [
      { p: 'Your personal data is handled as described in our Privacy policy. These Terms are governed by the law of the country where the operator is established; as a consumer, you also keep the protection of the mandatory rules of your country of residence.' },
    ],
  },
];
