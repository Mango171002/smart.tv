import { describe, expect, it } from 'vitest';
import {
  availableActions,
  confirmKeyboard,
  decodeCallback,
  encodeCallback,
  needsConfirmation,
  renderCard,
  undoableEvent,
  type CardData,
} from '@/lib/telegram/cards';

const ID = '2a6f0c1e-3b4d-4e5f-8a9b-0c1d2e3f4a5b';
const base = (status: string, events: CardData['events'] = []): CardData => ({
  request: {
    id: ID, kind: 'trial_request', name: 'Alex <b>Martin</b>', email: 'alex@example.test', phone: '+14155550123',
    market: 'US', subject: null, message: null, tier: null, term: null, streams: null, device: null, marketing: false,
    created_at: '2026-11-14T18:00:00Z',
  },
  card: { flow: 'lead', status, version: 3, chat_id: -100123, thread_id: 7, message_id: 42 },
  events,
});
const ev = (id: number, action: CardData['events'][number]['action'], from: string | null, to: string, minutesAgo: number, undone = false) => ({
  id, action, from_status: from, to_status: to, actor_name: 'Sara', reason: null, undoes: null,
  created_at: new Date(Date.now() - minutesAgo * 60_000).toISOString(), undone,
});

describe('callback data', () => {
  it('round-trips and stays within Telegram’s 64-byte limit', () => {
    const raw = encodeCallback({ op: 'a', requestId: ID, version: 12, action: 'convert', ts: 1_800_000_000 });
    expect(raw.length).toBeLessThanOrEqual(64);
    expect(decodeCallback(raw)).toEqual({ op: 'a', requestId: ID, version: 12, action: 'convert', ts: 1_800_000_000 });
  });
  it('rejects forged or malformed data', () => {
    expect(decodeCallback('a:xyz:1:contact')).toBeNull();
    expect(decodeCallback(`a:${ID.replace(/-/g, '')}:1:delete_everything`)).toBeNull();
    expect(decodeCallback(`z:${ID.replace(/-/g, '')}:1:contact`)).toBeNull();
  });
});

describe('state machine on the card', () => {
  it('offers the right buttons per status', () => {
    expect(availableActions(base('new'))).toEqual(['contact', 'convert', 'lose']);
    expect(availableActions(base('contacted', [ev(2, 'contact', 'new', 'contacted', 1)]))).toEqual(['convert', 'lose', 'undo']);
    expect(availableActions(base('lost'))).toEqual(['reopen']);
  });
  it('only the latest, not-yet-undone action can be undone', () => {
    expect(undoableEvent(base('contacted', [ev(2, 'contact', 'new', 'contacted', 1)]))?.id).toBe(2);
    expect(undoableEvent(base('new', [ev(2, 'contact', 'new', 'contacted', 2, true), ev(3, 'undo', 'contacted', 'new', 1)]))).toBeNull();
  });
  it('asks for confirmation on heavy actions and late undos only', () => {
    const now = Date.now();
    expect(needsConfirmation('contact', null, now)).toBe(false);
    expect(needsConfirmation('lose', null, now)).toBe(true);
    expect(needsConfirmation('undo', now - 60_000, now)).toBe(false);
    expect(needsConfirmation('undo', now - 11 * 60_000, now)).toBe(true);
  });
});

describe('rendering', () => {
  it('escapes customer input and shows the history', () => {
    const view = renderCard(base('contacted', [ev(1, 'create', null, 'new', 5), ev(2, 'contact', 'new', 'contacted', 1)]), 'Europe/London');
    expect(view.text).toContain('Alex &lt;b&gt;Martin&lt;/b&gt;');
    expect(view.text).not.toContain('<b>Martin</b>');
    expect(view.text).toContain('Contacté — Sara');
    expect(view.reply_markup.inline_keyboard.flat().map((b) => b.text)).toContain('↩️ Annuler la dernière action');
  });
  it('confirmation keyboard carries a timestamp and a cancel button', () => {
    const k = confirmKeyboard({ op: 'q', requestId: ID, version: 3, action: 'lose' }, 1_800_000_000);
    const [yes, no] = k.inline_keyboard[0]!;
    expect(decodeCallback(yes!.callback_data)).toMatchObject({ op: 'a', ts: 1_800_000_000, action: 'lose' });
    expect(decodeCallback(no!.callback_data)).toMatchObject({ op: 'x' });
  });
});
