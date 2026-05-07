import type { Metadata } from "next";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Finance Talents processes personal data from candidates, employers and visitors of the finance job platform.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

type Section = {
  title: string;
  body: string[];
  items?: string[];
};

const SECTIONS: Section[] = [
  {
    title: "Who We Are",
    body: [
      "Finance Talents is a finance recruitment and job platform. We process personal data from candidates, applicants, employers, clients, website visitors and other business contacts in accordance with the General Data Protection Regulation (GDPR).",
      "Depending on the service, Finance Talents may act as an independent controller, a technical facilitator or a processor for employer-managed applications.",
    ],
  },
  {
    title: "When We Collect Data",
    body: ["We collect personal data when you:"],
    items: [
      "Apply for a job or internship through the platform",
      "Create an employer account or company profile",
      "Upload a CV, LinkedIn profile or supporting application information",
      "Contact us by email, phone or another channel",
      "Join a talent pool or are approached for recruitment purposes",
      "Visit or use the website and platform",
    ],
  },
  {
    title: "Data We Process",
    body: [
      "For candidates, we may process name, contact details, CV, education, work experience, motivation, LinkedIn profile, application history, preferences and communication history.",
      "For employers and business contacts, we may process name, role, business contact details, company information, account data, notification settings and platform activity.",
      "For website users, we may process technical information such as IP address, browser, device data and usage information.",
    ],
  },
  {
    title: "Why We Process Data",
    body: ["We process personal data for the following purposes:"],
    items: [
      "Handling and forwarding applications to the relevant employer",
      "Managing employer accounts, job listings and company profiles",
      "Recruitment, matching and talent-pool communication",
      "Security, fraud prevention and platform reliability",
      "Administration, contract management and legal compliance",
      "Improving the website, platform and services",
      "Marketing communication where permitted or consented to",
    ],
  },
  {
    title: "Legal Bases",
    body: [
      "We rely on consent, performance of a contract, legal obligations and legitimate interests, depending on the context. Legitimate interests include recruitment activity, secure platform operation and relevant business communication.",
    ],
  },
  {
    title: "Sharing Data",
    body: [
      "Application data is shared with the employer responsible for the relevant role. In recruitment assignments, candidate data is shared with clients only where appropriate and, when required, with the candidate's consent.",
      "We may use trusted processors for hosting, email, analytics, storage and operational tooling. These parties may process data only under appropriate safeguards.",
    ],
  },
  {
    title: "Retention",
    body: [
      "We keep personal data no longer than necessary for the purpose for which it was collected, unless a longer retention period is required by law or justified by a legitimate business need. Employers are responsible for their own retention of application data once received through the platform.",
    ],
  },
  {
    title: "Your Rights",
    body: ["Under the GDPR, you may have the right to:"],
    items: [
      "Access your personal data",
      "Correct inaccurate or incomplete data",
      "Request deletion or restriction of processing",
      "Object to processing based on legitimate interests",
      "Withdraw consent where processing is based on consent",
      "Request data portability where applicable",
      "Lodge a complaint with the Dutch Data Protection Authority",
    ],
  },
  {
    title: "Contact",
    body: [
      "For privacy questions or requests, contact Finance Talents at storm@finance-talents.com. We may ask for information to verify your identity before handling a request.",
    ],
  },
];

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
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Privacy
            </p>
            <h1 className="ft-display mt-3 text-[clamp(42px,7vw,84px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
              Privacy Policy
            </h1>
            <p className="mt-6 text-sm text-slate-500">Last updated: May 2026</p>
          </header>

          <section className="prose prose-slate max-w-none prose-p:leading-7 prose-li:leading-7">
            {SECTIONS.map((section, index) => (
              <section key={section.title} className={index === 0 ? undefined : "mt-10"}>
                <h2>{index + 1}. {section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.items ? (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
