-- ─────────────────────────────────────────────────────────────────────────────
-- Rollback van pre-moderatie + verdienmodel velden
-- ─────────────────────────────────────────────────────────────────────────────
-- Context:
--   De kolommen uit `supabase-migration-moderation-billing.sql` zijn niet
--   meer in gebruik. We zijn afgestapt van het pre-moderatie model
--   (vacatures gaan direct live) en het verdienmodel per werkgever wordt
--   niet langer in de DB bijgehouden. Deze kolommen zouden alleen nog
--   verwarring scheppen.
--
-- Wat blijft:
--   - `jobs.posted_by_admin` blijft bestaan: die wordt nog steeds gezet
--     vanuit de admin-impersonatie-flow in `POST /api/jobs` en is nuttig
--     voor audits.
--
-- Ontwerpkeuzes:
--   - Idempotent: `DROP ... IF EXISTS` op constraints, indexes en kolommen.
--   - Expliciet eerst constraints/indexes droppen vóór de kolom zelf,
--     ook al zou Postgres dit met CASCADE kunnen — dat maakt reviewen
--     makkelijker en voorkomt verrassingen.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── jobs ─────────────────────────────────────────────────────────────────────

drop index if exists public.jobs_moderation_status_idx;

alter table public.jobs
  drop constraint if exists jobs_moderation_status_check;

alter table public.jobs
  drop column if exists moderation_status,
  drop column if exists rejection_reason;

-- ── firms ────────────────────────────────────────────────────────────────────

drop index if exists public.firms_status_idx;
drop index if exists public.firms_billing_model_idx;

alter table public.firms
  drop constraint if exists firms_status_check,
  drop constraint if exists firms_billing_model_check;

alter table public.firms
  drop column if exists status,
  drop column if exists billing_model,
  drop column if exists admin_notes;

-- Verificatie (optioneel):
-- select column_name
--   from information_schema.columns
--  where table_schema = 'public'
--    and table_name in ('firms', 'jobs')
--    and column_name in (
--      'status', 'billing_model', 'admin_notes',
--      'moderation_status', 'rejection_reason'
--    );
-- → zou 0 rijen moeten opleveren.
