import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActingFirm } from "@/lib/impersonation";
import { Plus, FileText } from "lucide-react";
import BlogsToast from "./BlogsToast";

export const dynamic = "force-dynamic";

interface Blog {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  created_at: string;
}

type Props = {
  searchParams: Promise<{ toast?: string }>;
};

export default async function BlogsPage({ searchParams }: Props) {
  const { toast } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { firm } = await getActingFirm<{ id: string }>("id", user.id);

  if (!firm) redirect("/portal/profile");

  const admin = createAdminClient();
  const { data: blogs } = await admin
    .from("blogs")
    .select("id, title, slug, category, status, created_at")
    .eq("firm_id", firm.id)
    .order("created_at", { ascending: false });

  const blogList = (blogs ?? []) as Blog[];

  const categoryLabels: Record<string, string> = {
    carriere: "Carrière",
    juridisch: "Juridisch",
    kantoorleven: "Werkgeversleven",
  };

  return (
    <div className="max-w-6xl">
      <BlogsToast value={toast} />
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-black">Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {blogList.length === 0
              ? "Nog geen blogs geschreven"
              : `${blogList.length} blog${blogList.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/portal/blogs/nieuw"
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          Schrijf nieuwe blog
        </Link>
      </div>

      {/* Empty state */}
      {blogList.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mb-4">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-black mb-2">
            Nog geen blogs
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">
            Schrijf je eerste blog en laat kandidaten kennismaken met jouw organisatie.
          </p>
          <Link
            href="/portal/blogs/nieuw"
            className="btn-primary"
          >
            <Plus className="h-4 w-4" />
            Schrijf nieuwe blog
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3.5">
                    Titel
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Categorie
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3.5">
                    Datum
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blogList.map((blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/portal/blogs/${blog.id}`}
                        className="text-sm font-semibold text-black hover:text-primary hover:underline transition-colors"
                      >
                        {blog.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span className="bg-primary-light text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                        {categoryLabels[blog.category] ?? blog.category}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                          blog.status === "published"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            blog.status === "published" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        {blog.status === "published" ? "Gepubliceerd" : "Concept"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(blog.created_at).toLocaleDateString("nl-NL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden divide-y divide-gray-100">
            {blogList.map((blog) => (
              <div key={blog.id} className="px-4 py-4">
                <Link
                  href={`/portal/blogs/${blog.id}`}
                  className="text-sm font-semibold text-black hover:text-primary transition-colors block mb-1"
                >
                  {blog.title}
                </Link>
                <div className="flex items-center gap-3 mt-2">
                  <span className="bg-primary-light text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {categoryLabels[blog.category] ?? blog.category}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      blog.status === "published" ? "text-green-600" : "text-gray-400"
                    }`}
                  >
                    {blog.status === "published" ? "Gepubliceerd" : "Concept"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(blog.created_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
