import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Kennisbank voor Juridisch Talent",
  description:
    "Lees blogs en artikelen over carrière in de advocatuur, juridische stages en het werkleven bij werkgevers. Geschreven door topwerkgevers in Nederland.",
  alternates: {
    canonical: "/kennisbank",
  },
};

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  image_url: string | null;
  created_at: string;
  firms: {
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <article
      className="group flex flex-col h-full rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(88,125,254,0.12)]"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
        backgroundColor: "#F5F7FF",
      }}
    >
      <div className="relative w-full aspect-video overflow-hidden bg-[#F5F7FF]">
        {blog.image_url ? (
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            className="absolute inset-0 w-full h-full object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#E2E9FF] to-[#F5F7FF]" />
        )}
      </div>

      <div className="flex flex-col flex-1 justify-between p-6">
        <div>
          <h2
            className="font-semibold leading-[1.3] tracking-[-0.01em] line-clamp-2 group-hover:text-[#587DFE] transition-colors duration-200"
            style={{
              fontSize: "clamp(17px, 1.3vw, 20px)",
              color: "#2C337A",
            }}
          >
            {blog.title}
          </h2>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {blog.firms && (
              <p className="text-[13px] font-medium text-[#5A6094] truncate">
                {blog.firms.name}
              </p>
            )}
            <p className="text-[12px] text-[#8B91B8] mt-0.5">
              {formatDate(blog.created_at)}
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-[13px] font-medium text-[#587DFE] group-hover:gap-2 transition-all duration-200">
            Lees meer
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}

export default async function KennisbankPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select(
      `
      id, title, slug, category, content, image_url, created_at,
      firms ( name, slug, logo_url )
    `
    )
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const blogs = ((data ?? []) as unknown as Blog[]).map((b) => ({
    ...b,
    firms: Array.isArray(b.firms) ? b.firms[0] ?? null : b.firms,
  }));

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <NavbarPublic variant="hero" />

      {/* Hero — vivid mesh gradient matching the homepage, fading seamlessly to white */}
      <div className="-mt-[4.25rem]">
        <section
          className="relative isolate overflow-hidden"
          style={{
            background: `linear-gradient(135deg,
              #4B3BD6 0%,
              #5668E8 22%,
              #7A8BF5 42%,
              #A8B6FF 62%,
              #C9D4FF 82%,
              #FFFFFF 100%)`,
          }}
        >
          {/* Layered radial gradients — soft "liquid" purple → blue → light-blue wash */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(60% 55% at 50% 40%,
                  rgba(178, 140, 255, 0.65) 0%,
                  rgba(140, 120, 255, 0.30) 35%,
                  rgba(120, 150, 255, 0) 70%),
                radial-gradient(50% 60% at 50% 60%,
                  rgba(255, 255, 255, 0.45) 0%,
                  rgba(255, 255, 255, 0) 60%),
                radial-gradient(55% 70% at 96% 6%,
                  rgba(42, 20, 230, 0.80) 0%,
                  rgba(59, 44, 220, 0.35) 22%,
                  rgba(88, 125, 254, 0) 60%),
                radial-gradient(32% 38% at 2% 0%,
                  rgba(215, 168, 255, 0.85) 0%,
                  rgba(215, 168, 255, 0) 65%),
                radial-gradient(38% 45% at 10% 55%,
                  rgba(255, 255, 255, 0.55) 0%,
                  rgba(255, 255, 255, 0) 65%)
              `,
            }}
          />

          {/* Seamless fade to pure white at the bottom */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-56"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 55%, #FFFFFF 100%)",
            }}
          />

          <div
            className="max-w-[1400px] mx-auto relative pb-[clamp(40px,5vh,70px)] md:pb-[clamp(80px,10vh,140px)]"
            style={{
              paddingTop: "calc(4.25rem + clamp(60px, 8vh, 120px))",
              paddingLeft: "clamp(24px, 5vw, 80px)",
              paddingRight: "clamp(24px, 5vw, 80px)",
            }}
          >
            <span
              className="inline-flex items-center gap-2 rounded-full backdrop-blur-[6px]"
              style={{
                padding: "7px 16px",
                fontSize: "13px",
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: "#FFFFFF",
                background: "rgba(255, 255, 255, 0.18)",
                border: "1px solid rgba(255, 255, 255, 0.28)",
              }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white" />
              Kennisbank
            </span>

            <h1
              className="font-bold tracking-[-0.03em] leading-[1.05] mt-6"
              style={{
                fontSize: "clamp(48px, 6vw, 80px)",
                color: "#FFFFFF",
                textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
              }}
            >
              Inzichten uit de praktijk
            </h1>

            <p
              className="mt-6 leading-relaxed max-w-[640px]"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#FFFFFF",
                opacity: 0.95,
                textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)",
              }}
            >
              Artikelen en verhalen over carrière in de advocatuur, juridische
              stages en het werkleven bij werkgevers — geschreven door
              topwerkgevers in Nederland.
            </p>
          </div>
        </section>
      </div>

      {/* Blog grid — tighter gap under hero fade on mobile; md+ keeps previous rhythm */}
      <section
        className="pt-8 md:pt-16"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-6">
            <p
              className="text-[13px] font-medium tracking-wide"
              style={{ color: "#999999" }}
            >
              {blogs.length === 0
                ? "Nog geen artikelen"
                : `${blogs.length} artikel${blogs.length !== 1 ? "en" : ""}`}
            </p>
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/kennisbank/${blog.slug}`}
                  className="block h-full"
                >
                  <BlogCard blog={blog} />
                </Link>
              ))}
            </div>
          ) : (
            <p
              className="text-[#6B6B6B] leading-[1.65] max-w-[640px]"
              style={{ fontSize: "clamp(15px, 1.1vw, 17px)" }}
            >
              Binnenkort verschijnen hier blogs en artikelen van topwerkgevers
              in Nederland.
            </p>
          )}
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
