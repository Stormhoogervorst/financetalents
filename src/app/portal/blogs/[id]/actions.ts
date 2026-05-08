"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  BLOG_IMAGES_BUCKET,
  getBlogImageStoragePathFromPublicUrl,
} from "@/lib/blog-images";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type BlogActionState = {
  error?: string;
  success?: string;
};

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
    return { error: "Your session has expired. Log in again." };
  }

  const { data: firm } = await supabase
    .from("firms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!firm) {
    return { error: "No company profile found." };
  }

  const { data: existingBlog } = await admin
    .from("blogs")
    .select("id, firm_id")
    .eq("id", blogId)
    .maybeSingle();

  if (!existingBlog) {
    return { error: "This blog no longer exists." };
  }

  if (existingBlog.firm_id !== firm.id) {
    return { error: "Not authorized" };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const imageUrlRaw = String(formData.get("image_url") ?? "").trim();

  if (!title) return { error: "Please add a title." };
  if (!content || content === "<p></p>") {
    return { error: "Please add content to your article." };
  }

  const allowedCategories = ["carriere", "finance", "kantoorleven"];
  if (!allowedCategories.includes(category)) {
    return { error: "Invalid category." };
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

  return { success: "Blog updated successfully" };
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
    const filePath = getBlogImageStoragePathFromPublicUrl(blog.image_url);
    if (filePath) {
      await admin.storage.from(BLOG_IMAGES_BUCKET).remove([filePath]);
    }
  }

  revalidatePath("/portal/blogs");
  redirect("/portal/blogs?toast=blog-deleted");
}
