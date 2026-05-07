import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import NavbarPublic from "@/components/NavbarPublic";
import Footer from "@/components/Footer";
import RadiusSelect from "@/components/RadiusSelect";
import { geocodeCity } from "@/lib/geocode";
import { ArrowUpRight, ChevronDown, MapPin, Users } from "lucide-react";
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
  title: "Companies",
  description:
    "Browse all finance companies actively hiring on Finance Talents — from boutique investment firms to global corporates.",
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

  const filterParts: string[] = [];
  if (params.rechtsgebied) filterParts.push(params.rechtsgebied);
  if (params.locatie) filterParts.push(params.locatie);
  const filterLabel = filterParts.length > 0 ? filterParts.join(" - ") : null;
  const headingText = filterLabel ? `${filterLabel} companies` : "Finance companies";
  const subtitleText = filterLabel
    ? `Browse finance companies matching ${filterLabel}.`
    : "Discover the funds, banks and builders hiring ambitious finance talent.";

  return (
    <div className="relative min-h-screen flex flex-col bg-[#EBEBEB] text-[#222222]">
      <NavbarPublic variant="hero" />

      <div className="-mt-[4.25rem]">
        <section className="relative isolate overflow-hidden bg-[#EBEBEB]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-[22vw] top-[10vh] h-[58vw] max-h-[760px] min-h-[340px] w-[58vw] min-w-[340px] max-w-[760px] overflow-hidden rounded-full border border-[#222222]/10"
          >
            <Image
              src="/icon FT.png"
              alt=""
              fill
              className="object-contain opacity-[0.16]"
              sizes="58vw"
              priority
            />
          </div>

          <div
            className="max-w-[1600px] mx-auto relative"
            style={{
              padding:
                "calc(4.25rem + clamp(48px, 8vh, 110px)) clamp(24px, 5vw, 80px) clamp(48px, 8vh, 110px)",
            }}
          >
            <div className="grid min-h-[calc(72vh-4.25rem)] grid-cols-1 content-between gap-12">
              <div>
                <p className="ft-display text-[15px] font-normal tracking-[-0.02em] text-[#222222]/70 md:text-[18px]">
                  Elite finance jobs. One platform.
                </p>
                <h1 className="ft-display mt-8 max-w-[12ch] text-[clamp(64px,14vw,220px)] font-extrabold leading-[0.82] tracking-[-0.08em] text-[#222222]">
                  {headingText}
                </h1>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-5 lg:col-start-8">
                  <p className="max-w-[560px] text-[clamp(18px,2vw,28px)] leading-[1.15] tracking-[-0.03em] text-[#222222]">
                    {subtitleText}
                  </p>
                  <p className="mt-5 max-w-[460px] text-[15px] leading-[1.65] text-[#222222]/60">
                    Filter by city, radius and sector. Open a company profile to
                    explore active roles and apply directly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        className="bg-[#EBEBEB]"
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(36px, 5vh, 72px)",
          paddingBottom: "clamp(56px, 8vh, 110px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <form method="GET">
            <div className="grid grid-cols-1 border border-[#222222] bg-[#EBEBEB] md:grid-cols-2 xl:grid-cols-[minmax(240px,1.4fr)_minmax(96px,0.45fr)_minmax(190px,0.9fr)_auto]">
              <label
                htmlFor="filter-locatie"
                className="flex min-h-[72px] items-center gap-3 border-b border-[#222222] bg-white px-5 md:border-r xl:border-b-0"
              >
                <MapPin className="h-4 w-4 shrink-0 text-[#222222]/55" />
                <input
                  id="filter-locatie"
                  name="locatie"
                  defaultValue={params.locatie ?? ""}
                  placeholder="Location"
                  className="w-full border-none bg-transparent text-[15px] text-[#222222] outline-none placeholder:text-[#222222]/45 focus:outline-none"
                />
              </label>

              <div className="flex min-h-[72px] items-center border-b border-[#222222] bg-white px-5 md:border-r xl:border-b-0">
                <RadiusSelect
                  name="straal"
                  defaultValue={params.straal ?? "0"}
                  locationInputId="filter-locatie"
                  className="w-full appearance-none border-none bg-transparent py-3 pr-6 text-[14px] text-[#222222] outline-none focus:outline-none"
                />
              </div>

              <label
                htmlFor="filter-rechtsgebied"
                className="relative flex min-h-[72px] items-center border-b border-[#222222] bg-white px-5 md:border-b-0 md:border-r xl:border-b-0"
              >
                <select
                  id="filter-rechtsgebied"
                  name="rechtsgebied"
                  defaultValue={params.rechtsgebied ?? ""}
                  className="w-full appearance-none border-none bg-transparent py-3 pr-7 text-[14px] text-[#222222] outline-none focus:outline-none"
                >
                  <option value="">All sectors</option>
                  {RECHTSGEBIEDEN.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-5 h-4 w-4 text-[#222222]/55" />
              </label>

              <button
                type="submit"
                className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-none bg-[#222222] px-7 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[#E85A00] focus:outline-none focus:ring-2 focus:ring-[#E85A00]/30"
              >
                Apply filters
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>

            {hasFilters && (
              <div className="mt-5">
                <Link
                  href="/werkgevers"
                  className="inline-flex text-[14px] font-medium text-[#222222]/65 underline decoration-[#222222]/25 underline-offset-4 transition-colors duration-200 hover:text-[#E85A00]"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </form>
        </div>
      </section>

      <section
        style={{
          paddingLeft: "clamp(24px, 5vw, 80px)",
          paddingRight: "clamp(24px, 5vw, 80px)",
          paddingTop: "clamp(70px, 9vh, 140px)",
          paddingBottom: "clamp(80px, 10vh, 150px)",
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-10 grid grid-cols-1 gap-8 md:mb-16 lg:grid-cols-12 lg:items-end">
            <h2 className="ft-display lg:col-span-8 text-[clamp(54px,9vw,132px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
              Company profiles.
            </h2>
            <div className="lg:col-span-4">
              <p className="max-w-[390px] text-[17px] leading-[1.45] tracking-[-0.02em] text-[#222222]/65">
                {firmList.length === 0
                  ? "No matching companies right now."
                  : `Showing ${firmList.length} matching compan${
                      firmList.length !== 1 ? "ies" : "y"
                    }.`}
              </p>
            </div>
          </div>

          {firmList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {firmList.map((firm) => {
                const initials = firm.name.slice(0, 2).toUpperCase();
                const primaryArea = firm.practice_areas?.[0] ?? "Company";

                return (
                  <Link
                    key={firm.id}
                    href={`/werkgevers/${firm.slug}`}
                    className="group relative flex min-h-[320px] flex-col border border-[#222222] bg-white p-5 transition-colors duration-200 hover:bg-[#0A0A0A]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span className="max-w-[13rem] text-[12px] font-medium leading-[1.25] text-[#222222]/60 transition-colors duration-200 group-hover:text-white/55">
                        {primaryArea}
                      </span>
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden border border-[#222222] bg-white p-2 transition-colors duration-200 group-hover:border-white/20">
                        {firm.logo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={firm.logo_url}
                            alt={`${firm.name} logo`}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-[14px] font-bold text-[#222222]">
                            {initials}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <h3 className="ft-display text-[clamp(24px,2vw,34px)] font-bold leading-[0.98] tracking-[-0.055em] text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]">
                        {firm.name}
                      </h3>

                      <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 border-t border-[#222222]/15 pt-4 transition-colors duration-200 group-hover:border-white/15">
                        {firm.location && (
                          <span className="flex items-center gap-1 text-[12px] text-[#222222]/55 transition-colors duration-200 group-hover:text-white/55">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {firm.location}
                          </span>
                        )}
                        {firm.team_size && (
                          <span className="flex items-center gap-1 text-[12px] text-[#222222]/55 transition-colors duration-200 group-hover:text-white/55">
                            <Users className="h-3 w-3 shrink-0" />
                            {firm.team_size} employees
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowUpRight className="absolute bottom-5 right-5 h-5 w-5 text-[#222222] transition-colors duration-200 group-hover:text-[#E85A00]" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 border border-[#222222] bg-white lg:grid-cols-12">
              <div className="p-6 md:p-8 lg:col-span-7">
                <h2 className="ft-display max-w-[720px] text-[clamp(42px,7vw,104px)] font-extrabold leading-[0.9] tracking-[-0.075em] text-[#222222]">
                  {hasFilters ? "No companies found." : "Coming soon."}
                </h2>
              </div>
              <div className="border-t border-[#222222] p-6 md:p-8 lg:col-span-5 lg:border-l lg:border-t-0">
                <p className="max-w-[460px] text-[16px] leading-[1.65] text-[#222222]/65">
                  {hasFilters
                    ? "Try another sector or city to uncover more company profiles."
                    : "No published companies at the moment. Check back soon for new profiles."}
                </p>
                {hasFilters && (
                  <Link href="/werkgevers" className="btn-primary mt-8">
                    View all companies
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        className="relative isolate overflow-hidden bg-[#0A0A0A]"
        style={{
          padding: "clamp(80px, 10vh, 160px) clamp(24px, 5vw, 80px)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[18vw] top-1/2 -z-10 h-[58vw] max-h-[720px] min-h-[340px] w-[58vw] min-w-[340px] max-w-[720px] -translate-y-1/2 overflow-hidden rounded-full border border-white/15"
        >
          <Image
            src="/icon FT.png"
            alt=""
            fill
            className="object-contain opacity-[0.34]"
            sizes="58vw"
          />
        </div>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <h2 className="ft-display lg:col-span-8 text-[clamp(54px,9vw,142px)] font-extrabold leading-[0.88] tracking-[-0.075em] text-white">
            Find the firm that fits.
          </h2>
          <div className="lg:col-span-4">
            <p className="max-w-[460px] text-[18px] leading-[1.45] tracking-[-0.02em] text-white/70">
              Compare company profiles, browse live finance roles and apply
              directly when the match is clear.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-[14px] font-medium text-[#222222] transition-colors duration-200 hover:bg-[#E85A00] hover:text-white"
              >
                Post a job
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
