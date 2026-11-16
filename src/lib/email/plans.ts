import 'server-only';
import type { EmailPlan } from './templates';
import { getDictionary } from '@/i18n/dictionaries';
import { getPriceTable } from '@/lib/price-source';
import { computeQuote, formatMoney, TIERS, type Tier } from '@/lib/pricing';

/** Plan colours of the site (Starter cyan, Plus lime, Ultra+ magenta). */
const COLOR: Record<Tier, string> = { starter: '#19d3f3', plus: '#d1fe17', ultra: '#f044c4' };
/** Three short highlights per plan, taken from the site's plan cards (short enough for a phone column). */
const HIGHLIGHTS: Record<Tier, string[]> = {
  starter: ['Essential bundle', 'HD & Full HD', 'Email support'],
  plus: ['Extended bundle', '4K Ultra HD', '7-day replay'],
  ultra: ['International channels', '4K Ultra HD & HDR', '14-day replay'],
};

/** The three plans for e-mails: names and taglines from the site, yearly price (1 device) from the price table. */
export async function emailPlans(): Promise<EmailPlan[]> {
  const dict = getDictionary('en').plans;
  const { table } = await getPriceTable();
  return TIERS.map((t) => {
    const q = computeQuote(table, { tier: t, term: '12m', streams: 1 });
    return {
      name: dict.tiers[t].name,
      tagline: dict.tiers[t].tagline,
      price: formatMoney(q.amountMinor, q.currency, 'en'),
      highlights: HIGHLIGHTS[t],
      recommended: t === 'plus',
      color: COLOR[t],
      image: `https://sygmatv.com/images/email/plan-${t}.jpg`,
    };
  });
}
