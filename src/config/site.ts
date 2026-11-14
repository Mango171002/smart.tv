/**
 * Central business configuration.
 *
 * Every value set to `null` / `[]` is an UNRESOLVED BUSINESS DECISION. Nothing here
 * is a verified fact. Replace values only with confirmed, documented information.
 * See docs/DECISIONS.md for the list of pending decisions.
 */

/** Brand chosen by the owner (Sygma TV+, domain sygmatv.com). Trademark search/registration still to do. */
export const BRAND_NAME = 'SYGMA TV+';

const envBrand = process.env.NEXT_PUBLIC_BRAND_NAME?.trim();

export const siteConfig = {
  brandName: envBrand || BRAND_NAME,
  brandIsPlaceholder: false as boolean,
  /** Public base URL (used for canonical URLs, sitemap, hreflang). */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  /** Domain not decided. */
  domain: null as string | null,
  supportEmail: 'support@sygmatv.com' as string | null,
  /** Official support line (owner, 14/11/2026). */
  supportPhone: '+44 7412 857594' as string | null,
  /** WhatsApp support number in international format without '+' or spaces (e.g. '33612345678'). Null = the floating support button opens the contact form. */
  supportWhatsApp: '447412857594' as string | null,
  /** Official social accounts (full URLs). An icon is shown in the footer only once its URL is set. */
  social: {
    facebook: 'https://www.facebook.com/share/14unqXhVYRr/' as string | null,
    instagram: 'https://www.instagram.com/sygmatv' as string | null,
    youtube: 'https://www.youtube.com/@SYGMATV' as string | null,
    tiktok: 'https://www.tiktok.com/@sygma.tv' as string | null,
    telegram: 'https://t.me/+2ee4Cu9x-nw1ZWVk' as string | null,
    whatsapp: 'https://whatsapp.com/channel/0029Vb96DpII1rchcsE0tC0V' as string | null,
  },
  supportHours: null as string | null,
  legalEntity: null as string | null,
  legalAddress: null as string | null,
  /** ISO market codes with VERIFIED written redistribution rights. None yet. */
  licensedTerritories: [] as string[],
  /** Licensed catalogue source. None yet: categories shown are illustrative. */
  contentCatalog: null as null,
  /** Technically verified device/app list. None yet: categories are illustrative. */
  supportedDevices: null as null,
  taxRules: null as null,
  paymentMethods: [] as string[],
  paymentProvider: null as string | null,
  refundPolicy: null as string | null,
  activationProvider: null as string | null,
  /** Must stay false until launch: every page is served with noindex,nofollow. */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true',
  /** Version of the consent text shown next to the contact forms. */
  consentTextVersion: 'v0-draft-2026-11',
} as const;

export type SiteConfig = typeof siteConfig;
