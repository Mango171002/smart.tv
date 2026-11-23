import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { faqItems } from '@/lib/faq';
import { prelaunchCopy, prelaunchOrderLabel, prelaunchTrialLabel } from '@/lib/prelaunch-copy';
import en from '@/i18n/dictionaries/en';

/**
 * Prelaunch hotfix (on top of 864f703): online orders, free trials and support requests closed
 * (FEATURE_CONTACT_FORM=false). The windows show « … opening soon » instead of a form; the API refuses before storage.
 */
const ROOT = join(__dirname, '..', '..');

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
    expect(build).toBeDefined();
    expect(build).toBe(runtime);
  });
  it('online sales stay off (SALES_ENABLED=false) and the other production variables are unchanged', () => {
    expect(env).toMatch(/^SALES_ENABLED=false$/m);
    expect(wrangler).toMatch(/"SALES_ENABLED": "false"/);
    expect(env).toMatch(/^SUPABASE_URL=https:\/\/gsxgfefpkosrlflggdxv\.supabase\.co$/m);
    expect(env).toMatch(/^NEXT_PUBLIC_ALLOW_INDEXING=true$/m);
    expect(env).toMatch(/^NEXT_PUBLIC_SITE_URL=https:\/\/sygmatv\.com$/m);
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
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.doUnmock('@/lib/supabase/server');
  });

  for (const [label, body] of [
    ['order', { kind: 'launch_waitlist', email: 'a@b.co', locale: 'en', consent: true, tier: 'plus', term: '12m', streams: 1 }],
    ['free trial', { kind: 'trial_request', name: 'A', email: 'a@b.co', phone: '+14155550100', locale: 'en', consent: true }],
    ['support', { kind: 'support', name: 'A', email: 'a@b.co', message: 'Hello there, a question.', locale: 'en', consent: true }],
  ] as const) {
    it(`${label}: 503 contact_unavailable, nothing stored or sent`, async () => {
      const getPublicSupabase = vi.fn(() => ({ from: vi.fn(() => ({ insert: vi.fn(async () => ({ error: null })) })) }));
      vi.doMock('@/lib/supabase/server', () => ({ getPublicSupabase, getServiceSupabase: vi.fn(() => null) }));
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const { POST } = await import('@/app/api/contact/route');
      const res = await POST(post(body));
      expect(res.status).toBe(503);
      expect((await res.json()).error).toBe('contact_unavailable');
      expect(getPublicSupabase).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  }
});

describe('POST /api/checkout stays closed', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('SALES_ENABLED', 'false');
  });
  afterEach(() => vi.unstubAllEnvs());
  it('403 sales_disabled, no network call', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { POST } = await import('@/app/api/checkout/route');
    const req = new Request('http://shop.test/api/checkout', {
      method: 'POST',
      headers: { host: 'shop.test', origin: 'http://shop.test', 'content-type': 'application/json' },
      body: JSON.stringify({ tier: 'plus', term: '12m', streams: 1 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe('sales_disabled');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});

describe('prelaunch texts and FAQ', () => {
  it('the replaced FAQ questions are « Can I subscribe now? » and « Which devices are supported? »', () => {
    expect(en.faq.items[0]!.q).toBe('Can I subscribe now?');
    expect(en.faq.items[2]!.q).toBe('Which devices are supported?');
    expect(en.faq.items[2]!.a).toMatch(/Ask for a free trial/);
  });
  it('closed: answers 1 and 3 replaced, questions and every other answer unchanged; open: the dictionary list itself', () => {
    const closed = faqItems(en, false);
    expect(closed[0]!.a).toBe(en.prelaunch.faqSubscribe);
    expect(closed[2]!.a).toBe(en.prelaunch.faqDevices);
    expect(closed.map((i) => i.q)).toEqual(en.faq.items.map((i) => i.q));
    for (const i of [1, 3, 4, 5]) expect(closed[i]).toBe(en.faq.items[i]);
    expect(closed.map((i) => i.a).join(' ')).not.toMatch(/Ask for a free trial|ask for a free trial|Yes\. Choose your plan/);
    expect(faqItems(en, true)).toBe(en.faq.items);
    // The devices answer keeps its factual first sentence (the device list).
    expect(closed[2]!.a.startsWith(en.faq.items[2]!.a.split(/(?<=\.) /)[0]!)).toBe(true);
  });
  it('prelaunch block complete; no price, date or guarantee except in the two lines that keep the open wording', () => {
    const flat = (o: object, at = ''): Array<[string, string]> =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === 'string' ? [[`${at}${k}`, v] as [string, string]] : flat(v as object, `${at}${k}.`)));
    for (const [k, v] of flat(en.prelaunch)) expect(v.trim(), `prelaunch.${k}`).not.toBe('');
    const { howNote, trialGuarantee } = en.prelaunch.home;
    const own = flat(en.prelaunch).filter(([k]) => k !== 'home.howNote' && k !== 'home.trialGuarantee').map(([, v]) => v);
    expect(own.join(' ')).not.toMatch(/\$|USD|\d{1,2}[./]\d{1,2}|guarant|refund/i);
    expect(en.how.note.toLowerCase()).toContain(howNote.split(' · ')[1]!.toLowerCase());
    expect(en.cta.text2.toLowerCase()).toContain(trialGuarantee.split(/(?<=\.) /)[1]!.toLowerCase());
    expect(en.prelaunch.metaDescription.length).toBeLessThanOrEqual(155);
  });
  it('prelaunchCopy: open = the same dictionary object (no change at all)', () => {
    expect(prelaunchCopy(en, true)).toBe(en);
  });
  it('prelaunchCopy: closed swaps exactly the texts that present ordering or trials as available now', () => {
    const d = prelaunchCopy(en, false);
    expect(d.meta.homeDescription).toBe(en.prelaunch.metaDescription);
    expect(d.plans.previewCheckout).toBe('Orders opening soon');
    expect(prelaunchOrderLabel(en.prelaunch)).toBe('Orders opening soon');
    expect(d.cta.trial).toBe('Free trials opening soon');
    expect(prelaunchTrialLabel(en.prelaunch)).toBe('Free trials opening soon');
    expect(d.benefits[0]).toEqual({ title: 'Orders opening soon', text: 'Compare the plans now' });
    expect(d.benefits[3]).toEqual({ title: en.benefits[3]!.title, text: 'Opening soon' });
    expect([d.benefits[1], d.benefits[2], d.benefits[4]]).toEqual([en.benefits[1], en.benefits[2], en.benefits[4]]);
    expect(d.plans.simulatorPoints).toEqual([...en.plans.simulatorPoints.slice(0, 3), en.prelaunch.home.trialGuarantee]);
    expect(d.how.steps.map((s) => s.title)).toEqual(en.how.steps.map((s) => s.title));
    expect(d.how.steps.map((s) => s.text)).toEqual([en.how.steps[0]!.text, 'Opening soon', 'Once orders open', en.how.steps[3]!.text]);
    expect(d.how.note).toBe(en.prelaunch.home.howNote);
    expect(d.cta.text2).toBe(en.prelaunch.home.trialGuarantee);
    expect(d.faq.items).toEqual(faqItems(en, false));
    // Everything else is untouched (no Phase 10–13 copy): only these top-level sections differ.
    const changed = (Object.keys(en) as (keyof typeof en)[]).filter((k) => JSON.stringify(d[k]) !== JSON.stringify(en[k]));
    expect(changed.sort()).toEqual(['benefits', 'cta', 'faq', 'how', 'meta', 'plans']);
    expect({ ...d.meta, homeDescription: '' }).toEqual({ ...en.meta, homeDescription: '' });
    expect({ ...d.plans, previewCheckout: '', simulatorPoints: [] }).toEqual({ ...en.plans, previewCheckout: '', simulatorPoints: [] });
    expect({ ...d.cta, trial: '', text2: '' }).toEqual({ ...en.cta, trial: '', text2: '' });
    // The open dictionary itself is never mutated.
    expect(en.plans.previewCheckout).toBe('Order now');
    expect(en.cta.trial).toBe('Request a free trial');
  });
});
