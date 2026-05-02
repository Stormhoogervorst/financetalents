-- Voegt expires_at toe aan jobs voor schema.org/JobPosting validThrough.
-- Nieuwe jobs krijgen via DEFAULT automatisch now() + 60 dagen.
-- Bestaande rijen worden retroactief gevuld met created_at + 60 dagen.
--
-- HOE TE RUNNEN:
--   Supabase Dashboard → SQL Editor → nieuwe query → plak deze file → Run.
--   Of via CLI: supabase db execute -f supabase-migration-job-expires-at.sql

BEGIN;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS expires_at timestamptz
  DEFAULT (now() + interval '60 days');

UPDATE public.jobs
   SET expires_at = created_at + interval '60 days'
 WHERE expires_at IS NULL;

COMMIT;
