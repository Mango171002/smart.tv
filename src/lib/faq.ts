import type { Dictionary } from '@/i18n/dictionaries';

/**
 * FAQ items of a home page. While online orders are closed (prelaunch), three answers would be wrong: « Can I subscribe
 * now? » (item 1) and the two answers that invite people to ask for a free trial (items 2 and 3, countries and
 * devices). They are replaced by `prelaunch.faqSubscribe`, `prelaunch.faqCountries` and `prelaunch.faqDevices`. The
 * visible FAQ and the FAQPage JSON-LD both use this list, so they always match.
 */
export function faqItems(dict: Pick<Dictionary, 'faq' | 'prelaunch'>, ordersOpen: boolean): Dictionary['faq']['items'] {
  if (ordersOpen) return dict.faq.items;
  const p = dict.prelaunch;
  const closed = [p.faqSubscribe, p.faqCountries, p.faqDevices];
  return dict.faq.items.map((item, i) => (closed[i] ? { ...item, a: closed[i] } : item)) as Dictionary['faq']['items'];
}
