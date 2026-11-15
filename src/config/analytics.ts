/**
 * Analytics & marketing configuration (single source of truth). These IDs are public identifiers, not secrets.
 * Scripts load only after the matching consent (ConsentBanner) and only on the production host —
 * never in local development or tests unless explicitly forced.
 */
export const ANALYTICS = {
  ga4MeasurementId: 'G-258WWPPN8Y',
  clarityProjectId: 'ze1jvwh69q',
  /** Google Tag Manager — advertising platforms only (no GA4 tag inside: GA4 stays on gtag). */
  gtmContainerId: 'GTM-MGCLXP5L',
  /** Kill switch: false = GTM is never loaded, whatever the consent (rollback without touching GTM). */
  gtmEnabled: true,
  /** Hosts where analytics may run. */
  hosts: ['sygmatv.com', 'www.sygmatv.com'],
  /** localStorage key of the consent choice; bump `consentVersion` to ask everyone again. */
  consentKey: 'sygma_consent',
  /** v2 (15/11/2026): separate Analytics and Marketing choices — everyone is asked again. */
  consentVersion: 2,
  /** QA only: localStorage flag that allows analytics on another host (e.g. a local build). */
  forceKey: 'sygma_analytics_force',
} as const;
