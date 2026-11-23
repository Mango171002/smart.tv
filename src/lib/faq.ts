import type { Dictionary } from '@/i18n/dictionaries';

/**
 * FAQ items of the home page. While online orders are closed (prelaunch), two answers would be wrong: « Can I subscribe
 * now? » (item 1) and « Which devices are supported? » (item 3), which invites people to ask for a free trial. They are
 * replaced by `prelaunch.faqSubscribe` and `prelaunch.faqDevices`. The visible FAQ and every other use of the home
 * dictionary read this list (src/lib/prelaunch-copy.ts), so they always match.
 */
export function faqItems(dict: Pick<Dictionary, 'faq' | 'prelaunch'>, ordersOpen: boolean): Dictionary['faq']['items'] {
  if (ordersOpen) return dict.faq.items;
  const p = dict.prelaunch;
  const closed: Record<number, string> = { 0: p.faqSubscribe, 2: p.faqDevices };
  return dict.faq.items.map((item, i) => (closed[i] ? { ...item, a: closed[i] } : item)) as Dictionary['faq']['items'];
}
