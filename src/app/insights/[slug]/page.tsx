import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import Breadcrumbs from "@/components/Breadcrumbs";
import { SITE_URL as BASE_URL } from "@/lib/site";

const categoryLabels: Record<string, string> = {
  carriere: "Career",
  finance: "Finance",
  kantoorleven: "Life at the firm",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
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

function RelatedArticleCard({ blog }: { blog: Blog }) {
  const category = categoryLabels[blog.category] ?? blog.category;
  const excerpt = excerptFromHtml(blog.content);

  return (
    <Link href={`/insights/${blog.slug}`} className="group block h-full">
      <article className="flex h-full min-h-[320px] flex-col border border-[#222222] bg-white p-5 transition-colors duration-200 group-hover:bg-[#0A0A0A]">
        <div className="flex items-start justify-between gap-4">
          <span className="max-w-[12rem] text-[12px] font-medium leading-[1.25] text-[#222222]/60 transition-colors duration-200 group-hover:text-white/55">
            {category}
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]" />
        </div>

        {blog.image_url && (
          <div className="relative mt-8 aspect-[5/3] overflow-hidden border border-[#222222]/15 transition-colors duration-200 group-hover:border-white/15">
            <Image
              src={blog.image_url}
              alt={blog.title}
              fill
              className="object-cover grayscale transition duration-200 group-hover:grayscale-0"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}

        <div className="mt-auto pt-10">
          <time
            dateTime={blog.created_at}
            className="text-[12px] font-medium text-[#222222]/50 transition-colors duration-200 group-hover:text-white/50"
          >
            {formatDate(blog.created_at)}
          </time>
          <h3 className="ft-display mt-4 text-[clamp(26px,2.4vw,38px)] font-extrabold leading-[0.95] tracking-[-0.06em] text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]">
            {blog.title}
          </h3>
          {excerpt && (
            <p className="mt-5 line-clamp-3 text-[14px] leading-[1.55] text-[#222222]/60 transition-colors duration-200 group-hover:text-white/60">
              {excerpt}
              {blog.content.length > excerpt.length ? "..." : ""}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}

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

  if (!data) return { title: "Article not found" };

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
      canonical: `/insights/${slug}`,
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

  const { data: relatedData } = await supabase
    .from("blogs")
    .select(
      `
      id, title, slug, category, content, image_url, created_at,
      firms ( name, slug, logo_url, description, location )
    `
    )
    .eq("status", "published")
    .eq("category", blog.category)
    .neq("id", blog.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const relatedBlogs = ((relatedData ?? []) as unknown as Blog[]).map((b) => ({
    ...b,
    firms: Array.isArray(b.firms) ? b.firms[0] ?? null : b.firms,
  }));

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
    url: `${BASE_URL}/insights/${blog.slug}`,
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
            name: "Finance Talents",
            url: BASE_URL,
          },
        }
      : {}),
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#EBEBEB] text-[#222222]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <NavbarPublic variant="hero" />

      <div className="-mt-[4.25rem]">
        <section className="relative isolate overflow-hidden bg-[#EBEBEB]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[24vw] top-[8vh] h-[62vw] max-h-[800px] min-h-[360px] w-[62vw] min-w-[360px] max-w-[800px] overflow-hidden rounded-full border border-[#222222]/10"
          >
            <Image
              src="/icon FT.png"
              alt=""
              fill
              className="object-contain opacity-[0.15]"
              sizes="62vw"
              priority
            />
          </div>

          <div
            className="relative mx-auto max-w-[1600px]"
            style={{
              padding:
                "calc(4.25rem + clamp(44px, 8vh, 110px)) clamp(24px, 5vw, 80px) clamp(36px, 5vh, 72px)",
            }}
          >
            <div className="text-[#222222]">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Insights", href: "/insights" },
                  {
                    label: categoryLabels[blog.category] ?? blog.category,
                    href: `/insights?category=${encodeURIComponent(blog.category)}`,
                  },
                  { label: blog.title, href: `/insights/${blog.slug}` },
                ]}
              />
            </div>

            <div className="mt-10">
              <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] font-medium text-[#222222]/60">
                <span>{categoryLabels[blog.category] ?? blog.category}</span>
                <span aria-hidden="true" className="text-[#E85A00]">
                  /
                </span>
                <time dateTime={blog.created_at}>
                  {formatDate(blog.created_at)}
                </time>
              </div>

              <h1 className="ft-display max-w-[24ch] text-[clamp(32px,4vw,56px)] font-extrabold leading-[1.02] tracking-[-0.05em] text-[#222222]">
                {blog.title}
              </h1>
            </div>
          </div>
        </section>
      </div>

      {blog.image_url && (
        <section
          className="bg-[#EBEBEB]"
          style={{
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
            paddingBottom: "clamp(70px, 9vh, 130px)",
          }}
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="relative aspect-[21/9] w-full overflow-hidden border border-[#222222] bg-white">
              <Image
                src={blog.image_url}
                alt={blog.title}
                fill
                className="object-cover grayscale"
                sizes="(max-width: 768px) 100vw, 1400px"
                priority
              />
            </div>
          </div>
        </section>
      )}

      <section
        className="bg-white"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(72px, 10vh, 150px)",
          paddingBottom: "clamp(80px, 11vh, 160px)",
        }}
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <article className="lg:col-span-7">
              <div
                className="prose prose-lg max-w-[760px]
                  prose-headings:font-extrabold prose-headings:tracking-[-0.055em] prose-headings:text-[#222222]
                  prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-[clamp(34px,4vw,62px)] prose-h2:leading-[0.95]
                  prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-[clamp(26px,3vw,40px)] prose-h3:leading-[1]
                  prose-p:text-[17px] prose-p:leading-[1.75] prose-p:text-[#222222]/70
                  prose-a:font-medium prose-a:text-[#E85A00] prose-a:no-underline hover:prose-a:underline
                  prose-li:text-[17px] prose-li:leading-[1.75] prose-li:text-[#222222]/70
                  prose-strong:font-semibold prose-strong:text-[#222222]
                  prose-blockquote:border-l-2 prose-blockquote:border-l-[#E85A00] prose-blockquote:pl-6 prose-blockquote:text-[clamp(24px,3vw,40px)] prose-blockquote:font-semibold prose-blockquote:leading-[1.05] prose-blockquote:tracking-[-0.04em] prose-blockquote:text-[#222222] prose-blockquote:not-italic
                  prose-img:border prose-img:border-[#222222] prose-img:rounded-none
                  prose-hr:border-[#222222]/15"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </article>

            {firm && (
              <aside className="lg:col-span-4 lg:col-start-9">
                <div className="lg:sticky lg:top-24">
                  <div className="border border-[#222222] bg-[#0A0A0A] p-6 text-white md:p-7">
                    <p className="text-[13px] font-medium text-white/45">
                      About the company
                    </p>

                    <div className="mt-8 flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-white/15 bg-white">
                        {firm.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firm.logo_url}
                            alt={`${firm.name} logo`}
                            className="h-full w-full object-contain p-2"
                          />
                        ) : (
                          <span className="text-[13px] font-bold text-[#E85A00]">
                            {firm.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="ft-display truncate text-[28px] font-extrabold leading-[0.95] tracking-[-0.06em] text-white">
                          {firm.name}
                        </p>
                        {firm.location && (
                          <p className="mt-1 text-[13px] text-white/50">
                            {firm.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {firm.description && (
                      <p className="mt-8 line-clamp-5 text-[15px] leading-[1.65] text-white/65">
                        {firm.description}
                      </p>
                    )}

                    <Link
                      href={`/companies/${firm.slug}`}
                      className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#222222] transition-colors duration-200 hover:bg-[#E85A00] hover:text-white"
                    >
                      More about this company
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {relatedBlogs.length > 0 && (
        <section
          className="bg-[#EBEBEB]"
          style={{
            paddingLeft: "clamp(24px, 5vw, 80px)",
            paddingRight: "clamp(24px, 5vw, 80px)",
            paddingTop: "clamp(80px, 10vh, 150px)",
            paddingBottom: "clamp(80px, 10vh, 150px)",
          }}
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-10 grid grid-cols-1 gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
              <h2 className="ft-display text-[clamp(54px,9vw,132px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222] lg:col-span-8">
                Related articles.
              </h2>
              <div className="lg:col-span-4">
                <p className="max-w-[390px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                  More thinking from the same corner of the finance market.
                </p>
                <Link href="/insights" className="btn-primary mt-6">
                  All articles
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3">
              {relatedBlogs.map((relatedBlog) => (
                <RelatedArticleCard key={relatedBlog.id} blog={relatedBlog} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand />

      <Footer />
    </div>
  );
}
