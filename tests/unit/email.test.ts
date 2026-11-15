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
  it('pre-registration: plan recap and no payment', () => {
    const m = renderEmail('preregistration_received', { tier: 'ultra', term: '24m', streams: 2 });
    expect(m.html).toContain('Ultra+ · 24 months · 2 devices');
    expect(m.text).toContain('Payment: None today');
    expect(m.html).toContain('Hello,');
  });
  it('confirmation (Converti): plan, no invoice and no amount', () => {
    const m = renderEmail('request_confirmed', { name: 'Sara', tier: 'plus', term: '12m', streams: 1, phone: '+212600000000' });
    expect(m.subject).toBe('Your request is confirmed — SYGMA TV+');
    expect(m.html).toContain('Plus · 12 months · 1 device');
    expect(m.html).not.toMatch(/invoice|\$\d/i);
  });
  it('never puts free text that is not a plain first name in the e-mail', () => {
    expect(greetingName('Élodie Durand')).toBe('Élodie');
    expect(greetingName('http://spam.example')).toBeNull();
    expect(greetingName('<b>x</b>')).toBeNull();
    expect(renderEmail('trial_received', { name: 'www.win-prize.example' }).html).not.toContain('win-prize');
  });
});

describe('sending through Resend', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
  it('does nothing without the API key', async () => {
    vi.stubEnv('RESEND_API_KEY', '');
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    expect(await sendCustomerEmail('trial_received', 'a@b.co', {})).toBe('not_configured');
    expect(f).not.toHaveBeenCalled();
  });
  it('sends from support@sygmatv.com with reply-to and idempotency key', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const f = vi.fn().mockResolvedValue(new Response('{"id":"1"}', { status: 200 }));
    vi.stubGlobal('fetch', f);
    expect(await sendCustomerEmail('request_confirmed', 'a@b.co', {}, 'confirmed-1')).toBe('sent');
    const [url, init] = f.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse(String(init.body));
    expect(body).toMatchObject({ from: 'SYGMA TV+ <support@sygmatv.com>', to: ['a@b.co'], reply_to: 'support@sygmatv.com' });
    expect((init.headers as Record<string, string>)['idempotency-key']).toBe('confirmed-1');
  });
  it('reports a failure without throwing', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('no', { status: 422 })));
    expect(await sendCustomerEmail('trial_received', 'a@b.co', {})).toBe('failed');
  });
});
