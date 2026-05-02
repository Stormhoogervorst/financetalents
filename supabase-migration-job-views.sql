-- Voegt een `views`-teller toe aan vacatures + een atomische RPC
-- om de teller veilig te verhogen zonder race-conditions of extra RLS-regels.

BEGIN;

-- 1. Kolom met default 0 voor bestaande rijen
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

-- 2. Snelle sort voor "Top 5 best bekeken"
CREATE INDEX IF NOT EXISTS jobs_views_idx ON public.jobs (views DESC);

-- 3. Atomische increment — SECURITY DEFINER zodat publieke bezoekers
--    zonder insert/update-rechten op `jobs` toch de teller mogen ophogen.
CREATE OR REPLACE FUNCTION public.increment_job_views(job_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.jobs
     SET views = COALESCE(views, 0) + 1
   WHERE id = job_id;
$$;

GRANT EXECUTE ON FUNCTION public.increment_job_views(uuid) TO anon, authenticated;

COMMIT;
