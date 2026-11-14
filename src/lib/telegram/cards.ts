/**
 * Live "cards" of the SYGMA Operations Bot: one Telegram message per request, edited in place.
 * Pure functions (no I/O) so they can be unit-tested.
 */

export type Flow = 'lead' | 'support';
export type Action = 'contact' | 'convert' | 'lose' | 'reopen' | 'answer' | 'close' | 'undo';

export interface CardEvent {
  id: number;
  action: 'create' | Action;
  from_status: string | null;
  to_status: string;
  actor_name: string | null;
  reason: string | null;
  undoes: number | null;
  created_at: string;
  undone: boolean;
}

export interface CardData {
  request: {
    id: string;
    kind: 'launch_waitlist' | 'trial_request' | 'support';
    name: string | null;
    email: string;
    phone: string | null;
    market: string | null;
    subject: string | null;
    message: string | null;
    tier: string | null;
    term: string | null;
    streams: number | null;
    device: string | null;
    marketing: boolean | null;
    created_at: string;
  };
  card: { flow: Flow; status: string; version: number; chat_id: number | null; thread_id: number | null; message_id: number | null };
  events: CardEvent[];
}

export interface InlineButton {
  text: string;
  callback_data: string;
}

/** Undo without confirmation during this window (the database enforces the same rule). */
export const UNDO_WINDOW_MS = 10 * 60_000;
/** A confirmation button expires after this delay. */
export const CONFIRM_TTL_S = 60;

export const STATUS_LABEL: Record<string, string> = {
  new: '🟡 Nouveau',
  contacted: '🔵 Contacté',
  converted: '🟢 Converti',
  lost: '⚪ Sans suite',
  open: '🟡 Ouvert',
  answered: '🔵 Répondu',
  closed: '🟢 Clôturé',
};

const ACTION_LABEL: Record<CardEvent['action'], string> = {
  create: 'Créée depuis le site',
  contact: 'Contacté',
  convert: 'Converti',
  lose: 'Sans suite',
  reopen: 'Rouverte',
  answer: 'Répondu',
  close: 'Clôturé',
  undo: 'Annulation',
};

const BUTTON_LABEL: Record<Action, string> = {
  contact: '📞 Contacté',
  convert: '🎉 Converti',
  lose: '✖️ Sans suite',
  reopen: '🔁 Rouvrir',
  answer: '💬 Répondu',
  close: '✅ Clôturer',
  undo: '↩️ Annuler la dernière action',
};

const KIND_TITLE: Record<CardData['request']['kind'], string> = {
  launch_waitlist: '📝 Pré-inscription',
  trial_request: '🎁 Demande d’essai',
  support: '🛟 Ticket support',
};

const TIER_NAME: Record<string, string> = { starter: 'Starter', plus: 'Plus', ultra: 'Ultra+' };
const TERM_NAME: Record<string, string> = { '12m': '12 mois', '24m': '24 mois', '36m': '36 mois', lifetime: 'à vie' };
const DEVICE_NAME: Record<string, string> = {
  smart_tv: 'Smart TV',
  streaming_device: 'Box / clé TV',
  mobile: 'Mobile / tablette',
  computer: 'Ordinateur',
};

/** Actions that ask for a confirmation first (heavy or hard to explain to a customer). */
export function needsConfirmation(action: Action, lastEventAt: number | null, now: number): boolean {
  if (action === 'lose' || action === 'reopen') return true;
  if (action === 'undo') return lastEventAt !== null && now - lastEventAt > UNDO_WINDOW_MS;
  return false;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function shortRef(id: string): string {
  return id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

/** The latest action that can still be undone (it produced the current status and was not undone). */
export function undoableEvent(data: CardData): CardEvent | null {
  const candidates = [...data.events].sort((a, b) => b.id - a.id).filter((e) => e.action !== 'create' && e.action !== 'undo' && !e.undone);
  const last = candidates[0];
  return last && last.to_status === data.card.status ? last : null;
}

export function availableActions(data: CardData): Action[] {
  const { flow, status } = data.card;
  const list: Action[] =
    flow === 'lead'
      ? status === 'new'
        ? ['contact', 'convert', 'lose']
        : status === 'contacted'
          ? ['convert', 'lose']
          : ['reopen']
      : status === 'open'
        ? ['answer', 'close']
        : status === 'answered'
          ? ['close']
          : ['reopen'];
  if (undoableEvent(data)) list.push('undo');
  return list;
}

// Callback data (≤ 64 bytes): "<op>:<id32>:<version>:<action>[:<ts36>]"
//   op = a (apply), q (ask for confirmation), x (cancel the confirmation)
export interface Callback {
  op: 'a' | 'q' | 'x';
  requestId: string;
  version: number;
  action: Action;
  ts?: number;
}

const ACTIONS: Action[] = ['contact', 'convert', 'lose', 'reopen', 'answer', 'close', 'undo'];

export function encodeCallback(c: Callback): string {
  const id = c.requestId.replace(/-/g, '');
  return [c.op, id, c.version, c.action, c.ts !== undefined ? c.ts.toString(36) : ''].filter((p) => p !== '').join(':');
}

export function decodeCallback(raw: string): Callback | null {
  const parts = raw.split(':');
  if (parts.length < 4 || parts.length > 5) return null;
  const [op, id, ver, action, ts] = parts;
  if (op !== 'a' && op !== 'q' && op !== 'x') return null;
  if (!id || !/^[0-9a-f]{32}$/.test(id)) return null;
  if (!ver || !/^\d{1,6}$/.test(ver)) return null;
  if (!ACTIONS.includes(action as Action)) return null;
  const requestId = `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
  const parsedTs = ts ? parseInt(ts, 36) : undefined;
  if (ts && !Number.isFinite(parsedTs)) return null;
  return { op, requestId, version: Number(ver), action: action as Action, ts: parsedTs };
}

function time(iso: string, tz: string): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: tz, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export function renderCard(data: CardData, tz: string, now = Date.now()): { text: string; reply_markup: { inline_keyboard: InlineButton[][] } } {
  const r = data.request;
  const lines: string[] = [];
  lines.push(`<b>${KIND_TITLE[r.kind]}</b> · <code>#${shortRef(r.id)}</code>`);
  lines.push(`Statut : <b>${STATUS_LABEL[data.card.status] ?? data.card.status}</b>`);
  lines.push('');
  if (r.name) lines.push(`👤 ${escapeHtml(r.name)}`);
  lines.push(`✉️ ${escapeHtml(r.email)}`);
  if (r.phone) lines.push(`📞 ${escapeHtml(r.phone)}`);
  if (r.market) lines.push(`🌍 Région : ${escapeHtml(r.market)}`);
  if (r.tier) {
    const plan = [TIER_NAME[r.tier] ?? r.tier, r.term ? (TERM_NAME[r.term] ?? r.term) : null, r.streams ? `${r.streams} appareil${r.streams > 1 ? 's' : ''}` : null]
      .filter(Boolean)
      .join(' · ');
    lines.push(`📦 Plan : ${escapeHtml(plan)}`);
  }
  if (r.device) lines.push(`📺 Appareil : ${escapeHtml(DEVICE_NAME[r.device] ?? r.device)}`);
  if (r.kind !== 'support') lines.push(`📣 Offres marketing : ${r.marketing ? 'oui' : 'non'}`);
  if (r.subject) lines.push(`🏷 ${escapeHtml(r.subject)}`);
  if (r.message) {
    const msg = r.message.length > 700 ? `${r.message.slice(0, 700)}…` : r.message;
    lines.push(`💬 ${escapeHtml(msg)}`);
  }

  const history = [...data.events].sort((a, b) => a.id - b.id).slice(-6);
  if (history.length) {
    lines.push('', '<b>Historique</b>');
    for (const e of history) {
      const who = e.actor_name && e.action !== 'create' ? ` — ${escapeHtml(e.actor_name)}` : '';
      const label =
        e.action === 'undo'
          ? `↩️ Annulé (retour à ${STATUS_LABEL[e.to_status]?.replace(/^\S+\s/, '') ?? e.to_status})`
          : ACTION_LABEL[e.action];
      const reason = e.reason ? ` · <i>${escapeHtml(e.reason)}</i>` : '';
      const struck = e.undone ? `<s>${label}</s>` : label;
      lines.push(`${time(e.created_at, tz)} · ${struck}${who}${reason}`);
    }
  }

  const actions = availableActions(data);
  const undoEvent = undoableEvent(data);
  const lastAt = undoEvent ? Date.parse(undoEvent.created_at) : null;
  const button = (a: Action): InlineButton => ({
    text: BUTTON_LABEL[a],
    callback_data: encodeCallback({
      op: needsConfirmation(a, lastAt, now) ? 'q' : 'a',
      requestId: r.id,
      version: data.card.version,
      action: a,
    }),
  });
  const main = actions.filter((a) => a !== 'undo').map(button);
  const rows: InlineButton[][] = [];
  for (let i = 0; i < main.length; i += 2) rows.push(main.slice(i, i + 2));
  if (actions.includes('undo')) rows.push([button('undo')]);
  return { text: lines.join('\n'), reply_markup: { inline_keyboard: rows } };
}

/** Keyboard shown while an action waits for confirmation. */
export function confirmKeyboard(c: Callback, nowSeconds: number): { inline_keyboard: InlineButton[][] } {
  return {
    inline_keyboard: [
      [
        { text: `⚠️ Confirmer : ${BUTTON_LABEL[c.action]}`, callback_data: encodeCallback({ ...c, op: 'a', ts: nowSeconds }) },
        { text: 'Non', callback_data: encodeCallback({ ...c, op: 'x' }) },
      ],
    ],
  };
}

export const RESULT_TOAST: Record<string, string> = {
  ok: '✅ Fait',
  forbidden: '⛔ Non autorisé',
  stale: 'Déjà traité — fiche mise à jour',
  not_allowed: 'Action impossible dans cet état',
  nothing_to_undo: 'Rien à annuler',
  admin_only: 'Après 10 min, seul un admin peut annuler',
  expired: 'Confirmation expirée, recommencez',
  not_found: 'Demande introuvable',
};
