/**
 * About us + Help center content (phase 5C draft — NOT published).
 *
 * Rule: only facts already verified and published elsewhere on the site (Terms, Refunds, Privacy, Legal
 * notice, FAQ, order and trial forms, company details in src/config/site.ts). No channel, sport, catalogue,
 * country-coverage or quality claim beyond the existing wording; no superlative; no app name (not confirmed).
 * Missing information is listed in docs/seo/phase5c/about-and-help.md (« To be confirmed by the owner ») and is
 * simply not written here.
 */
import type { LegalSection } from '@/content/legal';
import { siteConfig } from '@/config/site';

export const INFO_REVIEWED = '20 November 2026';

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';
const TRIAL = siteConfig.trialDuration ?? '24 hours';
/** « 24 hours » → « 24-hour » (adjective: « a free 24-hour trial »). */
const TRIAL_ADJ = TRIAL.replace(/^(\d+) (\w+?)s?$/, '$1-$2');

/**
 * Owner-validated operational facts (20/11/2026, M1–M10). Declared, not measured: always written as « usually »,
 * never as a contractual guarantee. Not published until proven: PDF invoice (M6 — no PDF in the code today),
 * app names (M7 — store availability unverified), country list (M8 — distribution rights not verified).
 *
 * Real ordering flow (owner, 20/11/2026 — docs/seo/phase5c/audit-parcours-commercial.md): order form → our team
 * contacts the customer on WhatsApp → activation → the customer pays → once the payment is received and confirmed,
 * the team marks the order « Converti », which sends the « Your subscription is now active! » email (order number,
 * subscription details, payment confirmation). That email is not a PDF invoice and is never presented as one.
 */
export const OWNER_FACTS = {
  established: '2026',
  basedIn: 'United States',
  supportHours: '24/7',
  usualReply: 'under an hour',
  usualActivation: 'within an hour after your order is confirmed on WhatsApp',
  languages: ['English', 'French', 'Arabic', 'German', 'Spanish', 'Italian'],
  /** Arranged by our team on WhatsApp once the subscription is active — none of them is charged on this website. */
  paymentMethods: ['Visa / Mastercard card', 'PayPal', 'Cryptocurrency (USDT via Binance)', 'Bank transfer', 'Western Union', 'MoneyGram'],
} as const;

/** Extra content blocks of the About / Help pages (rendered by InfoContent). */
export type InfoBlock =
  | LegalSection['body'][number]
  | { steps: Array<{ title: string; text: string }> }
  | { chips: string[]; label: string }
  | { links: Array<{ href: string; label: string; text: string }> }
  | { note: string };
export type InfoSection = Omit<LegalSection, 'body'> & { body: InfoBlock[] };

export interface InfoPage {
  slug: string;
  /** Short name (breadcrumbs, cards, links). */
  name: string;
  /** H1. */
  title: string;
  /** <title> before « | SYGMA TV+ » (≤ 60 characters in total). */
  metaTitle: string;
  /** Meta description (≤ 155 characters). */
  description: string;
  intro: string;
  /** One line for the Help center cards. */
  summary?: string;
  icon: LegalSection['icon'];
  sections: InfoSection[];
}

const F = OWNER_FACTS;

/** The six steps of an order, in the real order: activation first, payment after, then the confirmation email. */
const ORDER_STEPS = [
  { title: 'Choose your plan', text: 'Pick your plan, its duration and the number of devices on our website. The price is shown straight away.' },
  { title: 'Send your order', text: 'Fill in the short order form: your email, country and WhatsApp number. Nothing is charged on this website. You receive an email confirming that we received your order.' },
  { title: 'We contact you on WhatsApp', text: 'A member of our team contacts you on WhatsApp to confirm your order.' },
  { title: 'We activate your subscription', text: `We send you your access details and setup instructions on WhatsApp. Activation usually takes place ${F.usualActivation}.` },
  { title: 'You pay', text: 'Once your access is active, you pay with one of the payment methods our team offers you.' },
  { title: 'Payment confirmed', text: 'When we have received and confirmed your payment, you receive an email confirming that your subscription is active, with your order number.' },
];
const CONFIRMATION_EMAIL = 'When we have received and confirmed your payment, you receive an email confirming that your subscription is active, with your order number and your subscription details.';
const LANGS = `${F.languages.slice(0, -1).join(', ')} or ${F.languages[F.languages.length - 1]}`;

// ---------------------------------------------------------------- About us
export const ABOUT: InfoPage = {
  slug: 'about',
  name: 'About us',
  title: 'About SYGMA TV+',
  metaTitle: 'About us: company, support and commitments',
  description: 'SYGMA TV+ is a digital-entertainment brand of Sygma TV LLC, established in the United States in 2026. How it works, our commitments and support.',
  intro: `SYGMA TV+ is an international digital-entertainment brand, established in the ${F.basedIn} in ${F.established}. We offer streaming subscriptions for your TV, mobile and computer, with a support team you can reach ${F.supportHours} in six languages.`,
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Who we are',
      body: [
        { p: `SYGMA TV+ — “One World. Endless Entertainment.” — is a brand of ${siteConfig.legalEntity}, a company established in ${F.established} and registered in the State of New Mexico, United States.` },
        { p: 'Plans are yearly (12, 24 or 36 months), for 1 device included and up to 4. Before you buy, you can test the service on your own device with a free trial.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Company information',
      body: [
        { facts: [
          ['Company', siteConfig.legalEntity],
          ['Established', F.established],
          ['Registered address', siteConfig.legalAddress],
          ['Registered in', siteConfig.legalCountry],
          ['EIN', siteConfig.companyNumber],
          ['Email', siteConfig.supportEmail],
          ['Phone / WhatsApp', siteConfig.supportPhone],
        ] },
      ],
    },
    {
      id: 'how', icon: 'rocket', title: 'How the service works',
      body: [
        { p: 'You order with a short form and a real person from our team takes it from there on WhatsApp. We activate your subscription first: you pay only once your access is active.' },
        { steps: ORDER_STEPS },
        { p: `Not sure yet? Ask for a free ${TRIAL_ADJ} trial first: nothing to pay and nothing to cancel.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'Our commitments',
      body: [
        { list: [
          'Clear prices: the price is shown on our website before you order, and you pay only after your subscription is activated.',
          'No automatic renewal: you decide whether to renew.',
          '7-day money-back guarantee after activation; EU and UK customers also keep their 14-day withdrawal right.',
          'Your data is used only to handle your request and your subscription. We never sell it.',
          'No fake reviews.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'users', title: 'Multilingual support',
      body: [
        { p: `Our team is available ${F.supportHours} and usually replies in ${F.usualReply}. This is our usual reply time, not a contractual guarantee.` },
        { chips: [...F.languages], label: 'Support languages' },
        { note: 'Our support team speaks these six languages; the website itself is in English.' },
      ],
    },
    {
      id: 'payment', icon: 'card', title: 'Activation, payment and confirmation',
      body: [
        { p: `Nothing is charged on this website. We activate your subscription first — usually ${F.usualActivation} — and you pay once your access is active, using one of these methods:` },
        { chips: [...F.paymentMethods], label: 'Payment methods' },
        { note: 'Every payment is arranged manually with our team on WhatsApp — none is charged automatically on this website. Our team tells you which methods are available for your order.' },
        { p: CONFIRMATION_EMAIL },
      ],
    },
    {
      id: 'links', icon: 'info', title: 'Useful links',
      body: [
        { links: [
          { href: '/help', label: 'Help center', text: 'Trial, ordering, devices, refunds' },
          { href: '/help/contact-support', label: 'Contact support', text: `Email or WhatsApp, ${F.supportHours}` },
          { href: '/#plans', label: 'Plans', text: 'Choose your plan and see the price' },
          { href: '/legal/refunds', label: 'Refunds & cancellations', text: '7-day money-back guarantee' },
          { href: '/legal/terms', label: 'Terms of Service', text: 'The rules, in plain language' },
          { href: '/legal/imprint', label: 'Legal notice', text: 'Company details' },
        ] },
      ],
    },
  ],
};

// ---------------------------------------------------------------- Help center
export const HELP_HUB = {
  name: 'Help center',
  title: 'Help center',
  metaTitle: 'Help center: trials, orders, devices and refunds',
  description: 'Answers about the SYGMA TV+ free trial, ordering and payment, supported devices, troubleshooting, refunds and how to contact our support team.',
  intro: `Clear answers about the free trial, ordering, payment, devices and refunds. Still stuck? Our team is available ${F.supportHours}.`,
  /** Quick answers on the hub (deep links into the topics). */
  popular: [
    { q: 'When and how do I pay?', href: '/help/ordering-payment#pay' },
    { q: 'How long does activation take?', href: '/help/ordering-payment#activation' },
    { q: 'Is the trial really free?', href: '/help/free-trial#cost' },
    { q: 'Which devices can I use?', href: '/help/devices#categories' },
    { q: 'How quickly does support reply?', href: '/help/contact-support#availability' },
    { q: 'How do I get a refund?', href: '/help/refunds#how' },
  ],
};

export const HELP_TOPICS: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Getting started', icon: 'rocket',
    title: 'Getting started with SYGMA TV+',
    metaTitle: 'Getting started with SYGMA TV+',
    description: 'How SYGMA TV+ works, from choosing a plan to watching: free trial, order form, contact and activation on WhatsApp, then payment.',
    summary: 'From choosing a plan to your first stream.',
    intro: 'Getting started takes a few steps. You can begin with a free trial or order directly.',
    sections: [
      { id: 'steps', icon: 'rocket', title: 'The steps', body: [{ steps: [
        { title: 'Choose your plan', text: 'In the Plans section, choose the plan, the duration (12, 24 or 36 months) and the number of devices.' },
        { title: 'Trial or order', text: 'Request a free trial, or send your order with the short form: your email address, your country and your WhatsApp number.' },
        { title: 'We contact you on WhatsApp', text: 'Our team contacts you on WhatsApp, sends your login details and tells you which app to install.' },
        { title: 'Activation, then payment', text: `For an order, we activate your subscription first — usually ${F.usualActivation}. You pay once your access is active.` },
        { title: 'Start watching', text: 'Install the app, enter your login details and start a stream.' },
      ] }] },
      { id: 'good-to-know', icon: 'info', title: 'Good to know', body: [{ list: [
        'Nothing is charged on this website.',
        'You pay after your subscription is activated, with a payment method offered by our team.',
        'One free trial per customer.',
        'Every plan includes 1 device; you can add devices, up to 4.',
        'Plans never renew automatically.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Supported devices', icon: 'devices',
    title: 'Supported devices',
    metaTitle: 'Supported devices: TV, streaming devices, mobile',
    description: 'SYGMA TV+ is used on Smart TVs, streaming boxes and sticks, smartphones, tablets and computers. How many devices you can use and how to check yours.',
    summary: 'TV, streaming devices, mobile and computer.',
    intro: 'SYGMA TV+ is used on TVs, streaming devices, mobiles and computers. The free trial lets you check your own device and connection before you buy.',
    sections: [
      { id: 'categories', icon: 'devices', title: 'Which devices?', body: [{ list: [
        'Smart TVs.',
        'Streaming boxes and sticks.',
        'Smartphones and tablets.',
        'Computers.',
      ] }, { p: 'With your login details, our team tells you which app to install on your device and helps you set it up.' }] },
      { id: 'how-many', icon: 'users', title: 'How many devices at the same time?', body: [{ p: 'Every plan includes 1 device. You can add devices when you order, up to 4. The subscription is for personal use within your household: sharing or reselling access is not allowed.' }] },
      { id: 'quality', icon: 'activity', title: 'Picture quality', body: [{ p: 'Picture quality depends on your plan, the content, your device and your internet connection. A stable connection — ideally a network cable, or a device close to your Wi-Fi router — makes the biggest difference.' }] },
      { id: 'check', icon: 'check', title: 'Check your device first', body: [{ p: `Ask for a free ${TRIAL_ADJ} trial: you test the service on your own device and connection before you buy.` }] },
    ],
  },
  {
    slug: 'free-trial', name: 'Free trial', icon: 'calendar',
    title: 'The free trial',
    metaTitle: 'Free trial: how to test SYGMA TV+',
    description: `Test SYGMA TV+ free for ${TRIAL} on your own device before you buy. How to request your trial and what happens next — nothing to pay, nothing to cancel.`,
    summary: `${TRIAL[0]!.toUpperCase()}${TRIAL.slice(1)}, free, nothing to cancel.`,
    intro: `The free trial lets you test SYGMA TV+ for ${TRIAL} on your own device and connection, before you decide.`,
    sections: [
      { id: 'request', icon: 'rocket', title: 'How do I request it?', body: [{ steps: [
        { title: 'Open the form', text: 'Select “Free trial” at the top of any page.' },
        { title: 'Leave your details', text: 'Your full name, your email address and your phone number with its country code, and agree to be contacted.' },
        { title: 'Get your access', text: 'Our team contacts you on WhatsApp with your login details and the app to install.' },
      ] }] },
      { id: 'cost', icon: 'tag', title: 'Is it really free?', body: [{ p: 'Yes. A trial request is free and creates no obligation. The trial ends by itself: there is nothing to cancel. One free trial per customer.' }] },
      { id: 'check', icon: 'check', title: 'What should I check during the trial?', body: [{ list: [
        'That the app works on your device.',
        'That the picture is smooth on your internet connection.',
        'How many devices you will need.',
        'How to reach us if setup does not work.',
      ] }] },
    ],
  },
  {
    slug: 'ordering-payment', name: 'Ordering and payment', icon: 'card',
    title: 'Ordering and payment',
    metaTitle: 'Ordering and payment: how it works',
    description: 'How to order SYGMA TV+: send the order form, our team contacts you on WhatsApp and activates your access, then you pay. Payment methods explained.',
    summary: 'Order form, activation, then payment.',
    intro: 'You order with a short form. Our team contacts you on WhatsApp and activates your access, and you pay after activation. Nothing is charged on this website.',
    sections: [
      { id: 'order', icon: 'rocket', title: 'How do I order?', body: [
        { p: 'Ordering takes six steps, from the form on our website to the confirmation of your payment. Select “Order now” in the Plans section to start.' },
        { steps: ORDER_STEPS },
      ] },
      { id: 'pay', icon: 'card', title: 'When and how do I pay?', body: [
        { p: 'You pay after your access has been activated — never on this website. No payment and no card details are requested here: our team sends you the payment options on WhatsApp. Accepted methods:' },
        { chips: [...F.paymentMethods], label: 'Payment methods' },
        { note: 'All payments are arranged manually with our team; none is charged automatically on this website. Our team tells you which methods are available for your order.' },
      ] },
      { id: 'activation', icon: 'clock', title: 'How long does activation take?', body: [{ p: `Our team usually activates your access ${F.usualActivation} — a usual time, not a guarantee. You pay once your access is active.` }] },
      { id: 'emails', icon: 'mail', title: 'Which emails will I receive?', body: [{ list: [
        'Right after you send the form: an email confirming that we received your order.',
        CONFIRMATION_EMAIL,
      ] }] },
      { id: 'prices', icon: 'tag', title: 'Prices and taxes', body: [{ p: 'Prices are shown in US dollars (USD) before taxes, and the price of your plan is shown before you send your order. Longer durations cost less per year: see the current prices in the Plans section.' }] },
      { id: 'contract', icon: 'scale', title: 'When does my subscription start?', body: [{ p: 'The contract starts when our team confirms your order. Plans never renew automatically.' }] },
    ],
  },
  {
    slug: 'troubleshooting', name: 'Troubleshooting', icon: 'activity',
    title: 'Troubleshooting',
    metaTitle: 'Troubleshooting: playback, login and app issues',
    description: 'Fix common SYGMA TV+ issues: stuttering picture, login details refused, app not found in your store, app closing, playback on mobile data.',
    summary: 'Picture, login and app issues.',
    intro: 'Most problems come from the connection or from a typo in the login details. Try these steps first.',
    sections: [
      { id: 'stutter', icon: 'activity', title: 'The picture stutters or freezes', body: [{ p: 'Restart your internet router and your device. Use a network cable if you can, or move the device closer to your Wi-Fi router, then try again.' }] },
      { id: 'login', icon: 'lock', title: 'My login details are refused', body: [{ p: 'Check spaces and upper/lower case, or copy and paste the details from our WhatsApp message. If it still fails, send us a photo of the error screen.' }] },
      { id: 'store', icon: 'tv', title: 'I cannot find the app in my store', body: [{ p: 'App stores depend on the device model and the country. Send us the brand, model and year of your device: we will tell you what works for it.' }] },
      { id: 'crash', icon: 'pause', title: 'The app closes by itself', body: [{ p: 'Restart the device, install the available system and app updates, then try again.' }] },
      { id: 'mobile', icon: 'devices', title: 'Playback stops on mobile data', body: [{ p: 'Quality depends on your mobile network and data plan. Switch to Wi-Fi if you can.' }] },
      { id: 'still', icon: 'mail', title: 'Still not working?', body: [{ p: `Contact us ${F.supportHours} with your device model and a photo of any error message: our team usually replies in ${F.usualReply}.` }] },
    ],
  },
  {
    slug: 'contact-support', name: 'Contact support', icon: 'mail',
    title: 'Contact our support team',
    metaTitle: 'Contact support: email and WhatsApp, 24/7',
    description: `Reach SYGMA TV+ support ${F.supportHours} by email, WhatsApp or the contact form, in six languages. What to include for a faster answer.`,
    summary: `${F.supportHours}, email or WhatsApp, six languages.`,
    intro: `Our team answers by email and on WhatsApp, ${F.supportHours}.`,
    sections: [
      { id: 'reach', icon: 'mail', title: 'How to reach us', body: [{ list: [
        `Email: ${EMAIL}.`,
        `WhatsApp or phone: ${PHONE}.`,
        'The contact form: select “Contact” at the bottom of any page.',
      ] }] },
      { id: 'availability', icon: 'clock', title: 'When do you reply?', body: [{ p: `Our team is available ${F.supportHours} and usually replies in ${F.usualReply}. This is our usual reply time, not a contractual guarantee.` }] },
      { id: 'languages', icon: 'globe', title: 'Which languages?', body: [
        { p: `You can write to us in ${LANGS}.` },
        { chips: [...F.languages], label: 'Support languages' },
        { note: 'The website itself is in English.' },
      ] },
      { id: 'include', icon: 'pencil', title: 'What to include', body: [{ list: [
        'Your order reference, if you have one.',
        'Your device, its brand and model.',
        'What you were doing when the problem started, and a photo of any error message.',
      ] }] },
    ],
  },
  {
    slug: 'refunds', name: 'Refunds', icon: 'refund',
    title: 'Refunds and cancellations',
    metaTitle: 'Refunds: 7-day money-back and withdrawal',
    description: 'SYGMA TV+ refunds: free trial first, 100% refund within 7 days of activation, 14-day withdrawal for EU and UK customers, and how to ask.',
    summary: '7-day money-back, how to ask.',
    intro: 'Try first, then a full refund if you are not satisfied within 7 days of activation. The full policy is in our Refunds page.',
    sections: [
      { id: 'guarantee', icon: 'refund', title: '7-day money-back guarantee', body: [{ p: 'Not satisfied? Ask within 7 days of activation and we refund 100%, no questions asked. One refund per customer; not available for accounts suspended for sharing or reselling access.' }] },
      { id: 'withdrawal', icon: 'scale', title: 'EU and UK customers', body: [{ p: 'You also have 14 days to withdraw. After the first 7 days, we refund the unused part of your subscription.' }] },
      { id: 'how', icon: 'mail', title: 'How to ask', body: [{ p: `Send your order reference to ${EMAIL} or on WhatsApp. You are refunded within 14 days, to the payment method you used.` }] },
      { id: 'after', icon: 'pause', title: 'After these periods', body: [{ p: 'Subscriptions are not refundable after these periods, unless the law requires it. They never renew automatically.' }] },
    ],
  },
];

export const helpTopic = (slug: string) => HELP_TOPICS.find((t) => t.slug === slug);
export const HELP_SLUGS = HELP_TOPICS.map((t) => t.slug);

/** Interface labels of the About / Help pages (per language: src/content/fr/info.ts for French). */
export interface InfoUi {
  home: string;
  breadcrumb: string;
  support: string;
  popular: string;
  topics: string;
  glance: string;
  helpFacts: Array<{ k: string; v: string; small: string }>;
  aboutFacts: Array<{ k: string; v: string; small: string }>;
  aboutContact: string;
  hubContact: string;
  topicContact: string;
  hubRelated: Array<{ href: string; label: string }>;
  refundPolicy: { href: string; label: string };
  terms: { href: string; label: string };
  allTopics: string;
  prevTopic: string;
  nextTopic: string;
  content: { contactUs: string; email: string; phone: string; related: string; onThisPage: string; lastReviewed: string };
  actions: { trial: string; support: string; plans: string; plansHref: string };
}

export const INFO_UI: InfoUi = {
  home: 'Home',
  breadcrumb: 'Breadcrumb',
  support: 'Support',
  popular: 'Popular questions',
  topics: 'Help topics',
  glance: 'Support at a glance',
  helpFacts: [
    { k: 'Availability', v: F.supportHours, small: 'Email and WhatsApp' },
    { k: 'Usual reply time', v: 'Under an hour', small: 'Usual time, not a guarantee' },
    { k: 'Languages', v: String(F.languages.length), small: F.languages.join(' · ') },
    { k: 'Activation', v: 'Usually < 1 hour', small: 'Before payment, after your order is confirmed' },
  ],
  aboutFacts: [
    { k: 'Established', v: F.established, small: F.basedIn },
    { k: 'Company', v: siteConfig.legalEntity ?? '', small: 'New Mexico, USA' },
    { k: 'Support', v: F.supportHours, small: `Usually replies in ${F.usualReply}` },
    { k: 'Support languages', v: String(F.languages.length), small: F.languages.join(' · ') },
  ],
  aboutContact: `Questions about SYGMA TV+? Our team is available ${F.supportHours}.`,
  hubContact: 'Can’t find your answer? Write to us — tell us your device and, if you have one, your order reference.',
  topicContact: `Still need help? Our team answers by email and on WhatsApp, ${F.supportHours}.`,
  hubRelated: [
    { href: '/about', label: 'About us' },
    { href: '/#faq', label: 'FAQ' },
    { href: '/legal/refunds', label: 'Refunds & cancellations' },
    { href: '/legal/terms', label: 'Terms of Service' },
  ],
  refundPolicy: { href: '/legal/refunds', label: 'Full refund policy' },
  terms: { href: '/legal/terms', label: 'Terms of Service' },
  allTopics: 'All help topics',
  prevTopic: 'Previous topic',
  nextTopic: 'Next topic',
  content: { contactUs: 'Contact us', email: 'Email', phone: 'Phone / WhatsApp', related: 'Related pages', onThisPage: 'On this page', lastReviewed: 'Last reviewed: ' },
  actions: { trial: 'Request a free trial', support: 'Contact support', plans: 'See the plans', plansHref: '/#plans' },
};
