/**
 * Guides d'installation en français (SEO international, phase 2 — 18/11/2026).
 *
 * Règle : ne documenter que ce qui est vérifié. L'application de lecture à installer n'est PAS nommée :
 * notre équipe l'indique avec les accès (WhatsApp), selon l'appareil. Les guides décrivent les étapes
 * propres à chaque plateforme (réseau, mise à jour, boutique d'applications officielle, saisie des accès,
 * dépannage), sans installation hors boutique officielle. À compléter avec le nom de l'application dès
 * que l'équipe l'aura confirmé pour chaque appareil (voir docs/INTERNATIONAL.md).
 */
export type GuideIcon = 'tv' | 'android' | 'fire' | 'apple' | 'phone' | 'laptop';

export interface Guide {
  slug: string;
  icon: GuideIcon;
  /** Device name (H1 and cards). */
  device: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  before: string[];
  steps: Array<{ title: string; text: string }>;
  troubleshooting: Array<{ q: string; a: string }>;
}

export const FR_GUIDES_INTRO = {
  title: 'Guides d’installation',
  metaTitle: 'Guides d’installation : TV, mobile et ordinateur',
  description: 'Installez SYGMA TV+ pas à pas sur Smart TV, Android TV, Fire TV, Apple TV, iPhone, Android ou ordinateur : prérequis, étapes et dépannage.',
  lead: 'Choisissez votre appareil : chaque guide détaille les prérequis, les étapes d’installation et les solutions aux problèmes les plus courants. Avec vos accès, notre équipe vous indique l’application à utiliser sur votre appareil.',
  shared: {
    accessTitle: 'Vos accès',
    access: 'Après votre demande d’essai ou votre commande, notre équipe vous envoie sur WhatsApp vos identifiants et le nom de l’application à installer sur votre appareil. Gardez ce message à portée de main pendant l’installation.',
    helpTitle: 'Besoin d’aide ?',
    help: 'Notre équipe vous accompagne pendant l’installation. Indiquez-nous votre appareil, son modèle et l’étape où vous êtes bloqué.',
    beforeTitle: 'Avant de commencer',
    stepsTitle: 'Les étapes',
    troubleTitle: 'Problèmes fréquents',
    otherGuides: 'Les autres guides',
    allGuides: 'Tous les guides',
    trialCta: 'Demander un essai gratuit',
    read: 'Lire le guide',
  },
};

const CONNECT = 'Branchez de préférence un câble réseau, ou placez l’appareil près de votre box Wi-Fi : une connexion stable évite la plupart des coupures.';

export const FR_GUIDES: Guide[] = [
  {
    slug: 'smart-tv',
    icon: 'tv',
    device: 'Smart TV (Samsung, LG)',
    title: 'Installer SYGMA TV+ sur une Smart TV Samsung ou LG',
    metaTitle: 'Installer SYGMA TV+ sur Smart TV Samsung ou LG',
    description: 'Guide pas à pas pour installer SYGMA TV+ sur une Smart TV Samsung ou LG : connexion, mise à jour, boutique d’applications, saisie de vos accès et dépannage.',
    intro: 'Les Smart TV Samsung et LG installent leurs applications depuis leur boutique intégrée. Les menus varient légèrement selon l’année et le modèle de votre téléviseur : les intitulés ci-dessous sont ceux que l’on retrouve le plus souvent.',
    before: [
      'Un téléviseur connecté à internet et sa télécommande.',
      'Le message WhatsApp de notre équipe avec vos accès et le nom de l’application.',
      CONNECT,
    ],
    steps: [
      { title: 'Vérifiez la connexion', text: 'Ouvrez les Paramètres du téléviseur, puis la rubrique Réseau, et vérifiez que la TV est bien connectée à internet (câble ou Wi-Fi).' },
      { title: 'Mettez le téléviseur à jour', text: 'Dans les Paramètres, ouvrez la rubrique d’assistance ou « À propos de cette TV » et lancez la mise à jour du logiciel si elle est proposée. Une TV à jour évite de nombreux problèmes d’applications.' },
      { title: 'Ouvrez la boutique d’applications', text: 'Sur Samsung, appuyez sur le bouton Accueil puis ouvrez « Apps ». Sur LG, ouvrez la boutique d’applications depuis l’écran d’accueil (LG Content Store ou « Apps » selon le modèle).' },
      { title: 'Installez l’application indiquée', text: 'Recherchez le nom de l’application communiqué par notre équipe, sélectionnez-la puis choisissez « Installer ». Ajoutez-la à l’écran d’accueil pour la retrouver facilement.' },
      { title: 'Saisissez vos accès', text: 'Ouvrez l’application et saisissez les identifiants reçus sur WhatsApp, en respectant les majuscules et minuscules.' },
      { title: 'Vérifiez la lecture', text: 'Lancez une chaîne et laissez-la tourner quelques minutes pour vérifier la fluidité de l’image.' },
    ],
    troubleshooting: [
      { q: 'L’application est introuvable dans la boutique', a: 'Le catalogue de la boutique dépend du modèle et du pays du téléviseur. Écrivez-nous en précisant la marque, le modèle et l’année de votre TV : nous vous indiquerons la solution adaptée, par exemple un boîtier Fire TV ou Android TV branché sur la TV.' },
      { q: 'L’image saccade ou se fige', a: 'Redémarrez la box internet et le téléviseur, rapprochez la TV de la box ou utilisez un câble réseau, puis réessayez.' },
      { q: 'Mes identifiants sont refusés', a: 'Vérifiez la saisie (espaces, majuscules). Si le problème persiste, envoyez-nous une capture de l’écran d’erreur.' },
    ],
  },
  {
    slug: 'android-tv',
    icon: 'android',
    device: 'Android TV et Google TV',
    title: 'Installer SYGMA TV+ sur Android TV et Google TV',
    metaTitle: 'Installer SYGMA TV+ sur Android TV et Google TV',
    description: 'Installez SYGMA TV+ sur un téléviseur ou un boîtier Android TV / Google TV depuis Google Play : prérequis, étapes et dépannage.',
    intro: 'Android TV et Google TV équipent de nombreux téléviseurs (Sony, Philips, TCL, Xiaomi…) et boîtiers, dont Chromecast avec Google TV. Les applications s’installent depuis Google Play, avec votre compte Google.',
    before: [
      'Un téléviseur ou un boîtier Android TV / Google TV connecté à internet.',
      'Un compte Google connecté sur l’appareil.',
      'Le message WhatsApp de notre équipe avec vos accès et le nom de l’application.',
    ],
    steps: [
      { title: 'Vérifiez la connexion et les mises à jour', text: 'Dans les Paramètres, ouvrez Réseau et Internet pour vérifier la connexion, puis la rubrique Système pour installer les mises à jour disponibles.' },
      { title: 'Ouvrez Google Play', text: 'Depuis l’écran d’accueil, ouvrez l’onglet Applications puis Google Play (ou « Rechercher des applications » sur Google TV).' },
      { title: 'Installez l’application indiquée', text: 'Recherchez l’application communiquée par notre équipe, puis sélectionnez « Installer ».' },
      { title: 'Saisissez vos accès', text: 'Ouvrez l’application et saisissez les identifiants reçus sur WhatsApp.' },
      { title: 'Vérifiez la lecture', text: 'Lancez une chaîne pour vérifier l’image et le son.' },
    ],
    troubleshooting: [
      { q: 'Google Play n’est pas disponible sur mon boîtier', a: 'Certains boîtiers n’ont pas Google Play. Écrivez-nous avec la marque et le modèle de votre boîtier : nous vous indiquerons si une autre solution est possible.' },
      { q: 'L’image saccade', a: CONNECT },
      { q: 'L’application se ferme toute seule', a: 'Redémarrez l’appareil, vérifiez les mises à jour du système et de l’application, puis réessayez.' },
    ],
  },
  {
    slug: 'fire-tv',
    icon: 'fire',
    device: 'Fire TV',
    title: 'Installer SYGMA TV+ sur Amazon Fire TV',
    metaTitle: 'Installer SYGMA TV+ sur Fire TV Stick et Fire TV Cube',
    description: 'Installez SYGMA TV+ sur Fire TV Stick, Fire TV Cube ou un téléviseur Fire TV depuis l’Amazon Appstore : prérequis, étapes et dépannage.',
    intro: 'Les appareils Fire TV (Fire TV Stick, Fire TV Cube et téléviseurs Fire TV) installent leurs applications depuis l’Amazon Appstore, avec votre compte Amazon.',
    before: [
      'Un appareil Fire TV branché sur un port HDMI du téléviseur et connecté à internet.',
      'Un compte Amazon connecté sur l’appareil.',
      'Le message WhatsApp de notre équipe avec vos accès et le nom de l’application.',
    ],
    steps: [
      { title: 'Vérifiez la connexion et les mises à jour', text: 'Ouvrez Paramètres, puis Réseau pour vérifier la connexion, puis « Mon Fire TV » pour rechercher les mises à jour.' },
      { title: 'Recherchez l’application', text: 'Depuis l’écran d’accueil, ouvrez la recherche (la loupe) et tapez le nom de l’application communiqué par notre équipe.' },
      { title: 'Installez-la depuis l’Amazon Appstore', text: 'Sélectionnez l’application puis « Télécharger » ou « Obtenir ». Installez uniquement des applications de l’Amazon Appstore.' },
      { title: 'Saisissez vos accès', text: 'Ouvrez l’application et saisissez les identifiants reçus sur WhatsApp.' },
      { title: 'Vérifiez la lecture', text: 'Lancez une chaîne et vérifiez la fluidité de l’image.' },
    ],
    troubleshooting: [
      { q: 'Le stick chauffe ou l’image se coupe', a: 'Utilisez l’alimentation d’origine branchée sur une prise secteur plutôt qu’un port USB du téléviseur, et l’extension HDMI fournie si le stick est collé au téléviseur.' },
      { q: 'L’image saccade', a: CONNECT },
      { q: 'L’application n’apparaît pas dans la recherche', a: 'Vérifiez l’orthographe du nom, puis écrivez-nous avec le modèle de votre Fire TV.' },
    ],
  },
  {
    slug: 'apple-tv',
    icon: 'apple',
    device: 'Apple TV',
    title: 'Installer SYGMA TV+ sur Apple TV',
    metaTitle: 'Installer SYGMA TV+ sur Apple TV',
    description: 'Installez SYGMA TV+ sur Apple TV depuis l’App Store : prérequis, étapes d’installation et solutions aux problèmes courants.',
    intro: 'Sur Apple TV, les applications s’installent depuis l’App Store, avec votre identifiant Apple.',
    before: [
      'Une Apple TV connectée au téléviseur et à internet.',
      'Un identifiant Apple connecté sur l’Apple TV.',
      'Le message WhatsApp de notre équipe avec vos accès et le nom de l’application.',
    ],
    steps: [
      { title: 'Mettez l’Apple TV à jour', text: 'Ouvrez Réglages, puis Système, puis Mises à jour logicielles, et installez la dernière version proposée.' },
      { title: 'Ouvrez l’App Store', text: 'Depuis l’écran d’accueil, ouvrez l’App Store puis l’onglet Rechercher.' },
      { title: 'Installez l’application indiquée', text: 'Tapez le nom de l’application communiqué par notre équipe, puis sélectionnez « Obtenir ».' },
      { title: 'Saisissez vos accès', text: 'Ouvrez l’application et saisissez les identifiants reçus sur WhatsApp. Vous pouvez utiliser le clavier de votre iPhone pour aller plus vite.' },
      { title: 'Vérifiez la lecture', text: 'Lancez une chaîne pour vérifier l’image et le son.' },
    ],
    troubleshooting: [
      { q: 'L’application n’est pas proposée', a: 'Elle peut dépendre du pays de votre identifiant Apple ou de la version de tvOS. Écrivez-nous avec le modèle de votre Apple TV.' },
      { q: 'L’image saccade', a: CONNECT },
      { q: 'Le son est décalé', a: 'Dans Réglages, ouvrez Vidéo et audio pour étalonner la synchronisation, puis relancez la chaîne.' },
    ],
  },
  {
    slug: 'iphone-ipad',
    icon: 'phone',
    device: 'iPhone et iPad',
    title: 'Installer SYGMA TV+ sur iPhone et iPad',
    metaTitle: 'Installer SYGMA TV+ sur iPhone et iPad (iOS, iPadOS)',
    description: 'Installez SYGMA TV+ sur iPhone ou iPad depuis l’App Store : prérequis, étapes, et conseils pour une lecture fluide en Wi-Fi ou en 4G/5G.',
    intro: 'Sur iPhone et iPad, les applications s’installent depuis l’App Store. Pour une lecture confortable, privilégiez une connexion Wi-Fi stable.',
    before: [
      'Un iPhone ou un iPad avec une version récente d’iOS ou d’iPadOS.',
      'Un identifiant Apple connecté.',
      'Le message WhatsApp de notre équipe avec vos accès et le nom de l’application.',
    ],
    steps: [
      { title: 'Mettez l’appareil à jour', text: 'Ouvrez Réglages, puis Général, puis Mise à jour logicielle.' },
      { title: 'Installez l’application indiquée', text: 'Ouvrez l’App Store, touchez Rechercher, tapez le nom de l’application communiqué par notre équipe, puis touchez « Obtenir ».' },
      { title: 'Saisissez vos accès', text: 'Ouvrez l’application et saisissez les identifiants reçus sur WhatsApp. Vous pouvez les copier-coller depuis le message.' },
      { title: 'Vérifiez la lecture', text: 'Lancez une chaîne, de préférence en Wi-Fi.' },
    ],
    troubleshooting: [
      { q: 'La lecture s’arrête en 4G ou en 5G', a: 'La qualité dépend de votre réseau mobile et de votre forfait de données. Passez en Wi-Fi si possible.' },
      { q: 'Mes identifiants sont refusés', a: 'Copiez-collez-les depuis WhatsApp pour éviter les erreurs de saisie, puis réessayez.' },
    ],
  },
  {
    slug: 'android',
    icon: 'android',
    device: 'Smartphones et tablettes Android',
    title: 'Installer SYGMA TV+ sur un smartphone ou une tablette Android',
    metaTitle: 'Installer SYGMA TV+ sur Android (smartphone, tablette)',
    description: 'Installez SYGMA TV+ sur un smartphone ou une tablette Android depuis Google Play : prérequis, étapes et dépannage.',
    intro: 'Sur les smartphones et tablettes Android, les applications s’installent depuis Google Play, avec votre compte Google.',
    before: [
      'Un smartphone ou une tablette Android à jour.',
      'Un compte Google connecté.',
      'Le message WhatsApp de notre équipe avec vos accès et le nom de l’application.',
    ],
    steps: [
      { title: 'Mettez l’appareil à jour', text: 'Dans les Paramètres, ouvrez la rubrique Système (ou Mise à jour du logiciel selon la marque) et installez les mises à jour proposées.' },
      { title: 'Installez l’application indiquée', text: 'Ouvrez Google Play, recherchez l’application communiquée par notre équipe, puis touchez « Installer ».' },
      { title: 'Saisissez vos accès', text: 'Ouvrez l’application et saisissez les identifiants reçus sur WhatsApp, ou copiez-collez-les depuis le message.' },
      { title: 'Vérifiez la lecture', text: 'Lancez une chaîne, de préférence en Wi-Fi.' },
    ],
    troubleshooting: [
      { q: 'La lecture s’arrête en données mobiles', a: 'La qualité dépend de votre réseau mobile et de votre forfait. Passez en Wi-Fi si possible.' },
      { q: 'L’application se ferme toute seule', a: 'Redémarrez l’appareil, mettez à jour l’application depuis Google Play, puis réessayez.' },
    ],
  },
  {
    slug: 'ordinateur',
    icon: 'laptop',
    device: 'Ordinateur (Windows, Mac)',
    title: 'Regarder SYGMA TV+ sur ordinateur (Windows et Mac)',
    metaTitle: 'Regarder SYGMA TV+ sur ordinateur Windows ou Mac',
    description: 'Regardez SYGMA TV+ sur un ordinateur Windows ou Mac : prérequis, étapes et conseils pour une lecture fluide.',
    intro: 'Sur ordinateur, le service s’utilise dans un navigateur ou dans une application, selon ce que notre équipe vous indique avec vos accès.',
    before: [
      'Un ordinateur Windows ou Mac à jour, avec un navigateur récent (Chrome, Edge, Firefox ou Safari).',
      'Le message WhatsApp de notre équipe avec vos accès et la méthode à utiliser.',
      CONNECT,
    ],
    steps: [
      { title: 'Mettez à jour le navigateur', text: 'Installez la dernière version de votre navigateur : la lecture vidéo en dépend.' },
      { title: 'Suivez la méthode indiquée', text: 'Ouvrez l’adresse ou installez l’application indiquée par notre équipe, en la téléchargeant uniquement depuis la source officielle communiquée.' },
      { title: 'Saisissez vos accès', text: 'Saisissez ou copiez-collez les identifiants reçus sur WhatsApp.' },
      { title: 'Vérifiez la lecture', text: 'Lancez une chaîne ; passez en plein écran pour un meilleur confort.' },
    ],
    troubleshooting: [
      { q: 'La vidéo ne démarre pas', a: 'Désactivez temporairement les extensions du navigateur (bloqueurs), rechargez la page, puis réessayez avec un autre navigateur.' },
      { q: 'L’image saccade', a: CONNECT },
    ],
  },
];

export const frGuide = (slug: string) => FR_GUIDES.find((g) => g.slug === slug);
