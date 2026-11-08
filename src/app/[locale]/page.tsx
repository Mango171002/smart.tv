import { PlanConfigurator } from '@/components/PlanConfigurator';
import { Benefits, ContentCategories, DeviceGrid, Faq, HelpCta, Hero, HowItWorks } from '@/components/Sections';
import { getDictionary } from '@/i18n/dictionaries';
import { getPriceTables } from '@/lib/price-source';
import { buildMetadata, resolveLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale).meta;
  return buildMetadata({ locale, path: '', title: d.homeTitle, description: d.homeDescription });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { tables } = await getPriceTables();
  return (
    <>
      <Hero locale={locale} dict={dict} />
      <Benefits dict={dict} />
      <section id="plans" aria-labelledby="plans-title">
        <div className="wrap pricing-layout">
          <div>
            <div className="eyebrow">{dict.plans.eyebrow}</div>
            <h2 id="plans-title" className="section-title">{dict.plans.title}</h2>
            <p className="sub">{dict.plans.sub}</p>
            <p className="footnote">{dict.plans.footnote}</p>
          </div>
          <PlanConfigurator
            locale={locale}
            tables={tables}
            dict={{ plans: dict.plans, common: dict.common, markets: dict.markets, checkout: dict.checkout }}
          />
        </div>
      </section>
      <ContentCategories dict={dict} />
      <DeviceGrid dict={dict} />
      <HowItWorks dict={dict} />
      <Faq dict={dict} limit={5} />
      <HelpCta locale={locale} dict={dict} />
    </>
  );
}
