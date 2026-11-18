/**
 * Customer e-mails, in the language of the site version the customer used (English for « / », French for
 * the French versions — SEO international, phase 3A). Pure functions: subject + HTML + plain text.
 * English texts are unchanged (unit test against the pre-3A output).
 * Table-based HTML with inline styles so it renders in Gmail, Outlook and Apple Mail.
 * Wording of e-mails 2 and 3: owner's texts (15/11/2026).
 */

export type EmailKind = 'trial_received' | 'trial_started' | 'trial_followup' | 'preregistration_received' | 'request_confirmed' | 'review_invite';

/** Order data attached to the « Converti » e-mail (number given once per request by the database). */
export interface InvoiceData {
  number: string;
  /** ISO date-time of issue. */
  issuedAt: string;
  /** Plan price; absent when the request has no plan (e.g. a converted trial). */
  amountMinor?: number | null;
  currency?: string | null;
}

export interface EmailData {
  name?: string | null;
  /** Customer e-mail. */
  email?: string | null;
  phone?: string | null;
  tier?: string | null;
  term?: string | null;
  streams?: number | null;
  invoice?: InvoiceData | null;
  /** « Trial started » e-mail: trial length as told by the team (e.g. « 24 hours »), shown only when known. */
  trialDuration?: string | null;
  /** « Trial follow-up » e-mail: the three plans (names, prices and highlights come from the site's own data). */
  plans?: EmailPlan[] | null;
  /** « Trial follow-up »: currency of the plan prices (the version's market). */
  currency?: string | null;
  /** Site version of the request (« en », « fr-fr »…): language, currency format and links. Default: English home. */
  locale?: string | null;
}

export interface EmailPlan {
  name: string;
  tagline: string;
  /** Already formatted, e.g. « $59 ». */
  price: string;
  highlights: string[];
  recommended?: boolean;
  /** Plan colour, as on the site (Starter cyan, Plus lime, Ultra+ magenta). */
  color: string;
  /** Absolute URL of the plan picture (JPEG for e-mail clients). */
  image: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const SITE = 'https://sygmatv.com';
const SUPPORT = 'support@sygmatv.com';
const SUPPORT_WHATSAPP = '+44 7412 857594';
const SUPPORT_WHATSAPP_LINK = 'https://wa.me/447412857594';
const TAGLINE = 'One World. Endless Entertainment.';
/** Trustpilot « write a review » page (owner's profile: trustpilot.com/review/sygmatv.com). */
export const TRUSTPILOT_REVIEW_URL = 'https://www.trustpilot.com/evaluate/sygmatv.com';
const TRUSTPILOT_GREEN = '#00b67a';
const LOGO = `${SITE}/brand/sygma-logo-512.png`;
const C = { bg: '#070d17', card: '#0e1826', line: '#1f2c3d', ink: '#f2f5f9', muted: '#9aa7b8', lime: '#d1fe17' };

const TIER: Record<string, string> = { starter: 'Starter', plus: 'Plus', ultra: 'Ultra+' };
const TERM: Record<string, string> = { '12m': '12 months', '24m': '24 months', '36m': '36 months', lifetime: 'Lifetime' };

type Lang = 'en' | 'fr';
/** Language, number format and link prefix of a site version (unknown → English home). */
function ctxOf(locale?: string | null): { lang: Lang; intl: string; prefix: string } {
  const m = /^(en|fr)(?:-([a-z]{2}))?$/.exec(locale ?? '');
  if (!m || locale === 'en') return { lang: 'en', intl: 'en-US', prefix: '' };
  const lang = m[1] as Lang;
  return { lang, intl: m[2] ? `${lang}-${m[2].toUpperCase()}` : lang === 'fr' ? 'fr-FR' : 'en-US', prefix: m[2] ? `/${locale}` : '' };
}

const TERM_FR: Record<string, string> = { '12m': '12 mois', '24m': '24 mois', '36m': '36 mois', lifetime: 'À vie' };

/** Fixed texts of the e-mail frame, per language (English = the original texts). */
const UI = {
  en: {
    recommended: 'RECOMMENDED', perYear: 'per year', rate: 'Rate us on Trustpilot', writeReview: 'Write a review',
    needHelp: 'Need help?', assistance: '<b>Need assistance?</b> Our support team is here to help.', assistanceText: 'Need assistance? Our support team is here to help.',
    email: 'Email', website: 'Website', visit: 'Visit SYGMA TV+', reviewText: 'Write a review on Trustpilot',
    plansText: (pl: EmailPlan) => `${pl.name}${pl.recommended ? ' (recommended)' : ''} — ${pl.price} / year: ${pl.highlights.join(', ')}`,
    footer: (site: string, privacy: string) => `Questions? Simply reply to this e-mail or write to <a href="mailto:${SUPPORT}" style="color:${C.lime};">${SUPPORT}</a>.<br>You receive this e-mail because you sent a request on <a href="${site}" style="color:${C.muted};">sygmatv.com</a>. <a href="${privacy}" style="color:${C.muted};">Privacy policy</a>.<br>© SYGMA TV+`,
    footerText: `Questions? Reply to this e-mail or write to ${SUPPORT}.`,
  },
  fr: {
    recommended: 'RECOMMANDÉE', perYear: 'par an', rate: 'Notez-nous sur Trustpilot', writeReview: 'Laisser un avis',
    needHelp: 'Besoin d’aide\u00a0?', assistance: '<b>Besoin d’aide\u00a0?</b> Notre équipe d’assistance est là pour vous.', assistanceText: 'Besoin d’aide\u00a0? Notre équipe d’assistance est là pour vous.',
    email: 'E-mail', website: 'Site', visit: 'Découvrir SYGMA TV+', reviewText: 'Laisser un avis sur Trustpilot',
    plansText: (pl: EmailPlan) => `${pl.name}${pl.recommended ? ' (recommandée)' : ''} — ${pl.price} / an\u00a0: ${pl.highlights.join(', ')}`,
    footer: (site: string, privacy: string) => `Une question\u00a0? Répondez simplement à cet e-mail ou écrivez à <a href="mailto:${SUPPORT}" style="color:${C.lime};">${SUPPORT}</a>.<br>Vous recevez cet e-mail parce que vous avez envoyé une demande sur <a href="${site}" style="color:${C.muted};">sygmatv.com</a>. <a href="${privacy}" style="color:${C.muted};">Politique de confidentialité</a>.<br>© SYGMA TV+`,
    footerText: `Une question\u00a0? Répondez à cet e-mail ou écrivez à ${SUPPORT}.`,
  },
} as const;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function money(minor: number, currency: string, intl = 'en-US'): string {
  // English home: « $99.00 USD » (unchanged). Other versions: the local format, e.g. « 99,00 € », « 99,00 CHF ».
  if (intl === 'en-US') return `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100)} ${currency}`;
  return new Intl.NumberFormat(intl, { style: 'currency', currency }).format(minor / 100);
}

/** First name only, and only if it looks like a name (the field is free text: no links or odd content in our e-mails). */
export function greetingName(name?: string | null): string | null {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  return /^[\p{L}\p{M}'’-]{1,30}$/u.test(first) ? first : null;
}

export function planLabel(d: EmailData): string | null {
  if (!d.tier) return null;
  const fr = ctxOf(d.locale).lang === 'fr';
  return [TIER[d.tier] ?? d.tier, d.term ? ((fr ? TERM_FR : TERM)[d.term] ?? d.term) : null, devices(d.streams, fr)].filter(Boolean).join(' · ');
}

function devices(n?: number | null, fr = false): string | null {
  if (!n) return null;
  return fr ? `${n} appareil${n > 1 ? 's' : ''}` : `${n} device${n > 1 ? 's' : ''}`;
}

/** One e-mail = a sequence of parts rendered in the card. Texts are trusted HTML (variables escaped by the caller). */
type Part =
  | { p: string; strong?: boolean }
  | { h: string }
  | { rows: [string, string][] }
  | { steps: string[] }
  | { note: string }
  | { help: true }
  | { helpShort: true }
  | { trustpilot: true }
  | { plans: EmailPlan[] }
  | { cta: true; label?: string; href?: string };

interface Mail {
  lang: Lang;
  /** Home of the site version (https://sygmatv.com or https://sygmatv.com/fr-fr). */
  site: string;
  subject: string;
  title: string;
  parts: Part[];
  /** Brand signature « SYGMA TV+ / One World. Endless Entertainment. » */
  signature?: boolean;
}

function partHtml(part: Part, m: Mail): string {
  const u = UI[m.lang];
  if ('p' in part) return `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.ink};${part.strong ? 'font-weight:700;' : ''}">${part.p}</p>`;
  if ('h' in part) return `<h2 style="margin:22px 0 10px;font-size:17px;line-height:1.3;color:${C.lime};">${part.h}</h2>`;
  if ('rows' in part) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;border:1px solid ${C.line};border-radius:12px;">${part.rows
      .map(([k, v], i) => {
        const top = i ? `border-top:1px solid ${C.line};` : '';
        return `<tr><td style="padding:12px 16px;font-size:14px;color:${C.muted};${top}">${esc(k)}</td><td align="right" style="padding:12px 16px;font-size:14px;font-weight:700;color:${C.ink};${top}">${esc(v)}</td></tr>`;
      })
      .join('')}</table>`;
  }
  if ('steps' in part) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;">${part.steps
      .map(
        (s, i) =>
          `<tr><td valign="top" width="36" style="padding:0 0 12px;"><div style="width:26px;height:26px;line-height:26px;border-radius:13px;background:${C.lime};color:${C.bg};font-weight:800;font-size:13px;text-align:center;">${i + 1}</div></td><td style="padding:3px 0 12px;font-size:15px;line-height:1.5;color:${C.ink};">${s}</td></tr>`,
      )
      .join('')}</table>`;
  }
  if ('note' in part) return `<p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:${C.muted};">${part.note}</p>`;
  if ('plans' in part) {
    // The three plans side by side, like on the site: vertical cards in the plan colour.
    // Fluid: equal columns, pictures at 100 % width, long words wrap (fits a 360 px phone screen).
    const cell = (pl: EmailPlan) => {
      const badge = pl.recommended
        ? `<div style="margin:0 0 6px;"><span style="display:inline-block;padding:2px 5px;border-radius:999px;background:${pl.color};color:${C.bg};font-size:8px;font-weight:800;letter-spacing:.2px;white-space:nowrap;">${u.recommended}</span></div>`
        : '';
      const list = pl.highlights
        .map((h) => `<tr><td valign="top" style="padding:0 3px 5px 0;color:${pl.color};font-size:11px;line-height:1.35;">&#10003;</td><td style="padding:0 0 5px;font-size:11px;line-height:1.35;color:${C.ink};overflow-wrap:break-word;">${esc(h)}</td></tr>`)
        .join('');
      return `<td valign="top" width="33%" style="padding:0 2px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:2px solid ${pl.color};border-radius:12px;background:${C.bg};table-layout:fixed;">
<tr><td style="padding:0;"><img src="${pl.image}" alt="" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:10px 10px 0 0;"></td></tr>
<tr><td style="padding:10px 7px 12px;overflow-wrap:break-word;">${badge}
<div style="font-size:17px;font-weight:800;line-height:1.15;color:${pl.color};">${esc(pl.name)}</div>
<div style="font-size:11px;line-height:1.35;color:${C.muted};margin:3px 0 8px;">${esc(pl.tagline)}</div>
<div style="font-size:22px;font-weight:800;color:${C.ink};line-height:1;">${esc(pl.price)}</div>
<div style="font-size:11px;font-weight:600;color:${C.muted};margin:2px 0 0;">${u.perYear}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">${list}</table>
</td></tr></table></td>`;
    };
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 16px;table-layout:fixed;"><tr>${part.plans.map(cell).join('')}</tr></table>`;
  }
  if ('trustpilot' in part) {
    // Official Trustpilot brand assets (logo + 5 stars), unmodified, linking to our review page.
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;border:1px solid ${C.line};border-radius:14px;background:${C.bg};"><tr><td align="center" style="padding:22px 16px;">
<a href="${TRUSTPILOT_REVIEW_URL}" style="text-decoration:none;"><img src="${SITE}/brand/trustpilot-logo-white.png" width="140" height="34" alt="Trustpilot" style="display:block;border:0;margin:0 auto 12px;"></a>
<a href="${TRUSTPILOT_REVIEW_URL}" style="text-decoration:none;"><img src="${SITE}/brand/trustpilot-stars-5.png" width="128" height="24" alt="${u.rate}" style="display:block;border:0;margin:0 auto 18px;"></a>
<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td bgcolor="${TRUSTPILOT_GREEN}" style="border-radius:10px;"><a href="${TRUSTPILOT_REVIEW_URL}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;">${u.writeReview}</a></td></tr></table>
</td></tr></table>`;
  }
  if ('helpShort' in part) {
    const a = `color:${C.lime};text-decoration:none;`;
    return `<p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:${C.muted};">${u.needHelp} WhatsApp <a href="${SUPPORT_WHATSAPP_LINK}" style="${a}">${SUPPORT_WHATSAPP}</a> · <a href="mailto:${SUPPORT}" style="${a}">${SUPPORT}</a></p>`;
  }
  if ('help' in part) {
    const a = `color:${C.lime};text-decoration:none;`;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;border-left:3px solid ${C.lime};"><tr><td style="padding:4px 0 4px 14px;font-size:15px;line-height:1.7;color:${C.ink};">
${u.assistance}<br>
WhatsApp${m.lang === 'fr' ? '\u00a0' : ''}: <a href="${SUPPORT_WHATSAPP_LINK}" style="${a}">${SUPPORT_WHATSAPP}</a><br>
${u.email}${m.lang === 'fr' ? '\u00a0' : ''}: <a href="mailto:${SUPPORT}" style="${a}">${SUPPORT}</a><br>
${u.website}${m.lang === 'fr' ? '\u00a0' : ''}: <a href="${m.site}" style="${a}">${m.site}</a></td></tr></table>`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;"><tr><td bgcolor="${C.lime}" style="border-radius:10px;"><a href="${part.href ?? m.site}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:800;color:${C.bg};text-decoration:none;">${esc(part.label ?? u.visit)}</a></td></tr></table>`;
}

function partText(part: Part, m: Mail): string {
  const u = UI[m.lang];
  const sep = m.lang === 'fr' ? '\u00a0: ' : ': ';
  const strip = (s: string) => s.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  if ('p' in part) return strip(part.p);
  if ('h' in part) return `\n${strip(part.h)}`;
  if ('rows' in part) return part.rows.map(([k, v]) => `${k}${sep}${v}`).join('\n');
  if ('steps' in part) return part.steps.map((s, i) => `${i + 1}. ${strip(s)}`).join('\n');
  if ('note' in part) return strip(part.note);
  if ('trustpilot' in part) return `${u.reviewText}${sep}${TRUSTPILOT_REVIEW_URL}`;
  if ('plans' in part) return part.plans.map(u.plansText).join('\n');
  if ('helpShort' in part) return `${u.needHelp} WhatsApp ${SUPPORT_WHATSAPP} · ${SUPPORT}`;
  if ('help' in part) return `${u.assistanceText}\nWhatsApp${sep}${SUPPORT_WHATSAPP}\n${u.email}${sep}${SUPPORT}\n${u.website}${sep}${m.site}`;
  return part.label ? `${part.label}${sep}${part.href ?? m.site}` : m.site;
}

function layout(m: Mail): string {
  const signature = m.signature
    ? `<p style="margin:22px 0 0;font-size:15px;line-height:1.5;color:${C.ink};"><b>SYGMA TV+</b><br><span style="color:${C.lime};">${TAGLINE}</span></p>`
    : '';
  const u = UI[m.lang];
  return `<!doctype html><html lang="${m.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(m.title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background:${C.bg};"><tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 6px 22px;"><a href="${m.site}"><img src="${LOGO}" width="200" height="26" alt="SYGMA TV+" style="display:block;border:0;"></a></td></tr>
<tr><td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.line};border-top:3px solid ${C.lime};border-radius:16px;padding:30px 26px;">
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:${C.ink};">${esc(m.title)}</h1>
${m.parts.map((p) => partHtml(p, m)).join('\n')}${signature}
</td></tr>
<tr><td style="padding:22px 6px 0;font-size:12px;line-height:1.6;color:${C.muted};">${u.footer(m.site, `${m.site === SITE ? SITE : m.site}/legal/privacy`)}</td></tr>
</table></td></tr></table></body></html>`;
}

function plain(m: Mail): string {
  return [m.title, '', ...m.parts.map((p) => partText(p, m)), ...(m.signature ? ['', 'SYGMA TV+', TAGLINE] : []), '', UI[m.lang].footerText, m.site]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

/** English e-mails (original texts, unchanged). */
function buildMailEn(kind: EmailKind, d: EmailData): Mail {
  const lang = 'en' as const;
  const site = SITE;
  const first = greetingName(d.name);
  const hello = first ? `Hello ${esc(first)},` : 'Hello,';
  const plan = planLabel(d);
  const phone = d.phone ? esc(d.phone) : null;

  if (kind === 'trial_received') {
    return {
      lang,
      site,
      subject: 'We received your trial request — SYGMA TV+',
      title: 'Your trial request is received',
      parts: [
        { p: hello },
        { p: 'Thank you for your interest in SYGMA TV+. We have received your trial request.' },
        {
          p: phone
            ? `The SYGMA TV+ team will contact you very soon on <b>WhatsApp</b> at <b>${phone}</b> to give you the instructions and activation steps.`
            : 'The SYGMA TV+ team will contact you very soon on <b>WhatsApp</b> to give you the instructions and activation steps.',
        },
        { steps: ['Keep WhatsApp at hand: our message is on its way.', 'Follow the instructions and activation steps we send you.', 'Enjoy your trial.'] },
        { note: 'Did not request a trial? You can ignore this e-mail.' },
        { cta: true },
      ],
    };
  }

  if (kind === 'preregistration_received') {
    return {
      lang,
      site,
      subject: 'Your order has been received! — SYGMA TV+',
      title: 'Your order has been received!',
      parts: [
        { p: 'Thank you for choosing SYGMA TV+!' },
        ...(plan ? [{ rows: [['Your plan', plan]] as [string, string][] }] : []),
        { p: 'Please keep an eye on your WhatsApp messages.', strong: true },
        { p: 'Our team will contact you shortly via WhatsApp to guide you through the activation process.' },
      ],
      signature: true,
    };
  }

  if (kind === 'trial_started') {
    // Sent when the team has given the trial on WhatsApp (activation), not when the request is received.
    return {
      lang,
      site,
      subject: 'Your SYGMA TV+ trial is active — enjoy!',
      title: 'Enjoy your trial!',
      parts: [
        { p: hello },
        { p: 'Great news: your SYGMA TV+ trial is now active.' },
        {
          p: phone
            ? `Your access details and setup instructions have been sent to you on <b>WhatsApp</b> at <b>${phone}</b>.`
            : 'Your access details and setup instructions have been sent to you on <b>WhatsApp</b>.',
        },
        ...(d.trialDuration ? [{ rows: [['Trial length', d.trialDuration]] as [string, string][] }] : []),
        { help: true },
      ],
      signature: true,
    };
  }

  if (kind === 'trial_followup') {
    // Sent automatically 24 h after the trial was given: thanks + the three plans + link to the site.
    return {
      lang,
      site,
      subject: 'How was your SYGMA TV+ trial?',
      title: 'We hope you enjoyed your trial!',
      parts: [
        { p: hello },
        { p: 'Thank you for trying SYGMA TV+. We hope you enjoyed your favourite sports, movies, series and live TV.' },
        { p: 'Ready to keep watching? Choose the plan that suits you:' },
        ...(d.plans?.length ? [{ plans: d.plans }] : []),
        { note: 'Prices per year in USD · up to 4 screens on every plan · save up to 30% with 2 or 3 years.' },
        { cta: true, label: 'Choose my plan', href: `${SITE}/#plans` },
        { helpShort: true },
      ],
      signature: true,
    };
  }

  if (kind === 'review_invite') {
    // Sent to every activated customer (no filtering on satisfaction, no incentive: Trustpilot rules).
    return {
      lang,
      site,
      subject: 'How is your SYGMA TV+ experience?',
      title: 'How is your SYGMA TV+ experience?',
      parts: [
        { p: hello },
        { p: 'Enjoying SYGMA TV+? Share your honest opinion on Trustpilot. It only takes a minute.' },
        { trustpilot: true },
        { helpShort: true },
      ],
      signature: true,
    };
  }

  // « Converti »: the team has received the payment and activated the subscription.
  const inv = d.invoice;
  const details: [string, string][] = [];
  if (inv) details.push(['Order Number', inv.number]);
  if (d.tier) details.push(['Plan', TIER[d.tier] ?? d.tier]);
  if (d.term) details.push(['Duration', TERM[d.term] ?? d.term]);
  const dev = devices(d.streams);
  if (dev) details.push(['Devices', dev]);
  if (inv?.amountMinor && inv.currency) details.push(['Amount Paid', money(inv.amountMinor, inv.currency)]);
  details.push(['Payment Status', 'Paid'], ['Subscription Status', 'Active']);
  return {
    lang,
    site,
    subject: 'Your SYGMA TV+ Subscription Is Now Active!',
    title: 'Your subscription is now active!',
    parts: [
      { p: hello },
      { p: 'Thank you for choosing SYGMA TV+!' },
      { p: 'Your payment has been confirmed, and your subscription has been successfully activated.' },
      { h: 'Your Subscription Details' },
      { rows: details },
      { h: 'You’re all set!' },
      { p: 'Your activation details and setup instructions have been shared with you via WhatsApp.' },
      { p: 'You can now enjoy your SYGMA TV+ experience!' },
      { help: true },
      { p: 'Thank you for your trust!', strong: true },
    ],
    signature: true,
  };
}

/** French e-mails (versions « fr-fr », « fr-be », « fr-ch », « fr-ca »…). Same structure as English. */
function buildMailFr(kind: EmailKind, d: EmailData): Mail {
  const lang = 'fr' as const;
  const { intl, prefix } = ctxOf(d.locale);
  const site = `${SITE}${prefix}`;
  const first = greetingName(d.name);
  const hello = first ? `Bonjour ${esc(first)},` : 'Bonjour,';
  const plan = planLabel(d);
  const phone = d.phone ? esc(d.phone) : null;
  const duration = d.trialDuration === '24 hours' ? '24 heures' : d.trialDuration;

  if (kind === 'trial_received') {
    return {
      lang, site,
      subject: 'Nous avons bien reçu votre demande d’essai — SYGMA TV+',
      title: 'Votre demande d’essai est bien reçue',
      parts: [
        { p: hello },
        { p: 'Merci de votre intérêt pour SYGMA TV+. Nous avons bien reçu votre demande d’essai.' },
        {
          p: phone
            ? `L’équipe SYGMA TV+ vous contacte très vite sur <b>WhatsApp</b> au <b>${phone}</b> pour vous envoyer les instructions et les étapes d’activation.`
            : 'L’équipe SYGMA TV+ vous contacte très vite sur <b>WhatsApp</b> pour vous envoyer les instructions et les étapes d’activation.',
        },
        { steps: ['Gardez WhatsApp à portée de main : notre message arrive.', 'Suivez les instructions et les étapes d’activation que nous vous envoyons.', 'Profitez de votre essai.'] },
        { note: 'Vous n’avez pas demandé d’essai ? Vous pouvez ignorer cet e-mail.' },
        { cta: true },
      ],
    };
  }

  if (kind === 'preregistration_received') {
    return {
      lang, site,
      subject: 'Votre commande est bien reçue ! — SYGMA TV+',
      title: 'Votre commande est bien reçue !',
      parts: [
        { p: 'Merci d’avoir choisi SYGMA TV+ !' },
        ...(plan ? [{ rows: [['Votre formule', plan]] as [string, string][] }] : []),
        { p: 'Surveillez vos messages WhatsApp.', strong: true },
        { p: 'Notre équipe vous contacte très vite sur WhatsApp pour vous accompagner dans l’activation.' },
      ],
      signature: true,
    };
  }

  if (kind === 'trial_started') {
    return {
      lang, site,
      subject: 'Votre essai SYGMA TV+ est activé — bon visionnage !',
      title: 'Profitez de votre essai !',
      parts: [
        { p: hello },
        { p: 'Bonne nouvelle : votre essai SYGMA TV+ est activé.' },
        {
          p: phone
            ? `Vos accès et les instructions d’installation vous ont été envoyés sur <b>WhatsApp</b> au <b>${phone}</b>.`
            : 'Vos accès et les instructions d’installation vous ont été envoyés sur <b>WhatsApp</b>.',
        },
        ...(duration ? [{ rows: [['Durée de l’essai', duration]] as [string, string][] }] : []),
        { help: true },
      ],
      signature: true,
    };
  }

  if (kind === 'trial_followup') {
    const currency = d.plans?.length ? (d.currency ?? null) : null;
    return {
      lang, site,
      subject: 'Comment s’est passé votre essai SYGMA TV+ ?',
      title: 'Nous espérons que votre essai vous a plu !',
      parts: [
        { p: hello },
        { p: 'Merci d’avoir essayé SYGMA TV+. Nous espérons que vous avez apprécié votre sport, vos films, vos séries et la TV en direct.' },
        ...(d.plans?.length
          ? [{ p: 'Envie de continuer ? Choisissez la formule qui vous convient :' }, { plans: d.plans } as Part, { note: `Prix par an${currency ? ` en ${currency}` : ''} · jusqu’à 4 appareils sur chaque formule · remise sur 2 et 3 ans.` }]
          : [{ p: 'Envie de continuer ? Découvrez nos formules sur le site.' }]),
        { cta: true, label: 'Choisir ma formule', href: `${site}#plans` },
        { helpShort: true },
      ],
      signature: true,
    };
  }

  if (kind === 'review_invite') {
    return {
      lang, site,
      subject: 'Comment se passe votre expérience SYGMA TV+ ?',
      title: 'Comment se passe votre expérience SYGMA TV+ ?',
      parts: [
        { p: hello },
        { p: 'Vous appréciez SYGMA TV+ ? Partagez votre avis sincère sur Trustpilot. Cela ne prend qu’une minute.' },
        { trustpilot: true },
        { helpShort: true },
      ],
      signature: true,
    };
  }

  // « Converti »: payment received, subscription activated.
  const inv = d.invoice;
  const details: [string, string][] = [];
  if (inv) details.push(['N° de commande', inv.number]);
  if (d.tier) details.push(['Formule', TIER[d.tier] ?? d.tier]);
  if (d.term) details.push(['Durée', TERM_FR[d.term] ?? d.term]);
  const dev = devices(d.streams, true);
  if (dev) details.push(['Appareils', dev]);
  if (inv?.amountMinor && inv.currency) details.push(['Montant payé', money(inv.amountMinor, inv.currency, intl)]);
  details.push(['Statut du paiement', 'Payé'], ['Statut de l’abonnement', 'Actif']);
  return {
    lang, site,
    subject: 'Votre abonnement SYGMA TV+ est activé !',
    title: 'Votre abonnement est activé !',
    parts: [
      { p: hello },
      { p: 'Merci d’avoir choisi SYGMA TV+ !' },
      { p: 'Votre paiement est confirmé et votre abonnement a bien été activé.' },
      { h: 'Les détails de votre abonnement' },
      { rows: details },
      { h: 'Tout est prêt !' },
      { p: 'Vos accès et les instructions d’installation vous ont été envoyés sur WhatsApp.' },
      { p: 'Vous pouvez maintenant profiter de SYGMA TV+ !' },
      { help: true },
      { p: 'Merci de votre confiance !', strong: true },
    ],
    signature: true,
  };
}

function buildMail(kind: EmailKind, d: EmailData): Mail {
  return ctxOf(d.locale).lang === 'fr' ? buildMailFr(kind, d) : buildMailEn(kind, d);
}

export function renderEmail(kind: EmailKind, d: EmailData): RenderedEmail {
  const m = buildMail(kind, d);
  return { subject: m.subject, html: layout(m), text: plain(m) };
}
