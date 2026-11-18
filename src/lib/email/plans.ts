import 'server-only';
import type { EmailPlan } from './templates';
import { getDictionary } from '@/i18n/dictionaries';
import { SITE_LOCALES, type LocaleId, type SiteLocale } from '@/i18n/locales';
import { priceMarketOfLocale } from '@/lib/market';
import { getPriceTable, getPriceTableFor } from '@/lib/price-source';
import { computeQuote, formatMoney, TIERS, type Tier } from '@/lib/pricing';

/** Plan colours of the site (Starter cyan, Plus lime, Ultra+ magenta). */
const COLOR: Record<Tier, string> = { starter: '#19d3f3', plus: '#d1fe17', ultra: '#f044c4' };
/** Three short highlights per plan, taken from the site's plan cards (short enough for a phone column). */
const HIGHLIGHTS: Record<'en' | 'fr', Record<Tier, string[]>> = {
  en: {
    starter: ['Essential bundle', 'HD & Full HD', 'Email support'],
    plus: ['Extended bundle', '4K Ultra HD', '7-day replay'],
    ultra: ['International channels', '4K Ultra HD & HDR', '14-day replay'],
  },
  fr: {
    starter: ['Bouquet Essentiel', 'HD et Full HD', 'Assistance par e-mail'],
    plus: ['Bouquet Étendu', '4K Ultra HD', 'Replay 7 jours'],
    ultra: ['Chaînes internationales', '4K Ultra HD et HDR', 'Replay 14 jours'],
  },
};

/**
 * The three plans for e-mails: names and taglines from the site, yearly price (1 device) from the price grid
 * of the customer's site version, in its own currency. English home: unchanged (US grid). A version whose
 * grid is not validated yet gets no plans (the e-mail then simply links to the site): never a converted price.
 */
export async function emailPlans(locale?: string | null): Promise<{ plans: EmailPlan[]; currency: string } | null> {
  // Any registered version (not only the ones built here); unknown → English home.
  const version = (locale && locale in SITE_LOCALES ? locale : 'en') as LocaleId;
  const info = (SITE_LOCALES as Record<string, SiteLocale>)[version]!;
  const table = version === 'en' ? (await getPriceTable()).table : await getPriceTableFor(priceMarketOfLocale(version));
  if (!table) return null;
  const dict = getDictionary(version).plans;
  const lang = info.language === 'fr' ? 'fr' : 'en';
  return {
    currency: table.currency,
    plans: TIERS.map((t) => {
      const q = computeQuote(table, { tier: t, term: '12m', streams: 1 });
      return {
        name: dict.tiers[t].name,
        tagline: dict.tiers[t].tagline,
        price: formatMoney(q.amountMinor, q.currency, version),
        highlights: HIGHLIGHTS[lang][t],
        recommended: t === 'plus',
        color: COLOR[t],
        image: `https://sygmatv.com/images/email/plan-${t}.jpg`,
      };
    }),
  };
}
