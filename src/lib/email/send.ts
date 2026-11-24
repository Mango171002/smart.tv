import { areCustomerEmailsEnabled } from '@/lib/features';
import { renderEmail, type EmailData, type EmailKind } from './templates';

/**
 * Sends a customer e-mail through Brevo (transactional API, https://developers.brevo.com),
 * from support@sygmatv.com. The API key is a server-only secret (BREVO_API_KEY, set by the
 * deploy workflow); without it nothing is sent.
 */
export type SendResult = 'sent' | 'not_configured' | 'failed' | 'prelaunch_blocked';

const SENDER = { name: 'SYGMA TV+', email: 'support@sygmatv.com' };
/** The team's own mailbox: the only recipient allowed while online requests are closed (bot /testemail). */
export const TEAM_MAILBOX = SENDER.email;

export function emailConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export async function sendCustomerEmail(kind: EmailKind, to: string, data: EmailData): Promise<SendResult> {
  // Prelaunch (A6 / B11): never e-mail a customer while online requests are closed — defence in depth behind the
  // guards of the Telegram bot and the scheduled route.
  if (!areCustomerEmailsEnabled() && to.trim().toLowerCase() !== TEAM_MAILBOX) return 'prelaunch_blocked';
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
