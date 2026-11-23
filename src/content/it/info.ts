/**
 * « Chi siamo » + Centro assistenza in italiano (phase 8 — PREVIEW ONLY, not published).
 *
 * Adapted from src/content/en/info.ts (owner-validated facts, 20/11/2026): same facts, same order of the ordering
 * flow (ordine → contatto WhatsApp → attivazione → pagamento → conferma del pagamento), same « usually » wording for
 * times (« di solito », never a contractual guarantee). No claim added. Markets: Italy and Italian-speaking
 * Switzerland, informal « tu ».
 * Links: Italian pages under /it (same English slugs); legal documents stay in English (/legal/*).
 * To be reviewed by a native speaker before publication (docs/i18n/phase8-translation-brief.md).
 */
import type { InfoContentSet, InfoPage, InfoUi } from '@/content/en/info';
import { siteConfig } from '@/config/site';

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';
/** « 24 hours » → « 24 ore » (« una prova gratuita di 24 ore »). */
const TRIAL = (siteConfig.trialDuration ?? '24 hours').replace(/^(\d+) hours?$/, (_, n: string) => (n === '1' ? '1 ora' : `${n} ore`));
/** Postal address: only the country name is localised. */
const ADDRESS = (siteConfig.legalAddress ?? '').replace(/United States$/, 'Stati Uniti');

export const OWNER_FACTS = {
  established: '2026',
  basedIn: 'Stati Uniti',
  supportHours: '24/7',
  usualReply: 'meno di un’ora',
  usualActivation: 'entro un’ora dalla conferma del tuo ordine su WhatsApp',
  languages: ['Inglese', 'Francese', 'Arabo', 'Tedesco', 'Spagnolo', 'Italiano'],
  paymentMethods: ['Carta Visa / Mastercard', 'PayPal', 'Criptovaluta (USDT tramite Binance)', 'Bonifico bancario', 'Western Union', 'MoneyGram'],
} as const;

const F = OWNER_FACTS;

const ORDER_STEPS = [
  { title: 'Scegli il tuo piano', text: 'Scegli sul nostro sito il piano, la durata e il numero di dispositivi. Il prezzo viene mostrato subito.' },
  { title: 'Invia il tuo ordine', text: 'Compila il breve modulo d’ordine: la tua email, il tuo paese e il tuo numero WhatsApp. Nessun addebito su questo sito. Riceverai un’email che conferma la ricezione del tuo ordine.' },
  { title: 'Ti contattiamo su WhatsApp', text: 'Un membro del nostro team ti contatta su WhatsApp per confermare il tuo ordine.' },
  { title: 'Attiviamo il tuo abbonamento', text: `Ti inviamo su WhatsApp i dati di accesso e le istruzioni per la configurazione. L’attivazione avviene di solito ${F.usualActivation}.` },
  { title: 'Effettui il pagamento', text: 'Una volta attivato il tuo accesso, paghi con uno dei metodi di pagamento proposti dal nostro team.' },
  { title: 'Pagamento confermato', text: 'Quando avremo ricevuto e confermato il tuo pagamento, riceverai un’email con la conferma che il tuo abbonamento è attivo e il numero d’ordine.' },
];
const CONFIRMATION_EMAIL = 'Quando avremo ricevuto e confermato il tuo pagamento, riceverai un’email con la conferma che il tuo abbonamento è attivo, il numero d’ordine e i dettagli dell’abbonamento.';
const LANGS = `${F.languages.slice(0, -1).map((l) => l.toLowerCase()).join(', ')} o ${F.languages[F.languages.length - 1]!.toLowerCase()}`;

// ---------------------------------------------------------------- Chi siamo
const ABOUT: InfoPage = {
  slug: 'about',
  name: 'Chi siamo',
  title: 'Chi è SYGMA TV+',
  metaTitle: 'Chi siamo: società, assistenza e impegni',
  description: 'SYGMA TV+ è un marchio di intrattenimento digitale di Sygma TV LLC, fondata negli Stati Uniti nel 2026. Come funziona, i nostri impegni e l’assistenza.',
  intro: `SYGMA TV+ è un marchio internazionale di intrattenimento digitale, nato negli ${F.basedIn} nel ${F.established}. Offriamo abbonamenti streaming per TV, smartphone e computer, con assistenza clienti ${F.supportHours} in sei lingue.`,
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Chi siamo',
      body: [
        { p: `SYGMA TV+ — «One World. Endless Entertainment.» — è un marchio di ${siteConfig.legalEntity}, società fondata nel ${F.established} e registrata nello Stato del Nuovo Messico, negli Stati Uniti.` },
        { p: 'I piani sono annuali (12, 24 o 36 mesi), con 1 dispositivo incluso e fino a 4. Prima di acquistare puoi provare il servizio sul tuo dispositivo con una prova gratuita.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Dati della società',
      body: [
        { facts: [
          ['Società', siteConfig.legalEntity],
          ['Fondazione', F.established],
          ['Sede legale', ADDRESS],
          ['Registrazione', 'Stati Uniti (Nuovo Messico)'],
          ['EIN', siteConfig.companyNumber],
          ['Email', siteConfig.supportEmail],
          ['Telefono / WhatsApp', siteConfig.supportPhone],
        ] },
      ],
    },
    {
      id: 'how', icon: 'rocket', title: 'Come funziona il servizio',
      body: [
        { p: 'Ordini con un breve modulo e una persona vera del nostro team ti segue su WhatsApp. Prima attiviamo il tuo abbonamento: paghi solo quando il tuo accesso è attivo.' },
        { steps: ORDER_STEPS },
        { p: `Hai ancora qualche dubbio? Chiedi prima una prova gratuita di ${TRIAL}: niente da pagare e niente da disdire.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'I nostri impegni',
      body: [
        { list: [
          'Prezzi chiari: il prezzo è indicato sul nostro sito prima dell’ordine e paghi solo dopo l’attivazione del tuo abbonamento.',
          'Nessun rinnovo automatico: decidi tu se rinnovare.',
          'Soddisfatti o rimborsati per 7 giorni dall’attivazione; i clienti di UE e Regno Unito mantengono inoltre il diritto di recesso di 14 giorni.',
          'I tuoi dati sono usati solo per gestire la tua richiesta e il tuo abbonamento. Non li vendiamo mai.',
          'Nessuna recensione falsa.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'users', title: 'Assistenza multilingue',
      body: [
        { p: `Il nostro assistente automatico è disponibile ${F.supportHours}, con assistenza umana quando serve. Di solito rispondiamo in ${F.usualReply}. È il nostro tempo di risposta abituale, non una garanzia contrattuale.` },
        { chips: [...F.languages], label: 'Lingue dell’assistenza' },
        { note: 'Il nostro team di assistenza parla queste sei lingue; i documenti legali sono redatti in inglese.' },
      ],
    },
    {
      id: 'payment', icon: 'card', title: 'Attivazione, pagamento e conferma',
      body: [
        { p: `Nessun addebito su questo sito. Prima attiviamo il tuo abbonamento — di solito ${F.usualActivation} — e paghi quando il tuo accesso è attivo, con uno di questi metodi:` },
        { chips: [...F.paymentMethods], label: 'Metodi di pagamento' },
        { note: 'Ogni pagamento viene concordato manualmente con il nostro team su WhatsApp — nessuno viene addebitato automaticamente su questo sito. Il nostro team ti indica i metodi disponibili per il tuo ordine.' },
        { p: CONFIRMATION_EMAIL },
      ],
    },
    {
      id: 'links', icon: 'info', title: 'Link utili',
      body: [
        { links: [
          { href: '/it/help', label: 'Centro assistenza', text: 'Prova, ordini, dispositivi, rimborsi' },
          { href: '/it/help/contact-support', label: 'Contatta l’assistenza', text: `Email o WhatsApp, ${F.supportHours}` },
          { href: '/it#plans', label: 'Piani', text: 'Scegli il tuo piano e scopri il prezzo' },
          { href: '/legal/refunds', label: 'Rimborsi e disdette', text: 'Soddisfatti o rimborsati per 7 giorni (in inglese)' },
          { href: '/legal/terms', label: 'Termini di servizio', text: 'Le regole, in parole semplici (in inglese)' },
          { href: '/legal/imprint', label: 'Note legali', text: 'Dati della società (in inglese)' },
        ] },
      ],
    },
  ],
  prelaunch: {
    sections: {
      how: { body: [
        { p: 'Ordini con un breve modulo e una persona vera del nostro team ti segue su WhatsApp. Prima attiviamo il tuo abbonamento: paghi solo quando il tuo accesso è attivo.' },
        { steps: ORDER_STEPS },
        { p: `Le prove gratuite apriranno a breve: potrai provare il servizio per ${TRIAL} prima di acquistare.` },
      ] },
    },
  },
};

// ---------------------------------------------------------------- Centro assistenza
const HELP_HUB = {
  name: 'Centro assistenza',
  title: 'Centro assistenza',
  metaTitle: 'Centro assistenza: prova, ordini e rimborsi',
  description: 'Risposte su prova gratuita di SYGMA TV+, ordini e pagamento, dispositivi supportati, risoluzione dei problemi, rimborsi e contatti dell’assistenza.',
  intro: `Risposte chiare su prova gratuita, ordini, pagamento, dispositivi e rimborsi. Ti serve ancora aiuto? Il nostro assistente automatico è disponibile ${F.supportHours}, con assistenza umana quando serve.`,
  popular: [
    { q: 'Quando e come pago?', href: '/it/help/ordering-payment#pay' },
    { q: 'Quanto tempo richiede l’attivazione?', href: '/it/help/ordering-payment#activation' },
    { q: 'La prova è davvero gratuita?', href: '/it/help/free-trial#cost' },
    { q: 'Quali dispositivi posso usare?', href: '/it/help/devices#categories' },
    { q: 'In quanto tempo risponde l’assistenza?', href: '/it/help/contact-support#availability' },
    { q: 'Come ottengo un rimborso?', href: '/it/help/refunds#how' },
  ],
};

const HELP_TOPICS: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Primi passi', icon: 'rocket',
    title: 'Primi passi con SYGMA TV+',
    metaTitle: 'Primi passi con SYGMA TV+',
    description: 'Come funziona SYGMA TV+, dalla scelta del piano alla visione: prova gratuita, modulo d’ordine, contatto e attivazione su WhatsApp, poi il pagamento.',
    summary: 'Dalla scelta del piano alla prima visione.',
    intro: 'Bastano pochi passaggi per iniziare. Puoi partire da una prova gratuita oppure ordinare direttamente.',
    prelaunch: { intro: 'Gli ordini online e le prove gratuite apriranno a breve. Ecco come funzionerà l’avvio.' },
    sections: [
      { id: 'steps', icon: 'rocket', title: 'I passaggi', body: [{ steps: [
        { title: 'Scegli il tuo piano', text: 'Nella sezione Piani, scegli il piano, la durata (12, 24 o 36 mesi) e il numero di dispositivi.' },
        { title: 'Prova o ordine', text: 'Richiedi una prova gratuita oppure invia il tuo ordine con il breve modulo: il tuo indirizzo email, il tuo paese e il tuo numero WhatsApp.' },
        { title: 'Ti contattiamo su WhatsApp', text: 'Il nostro team ti contatta su WhatsApp, ti invia i dati di accesso e ti indica quale app installare.' },
        { title: 'Attivazione, poi pagamento', text: `Per un ordine, prima attiviamo il tuo abbonamento — di solito ${F.usualActivation}. Paghi quando il tuo accesso è attivo.` },
        { title: 'Inizia a guardare', text: 'Installa l’app, inserisci i tuoi dati di accesso e avvia la riproduzione.' },
      ] }] },
      { id: 'good-to-know', icon: 'info', title: 'Buono a sapersi', body: [{ list: [
        'Nessun addebito su questo sito.',
        'Paghi dopo l’attivazione del tuo abbonamento, con un metodo di pagamento proposto dal nostro team.',
        'Una sola prova gratuita per cliente.',
        'Ogni piano include 1 dispositivo; puoi aggiungerne altri, fino a 4.',
        'I piani non si rinnovano mai automaticamente.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Dispositivi supportati', icon: 'devices',
    title: 'Dispositivi supportati',
    metaTitle: 'Dispositivi supportati: TV, box, smartphone',
    description: 'SYGMA TV+ si usa su Smart TV, box e chiavette di streaming, smartphone, tablet e computer. Quanti dispositivi puoi usare e come verificare il tuo.',
    summary: 'TV, dispositivi di streaming, smartphone e computer.',
    intro: 'SYGMA TV+ si usa su TV, dispositivi di streaming, smartphone e computer. Con la prova gratuita verifichi il tuo dispositivo e la tua connessione prima di acquistare.',
    sections: [
      { id: 'categories', icon: 'devices', title: 'Quali dispositivi?', body: [{ list: [
        'Smart TV.',
        'Box e chiavette di streaming.',
        'Smartphone e tablet.',
        'Computer.',
      ] }, { p: 'Insieme ai dati di accesso, il nostro team ti indica quale app installare sul tuo dispositivo e ti aiuta a configurarla.' }] },
      { id: 'how-many', icon: 'users', title: 'Quanti dispositivi contemporaneamente?', body: [{ p: 'Ogni piano include 1 dispositivo. Puoi aggiungerne altri al momento dell’ordine, fino a 4. L’abbonamento è per uso personale all’interno del tuo nucleo familiare: non è consentito condividere o rivendere l’accesso.' }] },
      { id: 'quality', icon: 'activity', title: 'Qualità dell’immagine', body: [{ p: 'La qualità dell’immagine dipende dal piano, dal contenuto, dal dispositivo e dalla connessione internet. Una connessione stabile — idealmente un cavo di rete, o un dispositivo vicino al router Wi-Fi — è il fattore che conta di più.' }] },
      { id: 'check', icon: 'check', title: 'Prima verifica il tuo dispositivo', body: [{ p: `Chiedi una prova gratuita di ${TRIAL}: provi il servizio sul tuo dispositivo e con la tua connessione prima di acquistare.` }] },
    ],
  },
  {
    slug: 'free-trial', name: 'Prova gratuita', icon: 'calendar',
    title: 'La prova gratuita',
    metaTitle: 'Prova gratuita: come provare SYGMA TV+',
    description: `Prova SYGMA TV+ gratis per ${TRIAL} sul tuo dispositivo prima di acquistare. Come richiederla e cosa succede dopo: niente da pagare, niente da disdire.`,
    summary: `${TRIAL[0]!.toUpperCase()}${TRIAL.slice(1)}, gratis, niente da disdire.`,
    intro: `La prova gratuita ti permette di provare SYGMA TV+ per ${TRIAL} sul tuo dispositivo e con la tua connessione, prima di decidere.`,
    prelaunch: { sections: { request: { body: [{ p: 'Le richieste di prova gratuita apriranno a breve. Fino ad allora non è possibile ottenere una prova via email né tramite altri canali.' }] } } },
    sections: [
      { id: 'request', icon: 'rocket', title: 'Come la richiedo?', body: [{ steps: [
        { title: 'Apri il modulo', text: 'Seleziona «Prova gratuita» in alto in qualsiasi pagina.' },
        { title: 'Lascia i tuoi dati', text: 'Nome e cognome, indirizzo email e numero di telefono con il prefisso internazionale, e autorizzaci a contattarti.' },
        { title: 'Ricevi il tuo accesso', text: 'Il nostro team ti contatta su WhatsApp con i dati di accesso e l’app da installare.' },
      ] }] },
      { id: 'cost', icon: 'tag', title: 'È davvero gratuita?', body: [{ p: 'Sì. Richiedere una prova è gratuito e senza alcun obbligo. La prova termina da sola: non c’è nulla da disdire. Una sola prova gratuita per cliente.' }] },
      { id: 'check', icon: 'check', title: 'Cosa verificare durante la prova?', body: [{ list: [
        'Che l’app funzioni sul tuo dispositivo.',
        'Che l’immagine sia fluida con la tua connessione internet.',
        'Di quanti dispositivi avrai bisogno.',
        'Come contattarci se la configurazione non funziona.',
      ] }] },
    ],
  },
  {
    slug: 'ordering-payment', name: 'Ordini e pagamento', icon: 'card',
    title: 'Ordini e pagamento',
    metaTitle: 'Ordini e pagamento: come funziona',
    description: 'Come ordinare SYGMA TV+: invia il modulo, il nostro team ti contatta su WhatsApp e attiva il tuo accesso, poi paghi. Ecco i metodi di pagamento.',
    summary: 'Modulo d’ordine, attivazione, poi pagamento.',
    intro: 'Ordini con un breve modulo. Il nostro team ti contatta su WhatsApp e attiva il tuo accesso, e paghi dopo l’attivazione. Nessun addebito su questo sito.',
    prelaunch: { sections: { order: { title: 'Come funzionerà l’ordine', body: [
      { p: 'Gli ordini online apriranno a breve. Puoi già confrontare piani, durate e prezzi nella sezione Piani.' },
      { steps: ORDER_STEPS },
    ] } } },
    sections: [
      { id: 'order', icon: 'rocket', title: 'Come ordino?', body: [
        { p: 'L’ordine si svolge in sei passaggi, dal modulo sul nostro sito alla conferma del pagamento. Per iniziare, seleziona «Ordina ora» nella sezione Piani.' },
        { steps: ORDER_STEPS },
      ] },
      { id: 'pay', icon: 'card', title: 'Quando e come pago?', body: [
        { p: 'Paghi dopo l’attivazione del tuo accesso — mai su questo sito. Qui non ti chiediamo alcun pagamento né i dati della carta: il nostro team ti invia le opzioni di pagamento su WhatsApp. Metodi accettati:' },
        { chips: [...F.paymentMethods], label: 'Metodi di pagamento' },
        { note: 'Tutti i pagamenti vengono concordati manualmente con il nostro team; nessuno viene addebitato automaticamente su questo sito. Il nostro team ti indica i metodi disponibili per il tuo ordine.' },
      ] },
      { id: 'activation', icon: 'clock', title: 'Quanto tempo richiede l’attivazione?', body: [{ p: `Il nostro team attiva di solito il tuo accesso ${F.usualActivation} — un tempo abituale, non una garanzia. Paghi quando il tuo accesso è attivo.` }] },
      { id: 'emails', icon: 'mail', title: 'Quali email riceverò?', body: [{ list: [
        'Subito dopo l’invio del modulo: un’email che conferma la ricezione del tuo ordine.',
        CONFIRMATION_EMAIL,
      ] }] },
      { id: 'prices', icon: 'tag', title: 'Prezzi e tasse', body: [{ p: 'I prezzi sono indicati in dollari statunitensi (USD), tasse escluse, e il prezzo del tuo piano viene mostrato prima dell’invio dell’ordine. Le durate più lunghe costano meno all’anno: consulta i prezzi attuali nella sezione Piani.' }] },
      { id: 'contract', icon: 'scale', title: 'Quando inizia il mio abbonamento?', body: [{ p: 'Il contratto inizia quando il nostro team conferma il tuo ordine. I piani non si rinnovano mai automaticamente.' }] },
    ],
  },
  {
    slug: 'troubleshooting', name: 'Risoluzione dei problemi', icon: 'activity',
    title: 'Risoluzione dei problemi',
    metaTitle: 'Risoluzione problemi: video, accesso e app',
    description: 'Risolvi i problemi frequenti di SYGMA TV+: immagine che scatta, accesso rifiutato, app assente nello store o che si chiude, visione con dati mobili.',
    summary: 'Problemi di immagine, accesso e app.',
    intro: 'Quasi tutti i problemi dipendono dalla connessione o da un errore di battitura nei dati di accesso. Prova prima questi passaggi.',
    sections: [
      { id: 'stutter', icon: 'activity', title: 'L’immagine scatta o si blocca', body: [{ p: 'Riavvia il router e il dispositivo. Se puoi, usa un cavo di rete o avvicina il dispositivo al router Wi-Fi, poi riprova.' }] },
      { id: 'login', icon: 'lock', title: 'I miei dati di accesso vengono rifiutati', body: [{ p: 'Controlla spazi, maiuscole e minuscole, oppure copia e incolla i dati dal nostro messaggio WhatsApp. Se ancora non funziona, inviaci una foto della schermata di errore.' }] },
      { id: 'store', icon: 'tv', title: 'Non trovo l’app nel mio store', body: [{ p: 'Gli store di app dipendono dal modello del dispositivo e dal paese. Inviaci marca, modello e anno del tuo dispositivo: ti diremo cosa funziona.' }] },
      { id: 'crash', icon: 'pause', title: 'L’app si chiude da sola', body: [{ p: 'Riavvia il dispositivo, installa gli aggiornamenti disponibili del sistema e dell’app, poi riprova.' }] },
      { id: 'mobile', icon: 'devices', title: 'La riproduzione si interrompe con i dati mobili', body: [{ p: 'La qualità dipende dalla rete mobile e dal tuo piano dati. Se puoi, passa al Wi-Fi.' }] },
      { id: 'still', icon: 'mail', title: 'Ancora non funziona?', body: [{ p: `Contattaci ${F.supportHours} indicando il modello del tuo dispositivo e allegando una foto dell’eventuale messaggio di errore: di solito rispondiamo in ${F.usualReply}.` }] },
    ],
  },
  {
    slug: 'contact-support', name: 'Contatta l’assistenza', icon: 'mail',
    title: 'Contatta il nostro team di assistenza',
    metaTitle: 'Assistenza: email e WhatsApp, 24/7',
    description: `Contatta l’assistenza SYGMA TV+ ${F.supportHours} via email, WhatsApp o modulo di contatto, in sei lingue. Cosa indicare per ricevere una risposta più rapida.`,
    summary: `${F.supportHours}, email o WhatsApp, sei lingue.`,
    intro: `Contattaci via email o su WhatsApp. Il nostro assistente automatico è disponibile ${F.supportHours}, con assistenza umana quando serve.`,
    prelaunch: {
      description: `Contatta l’assistenza SYGMA TV+ ${F.supportHours} via email o WhatsApp, in sei lingue. Cosa indicare per ricevere una risposta più rapida.`,
      sections: { reach: { body: [{ list: [`Email: ${EMAIL}.`, `WhatsApp o telefono: ${PHONE}.`] }] } },
    },
    sections: [
      { id: 'reach', icon: 'mail', title: 'Come contattarci', body: [{ list: [
        `Email: ${EMAIL}.`,
        `WhatsApp o telefono: ${PHONE}.`,
        'Il modulo di contatto: seleziona «Contatti» in fondo a qualsiasi pagina.',
      ] }] },
      { id: 'availability', icon: 'clock', title: 'Quando rispondete?', body: [{ p: `Il nostro assistente automatico è disponibile ${F.supportHours}, con assistenza umana quando serve. Di solito rispondiamo in ${F.usualReply}. È il nostro tempo di risposta abituale, non una garanzia contrattuale.` }] },
      { id: 'languages', icon: 'globe', title: 'In quali lingue?', body: [
        { p: `Puoi scriverci in ${LANGS}.` },
        { chips: [...F.languages], label: 'Lingue dell’assistenza' },
        { note: 'I documenti legali sono redatti in inglese.' },
      ] },
      { id: 'include', icon: 'pencil', title: 'Cosa indicare', body: [{ list: [
        'Il riferimento del tuo ordine, se ne hai uno.',
        'Il tuo dispositivo, con marca e modello.',
        'Cosa stavi facendo quando è comparso il problema e una foto dell’eventuale messaggio di errore.',
      ] }] },
    ],
  },
  {
    slug: 'refunds', name: 'Rimborsi', icon: 'refund',
    title: 'Rimborsi e disdette',
    metaTitle: 'Rimborso entro 7 giorni e diritto di recesso',
    description: 'Rimborsi SYGMA TV+: prima la prova gratuita, rimborso al 100% entro 7 giorni dall’attivazione, recesso di 14 giorni (UE e Regno Unito) e come chiederlo.',
    summary: 'Rimborso entro 7 giorni, come chiederlo.',
    intro: 'Prima provi, poi, se non sei soddisfatto, ottieni il rimborso completo entro 7 giorni dall’attivazione. La politica completa è nella nostra pagina Rimborsi (in inglese).',
    sections: [
      { id: 'guarantee', icon: 'refund', title: 'Soddisfatti o rimborsati per 7 giorni', body: [{ p: 'Non sei soddisfatto? Chiedi entro 7 giorni dall’attivazione e ti rimborsiamo al 100%, senza domande. Un solo rimborso per cliente; non disponibile per gli account sospesi per condivisione o rivendita dell’accesso.' }] },
      { id: 'withdrawal', icon: 'scale', title: 'Clienti di UE e Regno Unito', body: [{ p: 'Hai inoltre 14 giorni per recedere. Dopo i primi 7 giorni, rimborsiamo la parte non utilizzata del tuo abbonamento.' }] },
      { id: 'how', icon: 'mail', title: 'Come richiederlo', body: [{ p: `Invia il riferimento del tuo ordine a ${EMAIL} o su WhatsApp. Ricevi il rimborso entro 14 giorni, con lo stesso metodo di pagamento che hai usato.` }] },
      { id: 'after', icon: 'pause', title: 'Dopo questi periodi', body: [{ p: 'Dopo questi periodi gli abbonamenti non sono rimborsabili, salvo quanto previsto dalla legge. Non si rinnovano mai automaticamente.' }] },
    ],
  },
];

/** Interface labels of the About / Help pages. */
const INFO_UI: InfoUi = {
  home: 'Home',
  breadcrumb: 'Percorso di navigazione',
  support: 'Assistenza',
  popular: 'Domande più comuni',
  topics: 'Argomenti di aiuto',
  glance: 'L’assistenza in breve',
  helpFacts: [
    { k: 'Disponibilità', v: F.supportHours, small: 'Email e WhatsApp' },
    { k: 'Tempo di risposta abituale', v: 'Meno di un’ora', small: 'Tempo abituale, non garantito' },
    { k: 'Lingue', v: String(F.languages.length), small: F.languages.join(' · ') },
    { k: 'Attivazione', v: 'Di solito < 1 ora', small: 'Prima del pagamento, dopo la conferma dell’ordine' },
  ],
  aboutFacts: [
    { k: 'Fondazione', v: F.established, small: F.basedIn },
    { k: 'Società', v: siteConfig.legalEntity ?? '', small: 'Nuovo Messico, USA' },
    { k: 'Assistenza', v: F.supportHours, small: `Di solito risponde in ${F.usualReply}` },
    { k: 'Lingue dell’assistenza', v: String(F.languages.length), small: F.languages.join(' · ') },
  ],
  aboutContact: `Domande su SYGMA TV+? Il nostro assistente automatico è disponibile ${F.supportHours}, con assistenza umana quando serve.`,
  hubContact: 'Non trovi la risposta? Scrivici — indica il tuo dispositivo e, se ce l’hai, il riferimento del tuo ordine.',
  topicContact: `Ti serve ancora aiuto? Contattaci via email o su WhatsApp. Il nostro assistente automatico è disponibile ${F.supportHours}, con assistenza umana quando serve.`,
  hubRelated: [
    { href: '/it/about', label: 'Chi siamo' },
    { href: '/it#faq', label: 'FAQ' },
    { href: '/legal/refunds', label: 'Rimborsi e disdette (in inglese)' },
    { href: '/legal/terms', label: 'Termini di servizio (in inglese)' },
  ],
  refundPolicy: { href: '/legal/refunds', label: 'Politica di rimborso completa (in inglese)' },
  terms: { href: '/legal/terms', label: 'Termini di servizio (in inglese)' },
  allTopics: 'Tutti gli argomenti di aiuto',
  prevTopic: 'Argomento precedente',
  nextTopic: 'Argomento successivo',
  content: {
    contactUs: 'Contattaci',
    email: 'Email',
    phone: 'Telefono / WhatsApp',
    related: 'Pagine correlate',
    onThisPage: 'In questa pagina',
    lastReviewed: 'Ultima revisione: ',
  },
  actions: { trial: 'Richiedi una prova gratuita', support: 'Contatta l’assistenza', plans: 'Scopri i piani', plansHref: '/it#plans' },
};

export const INFO: InfoContentSet = {
  about: ABOUT,
  hub: HELP_HUB,
  topics: HELP_TOPICS,
  reviewed: '20 novembre 2026',
  supportHours: '24/7',
  ui: INFO_UI,
};
