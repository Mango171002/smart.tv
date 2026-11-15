/**
 * Analytics configuration (single source of truth). These IDs are public identifiers, not secrets.
 * Scripts load only after the visitor accepts analytics cookies (ConsentBanner) and only on the
 * production host — never in local development or tests unless explicitly forced.
 */
export const ANALYTICS = {
  ga4MeasurementId: 'G-258WWPPN8Y',
  clarityProjectId: 'ze1jvwh69q',
  /** Hosts where analytics may run. */
  hosts: ['sygmatv.com', 'www.sygmatv.com'],
  /** localStorage key of the consent choice; bump `consentVersion` to ask everyone again. */
  consentKey: 'sygma_consent',
  consentVersion: 1,
  /** QA only: localStorage flag that allows analytics on another host (e.g. a local build). */
  forceKey: 'sygma_analytics_force',
} as const;
