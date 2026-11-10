import { ContentCategories, HelpCta } from '@/components/Sections';
import { MARKETS, MARKET_CODES } from '@/config/markets';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata, resolveLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale).meta;
  return buildMetadata({ locale, path: '/coverage', title: d.coverageTitle, description: d.coverageDescription });
}

export default async function CoveragePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const c = dict.coverage;
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">{c.eyebrow}</div>
        <h1 className="page-title">{c.title}</h1>
        <p className="sub">{c.sub}</p>
      </div>
      <section aria-labelledby="markets-title" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <h2 id="markets-title" className="section-title">{c.marketsTitle}</h2>
          <div className="table-wrap" tabIndex={0} role="region" aria-labelledby="markets-title">
            <table className="matrix">
              <thead>
                <tr>
                  <th scope="col">{dict.forms.region}</th>
                  <th scope="col">{c.currency}</th>
                  <th scope="col">{c.status}</th>
                </tr>
              </thead>
              <tbody>
                {MARKET_CODES.map((code) => (
                  <tr key={code}>
                    <th scope="row">{MARKETS[code].flag} {dict.markets[code]}</th>
                    <td>{MARKETS[code].currency}</td>
                    <td><span className="badge">{c.notLicensed}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card panel-pad" style={{ marginTop: 20 }}>
            <h2 style={{ marginTop: 0 }}>{c.catalogueTitle}</h2>
            <p className="muted" style={{ marginBottom: 0 }}>{c.catalogueText}</p>
          </div>
        </div>
      </section>
      <ContentCategories locale={locale} dict={dict} />
      <HelpCta locale={locale} dict={dict} />
    </>
  );
}
