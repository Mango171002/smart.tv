/**
 * Customer e-mails (English, like the site). Pure functions: subject + HTML + plain text.
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
}

export interface EmailPlan {
  name: string;
  tagline: string;
  /** Already formatted, e.g. « $59 ». */
  price: string;
  highlights: string[];
  recommended?: boolean;
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

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function money(minor: number, currency: string): string {
  return `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100)} ${currency}`;
}

/** First name only, and only if it looks like a name (the field is free text: no links or odd content in our e-mails). */
export function greetingName(name?: string | null): string | null {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  return /^[\p{L}\p{M}'’-]{1,30}$/u.test(first) ? first : null;
}

export function planLabel(d: EmailData): string | null {
  if (!d.tier) return null;
  return [TIER[d.tier] ?? d.tier, d.term ? (TERM[d.term] ?? d.term) : null, devices(d.streams)].filter(Boolean).join(' · ');
}

function devices(n?: number | null): string | null {
  return n ? `${n} device${n > 1 ? 's' : ''}` : null;
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
  subject: string;
  title: string;
  parts: Part[];
  /** Brand signature « SYGMA TV+ / One World. Endless Entertainment. » */
  signature?: boolean;
}

function partHtml(part: Part): string {
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
    return part.plans
      .map((pl) => {
        const border = pl.recommended ? `2px solid ${C.lime}` : `1px solid ${C.line}`;
        const badge = pl.recommended
          ? `<span style="display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:${C.lime};color:${C.bg};font-size:11px;font-weight:800;vertical-align:middle;">RECOMMENDED</span>`
          : '';
        const list = pl.highlights.map((h) => `<li style="margin:0 0 4px;">${esc(h)}</li>`).join('');
        return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 12px;border:${border};border-radius:12px;"><tr>
<td valign="top" style="padding:14px 16px;"><b style="font-size:17px;color:${C.ink};">${esc(pl.name)}</b>${badge}<br><span style="font-size:13px;color:${C.muted};">${esc(pl.tagline)}</span>
<ul style="margin:10px 0 0;padding-left:18px;font-size:14px;line-height:1.5;color:${C.ink};">${list}</ul></td>
<td valign="top" align="right" style="padding:14px 16px;white-space:nowrap;"><b style="font-size:22px;color:${pl.recommended ? C.lime : C.ink};">${esc(pl.price)}</b><br><span style="font-size:12px;color:${C.muted};">/ year</span></td>
</tr></table>`;
      })
      .join('');
  }
  if ('trustpilot' in part) {
    // Official Trustpilot brand assets (logo + 5 stars), unmodified, linking to our review page.
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px;border:1px solid ${C.line};border-radius:14px;background:${C.bg};"><tr><td align="center" style="padding:22px 16px;">
<a href="${TRUSTPILOT_REVIEW_URL}" style="text-decoration:none;"><img src="${SITE}/brand/trustpilot-logo-white.png" width="140" height="34" alt="Trustpilot" style="display:block;border:0;margin:0 auto 12px;"></a>
<a href="${TRUSTPILOT_REVIEW_URL}" style="text-decoration:none;"><img src="${SITE}/brand/trustpilot-stars-5.png" width="128" height="24" alt="Rate us on Trustpilot" style="display:block;border:0;margin:0 auto 18px;"></a>
<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td bgcolor="${TRUSTPILOT_GREEN}" style="border-radius:10px;"><a href="${TRUSTPILOT_REVIEW_URL}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:800;color:#ffffff;text-decoration:none;">Write a review</a></td></tr></table>
</td></tr></table>`;
  }
  if ('helpShort' in part) {
    const a = `color:${C.lime};text-decoration:none;`;
    return `<p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:${C.muted};">Need help? WhatsApp <a href="${SUPPORT_WHATSAPP_LINK}" style="${a}">${SUPPORT_WHATSAPP}</a> · <a href="mailto:${SUPPORT}" style="${a}">${SUPPORT}</a></p>`;
  }
  if ('help' in part) {
    const a = `color:${C.lime};text-decoration:none;`;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;border-left:3px solid ${C.lime};"><tr><td style="padding:4px 0 4px 14px;font-size:15px;line-height:1.7;color:${C.ink};">
<b>Need assistance?</b> Our support team is here to help.<br>
WhatsApp: <a href="${SUPPORT_WHATSAPP_LINK}" style="${a}">${SUPPORT_WHATSAPP}</a><br>
Email: <a href="mailto:${SUPPORT}" style="${a}">${SUPPORT}</a><br>
Website: <a href="${SITE}" style="${a}">${SITE}</a></td></tr></table>`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;"><tr><td bgcolor="${C.lime}" style="border-radius:10px;"><a href="${part.href ?? SITE}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:800;color:${C.bg};text-decoration:none;">${esc(part.label ?? 'Visit SYGMA TV+')}</a></td></tr></table>`;
}

function partText(part: Part): string {
  const strip = (s: string) => s.replace(/<br>/g, '\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  if ('p' in part) return strip(part.p);
  if ('h' in part) return `\n${strip(part.h)}`;
  if ('rows' in part) return part.rows.map(([k, v]) => `${k}: ${v}`).join('\n');
  if ('steps' in part) return part.steps.map((s, i) => `${i + 1}. ${strip(s)}`).join('\n');
  if ('note' in part) return strip(part.note);
  if ('trustpilot' in part) return `Write a review on Trustpilot: ${TRUSTPILOT_REVIEW_URL}`;
  if ('plans' in part) return part.plans.map((pl) => `${pl.name}${pl.recommended ? ' (recommended)' : ''} — ${pl.price} / year: ${pl.highlights.join(', ')}`).join('\n');
  if ('helpShort' in part) return `Need help? WhatsApp ${SUPPORT_WHATSAPP} · ${SUPPORT}`;
  if ('help' in part) return `Need assistance? Our support team is here to help.\nWhatsApp: ${SUPPORT_WHATSAPP}\nEmail: ${SUPPORT}\nWebsite: ${SITE}`;
  return part.label ? `${part.label}: ${part.href ?? SITE}` : SITE;
}

function layout(m: Mail): string {
  const signature = m.signature
    ? `<p style="margin:22px 0 0;font-size:15px;line-height:1.5;color:${C.ink};"><b>SYGMA TV+</b><br><span style="color:${C.lime};">${TAGLINE}</span></p>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(m.title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background:${C.bg};"><tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 6px 22px;"><a href="${SITE}"><img src="${LOGO}" width="200" height="26" alt="SYGMA TV+" style="display:block;border:0;"></a></td></tr>
<tr><td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.line};border-top:3px solid ${C.lime};border-radius:16px;padding:30px 26px;">
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:${C.ink};">${esc(m.title)}</h1>
${m.parts.map(partHtml).join('\n')}${signature}
</td></tr>
<tr><td style="padding:22px 6px 0;font-size:12px;line-height:1.6;color:${C.muted};">Questions? Simply reply to this e-mail or write to <a href="mailto:${SUPPORT}" style="color:${C.lime};">${SUPPORT}</a>.<br>You receive this e-mail because you sent a request on <a href="${SITE}" style="color:${C.muted};">sygmatv.com</a>. <a href="${SITE}/legal/privacy" style="color:${C.muted};">Privacy policy</a>.<br>© SYGMA TV+</td></tr>
</table></td></tr></table></body></html>`;
}

function plain(m: Mail): string {
  return [m.title, '', ...m.parts.map(partText), ...(m.signature ? ['', 'SYGMA TV+', TAGLINE] : []), '', `Questions? Reply to this e-mail or write to ${SUPPORT}.`, SITE]
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

function buildMail(kind: EmailKind, d: EmailData): Mail {
  const first = greetingName(d.name);
  const hello = first ? `Hello ${esc(first)},` : 'Hello,';
  const plan = planLabel(d);
  const phone = d.phone ? esc(d.phone) : null;

  if (kind === 'trial_received') {
    return {
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

export function renderEmail(kind: EmailKind, d: EmailData): RenderedEmail {
  const m = buildMail(kind, d);
  return { subject: m.subject, html: layout(m), text: plain(m) };
}
