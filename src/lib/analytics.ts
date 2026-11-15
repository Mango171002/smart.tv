/**
 * Consent + analytics (Google Analytics 4 and Microsoft Clarity), client side.
 *
 * - Nothing is loaded and no cookie is set before the visitor accepts (« Accept » in ConsentBanner).
 * - Each script is injected once; page views are sent manually on route changes (no duplicates
 *   from hash links). Business events go through `track()`, which only sends when allowed.
 * - Events never carry personal data (no name, e-mail, phone): only plan, price and form type.
 */
import { ANALYTICS } from '@/config/analytics';

export type ConsentChoice = 'granted' | 'denied';

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

/** The stored choice, or null when the visitor has not decided yet (or the policy version changed). */
export function readConsent(): ConsentChoice | null {
  const raw = safeGet(ANALYTICS.consentKey);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { v?: number; analytics?: string };
    if (v.v !== ANALYTICS.consentVersion) return null;
    return v.analytics === 'granted' ? 'granted' : v.analytics === 'denied' ? 'denied' : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: ConsentChoice): void {
  const previous = readConsent();
  try {
    window.localStorage.setItem(ANALYTICS.consentKey, JSON.stringify({ v: ANALYTICS.consentVersion, analytics: choice, ts: new Date().toISOString() }));
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
  if (choice === 'denied' && previous === 'granted') {
    revokeAnalytics();
    // Fully unload the scripts already running in this page (nothing more is sent after the choice).
    window.location.reload();
  }
}

export function analyticsHostAllowed(): boolean {
  return (ANALYTICS.hosts as readonly string[]).includes(window.location.hostname) || safeGet(ANALYTICS.forceKey) === '1';
}

let gaLoaded = false;
let clarityLoaded = false;
let lastPageView = '';

function inject(src: string): void {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function loadGa(): void {
  if (gaLoaded || document.querySelector('script[data-sygma="ga4"]')) return;
  gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params -- the official gtag stub pushes the `arguments` object
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('js', new Date());
  const debug = new URLSearchParams(window.location.search).has('analytics_debug');
  window.gtag('config', ANALYTICS.ga4MeasurementId, {
    // GA sends the first page view itself; in-site navigations are sent by trackPageView()
    // (Next.js navigations are not seen by GA's own history detection; #hash links are not page views).
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    ...(debug ? { debug_mode: true } : {}),
  });
  const s = document.createElement('script');
  s.async = true;
  s.dataset.sygma = 'ga4';
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS.ga4MeasurementId}`;
  document.head.appendChild(s);
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

/** Loads GA4 + Clarity once, if consent is granted and the host is allowed. */
export function startAnalytics(): boolean {
  if (readConsent() !== 'granted' || !analyticsHostAllowed()) return false;
  // The current page is counted by GA's own initial page view.
  if (!gaLoaded) lastPageView = window.location.pathname + window.location.search;
  loadGa();
  loadClarity();
  return true;
}

export function analyticsActive(): boolean {
  return gaLoaded && readConsent() === 'granted';
}

/** Consent withdrawn: stop collection, tell both tools, remove their cookies. */
function revokeAnalytics(): void {
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  window.clarity?.('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
  window.clarity?.('consent', false);
  const host = window.location.hostname.replace(/^www\./, '');
  for (const name of document.cookie.split(';').map((c) => c.split('=')[0]!.trim())) {
    if (/^(_ga|_gid|_gat|_clck|_clsk|CLID|ANONCHK|MR|MUID|SM)/.test(name)) {
      for (const domain of ['', `; domain=.${host}`, `; domain=${host}`]) document.cookie = `${name}=; Max-Age=0; path=/${domain}`;
    }
  }
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

/** Sends a business event to GA4 (and a matching Clarity custom event) when analytics is active. */
export function track(event: string, params: Record<string, unknown> = {}): void {
  // Consent already given but the deferred loading has not run yet: start now so the event is not lost.
  // Never let analytics break the site (orders, forms): any error here is swallowed.
  try {
    if (!gaLoaded) startAnalytics();
    if (!analyticsActive()) return;
    window.gtag!('event', event, params);
    window.clarity?.('event', event);
  } catch {
    // ignore
  }
}
