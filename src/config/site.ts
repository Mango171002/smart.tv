/**
 * Central business configuration.
 *
 * Every value set to `null` / `[]` is an UNRESOLVED BUSINESS DECISION. Nothing here
 * is a verified fact. Replace values only with confirmed, documented information.
 * See docs/DECISIONS.md for the list of pending decisions.
 */

export const PROTOTYPE_BRAND_PLACEHOLDER = 'GlobalTV+';

const envBrand = process.env.NEXT_PUBLIC_BRAND_NAME?.trim();

export const siteConfig = {
  /** Brand is NOT decided. The placeholder must be replaced before launch. */
  brandName: envBrand || PROTOTYPE_BRAND_PLACEHOLDER,
  brandIsPlaceholder: !envBrand,
  /** Public base URL (used for canonical URLs, sitemap, hreflang). */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  /** Domain not decided. */
  domain: null as string | null,
  supportEmail: null as string | null,
  /** WhatsApp support number in international format without '+' or spaces (e.g. '33612345678'). Null = the floating support button opens the contact form. */
  supportWhatsApp: null as string | null,
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
