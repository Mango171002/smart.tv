import 'server-only';
import { getServiceSupabase } from '@/lib/supabase/server';
import { tg } from './api';
import {
  confirmKeyboard,
  CONFIRM_TTL_S,
  decodeCallback,
  escapeHtml,
  renderCard,
  RESULT_TOAST,
  shortRef,
  STATUS_LABEL,
  type CardData,
} from './cards';

/**
 * SYGMA Operations Bot — server side. The database (RPC functions callable only with the
 * service key) is the source of truth; Telegram only displays cards and forwards clicks.
 */

type Settings = Record<string, unknown>;
// The ops_* RPC functions are not in the generated types: call them untyped.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = { rpc: (fn: string, args?: Record<string, unknown>) => PromiseLike<{ data: any; error: { message: string } | null }> };

function db(): Db | null {
  return getServiceSupabase() as unknown as Db | null;
}

/** Set when the last database call failed (missing or wrong service key, network…). */
let dbDown = false;

async function call<T>(fn: string, args: Record<string, unknown> = {}): Promise<T | null> {
  const client = db();
  if (!client) {
    dbDown = true;
    return null;
  }
  const { data, error } = await client.rpc(fn, args);
  if (error) {
    dbDown = true;
    console.warn('[ops]', fn, error.message);
    return null;
  }
  dbDown = false;
  return data as T;
}

const DB_DOWN = '⚠️ Le bot n’arrive pas à joindre la base de données (clé Supabase manquante ou invalide).';

const TOPICS = ['commandes', 'paiements', 'livraisons', 'support', 'alertes'] as const;
type Topic = (typeof TOPICS)[number];

function tz(s: Settings): string {
  return typeof s.timezone === 'string' ? s.timezone : 'Europe/London';
}

// ---------------------------------------------------------------- new request → live card
export interface NotifyOptions {
  /** The same e-mail pre-registered again (the website keeps a single row per e-mail). */
  repeat?: boolean;
  /** Plan chosen this time, shown on the repeat notice. */
  planLabel?: string | null;
}

export async function notifyNewRequest(
  kind: 'launch_waitlist' | 'trial_request' | 'support',
  email: string,
  opts: NotifyOptions = {},
): Promise<void> {
  const settings = await call<Settings>('ops_get_settings');
  if (!settings || typeof settings.chat_id !== 'number') return; // bot not configured yet
  const requestId = await call<string>(opts.repeat ? 'ops_find_request_any' : 'ops_find_request', { p_kind: kind, p_email: email });
  if (!requestId) return;
  const data = await call<CardData>('ops_card_open', { p_request: requestId });
  if (!data) return;
  const topic: Topic = kind === 'support' ? 'support' : 'commandes';
  const thread = typeof settings[`thread_${topic}`] === 'number' ? (settings[`thread_${topic}`] as number) : undefined;
  const notice = opts.repeat
    ? `🔁 <b>Nouvelle pré-inscription de la même personne</b>${opts.planLabel ? ` · ${escapeHtml(opts.planLabel)}` : ''}`
    : null;

  if (data.card.message_id && data.card.chat_id) {
    // Card already in the group: answer it so the team sees the new attempt in context.
    if (notice) {
      await tg('sendMessage', {
        chat_id: data.card.chat_id,
        message_thread_id: data.card.thread_id ?? undefined,
        text: notice,
        parse_mode: 'HTML',
        reply_parameters: { message_id: data.card.message_id, allow_sending_without_reply: true },
      });
    }
    return;
  }
  const view = renderCard(data, tz(settings));
  const sent = await tg<{ message_id: number }>('sendMessage', {
    chat_id: settings.chat_id,
    message_thread_id: thread,
    text: notice ? `${notice}\n\n${view.text}` : view.text,
    parse_mode: 'HTML',
    reply_markup: view.reply_markup,
    link_preview_options: { is_disabled: true },
  });
  if (sent) await call('ops_card_attach', { p_request: requestId, p_chat: settings.chat_id, p_thread: thread ?? null, p_message: sent.message_id });
}

// ---------------------------------------------------------------- webhook updates
interface TgUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}
interface TgMessage {
  message_id: number;
  message_thread_id?: number;
  is_topic_message?: boolean;
  chat: { id: number; type: string };
  from?: TgUser;
  text?: string;
}
interface TgCallback {
  id: string;
  from: TgUser;
  data?: string;
  message?: TgMessage;
}
export interface TgUpdate {
  update_id: number;
  message?: TgMessage;
  callback_query?: TgCallback;
}

function displayName(u: TgUser): string {
  return [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || String(u.id);
}

async function reply(m: TgMessage, text: string) {
  await tg('sendMessage', {
    chat_id: m.chat.id,
    message_thread_id: m.is_topic_message ? m.message_thread_id : undefined,
    text,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  });
}

function messageLink(chatId: number, messageId: number): string {
  return `https://t.me/c/${String(chatId).replace(/^-100/, '')}/${messageId}`;
}

const HELP = [
  '<b>SYGMA Operations Bot</b>',
  '/id — votre identifiant Telegram',
  '/setup &lt;sujet&gt; — à écrire dans chaque sujet (commandes, paiements, livraisons, support, alertes)',
  '/attente — demandes en attente',
  '/stats — activité des dernières 24 h',
  '/addadmin &lt;id&gt; &lt;admin|vendeur&gt; &lt;nom&gt; — ajouter un membre (admin)',
  '/removeadmin &lt;id&gt; — retirer un membre (admin)',
].join('\n');

async function handleCommand(m: TgMessage) {
  const text = (m.text ?? '').trim();
  const [rawCmd, ...args] = text.split(/\s+/);
  const cmd = (rawCmd ?? '').toLowerCase().replace(/@.*$/, '');
  const from = m.from;
  if (!from) return;

  if (cmd === '/id' || cmd === '/start') {
    await reply(m, `Votre identifiant Telegram : <code>${from.id}</code>\nGroupe : <code>${m.chat.id}</code>${m.message_thread_id ? `\nSujet : <code>${m.message_thread_id}</code>` : ''}`);
    return;
  }
  if (cmd === '/aide' || cmd === '/help') {
    await reply(m, HELP);
    return;
  }

  const role = await call<string | null>('ops_actor_role', { p_actor: from.id });
  if (!role) {
    await reply(m, dbDown ? DB_DOWN : '⛔ Non autorisé.');
    return;
  }
  const settings = (await call<Settings>('ops_get_settings')) ?? {};

  if (cmd === '/setup') {
    const topic = (args[0] ?? '').toLowerCase() as Topic;
    if (!TOPICS.includes(topic) || m.chat.type === 'private') {
      await reply(m, `Utilisation : <code>/setup commandes</code> dans le sujet concerné (${TOPICS.join(', ')}).`);
      return;
    }
    const res = await call<{ ok: boolean; code?: string }>('ops_set_topic', {
      p_actor: from.id,
      p_topic: topic,
      p_chat: m.chat.id,
      p_thread: m.message_thread_id ?? null,
    });
    const inTopic = Boolean(m.is_topic_message && m.message_thread_id);
    await reply(
      m,
      res?.ok
        ? inTopic
          ? `✅ Sujet « ${topic} » enregistré : les fiches « ${topic} » arriveront ici.`
          : `✅ « ${topic} » enregistré dans la discussion générale du groupe.\nPour un sujet séparé : activez les « Sujets » du groupe (Paramètres → Sujets), créez le sujet, puis écrivez <code>/setup ${topic}</code> à l’intérieur.`
        : res?.code === 'forbidden'
          ? '⛔ Réservé aux admins.'
          : dbDown
            ? DB_DOWN
            : '⚠️ Échec, réessayez.',
    );
    return;
  }
  if (cmd === '/attente') {
    const list = (await call<Array<{ id: string; kind: string; name: string | null; email: string; status: string; chat_id: number | null; message_id: number | null }>>('ops_pending', { p_limit: 20 })) ?? [];
    if (!list.length) {
      await reply(m, '✅ Rien en attente.');
      return;
    }
    const rows = list.map((x) => {
      const label = `#${shortRef(x.id)} · ${escapeHtml(x.name ?? x.email)} · ${STATUS_LABEL[x.status] ?? x.status}`;
      return x.chat_id && x.message_id ? `• <a href="${messageLink(x.chat_id, x.message_id)}">${label}</a>` : `• ${label}`;
    });
    await reply(m, `<b>En attente (${list.length})</b>\n${rows.join('\n')}`);
    return;
  }
  if (cmd === '/stats') {
    const s = await call<Record<string, number>>('ops_stats', { p_since: new Date(Date.now() - 86_400_000).toISOString() });
    if (!s) return;
    await reply(
      m,
      `<b>Dernières 24 h</b>\n📝 Pré-inscriptions : ${s.waitlist}\n🎁 Demandes d’essai : ${s.trials}\n🛟 Tickets support : ${s.support}\n📞 Contactés : ${s.contacted}\n🎉 Convertis : ${s.converted}\n⏳ En attente (total) : ${s.pending}`,
    );
    return;
  }
  if (cmd === '/addadmin') {
    const [id, roleArg, ...nameParts] = args;
    const roleMap: Record<string, string> = { admin: 'admin', vendeur: 'seller', seller: 'seller' };
    if (!id || !/^\d{3,15}$/.test(id) || !roleArg || !roleMap[roleArg.toLowerCase()] || !nameParts.length) {
      await reply(m, 'Utilisation : <code>/addadmin 123456789 vendeur Sara</code>');
      return;
    }
    const res = await call<{ ok: boolean; code?: string }>('ops_add_admin', {
      p_actor: from.id,
      p_id: Number(id),
      p_role: roleMap[roleArg.toLowerCase()],
      p_name: nameParts.join(' '),
    });
    await reply(m, res?.ok ? `✅ ${escapeHtml(nameParts.join(' '))} ajouté (${roleArg}).` : '⛔ Réservé aux admins.');
    return;
  }
  if (cmd === '/removeadmin') {
    const id = args[0];
    if (!id || !/^\d{3,15}$/.test(id)) {
      await reply(m, 'Utilisation : <code>/removeadmin 123456789</code>');
      return;
    }
    const res = await call<{ ok: boolean; code?: string }>('ops_remove_admin', { p_actor: from.id, p_id: Number(id) });
    await reply(m, res?.ok ? '✅ Membre retiré.' : res?.code === 'cannot_remove_self' ? 'Vous ne pouvez pas vous retirer vous-même.' : '⛔ Réservé aux admins.');
    return;
  }
  void settings;
}

async function editCard(chatId: number, messageId: number, data: CardData, settings: Settings) {
  const view = renderCard(data, tz(settings));
  await tg('editMessageText', {
    chat_id: chatId,
    message_id: messageId,
    text: view.text,
    parse_mode: 'HTML',
    reply_markup: view.reply_markup,
    link_preview_options: { is_disabled: true },
  });
}

async function handleCallback(q: TgCallback) {
  const answer = async (text: string, alert = false): Promise<void> => {
    await tg('answerCallbackQuery', { callback_query_id: q.id, text, show_alert: alert });
  };
  const c = q.data ? decodeCallback(q.data) : null;
  const msg = q.message;
  if (!c || !msg) return answer('Bouton invalide');

  const role = await call<string | null>('ops_actor_role', { p_actor: q.from.id });
  if (!role) return answer(dbDown ? DB_DOWN : '⛔ Non autorisé', true);
  const settings = (await call<Settings>('ops_get_settings')) ?? {};
  const nowS = Math.floor(Date.now() / 1000);

  if (c.op === 'q') {
    await tg('editMessageReplyMarkup', { chat_id: msg.chat.id, message_id: msg.message_id, reply_markup: confirmKeyboard(c, nowS) });
    return answer(`Confirmez dans les ${CONFIRM_TTL_S} secondes`);
  }
  if (c.op === 'x') {
    const data = await call<CardData>('ops_card_get', { p_request: c.requestId });
    if (data) await editCard(msg.chat.id, msg.message_id, data, settings);
    return answer('Annulé, rien n’a changé');
  }
  if (c.ts !== undefined && nowS - c.ts > CONFIRM_TTL_S) {
    const data = await call<CardData>('ops_card_get', { p_request: c.requestId });
    if (data) await editCard(msg.chat.id, msg.message_id, data, settings);
    return answer('Confirmation expirée, recommencez', true);
  }
  const res = await call<{ ok: boolean; code?: string; card?: CardData }>('ops_apply', {
    p_request: c.requestId,
    p_version: c.version,
    p_action: c.action,
    p_actor: q.from.id,
    p_actor_name: displayName(q.from),
    p_reason: null,
  });
  if (!res) return answer('Erreur, réessayez', true);
  if (res.card) await editCard(msg.chat.id, msg.message_id, res.card, settings);
  const toast = res.ok ? '✅ Fait' : (RESULT_TOAST[res.code ?? ''] ?? 'Action impossible');
  await answer(toast, !res.ok && res.code !== 'stale');

  // Silent one-line journal in the "alertes" topic for every successful action.
  if (res.ok && res.card && typeof settings.chat_id === 'number' && typeof settings.thread_alertes === 'number') {
    const r = res.card.request;
    await tg('sendMessage', {
      chat_id: settings.chat_id,
      message_thread_id: settings.thread_alertes,
      text: `#${shortRef(r.id)} · ${escapeHtml(displayName(q.from))} · ${c.action === 'undo' ? '↩️ annulation' : c.action} → <b>${STATUS_LABEL[res.card.card.status] ?? res.card.card.status}</b>`,
      parse_mode: 'HTML',
      disable_notification: true,
    });
  }
}

export async function handleUpdate(update: TgUpdate): Promise<void> {
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }
  const m = update.message;
  if (m?.text?.startsWith('/')) await handleCommand(m);
}
