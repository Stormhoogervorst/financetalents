-- ============================================================
-- Migration: Convert firms.cc_email (text) -> firms.cc_emails (text[])
--
-- The "Extra CC-e-mailadres" feature is now a dynamic list: each firm can
-- configure zero or more CC addresses that receive a copy of every
-- sollicitatie-e-mail. This migration:
--
--   1. Adds the new `cc_emails text[]` column (default empty array, NOT NULL).
--   2. Backfills it from the legacy singular `cc_email` column if that
--      column still exists and contains a non-empty value.
--   3. Drops the legacy `cc_email` column.
--
-- The migration is idempotent: safe to run multiple times. If the legacy
-- column was never created (older envs), steps 2+3 are simply skipped.
-- ============================================================

ALTER TABLE public.firms
  ADD COLUMN IF NOT EXISTS cc_emails text[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'firms'
      AND column_name = 'cc_email'
  ) THEN
    -- Backfill only rows where cc_emails is still empty, to make the
    -- migration safe to re-run without clobbering newer writes.
    UPDATE public.firms
       SET cc_emails = ARRAY[cc_email]
     WHERE cc_email IS NOT NULL
       AND btrim(cc_email) <> ''
       AND (cc_emails IS NULL OR array_length(cc_emails, 1) IS NULL);

    ALTER TABLE public.firms DROP COLUMN cc_email;
  END IF;
END
$$;

COMMENT ON COLUMN public.firms.cc_emails IS
  'Optionele lijst met extra CC-adressen die een kopie van elke sollicitatie-e-mail ontvangen.';
