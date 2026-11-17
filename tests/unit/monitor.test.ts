import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/price-source', () => ({ getPriceTable: async () => ({ source: 'database' }) }));
vi.mock('@/lib/supabase/server', () => ({ getServiceSupabase: () => null }));

const { formatChecks, localHour } = await import('@/lib/monitor');

describe('monitoring message', () => {
  it('is an alert when one check fails, with the reason', () => {
    const text = formatChecks([
      { name: 'Base de données', ok: true },
      { name: 'E-mails', ok: false, detail: 'clé d’envoi refusée (HTTP 401)' },
    ]);
    expect(text).toContain('Alerte surveillance');
    expect(text).toContain('✅ Base de données');
    expect(text).toContain('❌ E-mails — clé d’envoi refusée (HTTP 401)');
  });

  it('is a short « all good » summary when everything works', () => {
    const text = formatChecks([{ name: 'Bot Telegram', ok: true }]);
    expect(text).toContain('tout fonctionne');
    expect(text).not.toContain('Alerte');
  });

  it('computes the hour in the bot time zone', () => {
    const now = new Date('2026-07-01T08:30:00Z');
    expect(localHour('Europe/London', now)).toBe(9);
    expect(localHour('Not/AZone', now)).toBe(8);
  });
});
