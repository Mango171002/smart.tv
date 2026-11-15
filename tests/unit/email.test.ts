import { afterEach, describe, expect, it, vi } from 'vitest';
import { greetingName, renderEmail } from '@/lib/email/templates';
import { sendCustomerEmail } from '@/lib/email/send';

describe('customer e-mail templates', () => {
  it('trial request: WhatsApp contact with the customer’s number', () => {
    const m = renderEmail('trial_received', { name: 'Alex Martin', phone: '+33612345678' });
    expect(m.subject).toContain('trial request');
    expect(m.html).toContain('Hello Alex,');
    expect(m.html).toContain('<b>WhatsApp</b> at <b>+33612345678</b>');
    expect(m.text).toContain('activation steps');
  });
  it('order received: plan recap and WhatsApp contact', () => {
    const m = renderEmail('preregistration_received', { tier: 'ultra', term: '24m', streams: 2, phone: '+212600000000' });
    expect(m.subject).toBe('We received your order — SYGMA TV+');
    expect(m.html).toContain('Ultra+ · 24 months · 2 devices');
    expect(m.html).toContain('<b>WhatsApp</b> at <b>+212600000000</b>');
    expect(m.html).toContain('Hello,');
  });
  it('« Converti » with a plan: thank-you + invoice (number, date, billed to, total, taxes 0)', () => {
    const m = renderEmail('request_confirmed', {
      name: 'Sara Alaoui', email: 'sara@example.test', phone: '+212600000000', tier: 'plus', term: '12m', streams: 1,
      invoice: { number: 'SYG-2026-0001', issuedAt: '2026-11-15T10:00:00Z', amountMinor: 6900, currency: 'USD' },
    });
    expect(m.subject).toBe('Thank you for your order — invoice SYG-2026-0001 — SYGMA TV+');
    expect(m.html).toContain('SYG-2026-0001');
    expect(m.html).toContain('15 November 2026');
    expect(m.html).toContain('Sara Alaoui<br>sara@example.test<br>+212600000000');
    expect(m.html).toContain('Plus · 12 months · 1 device');
    expect(m.html).toContain('$69.00 USD');
    expect(m.html).toContain('$0.00 USD');
    expect(m.text).toContain('Total: $69.00 USD');
  });
  it('« Converti » without a plan: thank-you without invoice', () => {
    const m = renderEmail('request_confirmed', { name: 'Sara', phone: '+212600000000' });
    expect(m.subject).toBe('Your order is confirmed — SYGMA TV+');
    expect(m.html).not.toContain('Invoice');
  });
  it('never puts free text that is not a plain first name in the e-mail', () => {
    expect(greetingName('Élodie Durand')).toBe('Élodie');
    expect(greetingName('http://spam.example')).toBeNull();
    expect(greetingName('<b>x</b>')).toBeNull();
    expect(renderEmail('trial_received', { name: 'www.win-prize.example' }).html).not.toContain('win-prize');
  });
});

describe('sending through Brevo', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it('does nothing without the API key', async () => {
    vi.stubEnv('BREVO_API_KEY', '');
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect(await sendCustomerEmail('trial_received', 'a@b.co', {})).toBe('not_configured');
    expect(f).not.toHaveBeenCalled();
  });
  it('sends from support@sygmatv.com with reply-to support', async () => {
    vi.stubEnv('BREVO_API_KEY', 'xkeysib-test');
    const f = vi.fn().mockResolvedValue(new Response('{"messageId":"1"}', { status: 201 }));
    vi.stubGlobal('fetch', f);
    expect(await sendCustomerEmail('request_confirmed', 'a@b.co', {})).toBe('sent');
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.brevo.com/v3/smtp/email');
    expect((init.headers as Record<string, string>)['api-key']).toBe('xkeysib-test');
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ sender: { email: 'support@sygmatv.com' }, to: [{ email: 'a@b.co' }], replyTo: { email: 'support@sygmatv.com' } });
    expect(body.htmlContent).toContain('Thank you for choosing SYGMA TV+');
  });
  it('reports a failure without throwing', async () => {
    vi.stubEnv('BREVO_API_KEY', 'xkeysib-test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('no', { status: 401 })));
    expect(await sendCustomerEmail('trial_received', 'a@b.co', {})).toBe('failed');
  });
});
