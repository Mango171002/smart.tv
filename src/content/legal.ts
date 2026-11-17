/**
 * Privacy, Cookie, Refund and Legal-notice pages — SYGMA TV+.
 *
 * Short, plain-language versions (owner request 16/11/2026): no list of internal
 * tools or providers — recipients are described by category, as the GDPR allows.
 * Company identity comes from siteConfig (null = shown as « To be published »).
 * Must be reviewed by a lawyer in the operator's country before launch.
 */
import { siteConfig } from '@/config/site';
import type { LegalDoc } from '@/lib/routes';
import { TERMS_SECTIONS, TERMS_UPDATED, type TermsBlock, type TermsSection } from '@/content/terms';

export type LegalBlock =
  | TermsBlock
  | { table: { head: string[]; rows: string[][] } }
  | { facts: Array<[string, string | null]> };

export interface LegalSection extends Omit<TermsSection, 'icon' | 'body'> {
  icon: TermsSection['icon'] | 'shield' | 'cookie' | 'database' | 'globe' | 'clock' | 'server' | 'check' | 'card' | 'users';
  body: LegalBlock[];
}

export interface LegalDocument {
  updated: string;
  /** Extra label after the date (e.g. « Pre-launch version »). */
  edition?: string;
  sections: LegalSection[];
  /** Sentence shown in the contact box at the end of the page. */
  contactIntro: string;
}

const UPDATED = '16 November 2026';
const EMAIL = siteConfig.supportEmail ?? 'our support address';
const OPERATOR = siteConfig.legalEntity ?? 'the company identified in our Legal notice';

const PRIVACY: LegalSection[] = [
  {
    id: 'controller',
    icon: 'building',
    title: 'Who we are',
    body: [
      { p: `${OPERATOR} runs SYGMA TV+ and is responsible for your data (details in our Legal notice). Questions: ${EMAIL}.` },
    ],
  },
  {
    id: 'data',
    icon: 'database',
    title: 'What we collect',
    body: [
      { list: [
        'The details you give us: name, e-mail, phone or WhatsApp number, country, device, chosen plan and your message.',
        'Your order: plan, price, order reference and invoice. We never store your card details.',
        'Cookies, only if you accept them (see our Cookie policy).',
      ] },
    ],
  },
  {
    id: 'purposes',
    icon: 'check',
    title: 'Why we use it',
    body: [
      { list: [
        'To answer your request and set up your free trial.',
        'To provide your subscription, support and invoice.',
        'To send you news and offers, only if you agreed.',
        'To improve the site, only if you accepted analytics cookies.',
      ] },
      { p: 'We never sell your data.' },
    ],
  },
  {
    id: 'sharing',
    icon: 'lock',
    title: 'How we protect it',
    body: [
      { p: 'Only our team and trusted providers that help us run the service can access your data, for that purpose only and under contract. Some may be outside your country; transfers are protected by appropriate safeguards. We disclose data to authorities only when the law requires it.' },
    ],
  },
  {
    id: 'retention',
    icon: 'clock',
    title: 'How long we keep it',
    body: [
      { p: 'Requests that do not lead to a subscription: 12 months at most. Customers: during the subscription, then 12 months. Invoices: as long as the law requires.' },
    ],
  },
  {
    id: 'rights',
    icon: 'user',
    title: 'Your rights',
    body: [
      { p: `You can access, correct or delete your data, object to its use and withdraw your consent at any time. Write to ${EMAIL}; we answer within one month. You can also contact your data-protection authority. Our service is for adults only.` },
    ],
  },
];

const COOKIES: LegalSection[] = [
  {
    id: 'principle',
    icon: 'cookie',
    title: 'Your choice',
    body: [
      { p: 'Optional cookies are only set if you accept them in the cookie banner. If you decline, the site works the same.' },
    ],
  },
  {
    id: 'list',
    icon: 'activity',
    title: 'Cookies we use',
    body: [
      { table: {
        head: ['Cookie', 'Purpose', 'Duration'],
        rows: [
          ['sygma_consent', 'Remembers your cookie choice', 'Until you change it'],
          ['_ga, _ga_*', 'Audience measurement (Google Analytics) — with your consent', '2 years'],
          ['_clck, _clsk', 'Usage analysis (Microsoft Clarity) — with your consent', '1 year / 1 day'],
        ],
      } },
      { p: 'No advertising cookie is used at the moment.' },
    ],
  },
  {
    id: 'control',
    icon: 'pencil',
    title: 'Changing your choice',
    body: [
      { p: 'Click « Cookie settings » at the bottom of any page. You can also delete cookies in your browser.' },
    ],
  },
];

const REFUNDS: LegalSection[] = [
  {
    id: 'trial',
    icon: 'rocket',
    title: 'Free trial first',
    body: [
      { p: `Test the service for free (${siteConfig.trialDuration ?? 'short trial'}) on your own device before you buy. Nothing to cancel.` },
    ],
  },
  {
    id: 'guarantee',
    icon: 'refund',
    title: 'Satisfied or refunded — 7 days',
    body: [
      { p: 'Not satisfied? Ask within 7 days of activation and we refund 100%, no questions asked. One refund per customer; not available for accounts suspended for sharing or reselling access.' },
    ],
  },
  {
    id: 'withdrawal',
    icon: 'scale',
    title: 'EU and UK customers',
    body: [
      { p: 'You also have 14 days to withdraw. After the first 7 days, we refund the unused part of your subscription.' },
    ],
  },
  {
    id: 'how',
    icon: 'mail',
    title: 'How to ask',
    body: [
      { p: `Send your order reference to ${EMAIL} or on WhatsApp. You are refunded within 14 days, to the payment method you used.` },
    ],
  },
  {
    id: 'after',
    icon: 'pause',
    title: 'After that',
    body: [
      { p: 'Subscriptions are not refundable after these periods, unless the law requires it. They never renew automatically.' },
    ],
  },
];

const IMPRINT: LegalSection[] = [
  {
    id: 'publisher',
    icon: 'building',
    title: 'Website publisher',
    body: [
      { facts: [
        ['Company', siteConfig.legalEntity],
        ['Registered address', siteConfig.legalAddress],
        ['Registered in', siteConfig.legalCountry],
        ['EIN', siteConfig.companyNumber],
        ['E-mail', siteConfig.supportEmail],
        ['Phone / WhatsApp', siteConfig.supportPhone],
      ] },
    ],
  },
  {
    id: 'ip',
    icon: 'copyright',
    title: 'Intellectual property',
    body: [
      { p: 'The SYGMA TV+ name, logo and website content may not be reproduced without our written permission.' },
    ],
  },
];

export const LEGAL_DOCUMENTS: Record<LegalDoc, LegalDocument> = {
  terms: { updated: TERMS_UPDATED, sections: TERMS_SECTIONS, contactIntro: 'Questions? Our team is here to help.' },
  privacy: { updated: UPDATED, sections: PRIVACY, contactIntro: 'Questions about your data? Write to us.' },
  cookies: { updated: UPDATED, sections: COOKIES, contactIntro: 'Questions about cookies? Write to us.' },
  refunds: { updated: UPDATED, sections: REFUNDS, contactIntro: 'Need a refund? Contact us with your order reference.' },
  imprint: { updated: UPDATED, sections: IMPRINT, contactIntro: 'Contact the publisher:' },
};

/** True once the operator identity is published (the Legal notice banner disappears). */
export const imprintComplete = () => Boolean(siteConfig.legalEntity && siteConfig.legalAddress && siteConfig.legalCountry);
