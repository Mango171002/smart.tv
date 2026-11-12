import { FeaturedIsland, PlansIsland } from '@/components/islands';
import { Benefits, ContentCategories, PlanExtras, Faq, Hero, HowItWorks, CtaBanner } from '@/components/Sections';
import { getDictionary } from '@/i18n/dictionaries';
import { getPriceTable } from '@/lib/price-source';
import { computeQuote, formatMoney } from '@/lib/pricing';
import { buildMetadata, resolveLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale).meta;
  return buildMetadata({ locale, path: '', title: d.homeTitle, description: d.homeDescription });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { table } = await getPriceTable();
  const starter = computeQuote(table, { tier: 'starter', term: '12m', streams: 1 });
  const fromMonthly = formatMoney(starter.monthlyEquivalentMinor ?? starter.amountMinor, table.currency, locale);
  return (
    <>
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
            dict={{ plans: dict.plans, common: dict.common, markets: dict.markets, checkout: dict.checkout }}
          >
            <PlanExtras dict={dict} />
          </PlansIsland>
        </div>
      </section>
      <HowItWorks locale={locale} dict={dict} />
      <Faq dict={dict} />
      <CtaBanner locale={locale} dict={dict} fromMonthly={fromMonthly} />
    </>
  );
}
