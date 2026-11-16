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
  it('order received (owner text): plan, WhatsApp, signature', () => {
    const m = renderEmail('preregistration_received', { tier: 'ultra', term: '12m', streams: 1, phone: '+212600000000' });
    expect(m.subject).toBe('Your order has been received! — SYGMA TV+');
    expect(m.html).toContain('Thank you for choosing SYGMA TV+!');
    expect(m.html).toContain('Ultra+ · 12 months · 1 device');
    expect(m.html).toContain('Please keep an eye on your WhatsApp messages.');
    expect(m.html).toContain('One World. Endless Entertainment.');
    expect(m.text).toContain('Your plan: Ultra+ · 12 months · 1 device');
  });
  it('« Converti » (owner text): subscription active, order number, amount paid, support contacts', () => {
    const m = renderEmail('request_confirmed', {
      name: 'Sara Alaoui', email: 'sara@example.test', tier: 'ultra', term: '12m', streams: 1,
      invoice: { number: 'SYG-2026-0001', issuedAt: '2026-11-15T10:00:00Z', amountMinor: 9900, currency: 'USD' },
    });
    expect(m.subject).toBe('Your SYGMA TV+ Subscription Is Now Active!');
    expect(m.html).toContain('Your subscription is now active!');
    expect(m.html).toContain('Hello Sara,');
    for (const t of ['SYG-2026-0001', 'Ultra+', '12 months', '1 device', '$99.00 USD', 'Paid', 'Active', '+44 7412 857594', 'Thank you for your trust!']) {
      expect(m.html).toContain(t);
    }
    expect(m.text).toContain('Amount Paid: $99.00 USD');
    expect(m.text).toContain('Order Number: SYG-2026-0001');
  });
  it('« Converti » without a plan: no amount line', () => {
    const m = renderEmail('request_confirmed', { invoice: { number: 'SYG-2026-0002', issuedAt: '2026-11-15T10:00:00Z' } });
    expect(m.html).toContain('SYG-2026-0002');
    expect(m.html).not.toContain('Amount Paid');
    expect(m.html).toContain('Hello,');
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
    expect(body.htmlContent).toContain('Your subscription is now active!');
  });
  it('reports a failure without throwing', async () => {
    vi.stubEnv('BREVO_API_KEY', 'xkeysib-test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('no', { status: 401 })));
    expect(await sendCustomerEmail('trial_received', 'a@b.co', {})).toBe('failed');
  });
});

describe('trial e-mails (activation and 24 h follow-up)', () => {
  it('trial started: WhatsApp, trial length, support contacts — no plans', () => {
    const m = renderEmail('trial_started', { name: 'Sara', phone: '+212600000000', trialDuration: '24 hours' });
    expect(m.subject).toBe('Your SYGMA TV+ trial is active — enjoy!');
    expect(m.html).toContain('<b>WhatsApp</b> at <b>+212600000000</b>');
    expect(m.html).toContain('24 hours');
    expect(m.html).toContain('+44 7412 857594');
    expect(m.html).not.toMatch(/per year|See the plans/);
  });
  it('trial follow-up: the three plans in their colours and a link to the plans', () => {
    const plans = [
      { name: 'Starter', tagline: 'a', price: '$59', highlights: ['x'], color: '#19d3f3', image: 'https://sygmatv.com/images/email/plan-starter.jpg' },
      { name: 'Plus', tagline: 'b', price: '$69', highlights: ['y'], color: '#d1fe17', image: 'https://sygmatv.com/images/email/plan-plus.jpg', recommended: true },
      { name: 'Ultra+', tagline: 'c', price: '$99', highlights: ['z'], color: '#f044c4', image: 'https://sygmatv.com/images/email/plan-ultra.jpg' },
    ];
    const m = renderEmail('trial_followup', { name: 'Sara', plans });
    expect(m.subject).toBe('How was your SYGMA TV+ trial?');
    for (const t of ['$59', '$69', '$99', 'RECOMMENDED', 'border:2px solid #f044c4', 'https://sygmatv.com/#plans', 'Choose my plan']) expect(m.html).toContain(t);
    expect(m.text).toContain('Plus (recommended) — $69 / year');
  });
});
