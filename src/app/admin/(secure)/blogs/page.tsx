import Link from "next/link";
import { FileText, Shield } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { BlogDeleteButton } from "./BlogDeleteButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blogbeheer",
};

/**
 * Centraal blog-overzicht voor de Super Admin.
 *
 * Haalt álle blogs op (nieuwste eerst) via de service-role client en
 * joint de bijbehorende firm-naam (= auteur) in één query. De auth-
 * check gebeurt bovenaan in (secure)/layout.tsx + middleware.ts.
 */

type BlogStatus = "draft" | "published";

type BlogRow = {
  id: string;
  title: string;
  slug: string | null;
  status: BlogStatus | null;
  created_at: string;
  firm_id: string | null;
  firms: { id: string; name: string; slug: string | null } | null;
};

const STATUS_BADGE: Record<BlogStatus, string> = {
  published: "bg-green-50 text-green-700 ring-green-200",
  draft: "bg-orange-50 text-orange-700 ring-orange-200",
};

const STATUS_LABEL: Record<BlogStatus, string> = {
  published: "Gepubliceerd",
  draft: "Concept",
};

export default async function AdminBlogsPage() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("blogs")
    .select(
      `
        id,
        title,
        slug,
        status,
        created_at,
        firm_id,
        firms:firm_id ( id, name, slug )
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[admin/blogs] blogs fetch error:", error.message);
  }

  // Supabase typeert de `firms` relatie soms als array en soms als object,
  // afhankelijk van de FK-metadata. We normaliseren dat hier naar één shape.
  const blogs: BlogRow[] = ((data ?? []) as unknown as Array<
    Omit<BlogRow, "firms"> & { firms: BlogRow["firms"] | BlogRow["firms"][] }
  >).map((row) => ({
    ...row,
    firms: Array.isArray(row.firms) ? row.firms[0] ?? null : row.firms ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200">
          <Shield className="h-3.5 w-3.5" />
          Super Admin
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">Blogbeheer</h1>
        <p className="mt-1 text-sm text-gray-500">
          Alle blogartikelen op het platform. Bekijk of verwijder ongewenste
          artikelen.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Blogs</h2>
            <p className="text-xs text-gray-500">
              {blogs.length} resultaat{blogs.length !== 1 ? "en" : ""}, nieuwste eerst
            </p>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">
            <FileText className="mx-auto h-6 w-6 text-gray-300" />
            <p className="mt-2">Geen blogs gevonden.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Titel
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Datum
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Auteur
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogs.map((blog) => {
                  const status: BlogStatus = blog.status ?? "draft";
                  const firmName = blog.firms?.name ?? "—";
                  const firmId = blog.firms?.id ?? blog.firm_id;
                  return (
                    <tr key={blog.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        {blog.slug ? (
                          <Link
                            href={`/kennisbank/${blog.slug}`}
                            target="_blank"
                            className="font-semibold text-gray-900 hover:text-brand-600"
                          >
                            {blog.title}
                          </Link>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {blog.title}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {new Date(blog.created_at).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-4">
                        {firmId ? (
                          <Link
                            href={`/admin/werkgevers/${firmId}`}
                            className="font-medium text-gray-900 hover:text-brand-600"
                          >
                            {firmName}
                          </Link>
                        ) : (
                          <span className="text-gray-500">{firmName}</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_BADGE[status]}`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <BlogDeleteButton blogId={blog.id} blogTitle={blog.title} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
