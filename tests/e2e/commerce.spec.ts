import { expect, test } from '@playwright/test';

/** Assisted ordering (owner, 20/11/2026): the order form is the sales channel; no automatic online payment. */
test.describe('assisted ordering status', () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, 'API checks: desktop project only'));

  test('/api/health: mode « assisted », automatic sales still disabled', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok', mode: 'assisted', salesEnabled: false });
  });

  test('automatic online payment stays locked (/api/checkout → 403 sales_disabled)', async ({ request, baseURL }) => {
    const res = await request.post('/api/checkout', { headers: { origin: new URL(baseURL!).origin }, data: { tier: 'plus', term: '24m', streams: 2 } });
    expect(res.status()).toBe(403);
    expect((await res.json()).error).toBe('sales_disabled');
  });
});
