import type { Dictionary } from '@/i18n/dictionaries';

/**
 * FAQ items of a home page. While online orders are closed (prelaunch), the answer to the first question
 * (« Can I subscribe now? ») would be wrong, so it is replaced by `prelaunch.faqSubscribe`. The visible FAQ and the
 * FAQPage JSON-LD both use this list, so they always match.
 */
export function faqItems(dict: Pick<Dictionary, 'faq' | 'prelaunch'>, ordersOpen: boolean): Dictionary['faq']['items'] {
  if (ordersOpen) return dict.faq.items;
  return dict.faq.items.map((item, i) => (i === 0 ? { ...item, a: dict.prelaunch.faqSubscribe } : item)) as Dictionary['faq']['items'];
}
