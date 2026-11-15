/**
 * Customer e-mails (English, like the site). Pure functions: subject + HTML + plain text.
 * Table-based HTML with inline styles so it renders in Gmail, Outlook and Apple Mail.
 */

export type EmailKind = 'trial_received' | 'preregistration_received' | 'request_confirmed';

export interface InvoiceData {
  number: string;
  /** ISO date-time of issue. */
  issuedAt: string;
  amountMinor: number;
  currency: string;
}

export interface EmailData {
  name?: string | null;
  /** Customer e-mail (shown in the invoice « Billed to »). */
  email?: string | null;
  invoice?: InvoiceData | null;
  phone?: string | null;
  tier?: string | null;
  term?: string | null;
  streams?: number | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const SITE = 'https://sygmatv.com';
const SUPPORT = 'support@sygmatv.com';
const LOGO = `${SITE}/brand/sygma-logo-512.png`;
const C = { bg: '#070d17', card: '#0e1826', line: '#1f2c3d', ink: '#f2f5f9', muted: '#9aa7b8', lime: '#d1fe17' };

function money(minor: number, currency: string): string {
  return `${new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(minor / 100)} ${currency}`;
}

function invoiceDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso));
}

function invoiceHtml(inv: InvoiceData, d: EmailData, plan: string | null): string {
  const cell = 'padding:10px 14px;font-size:14px;';
  const line = `border-top:1px solid ${'#1f2c3d'};`;
  const billed = [d.name ? esc(d.name.slice(0, 120)) : null, d.email ? esc(d.email) : null, d.phone ? esc(d.phone) : null].filter(Boolean).join('<br>');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;border:1px solid #1f2c3d;border-radius:12px;">
<tr><td colspan="2" style="${cell}padding-top:14px;"><span style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#d1fe17;font-weight:800;">Invoice</span><br><b style="font-size:17px;color:#f2f5f9;">${esc(inv.number)}</b></td></tr>
<tr><td style="${cell}${line}color:#9aa7b8;">Date</td><td align="right" style="${cell}${line}color:#f2f5f9;">${esc(invoiceDate(inv.issuedAt))}</td></tr>
<tr><td valign="top" style="${cell}${line}color:#9aa7b8;">Billed to</td><td align="right" style="${cell}${line}color:#f2f5f9;">${billed || '—'}</td></tr>
<tr><td valign="top" style="${cell}${line}color:#9aa7b8;">From</td><td align="right" style="${cell}${line}color:#f2f5f9;">SYGMA TV+<br>${SUPPORT}<br>sygmatv.com</td></tr>
<tr><td style="${cell}${line}color:#f2f5f9;">SYGMA TV+ subscription${plan ? `<br><span style="color:#9aa7b8;">${esc(plan)}</span>` : ''}</td><td align="right" style="${cell}${line}color:#f2f5f9;">${esc(money(inv.amountMinor, inv.currency))}</td></tr>
<tr><td style="${cell}${line}color:#9aa7b8;">Taxes</td><td align="right" style="${cell}${line}color:#f2f5f9;">${esc(money(0, inv.currency))}</td></tr>
<tr><td style="${cell}${line}font-weight:800;color:#f2f5f9;">Total</td><td align="right" style="${cell}${line}font-weight:800;font-size:17px;color:#d1fe17;">${esc(money(inv.amountMinor, inv.currency))}</td></tr>
</table>`;
}

function invoiceText(inv: InvoiceData, d: EmailData, plan: string | null): string {
  return [
    `Invoice ${inv.number} — ${invoiceDate(inv.issuedAt)}`,
    `Billed to: ${[d.name, d.email, d.phone].filter(Boolean).join(', ')}`,
    'From: SYGMA TV+, support@sygmatv.com, sygmatv.com',
    `SYGMA TV+ subscription${plan ? ` (${plan})` : ''}: ${money(inv.amountMinor, inv.currency)}`,
    `Taxes: ${money(0, inv.currency)}`,
    `Total: ${money(inv.amountMinor, inv.currency)}`,
  ].join('\n');
}

const TIER: Record<string, string> = { starter: 'Starter', plus: 'Plus', ultra: 'Ultra+' };
const TERM: Record<string, string> = { '12m': '12 months', '24m': '24 months', '36m': '36 months', lifetime: 'Lifetime' };

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** First name only, and only if it looks like a name (the field is free text: no links or odd content in our e-mails). */
export function greetingName(name?: string | null): string | null {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  return /^[\p{L}\p{M}'’-]{1,30}$/u.test(first) ? first : null;
}

export function planLabel(d: EmailData): string | null {
  if (!d.tier) return null;
  return [TIER[d.tier] ?? d.tier, d.term ? (TERM[d.term] ?? d.term) : null, d.streams ? `${d.streams} device${d.streams > 1 ? 's' : ''}` : null]
    .filter(Boolean)
    .join(' · ');
}

interface Block {
  title: string;
  intro: string[];
  /** Raw HTML block (already escaped) placed after the intro. */
  extra?: string;
  extraText?: string;
  rows?: [string, string][];
  steps?: string[];
  note?: string;
}

function layout(b: Block, hello: string): string {
  const p = (t: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.ink};">${t}</p>`;
  const rows = b.rows?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 22px;border:1px solid ${C.line};border-radius:12px;">${b.rows
        .map(
          ([k, v], i) =>
            `<tr><td style="padding:12px 16px;font-size:14px;color:${C.muted};${i ? `border-top:1px solid ${C.line};` : ''}">${esc(k)}</td><td align="right" style="padding:12px 16px;font-size:14px;font-weight:700;color:${C.ink};${i ? `border-top:1px solid ${C.line};` : ''}">${esc(v)}</td></tr>`,
        )
        .join('')}</table>`
    : '';
  const steps = b.steps?.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;">${b.steps
        .map(
          (s, i) =>
            `<tr><td valign="top" width="36" style="padding:0 0 12px;"><div style="width:26px;height:26px;line-height:26px;border-radius:13px;background:${C.lime};color:${C.bg};font-weight:800;font-size:13px;text-align:center;">${i + 1}</div></td><td style="padding:3px 0 12px;font-size:15px;line-height:1.5;color:${C.ink};">${s}</td></tr>`,
        )
        .join('')}</table>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"><title>${esc(b.title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${C.bg}" style="background:${C.bg};"><tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 6px 22px;"><a href="${SITE}"><img src="${LOGO}" width="200" height="26" alt="SYGMA TV+" style="display:block;border:0;"></a></td></tr>
<tr><td bgcolor="${C.card}" style="background:${C.card};border:1px solid ${C.line};border-top:3px solid ${C.lime};border-radius:16px;padding:30px 26px;">
<h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:${C.ink};">${esc(b.title)}</h1>
${p(hello)}${b.intro.map(p).join('')}${b.extra ?? ''}${rows}${steps}
${b.note ? `<p style="margin:0 0 18px;font-size:13px;line-height:1.5;color:${C.muted};">${b.note}</p>` : ''}
<table role="presentation" cellpadding="0" cellspacing="0"><tr><td bgcolor="${C.lime}" style="border-radius:10px;"><a href="${SITE}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:800;color:${C.bg};text-decoration:none;">Visit SYGMA TV+</a></td></tr></table>
</td></tr>
<tr><td style="padding:22px 6px 0;font-size:12px;line-height:1.6;color:${C.muted};">Questions? Simply reply to this e-mail or write to <a href="mailto:${SUPPORT}" style="color:${C.lime};">${SUPPORT}</a>.<br>You receive this e-mail because you sent a request on <a href="${SITE}" style="color:${C.muted};">sygmatv.com</a>. <a href="${SITE}/legal/privacy" style="color:${C.muted};">Privacy policy</a>.<br>© SYGMA TV+</td></tr>
</table></td></tr></table></body></html>`;
}

function plain(b: Block, hello: string): string {
  const strip = (s: string) => s.replace(/<[^>]+>/g, '');
  return [
    b.title,
    '',
    hello,
    ...b.intro.map(strip),
    ...(b.extraText ? [b.extraText] : []),
    ...(b.rows ?? []).map(([k, v]) => `${k}: ${v}`),
    ...(b.steps ?? []).map((s, i) => `${i + 1}. ${strip(s)}`),
    b.note ? strip(b.note) : '',
    '',
    `Questions? Reply to this e-mail or write to ${SUPPORT}.`,
    SITE,
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n');
}

export function renderEmail(kind: EmailKind, d: EmailData): RenderedEmail {
  const first = greetingName(d.name);
  const hello = first ? `Hello ${esc(first)},` : 'Hello,';
  const plan = planLabel(d);
  const phone = d.phone ? esc(d.phone) : null;
  let subject: string;
  let b: Block;
  if (kind === 'trial_received') {
    subject = 'We received your trial request — SYGMA TV+';
    b = {
      title: 'Your trial request is received',
      intro: [
        'Thank you for your interest in SYGMA TV+. We have received your trial request.',
        phone
          ? `The SYGMA TV+ team will contact you very soon on <b>WhatsApp</b> at <b>${phone}</b> to give you the instructions and activation steps.`
          : 'The SYGMA TV+ team will contact you very soon on <b>WhatsApp</b> to give you the instructions and activation steps.',
      ],
      steps: ['Keep WhatsApp at hand: our message is on its way.', 'Follow the instructions and activation steps we send you.', 'Enjoy your trial.'],
      note: 'Did not request a trial? You can ignore this e-mail.',
    };
  } else if (kind === 'preregistration_received') {
    subject = 'We received your order — SYGMA TV+';
    b = {
      title: 'Your order is received',
      intro: [
        'Thank you for your order with SYGMA TV+. We have received it.',
        phone
          ? `Our team will contact you very soon on <b>WhatsApp</b> at <b>${phone}</b> to confirm your order and give you the activation steps.`
          : 'Our team will contact you very soon to confirm your order and give you the activation steps.',
      ],
      rows: plan ? [['Your plan', plan]] : undefined,
      note: 'No payment has been taken on the website. Our team confirms the details with you before activation.',
    };
  } else {
    const inv = d.invoice;
    subject = inv ? `Thank you for your order — invoice ${inv.number} — SYGMA TV+` : 'Your order is confirmed — SYGMA TV+';
    b = {
      title: 'Thank you for choosing SYGMA TV+',
      intro: [
        'Your order is confirmed. Thank you for your trust!',
        phone
          ? `Our team sends you the activation steps on <b>WhatsApp</b> at <b>${phone}</b> or by e-mail.`
          : 'Our team sends you the activation steps on <b>WhatsApp</b> or by e-mail.',
      ],
      extra: inv ? invoiceHtml(inv, d, plan) : undefined,
      extraText: inv ? invoiceText(inv, d, plan) : undefined,
      rows: !inv && plan ? [['Your plan', plan]] : undefined,
      steps: ['Watch for our message with your activation steps.', 'Install the app on your device as explained.', 'Start watching.'],
      note: 'Need help at any step? Reply to this e-mail: our support team answers you.',
    };
  }
  return { subject, html: layout(b, hello), text: plain(b, first ? `Hello ${first},` : 'Hello,') };
}
