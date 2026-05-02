"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type BlogActionState = {
  error?: string;
  success?: string;
};

function getStoragePathFromPublicUrl(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const marker = "/storage/v1/object/public/blog-images/";
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;

    const encodedPath = url.pathname.slice(markerIndex + marker.length);
    if (!encodedPath) return null;
    return decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
}

export async function updateBlogAction(
  blogId: string,
  _prevState: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Je sessie is verlopen. Log opnieuw in." };
  }

  const { data: firm } = await supabase
    .from("firms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!firm) {
    return { error: "Geen werkgeverprofiel gevonden." };
  }

  const { data: existingBlog } = await admin
    .from("blogs")
    .select("id, firm_id")
    .eq("id", blogId)
    .maybeSingle();

  if (!existingBlog) {
    return { error: "Deze blog bestaat niet (meer)." };
  }

  if (existingBlog.firm_id !== firm.id) {
    return { error: "Niet geautoriseerd" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const imageUrlRaw = String(formData.get("image_url") ?? "").trim();

  if (!title) return { error: "Vul een titel in." };
  if (!content || content === "<p></p>") {
    return { error: "Schrijf eerst de inhoud van je blog." };
  }

  const allowedCategories = ["carriere", "juridisch", "kantoorleven"];
  if (!allowedCategories.includes(category)) {
    return { error: "Ongeldige categorie." };
  }

  const { error: updateError } = await admin
    .from("blogs")
    .update({
      title,
      category,
      content,
      image_url: imageUrlRaw || null,
    })
    .eq("id", blogId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/portal/blogs");
  revalidatePath(`/portal/blogs/${blogId}`);

  return { success: "Blog succesvol bijgewerkt" };
}

export async function deleteBlogAction(blogId: string): Promise<never> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: firm } = await supabase
    .from("firms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!firm) redirect("/portal/profile");

  const { data: blog } = await admin
    .from("blogs")
    .select("id, firm_id, image_url")
    .eq("id", blogId)
    .maybeSingle();

  if (!blog || blog.firm_id !== firm.id) {
    redirect("/portal/blogs?toast=blog-unauthorized");
  }

  const { error: deleteError } = await admin.from("blogs").delete().eq("id", blogId);
  if (deleteError) {
    redirect("/portal/blogs?toast=blog-delete-error");
  }

  if (blog.image_url) {
    const filePath = getStoragePathFromPublicUrl(blog.image_url);
    if (filePath) {
      await admin.storage.from("blog-images").remove([filePath]);
    }
  }

  revalidatePath("/portal/blogs");
  redirect("/portal/blogs?toast=blog-deleted");
}
