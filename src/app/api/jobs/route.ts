import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { geocodeCity } from "@/lib/geocode";
import { RECHTSGEBIEDEN_MET_OVERIG } from "@/lib/constants/rechtsgebieden";

// ── Zod schemas ────────────────────────────────────────────────────────────

const JOB_TYPES = ["fulltime", "parttime", "business-course", "stage"] as const;

const createJobSchema = z.object({
  title: z.string().min(1, "Titel is verplicht").max(200).trim(),
  location: z.string().min(1, "Vestigingsplaats is verplicht").max(200).trim(),
  type: z.enum(JOB_TYPES, { message: "Ongeldig type" }),
  practice_area: z.enum(RECHTSGEBIEDEN_MET_OVERIG, {
    message: "Ongeldig rechtsgebied",
  }),
  description: z.string().min(1, "Beschrijving is verplicht").max(100_000),
  salary_indication: z.string().max(200).trim().nullable().optional(),
  start_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum")
    .nullable()
    .optional(),
  required_education: z.string().max(300).trim().nullable().optional(),
  hours_per_week: z.number().int().min(1).max(168).nullable().optional(),
  expires_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ongeldige datum")
    .nullable()
    .optional(),
  status: z.enum(["draft", "active"]),
  slug: z.string().min(1).max(400),
  // Admin-only overrides: vacature plaatsen namens een andere werkgever.
  // Worden alleen geaccepteerd wanneer de ingelogde user role='admin' heeft.
  firm_id: z.string().uuid().optional(),
  posted_by_admin: z.boolean().optional(),
});

// ── POST /api/jobs — create a new job ─────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Step A: verify auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  // Step B: parse + validate input with Zod (prevents mass-assignment)
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldige JSON." }, { status: 400 });
  }

  const result = createJobSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldige invoer.", details: result.error.flatten() },
      { status: 400 }
    );
  }

  const d = result.data;

  // Step C: resolve firm_id. In de admin-flow mag de client een firm_id
  // meesturen; we vertrouwen die alleen als de server bevestigt dat deze
  // gebruiker admin is. In alle andere gevallen leiden we de firm af uit
  // de sessie (ownership anchor).
  let firmId: string;
  let postedByAdmin = false;

  if (d.firm_id || d.posted_by_admin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Alleen admins mogen namens een werkgever plaatsen." },
        { status: 403 }
      );
    }

    if (!d.firm_id) {
      return NextResponse.json(
        { error: "firm_id is vereist voor admin-flow." },
        { status: 400 }
      );
    }

    // Controleer dat de opgegeven firm bestaat.
    const { data: firm } = await supabase
      .from("firms")
      .select("id")
      .eq("id", d.firm_id)
      .maybeSingle();

    if (!firm) {
      return NextResponse.json(
        { error: "Werkgever niet gevonden." },
        { status: 404 }
      );
    }

    firmId = firm.id;
    postedByAdmin = d.posted_by_admin ?? true;
  } else {
    const { data: firm } = await supabase
      .from("firms")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!firm) {
      return NextResponse.json(
        { error: "Geen werkgever gevonden voor dit account." },
        { status: 403 }
      );
    }

    firmId = firm.id;
  }

  const geo = await geocodeCity(d.location);

  // RLS op `jobs` staat alleen inserts toe voor de eigenaar van de firm.
  // In de admin-flow is dat niet de huidige sessie, dus gebruiken we de
  // service-role client. De admin-check is hierboven al gedaan.
  const db = postedByAdmin ? createAdminClient() : supabase;

  // `expires_at` bewust alleen meesturen als de werkgever een datum koos.
  // Wanneer het veld wordt weggelaten valt de INSERT terug op de DB-default
  // (`now() + 60 days`), zodat élke vacature altijd een geldige validThrough
  // heeft voor schema.org/JobPosting.
  const insertPayload: Record<string, unknown> = {
    firm_id: firmId,
    title: d.title,
    location: d.location,
    type: d.type,
    practice_area: d.practice_area,
    description: d.description,
    salary_indication: d.salary_indication ?? null,
    start_date: d.start_date ?? null,
    required_education: d.required_education ?? null,
    hours_per_week: d.hours_per_week ?? null,
    status: d.status,
    slug: d.slug,
    latitude: geo?.lat ?? null,
    longitude: geo?.lng ?? null,
    posted_by_admin: postedByAdmin,
  };
  if (d.expires_at) {
    insertPayload.expires_at = d.expires_at;
  }

  const { error: insertError } = await db.from("jobs").insert(insertPayload);

  if (insertError) {
    console.error("[POST /api/jobs] insert error:", insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
