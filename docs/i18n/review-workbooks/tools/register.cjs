// The 36 « REQUIRES OWNER/LEGAL APPROVAL » rows of docs/i18n/phase11/sensitive-wording-register.md, mapped to keys.
// keys: dictionary paths, or 'info:<path>'; 'info:*abgebucht' = every About/Help string containing « abgebucht ».
module.exports = {
  fr: [
    { id: 'fr 4', cat: 'refund', keys: ['info:topics[6].sections[0].body[0].p'], prop: '… nous vous remboursons à 100 %, sans avoir à vous justifier. …' },
    { id: 'fr 5', cat: 'contract', keys: ['info:topics[3].sections[5].body[0].p'], prop: 'Le contrat prend effet lorsque notre équipe confirme votre commande.' },
    { id: 'fr 6', cat: 'refund', keys: ['info:topics[6].sections[2].body[0].p'], prop: '… Vous êtes remboursé sous 14 jours, via le moyen de paiement utilisé.' },
  ],
  de: [
    { id: 'de 4', cat: 'withdrawal', keys: ['info:topics[6].sections[1].body[0].p'], prop: 'Sie haben zusätzlich ein 14-tägiges Widerrufsrecht. …' },
    { id: 'de 5b', cat: 'refund', keys: ['info:topics[6].description', 'info:topics[6].summary'], prop: 'Use « Widerrufsrecht » in the description; in the summary, « – » instead of the comma.' },
    { id: 'de 6', cat: 'consent-privacy', keys: ['consent.text'], prop: '… Bevor Sie eine Auswahl treffen, werden keine Cookies gesetzt. …' },
    { id: 'de 7', cat: 'payment', keys: ['checkout.offerText', 'checkout.productionNote', 'info:*abgebucht'], prop: 'Auf dieser Website bezahlen Sie nichts. / Auf dieser Website erfolgt keine Zahlung.' },
    { id: 'de 9', cat: 'contract', keys: ['info:topics[3].sections[5].body[0].p'], prop: 'Der Vertrag kommt zustande, wenn unser Team Ihre Bestellung bestätigt.' },
    { id: 'de 12', cat: 'consent-privacy', keys: ['forms.consent', 'checkout.consentSub'], prop: '… Ihre Daten werden innerhalb von 12 Monaten gelöscht.' },
  ],
  es: [
    { id: 'es 1', cat: 'refund', keys: ['faq.items[4].a'], prop: '… Si nos lo pides en los 7 días siguientes a la activación, te devolvemos el 100 %. …' },
    { id: 'es 2', cat: 'refund', keys: ['info:topics[6].sections[0].body[0].p'], prop: '¿No estás satisfecho? Solicita el reembolso en los 7 días siguientes a la activación y te devolvemos el 100 %, sin tener que dar explicaciones. …' },
    { id: 'es 3', cat: 'refund', keys: ['info:topics[6].intro'], prop: 'Primero pruebas y, si no quedas satisfecho en los 7 días siguientes a la activación, te reembolsamos el importe íntegro. …' },
    { id: 'es 6', cat: 'consent-privacy', keys: ['forms.consent', 'checkout.consentSub'], prop: '… Tus datos se eliminan en un plazo de 12 meses.' },
  ],
  it: [
    { id: 'it 1', cat: 'refund', keys: ['faq.items[4].a'], prop: '… Se lo chiedi entro 7 giorni dall’attivazione, ti rimborsiamo al 100%. …' },
    { id: 'it 2', cat: 'refund', keys: ['info:topics[6].sections[0].body[0].p'], prop: 'Non sei soddisfatto? Chiedi il rimborso entro 7 giorni dall’attivazione e ti rimborsiamo al 100%, senza bisogno di giustificazioni. …' },
    { id: 'it 4', cat: 'consent-privacy', keys: ['forms.consent', 'checkout.consentMain'], prop: 'Accetto di essere contattato/a … (optional); « I dati vengono cancellati entro 12 mesi » (optional)' },
  ],
  nl: [
    { id: 'nl 1', cat: 'consent-privacy', keys: ['consent.text'], prop: 'Met je toestemming gebruiken we cookies om het bezoek aan onze website (Google Analytics, Microsoft Clarity) en onze advertentiecampagnes (marketing) te meten. Er wordt niets geplaatst voordat je een keuze maakt. Je kunt je keuze altijd wijzigen via ‘Cookie-instellingen’.' },
    { id: 'nl 2', cat: 'consent-privacy', keys: ['consent.analyticsText'], prop: 'Meting van het websitebezoek en verbetering van de website (Google Analytics, Microsoft Clarity).' },
    { id: 'nl 4', cat: 'refund', keys: ['faq.items[4].a'], prop: '… Vraag binnen 7 dagen na activering een terugbetaling aan en je krijgt 100% terug. …' },
    { id: 'nl 5', cat: 'consent-privacy', keys: ['faq.items[5].a'], prop: 'Alleen de gegevens die je ons zelf stuurt. We gebruiken ze alleen om je aanvraag en je abonnement af te handelen, en we verkopen je gegevens nooit.' },
    { id: 'nl 11', cat: 'refund', keys: ['info:topics[6].sections[0].body[0].p'], prop: 'Niet tevreden? Vraag binnen 7 dagen na activering een terugbetaling aan en je krijgt 100% terug, zonder vragen. … opgeschort wegens …' },
    { id: 'nl 12', cat: 'contract', keys: ['info:topics[3].sections[5].body[0].p'], prop: 'De overeenkomst gaat in wanneer ons team je bestelling bevestigt.' },
  ],
  sv: [
    { id: 'sv 1', cat: 'consent-privacy', keys: ['consent.text'], prop: 'Med ditt samtycke använder vi cookies för att mäta trafiken på webbplatsen (Google Analytics, Microsoft Clarity) och resultatet av våra annonskampanjer (marknadsföring). Inga cookies sätts förrän du har gjort ditt val. … (or « Inga valfria cookies » if the choice cookie is excluded)' },
    { id: 'sv 2', cat: 'consent-privacy', keys: ['consent.analyticsText'], prop: 'Besöksstatistik och förbättring av webbplatsen (Google Analytics, Microsoft Clarity).' },
    { id: 'sv 3', cat: 'consent-privacy', keys: ['consent.necessaryText'], prop: '… Alltid aktiva, ingen spårning.' },
    { id: 'sv 4', cat: 'consent-privacy', keys: ['forms.consent', 'checkout.consentMain'], prop: 'Jag godkänner att ni kontaktar mig om den här förfrågan / om min beställning. …' },
    { id: 'sv 5', cat: 'refund', keys: ['checkout.trust[1]'], prop: 'Pengarna tillbaka i 7 dagar / 7 dagars pengarna-tillbaka-garanti' },
    { id: 'sv 6', cat: 'refund', keys: ['plans.trust[1].title'], prop: 'Pengarna-tillbaka-garanti (25 characters; layout check needed)' },
    { id: 'sv 7', cat: 'refund', keys: ['info:topics[6].sections[2].body[0].p'], prop: '… Du får pengarna tillbaka inom 14 dagar, via samma betalsätt som du använde.' },
    { id: 'sv 8', cat: 'refund', keys: ['info:topics[6].intro'], prop: 'Testa först. Är du inte nöjd får du full återbetalning om du hör av dig inom 7 dagar från aktiveringen. …' },
    { id: 'sv 9', cat: 'refund', keys: ['info:topics[6].description'], prop: '… 14 dagars ångerrätt i EU och UK – så går det till.' },
  ],
  nb: [
    { id: 'nb 1', cat: 'withdrawal', keys: ['faq.items[4].a', 'info:about.sections[3].body[0].list[2]', 'info:topics[6].description', 'info:topics[6].sections[1].title'], prop: 'Kunder i EØS (inkludert Norge) og Storbritannia har i tillegg 14 dagers angrerett. Section title: Kunder i EØS og Storbritannia. (Affects the English source and every language.)' },
    { id: 'nb 3', cat: 'tax', keys: ['faq.items[3].a', 'info:topics[3].sections[4].body[0].p'], prop: 'No wording proposal: business and legal decision (Norwegian consumer prices generally include VAT).' },
    { id: 'nb 4b', cat: 'refund', keys: ['info:topics[6].description'], prop: 'Refusjon hos SYGMA TV+: prøv gratis først, 100 % refusjon innen 7 dager etter aktivering, 14 dagers angrerett for kunder i EU/UK. Slik ber du om det.' },
    { id: 'nb 5', cat: 'consent-privacy', keys: ['consent.text'], prop: 'Hvis du samtykker, bruker vi informasjonskapsler (cookies) til å måle trafikken på nettstedet (Google Analytics, Microsoft Clarity) og effekten av annonsekampanjene våre (markedsføring). Ingenting lagres før du har valgt. …' },
    { id: 'nb 6', cat: 'consent-privacy', keys: ['forms.consent', 'checkout.consentSub'], prop: '… Opplysningene dine slettes innen 12 måneder.' },
  ],
};
