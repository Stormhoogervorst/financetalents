/**
 * Centrale lijst met rechtsgebieden.
 *
 * Eén bron voor homepage-cards, filters, vacature-submit formulier,
 * werkgever-profiel en zod-validatie in de API. Wijzig NIETS in kopieën
 * elders — alles importeert uit dit bestand.
 *
 * Waarden worden als plain string opgeslagen in Supabase
 * (`jobs.practice_area` / `firms.practice_areas`). Er is géén Postgres
 * enum; afwijkende legacy-waardes (bv. "Onroerend goed") worden via een
 * eenmalige data-migratie omgezet — zie
 * `supabase-migration-rechtsgebieden-rename.sql`.
 */

export const RECHTSGEBIEDEN = [
  "Arbeidsrecht",
  "Bestuursrecht",
  "Erfrecht",
  "Europees recht",
  "Familierecht",
  "Financieel recht",
  "Fiscaal recht",
  "Huurrecht",
  "Insolventierecht",
  "Intellectueel eigendom",
  "IT-recht",
  "Mededingingsrecht",
  "Ondernemingsrecht",
  "Strafrecht",
  "Vastgoedrecht",
  "Verbintenissenrecht",
] as const;

export type Rechtsgebied = (typeof RECHTSGEBIEDEN)[number];

/**
 * Voor het vacature-submit formulier en het werkgever-profiel: zelfde
 * lijst + "Overig" als fallback. Zo kunnen werkgevers ook niches
 * aanduiden die (nog) niet op de kaart staan.
 */
export const RECHTSGEBIEDEN_MET_OVERIG = [
  ...RECHTSGEBIEDEN,
  "Overig",
] as const;

export type RechtsgebiedMetOverig = (typeof RECHTSGEBIEDEN_MET_OVERIG)[number];

/**
 * Slug voor URL-filters, bv. /vacatures?rechtsgebied=intellectueel-eigendom.
 * De bestaande filter in `/vacatures` matcht via case-insensitive ilike,
 * dus we hoeven alleen spaties te vervangen en te lowercasen.
 */
export const rechtsgebiedToSlug = (r: string) =>
  r.toLowerCase().replace(/ /g, "-");
