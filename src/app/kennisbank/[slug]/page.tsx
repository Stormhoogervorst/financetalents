import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL as BASE_URL } from "@/lib/site";

const categoryLabels: Record<string, string> = {
  carriere: "Carrière",
  juridisch: "Juridisch",
  kantoorleven: "Werkgeversleven",
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select("title, content, image_url, firms(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) return { title: "Artikel niet gevonden" };

  const firmName = Array.isArray(data.firms)
    ? data.firms[0]?.name
    : (data.firms as { name: string } | null)?.name;

  const plainDescription = data.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 160);

  return {
    title: `${data.title}${firmName ? ` — ${firmName}` : ""}`,
    description: plainDescription,
    alternates: {
      canonical: `/kennisbank/${slug}`,
    },
    openGraph: {
      title: data.title,
      description: plainDescription,
      ...(data.image_url ? { images: [{ url: data.image_url }] } : {}),
    },
  };
}

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
    description: string | null;
    location: string | null;
  } | null;
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select(
      `
      id, title, slug, category, content, image_url, created_at,
      firms ( name, slug, logo_url, description, location )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) notFound();

  const blog = {
    ...data,
    firms: Array.isArray(data.firms) ? data.firms[0] ?? null : data.firms,
  } as Blog;

  const firm = blog.firms;

  const plainContent = blog.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: plainContent.substring(0, 160),
    datePublished: blog.created_at,
    url: `${BASE_URL}/kennisbank/${blog.slug}`,
    ...(blog.image_url ? { image: blog.image_url } : {}),
    ...(firm
      ? {
          author: {
            "@type": "Organization",
            name: firm.name,
            ...(firm.logo_url ? { logo: firm.logo_url } : {}),
          },
          publisher: {
            "@type": "Organization",
            name: "Legal Talents",
            url: BASE_URL,
          },
        }
      : {}),
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <NavbarPublic variant="hero" />

      {/* Hero — vivid mesh gradient header for the article, fading to white */}
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
            className="max-w-[1400px] mx-auto relative"
            style={{
              padding:
                "calc(4.25rem + clamp(48px, 6vh, 96px)) clamp(24px, 5vw, 80px) clamp(72px, 9vh, 120px)",
            }}
          >
            <div
              className="text-white"
              style={{ textShadow: "0 1px 16px rgba(20, 24, 80, 0.25)" }}
            >
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Kennisbank", href: "/kennisbank" },
                  {
                    label: categoryLabels[blog.category] ?? blog.category,
                    href: `/kennisbank?categorie=${encodeURIComponent(blog.category)}`,
                  },
                  { label: blog.title, href: `/kennisbank/${blog.slug}` },
                ]}
              />
            </div>

            <div className="mt-8 mb-6 flex items-center gap-3">
              <span
                className="text-[13px] font-medium tracking-[0.02em] text-white/80"
                style={{ textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)" }}
              >
                {categoryLabels[blog.category] ?? blog.category}
              </span>
              <span className="text-white/40">·</span>
              <time
                className="text-[13px] font-medium text-white/80"
                style={{ textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)" }}
              >
                {new Date(blog.created_at).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </div>

            <h1
              className="font-bold leading-[1.05] max-w-[960px]"
              style={{
                fontSize: "clamp(36px, 5vw, 64px)",
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
              }}
            >
              {blog.title}
            </h1>

            {firm && (
              <div className="mt-8 flex items-center gap-3">
                {firm.logo_url && (
                  <div className="w-9 h-9 rounded-[10px] bg-white/15 backdrop-blur-[6px] border border-white/25 flex items-center justify-center overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={firm.logo_url}
                      alt={`${firm.name} logo`}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                )}
                <Link
                  href={`/werkgevers/${firm.slug}`}
                  className="text-[14px] font-medium text-white/90 hover:text-white transition-colors duration-200"
                  style={{ textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)" }}
                >
                  {firm.name}
                  {firm.location && (
                    <span className="text-white/65"> · {firm.location}</span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Featured image */}
      {blog.image_url && (
        <section
          style={{
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
            paddingTop: "clamp(16px, 2vh, 32px)",
          }}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="relative aspect-[21/9] w-full rounded-[16px] overflow-hidden bg-[#F5F5F5]">
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover saturate-[0.95]"
                sizes="(max-width: 768px) 100vw, 1400px"
                priority
              />
            </div>
          </div>
        </section>
      )}

      {/* Article body + sidebar */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(40px, 6vh, 80px)",
          paddingBottom: "clamp(80px, 10vh, 140px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12 lg:gap-20">
            {/* Main content */}
            <article>
              <div
                className="prose prose-lg max-w-[640px]
                  prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#0A0A0A]
                  prose-h2:text-[22px] prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-[1.2]
                  prose-h3:text-[18px] prose-h3:mt-10 prose-h3:mb-3 prose-h3:leading-[1.3]
                  prose-p:text-[#6B6B6B] prose-p:leading-[1.65] prose-p:text-[16px]
                  prose-a:text-[#587DFE] prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                  prose-li:text-[#6B6B6B] prose-li:text-[16px] prose-li:leading-[1.65]
                  prose-strong:text-[#0A0A0A] prose-strong:font-semibold
                  prose-blockquote:border-l-[#587DFE] prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:text-[#0A0A0A] prose-blockquote:font-semibold prose-blockquote:text-[20px] prose-blockquote:leading-[1.4] prose-blockquote:not-italic
                  prose-img:rounded-[12px]
                  prose-hr:border-[#E5E5E5]"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>

            {/* Sidebar */}
            {firm && (
              <aside className="lg:pt-2">
                <div className="lg:sticky lg:top-24">
                  <p className="text-[13px] font-medium tracking-[0.02em] uppercase text-[#999] mb-5">
                    Over de werkgever
                  </p>

                  <div
                    className="rounded-[16px] p-6"
                    style={{
                      backgroundImage:
                        "linear-gradient(135deg, rgba(88,125,254,0.10) 0%, rgba(88,125,254,0.04) 45%, rgba(255,255,255,0.85) 100%)",
                      backgroundColor: "#F5F7FF",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E2E5F0] flex items-center justify-center shrink-0 overflow-hidden">
                        {firm.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firm.logo_url}
                            alt={`${firm.name} logo`}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-[12px] font-bold text-[#587DFE]">
                            {firm.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-[#2C337A] truncate">
                          {firm.name}
                        </p>
                        {firm.location && (
                          <p className="text-[13px] text-[#8B91B8]">
                            {firm.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {firm.description && (
                      <p className="text-[14px] text-[#5A6094] leading-[1.65] mb-5 line-clamp-4">
                        {firm.description}
                      </p>
                    )}

                    <Link
                      href={`/werkgevers/${firm.slug}`}
                      className="btn-primary"
                    >
                      Werkgeversprofiel bekijken
                    </Link>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
