import 'server-only';
import { getPriceTable } from '@/lib/price-source';
import { getServiceSupabase } from '@/lib/supabase/server';
import { botToken, tg } from '@/lib/telegram/api';

/**
 * Hourly health checks (called by the « Monitor » GitHub workflow through /api/cron/monitor).
 * The workflow itself checks that the public pages answer; this module checks what only the
 * production runtime can see: database, e-mail provider, Telegram bot. Results go to the
 * Telegram « alertes » topic: an alert every hour while something is wrong, and a short
 * « all good » summary once a day.
 */
export interface Check {
  name: string;
  ok: boolean;
  detail?: string;
}

const T = 8000;

async function checkDatabase(): Promise<Check> {
  const name = 'Base de données';
  const client = getServiceSupabase() as unknown as { rpc: (fn: string) => PromiseLike<{ error: { message: string } | null }> } | null;
  if (!client) return { name, ok: false, detail: 'clé de service absente' };
  try {
    const { error } = await client.rpc('ops_get_settings');
    if (error) return { name, ok: false, detail: 'requête refusée' };
    const { source } = await getPriceTable();
    if (source !== 'database') return { name, ok: false, detail: 'les prix viennent de la liste de secours' };
    return { name, ok: true };
  } catch {
    return { name, ok: false, detail: 'injoignable' };
  }
}

interface BrevoAccount {
  plan?: { type?: string; creditsType?: string; credits?: number }[];
}

async function checkEmail(): Promise<Check> {
  const name = 'E-mails';
  const key = process.env.BREVO_API_KEY;
  if (!key) return { name, ok: false, detail: 'clé d’envoi absente' };
  const headers = { 'api-key': key, accept: 'application/json' };
  try {
    const res = await fetch('https://api.brevo.com/v3/account', { headers, signal: AbortSignal.timeout(T) });
    if (res.status === 401 || res.status === 403) return { name, ok: false, detail: `clé d’envoi refusée (HTTP ${res.status}) — expirée ou adresse IP non autorisée` };
    if (!res.ok) return { name, ok: false, detail: `service d’envoi en erreur (HTTP ${res.status})` };
    const acc = (await res.json()) as BrevoAccount;
    const daily = acc.plan?.find((p) => p.creditsType === 'sendLimit' && typeof p.credits === 'number');
    if (daily && (daily.credits ?? 0) < 20) return { name, ok: false, detail: `presque plus de crédits d’envoi (${daily.credits} restants)` };

    const rep = await fetch('https://api.brevo.com/v3/smtp/statistics/aggregatedReport?days=1', { headers, signal: AbortSignal.timeout(T) });
    if (rep.ok) {
      const r = (await rep.json()) as { requests?: number; blocked?: number };
      if ((r.blocked ?? 0) >= 3) return { name, ok: false, detail: `${r.blocked} e-mails bloqués sur ${r.requests ?? '?'} en 24 h` };
    }
    return { name, ok: true };
  } catch {
    return { name, ok: false, detail: 'service d’envoi injoignable' };
  }
}

interface WebhookInfo {
  url?: string;
  pending_update_count?: number;
  last_error_date?: number;
  last_error_message?: string;
}

async function checkBot(): Promise<Check> {
  const name = 'Bot Telegram';
  if (!botToken()) return { name, ok: false, detail: 'jeton absent' };
  const info = await tg<WebhookInfo>('getWebhookInfo', {});
  if (!info) return { name, ok: false, detail: 'Telegram injoignable' };
  if (!info.url?.endsWith('/api/telegram/webhook')) return { name, ok: false, detail: 'webhook non enregistré' };
  const recentError = info.last_error_date && Date.now() / 1000 - info.last_error_date < 2 * 3600;
  if (recentError) return { name, ok: false, detail: `erreurs récentes (${info.last_error_message ?? 'inconnue'})` };
  if ((info.pending_update_count ?? 0) > 50) return { name, ok: false, detail: `${info.pending_update_count} clics en attente` };
  return { name, ok: true };
}

export async function runChecks(): Promise<Check[]> {
  return Promise.all([checkDatabase(), checkEmail(), checkBot()]);
}

/** Telegram text for a list of checks (HTML). */
export function formatChecks(checks: Check[], siteOk = true): string {
  const lines = [`${siteOk ? '✅' : '❌'} Site`, ...checks.map((c) => `${c.ok ? '✅' : '❌'} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`)];
  const bad = !siteOk || checks.some((c) => !c.ok);
  return bad
    ? `🚨 <b>Alerte surveillance</b>\n${lines.join('\n')}\n\n<i>Message répété chaque heure tant que le problème dure.</i>`
    : `🟢 <b>Surveillance : tout fonctionne</b>\n${lines.join('\n')}`;
}

/** Hour (0-23) in the bot's time zone. */
export function localHour(timezone: string, now = new Date()): number {
  try {
    return Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: timezone }).format(now));
  } catch {
    return now.getUTCHours();
  }
}
