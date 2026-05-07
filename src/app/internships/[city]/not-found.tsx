import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";

export default function StageCityNotFound() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#EBEBEB] text-[#222222]">
      <NavbarPublic variant="hero" />

      <main
        className="-mt-[4.25rem] flex-1"
        style={{
          padding:
            "calc(4.25rem + clamp(72px, 12vh, 150px)) clamp(24px, 5vw, 80px) clamp(80px, 10vh, 150px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <p className="ft-display text-[15px] font-normal tracking-[-0.02em] text-[#222222]/70 md:text-[18px]">
            Stage city not found
          </p>
          <h1 className="ft-display mt-8 max-w-[12ch] text-[clamp(54px,10vw,150px)] font-extrabold leading-[0.84] tracking-[-0.08em] text-[#222222]">
            No internships found for this city.
          </h1>
          <p className="mt-8 max-w-[560px] text-[clamp(18px,2vw,28px)] leading-[1.15] tracking-[-0.03em] text-[#222222]">
            This city page does not exist yet. Browse all finance internships or
            choose one of the available city pages from the internships overview.
          </p>
          <div className="mt-10">
            <Link href="/internships" className="btn-primary">
              View all internships
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
