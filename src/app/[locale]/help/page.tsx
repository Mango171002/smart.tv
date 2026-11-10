import { ContactForm } from '@/components/ContactForm';
import { Faq } from '@/components/Sections';
import { getDictionary } from '@/i18n/dictionaries';
import { isContactFormEnabled } from '@/lib/features';
import { buildMetadata, resolveLocale } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const d = getDictionary(locale).meta;
  return buildMetadata({ locale, path: '/help', title: d.helpTitle, description: d.helpDescription });
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await resolveLocale(params);
  const dict = getDictionary(locale);
  const h = dict.help;
  const formsEnabled = isContactFormEnabled();
  const formDict = { forms: dict.forms, markets: dict.markets };
  return (
    <>
      <div className="wrap page-head">
        <div className="eyebrow">{h.eyebrow}</div>
        <h1 className="page-title">{h.title}</h1>
        <p className="sub">{h.sub}</p>
        <p className="footnote">{h.supportContact}</p>
      </div>
      <Faq dict={dict} />
      <section aria-label={h.contactTitle} style={{ paddingTop: 0 }}>
        <div className="wrap faq-layout">
          <div className="card panel-pad" id="prereg">
            <h2 style={{ marginTop: 0 }}>{h.waitlistTitle}</h2>
            <p className="muted">{h.waitlistSub}</p>
            {formsEnabled ? <ContactForm kind="launch_waitlist" locale={locale} dict={formDict} /> : <p className="alert err">{h.supportUnavailable}</p>}
          </div>
          <div className="card panel-pad">
            <h2 style={{ marginTop: 0 }}>{h.contactTitle}</h2>
            <p className="muted">{h.contactSub}</p>
            {formsEnabled ? <ContactForm kind="support" locale={locale} dict={formDict} /> : <p className="alert err">{h.supportUnavailable}</p>}
          </div>
        </div>
      </section>
    </>
  );
}
