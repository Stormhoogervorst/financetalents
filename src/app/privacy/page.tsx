import type { Metadata } from "next";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacybeleid",
  description:
    "Hoe Legal Talents VOF persoonsgegevens verwerkt van kandidaten, werkgevers en bezoekers van het vacatureplatform, in lijn met de AVG.",
  alternates: {
    canonical: "/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * Een inhoudsblok binnen een sectie.
 * - p: gewone alinea
 * - h3: sub-kopje
 * - ul: bullet-lijst met losse items
 * - ul-labeled: bullet-lijst waarbij elk item begint met een vet label
 *   (bv. "**Werving & selectie:** ...")
 */
type Block =
  | { type: "p"; body: string }
  | { type: "h3"; body: string }
  | { type: "ul"; items: string[] }
  | { type: "ul-labeled"; items: Array<{ label: string; body: string }> };

type Section = {
  /** Nummer zoals in het brondocument. Ontbreekt bij de inleiding. */
  number?: number;
  title?: string;
  blocks: Block[];
};

const INTRO: Section = {
  blocks: [
    {
      type: "p",
      body: "Legal Talents hecht grote waarde aan de bescherming van uw persoonsgegevens. Sinds 25 mei 2018 geldt de Algemene Verordening Gegevensbescherming (AVG), en wij verwerken persoonsgegevens volledig in overeenstemming met deze wetgeving. Dit privacybeleid is van toepassing op alle kandidaten, sollicitanten, opdrachtgevers, werkgevers, websitebezoekers en andere relaties die gebruik maken van de diensten van Legal Talents, waaronder het vacatureplatform. Indien u ervoor kiest om vrijwillig persoonsgegevens aan ons te verstrekken — bijvoorbeeld door te solliciteren via het vacatureplatform of u in te schrijven in onze talentpool — verwerken wij deze in overeenstemming met dit privacybeleid.",
    },
    {
      type: "p",
      body: "Legal Talents is een recruitmentbureau gespecialiseerd in de juridische sector en biedt onder meer:",
    },
    {
      type: "ul",
      items: [
        "Werving & selectie van juridisch talent",
        "Detachering en interim-oplossingen",
        "Bemiddeling van ZZP'ers",
        "Een vacatureplatform voor juridische functies, waarop werkgevers kosteloos vacatures kunnen publiceren en kandidaten rechtstreeks kunnen solliciteren",
        "Loopbaanadvies en talentontwikkeling",
      ],
    },
  ],
};

const SECTIONS: Section[] = [
  {
    number: 1,
    title: "Verwerkingsverantwoordelijkheid en rolverdeling",
    blocks: [
      {
        type: "p",
        body: "De rol die Legal Talents onder de AVG vervult, hangt af van de dienst waarvan u gebruik maakt:",
      },
      {
        type: "ul-labeled",
        items: [
          {
            label: "Werving & selectie en eigen recruitmentactiviteiten:",
            body: "Legal Talents treedt op als zelfstandig verwerkingsverantwoordelijke voor de verwerking van persoonsgegevens van kandidaten die wij actief werven, voordragen en bemiddelen, en voor de kandidaten in onze talentpool.",
          },
          {
            label:
              "Sollicitaties via het vacatureplatform zonder werving- en selectieopdracht:",
            body: "Wanneer een werkgever zelfstandig een vacature plaatst en een kandidaat daarop reageert zonder dat Legal Talents een werving- en selectieopdracht uitvoert, is de werkgever de verwerkingsverantwoordelijke voor de sollicitatiegegevens. Legal Talents treedt in dat geval op als faciliterende partij respectievelijk verwerker die de technische infrastructuur (waaronder de database) aanbiedt waarin sollicitaties worden opgeslagen en doorgestuurd.",
          },
          {
            label: "Websitegebruik en talentpool:",
            body: "Voor de verwerking van gegevens van websitebezoekers en inschrijvingen in de eigen talentpool van Legal Talents, treedt Legal Talents op als zelfstandig verwerkingsverantwoordelijke.",
          },
        ],
      },
      {
        type: "p",
        body: "Legal Talents en werkgevers die het vacatureplatform gebruiken, leggen hun onderlinge afspraken over de verwerking van sollicitatiegegevens vast via de Algemene Voorwaarden en, waar nodig, een aanvullende verwerkersovereenkomst.",
      },
    ],
  },
  {
    number: 2,
    title: "Wanneer verzamelen wij persoonsgegevens?",
    blocks: [
      { type: "p", body: "Wij verzamelen uw persoonsgegevens wanneer u:" },
      {
        type: "ul",
        items: [
          "Zich inschrijft via onze website of ons vacatureplatform",
          "Uw CV uploadt of solliciteert op een vacature via het vacatureplatform",
          "Zich aanmeldt voor onze talentpool",
          "Contact met ons opneemt (bijv. via e-mail of telefoon)",
          "Door ons wordt benaderd (bijv. via LinkedIn of executive search)",
          "Als werkgever een account aanmaakt om vacatures te plaatsen",
          "Onze website bezoekt",
        ],
      },
    ],
  },
  {
    number: 3,
    title: "Welke persoonsgegevens verwerken wij?",
    blocks: [
      {
        type: "p",
        body: "Afhankelijk van uw relatie met ons kunnen wij onder meer de volgende gegevens verwerken:",
      },
      {
        type: "h3",
        body: "Kandidaten en sollicitanten (via vacatureplatform of werving & selectie)",
      },
      {
        type: "ul",
        items: [
          "NAW-gegevens, e-mailadres en telefoonnummer",
          "Geboortedatum, leeftijd en geslacht",
          "Curriculum vitae (CV), opleiding en werkervaring",
          "Motivatiebrief en aanvullende documenten",
          "Referenties en beoordelingen",
          "Beschikbaarheid en voorkeuren",
          "Sollicitatiegeschiedenis binnen het vacatureplatform (op welke vacatures is gesolliciteerd, status en communicatie)",
          "Eventueel test- of assessmentresultaten",
          "(Optioneel) foto of video",
        ],
      },
      { type: "h3", body: "Werknemers / ZZP'ers" },
      {
        type: "ul",
        items: [
          "Identiteitsgegevens (zoals ID en BSN indien wettelijk vereist)",
          "Salaris- en administratieve gegevens",
          "Ondernemingsgegevens (bij ZZP'ers)",
        ],
      },
      { type: "h3", body: "Zakelijke relaties en werkgevers op het vacatureplatform" },
      {
        type: "ul",
        items: [
          "Naam, functie en contactgegevens van contactpersonen",
          "Bedrijfsgegevens (waaronder KvK-nummer en vestigingsadres)",
          "Accountgegevens voor het vacatureplatform (inclusief inloggegevens en IP-adres bij inloggen)",
        ],
      },
      { type: "h3", body: "Websitegebruikers" },
      {
        type: "ul",
        items: [
          "IP-adres",
          "Browser- en apparaatgegevens",
          "Surfgedrag op de website en het vacatureplatform",
        ],
      },
    ],
  },
  {
    number: 4,
    title: "Hoe verzamelen wij persoonsgegevens?",
    blocks: [
      { type: "p", body: "Wij verzamelen gegevens:" },
      {
        type: "ul-labeled",
        items: [
          {
            label: "Direct van u",
            body: "(bij inschrijving, sollicitatie via het vacatureplatform of contact)",
          },
          {
            label: "Automatisch",
            body: "via cookies en gebruik van de website en het vacatureplatform",
          },
          {
            label: "Via derden,",
            body: "zoals opdrachtgevers, referenten of openbare bronnen (bijv. LinkedIn)",
          },
        ],
      },
    ],
  },
  {
    number: 5,
    title: "Waarom verwerken wij uw persoonsgegevens?",
    blocks: [
      { type: "p", body: "Wij verwerken uw gegevens voor de volgende doeleinden:" },
      {
        type: "ul",
        items: [
          "Het beheren van sollicitaties die via het vacatureplatform binnenkomen en het doorzetten hiervan naar de betreffende werkgever",
          "Bemiddeling naar werk of opdrachten",
          "Matchen van kandidaten met vacatures, waaronder de actieve benadering van kandidaten in onze talentpool",
          "Contact opnemen over relevante vacatures of diensten",
          "Uitvoeren van recruitmentprocessen",
          "Beheer van werkgeveraccounts op het vacatureplatform",
          "Beveiliging, fraudepreventie en misbruikdetectie op het vacatureplatform",
          "Administratie en contractbeheer",
          "Marketing en nieuwsbrieven (alleen met toestemming)",
          "Verbeteren van onze dienstverlening, website en vacatureplatform",
          "Naleving van wet- en regelgeving",
        ],
      },
    ],
  },
  {
    number: 6,
    title: "Rechtsgrondslagen",
    blocks: [
      { type: "p", body: "Wij verwerken persoonsgegevens op basis van:" },
      {
        type: "ul-labeled",
        items: [
          {
            label: "Toestemming",
            body: "(bijv. voor marketing, of voor opname in de talentpool voor langere duur)",
          },
          {
            label: "Uitvoering van een overeenkomst",
            body: "(bijv. het afhandelen van een sollicitatie of een werving- en selectieopdracht)",
          },
          {
            label: "Wettelijke verplichting",
            body: "(bijv. fiscale bewaarplichten)",
          },
          {
            label: "Gerechtvaardigd belang",
            body: "(zoals recruitmentactiviteiten, het beveiligen van het vacatureplatform en het voorkomen van misbruik)",
          },
        ],
      },
    ],
  },
  {
    number: 7,
    title: "Met wie delen wij uw gegevens?",
    blocks: [
      { type: "p", body: "Wij kunnen uw persoonsgegevens delen met:" },
      {
        type: "ul-labeled",
        items: [
          {
            label: "Werkgevers en opdrachtgevers:",
            body: "sollicitatiegegevens worden gedeeld met de werkgever op wiens vacature u solliciteert. Bij werving- en selectietrajecten alleen na uw uitdrukkelijke toestemming voor het voorstellen aan een specifieke opdrachtgever.",
          },
        ],
      },
      {
        type: "ul",
        items: [
          "Leveranciers en IT-dienstverleners (waaronder de hosting- en databaseleverancier van het vacatureplatform)",
          "Assessmentbureaus",
          "Overheidsinstanties (indien wettelijk verplicht)",
        ],
      },
      {
        type: "p",
        body: "Wij zorgen ervoor dat alle derden passende beveiligingsmaatregelen treffen en sluiten waar nodig verwerkersovereenkomsten.",
      },
    ],
  },
  {
    number: 8,
    title: "Bewaartermijnen",
    blocks: [
      {
        type: "p",
        body: "Wij bewaren uw persoonsgegevens niet langer dan noodzakelijk voor de doelen waarvoor ze zijn verzameld:",
      },
      {
        type: "ul-labeled",
        items: [
          {
            label: "Sollicitanten via het vacatureplatform (afgewezen of procedure beëindigd):",
            body: "maximaal 4 weken na afronding van de sollicitatieprocedure, tenzij u uitdrukkelijk toestemming geeft voor langere bewaring.",
          },
          {
            label: "Talentpool (met toestemming):",
            body: "maximaal 2 jaar na uw laatste actieve contactmoment, met de mogelijkheid tot verlenging wanneer u uw inschrijving opnieuw bevestigt. U kunt uw toestemming op elk moment intrekken.",
          },
          {
            label: "Kandidaten in werving- en selectietrajecten:",
            body: "maximaal 2 jaar na het laatste contact, tenzij toestemming voor langere bewaring is verkregen.",
          },
          {
            label: "Werknemers/ZZP'ers:",
            body: "tot 2 jaar na einde samenwerking, langer indien wettelijk vereist (bijv. fiscale bewaarplicht).",
          },
          {
            label: "Werkgeveraccounts op het vacatureplatform:",
            body: "zolang het account actief is; na opzegging maximaal 2 jaar voor administratieve doeleinden.",
          },
          {
            label: "Websitegegevens en loggegevens:",
            body: "maximaal 6 tot 12 maanden.",
          },
        ],
      },
      {
        type: "p",
        body: "Na afloop van de bewaartermijn worden gegevens verwijderd of geanonimiseerd.",
      },
    ],
  },
  {
    number: 9,
    title: "Beveiliging van de database",
    blocks: [
      {
        type: "p",
        body: "Sollicitaties die via het vacatureplatform binnenkomen, worden opgeslagen in onze eigen beveiligde database. Legal Talents neemt passende technische en organisatorische maatregelen, waaronder:",
      },
      {
        type: "ul",
        items: [
          "Versleuteling van gegevens tijdens transport (TLS) en waar passend in rust",
          "Strikte toegangsbeperking op basis van 'need to know'",
          "Rolgebaseerde autorisatie binnen het vacatureplatform (werkgevers zien uitsluitend sollicitaties op hun eigen vacatures)",
          "Beveiligde, binnen de EU gehoste servers",
          "Logging, monitoring en periodieke interne controles en audits",
          "Procedures voor incident- en datalekafhandeling",
        ],
      },
    ],
  },
  {
    number: 10,
    title: "Uw rechten",
    blocks: [
      { type: "p", body: "U heeft onder de AVG de volgende rechten:" },
      {
        type: "ul",
        items: [
          "Recht op inzage",
          "Recht op rectificatie",
          'Recht op verwijdering ("recht op vergetelheid")',
          "Recht op beperking van verwerking",
          "Recht op dataportabiliteit",
          "Recht van bezwaar",
          "Recht om toestemming in te trekken",
        ],
      },
      {
        type: "p",
        body: "Voor sollicitaties via het vacatureplatform waarbij de werkgever verwerkingsverantwoordelijke is, kunt u deze rechten rechtstreeks bij de betreffende werkgever uitoefenen. Legal Talents zal u op verzoek behulpzaam zijn bij het leggen van dit contact. Voor alle overige verwerkingen kunt u uw rechten uitoefenen door contact met ons op te nemen via de gegevens in artikel 17.",
      },
    ],
  },
  {
    number: 11,
    title: "Geautomatiseerde besluitvorming",
    blocks: [
      {
        type: "p",
        body: "Legal Talents maakt geen gebruik van volledig geautomatiseerde besluitvorming met rechtsgevolgen voor betrokkenen. Eventuele matching- of sorteerfunctionaliteiten binnen het vacatureplatform zijn uitsluitend ondersteunend en resulteren niet in geautomatiseerde beslissingen over uw sollicitatie.",
      },
    ],
  },
  {
    number: 12,
    title: "Marketing en communicatie",
    blocks: [
      {
        type: "p",
        body: "U ontvangt alleen marketingcommunicatie als u hiervoor toestemming heeft gegeven. U kunt zich op elk moment afmelden via:",
      },
      {
        type: "ul",
        items: ["De afmeldlink in e-mails", "Contact met ons"],
      },
    ],
  },
  {
    number: 13,
    title: "Cookies en technologie",
    blocks: [
      {
        type: "p",
        body: "Onze website en het vacatureplatform maken gebruik van cookies om:",
      },
      {
        type: "ul",
        items: [
          "De website en het platform goed te laten functioneren (functionele cookies)",
          "Gebruik te analyseren",
          "De gebruikerservaring te verbeteren",
        ],
      },
      {
        type: "p",
        body: "U kunt cookies beheren via uw browserinstellingen en via de cookiebanner op onze website.",
      },
    ],
  },
  {
    number: 14,
    title: "Internationale doorgifte",
    blocks: [
      {
        type: "p",
        body: "Persoonsgegevens worden in beginsel binnen de EER verwerkt. Indien persoonsgegevens buiten de EER worden verwerkt (bijvoorbeeld door bepaalde IT-dienstverleners), zorgen wij voor passende waarborgen zoals standaardcontractbepalingen van de Europese Commissie.",
      },
    ],
  },
  {
    number: 15,
    title: "Datalekken",
    blocks: [
      {
        type: "p",
        body: "Bij een (vermoeden van een) datalek verzoeken wij u dit direct te melden via het in artikel 17 genoemde e-mailadres. Legal Talents beoordeelt ieder incident en doet, indien vereist, binnen 72 uur melding bij de Autoriteit Persoonsgegevens en, waar nodig, bij de betrokken personen.",
      },
    ],
  },
  {
    number: 16,
    title: "Wijzigingen",
    blocks: [
      {
        type: "p",
        body: "Legal Talents kan dit privacybeleid wijzigen. De meest actuele versie is altijd beschikbaar op onze website en binnen het vacatureplatform. Bij ingrijpende wijzigingen worden gebruikers actief geïnformeerd.",
      },
    ],
  },
  {
    number: 17,
    title: "Contact",
    blocks: [
      {
        type: "p",
        body: "Voor vragen, verzoeken of klachten kunt u contact opnemen met Legal Talents VOF, Sint Annastraat 198c, 6525 GX Nijmegen, via storm@legal-talents.nl.",
      },
      {
        type: "p",
        body: "U heeft daarnaast het recht een klacht in te dienen bij de Autoriteit Persoonsgegevens (www.autoriteitpersoonsgegevens.nl).",
      },
    ],
  },
  {
    number: 18,
    title: "Privacy van derden",
    blocks: [
      {
        type: "p",
        body: "Onze website en het vacatureplatform kunnen links bevatten naar externe websites, waaronder websites van werkgevers die vacatures plaatsen. Wij zijn niet verantwoordelijk voor het privacybeleid van deze derden. Wij adviseren u het privacybeleid van de betreffende werkgever te raadplegen wanneer u met hen in contact treedt.",
      },
    ],
  },
];

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p>{block.body}</p>;
    case "h3":
      return <h3>{block.body}</h3>;
    case "ul":
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    case "ul-labeled":
      return (
        <ul>
          {block.items.map((item, i) => (
            <li key={i}>
              <strong>{item.label}</strong> {item.body}
            </li>
          ))}
        </ul>
      );
  }
}

export default function PrivacyPage() {
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
              Privacybeleid
            </h1>
            <p className="mt-3 text-sm text-slate-500 italic">
              Versie april 2026
            </p>
          </header>

          <article
            className="prose prose-slate max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-900
              prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-[22px] md:prose-h2:text-2xl
              prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-lg
              prose-p:text-slate-700 prose-p:leading-relaxed
              prose-li:text-slate-700 prose-li:leading-relaxed
              prose-strong:text-slate-900 prose-strong:font-semibold
              prose-a:text-[#587DFE] hover:prose-a:text-[#4B3BD6] prose-a:no-underline hover:prose-a:underline"
          >
            {INTRO.blocks.map((block, i) => (
              <RenderBlock key={`intro-${i}`} block={block} />
            ))}

            {SECTIONS.map((section) => (
              <section key={section.number} className="scroll-mt-24">
                <h2 id={`artikel-${section.number}`}>
                  {section.number}. {section.title}
                </h2>
                {section.blocks.map((block, i) => (
                  <RenderBlock key={i} block={block} />
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
              Vragen over dit privacybeleid?{" "}
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
