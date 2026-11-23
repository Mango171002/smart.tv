/**
 * « Om oss » + Hjelpesenter in Norwegian Bokmål (phase 8 — PREVIEW ONLY, not published).
 *
 * Faithful translation of src/content/en/info.ts (owner-validated facts, 20/11/2026): same facts, same order of
 * the ordering flow (bestilling → kontakt på WhatsApp → aktivering → betaling → bekreftelse av betalingen), same
 * « usually » wording for times (« vanligvis », never a contractual guarantee). No claim added. Informal « du ».
 * Links: Norwegian pages under /nb (same English slugs); legal documents stay in English (/legal/*).
 * To be reviewed by a native speaker before publication (docs/i18n/phase8-translation-brief.md).
 */
import type { InfoContentSet, InfoPage, InfoUi } from '@/content/en/info';
import { siteConfig } from '@/config/site';

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';
/** « 24 hours » → « 24 timer » (« en gratis prøveperiode på 24 timer »). */
const TRIAL = (siteConfig.trialDuration ?? '24 hours').replace(/^(\d+) hours?$/, (_, n: string) => `${n} timer`);

export const OWNER_FACTS = {
  established: '2026',
  supportHours: '24/7',
  basedIn: 'USA',
  usualReply: 'under en time',
  usualActivation: 'innen en time etter at bestillingen din er bekreftet på WhatsApp',
  languages: ['Engelsk', 'Fransk', 'Arabisk', 'Tysk', 'Spansk', 'Italiensk'],
  /** Arranged by our team on WhatsApp once the subscription is active — none of them is charged on this website. */
  paymentMethods: ['Visa-/Mastercard-kort', 'PayPal', 'Kryptovaluta (USDT via Binance)', 'Bankoverføring', 'Western Union', 'MoneyGram'],
} as const;

const F = OWNER_FACTS;

/** The six steps of an order, in the real order: activation first, payment after, then the confirmation email. */
const ORDER_STEPS = [
  { title: 'Velg abonnement', text: 'Velg abonnement, varighet og antall enheter på nettstedet vårt. Prisen vises med en gang.' },
  { title: 'Send bestillingen', text: 'Fyll ut det korte bestillingsskjemaet: e-postadresse, land og WhatsApp-nummer. Du blir ikke belastet på dette nettstedet. Du får en e-post som bekrefter at vi har mottatt bestillingen din.' },
  { title: 'Vi kontakter deg på WhatsApp', text: 'En person fra teamet vårt kontakter deg på WhatsApp for å bekrefte bestillingen.' },
  { title: 'Vi aktiverer abonnementet ditt', text: `Vi sender deg innloggingsopplysninger og oppsettsinstruksjoner på WhatsApp. Aktiveringen skjer vanligvis ${F.usualActivation}.` },
  { title: 'Du betaler', text: 'Når tilgangen din er aktiv, betaler du med en av betalingsmåtene teamet vårt tilbyr deg.' },
  { title: 'Betalingen er bekreftet', text: 'Når vi har mottatt og bekreftet betalingen din, får du en e-post som bekrefter at abonnementet ditt er aktivt, med ordrenummeret ditt.' },
];
const CONFIRMATION_EMAIL = 'Når vi har mottatt og bekreftet betalingen din, får du en e-post som bekrefter at abonnementet ditt er aktivt, med ordrenummeret og detaljene om abonnementet ditt.';
const LANGS = `${F.languages.slice(0, -1).map((l) => l.toLowerCase()).join(', ')} eller ${F.languages[F.languages.length - 1]!.toLowerCase()}`;

// ---------------------------------------------------------------- Om oss
const ABOUT: InfoPage = {
  slug: 'about',
  name: 'Om oss',
  title: 'Om SYGMA TV+',
  metaTitle: 'Om oss: selskap, kundestøtte og forpliktelser',
  description: 'SYGMA TV+ er et merke for digital underholdning fra Sygma TV LLC, etablert i USA i 2026. Les om tjenesten, forpliktelsene våre og kundestøtten.',
  intro: `SYGMA TV+ er et internasjonalt merke for digital underholdning, etablert i ${F.basedIn} i ${F.established}. Vi tilbyr strømmeabonnementer for TV, mobil og datamaskin, med et kundestøtteteam du kan nå ${F.supportHours} på seks språk.`,
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Hvem vi er',
      body: [
        { p: `SYGMA TV+ — «One World. Endless Entertainment.» — er et merke fra ${siteConfig.legalEntity}, et selskap etablert i ${F.established} og registrert i delstaten New Mexico i USA.` },
        { p: 'Abonnementene tegnes for hele år (12, 24 eller 36 måneder), med 1 enhet inkludert og opptil 4. Før du kjøper, kan du teste tjenesten på din egen enhet med en gratis prøveperiode.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Selskapsinformasjon',
      body: [
        { facts: [
          ['Selskap', siteConfig.legalEntity],
          ['Etablert', F.established],
          ['Registrert adresse', siteConfig.legalAddress],
          ['Registrert i', 'USA (New Mexico)'],
          ['EIN', siteConfig.companyNumber],
          ['E-post', siteConfig.supportEmail],
          ['Telefon / WhatsApp', siteConfig.supportPhone],
        ] },
      ],
    },
    {
      id: 'how', icon: 'rocket', title: 'Slik fungerer tjenesten',
      body: [
        { p: 'Du bestiller med et kort skjema, og et ekte menneske fra teamet vårt følger opp på WhatsApp. Vi aktiverer abonnementet ditt først, og du betaler ikke før tilgangen din er aktiv.' },
        { steps: ORDER_STEPS },
        { p: `Fortsatt usikker? Be om en gratis prøveperiode på ${TRIAL} først: ingenting å betale og ingenting å si opp.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'Våre forpliktelser',
      body: [
        { list: [
          'Tydelige priser: prisen vises på nettstedet vårt før du bestiller, og du betaler først etter at abonnementet ditt er aktivert.',
          'Ingen automatisk fornyelse: du bestemmer selv om du vil fornye.',
          '7 dagers pengene-tilbake-garanti etter aktivering; kunder i EU og Storbritannia har i tillegg 14 dagers angrerett.',
          'Dataene dine brukes bare til å behandle henvendelsen og abonnementet ditt. Vi selger dem aldri.',
          'Ingen falske anmeldelser.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'users', title: 'Flerspråklig kundestøtte',
      body: [
        { p: `Teamet vårt er tilgjengelig ${F.supportHours} og svarer vanligvis på ${F.usualReply}. Dette er den vanlige svartiden vår, ikke en avtalefestet garanti.` },
        { chips: [...F.languages], label: 'Språk for kundestøtte' },
        { note: 'Kundestøtteteamet vårt snakker disse seks språkene; de juridiske dokumentene våre er på engelsk.' },
      ],
    },
    {
      id: 'payment', icon: 'card', title: 'Aktivering, betaling og bekreftelse',
      body: [
        { p: `Du blir ikke belastet på dette nettstedet. Vi aktiverer abonnementet ditt først — vanligvis ${F.usualActivation} — og du betaler når tilgangen din er aktiv, med en av disse betalingsmåtene:` },
        { chips: [...F.paymentMethods], label: 'Betalingsmåter' },
        { note: 'Hver betaling avtales manuelt med teamet vårt på WhatsApp — ingen betaling trekkes automatisk på dette nettstedet. Teamet vårt forteller deg hvilke betalingsmåter som er tilgjengelige for bestillingen din.' },
        { p: CONFIRMATION_EMAIL },
      ],
    },
    {
      id: 'links', icon: 'info', title: 'Nyttige lenker',
      body: [
        { links: [
          { href: '/nb/help', label: 'Hjelpesenter', text: 'Prøveperiode, bestilling, enheter, refusjon' },
          { href: '/nb/help/contact-support', label: 'Kontakt kundestøtte', text: `E-post eller WhatsApp, ${F.supportHours}` },
          { href: '/nb#plans', label: 'Abonnementer', text: 'Velg abonnement og se prisen' },
          { href: '/legal/refunds', label: 'Refusjon og oppsigelse', text: '7 dagers pengene-tilbake-garanti (på engelsk)' },
          { href: '/legal/terms', label: 'Brukervilkår', text: 'Reglene, forklart enkelt (på engelsk)' },
          { href: '/legal/imprint', label: 'Juridisk informasjon', text: 'Selskapsopplysninger (på engelsk)' },
        ] },
      ],
    },
  ],
};

// ---------------------------------------------------------------- Hjelpesenter
const HELP_HUB = {
  name: 'Hjelpesenter',
  title: 'Hjelpesenter',
  metaTitle: 'Hjelpesenter: prøveperiode, bestilling, refusjon',
  description: 'Få svar om SYGMA TV+: gratis prøveperiode, bestilling og betaling, støttede enheter, feilsøking, refusjon og hvordan du kontakter kundestøtten.',
  intro: `Tydelige svar om gratis prøveperiode, bestilling, betaling, enheter og refusjon. Står du fast? Teamet vårt er tilgjengelig ${F.supportHours}.`,
  popular: [
    { q: 'Når og hvordan betaler jeg?', href: '/nb/help/ordering-payment#pay' },
    { q: 'Hvor lang tid tar aktiveringen?', href: '/nb/help/ordering-payment#activation' },
    { q: 'Er prøveperioden virkelig gratis?', href: '/nb/help/free-trial#cost' },
    { q: 'Hvilke enheter kan jeg bruke?', href: '/nb/help/devices#categories' },
    { q: 'Hvor raskt svarer kundestøtten?', href: '/nb/help/contact-support#availability' },
    { q: 'Hvordan får jeg refusjon?', href: '/nb/help/refunds#how' },
  ],
};

const HELP_TOPICS: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Kom i gang', icon: 'rocket',
    title: 'Kom i gang med SYGMA TV+',
    metaTitle: 'Kom i gang med SYGMA TV+',
    description: 'Slik fungerer SYGMA TV+, fra du velger abonnement til du er i gang: gratis prøveperiode, bestillingsskjema, kontakt og aktivering på WhatsApp, så betaling.',
    summary: 'Fra valg av abonnement til første avspilling.',
    intro: 'Du kommer i gang med noen få steg. Du kan begynne med en gratis prøveperiode eller bestille direkte.',
    sections: [
      { id: 'steps', icon: 'rocket', title: 'Stegene', body: [{ steps: [
        { title: 'Velg abonnement', text: 'Under «Abonnementer» velger du abonnement, varighet (12, 24 eller 36 måneder) og antall enheter.' },
        { title: 'Prøveperiode eller bestilling', text: 'Be om en gratis prøveperiode, eller send bestillingen med det korte skjemaet: e-postadresse, land og WhatsApp-nummer.' },
        { title: 'Vi kontakter deg på WhatsApp', text: 'Teamet vårt kontakter deg på WhatsApp, sender deg innloggingsopplysningene og forteller deg hvilken app du skal installere.' },
        { title: 'Først aktivering, så betaling', text: `Ved bestilling aktiverer vi abonnementet ditt først — vanligvis ${F.usualActivation}. Du betaler når tilgangen din er aktiv.` },
        { title: 'Begynn å se', text: 'Installer appen, skriv inn innloggingsopplysningene og start avspillingen.' },
      ] }] },
      { id: 'good-to-know', icon: 'info', title: 'Greit å vite', body: [{ list: [
        'Du blir ikke belastet på dette nettstedet.',
        'Du betaler etter at abonnementet ditt er aktivert, med en betalingsmåte som teamet vårt tilbyr.',
        'Én gratis prøveperiode per kunde.',
        'Alle abonnementer inkluderer 1 enhet; du kan legge til flere, opptil 4.',
        'Abonnementene fornyes aldri automatisk.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Støttede enheter', icon: 'devices',
    title: 'Støttede enheter',
    metaTitle: 'Støttede enheter: TV, strømmeenheter og mobil',
    description: 'SYGMA TV+ brukes på smart-TV-er, strømmebokser og -pinner, mobiler, nettbrett og datamaskiner. Hvor mange enheter du kan bruke, og hvordan du sjekker din.',
    summary: 'TV, strømmeenheter, mobil og datamaskin.',
    intro: 'SYGMA TV+ brukes på TV-er, strømmeenheter, mobiler og datamaskiner. Med den gratis prøveperioden kan du sjekke din egen enhet og tilkobling før du kjøper.',
    sections: [
      { id: 'categories', icon: 'devices', title: 'Hvilke enheter?', body: [{ list: [
        'Smart-TV-er.',
        'Strømmebokser og -pinner.',
        'Smarttelefoner og nettbrett.',
        'Datamaskiner.',
      ] }, { p: 'Sammen med innloggingsopplysningene forteller teamet vårt deg hvilken app du skal installere på enheten din, og hjelper deg med oppsettet.' }] },
      { id: 'how-many', icon: 'users', title: 'Hvor mange enheter samtidig?', body: [{ p: 'Alle abonnementer inkluderer 1 enhet. Du kan legge til enheter når du bestiller, opptil 4. Abonnementet er til personlig bruk i husstanden din: deling eller videresalg av tilgangen er ikke tillatt.' }] },
      { id: 'quality', icon: 'activity', title: 'Bildekvalitet', body: [{ p: 'Bildekvaliteten avhenger av abonnementet, innholdet, enheten og internettforbindelsen din. En stabil forbindelse — helst med nettverkskabel, eller med enheten nær Wi-Fi-ruteren — betyr mest.' }] },
      { id: 'check', icon: 'check', title: 'Sjekk enheten din først', body: [{ p: `Be om en gratis prøveperiode på ${TRIAL}, så kan du teste tjenesten på din egen enhet og tilkobling før du kjøper.` }] },
    ],
  },
  {
    slug: 'free-trial', name: 'Gratis prøveperiode', icon: 'calendar',
    title: 'Gratis prøveperiode',
    metaTitle: 'Gratis prøveperiode: slik tester du SYGMA TV+',
    description: `Test SYGMA TV+ gratis i ${TRIAL} på din egen enhet før du kjøper. Slik ber du om prøveperioden og hva som skjer etterpå — ingenting å betale eller si opp.`,
    summary: `${TRIAL[0]!.toUpperCase()}${TRIAL.slice(1)}, gratis, ingenting å si opp.`,
    intro: `Med den gratis prøveperioden kan du teste SYGMA TV+ i ${TRIAL} på din egen enhet og tilkobling før du bestemmer deg.`,
    sections: [
      { id: 'request', icon: 'rocket', title: 'Hvordan ber jeg om den?', body: [{ steps: [
        { title: 'Åpne skjemaet', text: 'Velg «Prøv gratis» øverst på en hvilken som helst side.' },
        { title: 'Legg igjen opplysningene dine', text: 'Fullt navn, e-postadresse og telefonnummer med landskode, og godta å bli kontaktet.' },
        { title: 'Få tilgang', text: 'Teamet vårt kontakter deg på WhatsApp med innloggingsopplysningene og appen du skal installere.' },
      ] }] },
      { id: 'cost', icon: 'tag', title: 'Er den virkelig gratis?', body: [{ p: 'Ja. Det er gratis å be om en prøveperiode, og det forplikter deg ikke til noe. Prøveperioden avsluttes automatisk: det er ingenting å si opp. Én gratis prøveperiode per kunde.' }] },
      { id: 'check', icon: 'check', title: 'Hva bør jeg sjekke i prøveperioden?', body: [{ list: [
        'At appen fungerer på enheten din.',
        'At bildet går jevnt med internettforbindelsen din.',
        'Hvor mange enheter du kommer til å trenge.',
        'Hvordan du når oss hvis oppsettet ikke fungerer.',
      ] }] },
    ],
  },
  {
    slug: 'ordering-payment', name: 'Bestilling og betaling', icon: 'card',
    title: 'Bestilling og betaling',
    metaTitle: 'Bestilling og betaling: slik fungerer det',
    description: 'Slik bestiller du SYGMA TV+: send skjemaet, teamet vårt kontakter deg på WhatsApp og aktiverer tilgangen, så betaler du. Betalingsmåtene forklart.',
    summary: 'Bestillingsskjema, aktivering, så betaling.',
    intro: 'Du bestiller med et kort skjema. Teamet vårt kontakter deg på WhatsApp og aktiverer tilgangen din, og du betaler etter aktiveringen. Du blir ikke belastet på dette nettstedet.',
    sections: [
      { id: 'order', icon: 'rocket', title: 'Hvordan bestiller jeg?', body: [
        { p: 'Bestillingen skjer i seks steg, fra skjemaet på nettstedet vårt til bekreftelsen av betalingen din. Velg «Bestill nå» under «Abonnementer» for å begynne.' },
        { steps: ORDER_STEPS },
      ] },
      { id: 'pay', icon: 'card', title: 'Når og hvordan betaler jeg?', body: [
        { p: 'Du betaler etter at tilgangen din er aktivert — aldri på dette nettstedet. Vi ber ikke om betaling eller kortopplysninger her: teamet vårt sender deg betalingsmåtene på WhatsApp. Vi tar imot:' },
        { chips: [...F.paymentMethods], label: 'Betalingsmåter' },
        { note: 'Alle betalinger avtales manuelt med teamet vårt; ingen betaling trekkes automatisk på dette nettstedet. Teamet vårt forteller deg hvilke betalingsmåter som er tilgjengelige for bestillingen din.' },
      ] },
      { id: 'activation', icon: 'clock', title: 'Hvor lang tid tar aktiveringen?', body: [{ p: `Teamet vårt aktiverer vanligvis tilgangen din ${F.usualActivation} — en vanlig behandlingstid, ikke en garanti. Du betaler når tilgangen din er aktiv.` }] },
      { id: 'emails', icon: 'mail', title: 'Hvilke e-poster får jeg?', body: [{ list: [
        'Rett etter at du har sendt skjemaet: en e-post som bekrefter at vi har mottatt bestillingen din.',
        CONFIRMATION_EMAIL,
      ] }] },
      { id: 'prices', icon: 'tag', title: 'Priser og avgifter', body: [{ p: 'Prisene vises i amerikanske dollar (USD) eksklusive avgifter, og prisen på abonnementet ditt vises før du sender bestillingen. Lengre varighet koster mindre per år: se gjeldende priser under «Abonnementer».' }] },
      { id: 'contract', icon: 'scale', title: 'Når starter abonnementet mitt?', body: [{ p: 'Avtalen starter når teamet vårt bekrefter bestillingen din. Abonnementene fornyes aldri automatisk.' }] },
    ],
  },
  {
    slug: 'troubleshooting', name: 'Feilsøking', icon: 'activity',
    title: 'Feilsøking',
    metaTitle: 'Feilsøking: avspilling, innlogging og apper',
    description: 'Løs vanlige problemer med SYGMA TV+: hakkete bilde, innlogging som avvises, app som mangler i appbutikken, app som lukker seg, avspilling på mobildata.',
    summary: 'Problemer med bilde, innlogging og app.',
    intro: 'De fleste problemer skyldes tilkoblingen eller en skrivefeil i innloggingsopplysningene. Prøv disse stegene først.',
    sections: [
      { id: 'stutter', icon: 'activity', title: 'Bildet hakker eller fryser', body: [{ p: 'Start internettruteren og enheten din på nytt. Bruk nettverkskabel hvis du kan, eller flytt enheten nærmere Wi-Fi-ruteren, og prøv igjen.' }] },
      { id: 'login', icon: 'lock', title: 'Innloggingsopplysningene mine avvises', body: [{ p: 'Sjekk mellomrom og store/små bokstaver, eller kopier og lim inn opplysningene fra WhatsApp-meldingen vår. Hvis det fortsatt ikke fungerer, send oss et bilde av skjermen med feilmeldingen.' }] },
      { id: 'store', icon: 'tv', title: 'Jeg finner ikke appen i appbutikken', body: [{ p: 'Utvalget i appbutikkene avhenger av enhetsmodell og land. Send oss merke, modell og årsmodell for enheten din, så forteller vi deg hva som fungerer på den.' }] },
      { id: 'crash', icon: 'pause', title: 'Appen lukker seg av seg selv', body: [{ p: 'Start enheten på nytt, installer tilgjengelige system- og appoppdateringer, og prøv igjen.' }] },
      { id: 'mobile', icon: 'devices', title: 'Avspillingen stopper på mobildata', body: [{ p: 'Kvaliteten avhenger av mobilnettet og mobilabonnementet ditt. Bytt til Wi-Fi hvis du kan.' }] },
      { id: 'still', icon: 'mail', title: 'Fungerer det fortsatt ikke?', body: [{ p: `Kontakt oss ${F.supportHours} med enhetsmodellen din og et bilde av eventuelle feilmeldinger: teamet vårt svarer vanligvis på ${F.usualReply}.` }] },
    ],
  },
  {
    slug: 'contact-support', name: 'Kontakt kundestøtte', icon: 'mail',
    title: 'Kontakt kundestøtteteamet vårt',
    metaTitle: 'Kundestøtte: e-post og WhatsApp, 24/7',
    description: `Kontakt kundestøtten til SYGMA TV+ ${F.supportHours} på e-post, WhatsApp eller via kontaktskjemaet, på seks språk. Dette bør du ta med for å få raskere svar.`,
    summary: `${F.supportHours}, e-post eller WhatsApp, seks språk.`,
    intro: `Teamet vårt svarer på e-post og WhatsApp, ${F.supportHours}.`,
    sections: [
      { id: 'reach', icon: 'mail', title: 'Slik når du oss', body: [{ list: [
        `E-post: ${EMAIL}.`,
        `WhatsApp eller telefon: ${PHONE}.`,
        'Kontaktskjemaet: velg «Kontakt» nederst på en hvilken som helst side.',
      ] }] },
      { id: 'availability', icon: 'clock', title: 'Når svarer dere?', body: [{ p: `Teamet vårt er tilgjengelig ${F.supportHours} og svarer vanligvis på ${F.usualReply}. Dette er den vanlige svartiden vår, ikke en avtalefestet garanti.` }] },
      { id: 'languages', icon: 'globe', title: 'Hvilke språk?', body: [
        { p: `Du kan skrive til oss på ${LANGS}.` },
        { chips: [...F.languages], label: 'Språk for kundestøtte' },
        { note: 'De juridiske dokumentene våre er på engelsk.' },
      ] },
      { id: 'include', icon: 'pencil', title: 'Hva du bør ta med', body: [{ list: [
        'Ordrereferansen din, hvis du har en.',
        'Enheten din, med merke og modell.',
        'Hva du gjorde da problemet oppsto, og et bilde av eventuelle feilmeldinger.',
      ] }] },
    ],
  },
  {
    slug: 'refunds', name: 'Refusjon', icon: 'refund',
    title: 'Refusjon og oppsigelse',
    metaTitle: 'Refusjon: pengene tilbake i 7 dager og angrerett',
    description: 'Refusjon hos SYGMA TV+: prøv gratis først, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett i EU og Storbritannia, og slik ber du om det.',
    summary: '7 dagers pengene-tilbake-garanti, slik ber du om det.',
    intro: 'Prøv først, og få full refusjon hvis du ikke er fornøyd innen 7 dager etter aktivering. De fullstendige retningslinjene finner du på refusjonssiden vår (på engelsk).',
    sections: [
      { id: 'guarantee', icon: 'refund', title: '7 dagers pengene-tilbake-garanti', body: [{ p: 'Ikke fornøyd? Be om refusjon innen 7 dager etter aktivering, så får du 100 % tilbake, uten at vi stiller spørsmål. Én refusjon per kunde; gjelder ikke kontoer som er suspendert på grunn av deling eller videresalg av tilgangen.' }] },
      { id: 'withdrawal', icon: 'scale', title: 'Kunder i EU og Storbritannia', body: [{ p: 'Du har i tillegg 14 dagers angrerett. Etter de første 7 dagene refunderer vi den ubrukte delen av abonnementet ditt.' }] },
      { id: 'how', icon: 'mail', title: 'Slik ber du om refusjon', body: [{ p: `Send ordrereferansen din til ${EMAIL} eller på WhatsApp. Du får pengene tilbake innen 14 dager, til betalingsmåten du brukte.` }] },
      { id: 'after', icon: 'pause', title: 'Etter disse fristene', body: [{ p: 'Abonnementer refunderes ikke etter disse fristene, med mindre loven krever det. De fornyes aldri automatisk.' }] },
    ],
  },
];

/** Interface labels of the About / Help pages. */
const INFO_UI: InfoUi = {
  home: 'Hjem',
  breadcrumb: 'Brødsmulesti',
  support: 'Kundestøtte',
  popular: 'Populære spørsmål',
  topics: 'Hjelpeemner',
  glance: 'Kundestøtte i korte trekk',
  helpFacts: [
    { k: 'Tilgjengelighet', v: F.supportHours, small: 'E-post og WhatsApp' },
    { k: 'Vanlig svartid', v: 'Under en time', small: 'Vanlig tid, ikke en garanti' },
    { k: 'Språk', v: String(F.languages.length), small: F.languages.join(' · ') },
    { k: 'Aktivering', v: 'Vanligvis < 1 time', small: 'Før betaling, etter at bestillingen er bekreftet' },
  ],
  aboutFacts: [
    { k: 'Etablert', v: F.established, small: F.basedIn },
    { k: 'Selskap', v: siteConfig.legalEntity ?? '', small: 'New Mexico (USA)' },
    { k: 'Kundestøtte', v: F.supportHours, small: `Svarer vanligvis på ${F.usualReply}` },
    { k: 'Språk for kundestøtte', v: String(F.languages.length), small: F.languages.join(' · ') },
  ],
  aboutContact: `Spørsmål om SYGMA TV+? Teamet vårt er tilgjengelig ${F.supportHours}.`,
  hubContact: 'Finner du ikke svaret? Skriv til oss — oppgi enheten din og eventuelt ordrereferansen din.',
  topicContact: `Trenger du fortsatt hjelp? Teamet vårt svarer på e-post og WhatsApp, ${F.supportHours}.`,
  hubRelated: [
    { href: '/nb/about', label: 'Om oss' },
    { href: '/nb#faq', label: 'FAQ' },
    { href: '/legal/refunds', label: 'Refusjon og oppsigelse (på engelsk)' },
    { href: '/legal/terms', label: 'Brukervilkår (på engelsk)' },
  ],
  refundPolicy: { href: '/legal/refunds', label: 'Fullstendige retningslinjer for refusjon (på engelsk)' },
  terms: { href: '/legal/terms', label: 'Brukervilkår (på engelsk)' },
  allTopics: 'Alle hjelpeemner',
  prevTopic: 'Forrige emne',
  nextTopic: 'Neste emne',
  content: {
    contactUs: 'Kontakt oss',
    email: 'E-post',
    phone: 'Telefon / WhatsApp',
    related: 'Relaterte sider',
    onThisPage: 'På denne siden',
    lastReviewed: 'Sist gjennomgått: ',
  },
  actions: { trial: 'Be om gratis prøveperiode', support: 'Kontakt kundestøtte', plans: 'Se abonnementene', plansHref: '/nb#plans' },
};

export const INFO: InfoContentSet = {
  about: ABOUT,
  hub: HELP_HUB,
  topics: HELP_TOPICS,
  reviewed: '20. november 2026',
  supportHours: '24/7',
  ui: INFO_UI,
};
