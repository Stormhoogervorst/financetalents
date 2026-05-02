import type { Metadata } from "next";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Algemene Voorwaarden",
  description:
    "De algemene voorwaarden van Legal Talents VOF voor werving & selectie en het gebruik van het vacatureplatform.",
  alternates: {
    canonical: "/voorwaarden",
  },
  robots: {
    index: true,
    follow: true,
  },
};

type Clause = {
  /** bv. "1.1. Werving & Selectie:" — wordt vet gerenderd. Mag leeg zijn voor artikelen met één losse alinea. */
  label?: string;
  body: string;
};

type Article = {
  number: number;
  title: string;
  clauses: Clause[];
};

const INTRO = `Dit document bevat de Algemene Voorwaarden van Legal Talents, een vennootschap onder firma, statutair gevestigd te Nijmegen, kantoorhoudende Sint Annastraat 198c, 6525 GX Nijmegen, ingeschreven in het handelsregister van de Kamer van Koophandel onder nummer 98803093, hierna te noemen "Legal Talents". Deze Algemene Voorwaarden zijn van toepassing op alle offertes, aanvragen, opdrachten, overeenkomsten en op het gebruik van het vacatureplatform tussen Legal Talents en haar opdrachtgevers, werkgevers, kandidaten en overige gebruikers. De toepasselijkheid van eventuele inkoop- of andere voorwaarden van de opdrachtgever of gebruiker wordt hierbij uitdrukkelijk van de hand gewezen. Afwijkingen van deze Algemene Voorwaarden zijn slechts geldig indien deze uitdrukkelijk en schriftelijk door Legal Talents zijn aanvaard en overeengekomen.`;

const ARTICLES: Article[] = [
  {
    number: 1,
    title: "Definities en Dienstverlening",
    clauses: [
      {
        label: "1.1. Werving & Selectie:",
        body: 'De opdracht waarbij Legal Talents zich inspant om voor een opdrachtgever geschikte juridische professionals (hierna: "kandidaten") te selecteren ten behoeve van indiensttreding of een vergelijkbare vorm van tewerkstelling. De opdracht wordt als succesvol vervuld beschouwd zodra een door Legal Talents geïntroduceerde kandidaat een arbeidsovereenkomst of een andere vorm van overeenkomst tot tewerkstelling met de opdrachtgever aangaat.',
      },
      {
        label: "1.2. Vacatureplatform:",
        body: "De door Legal Talents beheerde online omgeving waarop werkgevers kosteloos vacatures kunnen plaatsen en kandidaten kunnen solliciteren. Het vacatureplatform vormt een afzonderlijke dienst van Legal Talents, waarbij Legal Talents optreedt als technisch faciliterende partij tussen werkgever en kandidaat.",
      },
      {
        label: "1.3. Werkgever:",
        body: "De natuurlijke of rechtspersoon die via het vacatureplatform één of meer vacatures publiceert, zonder dat daarbij een werving- en selectieopdracht aan Legal Talents is verstrekt.",
      },
      {
        label: "1.4. Opdrachtgever:",
        body: "De werkgever die daarnaast ook een werving- en selectieopdracht aan Legal Talents heeft verstrekt.",
      },
      {
        label: "1.5. Kandidaat:",
        body: "De natuurlijke persoon die via het vacatureplatform solliciteert, zich inschrijft in de database van Legal Talents, of in het kader van een werving- en selectietraject door Legal Talents wordt voorgedragen.",
      },
      {
        label: "1.6. Opdrachtbevestiging:",
        body: "De specifieke voorwaarden van de werving- en selectieopdracht, waaronder de functiebeschrijving, het beoogde profiel, het honorarium en eventuele aanvullende afspraken, worden vastgelegd in een schriftelijke opdrachtbevestiging. Deze Algemene Voorwaarden vormen een integraal onderdeel van de opdrachtbevestiging.",
      },
      {
        label: "1.7. Vertrouwelijkheid:",
        body: "Het is de opdrachtgever en de werkgever niet toegestaan om zonder voorafgaande schriftelijke toestemming van Legal Talents (persoons)gegevens van voorgestelde of sollicitende kandidaten met derden te delen. Indien de introductie of sollicitatie van een kandidaat niet leidt tot een overeenkomst, is de opdrachtgever respectievelijk werkgever verplicht de verstrekte gegevens conform de geldende AVG-wetgeving te vernietigen of te retourneren, tenzij de kandidaat uitdrukkelijk heeft ingestemd met langere bewaring.",
      },
    ],
  },
  {
    number: 2,
    title: "Gebruik van het Vacatureplatform",
    clauses: [
      {
        label: "2.1. Kosteloos gebruik:",
        body: "Het plaatsen van vacatures op het vacatureplatform is voor werkgevers kosteloos. Legal Talents behoudt zich het recht voor om op termijn betaalde functionaliteiten of upgrades aan te bieden; deze zijn uitsluitend van toepassing na uitdrukkelijke schriftelijke aanvaarding door de werkgever.",
      },
      {
        label: "2.2. Accountregistratie:",
        body: "Voor het plaatsen van vacatures dient de werkgever een account aan te maken. De werkgever is verantwoordelijk voor de juistheid van de opgegeven bedrijfsgegevens en voor het zorgvuldig omgaan met de inloggegevens van het account. Misbruik van het account komt voor rekening en risico van de werkgever.",
      },
      {
        label: "2.3. Inhoud van vacatures:",
        body: "De werkgever is volledig verantwoordelijk voor de inhoud, juistheid, actualiteit en rechtmatigheid van de geplaatste vacatures. Het is niet toegestaan om vacatures te plaatsen die discriminerend, misleidend, onrechtmatig of in strijd met toepasselijke wet- en regelgeving zijn, waaronder de Wet gelijke behandeling en de AVG.",
      },
      {
        label: "2.4. Moderatie en verwijdering:",
        body: "Legal Talents behoudt zich het recht voor om vacatures zonder voorafgaande kennisgeving te weigeren, aan te passen of te verwijderen indien deze naar het oordeel van Legal Talents niet voldoen aan deze voorwaarden, niet passen binnen het juridische segment, of de reputatie van Legal Talents kunnen schaden.",
      },
      {
        label: "2.5. Verwerking van sollicitaties:",
        body: "Sollicitaties die via het vacatureplatform worden ingediend, worden opgeslagen in de beveiligde database van Legal Talents conform het Privacybeleid en de toepasselijke AVG-wetgeving. De werkgever ontvangt de sollicitatiegegevens via het platform en/of per e-mail en verplicht zich deze uitsluitend te gebruiken voor de beoordeling van de betreffende vacature.",
      },
      {
        label: "2.6. Rolverdeling onder de AVG:",
        body: "Ten aanzien van sollicitaties die via het vacatureplatform binnenkomen zonder dat sprake is van een werving- en selectieopdracht, treedt de werkgever op als verwerkingsverantwoordelijke en Legal Talents als technisch verwerker of faciliterende partij. Indien Legal Talents tevens een werving- en selectieopdracht uitvoert, treedt Legal Talents op als (zelfstandig) verwerkingsverantwoordelijke voor haar eigen recruitmentactiviteiten. De nadere uitwerking hiervan is opgenomen in het Privacybeleid van Legal Talents.",
      },
      {
        label: "2.7. Verplichtingen van de werkgever jegens kandidaten:",
        body: "De werkgever verplicht zich sollicitanten zorgvuldig en tijdig te informeren over de status van hun sollicitatie, zich te houden aan redelijke reactietermijnen en de persoonsgegevens van sollicitanten niet langer te bewaren dan noodzakelijk voor de sollicitatieprocedure, tenzij de sollicitant uitdrukkelijk heeft ingestemd met langere bewaring.",
      },
      {
        label: "2.8. Rechtstreekse benadering van kandidaten:",
        body: "Indien een werkgever buiten Legal Talents om een kandidaat benadert of aanneemt die oorspronkelijk via een door Legal Talents uitgevoerde werving- en selectieopdracht is geïntroduceerd, is het bepaalde in artikel 3.6 (uitbreiding succesvolle vervulling) onverkort van toepassing. Voor sollicitaties die uitsluitend via het vacatureplatform zijn binnengekomen en waarbij geen werving- en selectieopdracht aan Legal Talents is verstrekt, geldt deze bepaling uitdrukkelijk niet.",
      },
      {
        label: "2.9. Beschikbaarheid:",
        body: "Legal Talents spant zich in om het vacatureplatform zo goed mogelijk beschikbaar te houden, maar garandeert geen ononderbroken beschikbaarheid. Legal Talents is niet aansprakelijk voor schade voortvloeiend uit tijdelijke onbeschikbaarheid, onderhoud of technische storingen van het platform.",
      },
    ],
  },
  {
    number: 3,
    title: "Honorarium Werving & Selectie",
    clauses: [
      {
        label: "3.1. No Cure, No Pay:",
        body: "Legal Talents werkt voor werving- en selectieopdrachten op basis van 'no cure, no pay'. Dit houdt in dat het honorarium uitsluitend verschuldigd is bij een succesvolle vervulling van de opdracht, zoals gedefinieerd in artikel 1.1 en nader gespecificeerd in artikel 3.6. Voor het gebruik van het vacatureplatform is, behoudens uitdrukkelijk overeengekomen betaalde functionaliteiten, geen honorarium verschuldigd.",
      },
      {
        label: "3.2. Berekening Honorarium:",
        body: "Het honorarium bedraagt een percentage van het fulltime bruto jaarsalaris van de geselecteerde kandidaat op de datum van indiensttreding. Onder het bruto jaarsalaris wordt verstaan: het maandsalaris vermenigvuldigd met twaalf, vermeerderd met vakantiegeld, een eventuele dertiende maand en 100% van de maximaal haalbare variabele componenten zoals bonus of provisie. Het overeengekomen percentage en een eventueel minimum honorarium worden vastgelegd in de opdrachtbevestiging. Alle genoemde bedragen zijn exclusief BTW.",
      },
      {
        label: "3.3. Facturatie:",
        body: "De factuur voor het honorarium wordt verzonden zodra de arbeidsovereenkomst door zowel de opdrachtgever als de kandidaat is ondertekend.",
      },
      {
        label: "3.4. Bijkomende Kosten:",
        body: "Eventuele additionele kosten, zoals voor specifieke wervingscampagnes of assessments, worden enkel in rekening gebracht na uitdrukkelijke schriftelijke goedkeuring van de opdrachtgever.",
      },
      {
        label: "3.5. Informatieplicht Opdrachtgever:",
        body: "De opdrachtgever is gehouden om Legal Talents binnen 14 dagen na een daartoe strekkend verzoek te voorzien van een kopie van de getekende arbeidsovereenkomst en de relevante salarisgegevens die noodzakelijk zijn voor de bepaling van het honorarium. Indien de opdrachtgever nalaat deze gegevens tijdig, volledig of correct te verstrekken, is Legal Talents gerechtigd de hoogte van het bruto jaarsalaris redelijkerwijs te schatten en conform die schatting te factureren.",
      },
      {
        label: "3.6. Uitbreiding Succesvolle Vervulling:",
        body: "Het honorarium is eveneens verschuldigd indien een door Legal Talents in het kader van een werving- en selectieopdracht voorgestelde kandidaat binnen 12 maanden na de introductie direct, indirect of via derden, in enige hoedanigheid werkzaam wordt voor de opdrachtgever of een daaraan gelieerde onderneming. Dit geldt ook indien de kandidaat reeds (oppervlakkig) bekend was bij de opdrachtgever, tenzij de opdrachtgever de kandidaat aantoonbaar en actief in een lopende sollicitatieprocedure had op het moment van introductie door Legal Talents en dit binnen 48 uur na introductie schriftelijk meldt. Deze bepaling is uitdrukkelijk niet van toepassing op kandidaten die uitsluitend via het vacatureplatform op een eigen vacature van de werkgever hebben gesolliciteerd zonder dat sprake is geweest van een werving- en selectieopdracht.",
      },
    ],
  },
  {
    number: 4,
    title: "Betalingsvoorwaarden",
    clauses: [
      {
        label: "4.1.",
        body: "De betalingstermijn voor facturen van Legal Talents bedraagt 14 dagen na factuurdatum. Bij overschrijding van deze termijn is de opdrachtgever van rechtswege in verzuim, zonder dat een nadere ingebrekestelling is vereist. Indien de opdrachtgever de declaraties niet binnen deze termijn voldoet, is Legal Talents gerechtigd haar werkzaamheden per direct op te schorten en/of de toegang tot het vacatureplatform tijdelijk te blokkeren, zonder dat zij gehouden is eventuele schade die als gevolg hiervan ontstaat te vergoeden.",
      },
    ],
  },
  {
    number: 5,
    title: "Klachten",
    clauses: [
      {
        label: "5.1.",
        body: "Eventuele klachten over de dienstverlening van Legal Talents, waaronder het vacatureplatform, dienen binnen 8 dagen na het ontstaan van de klacht gemotiveerd en schriftelijk te worden gemeld. Het indienen van een klacht schort de betalingsverplichting van de opdrachtgever niet op.",
      },
    ],
  },
  {
    number: 6,
    title: "Rente en Incassokosten",
    clauses: [
      {
        label: "6.1.",
        body: "Indien de opdrachtgever in verzuim is met de betaling van de factuur, is over het openstaande bedrag de wettelijke handelsrente (ex art. 6:119a BW) verschuldigd. Alle gerechtelijke en buitengerechtelijke (incasso)kosten die Legal Talents maakt als gevolg van de niet-nakoming door de opdrachtgever, komen volledig voor rekening van de opdrachtgever.",
      },
    ],
  },
  {
    number: 7,
    title: "Inspanningsverbintenis en Aansprakelijkheid",
    clauses: [
      {
        label: "7.1.",
        body: "Legal Talents verplicht zich tot een inspanningsverbintenis om naar beste inzicht en vermogen geschikte kandidaten te werven en selecteren, en om het vacatureplatform zo goed mogelijk te faciliteren. De uiteindelijke beslissing om een kandidaat aan te stellen en de inhoud van de arbeidsovereenkomst blijven te allen tijde de verantwoordelijkheid van de opdrachtgever respectievelijk werkgever.",
      },
      {
        label: "7.2.",
        body: "Legal Talents is niet aansprakelijk voor enige schade of verliezen, inclusief gevolgschade, die voortvloeien uit (i) de selectie van of de gedragingen van een voorgestelde of sollicitende kandidaat, zowel tijdens de selectieprocedure als na indiensttreding, (ii) de inhoud van door werkgevers geplaatste vacatures, (iii) de handelwijze van werkgevers ten aanzien van sollicitanten, of (iv) technische onbeschikbaarheid of storingen van het vacatureplatform. De opdrachtgever respectievelijk werkgever is zelf verantwoordelijk voor het verifiëren van referenties, diploma's en de geschiktheid van de kandidaat.",
      },
      {
        label: "7.3.",
        body: "Voor zover Legal Talents toch aansprakelijk is, is haar aansprakelijkheid beperkt tot het bedrag dat in het betreffende geval door haar aansprakelijkheidsverzekering wordt uitgekeerd, dan wel — indien geen uitkering plaatsvindt — tot het bedrag dat in de twaalf maanden voorafgaand aan de schadeveroorzakende gebeurtenis door de opdrachtgever aan Legal Talents is betaald.",
      },
    ],
  },
  {
    number: 8,
    title: "Garantieregeling",
    clauses: [
      {
        label: "8.1.",
        body: "Een garantieregeling is uitsluitend van toepassing op werving- en selectieopdrachten en indien deze expliciet en schriftelijk in de opdrachtbevestiging is overeengekomen. Voor sollicitaties via het vacatureplatform geldt geen garantieregeling.",
      },
      {
        label: "8.2.",
        body: "Indien een garantieregeling is afgesproken en de geplaatste kandidaat de organisatie op eigen initiatief of wegens disfunctioneren verlaat binnen de overeengekomen garantieperiode, zal Legal Talents zich inspannen om eenmalig en kosteloos een vervangende kandidaat te werven voor dezelfde functie.",
      },
      {
        label: "8.3.",
        body: "De garantie vervalt indien de beëindiging van het dienstverband het gevolg is van een reorganisatie, fusie, overname, faillissement, surseance van betaling, een wezenlijke wijziging van de functie-inhoud of het vertrek van de direct leidinggevende van de kandidaat.",
      },
    ],
  },
  {
    number: 9,
    title: "Intellectuele Eigendom",
    clauses: [
      {
        label: "9.1.",
        body: "Alle intellectuele eigendomsrechten met betrekking tot het vacatureplatform, waaronder de vormgeving, software, teksten en database, berusten uitsluitend bij Legal Talents of haar licentiegevers. Het is niet toegestaan zonder voorafgaande schriftelijke toestemming (delen van) het platform te kopiëren, te scrapen, geautomatiseerd te raadplegen of commercieel te exploiteren.",
      },
      {
        label: "9.2.",
        body: "Door het plaatsen van een vacature verleent de werkgever aan Legal Talents een niet-exclusieve, royaltyvrije licentie om de vacature te publiceren, te verspreiden en te promoten via het vacatureplatform en daaraan gelieerde kanalen, zolang de vacature actief is.",
      },
    ],
  },
  {
    number: 10,
    title: "Wijzigingen",
    clauses: [
      {
        label: "10.1.",
        body: "Legal Talents is gerechtigd deze Algemene Voorwaarden eenzijdig te wijzigen. Wijzigingen worden via het vacatureplatform en/of per e-mail aan gebruikers gecommuniceerd en treden in werking 14 dagen na kennisgeving. Voortgezet gebruik van de diensten na deze termijn geldt als aanvaarding van de gewijzigde voorwaarden.",
      },
    ],
  },
  {
    number: 11,
    title: "Toepasselijk Recht en Geschillen",
    clauses: [
      {
        label: "11.1.",
        body: "Op de rechtsverhoudingen tussen Legal Talents en de opdrachtgever, werkgever of overige gebruikers is Nederlands recht van toepassing.",
      },
      {
        label: "11.2.",
        body: "De bevoegde rechter van de rechtbank Gelderland is bevoegd in het geval een geschil wordt voorgelegd aan de gewone rechter, met dien verstande dat Legal Talents bevoegd blijft geschillen voor te leggen aan de rechter die bevoegd zou zijn indien van deze forumkeuze geen sprake zou zijn.",
      },
    ],
  },
];

export default function VoorwaardenPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-white overflow-x-hidden">
      <NavbarPublic variant="default" />

      <main
        className="flex-1"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="max-w-[820px] mx-auto pt-16 pb-20 md:pt-24 md:pb-28">
          <header className="mb-12">
            <p
              className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
              style={{ marginBottom: 12 }}
            >
              Juridisch
            </p>
            <h1
              className="text-slate-900"
              style={{
                fontSize: "clamp(36px, 4.2vw, 52px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Algemene Voorwaarden
            </h1>
            <p className="mt-3 text-sm text-slate-500 italic">
              Versie april 2026
            </p>
          </header>

          <article
            className="prose prose-slate max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-900
              prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-[22px] md:prose-h2:text-2xl
              prose-p:text-slate-700 prose-p:leading-relaxed
              prose-strong:text-slate-900 prose-strong:font-semibold
              prose-a:text-[#587DFE] hover:prose-a:text-[#4B3BD6] prose-a:no-underline hover:prose-a:underline"
          >
            <p>{INTRO}</p>

            {ARTICLES.map((article) => (
              <section key={article.number} className="scroll-mt-24">
                <h2 id={`artikel-${article.number}`}>
                  Artikel {article.number}: {article.title}
                </h2>
                {article.clauses.map((clause, idx) => (
                  <p key={idx}>
                    {clause.label ? (
                      <>
                        <strong>{clause.label}</strong>{" "}
                      </>
                    ) : null}
                    {clause.body}
                  </p>
                ))}
              </section>
            ))}
          </article>

          <hr className="mt-16 border-slate-200" />

          <footer className="mt-8 text-sm text-slate-500">
            <p>
              Legal Talents VOF — Sint Annastraat 198c, 6525 GX Nijmegen — KvK
              98803093
            </p>
            <p className="mt-2">
              Vragen over deze voorwaarden?{" "}
              <a
                href="mailto:storm@legal-talents.nl"
                className="text-[#587DFE] hover:text-[#4B3BD6] hover:underline"
              >
                storm@legal-talents.nl
              </a>
            </p>
          </footer>
        </div>
      </main>

      <Footer />
    </div>
  );
}
