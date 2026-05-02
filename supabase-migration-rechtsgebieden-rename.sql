-- ─────────────────────────────────────────────────────────────────────────────
-- Rechtsgebieden: hernoem legacy-waardes naar de canonieke lijst
-- uit `src/lib/constants/rechtsgebieden.ts`.
--
--   "Onroerend goed"            → "Vastgoedrecht"
--   "Personen- en familierecht" → "Familierecht"
--
-- Raakt twee kolommen:
--   1. public.jobs.practice_area   (text, single value)
--   2. public.firms.practice_areas (text[], array)
--
-- Draaien:
--   Supabase Dashboard → SQL Editor → nieuwe query → plak en run.
--   Of via CLI: supabase db execute -f supabase-migration-rechtsgebieden-rename.sql
--
-- Script is idempotent: tweede keer draaien doet niets.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 0. DIAGNOSE (optioneel — run deze eerst apart om de impact te zien) ────
--
--   SELECT practice_area, count(*) AS jobs_count
--     FROM public.jobs
--    WHERE practice_area IN ('Onroerend goed', 'Personen- en familierecht')
--    GROUP BY practice_area;
--
--   SELECT id, name, practice_areas
--     FROM public.firms
--    WHERE practice_areas && ARRAY['Onroerend goed', 'Personen- en familierecht']::text[];
--
-- ─── 1. MIGRATIE ─────────────────────────────────────────────────────────────

BEGIN;

-- 1a. jobs.practice_area — scalar text
UPDATE public.jobs
   SET practice_area = 'Vastgoedrecht'
 WHERE practice_area = 'Onroerend goed';

UPDATE public.jobs
   SET practice_area = 'Familierecht'
 WHERE practice_area = 'Personen- en familierecht';

-- 1b. firms.practice_areas — text[] (array kan beide waardes bevatten,
--     en kan na rename een dubbel element hebben → deduplicate aan het eind)
UPDATE public.firms
   SET practice_areas = (
     SELECT array_agg(DISTINCT area ORDER BY area)
       FROM unnest(
         array_replace(
           array_replace(practice_areas, 'Onroerend goed', 'Vastgoedrecht'),
           'Personen- en familierecht', 'Familierecht'
         )
       ) AS area
   )
 WHERE practice_areas && ARRAY['Onroerend goed', 'Personen- en familierecht']::text[];

-- ─── 2. VERIFICATIE — moet 0 rijen opleveren na de migratie ──────────────────
DO $$
DECLARE
  legacy_jobs  integer;
  legacy_firms integer;
BEGIN
  SELECT count(*) INTO legacy_jobs
    FROM public.jobs
   WHERE practice_area IN ('Onroerend goed', 'Personen- en familierecht');

  SELECT count(*) INTO legacy_firms
    FROM public.firms
   WHERE practice_areas && ARRAY['Onroerend goed', 'Personen- en familierecht']::text[];

  IF legacy_jobs > 0 OR legacy_firms > 0 THEN
    RAISE EXCEPTION
      'Migratie mislukt: er staan nog legacy-waardes (jobs=%, firms=%).',
      legacy_jobs, legacy_firms;
  END IF;
END$$;

COMMIT;
