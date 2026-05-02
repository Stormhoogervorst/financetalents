import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getImpersonatedFirmId } from "@/lib/impersonation";
import { RECHTSGEBIEDEN_MET_OVERIG } from "@/lib/constants/rechtsgebieden";

const RLS_FIRM_MESSAGE =
  "U heeft geen rechten om een kantoor aan te maken. Neem contact op met support.";

function isRlsPolicyError(message: string, code?: string): boolean {
  const m = message.toLowerCase();
  return (
    code === "42501" ||
    m.includes("row-level security") ||
    m.includes("violates row-level security") ||
    (m.includes("permission denied") && m.includes("policy"))
  );
}

function firmWriteErrorResponse(message: string, code?: string) {
  if (isRlsPolicyError(message, code)) {
    return NextResponse.json({ error: RLS_FIRM_MESSAGE }, { status: 403 });
  }
  return NextResponse.json({ error: message }, { status: 500 });
}

// ── Zod schemas ────────────────────────────────────────────────────────────

// Bedrijfsgrootte — opties afgestemd op de juridische markt.
// Waarden worden opgeslagen als compacte strings; de UI toont ze als
// "{team_size} medewerkers" (zie o.a. FirmCard).
const TEAM_SIZES = ["1-5", "6-20", "21-50", "51-100", "100+"] as const;

// Explicit allowlist of updatable columns — prevents mass-assignment of
// sensitive columns like user_id, id, slug (on update), is_published, etc.
const updateFirmSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  location: z.string().min(1).max(200).trim().optional(),
  practice_areas: z.array(z.enum(RECHTSGEBIEDEN_MET_OVERIG)).optional(),
  description: z.string().max(10_000).trim().optional(),
  contact_person: z.string().max(200).trim().optional(),
  notification_email: z.string().email().max(200).optional(),
  team_size: z.enum(TEAM_SIZES).nullable().optional(),
  why_work_with_us: z.string().max(5_000).trim().nullable().optional(),
  website_url: z.string().url().max(500).nullable().optional(),
  linkedin_url: z.string().url().max(500).nullable().optional(),
  salary_indication: z.string().max(200).trim().nullable().optional(),
  logo_url: z.string().url().max(1_000).nullable().optional(),
  // slug is allowed only on first insert (handled separately), never update
  // user_id, id, created_at are never accepted here
});

// Email-settings-only schema — used by the settings page.
// cc_emails is a list of extra CC addresses (0 or more). An empty array
// clears the field. We trim, lowercase, and de-duplicate server-side as
// a defence-in-depth measure on top of the client's validation.
const MAX_CC_EMAILS = 20;

const emailSettingsSchema = z.object({
  notification_email: z.string().email().max(200).optional(),
  cc_emails: z
    .array(z.string().email().max(200))
    .max(MAX_CC_EMAILS)
    .transform((arr) => {
      const seen = new Set<string>();
      const out: string[] = [];
      for (const raw of arr) {
        const e = raw.trim().toLowerCase();
        if (!e || seen.has(e)) continue;
        seen.add(e);
        out.push(e);
      }
      return out;
    })
    .optional(),
});

// ── PATCH /api/firms/me — update own firm (profile) ───────────────────────

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  // Step A: verify auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  // Determine which schema to use based on the request body shape
  const isEmailSettings =
    body !== null &&
    typeof body === "object" &&
    ("notification_email" in body || "cc_emails" in body) &&
    !("name" in body) &&
    !("location" in body);

  // Step B: Resolve the target firm BEFORE any mutation.
  //
  // Two modes:
  //  1) Normal — the authenticated user owns a firm. We look it up by
  //     user_id = user.id.
  //  2) Impersonation — the authenticated user is an admin with an active
  //     impersonation cookie. In that case the target is the impersonated
  //     firm (by id), and writes go through the service-role client so we
  //     are not rejected by RLS (which would otherwise see the admin's uid
  //     and refuse writes on someone else's row).
  //
  // Crucially, during impersonation we MUST NOT fall back to an insert —
  // that was the bug that silently created duplicate employer rows owned
  // by the admin. If the impersonated firm cannot be found we return 404.
  const impersonatedFirmId = await getImpersonatedFirmId();
  const isImpersonating = !!impersonatedFirmId;

  let targetFirmId: string | null = null;
  let targetUserId: string | null = null;
  let writeClient = supabase;

  if (isImpersonating) {
    const admin = createAdminClient();
    const { data: impersonatedFirm } = await admin
      .from("firms")
      .select("id, user_id, slug")
      .eq("id", impersonatedFirmId!)
      .maybeSingle();

    if (!impersonatedFirm) {
      return NextResponse.json(
        { error: "Geïmpersoneerde werkgever niet gevonden." },
        { status: 404 }
      );
    }

    targetFirmId = impersonatedFirm.id as string;
    targetUserId = impersonatedFirm.user_id as string;
    writeClient = admin;
  } else {
    const { data: ownedFirm } = await supabase
      .from("firms")
      .select("id, user_id, slug")
      .eq("user_id", user.id)
      .maybeSingle();

    if (ownedFirm) {
      targetFirmId = ownedFirm.id as string;
      targetUserId = ownedFirm.user_id as string;
    }
  }

  // Step C: validate body (now we know whether we are updating or
  // inserting — inserts are only allowed for the authenticated user's own
  // first-time profile, never during impersonation).
  let validatedData: Record<string, unknown>;

  if (isEmailSettings) {
    const result = emailSettingsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Ongeldige invoer.", details: result.error.flatten() },
        { status: 400 }
      );
    }
    validatedData = result.data as Record<string, unknown>;
  } else {
    const result = updateFirmSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Ongeldige invoer.", details: result.error.flatten() },
        { status: 400 }
      );
    }

    // Derive is_published from the merged (existing + patch) record so a
    // partial update does not accidentally flip the firm to unpublished.
    const d = result.data;

    // `writeClient` is een union van de anon-client en de service-role
    // client; in combinatie met de gegenereerde Supabase-types kan TS
    // op Vercel de `.maybeSingle()`-return narrowen tot `never` in één
    // van de takken. We typeren `existing` daarom expliciet en casten de
    // ruwe response via `unknown` zodat de build niet struikelt over
    // een type-intersectie die TS als `never` ziet.
    type ExistingFirm = {
      name: string | null;
      location: string | null;
      practice_areas: string[] | null;
      description: string | null;
      contact_person: string | null;
      notification_email: string | null;
    };

    let existing: ExistingFirm | null = null;

    if (targetFirmId) {
      const { data } = await writeClient
        .from("firms")
        .select(
          "name, location, practice_areas, description, contact_person, notification_email"
        )
        .eq("id", targetFirmId)
        .maybeSingle();
      existing = (data as unknown as ExistingFirm | null) ?? null;
    }

    // Robuuste cast op `existing` — TS op Vercel's build kan `existing`
    // anders tot `never` narrowen (zie toelichting hierboven), waardoor
    // `existing?.name` zou falen met "Property 'name' does not exist on
    // type 'never'". Casten via `unknown as ExistingFirm` houdt de
    // null-check intact en voorkomt die false positive.
    const ex = existing as ExistingFirm | null;

    const merged = {
      name: d.name ?? ex?.name,
      location: d.location ?? ex?.location,
      practice_areas: d.practice_areas ?? ex?.practice_areas,
      description: d.description ?? ex?.description,
      contact_person: d.contact_person ?? ex?.contact_person,
      notification_email: d.notification_email ?? ex?.notification_email,
    };

    const isPublished =
      !!merged.name?.trim() &&
      !!merged.location?.trim() &&
      (merged.practice_areas?.length ?? 0) > 0 &&
      !!merged.description?.trim() &&
      !!merged.contact_person?.trim() &&
      !!merged.notification_email?.trim();

    validatedData = { ...result.data, is_published: isPublished };
  }

  if (Object.keys(validatedData).length === 0) {
    return NextResponse.json({ error: "Geen velden om bij te werken." }, { status: 400 });
  }

  // Step D: perform the mutation.
  if (targetFirmId) {
    // Strict update on the resolved firm id — never by user_id during
    // impersonation, and never an upsert/insert that could create a
    // duplicate row.
    const { error } = await writeClient
      .from("firms")
      .update(validatedData)
      .eq("id", targetFirmId);

    if (error) {
      console.error("[PATCH /api/firms/me] update error:", error.message);
      return firmWriteErrorResponse(error.message, error.code);
    }

    // Best-effort: ensure the impersonated user's profile is linked to the
    // firm (normally already the case, but keeps data consistent).
    if (isImpersonating && targetUserId) {
      const admin = writeClient;
      await admin
        .from("profiles")
        .update({ firm_id: targetFirmId })
        .eq("id", targetUserId);
    }

    return NextResponse.json({ success: true, firm_id: targetFirmId });
  }

  // No firm yet — only allowed for the authenticated user creating their
  // own first profile. Impersonation was already handled above (and would
  // have returned 404), so reaching this branch implies !isImpersonating.
  if (isImpersonating) {
    // Defence-in-depth: should be unreachable.
    return NextResponse.json(
      { error: "Kan tijdens impersonatie geen nieuw profiel aanmaken." },
      { status: 409 }
    );
  }

  if (!("name" in validatedData) || !validatedData.name) {
    return NextResponse.json(
      { error: "Naam is verplicht voor een nieuw werkgeversprofiel." },
      { status: 400 }
    );
  }
  const name = String(validatedData.name);
  const slug =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Math.random().toString(36).substring(2, 8);

  const { data: inserted, error: insertError } = await supabase
    .from("firms")
    .insert({
      ...validatedData,
      user_id: user.id, // always server-resolved, never client-provided
      slug,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[PATCH /api/firms/me] insert error:", insertError.message);
    return firmWriteErrorResponse(insertError.message, insertError.code);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ firm_id: inserted.id })
    .eq("id", user.id);

  if (profileError) {
    console.error(
      "[PATCH /api/firms/me] profile firm_id link error:",
      profileError.message
    );
    if (isRlsPolicyError(profileError.message, profileError.code)) {
      return NextResponse.json({ error: RLS_FIRM_MESSAGE }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Kantoor aangemaakt maar koppeling met profiel mislukt." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, firm_id: inserted.id });
}
