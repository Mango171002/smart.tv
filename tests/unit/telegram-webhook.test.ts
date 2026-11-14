import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/lib/telegram/ops', () => ({ handleUpdate: vi.fn(async () => undefined) }));

const post = (headers: Record<string, string>, body = '{"update_id":1}') =>
  new Request('https://sygmatv.com/api/telegram/webhook', { method: 'POST', headers, body });

describe('POST /api/telegram/webhook', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('is disabled until the bot token is configured', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '');
    const { POST } = await import('@/app/api/telegram/webhook/route');
    expect((await POST(post({}))).status).toBe(503);
  });

  it('rejects calls without the Telegram secret header', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:abc');
    const { POST } = await import('@/app/api/telegram/webhook/route');
    expect((await POST(post({ 'x-telegram-bot-api-secret-token': 'wrong' }))).status).toBe(401);
  });

  it('accepts calls signed with the derived secret', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '123:abc');
    const { webhookSecret } = await import('@/lib/telegram/api');
    const { POST } = await import('@/app/api/telegram/webhook/route');
    const res = await POST(post({ 'x-telegram-bot-api-secret-token': await webhookSecret('123:abc') }));
    expect(res.status).toBe(200);
  });
});
