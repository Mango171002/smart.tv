import { renderEmail, type EmailData, type EmailKind } from './templates';

/**
 * Sends a customer e-mail through Brevo (transactional API, https://developers.brevo.com),
 * from support@sygmatv.com. The API key is a server-only secret (BREVO_API_KEY, set by the
 * deploy workflow); without it nothing is sent.
 */
export type SendResult = 'sent' | 'not_configured' | 'failed';

const SENDER = { name: 'SYGMA TV+', email: 'support@sygmatv.com' };

export function emailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export async function sendCustomerEmail(kind: EmailKind, to: string, data: EmailData): Promise<SendResult> {
  const key = process.env.BREVO_API_KEY;
  if (!key) return 'not_configured';
  const { subject, html, text } = renderEmail(kind, data);
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': key, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: SENDER,
        to: [{ email: to }],
        replyTo: { email: SENDER.email, name: SENDER.name },
        subject,
        htmlContent: html,
        textContent: text,
        tags: [kind],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.warn('[email] brevo', res.status);
      return 'failed';
    }
    return 'sent';
  } catch (e) {
    console.warn('[email] brevo', (e as Error).message);
    return 'failed';
  }
}
