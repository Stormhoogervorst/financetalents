import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Clock3,
  Mail,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

const SITE_NAME = "Finance Talents";

const STATS = [
  { value: "Finance-only", label: "candidate intent" },
  { value: "PE, VC, IB", label: "core sectors" },
  { value: "Live fast", label: "simple publishing flow" },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Curated candidates",
    body: "Reach professionals and students with a clear finance focus, not a generic job-board audience.",
  },
  {
    icon: Target,
    title: "Built for PE, VC, IB and FinTech",
    body: "Your vacancy sits in the context candidates already search by: sector, city, role type and company profile.",
  },
  {
    icon: Mail,
    title: "Direct applications",
    body: "No middlemen. Applications arrive in your dashboard and inbox so your team can move quickly.",
  },
  {
    icon: Clock3,
    title: "Fast publishing",
    body: "Create a profile, add the role and go live without a long onboarding flow.",
  },
];

const LOGOS = [
  "Private Equity",
  "Venture Capital",
  "Investment Banking",
  "FinTech",
];

const STEPS = [
  {
    number: "01",
    title: "Post your vacancy",
    body: "Create a company profile and publish your finance role or internship.",
  },
  {
    number: "02",
    title: "We surface it to the right audience",
    body: "Your listing reaches candidates searching for PE, VC, Investment Banking and FinTech roles.",
  },
  {
    number: "03",
    title: "Review direct applications",
    body: "Candidates apply directly to your firm. Manage responses from the dashboard and inbox.",
  },
  {
    number: "04",
    title: "Hire without the noise",
    body: "Keep the process lean: fewer irrelevant CVs, more candidates who understand the finance market.",
  },
];

const FAQS = [
  {
    question: "What can employers post on Finance Talents?",
    answer:
      "Employers can post finance jobs, internships, graduate roles and specialist positions across Private Equity, Venture Capital, Investment Banking and FinTech.",
  },
  {
    question: "How does pricing work?",
    answer:
      "Creating an employer account and posting jobs is free. You can publish vacancies and internships from your dashboard without an upfront package or credit card.",
  },
  {
    question: "Do candidates apply directly to us?",
    answer:
      "Yes. Finance Talents is built for direct employer contact. Applications are sent to your dashboard and notification inbox.",
  },
  {
    question: "Can we post internships as well as full-time roles?",
    answer:
      "Yes. You can publish internships, analyst roles, associate roles and other finance opportunities from the same employer account.",
  },
  {
    question: "Can Finance Talents integrate with our ATS?",
    answer:
      "Finance Talents currently focuses on a simple dashboard and direct email notifications, so employers can start quickly without a complex ATS setup.",
  },
  {
    question: "How fast can a vacancy go live?",
    answer:
      "Most roles can be published within minutes once your employer account and company profile are ready.",
  },
  {
    question: "How do you keep candidate quality high?",
    answer:
      "The platform is positioned specifically around finance careers, so candidates arrive with sector intent. Clear filters, sector pages and company profiles help applicants understand whether the role fits before they apply.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const serviceJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Finance Talents employer hiring platform",
  provider: {
    "@type": "Organization",
    name: SITE_NAME,
  },
  serviceType: "Finance recruitment advertising platform",
  areaServed: "Europe",
  description:
    "Vacancy and internship posting platform for employers hiring finance professionals in PE, VC, Investment Banking and FinTech.",
  offers: {
    "@type": "Offer",
    name: "Free employer account and job posting",
    description:
      "Create an employer account and publish finance jobs and internships for free.",
    priceSpecification: {
      "@type": "PriceSpecification",
      priceCurrency: "EUR",
      price: "0",
    },
    url: `${SITE_URL}/for-employers`,
  },
};

export const metadata: Metadata = {
  title: "Post finance jobs and internships",
  description:
    "Post finance jobs and internships for PE, VC, Investment Banking and FinTech talent. Reach candidates through Finance Talents.",
  alternates: {
    canonical: "/for-employers",
  },
  openGraph: {
    title: "Post finance jobs and internships | Finance Talents",
    description:
      "Reach finance professionals and post jobs, internships and specialist roles through Finance Talents.",
    url: "/for-employers",
    siteName: SITE_NAME,
    images: [
      {
        url: "/logo FT.png",
        width: 1200,
        height: 630,
        alt: "Finance Talents employer hiring platform",
      },
    ],
  },
};

export default function VoorCompaniesPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-[#EBEBEB] text-[#222222]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <NavbarPublic variant="hero" />

      <div className="-mt-[4.25rem]">
        <section className="relative isolate overflow-hidden bg-[#EBEBEB]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[22vw] top-[9vh] h-[58vw] max-h-[760px] min-h-[340px] w-[58vw] min-w-[340px] max-w-[760px] overflow-hidden rounded-full border border-[#222222]/10"
          >
            <Image
              src="/icon FT.png"
              alt=""
              fill
              className="object-contain opacity-[0.16]"
              sizes="58vw"
              priority
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-[18vw] bottom-[-28vw] h-[44vw] max-h-[560px] min-h-[280px] w-[44vw] min-w-[280px] max-w-[560px] rounded-full border border-[#222222]/10"
          />

          <div
            className="relative mx-auto max-w-[1600px]"
            style={{
              padding:
                "calc(4.25rem + clamp(48px, 8vh, 110px)) clamp(24px, 5vw, 80px) clamp(56px, 9vh, 130px)",
            }}
          >
            <div className="grid min-h-[calc(78vh-4.25rem)] grid-cols-1 content-between gap-12">
              <div>
                <p className="ft-display text-[15px] font-normal tracking-[-0.02em] text-[#222222]/70 md:text-[18px]">
                  For employers. Built for finance hiring.
                </p>
                <h1 className="ft-display mt-8 max-w-[12ch] text-[clamp(56px,10vw,154px)] font-extrabold leading-[0.84] tracking-[-0.08em] text-[#222222]">
                  Finance professionals. Quality over quantity.
                </h1>
              </div>

              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-5 lg:col-start-8">
                  <p className="max-w-[600px] text-[clamp(18px,2vw,28px)] leading-[1.15] tracking-[-0.03em] text-[#222222]">
                    Reach PE, VC, Investment Banking and FinTech professionals
                    through a platform built exclusively for finance careers.
                  </p>
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link href="/register" className="btn-primary">
                      Post a job
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="btn-secondary"
                    >
                      How it works
                    </Link>
                  </div>
                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {STATS.map((stat) => (
                      <div key={stat.label} className="border border-[#222222] bg-white p-4">
                        <p className="ft-display text-[24px] font-extrabold leading-none tracking-[-0.055em] text-[#222222]">
                          {stat.value}
                        </p>
                        <p className="mt-2 text-[12px] leading-[1.35] text-[#222222]/60">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 grid grid-cols-1 gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
            <h2 className="ft-display lg:col-span-8 text-[clamp(54px,9vw,132px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
              Hiring signal, not noise.
            </h2>
            <div className="lg:col-span-4">
              <p className="max-w-[420px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                Finance Talents helps employers reach a niche candidate audience
                without turning hiring into a generic CV funnel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="min-h-[280px] border border-[#222222] bg-white p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center border border-[#222222] bg-[#EBEBEB] text-[#E85A00]">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="ft-display mt-10 text-[clamp(24px,2.4vw,34px)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#222222]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.65] text-[#222222]/62">
                    {feature.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="bg-white"
        style={{
          padding: "clamp(70px, 9vh, 130px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 border border-[#222222] bg-[#EBEBEB] lg:grid-cols-12">
            <div className="p-6 md:p-8 lg:col-span-5">
              <h2 className="ft-display text-[clamp(42px,7vw,104px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                Trusted by finance teams.
              </h2>
            </div>
            <div className="border-t border-[#222222] p-6 md:p-8 lg:col-span-7 lg:border-l lg:border-t-0">
              <p className="max-w-[660px] text-[clamp(22px,2.4vw,36px)] font-semibold leading-[1.15] tracking-[-0.04em] text-[#222222]">
                "Reach candidates who already understand the market before
                they open your vacancy."
              </p>
              <p className="mt-5 text-[15px] leading-[1.65] text-[#222222]/60">
                Purpose-built visibility for finance hiring teams
              </p>
              <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
                {LOGOS.map((logo) => (
                  <div
                    key={logo}
                    className="flex min-h-[88px] items-center justify-center border border-[#222222] bg-white p-4 text-center text-[13px] font-semibold leading-[1.25] tracking-[-0.01em] text-[#222222]/60"
                  >
                    {logo}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 bg-white"
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-[720px]">
            <h2 className="ft-display text-[clamp(54px,9vw,132px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
              How it works
            </h2>
            <p className="mt-5 text-[16px] leading-[1.65] text-[#222222]/62">
              From first vacancy to direct candidate conversations in four
              focused steps.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="border border-[#222222] p-6"
              >
                <span className="ft-display text-[clamp(56px,7vw,104px)] font-extrabold leading-none tracking-[-0.03em] text-[#E85A00]">
                  {step.number}
                </span>
                <h3 className="ft-display mt-5 text-[clamp(24px,2.4vw,34px)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#222222]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[15px] leading-[1.65] text-[#222222]/62">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="mx-auto max-w-[880px]">
          <h2 className="ft-display text-[clamp(54px,9vw,120px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
            Employer FAQ
          </h2>

          <div className="mt-10 flex flex-col gap-3 md:mt-14">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group border border-[#222222] bg-white transition-colors duration-200 hover:bg-[#0A0A0A] open:bg-[#0A0A0A]"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 text-[clamp(16px,1.25vw,18px)] font-semibold leading-[1.4] tracking-[-0.01em] md:px-6">
                  <span className="text-[#222222] transition-colors duration-200 group-hover:text-white group-open:text-white">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 select-none text-[20px] font-normal leading-none text-[#E85A00] transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 text-[15px] leading-[1.65] text-white/70 md:px-6">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section
        className="bg-white"
        style={{
          padding: "clamp(70px, 9vh, 130px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                label: "See live jobs",
                href: "/jobs",
                icon: BriefcaseBusiness,
              },
              {
                label: "Browse companies",
                href: "/companies",
                icon: Users,
              },
              {
                label: "Read insights",
                href: "/insights",
                icon: ArrowUpRight,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-[116px] items-start justify-between border border-[#222222] bg-[#EBEBEB] p-5 transition-colors duration-200 hover:bg-[#0A0A0A]"
                >
                  <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#222222] transition-colors duration-200 group-hover:text-white">
                    {item.label}
                  </span>
                  <Icon className="h-5 w-5 text-[#E85A00]" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden bg-[#0A0A0A]"
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[18vw] top-1/2 -z-10 h-[58vw] max-h-[720px] min-h-[340px] w-[58vw] min-w-[340px] max-w-[720px] -translate-y-1/2 overflow-hidden rounded-full border border-white/15"
        >
          <Image
            src="/icon FT.png"
            alt=""
            fill
            className="object-contain opacity-[0.34]"
            sizes="58vw"
          />
        </div>

        <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <h2 className="ft-display lg:col-span-8 text-[clamp(54px,9vw,142px)] font-extrabold leading-[0.88] tracking-[-0.075em] text-white">
            Ready to hire finance talent?
          </h2>
          <div className="lg:col-span-4">
            <p className="max-w-[460px] text-[18px] leading-[1.45] tracking-[-0.02em] text-white/70">
              Create a free account and post your first finance job or
              internship directly from your dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#222222] transition-colors duration-200 hover:bg-[#E85A00] hover:text-white"
              >
                Post a job
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-white px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-white hover:text-[#222222]"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
