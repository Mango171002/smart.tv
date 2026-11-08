import { DeviceGrid, HelpCta, HowItWorks } from '@/components/Sections';
import { getDictionary } from '@/i18n/dictionaries';
import { buildMetadata, resolveLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale).meta;
  return buildMetadata({ locale, path: '/devices', title: d.devicesTitle, description: d.devicesDescription });
}

export default async function DevicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const d = dict.devices;
  return (
    <>
      <DeviceGrid dict={dict} headingLevel={1} />
      <section aria-labelledby="guides-title" style={{ paddingTop: 0 }}>
        <div className="wrap faq-layout">
          <div className="card panel-pad">
            <h2 id="guides-title" style={{ marginTop: 0 }}>{d.guidesTitle}</h2>
            <p className="muted">{d.guidesText}</p>
            <span className="badge">{dict.common.pending}</span>
          </div>
          <div className="card panel-pad">
            <h2 style={{ marginTop: 0 }}>{d.checklistTitle}</h2>
            <ul className="list-check">
              {d.checklist.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      </section>
      <HowItWorks dict={dict} />
      <HelpCta locale={locale} dict={dict} />
    </>
  );
}
