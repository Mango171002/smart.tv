import { renderEmail, type EmailData, type EmailKind } from './templates';

/**
 * Sends a customer e-mail through Resend (https://resend.com), from support@sygmatv.com.
 * The API key is a server-only secret (RESEND_API_KEY, set by the deploy workflow);
 * without it nothing is sent.
 */
export type SendResult = 'sent' | 'not_configured' | 'failed';

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendCustomerEmail(kind: EmailKind, to: string, data: EmailData, idempotencyKey?: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return 'not_configured';
  const { subject, html, text } = renderEmail(kind, data);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'SYGMA TV+ <support@sygmatv.com>',
        to: [to],
        reply_to: 'support@sygmatv.com',
        subject,
        html,
        text,
        tags: [{ name: 'kind', value: kind }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn('[email] resend', res.status);
      return 'failed';
    }
    return 'sent';
  } catch (e) {
    console.warn('[email] resend', (e as Error).message);
    return 'failed';
  }
}
