import { PlanConfigurator } from '@/components/PlanConfigurator';
import { PlanExtras } from '@/components/Sections';
import { PriceMatrix } from '@/components/PriceMatrix';
import { HelpCta } from '@/components/Sections';
import { getDictionary } from '@/i18n/dictionaries';
import { getPriceTable } from '@/lib/price-source';
import { buildMetadata, resolveLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale).meta;
  return buildMetadata({ locale, path: '/plans', title: d.plansTitle, description: d.plansDescription });
}

export default async function PlansPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const { table, source } = await getPriceTable();
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">{dict.plans.eyebrow}</div>
        <h1 className="page-title plans-title">
          {dict.plans.title} <span className="title-hl">{dict.plans.titleHl}</span>
        </h1>
        <p className="sub">{dict.plans.sub}</p>
      </div>
      <section aria-label={dict.plans.eyebrow} style={{ paddingTop: 24 }}>
        <div className="wrap">
          <PlanConfigurator
            locale={locale}
            table={table}
            dict={{ plans: dict.plans, common: dict.common, markets: dict.markets, checkout: dict.checkout }}
          >
            <PlanExtras dict={dict} />
          </PlanConfigurator>
          <p className="footnote">{dict.plans.footnote}</p>
          <p className="footnote" data-testid="price-source">{dict.plans.source[source]}</p>
        </div>
      </section>
      <section aria-labelledby="matrix-title">
        <div className="wrap">
          <h2 id="matrix-title" className="section-title">{dict.plans.matrixTitle}</h2>
          <PriceMatrix locale={locale} table={table} dict={dict} />
        </div>
      </section>
      <section aria-labelledby="details-title">
        <div className="wrap">
          <h2 id="details-title" className="section-title">{dict.plans.detailsTitle}</h2>
          <ul className="list-check">
            {dict.plans.details.map((d) => (
              <li key={d.title}><b>{d.title}.</b> <span className="muted">{d.text}</span></li>
            ))}
          </ul>
        </div>
      </section>
      <HelpCta locale={locale} dict={dict} />
    </>
  );
}
