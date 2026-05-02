import { NextRequest, NextResponse } from "next/server";
import { geocodeCity } from "@/lib/geocode";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
  }

  const result = await geocodeCity(q);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
