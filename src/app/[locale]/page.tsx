import { FeaturedIsland, PlansIsland } from '@/components/islands';
import { Benefits, ContentCategories, PlanExtras, Faq, Hero, HowItWorks, CtaBanner } from '@/components/Sections';
import { getDictionary } from '@/i18n/dictionaries';
import { getPriceTable } from '@/lib/price-source';
import { computeQuote } from '@/lib/pricing';
import { displayMoney } from '@/lib/money-display';
import { buildMetadata, resolveLocale } from '@/lib/seo';
import { StructuredData } from '@/components/StructuredData';
import { isContactFormEnabled } from '@/lib/features';
import { prelaunchCopy } from '@/lib/prelaunch-copy';
import { absoluteUrl } from '@/lib/routes';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const d = prelaunchCopy(getDictionary(locale), isContactFormEnabled()).meta;
  return buildMetadata({ locale, path: '', title: d.homeTitle, description: d.homeDescription, absoluteTitle: true });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  // Online orders closed (FEATURE_CONTACT_FORM=false): prelaunch copy (src/lib/prelaunch-copy.ts) and order window.
  const ordersOpen = isContactFormEnabled();
  const dict = prelaunchCopy(getDictionary(locale), ordersOpen);
  const { table } = await getPriceTable();
  const starter = computeQuote(table, { tier: 'starter', term: '12m', streams: 1 });
  const fromMonthly = displayMoney(starter.monthlyEquivalentMinor ?? starter.amountMinor, table.currency, locale);
  const faq = dict.faq.items;
  return (
    <>
      {/* FAQPage node: the same questions and answers as the visible FAQ section below (<Faq>, all items). */}
      <StructuredData ordersOpen={ordersOpen} locale={locale} faq={{ items: faq, pageUrl: absoluteUrl(locale) }} />
      <Hero locale={locale} dict={dict} />
      <ContentCategories locale={locale} dict={dict} showHeading={false} />
      {/* Below-the-fold islands hydrate only when they come near the viewport. */}
      <FeaturedIsland dict={dict.featured} />
      <Benefits dict={dict} />
      <section id="plans" aria-labelledby="plans-title">
        <div className="wrap">
          <div className="plans-head">
            <div className="eyebrow">{dict.plans.eyebrow}</div>
            <h2 id="plans-title" className="section-title plans-title">
              {dict.plans.title} <span className="title-hl">{dict.plans.titleHl}</span>
            </h2>
            <p className="sub">{dict.plans.sub}</p>
          </div>
          <PlansIsland
            locale={locale}
            table={table}
            dict={{ plans: dict.plans, common: dict.common, markets: dict.markets, checkout: dict.checkout, prelaunch: dict.prelaunch }}
            ordersOpen={ordersOpen}
          >
            <PlanExtras dict={dict} locale={locale} />
          </PlansIsland>
        </div>
      </section>
      <HowItWorks locale={locale} dict={dict} />
      <Faq dict={dict} locale={locale} items={faq} />
      <CtaBanner locale={locale} dict={dict} fromMonthly={fromMonthly} />
    </>
  );
}
