import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// ── Zod schema ────────────────────────────────────────────────────────────

const BLOG_CATEGORIES = ["carriere", "finance", "kantoorleven"] as const;

const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required").max(300).trim(),
  slug: z.string().min(1).max(400),
  category: z.enum(BLOG_CATEGORIES, { message: "Invalid category" }),
  content: z.string().min(1, "Content is required").max(500_000),
  image_url: z.string().url().max(1_000).nullable().optional(),
  status: z.enum(["draft", "published"]),
});

// ── POST /api/blogs — create a blog post ─────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Step A: verify auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  // Step B: resolve the firm via profiles.firm_id (works for owners AND team members)
  const admin = createAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("firm_id")
    .eq("id", user.id)
    .maybeSingle<{ firm_id: string | null }>();

  if (profileError) {
    console.error("[POST /api/blogs] profile firm_id lookup error:", profileError.message);
    return NextResponse.json(
      { error: "Could not verify your company profile." },
      { status: 500 }
    );
  }

  const firmId = profile?.firm_id;

  if (!firmId) {
    return NextResponse.json(
      {
        error:
          "Your account is not linked to a company yet. Please contact the administrator.",
      },
      { status: 403 }
    );
  }

  // Step C: validate input with Zod (prevents mass-assignment)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const result = createBlogSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input.", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const d = result.data;

  const { error: insertError } = await supabase.from("blogs").insert({
    firm_id: firmId,
    title: d.title,
    slug: d.slug,
    category: d.category,
    content: d.content,
    image_url: d.image_url ?? null,
    status: d.status,
  });

  if (insertError) {
    console.error("[POST /api/blogs] insert error:", insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
