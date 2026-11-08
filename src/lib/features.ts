import 'server-only';

export function isContactFormEnabled(): boolean {
  return process.env.FEATURE_CONTACT_FORM === 'true' && Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY);
}
