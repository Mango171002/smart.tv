/**
 * « Om oss » + Hjälpcenter på svenska (phase 8 — PREVIEW ONLY, not published).
 *
 * Faithful adaptation of src/content/en/info.ts (owner-validated facts, 20/11/2026): same facts, same order of
 * the ordering flow (beställning → kontakt på WhatsApp → aktivering → betalning → betalningen bekräftas), same
 * « usually » wording for times (« vanligtvis », never a contractual guarantee). No claim added.
 * Links: Swedish pages under /sv (same English slugs); legal documents stay in English (/legal/*).
 * To be reviewed by a native speaker before publication.
 */
import type { InfoContentSet, InfoPage, InfoUi } from '@/content/en/info';
import { siteConfig } from '@/config/site';

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';
/** « 24 hours » → « 24 timmar ». */
const TRIAL = (siteConfig.trialDuration ?? '24 hours').replace(/^(\d+) hours?$/, (_, n: string) => (n === '1' ? '1 timme' : `${n} timmar`));
/** Swedish address style: « …, USA ». */
const ADDRESS = (siteConfig.legalAddress ?? '').replace(/United States$/, 'USA');

export const OWNER_FACTS = {
  established: '2026',
  basedIn: 'USA',
  supportHours: '24/7',
  usualReply: 'under en timme',
  usualActivation: 'inom en timme efter att din beställning har bekräftats på WhatsApp',
  languages: ['Engelska', 'Franska', 'Arabiska', 'Tyska', 'Spanska', 'Italienska'],
  /** Arranged by our team on WhatsApp once the subscription is active — none of them is charged on this website. */
  paymentMethods: ['Kort (Visa / Mastercard)', 'PayPal', 'Kryptovaluta (USDT via Binance)', 'Banköverföring', 'Western Union', 'MoneyGram'],
} as const;

const F = OWNER_FACTS;

/** The six steps of an order, in the real order: activation first, payment after, then the confirmation email. */
const ORDER_STEPS = [
  { title: 'Välj ditt paket', text: 'Välj paket, period och antal enheter på vår webbplats. Priset visas direkt.' },
  { title: 'Skicka din beställning', text: 'Fyll i det korta beställningsformuläret: din e-postadress, ditt land och ditt WhatsApp-nummer. Inget debiteras på den här webbplatsen. Du får ett mejl som bekräftar att vi har tagit emot din beställning.' },
  { title: 'Vi kontaktar dig på WhatsApp', text: 'En person i vårt team kontaktar dig på WhatsApp för att bekräfta din beställning.' },
  { title: 'Vi aktiverar ditt abonnemang', text: `Vi skickar dina inloggningsuppgifter och installationsinstruktioner på WhatsApp. Aktiveringen sker vanligtvis ${F.usualActivation}.` },
  { title: 'Du betalar', text: 'När din åtkomst är aktiv betalar du med något av de betalsätt som vårt team erbjuder dig.' },
  { title: 'Betalningen bekräftas', text: 'När vi har tagit emot och bekräftat din betalning får du ett mejl om att ditt abonnemang är aktivt, med ditt ordernummer.' },
];
const CONFIRMATION_EMAIL = 'När vi har tagit emot och bekräftat din betalning får du ett mejl om att ditt abonnemang är aktivt, med ditt ordernummer och uppgifter om ditt abonnemang.';
const LANGS = `${F.languages.slice(0, -1).map((l) => l.toLowerCase()).join(', ')} eller ${F.languages[F.languages.length - 1]!.toLowerCase()}`;

// ---------------------------------------------------------------- Om oss
const WHO_BRAND = { p: `SYGMA TV+ – ”One World. Endless Entertainment.” – är ett varumärke som tillhör ${siteConfig.legalEntity}, ett företag som grundades ${F.established} och är registrerat i delstaten New Mexico i USA.` };
/** Useful links of the About page; `contact` describes the Contact support page (e-mail only while requests are closed). */
const aboutLinks = (contact: string) => ({ links: [
  { href: '/sv/help', label: 'Hjälpcenter', text: 'Provperiod, beställning, enheter, återbetalning' },
  { href: '/sv/help/contact-support', label: 'Kontakta supporten', text: contact },
  { href: '/sv#plans', label: 'Paket', text: 'Välj ditt paket och se priset' },
  { href: '/legal/refunds', label: 'Återbetalning och uppsägning', text: '7 dagars pengarna-tillbaka-garanti (på engelska)' },
  { href: '/legal/terms', label: 'Användarvillkor', text: 'Reglerna, på enkelt språk (på engelska)' },
  { href: '/legal/imprint', label: 'Företagsinformation', text: 'Uppgifter om företaget (på engelska)' },
] });
const ABOUT: InfoPage = {
  slug: 'about',
  name: 'Om oss',
  title: 'Om SYGMA TV+',
  metaTitle: 'Om oss: företaget, support och åtaganden',
  description: 'SYGMA TV+ är ett varumärke för digital underhållning från Sygma TV LLC, grundat i USA 2026. Så fungerar tjänsten, våra åtaganden och vår support.',
  intro: `SYGMA TV+ är ett internationellt varumärke för digital underhållning, grundat i ${F.basedIn} ${F.established}. Vi erbjuder streamingabonnemang för din tv, mobil och dator, med en automatisk assistent som finns tillgänglig ${F.supportHours} och personlig hjälp när det behövs.`,
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Vilka vi är',
      body: [
        WHO_BRAND,
        { p: 'Paketen gäller per år (12, 24 eller 36 månader), med 1 enhet som ingår och möjlighet till upp till 4. Innan du köper kan du testa tjänsten på din egen enhet med en gratis provperiod.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Företagsinformation',
      body: [
        { facts: [
          ['Företag', siteConfig.legalEntity],
          ['Grundat', F.established],
          ['Registrerad adress', ADDRESS],
          ['Registrerat i', 'USA (New Mexico)'],
          ['EIN', siteConfig.companyNumber],
          ['E-post', siteConfig.supportEmail],
          ['Telefon / WhatsApp', siteConfig.supportPhone],
        ] },
      ],
    },
    {
      id: 'how', icon: 'rocket', title: 'Så fungerar tjänsten',
      body: [
        { p: 'Du beställer via ett kort formulär, och sedan tar en riktig person i vårt team över på WhatsApp. Vi aktiverar ditt abonnemang först – du betalar inte förrän din åtkomst är aktiv.' },
        { steps: ORDER_STEPS },
        { p: `Inte säker än? Be om en gratis provperiod på ${TRIAL} först: inget att betala och inget att säga upp.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'Våra åtaganden',
      body: [
        { list: [
          'Tydliga priser: priset visas på vår webbplats innan du beställer, och du betalar först när ditt abonnemang har aktiverats.',
          'Ingen automatisk förnyelse: du bestämmer själv om du vill förnya.',
          '7 dagars pengarna-tillbaka-garanti efter aktiveringen; kunder i EU och Storbritannien har dessutom 14 dagars ångerrätt.',
          'Dina uppgifter används bara för att hantera din förfrågan och ditt abonnemang. Vi säljer dem aldrig.',
          'Inga falska recensioner.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'users', title: 'Flerspråkig support',
      body: [
        { p: `Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs. Vi svarar vanligtvis på ${F.usualReply}. Det är vår normala svarstid, inte en avtalad garanti.` },
        { chips: [...F.languages], label: 'Supportspråk' },
        { note: 'Vårt supportteam talar dessa sex språk, så personlig hjälp får du på engelska. Även våra juridiska dokument är skrivna på engelska.' },
      ],
    },
    {
      id: 'payment', icon: 'card', title: 'Aktivering, betalning och bekräftelse',
      body: [
        { p: `Inget debiteras på den här webbplatsen. Vi aktiverar ditt abonnemang först – vanligtvis ${F.usualActivation} – och du betalar när din åtkomst är aktiv, med något av dessa betalsätt:` },
        { chips: [...F.paymentMethods], label: 'Betalsätt' },
        { note: 'Varje betalning ordnas manuellt med vårt team på WhatsApp – inget debiteras automatiskt på den här webbplatsen. Vårt team berättar vilka betalsätt som finns för din beställning.' },
        { p: CONFIRMATION_EMAIL },
      ],
    },
    {
      id: 'links', icon: 'info', title: 'Användbara länkar',
      body: [aboutLinks(`E-post eller WhatsApp · automatisk assistent ${F.supportHours}`)],
    },
  ],
  prelaunch: {
    sections: {
      who: { body: [
        WHO_BRAND,
        { p: 'Paketen gäller per år (12, 24 eller 36 månader), med 1 enhet som ingår och möjlighet till upp till 4. Gratis provperioder öppnar snart: då kan du testa tjänsten på din egen enhet innan du köper.' },
      ] },
      how: { body: [
        { p: 'Du beställer via ett kort formulär, och sedan tar en riktig person i vårt team över på WhatsApp. Vi aktiverar ditt abonnemang först – du betalar inte förrän din åtkomst är aktiv.' },
        { steps: ORDER_STEPS },
        { p: `Gratis provperioder öppnar snart: då kan du testa tjänsten i ${TRIAL} innan du köper.` },
      ] },
      // WhatsApp and the phone are not offered as a way to reach us while requests are closed (e-mail only).
      links: { body: [aboutLinks(`Via e-post · automatisk assistent ${F.supportHours}`)] },
    },
  },
};

// ---------------------------------------------------------------- Hjälpcenter
const HELP_HUB = {
  name: 'Hjälpcenter',
  title: 'Hjälpcenter',
  metaTitle: 'Hjälpcenter: provperiod, köp och återbetalning',
  description: 'Svar om gratis provperiod hos SYGMA TV+, beställning och betalning, enheter som stöds, felsökning, återbetalning och hur du kontaktar vår support.',
  intro: `Tydliga svar om gratis provperiod, beställning, betalning, enheter och återbetalning. Kommer du ändå inte vidare? Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs.`,
  popular: [
    { q: 'När och hur betalar jag?', href: '/sv/help/ordering-payment#pay' },
    { q: 'Hur lång tid tar aktiveringen?', href: '/sv/help/ordering-payment#activation' },
    { q: 'Är provperioden verkligen gratis?', href: '/sv/help/free-trial#cost' },
    { q: 'Vilka enheter kan jag använda?', href: '/sv/help/devices#categories' },
    { q: 'Hur snabbt svarar supporten?', href: '/sv/help/contact-support#availability' },
    { q: 'Hur får jag pengarna tillbaka?', href: '/sv/help/refunds#how' },
  ],
};

const HELP_TOPICS: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Kom igång', icon: 'rocket',
    title: 'Kom igång med SYGMA TV+',
    metaTitle: 'Kom igång med SYGMA TV+',
    description: 'Så fungerar SYGMA TV+, från val av paket till tittande: gratis provperiod, beställningsformulär, kontakt och aktivering på WhatsApp, sedan betalning.',
    summary: 'Från val av paket till att börja titta.',
    intro: 'Det tar bara några steg att komma igång. Du kan börja med en gratis provperiod eller beställa direkt.',
    prelaunch: { description: 'Så kommer SYGMA TV+ att fungera när beställningar och provperioder öppnar: välj paket, beställningsformulär, kontakt och aktivering på WhatsApp, betalning.', intro: 'Beställningar online och gratis provperioder öppnar snart. Så här kommer det att gå till att komma igång.' },
    sections: [
      { id: 'steps', icon: 'rocket', title: 'Stegen', body: [{ steps: [
        { title: 'Välj ditt paket', text: 'I avsnittet Paket väljer du paket, period (12, 24 eller 36 månader) och antal enheter.' },
        { title: 'Provperiod eller beställning', text: 'Be om en gratis provperiod, eller skicka din beställning via det korta formuläret: din e-postadress, ditt land och ditt WhatsApp-nummer.' },
        { title: 'Vi kontaktar dig på WhatsApp', text: 'Vårt team kontaktar dig på WhatsApp, skickar dina inloggningsuppgifter och berättar vilken app du ska installera.' },
        { title: 'Aktivering, sedan betalning', text: `Vid en beställning aktiverar vi ditt abonnemang först – vanligtvis ${F.usualActivation}. Du betalar när din åtkomst är aktiv.` },
        { title: 'Börja titta', text: 'Installera appen, ange dina inloggningsuppgifter och börja titta.' },
      ] }] },
      { id: 'good-to-know', icon: 'info', title: 'Bra att veta', body: [{ list: [
        'Inget debiteras på den här webbplatsen.',
        'Du betalar efter att ditt abonnemang har aktiverats, med ett betalsätt som vårt team erbjuder.',
        'En gratis provperiod per kund.',
        'Alla paket inkluderar 1 enhet; du kan lägga till fler, upp till 4.',
        'Paketen förnyas aldrig automatiskt.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Enheter som stöds', icon: 'devices',
    title: 'Enheter som stöds',
    metaTitle: 'Enheter som stöds: tv, streamingboxar, mobil',
    description: 'SYGMA TV+ används på smarta tv-apparater, streamingboxar och -stickor, mobiler, surfplattor och datorer. Antal enheter och hur du testar din.',
    summary: 'Tv, streamingenheter, mobil och dator.',
    intro: 'SYGMA TV+ används på tv-apparater, streamingenheter, mobiler och datorer. Med den gratis provperioden kan du kontrollera din egen enhet och uppkoppling innan du köper.',
    prelaunch: {
      intro: 'SYGMA TV+ används på tv-apparater, streamingenheter, mobiler och datorer. Gratis provperioder öppnar snart: då kan du kontrollera din egen enhet och uppkoppling innan du köper.',
      sections: { check: { body: [{ p: `Gratis provperioder öppnar snart: då kan du testa tjänsten i ${TRIAL} på din egen enhet och uppkoppling innan du köper.` }] } },
    },
    sections: [
      { id: 'categories', icon: 'devices', title: 'Vilka enheter?', body: [{ list: [
        'Smarta tv-apparater.',
        'Streamingboxar och -stickor.',
        'Mobiler och surfplattor.',
        'Datorer.',
      ] }, { p: 'Tillsammans med dina inloggningsuppgifter berättar vårt team vilken app du ska installera på din enhet och hjälper dig att ställa in den.' }] },
      { id: 'how-many', icon: 'users', title: 'Hur många enheter samtidigt?', body: [{ p: 'Alla paket inkluderar 1 enhet. Du kan lägga till enheter när du beställer, upp till 4. Abonnemanget är för personligt bruk i ditt hushåll: det är inte tillåtet att dela eller sälja vidare åtkomsten.' }] },
      { id: 'quality', icon: 'activity', title: 'Bildkvalitet', body: [{ p: 'Bildkvaliteten beror på ditt paket, innehållet, din enhet och din internetuppkoppling. En stabil uppkoppling – helst med nätverkskabel, eller med enheten nära din wifi-router – gör störst skillnad.' }] },
      { id: 'check', icon: 'check', title: 'Kontrollera din enhet först', body: [{ p: `Be om en gratis provperiod på ${TRIAL}: du testar tjänsten på din egen enhet och uppkoppling innan du köper.` }] },
    ],
  },
  {
    slug: 'free-trial', name: 'Gratis provperiod', icon: 'calendar',
    title: 'Gratis provperiod',
    metaTitle: 'Gratis provperiod: så testar du SYGMA TV+',
    description: `Testa SYGMA TV+ gratis i ${TRIAL} på din egen enhet innan du köper. Så begär du provperioden och vad som händer sedan – inget att betala eller säga upp.`,
    summary: `${TRIAL[0]!.toUpperCase()}${TRIAL.slice(1)}, gratis, inget att säga upp.`,
    intro: `Med den gratis provperioden kan du testa SYGMA TV+ i ${TRIAL} på din egen enhet och uppkoppling innan du bestämmer dig.`,
    prelaunch: { description: `Gratis provperioder öppnar snart: då kan du testa SYGMA TV+ i ${TRIAL} på din egen enhet innan du köper. Så kommer provperioden att fungera.`, sections: { request: { body: [{ p: 'Förfrågningar om gratis provperiod öppnar snart. Fram till dess kan en provperiod inte ordnas via e-post eller någon annan kanal.' }] } } },
    sections: [
      { id: 'request', icon: 'rocket', title: 'Hur begär jag den?', body: [{ steps: [
        { title: 'Öppna formuläret', text: 'Välj ”Testa gratis” högst upp på valfri sida.' },
        { title: 'Lämna dina uppgifter', text: 'Ditt fullständiga namn, din e-postadress och ditt telefonnummer med landsnummer – och godkänn att vi kontaktar dig.' },
        { title: 'Få din åtkomst', text: 'Vårt team kontaktar dig på WhatsApp med dina inloggningsuppgifter och appen du ska installera.' },
      ] }] },
      { id: 'cost', icon: 'tag', title: 'Är den verkligen gratis?', body: [{ p: 'Ja. Att begära en provperiod är gratis och förpliktar dig inte till något. Provperioden upphör automatiskt: det finns inget att säga upp. En gratis provperiod per kund.' }] },
      { id: 'check', icon: 'check', title: 'Vad ska jag kontrollera under provperioden?', body: [{ list: [
        'Att appen fungerar på din enhet.',
        'Att bilden flyter på med din internetuppkoppling.',
        'Hur många enheter du kommer att behöva.',
        'Hur du når oss om installationen inte fungerar.',
      ] }] },
    ],
  },
  {
    slug: 'ordering-payment', name: 'Beställning och betalning', icon: 'card',
    title: 'Beställning och betalning',
    metaTitle: 'Beställning och betalning: så går det till',
    description: 'Så beställer du SYGMA TV+: skicka formuläret, vårt team kontaktar dig på WhatsApp och aktiverar din åtkomst, sedan betalar du. Betalsätten i korthet.',
    summary: 'Beställningsformulär, aktivering, sedan betalning.',
    intro: 'Du beställer via ett kort formulär. Vårt team kontaktar dig på WhatsApp och aktiverar din åtkomst, och du betalar efter aktiveringen. Inget debiteras på den här webbplatsen.',
    prelaunch: { description: 'Beställningar online öppnar snart. Så kommer beställningen att fungera: beställningsformulär, kontakt och aktivering på WhatsApp, sedan betalning.', sections: { order: { title: 'Så kommer beställningen att gå till', body: [
      { p: 'Beställningar online öppnar snart. Du kan redan nu jämföra paket, perioder och priser i avsnittet Paket.' },
      { steps: ORDER_STEPS },
    ] } } },
    sections: [
      { id: 'order', icon: 'rocket', title: 'Hur beställer jag?', body: [
        { p: 'En beställning sker i sex steg, från formuläret på vår webbplats till bekräftelsen av din betalning. Välj ”Beställ nu” i avsnittet Paket för att börja.' },
        { steps: ORDER_STEPS },
      ] },
      { id: 'pay', icon: 'card', title: 'När och hur betalar jag?', body: [
        { p: 'Du betalar efter att din åtkomst har aktiverats – aldrig på den här webbplatsen. Här efterfrågas varken betalning eller kortuppgifter: vårt team skickar betalningsalternativen till dig på WhatsApp. Godkända betalsätt:' },
        { chips: [...F.paymentMethods], label: 'Betalsätt' },
        { note: 'Alla betalningar ordnas manuellt med vårt team; inget debiteras automatiskt på den här webbplatsen. Vårt team berättar vilka betalsätt som finns för din beställning.' },
      ] },
      { id: 'activation', icon: 'clock', title: 'Hur lång tid tar aktiveringen?', body: [{ p: `Vårt team aktiverar vanligtvis din åtkomst ${F.usualActivation} – en normal tid, inte en garanti. Du betalar när din åtkomst är aktiv.` }] },
      { id: 'emails', icon: 'mail', title: 'Vilka mejl får jag?', body: [{ list: [
        'Direkt efter att du har skickat formuläret: ett mejl som bekräftar att vi har tagit emot din beställning.',
        CONFIRMATION_EMAIL,
      ] }] },
      { id: 'prices', icon: 'tag', title: 'Priser och skatt', body: [{ p: 'Priserna visas i amerikanska dollar (USD). Eventuell tillämplig skatt bekräftas före betalningen. Priset för ditt paket visas innan du skickar din beställning. Längre perioder kostar mindre per år: se aktuella priser i avsnittet Paket.' }] },
      { id: 'contract', icon: 'scale', title: 'När börjar mitt abonnemang?', body: [{ p: 'Avtalet börjar gälla när vårt team bekräftar din beställning. Paketen förnyas aldrig automatiskt.' }] },
    ],
  },
  {
    slug: 'troubleshooting', name: 'Felsökning', icon: 'activity',
    title: 'Felsökning',
    metaTitle: 'Felsökning: uppspelning, inloggning och appar',
    description: 'Lös vanliga problem med SYGMA TV+: hackig bild, inloggningsuppgifter som inte godtas, appen saknas i appbutiken, appen stängs, uppspelning på mobildata.',
    summary: 'Problem med bild, inloggning och appar.',
    intro: 'De flesta problem beror på uppkopplingen eller ett skrivfel i inloggningsuppgifterna. Prova de här stegen först.',
    sections: [
      { id: 'stutter', icon: 'activity', title: 'Bilden hackar eller fryser', body: [{ p: 'Starta om din router och din enhet. Använd nätverkskabel om du kan, eller flytta enheten närmare din wifi-router, och försök sedan igen.' }] },
      { id: 'login', icon: 'lock', title: 'Mina inloggningsuppgifter godtas inte', body: [{ p: 'Kontrollera mellanslag och stora/små bokstäver, eller kopiera och klistra in uppgifterna från vårt WhatsApp-meddelande. Om det fortfarande inte fungerar kan du skicka ett foto av skärmen med felmeddelandet till oss.' }] },
      { id: 'store', icon: 'tv', title: 'Jag hittar inte appen i min appbutik', body: [{ p: 'Vilka appar som finns i appbutiken beror på enhetsmodell och land. Skicka märke, modell och årsmodell för din enhet till oss, så berättar vi vad som fungerar för den.' }] },
      { id: 'crash', icon: 'pause', title: 'Appen stängs av sig själv', body: [{ p: 'Starta om enheten, installera tillgängliga system- och appuppdateringar och försök sedan igen.' }] },
      { id: 'mobile', icon: 'devices', title: 'Uppspelningen avbryts på mobildata', body: [{ p: 'Kvaliteten beror på ditt mobilnät och ditt surfabonnemang. Byt till wifi om du kan.' }] },
      { id: 'still', icon: 'mail', title: 'Fungerar det fortfarande inte?', body: [{ p: `Kontakta oss med din enhetsmodell och ett foto av eventuellt felmeddelande. Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs; vi svarar vanligtvis på ${F.usualReply}.` }] },
    ],
  },
  {
    slug: 'contact-support', name: 'Kontakta supporten', icon: 'mail',
    title: 'Kontakta vårt supportteam',
    metaTitle: 'Support: e-post och WhatsApp',
    description: `Nå supporten för SYGMA TV+ via e-post, WhatsApp eller kontaktformuläret. Automatisk assistent ${F.supportHours}, personlig hjälp vid behov. Det här bör du ta med.`,
    summary: `E-post eller WhatsApp, automatisk assistent ${F.supportHours}.`,
    intro: `Kontakta oss via e-post eller på WhatsApp. Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs.`,
    // While online requests are closed, the contact form, WhatsApp and the phone are not offered as a way to reach us: e-mail only.
    prelaunch: {
      metaTitle: 'Kontakta supporten via e-post',
      description: `Nå supporten för SYGMA TV+ via e-post med allmänna frågor. Automatisk assistent ${F.supportHours}, personlig hjälp vid behov. Det här bör du ta med.`,
      summary: `Via e-post, automatisk assistent ${F.supportHours}.`,
      intro: `Kontakta oss via e-post. Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs.`,
      sections: { reach: { body: [{ list: [`E-post: ${EMAIL}.`] }] } },
    },
    sections: [
      { id: 'reach', icon: 'mail', title: 'Så når du oss', body: [{ list: [
        `E-post: ${EMAIL}.`,
        `WhatsApp eller telefon: ${PHONE}.`,
        'Kontaktformuläret: välj ”Kontakt” längst ned på valfri sida.',
      ] }] },
      { id: 'availability', icon: 'clock', title: 'När svarar ni?', body: [{ p: `Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs. Vår personal hjälper dig på engelska. Vi svarar vanligtvis på ${F.usualReply}. Det är vår normala svarstid, inte en avtalad garanti.` }] },
      { id: 'languages', icon: 'globe', title: 'På vilka språk?', body: [
        { p: `Du kan skriva till oss på ${LANGS}.` },
        { chips: [...F.languages], label: 'Supportspråk' },
        { note: 'Svenska ingår inte: vår personal hjälper dig gärna på engelska. Även våra juridiska dokument är skrivna på engelska.' },
      ] },
      { id: 'include', icon: 'pencil', title: 'Det här bör du ta med', body: [{ list: [
        'Ditt ordernummer, om du har ett.',
        'Vilken enhet du har, med märke och modell.',
        'Vad du gjorde när problemet uppstod, och ett foto av eventuellt felmeddelande.',
      ] }] },
    ],
  },
  {
    slug: 'refunds', name: 'Återbetalning', icon: 'refund',
    title: 'Återbetalning och uppsägning',
    metaTitle: 'Återbetalning: 7 dagars garanti och ångerrätt',
    description: 'Återbetalning hos SYGMA TV+: gratis provperiod först, 100 % tillbaka inom 7 dagar från aktivering, 14 dagars ångerrätt i EU och UK, och hur du begär den.',
    // While free trials are closed, only the « free trial first » fragment changes (refund and withdrawal wording unchanged).
    prelaunch: { description: 'Återbetalning hos SYGMA TV+: gratis provperioder snart, 100 % tillbaka inom 7 dagar från aktivering, 14 dagars ångerrätt i EU och UK, och hur du begär den.' },
    summary: '7 dagars pengarna-tillbaka-garanti – så gör du.',
    intro: 'Testa först och få sedan full återbetalning om du inte är nöjd inom 7 dagar från aktiveringen. Hela policyn finns på vår sida om återbetalning (på engelska).',
    sections: [
      { id: 'guarantee', icon: 'refund', title: '7 dagars pengarna-tillbaka-garanti', body: [{ p: 'Inte nöjd? Hör av dig inom 7 dagar från aktiveringen så betalar vi tillbaka 100 %, utan att du behöver ange något skäl. En återbetalning per kund; gäller inte konton som stängts av för att åtkomsten delats eller sålts vidare.' }] },
      { id: 'withdrawal', icon: 'scale', title: 'Kunder i EU och Storbritannien', body: [{ p: 'Du har dessutom 14 dagars ångerrätt. Efter de första 7 dagarna betalar vi tillbaka den del av abonnemanget som du inte har använt.' }] },
      { id: 'how', icon: 'mail', title: 'Så begär du återbetalning', body: [{ p: `Skicka ditt ordernummer till ${EMAIL} eller på WhatsApp. Du får pengarna tillbaka inom 14 dagar, till det betalsätt du använde.` }] },
      { id: 'after', icon: 'pause', title: 'Efter dessa perioder', body: [{ p: 'Abonnemang återbetalas inte efter dessa perioder, om inte lagen kräver det. De förnyas aldrig automatiskt.' }] },
    ],
  },
];

/** Interface labels of the About / Help pages. */
const INFO_UI: InfoUi = {
  home: 'Hem',
  breadcrumb: 'Brödsmulor',
  support: 'Support',
  popular: 'Populära frågor',
  topics: 'Hjälpämnen',
  glance: 'Supporten i korthet',
  helpFacts: [
    { k: 'Automatisk assistent', v: F.supportHours, small: 'Personlig hjälp via e-post och WhatsApp' },
    { k: 'Normal svarstid', v: 'Under en timme', small: 'Normal tid, ingen garanti' },
    { k: 'Språk', v: String(F.languages.length), small: `${F.languages.join(' · ')}. Personlig hjälp får du på engelska.` },
    { k: 'Aktivering', v: 'Oftast < 1 timme', small: 'Före betalning, efter att din beställning har bekräftats' },
  ],
  aboutFacts: [
    { k: 'Grundat', v: F.established, small: F.basedIn },
    { k: 'Företag', v: siteConfig.legalEntity ?? '', small: 'New Mexico i USA' },
    { k: 'Automatisk assistent', v: F.supportHours, small: 'Personlig hjälp vid behov' },
    { k: 'Supportspråk', v: String(F.languages.length), small: `${F.languages.join(' · ')}. Personlig hjälp får du på engelska.` },
  ],
  aboutContact: `Frågor om SYGMA TV+? Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs.`,
  hubContact: 'Hittar du inte svaret? Skriv till oss – berätta vilken enhet du har och, om du har ett, ditt ordernummer.',
  topicContact: `Behöver du mer hjälp? Kontakta oss via e-post eller på WhatsApp. Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs.`,
  hubRelated: [
    { href: '/sv/about', label: 'Om oss' },
    { href: '/sv#faq', label: 'Vanliga frågor' },
    { href: '/legal/refunds', label: 'Återbetalning och uppsägning (på engelska)' },
    { href: '/legal/terms', label: 'Användarvillkor (på engelska)' },
  ],
  refundPolicy: { href: '/legal/refunds', label: 'Fullständig återbetalningspolicy (på engelska)' },
  terms: { href: '/legal/terms', label: 'Användarvillkor (på engelska)' },
  allTopics: 'Alla hjälpämnen',
  prevTopic: 'Föregående ämne',
  nextTopic: 'Nästa ämne',
  content: {
    contactUs: 'Kontakta oss',
    email: 'E-post',
    phone: 'Telefon / WhatsApp',
    related: 'Relaterade sidor',
    onThisPage: 'På den här sidan',
    lastReviewed: 'Senast granskad: ',
  },
  actions: { trial: 'Begär en gratis provperiod', support: 'Kontakta supporten', plans: 'Se paketen', plansHref: '/sv#plans' },
  prelaunch: {
    topicContact: `Behöver du mer hjälp? Kontakta oss via e-post. Vår automatiska assistent finns tillgänglig ${F.supportHours}, med personlig hjälp när det behövs.`,
    availability: 'Personlig hjälp via e-post',
  },
};

export const INFO: InfoContentSet = {
  about: ABOUT,
  hub: HELP_HUB,
  topics: HELP_TOPICS,
  reviewed: '20 november 2026',
  supportHours: '24/7',
  ui: INFO_UI,
};
