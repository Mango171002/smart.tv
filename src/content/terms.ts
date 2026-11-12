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

export const TERMS_HIGHLIGHTS = [
  { icon: 'rocket', title: 'Pre-launch', text: 'Pre-registration is free and creates no obligation.' },
  { icon: 'tag', title: 'Clear prices', text: 'The final price, taxes included, is shown before any payment.' },
  { icon: 'refund', title: 'Your rights', text: 'Statutory consumer rights, including withdrawal, always apply.' },
  { icon: 'lock', title: 'Your data', text: 'Used only to answer you and run the service.' },
] as const;

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'acceptance',
    icon: 'info',
    title: 'About these Terms',
    body: [
      { p: 'These Terms of Service (the “Terms”) govern your use of the SYGMA TV+ website at sygmatv.com, our pre-registration and contact forms, and — once subscriptions open — the SYGMA TV+ streaming service (together, the “Service”).' },
      { p: 'By using the website or submitting a form you accept these Terms. If you do not agree, please do not use the Service. When you buy a subscription, you will be asked to accept the version of these Terms in force on that date.' },
    ],
  },
  {
    id: 'who-we-are',
    icon: 'building',
    title: 'Who we are',
    body: [
      { p: 'The Service is operated under the SYGMA TV+ brand (“SYGMA TV+”, “we”, “us”). The full identity of the operating company (legal name, registered address and registration numbers) is published in our Legal notice before subscriptions open.' },
      { p: 'You can reach us at any time using the contact details in the “Contact us” section below.' },
    ],
  },
  {
    id: 'pre-launch',
    icon: 'rocket',
    title: 'Pre-launch period',
    body: [
      { p: 'SYGMA TV+ is currently in preparation. During this period:' },
      { list: [
        'pre-registration and trial requests are free and do not create any obligation to buy;',
        'no payment is requested and no bank details are collected;',
        'prices and plans shown on the website are planned launch prices and may change before launch;',
        'no subscription contract exists until you complete a purchase and receive our confirmation.',
      ] },
      { p: 'We will contact you by email when the Service opens in your region.' },
    ],
  },
  {
    id: 'service',
    icon: 'tv',
    title: 'The Service',
    body: [
      { p: 'SYGMA TV+ is a streaming service giving access to live TV channels, sports and on-demand movies and series on compatible devices (Smart TVs, streaming boxes and sticks, smartphones, tablets and computers).' },
      { list: [
        'Channels and content depend on the licences available in each country and may vary by region and over time.',
        'Picture quality (HD, Full HD, 4K, HDR) depends on your plan, the content, your device and your internet connection.',
        'A stable broadband connection is required. Internet access and data charges are your responsibility.',
        'The list of supported devices and apps is published at launch.',
      ] },
    ],
  },
  {
    id: 'account',
    icon: 'user',
    title: 'Eligibility and your account',
    body: [
      { list: [
        'You must be at least 18 years old (or the age of majority in your country) to buy a subscription.',
        'The information you give us must be accurate and kept up to date.',
        'You are responsible for keeping your login details confidential and for all activity on your account.',
        'Tell us immediately at our support address if you suspect unauthorised use of your account.',
      ] },
    ],
  },
  {
    id: 'plans',
    icon: 'tag',
    title: 'Plans, prices and payment',
    body: [
      { p: 'We plan to offer three plans — Starter, Plus and Ultra+ — for 12, 24 or 36 months, with 1 device included and up to 4 simultaneous devices.' },
      { list: [
        'Prices on the website are shown in US dollars (USD) before taxes. The final price, including any applicable taxes, is always displayed before you confirm a purchase.',
        'Payment is processed by a secure third-party payment provider. We never store your full card details.',
        'Promotional benefits (for example “+30 days free” on Plus and Ultra+) apply under the conditions shown at the time of purchase.',
        'We may change our prices for future purchases. A price change never affects a period you have already paid for.',
      ] },
    ],
  },
  {
    id: 'term',
    icon: 'calendar',
    title: 'Duration, renewal and cancellation',
    body: [
      { list: [
        'Each subscription runs for the duration you choose (12, 24 or 36 months) from activation.',
        'A subscription is only renewed if you choose to renew it. If automatic renewal is offered, it will be clearly indicated before purchase, you will be notified in advance and you can switch it off at any time.',
        'You can stop renewal at any time from your account or by contacting support. Your access continues until the end of the period already paid.',
      ] },
    ],
  },
  {
    id: 'refunds',
    icon: 'refund',
    title: 'Refunds and right of withdrawal',
    body: [
      { p: 'If you are a consumer in the European Union or the United Kingdom, you have a statutory right to withdraw from a distance contract within 14 days. If you ask us to start the Service during that period, a proportionate amount may be retained for the days used, as permitted by law.' },
      { p: 'Our full refund rules are set out in our Refunds & cancellations policy. Nothing in these Terms limits the rights you have under the consumer law of your country of residence.' },
    ],
  },
  {
    id: 'devices',
    icon: 'devices',
    title: 'Devices and fair use',
    body: [
      { list: [
        'Your subscription is for personal, private and non-commercial use within your household.',
        'You may watch on as many devices at the same time as your plan allows (1 to 4).',
        'Sharing your access outside your household, reselling it or making it available to the public is not allowed.',
      ] },
    ],
  },
  {
    id: 'acceptable-use',
    icon: 'ban',
    title: 'Acceptable use',
    body: [
      { p: 'When using the Service, you agree not to:' },
      { list: [
        'record, copy, download, redistribute, rebroadcast or publicly show any content, except where a feature of the Service expressly allows it;',
        'bypass, disable or interfere with security, geographic or access-control measures;',
        'use bots, scripts or any automated means to access the Service;',
        'use the Service for any unlawful, fraudulent or harmful purpose.',
      ] },
    ],
  },
  {
    id: 'ip',
    icon: 'copyright',
    title: 'Intellectual property',
    body: [
      { p: 'All content available through the Service belongs to its respective rights holders and is protected by copyright and other laws. The SYGMA TV+ name, logo and website design belong to us. These Terms give you a limited, personal, non-transferable right to watch content for private use; no other right is granted.' },
    ],
  },
  {
    id: 'availability',
    icon: 'activity',
    title: 'Availability and changes to the Service',
    body: [
      { p: 'We work to keep the Service available and of high quality, but we cannot guarantee uninterrupted or error-free access. The Service may be temporarily unavailable for maintenance, updates or reasons beyond our control. We may change channels, content or features; if a change significantly reduces your plan, we will inform you and you may cancel.' },
    ],
  },
  {
    id: 'suspension',
    icon: 'pause',
    title: 'Suspension and termination',
    body: [
      { p: 'We may suspend or close an account in case of a serious breach of these Terms (for example fraud, resale or unauthorised sharing), after notifying you where possible. You may close your account at any time by contacting support.' },
    ],
  },
  {
    id: 'liability',
    icon: 'scale',
    title: 'Liability',
    body: [
      { p: 'We are responsible for losses that are a foreseeable result of our failure to comply with these Terms. We are not responsible for losses caused by your internet connection, your equipment, events beyond our reasonable control, or your use of the Service in breach of these Terms. Nothing in these Terms excludes or limits liability that cannot be excluded by law, including your statutory consumer rights.' },
    ],
  },
  {
    id: 'privacy',
    icon: 'lock',
    title: 'Privacy',
    body: [
      { p: 'We process your personal data only to answer your requests, manage your pre-registration and, after launch, provide the Service. Details are set out in our Privacy policy.' },
    ],
  },
  {
    id: 'changes',
    icon: 'pencil',
    title: 'Changes to these Terms',
    body: [
      { p: 'We may update these Terms, for example to reflect the launch of subscriptions or changes in the law. The date at the top of this page shows the latest version. If a change affects an active subscription, we will notify you in advance by email.' },
    ],
  },
  {
    id: 'law',
    icon: 'gavel',
    title: 'Governing law and disputes',
    body: [
      { p: 'These Terms are governed by the law of the country where the operator of the Service is established, as stated in our Legal notice. If you are a consumer, you also keep the protection of the mandatory rules of your country of residence and may bring a claim before the courts of that country.' },
      { p: 'If you have a complaint, please contact us first — we aim to answer within a few working days.' },
    ],
  },
];
