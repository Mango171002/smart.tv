/**
 * Inline <head> script: Google Consent Mode default — all four signals denied, for every visitor,
 * before any Google tag can load. Nothing is loaded by it (no network request, no cookie): it only
 * queues the command in the dataLayer. The visitor's choice is applied with gtag('consent', 'update', …).
 */
export const CONSENT_DEFAULT_SCRIPT = [
  'window.dataLayer=window.dataLayer||[];',
  'window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};',
  "window.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});",
  'window.__sygmaConsentDefault=true;',
].join('');
