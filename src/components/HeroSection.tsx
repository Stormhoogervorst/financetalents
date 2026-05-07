import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        background: "#EBEBEB",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[18vw] top-[12vh] hidden h-[56vw] max-h-[760px] min-h-[420px] w-[56vw] min-w-[420px] max-w-[760px] opacity-[0.08] md:block"
      >
        <Image
          src="/icon FT.png"
          alt=""
          fill
          className="object-contain"
          sizes="56vw"
          priority
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[18vw] bottom-[-28vw] h-[44vw] max-h-[560px] min-h-[280px] w-[44vw] min-w-[280px] max-w-[560px] rounded-full border border-[#222222]/10"
      />

      <div className="relative mx-auto max-w-[1600px] px-6 pb-16 pt-[calc(4.25rem+1.5rem)] md:px-[clamp(24px,5vw,80px)] md:pb-[clamp(72px,12vh,150px)] md:pt-[calc(4.25rem+clamp(44px,8vh,110px))] lg:pb-[clamp(56px,8vh,96px)]">
        <div className="grid grid-cols-1 content-start gap-12 md:min-h-[calc(100vh-4.25rem)] md:gap-20 lg:min-h-[calc(84vh-4.25rem-clamp(44px,8vh,110px)-clamp(56px,8vh,96px))]">
          <div>
            <p
              className="ft-display text-[15px] font-normal tracking-[-0.02em] text-[#222222]/70 md:text-[18px]"
            >
              Elite finance jobs. One platform.
            </p>
            <h1
              className="ft-display mt-8 max-w-[14ch] text-[clamp(56px,10vw,150px)] font-extrabold leading-[0.84] tracking-[-0.08em] text-[#222222]"
            >
              Finance without the noise.
            </h1>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:mt-0 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-5 lg:col-start-8">
              <p className="max-w-[560px] text-[clamp(18px,2vw,28px)] leading-[1.15] tracking-[-0.03em] text-[#222222]">
                A curated platform for Private Equity, Venture Capital,
                Investment Banking and FinTech roles.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="btn-primary">
                  Create profile
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link href="/companies" className="btn-secondary">
                  Browse companies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
