/**
 * « Over ons » + Helpcentrum in het Nederlands (phase 8 — PREVIEW ONLY, not published). Market: Netherlands, « je ».
 *
 * Faithful adaptation of src/content/en/info.ts (owner-validated facts, 20/11/2026): same facts, same order of the
 * ordering flow (bestelling → contact via WhatsApp → activering → betaling → bevestiging van de betaling), same
 * « usually » wording for times (« meestal », never a contractual guarantee). No claim added.
 * Links: Dutch pages under /nl (same English slugs); legal documents stay in English (/legal/*).
 * To be reviewed by a native speaker before publication (docs/i18n/phase8-translation-brief.md).
 */
import type { InfoContentSet, InfoPage, InfoUi } from '@/content/en/info';
import { siteConfig } from '@/config/site';

export const INFO_REVIEWED_NL = '20 november 2026';

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';
/** « 24 hours » → « 24 uur » (« een gratis proefperiode van 24 uur »). */
const TRIAL = (siteConfig.trialDuration ?? '24 hours').replace(/^(\d+) hours?$/, '$1 uur');

export const OWNER_FACTS = {
  established: '2026',
  basedIn: 'Verenigde Staten',
  supportHours: '24/7',
  usualReply: 'binnen een uur',
  usualActivation: 'binnen een uur nadat je bestelling via WhatsApp is bevestigd',
  languages: ['Engels', 'Frans', 'Arabisch', 'Duits', 'Spaans', 'Italiaans'],
  /** Arranged by our team on WhatsApp once the subscription is active — none of them is charged on this website. */
  paymentMethods: ['Kaart (Visa / Mastercard)', 'PayPal', 'Cryptovaluta (USDT via Binance)', 'Bankoverschrijving', 'Western Union', 'MoneyGram'],
} as const;

const F = OWNER_FACTS;

/** The six steps of an order, in the real order: activation first, payment after, then the confirmation email. */
const ORDER_STEPS = [
  { title: 'Kies je abonnement', text: 'Kies op onze website je abonnement, de looptijd en het aantal apparaten. Je ziet meteen de prijs.' },
  { title: 'Verstuur je bestelling', text: 'Vul het korte bestelformulier in: je e-mailadres, je land en je WhatsApp-nummer. Op deze website wordt niets afgerekend. Je ontvangt een e-mail waarin we bevestigen dat we je bestelling hebben ontvangen.' },
  { title: 'We nemen contact op via WhatsApp', text: 'Iemand van ons team neemt via WhatsApp contact met je op om je bestelling te bevestigen.' },
  { title: 'We activeren je abonnement', text: `We sturen je je inloggegevens en de installatie-instructies via WhatsApp. De activering gebeurt meestal ${F.usualActivation}.` },
  { title: 'Je betaalt', text: 'Zodra je toegang actief is, betaal je met een van de betaalmethoden die ons team je aanbiedt.' },
  { title: 'Betaling bevestigd', text: 'Zodra we je betaling hebben ontvangen en bevestigd, krijg je een e-mail waarin we bevestigen dat je abonnement actief is, met je bestelnummer.' },
];
const CONFIRMATION_EMAIL = 'Zodra we je betaling hebben ontvangen en bevestigd, krijg je een e-mail waarin we bevestigen dat je abonnement actief is, met je bestelnummer en de details van je abonnement.';
const LANGS = `${F.languages.slice(0, -1).join(', ')} of ${F.languages[F.languages.length - 1]}`;

// ---------------------------------------------------------------- Over ons
const ABOUT: InfoPage = {
  slug: 'about',
  name: 'Over ons',
  title: 'Over SYGMA TV+',
  metaTitle: 'Over ons: bedrijf, klantenservice en beloften',
  description: 'SYGMA TV+ is een merk voor digitaal entertainment van Sygma TV LLC, opgericht in 2026 in de Verenigde Staten. Werkwijze, beloften en klantenservice.',
  intro: `SYGMA TV+ is een internationaal merk voor digitaal entertainment, opgericht in ${F.established} in de ${F.basedIn}. We bieden streamingabonnementen voor je tv, mobiel en computer, met ${F.supportHours} klantenservice in zes talen.`,
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Wie we zijn',
      body: [
        { p: `SYGMA TV+ — “One World. Endless Entertainment.” — is een merk van ${siteConfig.legalEntity}, een bedrijf dat in ${F.established} is opgericht en geregistreerd staat in de staat New Mexico, Verenigde Staten.` },
        { p: 'Abonnementen lopen per jaar (12, 24 of 36 maanden), met 1 apparaat inbegrepen en maximaal 4. Voordat je koopt, kun je de dienst met een gratis proefperiode op je eigen apparaat testen.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Bedrijfsgegevens',
      body: [
        { facts: [
          ['Bedrijf', siteConfig.legalEntity],
          ['Opgericht', F.established],
          ['Vestigingsadres', siteConfig.legalAddress?.replace(/United States$/, 'Verenigde Staten') ?? null],
          ['Geregistreerd in', 'Verenigde Staten (New Mexico)'],
          ['EIN', siteConfig.companyNumber],
          ['E-mail', siteConfig.supportEmail],
          ['Telefoon / WhatsApp', siteConfig.supportPhone],
        ] },
      ],
    },
    {
      id: 'how', icon: 'rocket', title: 'Hoe de dienst werkt',
      body: [
        { p: 'Je bestelt met een kort formulier en daarna neemt een echte medewerker van ons team het over via WhatsApp. We activeren eerst je abonnement: je betaalt pas als je toegang actief is.' },
        { steps: ORDER_STEPS },
        { p: `Twijfel je nog? Vraag eerst een gratis proefperiode van ${TRIAL} aan: niets te betalen en niets op te zeggen.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'Onze beloften',
      body: [
        { list: [
          'Duidelijke prijzen: je ziet de prijs op onze website voordat je bestelt, en je betaalt pas nadat je abonnement is geactiveerd.',
          'Geen automatische verlenging: jij beslist of je verlengt.',
          '7 dagen geld-terug-garantie na activering; klanten in de EU en het VK behouden daarnaast hun herroepingsrecht van 14 dagen.',
          'Je gegevens worden alleen gebruikt om je aanvraag en je abonnement af te handelen. We verkopen ze nooit.',
          'Geen nepreviews.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'users', title: 'Meertalige klantenservice',
      body: [
        { p: `Onze automatische assistent is ${F.supportHours} beschikbaar, met hulp van een medewerker wanneer dat nodig is. We antwoorden meestal ${F.usualReply}. Dit is onze gebruikelijke reactietijd, geen contractuele garantie.` },
        { chips: [...F.languages], label: 'Talen van de klantenservice' },
        { note: 'Onze klantenservice spreekt deze zes talen, dus persoonlijke hulp krijg je in het Engels. Ook onze juridische documenten zijn in het Engels.' },
      ],
    },
    {
      id: 'payment', icon: 'card', title: 'Activering, betaling en bevestiging',
      body: [
        { p: `Op deze website wordt niets afgerekend. We activeren eerst je abonnement — meestal ${F.usualActivation} — en je betaalt zodra je toegang actief is, met een van deze methoden:` },
        { chips: [...F.paymentMethods], label: 'Betaalmethoden' },
        { note: 'Elke betaling wordt handmatig met ons team via WhatsApp geregeld — er wordt nooit automatisch iets afgerekend op deze website. Ons team laat je weten welke methoden beschikbaar zijn voor je bestelling.' },
        { p: CONFIRMATION_EMAIL },
      ],
    },
    {
      id: 'links', icon: 'info', title: 'Handige links',
      body: [
        { links: [
          { href: '/nl/help', label: 'Helpcentrum', text: 'Proefperiode, bestellen, apparaten, terugbetaling' },
          { href: '/nl/help/contact-support', label: 'Contact met de klantenservice', text: `E-mail of WhatsApp, ${F.supportHours}` },
          { href: '/nl#plans', label: 'Abonnementen', text: 'Kies je abonnement en bekijk de prijs' },
          { href: '/legal/refunds', label: 'Terugbetaling en opzegging', text: '7 dagen geld-terug-garantie (in het Engels)' },
          { href: '/legal/terms', label: 'Algemene voorwaarden', text: 'De regels, in duidelijke taal (in het Engels)' },
          { href: '/legal/imprint', label: 'Juridische informatie', text: 'Bedrijfsgegevens (in het Engels)' },
        ] },
      ],
    },
  ],
  prelaunch: {
    sections: {
      how: { body: [
        { p: 'Je bestelt met een kort formulier en daarna neemt een echte medewerker van ons team het over via WhatsApp. We activeren eerst je abonnement: je betaalt pas als je toegang actief is.' },
        { steps: ORDER_STEPS },
        { p: `Een gratis proefperiode aanvragen is binnenkort mogelijk: dan kun je de dienst ${TRIAL} testen voordat je koopt.` },
      ] },
    },
  },
};

// ---------------------------------------------------------------- Helpcentrum
const HELP_HUB = {
  name: 'Helpcentrum',
  title: 'Helpcentrum',
  metaTitle: 'Helpcentrum: proefperiode, bestellen, apparaten',
  description: 'Antwoorden over de gratis proefperiode van SYGMA TV+, bestellen en betalen, apparaten, problemen oplossen, terugbetaling en contact met de klantenservice.',
  intro: `Duidelijke antwoorden over de gratis proefperiode, bestellen, betalen, apparaten en terugbetaling. Kom je er niet uit? Onze automatische assistent is ${F.supportHours} beschikbaar, met hulp van een medewerker wanneer dat nodig is.`,
  popular: [
    { q: 'Wanneer en hoe betaal ik?', href: '/nl/help/ordering-payment#pay' },
    { q: 'Hoelang duurt de activering?', href: '/nl/help/ordering-payment#activation' },
    { q: 'Is de proefperiode echt gratis?', href: '/nl/help/free-trial#cost' },
    { q: 'Welke apparaten kan ik gebruiken?', href: '/nl/help/devices#categories' },
    { q: 'Hoe snel antwoordt de klantenservice?', href: '/nl/help/contact-support#availability' },
    { q: 'Hoe krijg ik mijn geld terug?', href: '/nl/help/refunds#how' },
  ],
};

const HELP_TOPICS: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Aan de slag', icon: 'rocket',
    title: 'Aan de slag met SYGMA TV+',
    metaTitle: 'Aan de slag met SYGMA TV+',
    description: 'Zo werkt SYGMA TV+, van abonnement kiezen tot kijken: gratis proefperiode, bestelformulier, contact en activering via WhatsApp, daarna betaling.',
    summary: 'Van je abonnementskeuze tot je eerste stream.',
    intro: 'Aan de slag gaan doe je in een paar stappen. Je kunt beginnen met een gratis proefperiode of direct bestellen.',
    prelaunch: { intro: 'Online bestellen en een gratis proefperiode aanvragen is binnenkort mogelijk. Hier lees je hoe je straks aan de slag gaat.' },
    sections: [
      { id: 'steps', icon: 'rocket', title: 'De stappen', body: [{ steps: [
        { title: 'Kies je abonnement', text: 'Kies in het onderdeel Abonnementen het abonnement, de looptijd (12, 24 of 36 maanden) en het aantal apparaten.' },
        { title: 'Proefperiode of bestelling', text: 'Vraag een gratis proefperiode aan, of verstuur je bestelling met het korte formulier: je e-mailadres, je land en je WhatsApp-nummer.' },
        { title: 'We nemen contact op via WhatsApp', text: 'Ons team neemt via WhatsApp contact met je op, stuurt je inloggegevens en vertelt je welke app je moet installeren.' },
        { title: 'Activering, daarna betaling', text: `Bij een bestelling activeren we eerst je abonnement — meestal ${F.usualActivation}. Je betaalt zodra je toegang actief is.` },
        { title: 'Begin met kijken', text: 'Installeer de app, voer je inloggegevens in en start een stream.' },
      ] }] },
      { id: 'good-to-know', icon: 'info', title: 'Goed om te weten', body: [{ list: [
        'Op deze website wordt niets afgerekend.',
        'Je betaalt nadat je abonnement is geactiveerd, met een betaalmethode die ons team je aanbiedt.',
        'Eén gratis proefperiode per klant.',
        'Elk abonnement bevat 1 apparaat; je kunt apparaten toevoegen, tot maximaal 4.',
        'Abonnementen worden nooit automatisch verlengd.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Ondersteunde apparaten', icon: 'devices',
    title: 'Ondersteunde apparaten',
    metaTitle: 'Ondersteunde apparaten: tv, boxen, mobiel',
    description: 'Je gebruikt SYGMA TV+ op Smart TV’s, streamingboxen en -sticks, smartphones, tablets en computers. Het aantal apparaten en hoe je je eigen apparaat test.',
    summary: 'Tv, streamingapparaten, mobiel en computer.',
    intro: 'Je gebruikt SYGMA TV+ op tv’s, streamingapparaten, mobiele telefoons en computers. Met de gratis proefperiode test je je eigen apparaat en verbinding voordat je koopt.',
    sections: [
      { id: 'categories', icon: 'devices', title: 'Welke apparaten?', body: [{ list: [
        'Smart TV’s.',
        'Streamingboxen en -sticks.',
        'Smartphones en tablets.',
        'Computers.',
      ] }, { p: 'Samen met je inloggegevens laat ons team je weten welke app je op je apparaat moet installeren, en we helpen je bij de installatie.' }] },
      { id: 'how-many', icon: 'users', title: 'Hoeveel apparaten tegelijk?', body: [{ p: 'Elk abonnement bevat 1 apparaat. Bij je bestelling kun je apparaten toevoegen, tot maximaal 4. Het abonnement is voor persoonlijk gebruik binnen je huishouden: toegang delen of doorverkopen is niet toegestaan.' }] },
      { id: 'quality', icon: 'activity', title: 'Beeldkwaliteit', body: [{ p: 'De beeldkwaliteit hangt af van je abonnement, de content, je apparaat en je internetverbinding. Een stabiele verbinding — liefst een netwerkkabel, of een apparaat dicht bij je wifirouter — maakt het grootste verschil.' }] },
      { id: 'check', icon: 'check', title: 'Test eerst je apparaat', body: [{ p: `Vraag een gratis proefperiode van ${TRIAL} aan: je test de dienst op je eigen apparaat en verbinding voordat je koopt.` }] },
    ],
  },
  {
    slug: 'free-trial', name: 'Gratis proefperiode', icon: 'calendar',
    title: 'De gratis proefperiode',
    metaTitle: 'Gratis proefperiode: SYGMA TV+ uitproberen',
    description: `Probeer SYGMA TV+ ${TRIAL} gratis op je eigen apparaat voordat je koopt. Hoe aanvragen werkt en wat er daarna gebeurt — niets betalen, niets opzeggen.`,
    summary: `${TRIAL[0]!.toUpperCase()}${TRIAL.slice(1)} gratis, niets op te zeggen.`,
    intro: `Met de gratis proefperiode test je SYGMA TV+ ${TRIAL} lang op je eigen apparaat en verbinding, voordat je beslist.`,
    prelaunch: { sections: { request: { body: [{ p: 'Een gratis proefperiode aanvragen is binnenkort mogelijk. Tot die tijd kan een proefperiode niet per e-mail of via een ander kanaal worden geregeld.' }] } } },
    sections: [
      { id: 'request', icon: 'rocket', title: 'Hoe vraag ik de proefperiode aan?', body: [{ steps: [
        { title: 'Open het formulier', text: 'Klik op “Gratis proberen” bovenaan elke pagina.' },
        { title: 'Laat je gegevens achter', text: 'Je volledige naam, je e-mailadres en je telefoonnummer met landcode, en geef toestemming om contact met je op te nemen.' },
        { title: 'Ontvang je toegang', text: 'Ons team stuurt je via WhatsApp je inloggegevens en vertelt je welke app je moet installeren.' },
      ] }] },
      { id: 'cost', icon: 'tag', title: 'Is het echt gratis?', body: [{ p: 'Ja. Een proefperiode aanvragen is gratis en verplicht je tot niets. De proefperiode stopt vanzelf: je hoeft niets op te zeggen. Eén gratis proefperiode per klant.' }] },
      { id: 'check', icon: 'check', title: 'Wat kan ik tijdens de proefperiode testen?', body: [{ list: [
        'Of de app werkt op je apparaat.',
        'Of het beeld vloeiend loopt via je internetverbinding.',
        'Hoeveel apparaten je nodig hebt.',
        'Hoe je ons bereikt als de installatie niet lukt.',
      ] }] },
    ],
  },
  {
    slug: 'ordering-payment', name: 'Bestellen en betalen', icon: 'card',
    title: 'Bestellen en betalen',
    metaTitle: 'Bestellen en betalen: zo werkt het',
    description: 'Zo bestel je SYGMA TV+: formulier versturen, contact en activering via WhatsApp, daarna betalen. Met uitleg over de betaalmethoden.',
    summary: 'Bestelformulier, activering, daarna betaling.',
    intro: 'Je bestelt met een kort formulier. Ons team neemt via WhatsApp contact met je op en activeert je toegang, en je betaalt na de activering. Op deze website wordt niets afgerekend.',
    prelaunch: { sections: { order: { title: 'Hoe bestellen straks werkt', body: [
      { p: 'Online bestellen is binnenkort mogelijk. Je kunt de abonnementen, looptijden en prijzen nu al vergelijken in het onderdeel Abonnementen.' },
      { steps: ORDER_STEPS },
    ] } } },
    sections: [
      { id: 'order', icon: 'rocket', title: 'Hoe bestel ik?', body: [
        { p: 'Bestellen gaat in zes stappen, van het formulier op onze website tot de bevestiging van je betaling. Klik om te beginnen op “Nu bestellen” in het onderdeel Abonnementen.' },
        { steps: ORDER_STEPS },
      ] },
      { id: 'pay', icon: 'card', title: 'Wanneer en hoe betaal ik?', body: [
        { p: 'Je betaalt nadat je toegang is geactiveerd — nooit op deze website. We vragen hier geen betaling en geen kaartgegevens: ons team stuurt je de betaalopties via WhatsApp. Geaccepteerde methoden:' },
        { chips: [...F.paymentMethods], label: 'Betaalmethoden' },
        { note: 'Alle betalingen worden handmatig met ons team geregeld; er wordt nooit automatisch iets afgerekend op deze website. Ons team laat je weten welke methoden beschikbaar zijn voor je bestelling.' },
      ] },
      { id: 'activation', icon: 'clock', title: 'Hoelang duurt de activering?', body: [{ p: `Ons team activeert je toegang meestal ${F.usualActivation} — een gebruikelijke termijn, geen garantie. Je betaalt zodra je toegang actief is.` }] },
      { id: 'emails', icon: 'mail', title: 'Welke e-mails ontvang ik?', body: [{ list: [
        'Direct nadat je het formulier hebt verstuurd: een e-mail waarin we bevestigen dat we je bestelling hebben ontvangen.',
        CONFIRMATION_EMAIL,
      ] }] },
      { id: 'prices', icon: 'tag', title: 'Prijzen en belastingen', body: [{ p: 'Prijzen worden getoond in Amerikaanse dollars (USD), exclusief belastingen, en je ziet de prijs van je abonnement voordat je je bestelling verstuurt. Langere looptijden kosten minder per jaar: bekijk de actuele prijzen in het onderdeel Abonnementen.' }] },
      { id: 'contract', icon: 'scale', title: 'Wanneer begint mijn abonnement?', body: [{ p: 'Het contract begint wanneer ons team je bestelling bevestigt. Abonnementen worden nooit automatisch verlengd.' }] },
    ],
  },
  {
    slug: 'troubleshooting', name: 'Problemen oplossen', icon: 'activity',
    title: 'Problemen oplossen',
    metaTitle: 'Problemen oplossen: afspelen, inloggen, apps',
    description: 'Los veelvoorkomende problemen met SYGMA TV+ op: haperend beeld, geweigerde inloggegevens, app niet in je store, app die afsluit, kijken via mobiele data.',
    summary: 'Problemen met beeld, inloggen en apps.',
    intro: 'De meeste problemen komen door de verbinding of door een typfout in de inloggegevens. Probeer eerst deze stappen.',
    sections: [
      { id: 'stutter', icon: 'activity', title: 'Het beeld hapert of bevriest', body: [{ p: 'Herstart je internetrouter en je apparaat. Gebruik zo mogelijk een netwerkkabel of zet het apparaat dichter bij je wifirouter, en probeer het opnieuw.' }] },
      { id: 'login', icon: 'lock', title: 'Mijn inloggegevens worden geweigerd', body: [{ p: 'Controleer spaties en hoofdletters/kleine letters, of kopieer en plak de gegevens uit ons WhatsApp-bericht. Lukt het nog steeds niet? Stuur ons een foto van het foutscherm.' }] },
      { id: 'store', icon: 'tv', title: 'Ik vind de app niet in mijn store', body: [{ p: 'Welke appstore je hebt, hangt af van het apparaatmodel en het land. Stuur ons het merk, het model en het bouwjaar van je apparaat: we vertellen je wat erop werkt.' }] },
      { id: 'crash', icon: 'pause', title: 'De app sluit vanzelf af', body: [{ p: 'Herstart het apparaat, installeer de beschikbare systeem- en app-updates en probeer het opnieuw.' }] },
      { id: 'mobile', icon: 'devices', title: 'Afspelen stopt op mobiele data', body: [{ p: 'De kwaliteit hangt af van je mobiele netwerk en je databundel. Schakel zo mogelijk over op wifi.' }] },
      { id: 'still', icon: 'mail', title: 'Werkt het nog steeds niet?', body: [{ p: `Neem ${F.supportHours} contact met ons op met je apparaatmodel en een foto van een eventuele foutmelding: we antwoorden meestal ${F.usualReply}.` }] },
    ],
  },
  {
    slug: 'contact-support', name: 'Contact met de klantenservice', icon: 'mail',
    title: 'Neem contact op met onze klantenservice',
    metaTitle: 'Klantenservice: e-mail en WhatsApp, 24/7',
    description: `Bereik de klantenservice van SYGMA TV+ ${F.supportHours} per e-mail, via WhatsApp of met het contactformulier, in zes talen. Tips voor een sneller antwoord.`,
    summary: `${F.supportHours}, e-mail of WhatsApp, zes talen.`,
    intro: `Neem contact op per e-mail of via WhatsApp. Onze automatische assistent is ${F.supportHours} beschikbaar, met hulp van een medewerker wanneer dat nodig is.`,
    prelaunch: {
      description: `Bereik de klantenservice van SYGMA TV+ ${F.supportHours} per e-mail of via WhatsApp, in zes talen. Tips voor een sneller antwoord.`,
      sections: { reach: { body: [{ list: [`E-mail: ${EMAIL}.`, `WhatsApp of telefoon: ${PHONE}.`] }] } },
    },
    sections: [
      { id: 'reach', icon: 'mail', title: 'Zo bereik je ons', body: [{ list: [
        `E-mail: ${EMAIL}.`,
        `WhatsApp of telefoon: ${PHONE}.`,
        'Het contactformulier: klik op “Contact” onderaan elke pagina.',
      ] }] },
      { id: 'availability', icon: 'clock', title: 'Wanneer antwoorden jullie?', body: [{ p: `Onze automatische assistent is ${F.supportHours} beschikbaar, met hulp van een medewerker wanneer dat nodig is. Onze medewerkers helpen je in het Engels. We antwoorden meestal ${F.usualReply}. Dit is onze gebruikelijke reactietijd, geen contractuele garantie.` }] },
      { id: 'languages', icon: 'globe', title: 'Welke talen?', body: [
        { p: `Je kunt ons schrijven in het ${LANGS}.` },
        { chips: [...F.languages], label: 'Talen van de klantenservice' },
        { note: 'Nederlands hoort er niet bij: onze medewerkers helpen je graag in het Engels. Ook onze juridische documenten zijn in het Engels.' },
      ] },
      { id: 'include', icon: 'pencil', title: 'Wat je het best vermeldt', body: [{ list: [
        'Je bestelreferentie, als je die hebt.',
        'Je apparaat, met merk en model.',
        'Wat je aan het doen was toen het probleem begon, en een foto van een eventuele foutmelding.',
      ] }] },
    ],
  },
  {
    slug: 'refunds', name: 'Terugbetaling', icon: 'refund',
    title: 'Terugbetaling en opzegging',
    metaTitle: 'Terugbetaling: 7 dagen geld terug en herroeping',
    description: 'Terugbetaling bij SYGMA TV+: eerst gratis proberen, dan 100% terug binnen 7 dagen na activering, 14 dagen herroeping (EU en VK) en hoe je het aanvraagt.',
    summary: '7 dagen geld terug, zo vraag je het aan.',
    intro: 'Eerst proberen, daarna volledige terugbetaling als je binnen 7 dagen na activering niet tevreden bent. Het volledige beleid staat op onze pagina Terugbetaling (in het Engels).',
    sections: [
      { id: 'guarantee', icon: 'refund', title: '7 dagen geld-terug-garantie', body: [{ p: 'Niet tevreden? Vraag het binnen 7 dagen na activering aan en we betalen 100% terug, zonder vragen. Eén terugbetaling per klant; niet mogelijk voor accounts die zijn geblokkeerd wegens het delen of doorverkopen van toegang.' }] },
      { id: 'withdrawal', icon: 'scale', title: 'Klanten in de EU en het VK', body: [{ p: 'Je hebt daarnaast 14 dagen herroepingsrecht. Na de eerste 7 dagen betalen we het ongebruikte deel van je abonnement terug.' }] },
      { id: 'how', icon: 'mail', title: 'Zo vraag je het aan', body: [{ p: `Stuur je bestelreferentie naar ${EMAIL} of via WhatsApp. Je krijgt je geld binnen 14 dagen terug, via de betaalmethode die je hebt gebruikt.` }] },
      { id: 'after', icon: 'pause', title: 'Na deze termijnen', body: [{ p: 'Na deze termijnen worden abonnementen niet terugbetaald, tenzij de wet dat vereist. Ze worden nooit automatisch verlengd.' }] },
    ],
  },
];

/** Interface labels of the About / Help pages. */
const INFO_UI: InfoUi = {
  home: 'Home',
  breadcrumb: 'Kruimelpad',
  support: 'Klantenservice',
  popular: 'Populaire vragen',
  topics: 'Helponderwerpen',
  glance: 'Klantenservice in één oogopslag',
  helpFacts: [
    { k: 'Bereikbaarheid', v: F.supportHours, small: 'E-mail en WhatsApp' },
    { k: 'Gebruikelijke reactietijd', v: 'Binnen een uur', small: 'Gebruikelijke tijd, geen garantie' },
    { k: 'Talen', v: String(F.languages.length), small: F.languages.join(' · ') },
    { k: 'Activering', v: 'Meestal < 1 uur', small: 'Vóór de betaling, nadat je bestelling is bevestigd' },
  ],
  aboutFacts: [
    { k: 'Opgericht', v: F.established, small: F.basedIn },
    { k: 'Bedrijf', v: siteConfig.legalEntity ?? '', small: 'New Mexico, VS' },
    { k: 'Klantenservice', v: F.supportHours, small: `Antwoordt meestal ${F.usualReply}` },
    { k: 'Talen van de klantenservice', v: String(F.languages.length), small: F.languages.join(' · ') },
  ],
  aboutContact: `Vragen over SYGMA TV+? Onze automatische assistent is ${F.supportHours} beschikbaar, met hulp van een medewerker wanneer dat nodig is.`,
  hubContact: 'Staat je antwoord er niet bij? Schrijf ons — vermeld je apparaat en, als je die hebt, je bestelreferentie.',
  topicContact: `Nog hulp nodig? Neem contact op per e-mail of via WhatsApp. Onze automatische assistent is ${F.supportHours} beschikbaar, met hulp van een medewerker wanneer dat nodig is.`,
  hubRelated: [
    { href: '/nl/about', label: 'Over ons' },
    { href: '/nl#faq', label: 'FAQ' },
    { href: '/legal/refunds', label: 'Terugbetaling en opzegging (in het Engels)' },
    { href: '/legal/terms', label: 'Algemene voorwaarden (in het Engels)' },
  ],
  refundPolicy: { href: '/legal/refunds', label: 'Volledig terugbetalingsbeleid (in het Engels)' },
  terms: { href: '/legal/terms', label: 'Algemene voorwaarden (in het Engels)' },
  allTopics: 'Alle helponderwerpen',
  prevTopic: 'Vorig onderwerp',
  nextTopic: 'Volgend onderwerp',
  content: {
    contactUs: 'Neem contact op',
    email: 'E-mail',
    phone: 'Telefoon / WhatsApp',
    related: 'Gerelateerde pagina’s',
    onThisPage: 'Op deze pagina',
    lastReviewed: 'Laatst gecontroleerd: ',
  },
  actions: { trial: 'Vraag een gratis proefperiode aan', support: 'Contact met de klantenservice', plans: 'Bekijk de abonnementen', plansHref: '/nl#plans' },
};

export const INFO: InfoContentSet = {
  about: ABOUT,
  hub: HELP_HUB,
  topics: HELP_TOPICS,
  reviewed: INFO_REVIEWED_NL,
  supportHours: F.supportHours,
  ui: INFO_UI,
};
