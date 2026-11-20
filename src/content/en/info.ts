/**
 * About us + Help center content (phase 5C draft — NOT published).
 *
 * Rule: only facts already verified and published elsewhere on the site (Terms, Refunds, Privacy, Legal
 * notice, FAQ, order and trial forms, company details in src/config/site.ts). No channel, sport, catalogue,
 * country-coverage or quality claim beyond the existing wording; no superlative; no app name (not confirmed).
 * Missing information is listed in docs/seo/phase5c/help-center.md (« To be confirmed by the owner ») and is
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
  sections: LegalSection[];
}

// ---------------------------------------------------------------- About us
export const ABOUT: InfoPage = {
  slug: 'about',
  name: 'About us',
  title: 'About SYGMA TV+',
  metaTitle: 'About us: company, support and commitments',
  description: 'SYGMA TV+ is operated by Sygma TV LLC (New Mexico, USA). How the service works, our commitments and how to reach our support team.',
  intro: 'SYGMA TV+ is a streaming subscription for Smart TVs, streaming devices, mobiles and computers. Here is who we are, how the service works and how to reach us.',
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Who we are',
      body: [
        { p: `SYGMA TV+ — « One World. Endless Entertainment. » — is a streaming subscription service operated by ${siteConfig.legalEntity}, a company registered in the State of New Mexico, United States.` },
        { p: 'Plans are yearly (12, 24 or 36 months), for 1 device included and up to 4. Before you buy, you can test the service on your own device with a free trial.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Company information',
      body: [
        { facts: [
          ['Company', siteConfig.legalEntity],
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
        { list: [
          'Choose your plan, its duration and the number of devices on our website.',
          'Leave your details. Nothing is charged on this site.',
          'Our team contacts you on WhatsApp to confirm your order and the payment.',
          'You receive your access details and the app to use on your device, then you start watching.',
        ] },
        { p: `Not sure yet? Ask for a free ${TRIAL_ADJ} trial first: nothing to pay and nothing to cancel.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'Our commitments',
      body: [
        { list: [
          'Clear prices: the final price, taxes included, is always shown before payment.',
          'No automatic renewal: you decide whether to renew.',
          '7-day money-back guarantee after activation; EU and UK customers also keep their 14-day withdrawal right.',
          'Your data is used only to handle your request and your subscription. We never sell it.',
          'No fake reviews.',
          'Each country opens only once broadcasting authorisations are in place.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'mail', title: 'Customer support',
      body: [
        { p: `Write to ${EMAIL} or send a WhatsApp message to ${PHONE}. Tell us your device and, if you have one, your order reference: we will answer faster. Most questions are answered in our Help center.` },
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
  intro: 'Find answers about the free trial, ordering, devices, troubleshooting and refunds. Still stuck? Our support team is a message away.',
};

export const HELP_TOPICS: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Getting started', icon: 'rocket',
    title: 'Getting started with SYGMA TV+',
    metaTitle: 'Getting started with SYGMA TV+',
    description: 'How SYGMA TV+ works, from choosing a plan to watching: free trial, order on the website, activation on WhatsApp and where the service is offered.',
    summary: 'From choosing a plan to your first stream.',
    intro: 'Getting started takes a few steps. You can begin with a free trial or order directly.',
    sections: [
      { id: 'steps', icon: 'rocket', title: 'The steps', body: [{ list: [
        'Open the Plans section and choose your plan, the duration (12, 24 or 36 months) and the number of devices.',
        'Request a free trial or place your order, with your email address, your country and your WhatsApp number.',
        'Our team contacts you on WhatsApp. For an order, we confirm it with you together with the payment.',
        'You receive your access details and the name of the app to install on your device.',
        'Install the app, enter your access details and start watching.',
      ] }] },
      { id: 'where', icon: 'globe', title: 'Where is the service offered?', body: [{ p: 'In the United States, Canada and Europe. Content can vary by country.' }] },
      { id: 'next', icon: 'info', title: 'Good to know', body: [{ list: [
        'Nothing is charged on this website.',
        'Plans never renew automatically.',
        'Every plan includes 1 device; you can add devices, up to 4.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Supported devices', icon: 'devices',
    title: 'Supported devices',
    metaTitle: 'Supported devices: TV, streaming devices, mobile',
    description: 'SYGMA TV+ works on Smart TVs, streaming boxes and sticks, smartphones, tablets and computers. How many devices you can use and how to check yours.',
    summary: 'TV, streaming devices, mobile and computer.',
    intro: 'SYGMA TV+ is used on TVs, streaming devices, mobiles and computers. The free trial lets you check your own device and connection before you buy.',
    sections: [
      { id: 'categories', icon: 'devices', title: 'Which devices?', body: [{ list: [
        'Smart TVs.',
        'Streaming boxes and sticks.',
        'Smartphones and tablets.',
        'Computers.',
      ] }, { p: 'With your access details, our team tells you which app to install on your device and helps you set it up.' }] },
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
      { id: 'request', icon: 'rocket', title: 'How do I request it?', body: [{ list: [
        'Select « Free trial » at the top of any page.',
        'Enter your full name, your email address and your phone number with its country code, and agree to be contacted.',
        'Our team contacts you on WhatsApp with your access details and the app to install.',
      ] }] },
      { id: 'cost', icon: 'tag', title: 'Is it really free?', body: [{ p: 'Yes. A trial request is free and creates no obligation. The trial ends by itself: there is nothing to cancel.' }] },
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
    description: 'How to order SYGMA TV+: choose your plan online, confirm with our team on WhatsApp, then pay. Prices, taxes and renewal explained.',
    summary: 'How orders are confirmed and paid.',
    intro: 'You choose and order online; the payment is arranged with our team. Nothing is charged on this website.',
    sections: [
      { id: 'order', icon: 'rocket', title: 'How do I order?', body: [{ list: [
        'In the Plans section, choose your plan, the duration and the number of devices: the price is shown immediately.',
        'Select « Order now », enter your email address, your country and your WhatsApp number, and agree to be contacted about your order.',
        'Review and confirm. You receive a confirmation on screen.',
        'Our team contacts you on WhatsApp to confirm your order and the payment, then activates your access.',
      ] }] },
      { id: 'pay', icon: 'card', title: 'How do I pay?', body: [{ p: 'The payment is arranged with our team on WhatsApp when your order is confirmed. No payment and no card details are requested on this website.' }] },
      { id: 'prices', icon: 'tag', title: 'Prices and taxes', body: [{ p: 'Prices are shown in US dollars (USD) before taxes. The final price, taxes included, is always shown before payment. Longer durations cost less per year: see the current prices in the Plans section.' }] },
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
    ],
  },
  {
    slug: 'contact-support', name: 'Contact support', icon: 'mail',
    title: 'Contact our support team',
    metaTitle: 'Contact support: email and WhatsApp',
    description: 'How to reach SYGMA TV+ support by email, WhatsApp or the contact form, and what to include in your message to get a faster answer.',
    summary: 'Email, WhatsApp or the contact form.',
    intro: 'Our team answers by email and on WhatsApp.',
    sections: [
      { id: 'reach', icon: 'mail', title: 'How to reach us', body: [{ list: [
        `Email: ${EMAIL}.`,
        `WhatsApp or phone: ${PHONE}.`,
        'The contact form: select « Contact » at the bottom of any page.',
      ] }] },
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
