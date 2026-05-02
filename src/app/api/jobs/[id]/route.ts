import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getImpersonatedFirmId } from "@/lib/impersonation";
import { geocodeCity } from "@/lib/geocode";
import { RECHTSGEBIEDEN_MET_OVERIG } from "@/lib/constants/rechtsgebieden";

// ── Zod schemas ────────────────────────────────────────────────────────────

const JOB_TYPES = ["fulltime", "parttime", "business-course", "stage"] as const;

const updateJobSchema = z.object({
  title: z.string().min(1).max(200).trim().optional(),
  location: z.string().min(1).max(200).trim().optional(),
  type: z.enum(JOB_TYPES).optional(),
  practice_area: z.enum(RECHTSGEBIEDEN_MET_OVERIG).optional(),
  description: z.string().min(1).max(100_000).optional(),
  salary_indication: z.string().max(200).trim().nullable().optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  required_education: z.string().max(300).trim().nullable().optional(),
  hours_per_week: z.number().int().min(1).max(168).nullable().optional(),
  expires_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  status: z.enum(["draft", "active", "closed"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

type ResolvedFirm = {
  user: { id: string } | null;
  firm: { id: string } | null;
  /**
   * True wanneer een admin op dit moment als werkgever is ingelogd via
   * de impersonatie-cookie. In dat geval moet de caller met de
   * service-role client schrijven, omdat RLS op `jobs` alleen writes
   * toestaat voor de firm-owner.
   */
  isImpersonating: boolean;
  response: NextResponse | null;
};

/**
 * Zoekt de firm waar de huidige request namens handelt.
 *
 * 1. Als er een geldig impersonatie-cookie is en de ingelogde user heeft
 *    rol `admin`, dan is dat de firm (de helper valideert de rol zelf).
 * 2. Anders de firm waarvan de ingelogde user eigenaar is
 *    (`firms.user_id = auth.uid()`).
 *
 * Zo krijgen admins tijdens impersonatie niet langer
 * "Geen werkgever gevonden voor dit account".
 */
async function resolveActingFirm(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<ResolvedFirm> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      firm: null,
      isImpersonating: false,
      response: NextResponse.json({ error: "Niet ingelogd." }, { status: 401 }),
    };
  }

  // getImpersonatedFirmId verifieert zelf dat de huidige user admin is —
  // een stale cookie op een gewoon werkgeversaccount wordt genegeerd.
  const impersonatedFirmId = await getImpersonatedFirmId();
  if (impersonatedFirmId) {
    const admin = createAdminClient();
    const { data: firm } = await admin
      .from("firms")
      .select("id")
      .eq("id", impersonatedFirmId)
      .maybeSingle();

    if (!firm) {
      return {
        user,
        firm: null,
        isImpersonating: true,
        response: NextResponse.json(
          { error: "Geïmpersoneerde werkgever bestaat niet meer." },
          { status: 404 }
        ),
      };
    }

    return { user, firm, isImpersonating: true, response: null };
  }

  const { data: firm } = await supabase
    .from("firms")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!firm) {
    return {
      user,
      firm: null,
      isImpersonating: false,
      response: NextResponse.json(
        { error: "Geen werkgever gevonden voor dit account." },
        { status: 403 }
      ),
    };
  }

  return { user, firm, isImpersonating: false, response: null };
}

// ── PATCH /api/jobs/[id] — update a job ───────────────────────────────────

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { firm, isImpersonating, response } = await resolveActingFirm(supabase);
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const result = updateJobSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer.", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const updatePayload: Record<string, unknown> = {
    ...result.data,
    updated_at: new Date().toISOString(),
  };

  if (result.data.location) {
    const geo = await geocodeCity(result.data.location);
    updatePayload.latitude = geo?.lat ?? null;
    updatePayload.longitude = geo?.lng ?? null;
  }

  // RLS op `jobs` laat schrijven alleen toe voor de firm-owner. Tijdens
  // impersonatie is de ingelogde sessie de admin (niet de owner), dus
  // switchen we naar de service-role client. De admin-check zit al in
  // getImpersonatedFirmId().
  const db = isImpersonating ? createAdminClient() : supabase;

  const { data: updated, error } = await db
    .from("jobs")
    .update(updatePayload)
    .eq("id", id)
    .eq("firm_id", firm!.id)
    .select("id");

  if (error) {
    console.error("[PATCH /api/jobs/[id]] update error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!updated || updated.length === 0) {
    return NextResponse.json(
      { error: "Vacature niet gevonden of geen toegang." },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}

// ── DELETE /api/jobs/[id] — delete a job ──────────────────────────────────

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const { firm, isImpersonating, response } = await resolveActingFirm(supabase);
  if (response) return response;

  // IDOR-bescherming: WHERE id = :id AND firm_id = :acting_firm_id.
  // Werkgever A kan nooit een vacature van werkgever B verwijderen —
  // óók niet wanneer de request via de service-role client loopt,
  // want de firm-filter returnt dan simpelweg 0 rijen.
  const db = isImpersonating ? createAdminClient() : supabase;

  const { data: deleted, error } = await db
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("firm_id", firm!.id)
    .select("id");

  if (error) {
    console.error("[DELETE /api/jobs/[id]] delete error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json(
      { error: "Vacature niet gevonden of geen toegang." },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}
