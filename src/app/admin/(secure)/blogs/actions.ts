"use server";

import { revalidatePath } from "next/cache";
import {
  BLOG_IMAGES_BUCKET,
  getBlogImageStoragePathFromPublicUrl,
} from "@/lib/blog-images";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin-actie: een blog hard verwijderen.
 *
 * Net als bij jobs kiezen we voor een hard delete; er is geen
 * soft-delete infrastructuur in dit project. Als de blog een
 * upgeloade afbeelding heeft in de blog image bucket, ruimen we
 * die in dezelfde actie op om weesbestanden te voorkomen.
 *
 * Defense-in-depth: (secure)/layout.tsx + middleware.ts dekken de UI,
 * maar Server Actions zijn ook direct over het netwerk aanroepbaar.
 * Daarom valideren we hier opnieuw dat de caller een admin-profiel
 * heeft voor we met de service-role client schrijven.
 */
export async function deleteBlogAsAdmin(formData: FormData): Promise<void> {
  const blogId = String(formData.get("blogId") ?? "");
  if (!blogId) throw new Error("Ontbrekend blog-id.");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Niet ingelogd.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") throw new Error("No access.");

  const admin = createAdminClient();

  const { data: blog } = await admin
    .from("blogs")
    .select("id, image_url")
    .eq("id", blogId)
    .maybeSingle();

  const { error } = await admin.from("blogs").delete().eq("id", blogId);
  if (error) throw new Error(error.message);

  if (blog?.image_url) {
    const filePath = getBlogImageStoragePathFromPublicUrl(blog.image_url);
    if (filePath) {
      await admin.storage.from(BLOG_IMAGES_BUCKET).remove([filePath]);
    }
  }

  revalidatePath("/admin/blogs");
}
