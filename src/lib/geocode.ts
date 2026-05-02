export interface GeoResult {
  lat: number;
  lng: number;
  displayName: string;
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";

/**
 * Geocode a city/address using OpenStreetMap Nominatim.
 * Returns null when the location cannot be resolved.
 * Results are biased towards the Netherlands (countrycodes=nl).
 */
export async function geocodeCity(
  query: string,
): Promise<GeoResult | null> {
  if (!query.trim()) return null;

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set("q", query.trim());
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "nl");

  try {
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "LegalTalents/1.0" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const { lat, lon, display_name } = data[0];
    return {
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      displayName: display_name,
    };
  } catch {
    return null;
  }
}
