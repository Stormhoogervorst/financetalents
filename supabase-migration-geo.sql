-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add latitude / longitude columns
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS latitude  double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

ALTER TABLE public.vacancies
  ADD COLUMN IF NOT EXISTS latitude  double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Partial indexes — only rows that have coordinates
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS jobs_lat_lng_idx
  ON public.jobs (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS vacancies_lat_lng_idx
  ON public.vacancies (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RPC: get_jobs_in_radius  (Haversine)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_jobs_in_radius(
  lat double precision,
  lng double precision,
  radius_km double precision,
  job_status text DEFAULT 'active'
)
RETURNS SETOF public.jobs
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM public.jobs j
  WHERE j.status = job_status
    AND j.latitude IS NOT NULL
    AND j.longitude IS NOT NULL
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(lat)) * cos(radians(j.latitude))
          * cos(radians(j.longitude) - radians(lng))
          + sin(radians(lat)) * sin(radians(j.latitude))
        ))
      )
    ) <= radius_km
  ORDER BY
    (6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(lat)) * cos(radians(j.latitude))
        * cos(radians(j.longitude) - radians(lng))
        + sin(radians(lat)) * sin(radians(j.latitude))
      ))
    )) ASC;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RPC: get_vacancies_in_radius  (Haversine)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_vacancies_in_radius(
  lat double precision,
  lng double precision,
  radius_km double precision,
  vacancy_status text DEFAULT 'open'
)
RETURNS SETOF public.vacancies
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM public.vacancies v
  WHERE v.status::text = vacancy_status
    AND v.latitude IS NOT NULL
    AND v.longitude IS NOT NULL
    AND (
      6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(lat)) * cos(radians(v.latitude))
          * cos(radians(v.longitude) - radians(lng))
          + sin(radians(lat)) * sin(radians(v.latitude))
        ))
      )
    ) <= radius_km
  ORDER BY
    (6371 * acos(
      LEAST(1.0, GREATEST(-1.0,
        cos(radians(lat)) * cos(radians(v.latitude))
        * cos(radians(v.longitude) - radians(lng))
        + sin(radians(lat)) * sin(radians(v.latitude))
      ))
    )) ASC;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Drop the old names if they exist (cleanup from earlier migration)
-- ─────────────────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.nearby_jobs(double precision, double precision, double precision, text);
DROP FUNCTION IF EXISTS public.nearby_vacancies(double precision, double precision, double precision, text);
