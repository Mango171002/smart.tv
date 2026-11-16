/**
 * Privacy, Cookie, Refund and Legal-notice pages — SYGMA TV+.
 *
 * Written to match what the site and the team actually do today (forms, WhatsApp
 * follow-up, Brevo e-mails, Telegram team notifications, consent-gated analytics).
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
    title: 'Who is responsible for your data',
    body: [
      { p: `The data controller is ${OPERATOR}, which operates sygmatv.com and the SYGMA TV+ service (“we”, “us”). Its full identity and registered address are in our Legal notice. For any privacy question or request, write to ${EMAIL}.` },
    ],
  },
  {
    id: 'data',
    icon: 'database',
    title: 'What we collect',
    body: [
      { p: 'We only collect what we need to answer you and to provide the service:' },
      { list: [
        'Forms (free trial, order, pre-registration, contact): your name, e-mail address, phone or WhatsApp number, country, device, the plan you are interested in, your message, and a record of your consent (date and text version).',
        'Orders and subscriptions: plan, duration, number of devices, price, order reference, invoice number, payment status and activation dates. We do not receive or store your full card details.',
        'Messages: what you send us by e-mail, WhatsApp or Telegram, so we can follow up on your request.',
        'Technical data: IP address and browser information processed by our hosting provider to deliver the site and protect it against abuse, and cookie-less visit statistics (pages, country, device type).',
        'Only with your consent: audience-measurement and session data (Google Analytics, Microsoft Clarity) and, once active, advertising-measurement data. See our Cookie policy.',
      ] },
      { p: 'We do not ask for sensitive data. Please do not include any in your messages.' },
    ],
  },
  {
    id: 'purposes',
    icon: 'check',
    title: 'Why we use it, and on what legal basis',
    body: [
      { table: {
        head: ['Purpose', 'Legal basis'],
        rows: [
          ['Answer your request, set up your free trial and send the related e-mails (confirmation, trial access, one follow-up after the trial)', 'Steps you ask for before a contract; our legitimate interest in following up on your request'],
          ['Process your order, activate and support your subscription, send your invoice', 'Performance of the contract'],
          ['Keep invoices and accounting records', 'Legal obligation'],
          ['Invite you once, after activation, to review us on Trustpilot', 'Legitimate interest (you can object at any time)'],
          ['Send launch news and offers', 'Your consent (opt-in box), which you can withdraw at any time'],
          ['Measure the audience and improve the site (Google Analytics, Microsoft Clarity)', 'Your consent'],
          ['Measure our advertising campaigns (not active yet)', 'Your consent'],
          ['Secure the site, prevent spam and fraud', 'Legitimate interest'],
        ],
      } },
      { p: 'We do not make decisions about you based solely on automated processing, and we do not sell your personal data.' },
    ],
  },
  {
    id: 'recipients',
    icon: 'users',
    title: 'Who receives your data',
    body: [
      { p: 'Your data is accessed only by our team members who need it, and by the service providers below, who process it on our behalf and under our instructions:' },
      { table: {
        head: ['Provider', 'Role'],
        rows: [
          ['Cloudflare', 'Website hosting, security and cookie-less visit statistics'],
          ['Supabase', 'Database storing your requests and orders'],
          ['Brevo', 'Sending our transactional e-mails'],
          ['Telegram', 'Internal notifications to our team about new requests'],
          ['WhatsApp (Meta)', 'Conversations, when you choose to contact us on WhatsApp'],
          ['Google (Analytics, Tag Manager)', 'Audience measurement — only with your consent'],
          ['Microsoft (Clarity)', 'Usage analysis — only with your consent'],
        ],
      } },
      { p: 'Trustpilot receives nothing from us: you only share information with Trustpilot if you choose to leave a review. We may also disclose data when the law requires it.' },
    ],
  },
  {
    id: 'transfers',
    icon: 'globe',
    title: 'International transfers',
    body: [
      { p: 'Some providers process data outside your country, including in the United States. Where this happens, the transfer is covered by an adequacy decision (such as the EU-U.S. Data Privacy Framework) or by Standard Contractual Clauses approved by the European Commission and the UK, together with the providers’ security measures.' },
    ],
  },
  {
    id: 'retention',
    icon: 'clock',
    title: 'How long we keep it',
    body: [
      { list: [
        'Trial, contact and pre-registration requests that do not lead to a subscription: deleted within 12 months.',
        'Customer data: for as long as your subscription lasts, then 12 months to handle any question or claim.',
        'Invoices and accounting records: for the period required by accounting and tax law.',
        'Marketing consent: until you withdraw it, or 12 months without any contact from you.',
        'Analytics cookies: see the durations in our Cookie policy.',
      ] },
    ],
  },
  {
    id: 'rights',
    icon: 'user',
    title: 'Your rights',
    body: [
      { p: 'Depending on where you live (EU/EEA and UK GDPR, Canada’s PIPEDA, U.S. state privacy laws and others), you can:' },
      { list: [
        'access your data and get a copy of it;',
        'correct inaccurate data;',
        'ask us to delete your data;',
        'object to, or ask us to restrict, its use — including at any time for marketing;',
        'receive the data you gave us in a portable format;',
        'withdraw a consent at any time (cookies: « Cookie settings » at the bottom of every page; e-mails: the unsubscribe link or a message to us).',
      ] },
      { p: `Write to ${EMAIL}. We answer within one month and may ask you to confirm your identity. We will never treat you differently for exercising your rights. You can also complain to your data-protection authority (for example the ICO in the UK, or the authority of your EU country).` },
    ],
  },
  {
    id: 'security',
    icon: 'lock',
    title: 'Security',
    body: [
      { p: 'The site is served over HTTPS only. Your data is stored in a database with row-level access rules, reachable only from our servers; access within our team is limited to what each person needs. No method is perfectly secure, but we take care to protect your data and will inform you and the authorities if a breach puts you at risk, as the law requires.' },
    ],
  },
  {
    id: 'minors',
    icon: 'shield',
    title: 'Children',
    body: [
      { p: 'Our service is for adults. We do not knowingly collect data from anyone under 16. If you believe a child has sent us data, contact us and we will delete it.' },
    ],
  },
  {
    id: 'changes',
    icon: 'pencil',
    title: 'Changes to this policy',
    body: [
      { p: 'We will update this policy when our practices change and show the date of the latest version at the top of this page. If a change significantly affects how we use your data, we will tell you by e-mail or on the site.' },
    ],
  },
];

const COOKIES: LegalSection[] = [
  {
    id: 'principle',
    icon: 'cookie',
    title: 'Our approach',
    body: [
      { p: 'Cookies are small files stored by your browser. We only use optional cookies with your consent, given separately for Analytics and Marketing in the cookie banner (« Accept all », « Decline all » or « Customize »). Until you choose, and if you decline, no optional cookie is set. Declining does not limit your use of the site.' },
    ],
  },
  {
    id: 'necessary',
    icon: 'shield',
    title: 'Always on (no consent needed)',
    body: [
      { table: {
        head: ['Name', 'Provider', 'Purpose', 'Duration'],
        rows: [
          ['sygma_consent', 'SYGMA TV+', 'Remembers your cookie choice (stored in your browser’s local storage, not a cookie)', 'Until you change it'],
          ['Web Analytics', 'Cloudflare', 'Cookie-less visit statistics: pages, country, device type. Nothing is stored on your device', 'No storage'],
        ],
      } },
    ],
  },
  {
    id: 'analytics',
    icon: 'activity',
    title: 'Analytics (with your consent)',
    body: [
      { table: {
        head: ['Name', 'Provider', 'Purpose', 'Duration'],
        rows: [
          ['_ga', 'Google Analytics', 'Distinguishes visitors to measure the audience', 'Up to 2 years'],
          ['_ga_*', 'Google Analytics', 'Keeps the state of your visit', 'Up to 2 years'],
          ['_clck', 'Microsoft Clarity', 'Recognises a returning browser', 'Up to 1 year'],
          ['_clsk', 'Microsoft Clarity', 'Groups the pages of one visit for session replay', '1 day'],
        ],
      } },
      { p: 'Google Analytics does not store IP addresses and its advertising features are off. Clarity masks form fields and personal details in session replays.' },
    ],
  },
  {
    id: 'marketing',
    icon: 'tag',
    title: 'Marketing (with your consent)',
    body: [
      { p: 'These would measure our advertising campaigns (Google Ads, Meta, TikTok) through Google Tag Manager. No advertising tag is active yet. Before one is, this table will name each cookie, its provider and its duration.' },
    ],
  },
  {
    id: 'control',
    icon: 'pencil',
    title: 'Changing your choice',
    body: [
      { p: 'Use « Cookie settings » at the bottom of every page to change your choice at any time. Withdrawing a consent stops the collection immediately and removes the matching cookies. You can also delete cookies in your browser settings.' },
      { p: 'For how the data collected is used, see our Privacy policy.' },
    ],
  },
];

const REFUNDS: LegalSection[] = [
  {
    id: 'trial',
    icon: 'rocket',
    title: 'Try before you pay',
    body: [
      { p: `You can ask for a free ${siteConfig.trialDuration ?? 'short'} trial before buying, to check the service on your own device and connection. The trial is free and ends on its own: nothing to cancel.` },
    ],
  },
  {
    id: 'guarantee',
    icon: 'refund',
    title: 'Satisfied or refunded — 7 days',
    body: [
      { p: 'If you are not satisfied, ask for a refund within 7 days of your subscription’s activation and we refund 100% of the amount paid. No justification is needed.' },
      { list: [
        'The 7 days start on the day your access is activated.',
        'The guarantee applies once per customer, to the first purchase of a subscription.',
        'It does not apply to an account suspended for a breach of our Terms (such as sharing or reselling access). Your statutory rights still apply.',
      ] },
    ],
  },
  {
    id: 'withdrawal',
    icon: 'scale',
    title: 'Your legal right of withdrawal (EU and UK)',
    body: [
      { p: 'If you live in the European Union or the United Kingdom, you also have a 14-day right of withdrawal from the date of purchase. Because you ask us to activate your access right away, if you withdraw after the 7-day guarantee has ended, we refund the amount paid minus the share corresponding to the days already provided.' },
      { p: 'To withdraw, send us a clear statement, for example: “I withdraw from my SYGMA TV+ subscription — order reference …, ordered on …, name …, e-mail …”.' },
      { p: 'Other consumer-protection laws of your country may give you further rights; nothing in this policy limits them.' },
    ],
  },
  {
    id: 'how',
    icon: 'mail',
    title: 'How to ask for a refund',
    body: [
      { list: [
        `Write to ${EMAIL} or message us on WhatsApp, with your order reference (or the e-mail used for the order).`,
        'We confirm receipt within 2 business days.',
        'Your access is deactivated and the refund is sent within 14 days, to the payment method you used, unless we agree on another method. Your bank may take a few more days to show it.',
      ] },
    ],
  },
  {
    id: 'after',
    icon: 'calendar',
    title: 'After these periods',
    body: [
      { p: 'Once the 7-day guarantee and, where it applies, the 14-day withdrawal period have ended, the subscription paid for its full duration is not refundable, except where the law requires it or where the service has been unavailable for a long period through our fault — in that case we offer an extension or a pro-rata refund.' },
    ],
  },
  {
    id: 'renewal',
    icon: 'pause',
    title: 'Renewal and cancellation',
    body: [
      { p: 'Subscriptions do not renew automatically: you only pay again if you choose to renew. You can stop using the service at any time; to have your data deleted afterwards, see our Privacy policy.' },
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
        ['Country of registration', siteConfig.legalCountry],
        ['Registration number', siteConfig.companyNumber],
        ['VAT number', siteConfig.vatNumber],
        ['E-mail', siteConfig.supportEmail],
        ['Phone / WhatsApp', siteConfig.supportPhone],
      ] },
      { p: 'Publication director: the company’s legal representative.' },
    ],
  },
  {
    id: 'hosting',
    icon: 'server',
    title: 'Hosting',
    body: [
      { facts: [
        ['Host', 'Cloudflare, Inc.'],
        ['Address', '101 Townsend Street, San Francisco, CA 94107, United States'],
        ['Website', 'cloudflare.com'],
      ] },
    ],
  },
  {
    id: 'ip',
    icon: 'copyright',
    title: 'Intellectual property',
    body: [
      { p: 'The SYGMA TV+ name and logo, the design, texts and visuals of this website belong to the operator or are used with permission. Any reproduction without prior written permission is prohibited. Other names and marks mentioned belong to their respective owners.' },
    ],
  },
  {
    id: 'documents',
    icon: 'info',
    title: 'Related documents',
    body: [
      { p: 'Our Terms of Service, Privacy policy, Cookie policy and Refunds & cancellations policy are available from the links at the top of this page and in the footer of every page.' },
    ],
  },
];

export const LEGAL_DOCUMENTS: Record<LegalDoc, LegalDocument> = {
  terms: { updated: TERMS_UPDATED, edition: 'Pre-launch version', sections: TERMS_SECTIONS, contactIntro: 'Questions about these Terms or your subscription? Our team is here to help.' },
  privacy: { updated: UPDATED, sections: PRIVACY, contactIntro: 'Questions about your data, or a request to exercise your rights? Write to us.' },
  cookies: { updated: UPDATED, sections: COOKIES, contactIntro: 'Questions about cookies on our site? Write to us.' },
  refunds: { updated: UPDATED, sections: REFUNDS, contactIntro: 'Want a refund or have a question about your order? Contact us with your order reference.' },
  imprint: { updated: UPDATED, sections: IMPRINT, contactIntro: 'To contact the website publisher:' },
};

/** True once the operator identity is published (the Legal notice banner disappears). */
export const imprintComplete = () => Boolean(siteConfig.legalEntity && siteConfig.legalAddress && siteConfig.legalCountry);
