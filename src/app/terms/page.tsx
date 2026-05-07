import type { Metadata } from "next";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions of Finance Talents for recruitment, search and use of the job platform.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

type Clause = {
  label?: string;
  body: string;
};

type Article = {
  number: number;
  title: string;
  clauses: Clause[];
};

const INTRO =
  'These Terms & Conditions apply to Finance Talents, a general partnership registered in Nijmegen, the Netherlands, with office address Sint Annastraat 198c, 6525 GX Nijmegen, registered with the Dutch Chamber of Commerce under number 98803093. These terms apply to offers, assignments, agreements, recruitment services and use of the Finance Talents job platform by employers, clients, candidates and other users. Any purchasing or other terms of a client or user are rejected unless Finance Talents has explicitly accepted them in writing.';

const ARTICLES: Article[] = [
  {
    number: 1,
    title: "Definitions And Services",
    clauses: [
      {
        label: "1.1. Recruitment & search:",
        body: "Finance Talents may support clients in identifying, selecting and introducing suitable finance professionals for employment, contracting or comparable forms of engagement. A recruitment assignment is successful when a candidate introduced by Finance Talents enters into an employment or engagement agreement with the client.",
      },
      {
        label: "1.2. Job platform:",
        body: "Finance Talents operates an online platform where employers can publish finance jobs and internships and candidates can apply directly. For platform applications, Finance Talents acts as a technical facilitator between employer and candidate unless a separate recruitment assignment has been agreed.",
      },
      {
        label: "1.3. Employer, client and candidate:",
        body: "An employer is an organisation using the platform to publish roles. A client is an employer that has also entered into a recruitment assignment with Finance Talents. A candidate is a person applying through the platform, joining a talent pool or being introduced as part of a recruitment process.",
      },
    ],
  },
  {
    number: 2,
    title: "Use Of The Job Platform",
    clauses: [
      {
        label: "2.1. Free posting:",
        body: "Employers can create an account and publish jobs or internships on the platform free of charge unless paid functionality has been expressly agreed in writing.",
      },
      {
        label: "2.2. Employer responsibility:",
        body: "The employer is responsible for the accuracy, legality and completeness of company information, job content, selection criteria and communication with candidates.",
      },
      {
        label: "2.3. Moderation:",
        body: "Finance Talents may refuse, amend or remove listings that are misleading, discriminatory, unlawful, inconsistent with the finance focus of the platform or harmful to Finance Talents' reputation.",
      },
      {
        label: "2.4. Applications:",
        body: "Applications submitted through the platform are stored securely and made available to the relevant employer. Employers must use application data only for assessing the relevant role and must handle candidate data in accordance with applicable privacy law.",
      },
    ],
  },
  {
    number: 3,
    title: "Recruitment Fees",
    clauses: [
      {
        label: "3.1. No cure, no pay:",
        body: "Recruitment assignments are performed on a no cure, no pay basis unless agreed otherwise. A fee is due only upon successful placement as defined in the relevant assignment confirmation.",
      },
      {
        label: "3.2. Fee calculation:",
        body: "The fee is calculated as a percentage of the candidate's full-time gross annual salary, including holiday allowance and agreed variable compensation, unless the assignment confirmation states otherwise. Amounts are exclusive of VAT.",
      },
      {
        label: "3.3. Direct or indirect hire:",
        body: "A fee may also be due if a candidate introduced by Finance Talents is hired directly, indirectly or through an affiliated entity within twelve months after introduction, unless an exception has been agreed in writing.",
      },
    ],
  },
  {
    number: 4,
    title: "Payment Terms",
    clauses: [
      {
        body: "Invoices are payable within 14 days of the invoice date. If payment is late, Finance Talents may suspend services and charge statutory commercial interest and reasonable collection costs.",
      },
    ],
  },
  {
    number: 5,
    title: "Confidentiality And Data",
    clauses: [
      {
        body: "Clients and employers may not share candidate data supplied through Finance Talents with third parties without prior written consent. If an application or introduction does not lead to an engagement, candidate data must be deleted, returned or otherwise handled in accordance with applicable privacy law.",
      },
    ],
  },
  {
    number: 6,
    title: "Liability",
    clauses: [
      {
        body: "Finance Talents performs services on a best-efforts basis. The final hiring decision, employment conditions, role content, reference checks and candidate assessment remain the responsibility of the client or employer. Liability is limited to the amount paid out under Finance Talents' liability insurance or, if no payout is made, to the fees paid to Finance Talents in the twelve months before the event causing the damage.",
      },
    ],
  },
  {
    number: 7,
    title: "Intellectual Property",
    clauses: [
      {
        body: "All intellectual property rights in the platform, software, design, text and database belong to Finance Talents or its licensors. Users may not copy, scrape, automate access to or commercially exploit the platform without prior written consent.",
      },
    ],
  },
  {
    number: 8,
    title: "Changes, Law And Jurisdiction",
    clauses: [
      {
        body: "Finance Talents may update these terms. Dutch law applies. Disputes are submitted to the competent court in Gelderland, the Netherlands, unless mandatory law provides otherwise.",
      },
    ],
  },
];

export default function TermsPage() {
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
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Legal
            </p>
            <h1 className="ft-display mt-3 text-[clamp(42px,7vw,84px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
              Terms & Conditions
            </h1>
            <p className="mt-6 text-sm text-slate-500">Last updated: May 2026</p>
          </header>

          <section className="prose prose-slate max-w-none prose-p:leading-7 prose-li:leading-7">
            <p>{INTRO}</p>
            {ARTICLES.map((article) => (
              <section key={article.number} className="mt-10">
                <h2>{article.number}. {article.title}</h2>
                {article.clauses.map((clause, index) => (
                  <p key={`${article.number}-${index}`}>
                    {clause.label ? <strong>{clause.label} </strong> : null}
                    {clause.body}
                  </p>
                ))}
              </section>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
