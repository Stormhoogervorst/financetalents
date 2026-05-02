import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token ontbreekt." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invitations")
    .select("firm_id, firms ( name )")
    .eq("token", token)
    .eq("status", "pending")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { error: "Ongeldige of verlopen uitnodiging." },
      { status: 404 }
    );
  }

  const firm = Array.isArray(data.firms) ? data.firms[0] : data.firms;
  return NextResponse.json({
    firm_name: (firm as { name: string } | null)?.name ?? null,
  });
}
