/**
 * « Sobre nosotros » + Centro de ayuda en español de España (phase 8 — PREVIEW ONLY, not published).
 *
 * Faithful translation of src/content/en/info.ts (owner-validated facts, 20/11/2026): same facts, same order of
 * the ordering flow (pedido → contacto por WhatsApp → activación → pago → confirmación del pago), same « usually »
 * wording for times (« normalmente », never a contractual guarantee). No claim added. Informal « tú ».
 * Links: Spanish pages under /es (same English slugs); legal documents stay in English (/legal/*).
 * To be reviewed by a native speaker before publication (docs/i18n/phase8-translation-brief.md).
 */
import { siteConfig } from '@/config/site';
import type { InfoContentSet, InfoPage, InfoUi } from '@/content/en/info';

const EMAIL = siteConfig.supportEmail ?? '';
const PHONE = siteConfig.supportPhone ?? '';
/** « 24 hours » → « 24 horas » (« una prueba gratis de 24 horas »). */
const TRIAL = (siteConfig.trialDuration ?? '24 hours').replace(/^(\d+) hours?$/, (_, n: string) => (n === '1' ? '1 hora' : `${n} horas`));

export const OWNER_FACTS = {
  established: '2026',
  basedIn: 'Estados Unidos',
  supportHours: '24/7',
  usualReply: 'menos de una hora',
  usualActivation: 'en la hora siguiente a la confirmación de tu pedido por WhatsApp',
  languages: ['Inglés', 'Francés', 'Árabe', 'Alemán', 'Español', 'Italiano'],
  /** Arranged by our team on WhatsApp once the subscription is active — none of them is charged on this website. */
  paymentMethods: ['Tarjeta Visa / Mastercard', 'PayPal', 'Criptomoneda (USDT a través de Binance)', 'Transferencia bancaria', 'Western Union', 'MoneyGram'],
} as const;

const F = OWNER_FACTS;

/** The six steps of an order, in the real order: activation first, payment after, then the confirmation email. */
const ORDER_STEPS = [
  { title: 'Elige tu plan', text: 'Elige el plan, la duración y el número de dispositivos en nuestra web. El precio se muestra al momento.' },
  { title: 'Envía tu pedido', text: 'Rellena el breve formulario de pedido: tu correo electrónico, tu país y tu número de WhatsApp. En esta web no se cobra nada. Recibirás un correo electrónico que confirma que hemos recibido tu pedido.' },
  { title: 'Te contactamos por WhatsApp', text: 'Una persona de nuestro equipo se pone en contacto contigo por WhatsApp para confirmar tu pedido.' },
  { title: 'Activamos tu suscripción', text: `Te enviamos por WhatsApp tus datos de acceso y las instrucciones de configuración. La activación se realiza normalmente ${F.usualActivation}.` },
  { title: 'Realizas el pago', text: 'Una vez activo tu acceso, pagas con uno de los métodos de pago que te ofrece nuestro equipo.' },
  { title: 'Pago confirmado', text: 'Cuando hayamos recibido y confirmado tu pago, recibirás un correo electrónico en el que te confirmamos que tu suscripción está activa, con tu número de pedido.' },
];
const CONFIRMATION_EMAIL = 'Cuando hayamos recibido y confirmado tu pago, recibirás un correo electrónico en el que te confirmamos que tu suscripción está activa, con tu número de pedido y los detalles de tu suscripción.';
const LANGS = `${F.languages.slice(0, -1).map((l) => l.toLowerCase()).join(', ')} o ${F.languages[F.languages.length - 1]!.toLowerCase()}`;

// ---------------------------------------------------------------- Sobre nosotros
const ABOUT: InfoPage = {
  slug: 'about',
  name: 'Sobre nosotros',
  title: 'Sobre SYGMA TV+',
  metaTitle: 'Sobre nosotros: empresa, soporte y compromisos',
  description: 'SYGMA TV+ es una marca de entretenimiento digital de Sygma TV LLC, fundada en Estados Unidos en 2026. Cómo funciona, nuestros compromisos y el soporte.',
  intro: `SYGMA TV+ es una marca internacional de entretenimiento digital, fundada en ${F.basedIn} en ${F.established}. Ofrecemos suscripciones de streaming para tu tele, tu móvil y tu ordenador, con atención al cliente ${F.supportHours} en seis idiomas.`,
  icon: 'info',
  sections: [
    {
      id: 'who', icon: 'info', title: 'Quiénes somos',
      body: [
        { p: `SYGMA TV+ — «One World. Endless Entertainment.» — es una marca de ${siteConfig.legalEntity}, una empresa fundada en ${F.established} y registrada en el estado de Nuevo México, Estados Unidos.` },
        { p: 'Los planes son anuales (12, 24 o 36 meses), con 1 dispositivo incluido y hasta 4. Antes de comprar, puedes probar el servicio en tu propio dispositivo con una prueba gratuita.' },
      ],
    },
    {
      id: 'company', icon: 'building', title: 'Datos de la empresa',
      body: [
        { facts: [
          ['Empresa', siteConfig.legalEntity],
          ['Fundación', F.established],
          ['Domicilio social', siteConfig.legalAddress],
          ['Registrada en', 'Estados Unidos (Nuevo México)'],
          ['EIN', siteConfig.companyNumber],
          ['Correo electrónico', siteConfig.supportEmail],
          ['Teléfono / WhatsApp', siteConfig.supportPhone],
        ] },
      ],
    },
    {
      id: 'how', icon: 'rocket', title: 'Cómo funciona el servicio',
      body: [
        { p: 'Haces tu pedido con un breve formulario y una persona real de nuestro equipo se encarga del resto por WhatsApp. Primero activamos tu suscripción: solo pagas cuando tu acceso ya está activo.' },
        { steps: ORDER_STEPS },
        { p: `¿Todavía no lo tienes claro? Pide primero una prueba gratuita de ${TRIAL}: nada que pagar y nada que cancelar.` },
      ],
    },
    {
      id: 'commitments', icon: 'shield', title: 'Nuestros compromisos',
      body: [
        { list: [
          'Precios claros: el precio aparece en nuestra web antes de que hagas el pedido, y solo pagas después de que se active tu suscripción.',
          'Sin renovación automática: tú decides si renuevas.',
          'Garantía de reembolso de 7 días tras la activación; los clientes de la UE y del Reino Unido conservan además su derecho de desistimiento de 14 días.',
          'Tus datos se usan solo para gestionar tu solicitud y tu suscripción. Nunca los vendemos.',
          'Sin opiniones falsas.',
        ] },
      ],
    },
    {
      id: 'support', icon: 'users', title: 'Soporte multilingüe',
      body: [
        { p: `Nuestro asistente automático está disponible ${F.supportHours}, con atención humana cuando sea necesario. Normalmente respondemos en ${F.usualReply}. Es nuestro tiempo de respuesta habitual, no una garantía contractual.` },
        { chips: [...F.languages], label: 'Idiomas de soporte' },
        { note: 'Nuestro equipo de soporte habla estos seis idiomas; los documentos legales están redactados en inglés.' },
      ],
    },
    {
      id: 'payment', icon: 'card', title: 'Activación, pago y confirmación',
      body: [
        { p: `En esta web no se cobra nada. Primero activamos tu suscripción — normalmente ${F.usualActivation} — y pagas cuando tu acceso ya está activo, con uno de estos métodos:` },
        { chips: [...F.paymentMethods], label: 'Métodos de pago' },
        { note: 'Cada pago se gestiona manualmente con nuestro equipo por WhatsApp — ninguno se cobra automáticamente en esta web. Nuestro equipo te indica qué métodos están disponibles para tu pedido.' },
        { p: CONFIRMATION_EMAIL },
      ],
    },
    {
      id: 'links', icon: 'info', title: 'Enlaces útiles',
      body: [
        { links: [
          { href: '/es/help', label: 'Centro de ayuda', text: 'Prueba, pedidos, dispositivos, reembolsos' },
          { href: '/es/help/contact-support', label: 'Contactar con soporte', text: `Correo electrónico o WhatsApp, ${F.supportHours}` },
          { href: '/es#plans', label: 'Planes', text: 'Elige tu plan y consulta el precio' },
          { href: '/legal/refunds', label: 'Reembolsos y cancelaciones', text: 'Garantía de reembolso de 7 días (en inglés)' },
          { href: '/legal/terms', label: 'Condiciones del servicio', text: 'Las normas, en lenguaje claro (en inglés)' },
          { href: '/legal/imprint', label: 'Aviso legal', text: 'Datos de la empresa (en inglés)' },
        ] },
      ],
    },
  ],
  prelaunch: {
    sections: {
      how: { body: [
        { p: 'Haces tu pedido con un breve formulario y una persona real de nuestro equipo se encarga del resto por WhatsApp. Primero activamos tu suscripción: solo pagas cuando tu acceso ya está activo.' },
        { steps: ORDER_STEPS },
        { p: `Las pruebas gratuitas abrirán muy pronto: podrás probar el servicio durante ${TRIAL} antes de comprar.` },
      ] },
    },
  },
};

// ---------------------------------------------------------------- Centro de ayuda
const HELP_HUB = {
  name: 'Centro de ayuda',
  title: 'Centro de ayuda',
  metaTitle: 'Centro de ayuda: prueba, pedidos y reembolsos',
  description: 'Respuestas sobre la prueba gratuita de SYGMA TV+, pedidos y pagos, dispositivos compatibles, problemas técnicos, reembolsos y cómo contactar con soporte.',
  intro: `Respuestas claras sobre la prueba gratuita, los pedidos, el pago, los dispositivos y los reembolsos. ¿Todavía tienes dudas? Nuestro asistente automático está disponible ${F.supportHours}, con atención humana cuando sea necesario.`,
  popular: [
    { q: '¿Cuándo y cómo pago?', href: '/es/help/ordering-payment#pay' },
    { q: '¿Cuánto tarda la activación?', href: '/es/help/ordering-payment#activation' },
    { q: '¿La prueba es gratis de verdad?', href: '/es/help/free-trial#cost' },
    { q: '¿Qué dispositivos puedo usar?', href: '/es/help/devices#categories' },
    { q: '¿Cuánto tarda en responder el soporte?', href: '/es/help/contact-support#availability' },
    { q: '¿Cómo consigo un reembolso?', href: '/es/help/refunds#how' },
  ],
};

const HELP_TOPICS: InfoPage[] = [
  {
    slug: 'getting-started', name: 'Primeros pasos', icon: 'rocket',
    title: 'Primeros pasos con SYGMA TV+',
    metaTitle: 'Primeros pasos con SYGMA TV+',
    description: 'Cómo funciona SYGMA TV+, de elegir un plan a empezar a ver: prueba gratuita, formulario de pedido, contacto y activación por WhatsApp, y después el pago.',
    summary: 'De elegir un plan a tu primera reproducción.',
    intro: 'Empezar solo lleva unos pasos. Puedes comenzar con una prueba gratuita o hacer tu pedido directamente.',
    prelaunch: { intro: 'Los pedidos en línea y las pruebas gratuitas abrirán muy pronto. Así funcionará el proceso para empezar.' },
    sections: [
      { id: 'steps', icon: 'rocket', title: 'Los pasos', body: [{ steps: [
        { title: 'Elige tu plan', text: 'En la sección Planes, elige el plan, la duración (12, 24 o 36 meses) y el número de dispositivos.' },
        { title: 'Prueba o pedido', text: 'Solicita una prueba gratuita o envía tu pedido con el breve formulario: tu correo electrónico, tu país y tu número de WhatsApp.' },
        { title: 'Te contactamos por WhatsApp', text: 'Nuestro equipo se pone en contacto contigo por WhatsApp, te envía tus datos de acceso y te indica qué app instalar.' },
        { title: 'Activación y después pago', text: `Si haces un pedido, primero activamos tu suscripción — normalmente ${F.usualActivation}. Pagas cuando tu acceso ya está activo.` },
        { title: 'Empieza a ver', text: 'Instala la app, introduce tus datos de acceso e inicia la reproducción.' },
      ] }] },
      { id: 'good-to-know', icon: 'info', title: 'Conviene saber', body: [{ list: [
        'En esta web no se cobra nada.',
        'Pagas después de que se active tu suscripción, con un método de pago que te ofrece nuestro equipo.',
        'Una sola prueba gratuita por cliente.',
        'Todos los planes incluyen 1 dispositivo; puedes añadir más, hasta 4.',
        'Los planes nunca se renuevan automáticamente.',
      ] }] },
    ],
  },
  {
    slug: 'devices', name: 'Dispositivos compatibles', icon: 'devices',
    title: 'Dispositivos compatibles',
    metaTitle: 'Dispositivos compatibles: TV, móvil, ordenador',
    description: 'SYGMA TV+ se usa en Smart TV, reproductores y sticks de streaming, móviles, tablets y ordenadores. Cuántos dispositivos a la vez y cómo comprobar el tuyo.',
    summary: 'TV, dispositivos de streaming, móvil y ordenador.',
    intro: 'SYGMA TV+ se usa en televisores, dispositivos de streaming, móviles y ordenadores. Con la prueba gratuita puedes comprobar tu propio dispositivo y tu conexión antes de comprar.',
    sections: [
      { id: 'categories', icon: 'devices', title: '¿Qué dispositivos?', body: [{ list: [
        'Smart TV.',
        'Reproductores y sticks de streaming.',
        'Smartphones y tablets.',
        'Ordenadores.',
      ] }, { p: 'Junto con tus datos de acceso, nuestro equipo te indica qué app instalar en tu dispositivo y te ayuda a configurarla.' }] },
      { id: 'how-many', icon: 'users', title: '¿Cuántos dispositivos a la vez?', body: [{ p: 'Todos los planes incluyen 1 dispositivo. Puedes añadir más al hacer tu pedido, hasta 4. La suscripción es para uso personal dentro de tu hogar: no está permitido compartir ni revender el acceso.' }] },
      { id: 'quality', icon: 'activity', title: 'Calidad de imagen', body: [{ p: 'La calidad de imagen depende de tu plan, del contenido, de tu dispositivo y de tu conexión a internet. Una conexión estable — idealmente con cable de red, o con el dispositivo cerca del router wifi — es lo que más influye.' }] },
      { id: 'check', icon: 'check', title: 'Comprueba primero tu dispositivo', body: [{ p: `Pide una prueba gratuita de ${TRIAL}: así pruebas el servicio en tu propio dispositivo y con tu conexión antes de comprar.` }] },
    ],
  },
  {
    slug: 'free-trial', name: 'Prueba gratuita', icon: 'calendar',
    title: 'La prueba gratuita',
    metaTitle: 'Prueba gratuita: cómo probar SYGMA TV+',
    description: `Prueba SYGMA TV+ gratis durante ${TRIAL} en tu dispositivo antes de comprar. Cómo solicitar la prueba y qué pasa después: nada que pagar ni cancelar.`,
    summary: `${TRIAL[0]!.toUpperCase()}${TRIAL.slice(1)}, gratis, nada que cancelar.`,
    intro: `La prueba gratuita te permite probar SYGMA TV+ durante ${TRIAL} en tu propio dispositivo y con tu conexión, antes de decidirte.`,
    prelaunch: { sections: { request: { body: [{ p: 'Las solicitudes de prueba gratuita abrirán muy pronto. Hasta entonces, no es posible conseguir una prueba por correo electrónico ni por ningún otro medio.' }] } } },
    sections: [
      { id: 'request', icon: 'rocket', title: '¿Cómo la solicito?', body: [{ steps: [
        { title: 'Abre el formulario', text: 'Selecciona «Prueba gratis» en la parte superior de cualquier página.' },
        { title: 'Déjanos tus datos', text: 'Tu nombre completo, tu correo electrónico y tu número de teléfono con el prefijo del país, y acepta que te contactemos.' },
        { title: 'Recibe tu acceso', text: 'Nuestro equipo se pone en contacto contigo por WhatsApp con tus datos de acceso y la app que debes instalar.' },
      ] }] },
      { id: 'cost', icon: 'tag', title: '¿Es gratis de verdad?', body: [{ p: 'Sí. Solicitar una prueba es gratis y no te compromete a nada. La prueba termina sola: no hay nada que cancelar. Una sola prueba gratuita por cliente.' }] },
      { id: 'check', icon: 'check', title: '¿Qué debo comprobar durante la prueba?', body: [{ list: [
        'Que la app funciona en tu dispositivo.',
        'Que la imagen se ve fluida con tu conexión a internet.',
        'Cuántos dispositivos vas a necesitar.',
        'Cómo contactarnos si la configuración no funciona.',
      ] }] },
    ],
  },
  {
    slug: 'ordering-payment', name: 'Pedidos y pagos', icon: 'card',
    title: 'Pedidos y pagos',
    metaTitle: 'Pedidos y pagos: cómo funciona',
    description: 'Cómo pedir SYGMA TV+: envía el formulario, nuestro equipo te contacta por WhatsApp y activa tu acceso, y después pagas. Te explicamos los métodos de pago.',
    summary: 'Formulario de pedido, activación y después pago.',
    intro: 'Haces tu pedido con un breve formulario. Nuestro equipo se pone en contacto contigo por WhatsApp y activa tu acceso, y pagas después de la activación. En esta web no se cobra nada.',
    prelaunch: { sections: { order: { title: 'Cómo funcionará el pedido', body: [
      { p: 'Los pedidos en línea abrirán muy pronto. Ya puedes comparar los planes, las duraciones y los precios en la sección Planes.' },
      { steps: ORDER_STEPS },
    ] } } },
    sections: [
      { id: 'order', icon: 'rocket', title: '¿Cómo hago un pedido?', body: [
        { p: 'El pedido tiene seis pasos, desde el formulario de nuestra web hasta la confirmación de tu pago. Para empezar, selecciona «Pedir ahora» en la sección Planes.' },
        { steps: ORDER_STEPS },
      ] },
      { id: 'pay', icon: 'card', title: '¿Cuándo y cómo pago?', body: [
        { p: 'Pagas después de que se active tu acceso — nunca en esta web. Aquí no te pedimos ningún pago ni datos de tarjeta: nuestro equipo te envía las opciones de pago por WhatsApp. Métodos aceptados:' },
        { chips: [...F.paymentMethods], label: 'Métodos de pago' },
        { note: 'Todos los pagos se gestionan manualmente con nuestro equipo; ninguno se cobra automáticamente en esta web. Nuestro equipo te indica qué métodos están disponibles para tu pedido.' },
      ] },
      { id: 'activation', icon: 'clock', title: '¿Cuánto tarda la activación?', body: [{ p: `Nuestro equipo normalmente activa tu acceso ${F.usualActivation} — es un plazo habitual, no una garantía. Pagas cuando tu acceso ya está activo.` }] },
      { id: 'emails', icon: 'mail', title: '¿Qué correos electrónicos recibiré?', body: [{ list: [
        'Justo después de enviar el formulario: un correo electrónico que confirma que hemos recibido tu pedido.',
        CONFIRMATION_EMAIL,
      ] }] },
      { id: 'prices', icon: 'tag', title: 'Precios e impuestos', body: [{ p: 'Los precios se muestran en dólares estadounidenses (USD), impuestos no incluidos, y el precio de tu plan aparece antes de que envíes tu pedido. Las duraciones más largas cuestan menos al año: consulta los precios actuales en la sección Planes.' }] },
      { id: 'contract', icon: 'scale', title: '¿Cuándo empieza mi suscripción?', body: [{ p: 'El contrato empieza cuando nuestro equipo confirma tu pedido. Los planes nunca se renuevan automáticamente.' }] },
    ],
  },
  {
    slug: 'troubleshooting', name: 'Solución de problemas', icon: 'activity',
    title: 'Solución de problemas',
    metaTitle: 'Solución de problemas: imagen, acceso y app',
    description: 'Soluciona problemas habituales de SYGMA TV+: imagen a saltos, datos de acceso rechazados, app que no está en tu tienda o se cierra, uso con datos móviles.',
    summary: 'Problemas de imagen, acceso y app.',
    intro: 'La mayoría de los problemas vienen de la conexión o de un error al escribir los datos de acceso. Prueba primero estos pasos.',
    sections: [
      { id: 'stutter', icon: 'activity', title: 'La imagen va a saltos o se congela', body: [{ p: 'Reinicia tu router y tu dispositivo. Usa un cable de red si puedes, o acerca el dispositivo al router wifi, y vuelve a intentarlo.' }] },
      { id: 'login', icon: 'lock', title: 'Mis datos de acceso no funcionan', body: [{ p: 'Revisa los espacios y las mayúsculas/minúsculas, o copia y pega los datos desde nuestro mensaje de WhatsApp. Si sigue sin funcionar, envíanos una foto de la pantalla de error.' }] },
      { id: 'store', icon: 'tv', title: 'No encuentro la app en mi tienda', body: [{ p: 'Las tiendas de apps dependen del modelo del dispositivo y del país. Envíanos la marca, el modelo y el año de tu dispositivo: te diremos qué funciona en él.' }] },
      { id: 'crash', icon: 'pause', title: 'La app se cierra sola', body: [{ p: 'Reinicia el dispositivo, instala las actualizaciones disponibles del sistema y de la app, y vuelve a intentarlo.' }] },
      { id: 'mobile', icon: 'devices', title: 'La reproducción se corta con datos móviles', body: [{ p: 'La calidad depende de tu red móvil y de tu tarifa de datos. Si puedes, conéctate a una red wifi.' }] },
      { id: 'still', icon: 'mail', title: '¿Sigue sin funcionar?', body: [{ p: `Contacta con nosotros ${F.supportHours} con el modelo de tu dispositivo y una foto del mensaje de error, si lo hay: normalmente respondemos en ${F.usualReply}.` }] },
    ],
  },
  {
    slug: 'contact-support', name: 'Contactar con soporte', icon: 'mail',
    title: 'Contacta con nuestro equipo de soporte',
    metaTitle: 'Contactar con soporte: correo y WhatsApp, 24/7',
    description: `Contacta con el soporte de SYGMA TV+ ${F.supportHours} por correo electrónico, WhatsApp o el formulario, en seis idiomas. Qué incluir para que te respondamos antes.`,
    summary: `${F.supportHours}, correo o WhatsApp, seis idiomas.`,
    intro: `Escríbenos por correo electrónico o por WhatsApp. Nuestro asistente automático está disponible ${F.supportHours}, con atención humana cuando sea necesario.`,
    prelaunch: {
      description: `Contacta con el soporte de SYGMA TV+ ${F.supportHours} por correo electrónico o WhatsApp, en seis idiomas. Qué incluir para que te respondamos antes.`,
      sections: { reach: { body: [{ list: [`Correo electrónico: ${EMAIL}.`, `WhatsApp o teléfono: ${PHONE}.`] }] } },
    },
    sections: [
      { id: 'reach', icon: 'mail', title: 'Cómo contactarnos', body: [{ list: [
        `Correo electrónico: ${EMAIL}.`,
        `WhatsApp o teléfono: ${PHONE}.`,
        'El formulario de contacto: selecciona «Contacto» en la parte inferior de cualquier página.',
      ] }] },
      { id: 'availability', icon: 'clock', title: '¿Cuándo responde el soporte?', body: [{ p: `Nuestro asistente automático está disponible ${F.supportHours}, con atención humana cuando sea necesario. Normalmente respondemos en ${F.usualReply}. Es nuestro tiempo de respuesta habitual, no una garantía contractual.` }] },
      { id: 'languages', icon: 'globe', title: '¿En qué idiomas?', body: [
        { p: `Puedes escribirnos en ${LANGS}.` },
        { chips: [...F.languages], label: 'Idiomas de soporte' },
        { note: 'Los documentos legales están redactados en inglés.' },
      ] },
      { id: 'include', icon: 'pencil', title: 'Qué incluir', body: [{ list: [
        'Tu referencia de pedido, si la tienes.',
        'Tu dispositivo, con su marca y modelo.',
        'Qué estabas haciendo cuando empezó el problema, y una foto del mensaje de error, si aparece.',
      ] }] },
    ],
  },
  {
    slug: 'refunds', name: 'Reembolsos', icon: 'refund',
    title: 'Reembolsos y cancelaciones',
    metaTitle: 'Reembolsos: garantía de 7 días y desistimiento',
    description: 'Reembolsos de SYGMA TV+: prueba gratuita primero, reembolso del 100 % en 7 días tras activar, desistimiento de 14 días (UE y Reino Unido) y cómo pedirlo.',
    summary: 'Garantía de reembolso de 7 días y cómo solicitarlo.',
    intro: 'Primero pruebas y, si no quedas satisfecho, te devolvemos todo en los 7 días siguientes a la activación. La política completa está en nuestra página de Reembolsos (en inglés).',
    sections: [
      { id: 'guarantee', icon: 'refund', title: 'Garantía de reembolso de 7 días', body: [{ p: '¿No estás satisfecho? Pídelo en los 7 días siguientes a la activación y te devolvemos el 100 %, sin preguntas. Un solo reembolso por cliente; no disponible para cuentas suspendidas por compartir o revender el acceso.' }] },
      { id: 'withdrawal', icon: 'scale', title: 'Clientes de la UE y del Reino Unido', body: [{ p: 'Además, tienes 14 días para desistir. Pasados los 7 primeros días, te reembolsamos la parte no utilizada de tu suscripción.' }] },
      { id: 'how', icon: 'mail', title: 'Cómo pedirlo', body: [{ p: `Envía tu referencia de pedido a ${EMAIL} o por WhatsApp. Te reembolsamos en un plazo de 14 días, con el mismo método de pago que usaste.` }] },
      { id: 'after', icon: 'pause', title: 'Pasados estos plazos', body: [{ p: 'Las suscripciones no son reembolsables pasados estos plazos, salvo que la ley lo exija. Nunca se renuevan automáticamente.' }] },
    ],
  },
];

/** Interface labels of the About / Help pages. */
const INFO_UI: InfoUi = {
  home: 'Inicio',
  breadcrumb: 'Ruta de navegación',
  support: 'Soporte',
  popular: 'Preguntas habituales',
  topics: 'Temas de ayuda',
  glance: 'El soporte de un vistazo',
  helpFacts: [
    { k: 'Disponibilidad', v: F.supportHours, small: 'Correo electrónico y WhatsApp' },
    { k: 'Tiempo de respuesta habitual', v: 'Menos de una hora', small: 'Tiempo habitual, no garantizado' },
    { k: 'Idiomas', v: String(F.languages.length), small: F.languages.join(' · ') },
    { k: 'Activación', v: 'Normalmente < 1 hora', small: 'Antes del pago, tras confirmar tu pedido' },
  ],
  aboutFacts: [
    { k: 'Fundación', v: F.established, small: F.basedIn },
    { k: 'Empresa', v: siteConfig.legalEntity ?? '', small: 'Nuevo México, EE. UU.' },
    { k: 'Soporte', v: F.supportHours, small: `Suele responder en ${F.usualReply}` },
    { k: 'Idiomas de soporte', v: String(F.languages.length), small: F.languages.join(' · ') },
  ],
  aboutContact: `¿Tienes preguntas sobre SYGMA TV+? Nuestro asistente automático está disponible ${F.supportHours}, con atención humana cuando sea necesario.`,
  hubContact: '¿No encuentras tu respuesta? Escríbenos — indícanos tu dispositivo y, si la tienes, tu referencia de pedido.',
  topicContact: `¿Necesitas más ayuda? Escríbenos por correo electrónico o por WhatsApp. Nuestro asistente automático está disponible ${F.supportHours}, con atención humana cuando sea necesario.`,
  hubRelated: [
    { href: '/es/about', label: 'Sobre nosotros' },
    { href: '/es#faq', label: 'Preguntas frecuentes' },
    { href: '/legal/refunds', label: 'Reembolsos y cancelaciones (en inglés)' },
    { href: '/legal/terms', label: 'Condiciones del servicio (en inglés)' },
  ],
  refundPolicy: { href: '/legal/refunds', label: 'Política de reembolsos completa (en inglés)' },
  terms: { href: '/legal/terms', label: 'Condiciones del servicio (en inglés)' },
  allTopics: 'Todos los temas de ayuda',
  prevTopic: 'Tema anterior',
  nextTopic: 'Tema siguiente',
  content: {
    contactUs: 'Contacta con nosotros',
    email: 'Correo electrónico',
    phone: 'Teléfono / WhatsApp',
    related: 'Páginas relacionadas',
    onThisPage: 'En esta página',
    lastReviewed: 'Última revisión: ',
  },
  actions: { trial: 'Solicitar una prueba gratuita', support: 'Contactar con soporte', plans: 'Ver los planes', plansHref: '/es#plans' },
};

export const INFO: InfoContentSet = {
  about: ABOUT,
  hub: HELP_HUB,
  topics: HELP_TOPICS,
  reviewed: '20 de noviembre de 2026',
  supportHours: '24/7',
  ui: INFO_UI,
};
