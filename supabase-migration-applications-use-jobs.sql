-- Migration: make applications reference the current jobs table
--
-- The app's public vacancy detail pages use public.jobs, not the legacy
-- public.vacancies table. Keep legacy vacancy_id nullable for older code/data,
-- but make job_id the canonical foreign key used by application flows.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS job_id uuid;

UPDATE public.applications
SET job_id = COALESCE(job_id, vacancy_id)
WHERE job_id IS NULL;

ALTER TABLE public.applications
  ALTER COLUMN vacancy_id DROP NOT NULL;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_vacancy_id_fkey;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_vacancy_id_applicant_id_key;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE CASCADE;

ALTER TABLE public.applications
  ALTER COLUMN job_id SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS applications_job_applicant_unique
  ON public.applications (job_id, applicant_id);

CREATE INDEX IF NOT EXISTS applications_job_id_idx
  ON public.applications (job_id);
