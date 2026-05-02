import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActingFirm } from "@/lib/impersonation";
import EditBlogForm from "./EditBlogForm";
import { deleteBlogAction, updateBlogAction } from "./actions";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { firm } = await getActingFirm<{ id: string }>("id", user.id);
  if (!firm) redirect("/portal/profile");

  const { data: blog } = await admin
    .from("blogs")
    .select("id, firm_id, title, category, content, image_url")
    .eq("id", id)
    .maybeSingle();

  if (!blog) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-black mb-2">Blog niet gevonden</h1>
        <p className="text-sm text-gray-500">
          Deze blog bestaat niet (meer) of is verplaatst.
        </p>
      </div>
    );
  }

  if (blog.firm_id !== firm.id) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-black mb-2">Niet geautoriseerd</h1>
        <p className="text-sm text-gray-500">
          Je hebt geen toegang om deze blog te bekijken of bewerken.
        </p>
      </div>
    );
  }

  const boundUpdateAction = updateBlogAction.bind(null, blog.id);
  const boundDeleteAction = deleteBlogAction.bind(null, blog.id);

  return (
    <div className="max-w-2xl">
      <Link
        href="/portal/blogs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Terug naar blogs
      </Link>

      <h1 className="text-2xl font-bold text-black mb-2">Blog bewerken</h1>
      <p className="text-sm text-gray-500 mb-8">{blog.title}</p>

      <EditBlogForm
        blogId={blog.id}
        initialTitle={blog.title}
        initialCategory={blog.category}
        initialContent={blog.content}
        initialImageUrl={blog.image_url}
        updateAction={boundUpdateAction}
        deleteAction={boundDeleteAction}
      />
    </div>
  );
}

