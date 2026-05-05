import Link from "next/link";
import Image from "next/image";

export default function CtaBand() {
  return (
    <section
      className="relative isolate overflow-hidden"
      style={{
        padding: "clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)",
        background: "#0A0A0A",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[22vw] top-1/2 h-[62vw] max-h-[760px] min-h-[360px] w-[62vw] min-w-[360px] max-w-[760px] -translate-y-1/2 opacity-20"
      >
        <Image
          src="/icon FT.png"
          alt=""
          fill
          className="object-contain"
          sizes="62vw"
        />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 gap-12 md:grid-cols-12 md:items-end">
        <h2
          className="ft-display md:col-span-8"
          style={{
            fontSize: "clamp(54px, 9vw, 148px)",
            fontWeight: 800,
            lineHeight: 0.88,
            letterSpacing: "-0.07em",
            color: "#FFFFFF",
          }}
        >
          Your next move starts here.
        </h2>
        <div className="md:col-span-4">
          <p className="max-w-[420px] text-[18px] leading-[1.45] tracking-[-0.02em] text-white/75">
            Browse curated openings in PE, VC, IB and FinTech, then apply
            directly to the firm.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-medium text-[#222222] transition-colors duration-200 hover:bg-[#E85A00] hover:text-white"
            >
              Post a job
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
