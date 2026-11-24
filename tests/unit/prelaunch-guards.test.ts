import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CardData } from '@/lib/telegram/cards';

/**
 * Final backend guards (owner approval A6, A11, B7, B9, B11, C5):
 * - prelaunch: no customer e-mail (bot actions, scheduled e-mails, sender) while online requests are closed;
 * - offered terms only (12 / 24 / 36 months, 1–4 devices);
 * - territory gate for orders and trials (siteConfig.licensedTerritories), after the FEATURE_CONTACT_FORM gate;
 * - domain confirmed, the other launch blockers kept;
 * - trader block, order details and legal links in the e-mails; C5 placeholders render nothing while null.
 */

const ORIGIN = 'http://shop.test';
const openForms = () => {
  vi.stubEnv('FEATURE_CONTACT_FORM', 'true');
  vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
  vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
};
const closeForms = () => vi.stubEnv('FEATURE_CONTACT_FORM', 'false');

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.doUnmock('@/lib/supabase/server');
  vi.doUnmock('@/lib/telegram/api');
  vi.doUnmock('@/lib/email/send');
  vi.doUnmock('@/config/site');
  vi.doUnmock('next/server');
  vi.resetModules();
});

// ------------------------------------------------------------------ A6 / B11: sender guard
describe('customer e-mails are blocked while online requests are closed (sender, defence in depth)', () => {
  beforeEach(() => vi.stubEnv('BREVO_API_KEY', 'xkeysib-test'));

  it('prelaunch: no request to Brevo for a customer address', async () => {
    closeForms();
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    const { sendCustomerEmail } = await import('@/lib/email/send');
    for (const kind of ['trial_started', 'request_confirmed', 'trial_followup', 'review_invite', 'trial_received', 'preregistration_received'] as const) {
      expect(await sendCustomerEmail(kind, 'customer@example.test', {}), kind).toBe('prelaunch_blocked');
    }
    expect(f).not.toHaveBeenCalled();
  });

  it('prelaunch: the team mailbox still receives the bot’s test e-mails', async () => {
    closeForms();
    const f = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', f);
    const { sendCustomerEmail } = await import('@/lib/email/send');
    expect(await sendCustomerEmail('request_confirmed', 'support@sygmatv.com', {})).toBe('sent');
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('online requests open: customer e-mails are sent', async () => {
    openForms();
    const f = vi.fn().mockResolvedValue(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', f);
    const { sendCustomerEmail } = await import('@/lib/email/send');
    expect(await sendCustomerEmail('trial_started', 'customer@example.test', {})).toBe('sent');
  });
});

// ------------------------------------------------------------------ A6 / B11: Telegram staff actions
const RID = '2a6f0c1e-3b4d-4e5f-8a9b-0c1d2e3f4a5b';
const card = (kind: CardData['request']['kind']): CardData => ({
  request: {
    id: RID, kind, name: 'Alex', email: 'alex@example.test', phone: '+14155550123', market: 'US', subject: null, message: null,
    tier: kind === 'launch_waitlist' ? 'plus' : null, term: kind === 'launch_waitlist' ? '12m' : null, streams: kind === 'launch_waitlist' ? 1 : null,
    device: null, marketing: false, created_at: '2026-11-14T18:00:00Z',
  },
  card: { flow: kind === 'support' ? 'support' : 'lead', status: 'new', version: 3, chat_id: -100123, thread_id: 7, message_id: 42 },
  events: [{ id: 1, action: 'create', from_status: null, to_status: 'new', actor_name: null, reason: null, undoes: null, created_at: '2026-11-14T18:00:00Z', undone: false }],
});

async function botHarness(kind: CardData['request']['kind']) {
  const rpc = vi.fn(async (fn: string) => {
    if (fn === 'ops_actor_role') return { data: 'admin', error: null };
    if (fn === 'ops_get_settings') return { data: { chat_id: -100123 }, error: null };
    if (fn === 'ops_card_get') return { data: card(kind), error: null };
    if (fn === 'ops_apply') return { data: { ok: true, card: { ...card(kind), card: { ...card(kind).card, status: 'contacted', version: 4 } } }, error: null };
    if (fn === 'ops_invoice') return { data: { ok: true, number: 'SYG-TEST-1', issued_at: '2026-11-24T10:00:00Z', new: true }, error: null };
    return { data: null, error: null };
  });
  const tg = vi.fn(async () => ({ message_id: 1 }));
  const send = vi.fn(async () => 'sent');
  vi.doMock('@/lib/supabase/server', () => ({ getServiceSupabase: () => ({ rpc }), getPublicSupabase: () => null }));
  vi.doMock('@/lib/telegram/api', () => ({ tg }));
  vi.doMock('@/lib/email/send', () => ({ sendCustomerEmail: send }));
  const { handleUpdate } = await import('@/lib/telegram/ops');
  const { encodeCallback } = await import('@/lib/telegram/cards');
  const click = (action: 'contact' | 'convert') =>
    handleUpdate({
      update_id: 1,
      callback_query: {
        id: 'cb1', from: { id: 111, first_name: 'Sara' },
        data: encodeCallback({ op: 'a', requestId: RID, version: 3, action }),
        message: { message_id: 42, chat: { id: -100123, type: 'supergroup' } },
      },
    });
  const answers = () => tg.mock.calls.filter((c) => (c as unknown[])[0] === 'answerCallbackQuery').map((c) => (c as unknown[])[1] as { text: string; show_alert: boolean });
  return { rpc, tg, send, click, answers };
}

describe('Telegram bot: « Essai envoyé » and « Converti » are refused in prelaunch', () => {
  beforeEach(() => closeForms());

  it('« Essai envoyé » on a trial request: refused, no state change, no e-mail', async () => {
    const h = await botHarness('trial_request');
    await h.click('contact');
    expect(h.rpc).not.toHaveBeenCalledWith('ops_apply', expect.anything());
    expect(h.send).not.toHaveBeenCalled();
    expect(h.answers()).toEqual([{ callback_query_id: 'cb1', text: expect.stringMatching(/^⛔ Prélancement/), show_alert: true }]);
    expect(h.answers()[0]!.text.length).toBeLessThanOrEqual(200);
  });

  it('« Converti » on an order (pre-registration) or a trial: refused, no order number, no e-mail', async () => {
    for (const kind of ['launch_waitlist', 'trial_request'] as const) {
      vi.resetModules();
      const h = await botHarness(kind);
      await h.click('convert');
      expect(h.rpc, kind).not.toHaveBeenCalledWith('ops_apply', expect.anything());
      expect(h.rpc, kind).not.toHaveBeenCalledWith('ops_invoice', expect.anything());
      expect(h.send, kind).not.toHaveBeenCalled();
      expect(h.answers()[0]!.text, kind).toMatch(/^⛔ Prélancement/);
    }
  });

  it('actions that send no customer e-mail still work (« Contacté » on a pre-registration)', async () => {
    const h = await botHarness('launch_waitlist');
    await h.click('contact');
    expect(h.rpc).toHaveBeenCalledWith('ops_apply', expect.objectContaining({ p_action: 'contact' }));
    expect(h.send).not.toHaveBeenCalled();
    expect(h.answers()[0]!.text).toMatch(/^✅ Fait/);
  });

  it('online requests open: « Essai envoyé » applies and sends the « trial started » e-mail', async () => {
    openForms();
    const h = await botHarness('trial_request');
    await h.click('contact');
    expect(h.rpc).toHaveBeenCalledWith('ops_apply', expect.objectContaining({ p_action: 'contact' }));
    expect(h.send).toHaveBeenCalledWith('trial_started', 'alex@example.test', expect.anything());
  });

  it('actionSendsCustomerEmail covers exactly the e-mailing actions', async () => {
    const { actionSendsCustomerEmail } = await import('@/lib/telegram/ops');
    expect(actionSendsCustomerEmail('convert', 'launch_waitlist')).toBe(true);
    expect(actionSendsCustomerEmail('convert', 'trial_request')).toBe(true);
    expect(actionSendsCustomerEmail('contact', 'trial_request')).toBe(true);
    expect(actionSendsCustomerEmail('contact', 'launch_waitlist')).toBe(false);
    expect(actionSendsCustomerEmail('close', 'support')).toBe(false);
    expect(actionSendsCustomerEmail('lose', 'trial_request')).toBe(false);
  });
});

// ------------------------------------------------------------------ B11: offered terms and devices
describe('offered terms and device counts only (B11)', () => {
  it('validators accept 12 / 24 / 36 months and 1–4 devices, refuse « lifetime » and anything else', async () => {
    const { planSelectionSchema, contactSchema, checkoutSchema, OFFERED_TERMS } = await import('@/lib/validation');
    expect(OFFERED_TERMS).toEqual(['12m', '24m', '36m']);
    for (const term of ['12m', '24m', '36m']) for (const streams of [1, 2, 3, 4]) {
      expect(planSelectionSchema.safeParse({ tier: 'plus', term, streams }).success, `${term}/${streams}`).toBe(true);
    }
    for (const term of ['lifetime', '6m', '48m', '', 12]) expect(planSelectionSchema.safeParse({ tier: 'plus', term, streams: 1 }).success, String(term)).toBe(false);
    for (const streams of [0, 5, 1.5, '1']) expect(planSelectionSchema.safeParse({ tier: 'plus', term: '12m', streams }).success, String(streams)).toBe(false);
    const w = { kind: 'launch_waitlist', email: 'a@b.co', locale: 'en', consent: true, tier: 'ultra' };
    expect(contactSchema.safeParse({ ...w, term: '36m', streams: 4 }).success).toBe(true);
    expect(contactSchema.safeParse({ ...w, term: 'lifetime' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...w, streams: 5 }).success).toBe(false);
    const c = { tier: 'plus', streams: 1, email: 'a@b.co', acceptTerms: true, idempotencyKey: 'abcdefghijklmnop' };
    expect(checkoutSchema.safeParse({ ...c, term: '24m' }).success).toBe(true);
    expect(checkoutSchema.safeParse({ ...c, term: 'lifetime' }).success).toBe(false);
  });

  it('/api/quote refuses « lifetime »', async () => {
    const { POST } = await import('@/app/api/quote/route');
    const req = (term: string) =>
      new Request(`${ORIGIN}/api/quote`, {
        method: 'POST', headers: { host: 'shop.test', origin: ORIGIN, 'content-type': 'application/json', 'x-forwarded-for': '198.51.100.7' },
        body: JSON.stringify({ tier: 'ultra', term, streams: 1 }),
      });
    expect((await POST(req('lifetime'))).status).toBe(400);
    expect((await POST(req('36m'))).status).toBe(200);
  });
});

// ------------------------------------------------------------------ B9: territory gate
describe('territory gate for orders and free trials (B9)', () => {
  it('isOrderTerritoryAllowed: empty list refuses everything; listed countries only; every known country must be licensed', async () => {
    const { isOrderTerritoryAllowed } = await import('@/lib/validation');
    expect(isOrderTerritoryAllowed([], 'FR', 'FR')).toBe(false);
    expect(isOrderTerritoryAllowed([], undefined, undefined)).toBe(false);
    expect(isOrderTerritoryAllowed(['FR'], 'FR', 'FR')).toBe(true);
    expect(isOrderTerritoryAllowed(['FR'], 'FR', null)).toBe(true);
    expect(isOrderTerritoryAllowed(['FR'], undefined, 'FR')).toBe(true);
    expect(isOrderTerritoryAllowed(['FR'], 'DE', 'DE')).toBe(false);
    expect(isOrderTerritoryAllowed(['FR'], 'FR', 'DE')).toBe(false);
    expect(isOrderTerritoryAllowed(['FR'], 'DE', 'FR')).toBe(false);
    // Unknown / Tor / missing country: not verifiable, refused.
    expect(isOrderTerritoryAllowed(['FR'], undefined, 'XX')).toBe(false);
    expect(isOrderTerritoryAllowed(['FR'], undefined, 'T1')).toBe(false);
    expect(isOrderTerritoryAllowed(['FR'], null, null)).toBe(false);
  });

  async function contactRoute(licensed: string[]) {
    const insert = vi.fn(async () => ({ error: null }));
    vi.doMock('@/lib/supabase/server', () => ({ getPublicSupabase: () => ({ from: () => ({ insert }) }), getServiceSupabase: () => null }));
    vi.doMock('@/lib/email/send', () => ({ sendCustomerEmail: vi.fn(async () => 'sent') }));
    // Work scheduled after the response (Telegram card, acknowledgement e-mail) is outside this test.
    vi.doMock('next/server', async (orig) => ({ ...(await orig<typeof import('next/server')>()), after: vi.fn() }));
    vi.doMock('@/config/site', async (orig) => {
      const mod = await orig<typeof import('@/config/site')>();
      return { ...mod, siteConfig: { ...mod.siteConfig, licensedTerritories: licensed } };
    });
    const { POST } = await import('@/app/api/contact/route');
    let ip = 10;
    const send = (body: Record<string, unknown>, country?: string) =>
      POST(
        new Request(`${ORIGIN}/api/contact`, {
          method: 'POST',
          headers: { host: 'shop.test', origin: ORIGIN, 'content-type': 'application/json', 'x-forwarded-for': `192.0.2.${ip++}`, ...(country ? { 'cf-ipcountry': country } : {}) },
          body: JSON.stringify(body),
        }),
      );
    return { insert, send };
  }
  const order = { kind: 'launch_waitlist', email: 'a@b.co', locale: 'en', consent: true, tier: 'plus', term: '12m', streams: 1 };
  const trial = { kind: 'trial_request', name: 'A', email: 'a@b.co', phone: '+14155550100', locale: 'en', consent: true };
  const support = { kind: 'support', name: 'A', email: 'a@b.co', subject: 'Help', message: 'Long enough message', locale: 'en', consent: true };

  it('forms closed (today): the 503 stays — the territory is checked only after the FEATURE_CONTACT_FORM gate', async () => {
    closeForms();
    const { insert, send } = await contactRoute(['FR']);
    for (const body of [order, trial, support]) {
      const res = await send({ ...body, country: 'FR' }, 'FR');
      expect(res.status).toBe(503);
      expect((await res.json()).error).toBe('contact_unavailable');
    }
    expect(insert).not.toHaveBeenCalled();
  });

  it('empty licensedTerritories (today): every order and trial is refused with 403 territory_not_licensed', async () => {
    openForms();
    const { insert, send } = await contactRoute([]);
    for (const body of [order, trial]) {
      const res = await send({ ...body, country: 'US' }, 'US');
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ ok: false, error: 'territory_not_licensed' });
    }
    expect(insert).not.toHaveBeenCalled();
  });

  it('support requests are not territory-gated', async () => {
    openForms();
    const { insert, send } = await contactRoute([]);
    expect((await send({ ...support, country: 'DE' }, 'DE')).status).toBe(201);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("list ['FR']: FR allowed, DE refused (form country and/or Cloudflare country)", async () => {
    openForms();
    const { insert, send } = await contactRoute(['FR']);
    expect((await send({ ...order, country: 'FR' }, 'FR')).status).toBe(201);
    expect((await send({ ...trial, country: 'FR' })).status).toBe(201);
    expect((await send(trial, 'FR')).status).toBe(201);
    expect(insert).toHaveBeenCalledTimes(3);
    for (const [country, header] of [['DE', 'DE'], ['FR', 'DE'], ['DE', 'FR'], [undefined, undefined]] as const) {
      const res = await send({ ...order, ...(country ? { country } : {}) }, header);
      expect(res.status, `${country}/${header}`).toBe(403);
      expect((await res.json()).error).toBe('territory_not_licensed');
    }
    expect(insert).toHaveBeenCalledTimes(3);
  });
});

// ------------------------------------------------------------------ A11: domain and remaining launch blockers
describe('domain confirmed (A11), the other launch blockers remain', () => {
  it('siteConfig.domain is sygmatv.com and getLaunchBlockers() keeps every other blocker', async () => {
    vi.stubEnv('SALES_ENABLED', 'false');
    const { siteConfig } = await import('@/config/site');
    const { getLaunchBlockers } = await import('@/config/launch-gate');
    expect(siteConfig.domain).toBe('sygmatv.com');
    expect(siteConfig.licensedTerritories).toEqual([]);
    expect(getLaunchBlockers()).toEqual(['no_licensed_territory', 'payment_provider_missing', 'activation_provider_missing', 'tax_rules_missing', 'sales_flag_off']);
    // Even with the sales flag on, the other blockers keep the gate closed.
    expect(getLaunchBlockers(siteConfig, 'true')).toEqual(['no_licensed_territory', 'payment_provider_missing', 'activation_provider_missing', 'tax_rules_missing']);
  });

  it('/api/checkout stays 403 sales_disabled', async () => {
    vi.stubEnv('SALES_ENABLED', 'true');
    const { POST } = await import('@/app/api/checkout/route');
    const res = await POST(
      new Request(`${ORIGIN}/api/checkout`, {
        method: 'POST', headers: { host: 'shop.test', origin: ORIGIN, 'content-type': 'application/json' },
        body: JSON.stringify({ tier: 'plus', term: '12m', streams: 1, email: 'a@b.co', acceptTerms: true, idempotencyKey: 'abcdefghijklmnop' }),
      }),
    );
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe('sales_disabled');
    expect(json.blockers).not.toContain('domain_not_decided');
  });
});

// ------------------------------------------------------------------ B7 / C5: e-mail templates
describe('confirmation e-mails: trader identity, order details, legal links (B7) — C5 placeholders render nothing (null)', () => {
  const LINKS = ['https://sygmatv.com/legal/terms', 'https://sygmatv.com/legal/refunds', 'https://sygmatv.com/legal/privacy', 'https://sygmatv.com/legal/imprint'];

  it('order received: plan, duration, devices, quoted price with currency, seller, documents, support e-mail — no tax amount', async () => {
    const { renderEmail } = await import('@/lib/email/templates');
    const m = renderEmail('preregistration_received', { tier: 'plus', term: '24m', streams: 2, quote: { amountMinor: 12900, currency: 'USD' } });
    expect(m.text).toContain('Plan: Plus\nDuration: 24 months\nDevices: 2 devices\nPlan price (quoted): $129.00 USD');
    expect(m.text).toContain('Seller\nSygma TV LLC\n1209 Mountain Road Pl NE, Ste H, Albuquerque, NM 87110, United States\nEmail: support@sygmatv.com');
    for (const l of LINKS) {
      expect(m.html).toContain(`href="${l}"`);
      expect(m.text).toContain(l);
    }
    expect(m.html).toContain('mailto:support@sygmatv.com');
    expect(m.html + m.text).not.toMatch(/\btax(es)?\b|\bVAT\b/i);
  });

  it('« Converti »: order number, plan details, plan price, seller block and documents', async () => {
    const { renderEmail } = await import('@/lib/email/templates');
    const m = renderEmail('request_confirmed', {
      tier: 'ultra', term: '36m', streams: 4, invoice: { number: 'SYG-2026-0009', issuedAt: '2026-11-24T10:00:00Z', amountMinor: 29900, currency: 'USD' },
    });
    expect(m.text).toContain('Order Number: SYG-2026-0009\nPlan: Ultra+\nDuration: 36 months\nDevices: 4 devices\nPlan price: $299.00 USD');
    expect(m.html).toContain('Sygma TV LLC');
    for (const l of LINKS) expect(m.html).toContain(`href="${l}"`);
    expect(m.html + m.text).not.toMatch(/\btax(es)?\b|\bVAT\b/i);
  });

  it('every e-mail carries the trader identity and the legal links in its footer', async () => {
    const { renderEmail } = await import('@/lib/email/templates');
    for (const kind of ['trial_received', 'trial_started', 'trial_followup', 'preregistration_received', 'request_confirmed', 'review_invite'] as const) {
      const m = renderEmail(kind, {});
      expect(m.html, kind).toContain('SYGMA TV+ is operated by Sygma TV LLC, 1209 Mountain Road Pl NE, Ste H, Albuquerque, NM 87110, United States.');
      expect(m.text, kind).toContain('SYGMA TV+ is operated by Sygma TV LLC');
      for (const l of LINKS) expect(m.html, `${kind} ${l}`).toContain(`href="${l}"`);
    }
  });

  it('C5 placeholders are null in siteConfig and render nothing; once provided they appear', async () => {
    const { siteConfig } = await import('@/config/site');
    const { renderEmail, traderLines } = await import('@/lib/email/templates');
    expect([siteConfig.registrationNumber, siteConfig.stateOfRegistration, siteConfig.vatId, siteConfig.representativeEU]).toEqual([null, null, null, null]);
    expect(traderLines()).toEqual([siteConfig.legalEntity, siteConfig.legalAddress]);
    for (const kind of ['preregistration_received', 'request_confirmed', 'trial_received'] as const) {
      const m = renderEmail(kind, { tier: 'plus', term: '12m', streams: 1 });
      expect(m.html + m.text, kind).not.toMatch(/Registration no\.|VAT ID|representative|null|undefined/i);
    }
    // Rendering logic with values (test data only, never a real company detail).
    const sample = { legalEntity: 'Example LLC', legalAddress: '1 Test St', registrationNumber: 'TEST-1', stateOfRegistration: 'Test State', vatId: 'TEST-VAT', representativeEU: 'Test Rep' };
    expect(traderLines(sample)).toEqual(['Example LLC', '1 Test St', 'Registration no. TEST-1 (Test State)', 'VAT ID TEST-VAT', 'EU/UK representative: Test Rep']);
    expect(traderLines({ ...sample, legalEntity: null, legalAddress: null, registrationNumber: null, vatId: null, representativeEU: null })).toEqual([]);
  });
});
