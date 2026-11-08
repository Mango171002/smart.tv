import { PlanConfigurator } from '@/components/PlanConfigurator';
import { PriceMatrix } from '@/components/PriceMatrix';
import { HelpCta } from '@/components/Sections';
import { getDictionary } from '@/i18n/dictionaries';
import { getPriceTables } from '@/lib/price-source';
import { buildMetadata, resolveLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale).meta;
  return buildMetadata({ locale, path: '/plans', title: d.plansTitle, description: d.plansDescription });
}

export default async function PlansPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { tables, source } = await getPriceTables();
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">{dict.plans.eyebrow}</div>
        <h1 className="page-title">{dict.plans.title}</h1>
        <p className="sub">{dict.plans.sub}</p>
      </div>
      <section aria-label={dict.plans.eyebrow} style={{ paddingTop: 24 }}>
        <div className="wrap pricing-layout">
          <div>
            <h2 className="section-title">{dict.plans.detailsTitle}</h2>
            <ul className="list-check">
              {dict.plans.details.map((d) => (
                <li key={d.title}><b>{d.title}.</b> <span className="muted">{d.text}</span></li>
              ))}
            </ul>
            <p className="footnote">{dict.plans.footnote}</p>
            <p className="footnote" data-testid="price-source">{dict.plans.source[source]}</p>
          </div>
          <PlanConfigurator
            locale={locale}
            tables={tables}
            dict={{ plans: dict.plans, common: dict.common, markets: dict.markets, checkout: dict.checkout }}
          />
        </div>
      </section>
      <section aria-labelledby="matrix-title">
        <div className="wrap">
          <h2 id="matrix-title" className="section-title">{dict.plans.matrixTitle}</h2>
          <PriceMatrix locale={locale} tables={tables} dict={dict} />
        </div>
      </section>
      <HelpCta locale={locale} dict={dict} />
    </>
  );
}
