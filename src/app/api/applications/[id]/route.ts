import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

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

  const admin = createAdminClient();
  const { data: deleted, error } = await admin
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("firm_id", firm.id)
    .select("id");

  if (error) {
    console.error("[DELETE /api/applications/[id]]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!deleted || deleted.length === 0) {
    return NextResponse.json(
      { error: "Sollicitatie niet gevonden of geen toegang." },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}
