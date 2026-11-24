import 'server-only';

export function isContactFormEnabled(): boolean {
  return process.env.FEATURE_CONTACT_FORM === 'true' && Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}

/**
 * Prelaunch guard (A6 / B11): while online requests are closed (isContactFormEnabled() false), no e-mail is sent to a
 * customer — no trial « Essai envoyé », no « Converti » activation / payment confirmation, no scheduled follow-up or
 * review invitation. Only the team's own mailbox may receive (test) e-mails.
 */
export function areCustomerEmailsEnabled(): boolean {
  return isContactFormEnabled();
}
