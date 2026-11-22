/**
 * Help-centre topic slugs, shared by every language (same English slug under each prefix). Kept here, without the
 * page content, so the language switcher (client) can map /help/<topic> without bundling the Help texts.
 * tests/unit/language-switcher.test.ts checks this list equals the slugs of src/content/en/info.ts.
 */
export const HELP_TOPIC_SLUGS = ['getting-started', 'devices', 'free-trial', 'ordering-payment', 'troubleshooting', 'contact-support', 'refunds'] as const;
