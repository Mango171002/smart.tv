/**
 * Consent + measurement, client side.
 *
 * Two independent consents:
 * - Analytics → Google Analytics 4 (gtag) and Microsoft Clarity — unchanged events.
 * - Marketing → Google Tag Manager (advertising platforms only, configured in GTM — phase 2).
 *
 * - Nothing loads and no cookie is set before the matching consent. Google Consent Mode follows both
 *   choices (analytics_storage ← Analytics; ad_storage, ad_user_data, ad_personalization ← Marketing).
 * - Each script is injected once. Withdrawing a consent removes its cookies and reloads the page.
 * - Without Marketing consent, an extra CSP makes the browser refuse every advertising request.
 * - GA4 events are unchanged. Advertising events are pushed to the dataLayer under their own names
 *   (`sygma.<event>`) with a unique `event_id`, so GA4 never counts them twice.
 * - No personal data (name, e-mail, phone) in any event: only plan, price, currency and form type.
 */
import { ANALYTICS } from '@/config/analytics';

export type ConsentChoice = 'granted' | 'denied';
export interface ConsentState {
  analytics: ConsentChoice;
  marketing: ConsentChoice;
}

type Gtag = (...args: unknown[]) => void;
type Clarity = ((...args: unknown[]) => void) & { q?: unknown[] };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
    clarity?: Clarity;
  }
}

export const CONSENT_EVENT = 'sygma:consent';
export const OPEN_CONSENT_EVENT = 'sygma:open-consent';

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

const choice = (v: unknown): ConsentChoice | null => (v === 'granted' ? 'granted' : v === 'denied' ? 'denied' : null);

/** The stored choices, or null when the visitor has not decided yet (or the policy version changed). */
export function readConsentState(): ConsentState | null {
  const raw = safeGet(ANALYTICS.consentKey);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { v?: number; analytics?: string; marketing?: string };
    if (v.v !== ANALYTICS.consentVersion) return null;
    const analytics = choice(v.analytics);
    const marketing = choice(v.marketing);
    return analytics && marketing ? { analytics, marketing } : null;
  } catch {
    return null;
  }
}

/** Analytics choice (GA4 + Clarity). */
export function readConsent(): ConsentChoice | null {
  return readConsentState()?.analytics ?? null;
}

export function analyticsHostAllowed(): boolean {
  return (ANALYTICS.hosts as readonly string[]).includes(window.location.hostname) || safeGet(ANALYTICS.forceKey) === '1';
}

let gaLoaded = false;
let clarityLoaded = false;
let gtmLoaded = false;
let consentUpdated = false;
let lastPageView = '';

function ensureGtag(): Gtag {
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    // eslint-disable-next-line prefer-rest-params -- the official gtag stub pushes the `arguments` object
    window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  }
  return window.gtag;
}

const ALL_DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' } as const;

/** The four Google Consent Mode v2 signals for a visitor's choice: Analytics → analytics_storage, Marketing → the three ad signals. */
export function googleConsentFor(state: ConsentState): Record<'analytics_storage' | 'ad_storage' | 'ad_user_data' | 'ad_personalization', ConsentChoice> {
  return {
    analytics_storage: state.analytics,
    ad_storage: state.marketing,
    ad_user_data: state.marketing,
    ad_personalization: state.marketing,
  };
}

/**
 * Without Marketing consent, the browser itself refuses every advertising request. The GA4 Google tag
 * also carries the Google Ads destination linked to it in Google's interface, which sends « cookieless »
 * pings (pagead2.googlesyndication.com/ccm/collect) even with ad_storage denied. An extra, stricter CSP
 * (added to the server one) only allows the analytics hosts for network calls and images.
 */
export const NO_ADS_CSP_ID = 'sygma-no-ads-csp';
const NO_ADS_HOSTS = [
  'https://cloudflareinsights.com',
  'https://www.googletagmanager.com', 'https://*.google-analytics.com', 'https://analytics.google.com', 'https://*.analytics.google.com',
  'https://www.clarity.ms', 'https://*.clarity.ms', 'https://c.bing.com',
  'https://tagassistant.google.com',
];
export function noAdsPolicy(): string {
  const hosts = NO_ADS_HOSTS.join(' ');
  return `connect-src 'self' ${hosts}; img-src 'self' data: ${hosts}`;
}
function blockAdRequests(): void {
  if (document.getElementById(NO_ADS_CSP_ID)) return;
  const m = document.createElement('meta');
  m.id = NO_ADS_CSP_ID;
  m.httpEquiv = 'Content-Security-Policy';
  m.content = noAdsPolicy();
  document.head.appendChild(m);
}

/**
 * Google Consent Mode: the default (all denied) is set in <head> by CONSENT_DEFAULT_SCRIPT; the
 * visitor's choice is sent as an « update » before any Google tag loads.
 */
function applyGoogleConsent(state: ConsentState): void {
  const g = ensureGtag();
  const w = window as Window & { __sygmaConsentDefault?: boolean };
  if (!w.__sygmaConsentDefault) {
    // Fallback (inline script missing): never let a Google tag start without a « denied » default.
    g('consent', 'default', { ...ALL_DENIED, wait_for_update: 500 });
    w.__sygmaConsentDefault = true;
  }
  g('consent', 'update', googleConsentFor(state));
  consentUpdated = true;
}

function inject(src: string, tag?: string): void {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  if (tag) s.dataset.sygma = tag;
  document.head.appendChild(s);
}

function loadGa(): void {
  if (gaLoaded || document.querySelector('script[data-sygma="ga4"]')) return;
  gaLoaded = true;
  const g = ensureGtag();
  g('js', new Date());
  const debug = new URLSearchParams(window.location.search).has('analytics_debug');
  g('config', ANALYTICS.ga4MeasurementId, {
    // GA sends the first page view itself; in-site navigations are sent by trackPageView()
    // (Next.js navigations are not seen by GA's own history detection; #hash links are not page views).
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    ...(debug ? { debug_mode: true } : {}),
  });
  inject(`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4MeasurementId}`, 'ga4');
}

function loadClarity(): void {
  if (clarityLoaded || window.clarity) return;
  clarityLoaded = true;
  // Official Clarity snippet (queue + async tag).
  const c = function clarity() {
    // eslint-disable-next-line prefer-rest-params
    (c.q = c.q || []).push(arguments);
  } as Clarity;
  window.clarity = c;
  inject(`https://www.clarity.ms/tag/${ANALYTICS.clarityProjectId}`);
  window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
}

/** Google Tag Manager (advertising platforms). Official snippet, without the <noscript> iframe (it cannot respect consent). */
function loadGtm(): void {
  if (gtmLoaded || !ANALYTICS.gtmEnabled || document.querySelector('script[data-sygma="gtm"]')) return;
  gtmLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  inject(`https://www.googletagmanager.com/gtm.js?id=${ANALYTICS.gtmContainerId}`, 'gtm');
}

/** Loads what the visitor accepted (idempotent): GA4 + Clarity for Analytics, GTM for Marketing. */
export function startAnalytics(): boolean {
  const state = readConsentState();
  if (!state || !analyticsHostAllowed()) return false;
  const wantsGa = state.analytics === 'granted' && !gaLoaded;
  const wantsGtm = state.marketing === 'granted' && !gtmLoaded && ANALYTICS.gtmEnabled;
  if (state.marketing !== 'granted' && (wantsGa || gaLoaded)) blockAdRequests();
  if (wantsGa || wantsGtm) applyGoogleConsent(state);
  if (wantsGa) {
    // The current page is counted by GA's own initial page view.
    lastPageView = window.location.pathname + window.location.search;
    loadGa();
    loadClarity();
  }
  if (wantsGtm) loadGtm();
  return gaLoaded || gtmLoaded;
}

export function analyticsActive(): boolean {
  return gaLoaded && readConsent() === 'granted';
}

export function marketingActive(): boolean {
  return gtmLoaded && readConsentState()?.marketing === 'granted';
}

function removeCookies(pattern: RegExp): void {
  const host = window.location.hostname.replace(/^www\./, '');
  for (const name of document.cookie.split(';').map((c) => c.split('=')[0]!.trim())) {
    if (!name || !pattern.test(name)) continue;
    for (const domain of ['', `; domain=.${host}`, `; domain=${host}`]) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
  }
}

const ANALYTICS_COOKIES = /^(_ga|_gid|_gat|_clck|_clsk|CLID|ANONCHK|MR|MUID|SM)/;
// Google Ads, Meta, TikTok, Microsoft Ads first-party cookies (set later by GTM tags, phase 2).
const MARKETING_COOKIES = /^(_gcl_|_gac_|_fbp|_fbc|_ttp|_tt_|ttcsid|_uet)/;

/** Saves both choices; withdrawing a consent removes its cookies and reloads the page (scripts fully unloaded). */
export function saveConsent(next: ConsentState): void {
  const previous = readConsentState();
  try {
    window.localStorage.setItem(ANALYTICS.consentKey, JSON.stringify({ v: ANALYTICS.consentVersion, ...next, ts: new Date().toISOString() }));
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  const lostAnalytics = previous?.analytics === 'granted' && next.analytics === 'denied';
  const lostMarketing = previous?.marketing === 'granted' && next.marketing === 'denied';
  if (consentUpdated) applyGoogleConsent(next);
  // The advertising block cannot be lifted on the current page: reload once Marketing is granted.
  const gainedMarketing = next.marketing === 'granted' && Boolean(document.getElementById(NO_ADS_CSP_ID));
  if (lostAnalytics || lostMarketing || gainedMarketing) {
    if (lostAnalytics) {
      window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
      window.clarity?.('consent', false);
      removeCookies(ANALYTICS_COOKIES);
    }
    if (lostMarketing) removeCookies(MARKETING_COOKIES);
    window.location.reload();
    return;
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: next }));
}

/** One page view per in-site navigation (path + query); hash-only changes (section links) are not page views. */
export function trackPageView(): void {
  if (!analyticsActive()) return;
  const key = window.location.pathname + window.location.search;
  if (key === lastPageView) return;
  lastPageView = key;
  window.gtag!('event', 'page_view', {
    page_location: window.location.origin + key,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

export interface PlanItem {
  item_id: string;
  item_name: string;
  item_category: 'subscription';
  item_variant: string;
  price: number;
  quantity: 1;
}

/** GA4 item for a plan (no personal data). */
export function planItem(tier: string, tierName: string, term: string, termLabel: string, streams: number, amountMinor: number): PlanItem {
  return {
    item_id: `${tier}-${term}-${streams}`,
    item_name: `SYGMA TV+ ${tierName}`,
    item_category: 'subscription',
    item_variant: `${termLabel} · ${streams} device${streams > 1 ? 's' : ''}`,
    price: amountMinor / 100,
    quantity: 1,
  };
}

/**
 * Advertising events pushed to the dataLayer for GTM (phase 2 tags). `purchase` is reserved for the
 * server (sent only after a confirmed payment — phase 3), never from the browser.
 */
export const AD_EVENTS = ['view_item', 'begin_checkout', 'generate_lead', 'contact_whatsapp'] as const;
const AD_PARAMS = ['currency', 'value', 'items', 'item_id', 'lead_type', 'link_type', 'placement'] as const;
const ITEM_KEYS = ['item_id', 'item_name', 'item_category', 'item_variant', 'price', 'quantity'] as const;

export function newEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Allow-list of non-personal parameters (anything else, e.g. a future field with personal data, is dropped). */
export function adPayload(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of AD_PARAMS) {
    if (params[k] === undefined) continue;
    out[k] =
      k === 'items' && Array.isArray(params.items)
        ? (params.items as Record<string, unknown>[]).map((it) => Object.fromEntries(ITEM_KEYS.filter((ik) => it[ik] !== undefined).map((ik) => [ik, it[ik]])))
        : params[k];
  }
  return out;
}

function pushAdEvent(event: string, params: Record<string, unknown>): void {
  window.dataLayer = window.dataLayer || [];
  // Clear the previous event's data (GTM merges dataLayer objects), then push the new one.
  window.dataLayer.push({ sygma: null, event_id: null });
  window.dataLayer.push({ event: `sygma.${event}`, event_id: newEventId(), sygma: { event_name: event, ...adPayload(params) } });
}

/**
 * Sends a business event: to GA4 (+ Clarity) with Analytics consent — unchanged — and, for the
 * advertising events, to the dataLayer for GTM with Marketing consent.
 */
export function track(event: string, params: Record<string, unknown> = {}): void {
  // Never let measurement break the site (orders, forms): any error here is swallowed.
  try {
    // Consent already given but the deferred loading has not run yet: start now so the event is not lost.
    startAnalytics();
    if (analyticsActive()) {
      window.gtag!('event', event, params);
      window.clarity?.('event', event);
    }
    if (marketingActive() && (AD_EVENTS as readonly string[]).includes(event)) pushAdEvent(event, params);
  } catch {
    // ignore
  }
}
