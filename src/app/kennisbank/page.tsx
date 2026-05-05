import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Read articles and guides on careers in finance — from breaking into PE and VC to navigating IB interviews. Written by top finance firms.",
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

const categoryLabels: Record<string, string> = {
  carriere: "Career",
  finance: "Finance",
  kantoorleven: "Life at the firm",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function excerptFromHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 130);
}

function BlogCard({ blog }: { blog: Blog }) {
  const category = categoryLabels[blog.category] ?? blog.category;
  const excerpt = excerptFromHtml(blog.content);

  return (
    <article className="relative flex h-full min-h-[340px] flex-col border border-[#222222] bg-white p-5 transition-colors duration-200 group-hover:bg-[#0A0A0A]">
      <div className="flex items-start justify-between gap-4">
        <span className="max-w-[12rem] text-[12px] font-medium leading-[1.25] text-[#222222]/60 transition-colors duration-200 group-hover:text-white/55">
          {category}
        </span>
        <time
          dateTime={blog.created_at}
          className="shrink-0 text-[11px] font-medium text-[#222222]/50 transition-colors duration-200 group-hover:text-white/50"
        >
          {formatDate(blog.created_at)}
        </time>
      </div>

      {blog.image_url && (
        <div className="relative mt-8 aspect-[5/3] overflow-hidden border border-[#222222]/15 transition-colors duration-200 group-hover:border-white/15">
          <Image
            src={blog.image_url}
            alt={blog.title}
            fill
            className="object-cover grayscale transition duration-200 group-hover:grayscale-0"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 20vw"
          />
        </div>
      )}

      <div className="mt-auto pt-10">
        <h2 className="ft-display text-[clamp(24px,2vw,34px)] font-bold leading-[0.98] tracking-[-0.055em] text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]">
          {blog.title}
        </h2>

        {excerpt && (
          <p className="mt-4 line-clamp-3 text-[14px] leading-[1.55] text-[#222222]/60 transition-colors duration-200 group-hover:text-white/60">
            {excerpt}
            {blog.content.length > excerpt.length ? "..." : ""}
          </p>
        )}

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-[#222222]/15 pt-4 transition-colors duration-200 group-hover:border-white/15">
          <p className="min-w-0 truncate text-[13px] font-medium text-[#222222]/55 transition-colors duration-200 group-hover:text-white/55">
            {blog.firms?.name ?? "Finance Talents"}
          </p>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]" />
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
    <div className="relative min-h-screen flex flex-col bg-[#EBEBEB] text-[#222222]">
      <NavbarPublic variant="hero" />

      <div className="relative isolate overflow-hidden">
        <div className="-mt-[4.25rem]">
          <section className="relative isolate overflow-visible bg-[#EBEBEB]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-[22vw] top-[10vh] h-[58vw] max-h-[760px] min-h-[340px] w-[58vw] min-w-[340px] max-w-[760px] overflow-hidden rounded-full border border-[#222222]/10"
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
              className="pointer-events-none absolute bottom-[-18vw] left-[clamp(24px,5vw,80px)] h-[42vw] max-h-[560px] min-h-[260px] w-[42vw] min-w-[260px] max-w-[560px] overflow-hidden rounded-full bg-white"
            >
              <Image
                src="/icon FT.png"
                alt=""
                fill
                className="object-contain opacity-[0.12]"
                sizes="46vw"
              />
            </div>

            <div
              className="max-w-[1600px] mx-auto relative"
              style={{
                padding:
                  "calc(4.25rem + clamp(48px, 8vh, 110px)) clamp(24px, 5vw, 80px) clamp(48px, 8vh, 110px)",
              }}
            >
              <div className="grid min-h-[calc(72vh-4.25rem)] grid-cols-1 content-between gap-12">
                <div>
                  <p className="ft-display text-[15px] font-normal tracking-[-0.02em] text-[#222222]/70 md:text-[18px]">
                    Elite finance jobs. One platform.
                  </p>
                  <h1 className="ft-display mt-8 max-w-[12ch] text-[clamp(64px,14vw,220px)] font-extrabold leading-[0.82] tracking-[-0.08em] text-[#222222]">
                    Insights.
                  </h1>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
                  <div className="lg:col-span-5 lg:col-start-8">
                    <p className="max-w-[560px] text-[clamp(18px,2vw,28px)] leading-[1.15] tracking-[-0.03em] text-[#222222]">
                      Clear thinking on finance careers, interviews and life inside
                      ambitious firms.
                    </p>
                    <p className="mt-5 max-w-[460px] text-[15px] leading-[1.65] text-[#222222]/60">
                      Read practical guides from the industry, then move from
                      research to opportunity when the fit is clear.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section
          className="relative"
          style={{
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
            paddingTop: "clamp(70px, 9vh, 140px)",
            paddingBottom: "clamp(80px, 10vh, 150px)",
          }}
        >
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-10 grid grid-cols-1 gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
              <h2 className="ft-display lg:col-span-8 text-[clamp(54px,9vw,132px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                Latest articles.
              </h2>
              <div className="lg:col-span-4">
                <p className="max-w-[390px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                  {blogs.length === 0
                    ? "No articles published yet."
                    : `Showing ${blogs.length} published article${
                        blogs.length !== 1 ? "s" : ""
                      }.`}
                </p>
              </div>
            </div>

            {blogs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/kennisbank/${blog.slug}`}
                    className="group block h-full"
                  >
                    <BlogCard blog={blog} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 border border-[#222222] bg-white lg:grid-cols-12">
                <div className="p-6 md:p-8 lg:col-span-7">
                  <h2 className="ft-display max-w-[720px] text-[clamp(42px,7vw,104px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                    Coming soon.
                  </h2>
                </div>
                <div className="border-t border-[#222222] p-6 md:p-8 lg:col-span-5 lg:border-l lg:border-t-0">
                  <p className="max-w-[460px] text-[16px] leading-[1.65] text-[#222222]/65">
                    New finance career guides and articles from top employers will
                    appear here soon.
                  </p>
                  <Link href="/register" className="btn-primary mt-8">
                    Create profile
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <CtaBand />

      <Footer />
    </div>
  );
}
