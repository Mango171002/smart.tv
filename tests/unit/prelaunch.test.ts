import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { faqItems } from '@/lib/faq';
import en from '@/i18n/dictionaries/en';
import fr from '@/i18n/dictionaries/fr';
import de from '@/i18n/dictionaries/de';
import es from '@/i18n/dictionaries/es';
import it_ from '@/i18n/dictionaries/it';
import nl from '@/i18n/dictionaries/nl';
import sv from '@/i18n/dictionaries/sv';
import nb from '@/i18n/dictionaries/nb';

/**
 * Phase 11B — prelaunch: online orders, free trials and support requests closed (FEATURE_CONTACT_FORM=false) while
 * content rights and tax requirements are unverified. The windows show « Orders opening soon » instead of a form.
 */
const ROOT = join(__dirname, '..', '..');
const DICTS = { en, fr, de, es, it: it_, nl, sv, nb } as const;

describe('production configuration: online requests closed, build and runtime agree', () => {
  const env = readFileSync(join(ROOT, '.env.production'), 'utf8');
  const wrangler = readFileSync(join(ROOT, 'wrangler.jsonc'), 'utf8');
  it('.env.production and wrangler.jsonc both set FEATURE_CONTACT_FORM=false', () => {
    expect(env).toMatch(/^FEATURE_CONTACT_FORM=false$/m);
    expect(wrangler).toMatch(/"FEATURE_CONTACT_FORM": "false"/);
  });
  it('the build value (prelaunch windows) and the runtime value (API) are the same', () => {
    const build = env.match(/^FEATURE_CONTACT_FORM=(\w+)$/m)?.[1];
    const runtime = wrangler.match(/"FEATURE_CONTACT_FORM": "(\w+)"/)?.[1];
    expect(build).toBe(runtime);
  });
  it('online sales stay off (SALES_ENABLED=false) and nothing else changed in the production variables', () => {
    expect(env).toMatch(/^SALES_ENABLED=false$/m);
    expect(wrangler).toMatch(/"SALES_ENABLED": "false"/);
    expect(wrangler).toMatch(/"SUPABASE_URL": "https:\/\/gsxgfefpkosrlflggdxv\.supabase\.co"/);
  });
});

describe('POST /api/contact while requests are closed', () => {
  const ORIGIN = 'http://shop.test';
  const post = (body: unknown) =>
    new Request(`${ORIGIN}/api/contact`, {
      method: 'POST',
      headers: { host: 'shop.test', origin: ORIGIN, 'content-type': 'application/json', 'x-forwarded-for': `10.1.0.${Math.floor(Math.random() * 250)}` },
      body: JSON.stringify(body),
    });
  beforeEach(() => {
    vi.resetModules();
    // Database configured (as in production): the refusal must come from the flag, before any storage.
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    vi.stubEnv('FEATURE_CONTACT_FORM', 'false');
  });
  afterEach(() => vi.unstubAllEnvs());

  for (const [label, body] of [
    ['order', { kind: 'launch_waitlist', email: 'a@b.co', locale: 'en', consent: true, tier: 'plus', term: '12m', streams: 1 }],
    ['free trial', { kind: 'trial_request', name: 'A', email: 'a@b.co', phone: '+14155550100', locale: 'en', consent: true }],
    ['support', { kind: 'support', name: 'A', email: 'a@b.co', message: 'Hello there, a question.', locale: 'en', consent: true }],
  ] as const) {
    it(`${label}: 503 contact_unavailable, nothing stored or sent`, async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const { POST } = await import('@/app/api/contact/route');
      const res = await POST(post(body));
      expect(res.status).toBe(503);
      expect((await res.json()).error).toBe('contact_unavailable');
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  }
});

describe('prelaunch texts and FAQ', () => {
  it('the first FAQ question is « Can I subscribe now? » (its answer is the one replaced)', () => {
    expect(en.faq.items[0]!.q).toBe('Can I subscribe now?');
    for (const d of Object.values(DICTS)) expect(d.faq.items).toHaveLength(en.faq.items.length);
  });
  for (const [lang, d] of Object.entries(DICTS)) {
    it(`${lang}: prelaunch block complete; FAQ answers 1–3 replaced only while closed`, () => {
      const flat = (o: object, at = ''): Array<[string, string]> =>
        Object.entries(o).flatMap(([k, v]) => (typeof v === 'string' ? [[`${at}${k}`, v] as [string, string]] : flat(v as object, `${at}${k}.`)));
      for (const [k, v] of flat(d.prelaunch)) expect(v.trim(), `${lang}.prelaunch.${k}`).not.toBe('');
      expect(flat(d.prelaunch).map(([k]) => k).sort()).toEqual(flat(en.prelaunch).map(([k]) => k).sort());
      const closed = faqItems(d, false);
      expect(closed.map((i) => i.a).slice(0, 3)).toEqual([d.prelaunch.faqSubscribe, d.prelaunch.faqCountries, d.prelaunch.faqDevices]);
      expect(closed.map((i) => i.q)).toEqual(d.faq.items.map((i) => i.q));
      expect(closed.slice(3)).toEqual(d.faq.items.slice(3));
      expect(faqItems(d, true)).toBe(d.faq.items);
      // The open answers keep their factual first sentence (countries: confirmed by our team; devices: the list).
      for (const i of [1, 2]) expect(closed[i]!.a.startsWith(d.faq.items[i]!.a.split(/(?<=\.) /)[0]!), `${lang} FAQ ${i + 1}`).toBe(true);
      // No price, date or guarantee in the prelaunch messages — except the two home lines that keep the guarantee
      // wording of the open text they replace (« How it works » note, closing banner / simulator point).
      const { howNote, trialGuarantee } = d.prelaunch.home;
      const own = flat(d.prelaunch).filter(([k]) => k !== 'home.howNote' && k !== 'home.trialGuarantee').map(([, v]) => v);
      // « 24/7 » (the automated assistant, comparison-table support line) is not a date.
      expect(own.join(' ').replace(/24\/7/g, '')).not.toMatch(/\$|USD|\d{1,2}[./]\d{1,2}|guarant|garant|rembours|reembolso|rimborsat|geld-terug|pengarna|pengene/i);
      expect(d.how.note.toLowerCase()).toContain(howNote.split(' · ')[1]!.toLowerCase());
      expect(d.cta.text2.toLowerCase()).toContain(trialGuarantee.split(/(?<=\.) /)[1]!.toLowerCase());
      expect(`${howNote} ${trialGuarantee}`).not.toMatch(/\$|USD|\d{1,2}[./]\d{1,2}/);
    });
  }
});
