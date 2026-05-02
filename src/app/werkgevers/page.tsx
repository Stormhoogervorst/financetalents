import { createClient } from "@/lib/supabase/server";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import CtaBand from "@/components/CtaBand";
import GridCard from "@/components/GridCard";
import RadiusSelect from "@/components/RadiusSelect";
import { geocodeCity } from "@/lib/geocode";
import { MapPin, Users, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Firm } from "@/types";
import { RECHTSGEBIEDEN } from "@/lib/constants/rechtsgebieden";

export const revalidate = 0;

interface SearchParams {
  locatie?: string;
  straal?: string;
  rechtsgebied?: string;
}

export const metadata = {
  title: "Werkgevers",
  description:
    "Bekijk alle juridische werkgevers die actief vacatures plaatsen op Legal Talents.",
  alternates: {
    canonical: "/werkgevers",
  },
};

export default async function FirmsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const radiusKm = parseInt(params.straal ?? "0", 10) || 0;
  const useGeo = !!(params.locatie && radiusKm > 0);
  const geo = useGeo ? await geocodeCity(params.locatie!) : null;

  let nearbyFirmIds: Set<string> | null = null;
  if (geo && useGeo) {
    const { data: geoJobs } = await supabase.rpc("get_jobs_in_radius", {
      lat: geo.lat,
      lng: geo.lng,
      radius_km: radiusKm,
      job_status: "active",
    });

    const jobRows = (geoJobs ?? []) as { firm_id: string | null }[];
    nearbyFirmIds = new Set(
      jobRows
        .map((j) => j.firm_id)
        .filter((id): id is string => typeof id === "string")
    );
  }

  const { data: firms } = await supabase
    .from("firms")
    .select(
      "id, name, slug, location, practice_areas, logo_url, team_size, is_published"
    )
    .eq("is_published", true)
    .order("name", { ascending: true });

  let firmList = (firms ?? []) as Firm[];

  if (nearbyFirmIds) {
    const ids = nearbyFirmIds;
    firmList = firmList.filter((f) => ids.has(f.id));
  } else if (params.locatie) {
    const loc = params.locatie.toLowerCase();
    firmList = firmList.filter((f) =>
      f.location?.toLowerCase().includes(loc)
    );
  }
  if (params.rechtsgebied) {
    const area = params.rechtsgebied.toLowerCase();
    firmList = firmList.filter((f) =>
      f.practice_areas?.some((a) => a.toLowerCase().includes(area))
    );
  }

  const hasFilters = !!(
    params.locatie ||
    params.rechtsgebied ||
    (params.straal && params.straal !== "0")
  );

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      <NavbarPublic variant="hero" />

      {/* Hero — vivid mesh gradient matching the homepage, fading seamlessly to white */}
      <div className="-mt-[4.25rem]">
        <section
          className="relative isolate overflow-hidden"
          style={{
            background: `linear-gradient(135deg,
              #4B3BD6 0%,
              #5668E8 22%,
              #7A8BF5 42%,
              #A8B6FF 62%,
              #C9D4FF 82%,
              #FFFFFF 100%)`,
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(60% 55% at 50% 40%,
                  rgba(178, 140, 255, 0.65) 0%,
                  rgba(140, 120, 255, 0.30) 35%,
                  rgba(120, 150, 255, 0) 70%),
                radial-gradient(50% 60% at 50% 60%,
                  rgba(255, 255, 255, 0.45) 0%,
                  rgba(255, 255, 255, 0) 60%),
                radial-gradient(55% 70% at 96% 6%,
                  rgba(42, 20, 230, 0.80) 0%,
                  rgba(59, 44, 220, 0.35) 22%,
                  rgba(88, 125, 254, 0) 60%),
                radial-gradient(32% 38% at 2% 0%,
                  rgba(215, 168, 255, 0.85) 0%,
                  rgba(215, 168, 255, 0) 65%),
                radial-gradient(38% 45% at 10% 55%,
                  rgba(255, 255, 255, 0.55) 0%,
                  rgba(255, 255, 255, 0) 65%)
              `,
            }}
          />

          {/* Seamless fade to pure white at the bottom */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 md:h-56"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 55%, #FFFFFF 100%)",
            }}
          />

          <div
            className="max-w-[1400px] mx-auto relative"
            style={{
              padding:
                "calc(4.25rem + clamp(60px, 8vh, 120px)) clamp(24px, 5vw, 80px) clamp(80px, 10vh, 140px)",
            }}
          >
            <h1
              className="font-bold tracking-[-0.03em] leading-[1.05]"
              style={{
                fontSize: "clamp(48px, 6vw, 80px)",
                color: "#FFFFFF",
                textShadow: "0 1px 24px rgba(20, 24, 80, 0.25)",
              }}
            >
              Juridische werkgevers
            </h1>
            <p
              className="mt-6 leading-relaxed max-w-[640px]"
              style={{
                fontSize: "clamp(15px, 1.1vw, 17px)",
                lineHeight: 1.65,
                color: "#FFFFFF",
                opacity: 0.95,
                textShadow: "0 1px 16px rgba(20, 24, 80, 0.22)",
              }}
            >
              Ontdek de kantoren en organisaties die actief zoeken naar juridisch
              talent. Vind een werkgever die bij je past.
            </p>

            {/* Deep-navy filter pill — matches the homepage hero search contrast */}
            <form method="GET" className="mt-10 max-w-[960px]">
              <div
                className="flex flex-col md:flex-row items-stretch flex-wrap rounded-[28px] p-2 gap-2"
                style={{
                  background: "#0A0F3D",
                  boxShadow:
                    "0 20px 40px -18px rgba(10, 15, 61, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.10) inset",
                }}
              >
                {/* Location */}
                <label
                  htmlFor="locatie"
                  className="flex items-center gap-2.5 flex-1 min-w-[220px] px-4 rounded-[22px]"
                >
                  <MapPin
                    className="h-4 w-4 shrink-0"
                    style={{ color: "rgba(255, 255, 255, 0.65)" }}
                  />
                  <input
                    id="locatie"
                    name="locatie"
                    defaultValue={params.locatie ?? ""}
                    placeholder="Locatie"
                    className="w-full bg-transparent border-none outline-none focus:outline-none py-3 text-[14px] text-white placeholder:text-white/55"
                  />
                </label>

                {/* Radius — only shows when a location is entered */}
                <div className="flex items-center md:w-[110px] px-4 md:border-l border-white/10">
                  <RadiusSelect
                    name="straal"
                    defaultValue={params.straal ?? "0"}
                    locationInputId="locatie"
                    className="w-full bg-transparent border-none outline-none focus:outline-none appearance-none py-3 text-[14px] text-white cursor-pointer"
                  />
                </div>

                {/* Practice area */}
                <label
                  htmlFor="rechtsgebied"
                  className="relative flex items-center flex-1 md:max-w-[260px] min-w-0 px-4 rounded-[22px] md:border-l border-white/10"
                >
                  <select
                    id="rechtsgebied"
                    name="rechtsgebied"
                    defaultValue={params.rechtsgebied ?? ""}
                    className="w-full bg-transparent border-none outline-none focus:outline-none appearance-none py-3 text-[14px] text-white cursor-pointer pr-6"
                  >
                    <option value="" className="text-[#0A0F3D]">
                      Alle rechtsgebieden
                    </option>
                    {RECHTSGEBIEDEN.map((area) => (
                      <option
                        key={area}
                        value={area}
                        className="text-[#0A0F3D]"
                      >
                        {area}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="h-4 w-4 pointer-events-none absolute right-4"
                    style={{ color: "rgba(255, 255, 255, 0.55)" }}
                  />
                </label>

                {/* Submit — bright blue gradient */}
                <button
                  type="submit"
                  className="shrink-0 inline-flex items-center justify-center rounded-full font-semibold text-white transition-all duration-200 hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#0A0F3D]"
                  style={{
                    padding: "12px 28px",
                    fontSize: "14px",
                    background:
                      "linear-gradient(135deg, #4B3BD6 0%, #587DFE 55%, #7A8BF5 100%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Toepassen
                </button>
              </div>

              {hasFilters && (
                <div className="mt-4">
                  <Link
                    href="/werkgevers"
                    className="text-[13px] font-medium border-b border-white/30 pb-0.5 hover:border-white transition-colors"
                    style={{ color: "rgba(255, 255, 255, 0.8)" }}
                  >
                    Filters wissen
                  </Link>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>

      {/* Results */}
      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(40px, 5vh, 64px)",
          paddingBottom: "clamp(100px, 12vh, 180px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          {/* Result count */}
          <div className="mb-6">
            <p
              className="text-[13px] font-medium tracking-wide"
              style={{ color: "#999999" }}
            >
              {firmList.length === 0
                ? "Geen werkgevers gevonden"
                : `${firmList.length} werkgever${firmList.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Firm grid */}
          {firmList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {firmList.map((firm) => {
                const initials = firm.name.slice(0, 2).toUpperCase();
                const meta: { icon: React.ReactNode; text: string }[] = [];

                if (firm.location) {
                  meta.push({
                    icon: <MapPin className="h-3 w-3 shrink-0" />,
                    text: firm.location,
                  });
                }
                if (firm.team_size) {
                  meta.push({
                    icon: <Users className="h-3 w-3 shrink-0" />,
                    text: `${firm.team_size} medewerkers`,
                  });
                }

                return (
                  <GridCard
                    key={firm.id}
                    href={`/werkgevers/${firm.slug}`}
                    logoUrl={firm.logo_url}
                    logoFallback={
                      <span className="font-semibold text-sm text-[#587DFE]">
                        {initials}
                      </span>
                    }
                    title={firm.name}
                    meta={meta}
                    pills={firm.practice_areas ?? []}
                  />
                );
              })}
            </div>
          ) : (
            <div className="pt-16 pb-8" style={{ maxWidth: "640px" }}>
              <h2
                className="font-bold tracking-[-0.025em] leading-[1.1] text-[#0A0A0A]"
                style={{ fontSize: "clamp(36px, 4.5vw, 64px)" }}
              >
                {hasFilters
                  ? "Geen werkgevers gevonden"
                  : "Binnenkort beschikbaar"}
              </h2>
              <p
                className="mt-6 leading-relaxed"
                style={{
                  fontSize: "clamp(15px, 1.1vw, 17px)",
                  lineHeight: 1.65,
                  color: "#6B6B6B",
                }}
              >
                {hasFilters
                  ? "Probeer andere filters of verwijder de huidige selectie."
                  : "Er zijn momenteel geen gepubliceerde werkgevers. Kom later terug."}
              </p>
              {hasFilters && (
                <Link href="/werkgevers" className="btn-primary mt-8">
                  Alle werkgevers bekijken
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <CtaBand />

      <Footer />
    </div>
  );
}
