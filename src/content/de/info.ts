/**
 * « Über uns » + Hilfe-Center auf Deutsch (phase 8 — PREVIEW ONLY, not published).
 *
 * Faithful adaptation of src/content/en/info.ts (owner-validated facts, 20/11/2026): same facts, same order of the
 * ordering flow (Bestellung → Kontakt per WhatsApp → Aktivierung → Zahlung → Zahlungsbestätigung), same « usually »
 * wording for times (« in der Regel », never a contractual guarantee). No claim added. Formal « Sie », standard
 * German for Germany, Switzerland and Luxembourg.
 * Links: German pages under /de (same English slugs); legal documents stay in English (/legal/*).
 * To be reviewed by a native speaker before publication.
 */
import type { InfoContentSet, InfoPage, InfoUi } from '@/content/en/info';
import { siteConfig } from '@/config/site';

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';
/** « 24 hours » → « 24 Stunden ». */
const TRIAL = (siteConfig.trialDuration ?? '24 hours').replace(/^(\d+) hours?$/, (_, n: string) => (n === '1' ? '1 Stunde' : `${n} Stunden`));
/** « 24 Stunden » → « 24-Stunden » (« einen kostenlosen 24-Stunden-Test »). */
const TRIAL_ADJ = TRIAL.replace(/^(\d+) Stunden?$/, '$1-Stunden');
/** Postal address as written for German readers (« United States » → « USA »). */
const ADDRESS = siteConfig.legalAddress ? siteConfig.legalAddress.replace(/United States$/, 'USA') : null;

export const OWNER_FACTS = {
  established: '2026',
  basedIn: 'USA',
  supportHours: '24/7',
  usualReply: 'in weniger als einer Stunde',
  usualActivation: 'innerhalb einer Stunde, nachdem Ihre Bestellung per WhatsApp bestätigt wurde',
  languages: ['Englisch', 'Französisch', 'Arabisch', 'Deutsch', 'Spanisch', 'Italienisch'],
  /** Arranged by our team on WhatsApp once the subscription is active — none of them is charged on this website. */
  paymentMethods: ['Karte (Visa / Mastercard)', 'PayPal', 'Kryptowährung (USDT über Binance)', 'Banküberweisung', 'Western Union', 'MoneyGram'],
} as const;

const F = OWNER_FACTS;

/** The six steps of an order, in the real order: activation first, payment after, then the confirmation email. */
const ORDER_STEPS = [
  { title: 'Tarif wählen', text: 'Wählen Sie auf unserer Website Ihren Tarif, die Laufzeit und die Anzahl der Geräte. Der Preis wird sofort angezeigt.' },
  { title: 'Bestellung absenden', text: 'Füllen Sie das kurze Bestellformular aus: E-Mail-Adresse, Land und WhatsApp-Nummer. Auf dieser Website wird nichts abgebucht. Sie erhalten eine Eingangsbestätigung per E-Mail.' },
  { title: 'Wir kontaktieren Sie per WhatsApp', text: 'Ein Mitglied unseres Teams kontaktiert Sie per WhatsApp, um Ihre Bestellung zu bestätigen.' },
  { title: 'Wir aktivieren Ihr Abo', text: `Wir senden Ihnen Ihre Zugangsdaten und die Einrichtungsanleitung per WhatsApp. Die Aktivierung erfolgt in der Regel ${F.usualActivation}.` },
  { title: 'Sie bezahlen', text: 'Sobald Ihr Zugang aktiv ist, bezahlen Sie mit einer der Zahlungsmethoden, die unser Team Ihnen anbietet.' },
  { title: 'Zahlung bestätigt', text: 'Sobald Ihre Zahlung bei uns eingegangen und bestätigt ist, erhalten Sie eine E-Mail mit Ihrer Bestellnummer, die bestätigt, dass Ihr Abo aktiv ist.' },
];
const CONFIRMATION_EMAIL = 'Sobald Ihre Zahlung bei uns eingegangen und bestätigt ist, erhalten Sie eine E-Mail, die bestätigt, dass Ihr Abo aktiv ist – mit Ihrer Bestellnummer und den Details Ihres Abos.';
const LANGS = `${F.languages.slice(0, -1).join(', ')} oder ${F.languages[F.languages.length - 1]}`;

// ---------------------------------------------------------------- Über uns
const WHO_BRAND = { p: `SYGMA TV+ – „One World. Endless Entertainment.“ – ist eine Marke der ${siteConfig.legalEntity}, eines ${F.established} gegründeten und im Bundesstaat New Mexico (USA) eingetragenen Unternehmens.` };
/** Useful links of the About page; `contact` describes the Contact support page (e-mail only while requests are closed). */
const aboutLinks = (contact: string) => ({ links: [
  { href: '/de/help', label: 'Hilfe-Center', text: 'Testzugang, Bestellung, Geräte, Erstattungen' },
  { href: '/de/help/contact-support', label: 'Support kontaktieren', text: contact },
  { href: '/de#plans', label: 'Tarife', text: 'Tarif wählen und Preis ansehen' },
  { href: '/legal/refunds', label: 'Erstattungen & Kündigungen', text: '7 Tage Geld-zurück-Garantie (auf Englisch)' },
  { href: '/legal/terms', label: 'Nutzungsbedingungen', text: 'Die Regeln in klarer Sprache (auf Englisch)' },
  { href: '/legal/imprint', label: 'Impressum', text: 'Unternehmensangaben (auf Englisch)' },
] });
const ABOUT: InfoPage = {
  slug: 'about',
  name: 'Über uns',
  title: 'Über SYGMA TV+',
  metaTitle: 'Über uns: Unternehmen, Support und Versprechen',
  description: 'SYGMA TV+ ist eine Marke der Sygma TV LLC für digitale Unterhaltung, 2026 in den USA gegründet. Funktionsweise, unsere Versprechen und der Support.',
  intro: `SYGMA TV+ ist eine internationale Marke für digitale Unterhaltung, gegründet ${F.established} in den ${F.basedIn}. Wir bieten Streaming-Abos für Ihren Fernseher, Ihr Smartphone und Ihren Computer – mit einem automatischen Assistenten, der ${F.supportHours} erreichbar ist, und bei Bedarf persönlicher Unterstützung durch unser Team.`,
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Wer wir sind',
      body: [
        WHO_BRAND,
        { p: 'Die Tarife laufen jährlich (12, 24 oder 36 Monate); 1 Gerät ist inklusive, bis zu 4 sind möglich. Vor dem Kauf können Sie den Dienst mit einem kostenlosen Testzugang auf Ihrem eigenen Gerät ausprobieren.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Unternehmensangaben',
      body: [
        { facts: [
          ['Unternehmen', siteConfig.legalEntity],
          ['Gegründet', F.established],
          ['Geschäftsadresse', ADDRESS],
          ['Eingetragen in', 'USA (New Mexico)'],
          ['EIN', siteConfig.companyNumber],
          ['E-Mail', siteConfig.supportEmail],
          ['Telefon / WhatsApp', siteConfig.supportPhone],
        ] },
      ],
    },
    {
      id: 'how', icon: 'rocket', title: 'So funktioniert der Dienst',
      body: [
        { p: 'Sie bestellen über ein kurzes Formular, und ein Mitglied unseres Teams kümmert sich persönlich per WhatsApp um alles Weitere. Wir aktivieren zuerst Ihr Abo: Sie bezahlen erst, wenn Ihr Zugang aktiv ist.' },
        { steps: ORDER_STEPS },
        { p: `Noch unsicher? Fordern Sie zuerst einen kostenlosen ${TRIAL_ADJ}-Testzugang an: Sie zahlen nichts und müssen nichts kündigen.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'Unsere Versprechen',
      body: [
        { list: [
          'Klare Preise: Der Preis wird auf unserer Website angezeigt, bevor Sie bestellen, und Sie bezahlen erst nach der Aktivierung Ihres Abos.',
          'Keine automatische Verlängerung: Sie entscheiden, ob Sie verlängern.',
          '7 Tage Geld-zurück-Garantie ab Aktivierung; Kunden in der EU und im Vereinigten Königreich behalten zusätzlich ihr 14-tägiges Widerrufsrecht.',
          'Ihre Daten werden nur zur Bearbeitung Ihrer Anfrage und Ihres Abos verwendet. Wir verkaufen sie nie.',
          'Keine gefälschten Bewertungen.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'users', title: 'Mehrsprachiger Support',
      body: [
        { p: `Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team. Wir antworten in der Regel ${F.usualReply}. Das ist unsere übliche Antwortzeit, keine vertragliche Garantie.` },
        { chips: [...F.languages], label: 'Support-Sprachen' },
        { note: 'Unser Support-Team spricht diese sechs Sprachen; unsere Rechtsdokumente sind auf Englisch verfasst.' },
      ],
    },
    {
      id: 'payment', icon: 'card', title: 'Aktivierung, Zahlung und Bestätigung',
      body: [
        { p: `Auf dieser Website wird nichts abgebucht. Wir aktivieren zuerst Ihr Abo – in der Regel ${F.usualActivation} – und Sie bezahlen, sobald Ihr Zugang aktiv ist, mit einer dieser Methoden:` },
        { chips: [...F.paymentMethods], label: 'Zahlungsmethoden' },
        { note: 'Jede Zahlung wird manuell mit unserem Team per WhatsApp abgewickelt – keine wird automatisch auf dieser Website abgebucht. Unser Team sagt Ihnen, welche Methoden für Ihre Bestellung verfügbar sind.' },
        { p: CONFIRMATION_EMAIL },
      ],
    },
    {
      id: 'links', icon: 'info', title: 'Nützliche Links',
      body: [aboutLinks(`E-Mail oder WhatsApp · automatischer Assistent ${F.supportHours}`)],
    },
  ],
  prelaunch: {
    sections: {
      who: { body: [
        WHO_BRAND,
        { p: 'Die Tarife laufen jährlich (12, 24 oder 36 Monate); 1 Gerät ist inklusive, bis zu 4 sind möglich. Kostenlose Testzugänge sind in Kürze möglich: Dann können Sie den Dienst auf Ihrem eigenen Gerät ausprobieren, bevor Sie kaufen.' },
      ] },
      how: { body: [
        { p: 'Sie bestellen über ein kurzes Formular, und ein Mitglied unseres Teams kümmert sich persönlich per WhatsApp um alles Weitere. Wir aktivieren zuerst Ihr Abo: Sie bezahlen erst, wenn Ihr Zugang aktiv ist.' },
        { steps: ORDER_STEPS },
        { p: `Kostenlose Testzugänge sind in Kürze möglich: Dann können Sie den Dienst ${TRIAL} lang testen, bevor Sie kaufen.` },
      ] },
      // WhatsApp and the phone are not offered as a way to reach us while requests are closed (e-mail only).
      links: { body: [aboutLinks(`Per E-Mail · automatischer Assistent ${F.supportHours}`)] },
    },
  },
};

// ---------------------------------------------------------------- Hilfe-Center
const HELP_HUB = {
  name: 'Hilfe-Center',
  title: 'Hilfe-Center',
  metaTitle: 'Hilfe-Center: Testzugang, Bestellung, Erstattung',
  description: 'Antworten zum kostenlosen Testzugang von SYGMA TV+, zu Bestellung und Zahlung, unterstützten Geräten, Fehlerbehebung, Erstattungen und zum Support.',
  intro: `Klare Antworten zum kostenlosen Testzugang, zu Bestellung, Zahlung, Geräten und Erstattungen. Noch Fragen offen? Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team.`,
  popular: [
    { q: 'Wann und wie bezahle ich?', href: '/de/help/ordering-payment#pay' },
    { q: 'Wie lange dauert die Aktivierung?', href: '/de/help/ordering-payment#activation' },
    { q: 'Ist der Testzugang wirklich kostenlos?', href: '/de/help/free-trial#cost' },
    { q: 'Welche Geräte kann ich nutzen?', href: '/de/help/devices#categories' },
    { q: 'Wie schnell antwortet der Support?', href: '/de/help/contact-support#availability' },
    { q: 'Wie erhalte ich eine Erstattung?', href: '/de/help/refunds#how' },
  ],
};

const HELP_TOPICS: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Erste Schritte', icon: 'rocket',
    title: 'Erste Schritte mit SYGMA TV+',
    metaTitle: 'Erste Schritte mit SYGMA TV+',
    description: 'So funktioniert SYGMA TV+, von der Tarifwahl bis zum Streamen: kostenloser Testzugang, Bestellformular, Kontakt und Aktivierung per WhatsApp, dann Zahlung.',
    summary: 'Von der Tarifwahl bis zum ersten Stream.',
    intro: 'Der Einstieg gelingt in wenigen Schritten. Sie können mit einem kostenlosen Testzugang beginnen oder direkt bestellen.',
    prelaunch: { description: 'So wird SYGMA TV+ funktionieren, sobald Bestellungen und Testzugänge möglich sind: Bestellformular, Kontakt und Aktivierung per WhatsApp, Zahlung.', intro: 'Online-Bestellungen und kostenlose Testzugänge sind in Kürze möglich. So wird der Einstieg ablaufen.' },
    sections: [
      { id: 'steps', icon: 'rocket', title: 'Die Schritte', body: [{ steps: [
        { title: 'Tarif wählen', text: 'Wählen Sie im Bereich „Tarife“ Ihren Tarif, die Laufzeit (12, 24 oder 36 Monate) und die Anzahl der Geräte.' },
        { title: 'Testzugang oder Bestellung', text: 'Fordern Sie einen kostenlosen Testzugang an oder senden Sie Ihre Bestellung über das kurze Formular: E-Mail-Adresse, Land und WhatsApp-Nummer.' },
        { title: 'Wir kontaktieren Sie per WhatsApp', text: 'Unser Team kontaktiert Sie per WhatsApp, sendet Ihnen Ihre Zugangsdaten und sagt Ihnen, welche App Sie installieren sollen.' },
        { title: 'Erst Aktivierung, dann Zahlung', text: `Bei einer Bestellung aktivieren wir zuerst Ihr Abo – in der Regel ${F.usualActivation}. Sie bezahlen, sobald Ihr Zugang aktiv ist.` },
        { title: 'Loslegen', text: 'Installieren Sie die App, geben Sie Ihre Zugangsdaten ein und starten Sie die Wiedergabe.' },
      ] }] },
      { id: 'good-to-know', icon: 'info', title: 'Gut zu wissen', body: [{ list: [
        'Auf dieser Website wird nichts abgebucht.',
        'Sie bezahlen nach der Aktivierung Ihres Abos mit einer Zahlungsmethode, die unser Team Ihnen anbietet.',
        'Ein kostenloser Testzugang pro Kunde.',
        'Jeder Tarif enthält 1 Gerät; Sie können weitere hinzufügen, insgesamt bis zu 4.',
        'Tarife verlängern sich nie automatisch.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Unterstützte Geräte', icon: 'devices',
    title: 'Unterstützte Geräte',
    metaTitle: 'Unterstützte Geräte: TV, Boxen, Smartphone',
    description: 'SYGMA TV+ läuft auf Smart-TVs, Streaming-Boxen und -Sticks, Smartphones, Tablets und Computern. Wie viele Geräte möglich sind und wie Sie Ihr Gerät prüfen.',
    summary: 'TV, Streaming-Geräte, Smartphone und Computer.',
    intro: 'SYGMA TV+ läuft auf Fernsehern, Streaming-Geräten, Smartphones und Computern. Mit dem kostenlosen Testzugang prüfen Sie Ihr eigenes Gerät und Ihre Verbindung, bevor Sie kaufen.',
    prelaunch: {
      intro: 'SYGMA TV+ läuft auf Fernsehern, Streaming-Geräten, Smartphones und Computern. Kostenlose Testzugänge sind in Kürze möglich: Dann prüfen Sie Ihr eigenes Gerät und Ihre Verbindung, bevor Sie kaufen.',
      sections: { check: { body: [{ p: `Kostenlose Testzugänge sind in Kürze möglich: Dann testen Sie den Dienst ${TRIAL} lang auf Ihrem eigenen Gerät und mit Ihrer Verbindung, bevor Sie kaufen.` }] } },
    },
    sections: [
      { id: 'categories', icon: 'devices', title: 'Welche Geräte?', body: [{ list: [
        'Smart-TVs.',
        'Streaming-Boxen und -Sticks.',
        'Smartphones und Tablets.',
        'Computer.',
      ] }, { p: 'Zusammen mit Ihren Zugangsdaten sagt Ihnen unser Team, welche App Sie auf Ihrem Gerät installieren sollen, und hilft Ihnen bei der Einrichtung.' }] },
      { id: 'how-many', icon: 'users', title: 'Wie viele Geräte gleichzeitig?', body: [{ p: 'Jeder Tarif enthält 1 Gerät. Bei der Bestellung können Sie weitere Geräte hinzufügen, insgesamt bis zu 4. Das Abo ist für die private Nutzung in Ihrem Haushalt bestimmt: Das Teilen oder Weiterverkaufen des Zugangs ist nicht erlaubt.' }] },
      { id: 'quality', icon: 'activity', title: 'Bildqualität', body: [{ p: 'Die Bildqualität hängt von Ihrem Tarif, dem Inhalt, Ihrem Gerät und Ihrer Internetverbindung ab. Eine stabile Verbindung – idealerweise per Netzwerkkabel oder mit dem Gerät nahe am WLAN-Router – macht den größten Unterschied.' }] },
      { id: 'check', icon: 'check', title: 'Prüfen Sie zuerst Ihr Gerät', body: [{ p: `Fordern Sie einen kostenlosen ${TRIAL_ADJ}-Testzugang an: So testen Sie den Dienst auf Ihrem eigenen Gerät und mit Ihrer Verbindung, bevor Sie kaufen.` }] },
    ],
  },
  {
    slug: 'free-trial', name: 'Kostenloser Testzugang', icon: 'calendar',
    title: 'Der kostenlose Testzugang',
    metaTitle: 'Testzugang: So testen Sie SYGMA TV+ kostenlos',
    description: `Testen Sie SYGMA TV+ ${TRIAL} lang kostenlos auf Ihrem Gerät, bevor Sie kaufen. So fordern Sie den Testzugang an – nichts zu zahlen, nichts zu kündigen.`,
    summary: `${TRIAL}, kostenlos, nichts zu kündigen.`,
    intro: `Mit dem kostenlosen Testzugang können Sie SYGMA TV+ ${TRIAL} lang auf Ihrem eigenen Gerät und mit Ihrer Verbindung ausprobieren, bevor Sie sich entscheiden.`,
    prelaunch: { description: `Kostenlose Testzugänge sind in Kürze möglich: Dann testen Sie SYGMA TV+ ${TRIAL} lang auf Ihrem Gerät, bevor Sie kaufen. So wird der Testzugang ablaufen.`, sections: { request: { body: [{ p: 'Anfragen für einen kostenlosen Testzugang sind in Kürze möglich. Bis dahin kann ein Testzugang weder per E-Mail noch über einen anderen Kanal vereinbart werden.' }] } } },
    sections: [
      { id: 'request', icon: 'rocket', title: 'Wie fordere ich ihn an?', body: [{ steps: [
        { title: 'Formular öffnen', text: 'Klicken Sie oben auf einer beliebigen Seite auf „Kostenlos testen“.' },
        { title: 'Daten angeben', text: 'Ihr Vor- und Nachname, Ihre E-Mail-Adresse und Ihre Telefonnummer mit Ländervorwahl – und Ihre Zustimmung, kontaktiert zu werden.' },
        { title: 'Zugang erhalten', text: 'Unser Team kontaktiert Sie per WhatsApp mit Ihren Zugangsdaten und der App, die Sie installieren sollen.' },
      ] }] },
      { id: 'cost', icon: 'tag', title: 'Ist er wirklich kostenlos?', body: [{ p: 'Ja. Eine Testanfrage ist kostenlos und unverbindlich. Der Testzugang endet von selbst: Sie müssen nichts kündigen. Ein kostenloser Testzugang pro Kunde.' }] },
      { id: 'check', icon: 'check', title: 'Was sollte ich während des Testzeitraums prüfen?', body: [{ list: [
        'Ob die App auf Ihrem Gerät funktioniert.',
        'Ob das Bild mit Ihrer Internetverbindung flüssig läuft.',
        'Wie viele Geräte Sie brauchen.',
        'Wie Sie uns erreichen, wenn die Einrichtung nicht klappt.',
      ] }] },
    ],
  },
  {
    slug: 'ordering-payment', name: 'Bestellung und Zahlung', icon: 'card',
    title: 'Bestellung und Zahlung',
    metaTitle: 'Bestellung und Zahlung: So funktioniert es',
    description: 'So bestellen Sie SYGMA TV+: Formular senden, unser Team kontaktiert Sie per WhatsApp und aktiviert Ihren Zugang, dann zahlen Sie. Zahlungsmethoden erklärt.',
    summary: 'Bestellformular, Aktivierung, dann Zahlung.',
    intro: 'Sie bestellen über ein kurzes Formular. Unser Team kontaktiert Sie per WhatsApp und aktiviert Ihren Zugang, und Sie bezahlen nach der Aktivierung. Auf dieser Website wird nichts abgebucht.',
    prelaunch: { description: 'Online-Bestellungen sind in Kürze möglich. So wird die Bestellung ablaufen: Bestellformular, Kontakt und Aktivierung per WhatsApp, dann Zahlung.', sections: { order: { title: 'So wird die Bestellung ablaufen', body: [
      { p: 'Online-Bestellungen sind in Kürze möglich. Tarife, Laufzeiten und Preise können Sie schon jetzt im Bereich „Tarife“ vergleichen.' },
      { steps: ORDER_STEPS },
    ] } } },
    sections: [
      { id: 'order', icon: 'rocket', title: 'Wie bestelle ich?', body: [
        { p: 'Die Bestellung erfolgt in sechs Schritten, vom Formular auf unserer Website bis zur Bestätigung Ihrer Zahlung. Klicken Sie zum Start im Bereich „Tarife“ auf „Jetzt bestellen“.' },
        { steps: ORDER_STEPS },
      ] },
      { id: 'pay', icon: 'card', title: 'Wann und wie bezahle ich?', body: [
        { p: 'Sie bezahlen, nachdem Ihr Zugang aktiviert wurde – nie auf dieser Website. Hier werden weder eine Zahlung noch Kartendaten verlangt: Unser Team sendet Ihnen die Zahlungsmethoden per WhatsApp. Akzeptierte Zahlungsmethoden:' },
        { chips: [...F.paymentMethods], label: 'Zahlungsmethoden' },
        { note: 'Alle Zahlungen werden manuell mit unserem Team abgewickelt; keine wird automatisch auf dieser Website abgebucht. Unser Team sagt Ihnen, welche Methoden für Ihre Bestellung verfügbar sind.' },
      ] },
      { id: 'activation', icon: 'clock', title: 'Wie lange dauert die Aktivierung?', body: [{ p: `Unser Team aktiviert Ihren Zugang in der Regel ${F.usualActivation} – ein üblicher Wert, keine Garantie. Sie bezahlen, sobald Ihr Zugang aktiv ist.` }] },
      { id: 'emails', icon: 'mail', title: 'Welche E-Mails erhalte ich?', body: [{ list: [
        'Direkt nach dem Absenden des Formulars: eine Eingangsbestätigung per E-Mail.',
        CONFIRMATION_EMAIL,
      ] }] },
      { id: 'prices', icon: 'tag', title: 'Preise und Steuern', body: [{ p: 'Die Preise werden in US-Dollar (USD) zzgl. Steuern angezeigt, und den Preis Ihres Tarifs sehen Sie, bevor Sie Ihre Bestellung absenden. Längere Laufzeiten kosten weniger pro Jahr: Die aktuellen Preise finden Sie im Bereich „Tarife“.' }] },
      { id: 'contract', icon: 'scale', title: 'Wann beginnt mein Abo?', body: [{ p: 'Der Vertrag beginnt, wenn unser Team Ihre Bestellung bestätigt. Tarife verlängern sich nie automatisch.' }] },
    ],
  },
  {
    slug: 'troubleshooting', name: 'Fehlerbehebung', icon: 'activity',
    title: 'Fehlerbehebung',
    metaTitle: 'Fehlerbehebung: Wiedergabe, Login und App',
    description: 'Häufige Probleme mit SYGMA TV+ lösen: ruckelndes Bild, abgelehnte Zugangsdaten, App nicht im Store, App schließt sich, Wiedergabe über mobile Daten.',
    summary: 'Bild-, Login- und App-Probleme.',
    intro: 'Die meisten Probleme liegen an der Verbindung oder an einem Tippfehler in den Zugangsdaten. Probieren Sie zuerst diese Schritte.',
    sections: [
      { id: 'stutter', icon: 'activity', title: 'Das Bild ruckelt oder friert ein', body: [{ p: 'Starten Sie Ihren Router und Ihr Gerät neu. Nutzen Sie nach Möglichkeit ein Netzwerkkabel oder stellen Sie das Gerät näher an Ihren WLAN-Router, und versuchen Sie es dann erneut.' }] },
      { id: 'login', icon: 'lock', title: 'Meine Zugangsdaten werden abgelehnt', body: [{ p: 'Prüfen Sie Leerzeichen sowie Groß- und Kleinschreibung, oder kopieren Sie die Daten aus unserer WhatsApp-Nachricht und fügen Sie sie ein. Klappt es immer noch nicht, senden Sie uns ein Foto der Fehlermeldung.' }] },
      { id: 'store', icon: 'tv', title: 'Ich finde die App nicht in meinem Store', body: [{ p: 'Das App-Angebot hängt vom Gerätemodell und vom Land ab. Senden Sie uns Marke, Modell und Baujahr Ihres Geräts: Wir sagen Ihnen, was dafür funktioniert.' }] },
      { id: 'crash', icon: 'pause', title: 'Die App schließt sich von selbst', body: [{ p: 'Starten Sie das Gerät neu, installieren Sie die verfügbaren System- und App-Updates und versuchen Sie es dann erneut.' }] },
      { id: 'mobile', icon: 'devices', title: 'Die Wiedergabe bricht über mobile Daten ab', body: [{ p: 'Die Qualität hängt von Ihrem Mobilfunknetz und Ihrem Datentarif ab. Wechseln Sie nach Möglichkeit ins WLAN.' }] },
      { id: 'still', icon: 'mail', title: 'Funktioniert es immer noch nicht?', body: [{ p: `Kontaktieren Sie uns mit Ihrem Gerätemodell und einem Foto der Fehlermeldung. Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team; wir antworten in der Regel ${F.usualReply}.` }] },
    ],
  },
  {
    slug: 'contact-support', name: 'Support kontaktieren', icon: 'mail',
    title: 'Unser Support-Team kontaktieren',
    metaTitle: 'Support kontaktieren: E-Mail und WhatsApp',
    description: `Support von SYGMA TV+ per E-Mail, WhatsApp oder Kontaktformular: automatischer Assistent ${F.supportHours}, bei Bedarf Hilfe vom Team. Was Sie angeben sollten.`,
    summary: `E-Mail oder WhatsApp, automatischer Assistent ${F.supportHours}.`,
    intro: `Kontaktieren Sie uns per E-Mail oder WhatsApp. Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team.`,
    // While online requests are closed, the contact form, WhatsApp and the phone are not offered as a way to reach us: e-mail only.
    prelaunch: {
      metaTitle: 'Support per E-Mail kontaktieren',
      description: `Support von SYGMA TV+ per E-Mail für allgemeine Fragen: automatischer Assistent ${F.supportHours}, bei Bedarf Hilfe vom Team. Was Sie angeben sollten.`,
      summary: `Per E-Mail, automatischer Assistent ${F.supportHours}.`,
      intro: `Kontaktieren Sie uns per E-Mail. Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team.`,
      sections: { reach: { body: [{ list: [`E-Mail: ${EMAIL}.`] }] } },
    },
    sections: [
      { id: 'reach', icon: 'mail', title: 'So erreichen Sie uns', body: [{ list: [
        `E-Mail: ${EMAIL}.`,
        `WhatsApp oder Telefon: ${PHONE}.`,
        'Kontaktformular: Klicken Sie unten auf einer beliebigen Seite auf „Kontakt“.',
      ] }] },
      { id: 'availability', icon: 'clock', title: 'Wann antworten Sie?', body: [{ p: `Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team. Wir antworten in der Regel ${F.usualReply}. Das ist unsere übliche Antwortzeit, keine vertragliche Garantie.` }] },
      { id: 'languages', icon: 'globe', title: 'Welche Sprachen?', body: [
        { p: `Sie können uns auf ${LANGS} schreiben.` },
        { chips: [...F.languages], label: 'Support-Sprachen' },
        { note: 'Unsere Rechtsdokumente sind auf Englisch verfasst.' },
      ] },
      { id: 'include', icon: 'pencil', title: 'Was Sie angeben sollten', body: [{ list: [
        'Ihre Bestellreferenz, falls vorhanden.',
        'Ihr Gerät mit Marke und Modell.',
        'Was Sie gerade getan haben, als das Problem auftrat, und ein Foto der Fehlermeldung.',
      ] }] },
    ],
  },
  {
    slug: 'refunds', name: 'Erstattungen', icon: 'refund',
    title: 'Erstattungen und Kündigungen',
    metaTitle: 'Erstattung: 7 Tage Geld zurück und Widerruf',
    description: 'Erstattungen bei SYGMA TV+: erst kostenlos testen, 100 % zurück binnen 7 Tagen ab Aktivierung, 14 Tage Widerruf für Kunden in EU und UK, so geht’s.',
    // While free trials are closed, only the « free trial first » fragment changes (refund and withdrawal wording unchanged).
    prelaunch: { description: 'Erstattungen bei SYGMA TV+: Testzugang in Kürze, 100 % zurück binnen 7 Tagen ab Aktivierung, 14 Tage Widerruf für Kunden in EU und UK, so geht’s.' },
    summary: '7 Tage Geld-zurück-Garantie, so beantragen Sie sie.',
    intro: 'Erst testen, dann volle Erstattung, wenn Sie innerhalb von 7 Tagen nach der Aktivierung nicht zufrieden sind. Die vollständige Richtlinie finden Sie auf unserer Seite zu Erstattungen (auf Englisch).',
    sections: [
      { id: 'guarantee', icon: 'refund', title: '7 Tage Geld-zurück-Garantie', body: [{ p: 'Nicht zufrieden? Melden Sie sich innerhalb von 7 Tagen nach der Aktivierung, und wir erstatten 100 % – ohne Angabe von Gründen. Eine Erstattung pro Kunde; nicht möglich bei Konten, die wegen Teilens oder Weiterverkaufs des Zugangs gesperrt wurden.' }] },
      { id: 'withdrawal', icon: 'scale', title: 'Kunden in der EU und im Vereinigten Königreich', body: [{ p: 'Sie haben zusätzlich 14 Tage Zeit für Ihren Widerruf. Nach den ersten 7 Tagen erstatten wir den nicht genutzten Teil Ihres Abos.' }] },
      { id: 'how', icon: 'mail', title: 'So beantragen Sie eine Erstattung', body: [{ p: `Senden Sie Ihre Bestellreferenz an ${EMAIL} oder per WhatsApp. Die Erstattung erfolgt innerhalb von 14 Tagen über die Zahlungsmethode, die Sie verwendet haben.` }] },
      { id: 'after', icon: 'pause', title: 'Nach Ablauf dieser Fristen', body: [{ p: 'Nach Ablauf dieser Fristen sind Abos nicht erstattungsfähig, sofern das Gesetz nichts anderes vorschreibt. Sie verlängern sich nie automatisch.' }] },
    ],
  },
];

/** Interface labels of the About / Help pages. */
const INFO_UI: InfoUi = {
  home: 'Startseite',
  breadcrumb: 'Brotkrümelnavigation',
  support: 'Support',
  popular: 'Häufige Fragen',
  topics: 'Hilfethemen',
  glance: 'Support auf einen Blick',
  helpFacts: [
    { k: 'Automatischer Assistent', v: F.supportHours, small: 'Team-Hilfe per E-Mail und WhatsApp' },
    { k: 'Übliche Antwortzeit', v: 'Unter einer Stunde', small: 'Üblicher Wert, keine Garantie' },
    { k: 'Sprachen', v: String(F.languages.length), small: F.languages.join(' · ') },
    { k: 'Aktivierung', v: 'Meist < 1 Stunde', small: 'Vor der Zahlung, nach Bestätigung Ihrer Bestellung' },
  ],
  aboutFacts: [
    { k: 'Gegründet', v: F.established, small: F.basedIn },
    { k: 'Unternehmen', v: siteConfig.legalEntity ?? '', small: 'New Mexico (USA)' },
    { k: 'Automatischer Assistent', v: F.supportHours, small: 'Bei Bedarf Hilfe vom Team' },
    { k: 'Support-Sprachen', v: String(F.languages.length), small: F.languages.join(' · ') },
  ],
  aboutContact: `Fragen zu SYGMA TV+? Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team.`,
  hubContact: 'Keine Antwort gefunden? Schreiben Sie uns – nennen Sie Ihr Gerät und, falls vorhanden, Ihre Bestellreferenz.',
  topicContact: `Brauchen Sie weitere Hilfe? Kontaktieren Sie uns per E-Mail oder WhatsApp. Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team.`,
  hubRelated: [
    { href: '/de/about', label: 'Über uns' },
    { href: '/de#faq', label: 'FAQ' },
    { href: '/legal/refunds', label: 'Erstattungen & Kündigungen (auf Englisch)' },
    { href: '/legal/terms', label: 'Nutzungsbedingungen (auf Englisch)' },
  ],
  refundPolicy: { href: '/legal/refunds', label: 'Vollständige Erstattungsrichtlinie (auf Englisch)' },
  terms: { href: '/legal/terms', label: 'Nutzungsbedingungen (auf Englisch)' },
  allTopics: 'Alle Hilfethemen',
  prevTopic: 'Vorheriges Thema',
  nextTopic: 'Nächstes Thema',
  content: {
    contactUs: 'Kontakt',
    email: 'E-Mail',
    phone: 'Telefon / WhatsApp',
    related: 'Weiterführende Seiten',
    onThisPage: 'Auf dieser Seite',
    lastReviewed: 'Zuletzt geprüft: ',
  },
  actions: { trial: 'Jetzt kostenlos testen', support: 'Support kontaktieren', plans: 'Tarife ansehen', plansHref: '/de#plans' },
  prelaunch: {
    topicContact: `Brauchen Sie weitere Hilfe? Kontaktieren Sie uns per E-Mail. Unser automatischer Assistent ist ${F.supportHours} erreichbar, bei Bedarf mit persönlicher Unterstützung durch unser Team.`,
    availability: 'Team-Hilfe per E-Mail',
  },
};

export const INFO: InfoContentSet = {
  about: ABOUT,
  hub: HELP_HUB,
  topics: HELP_TOPICS,
  reviewed: '20. November 2026',
  supportHours: '24/7',
  ui: INFO_UI,
};
