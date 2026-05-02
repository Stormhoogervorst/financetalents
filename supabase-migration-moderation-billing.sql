-- ─────────────────────────────────────────────────────────────────────────────
-- Moderatie + verdienmodel per werkgever
-- ─────────────────────────────────────────────────────────────────────────────
-- Doel:
--   1. Per werkgever (public.firms) een accountstatus, een verdienmodel en
--      een vrij notitieveld voor de Super Admin kunnen bijhouden.
--   2. Per vacature (public.jobs) een moderatie-flow toevoegen, met een
--      optionele afwijzingsreden en een markering voor vacatures die door
--      de admin zelf zijn geplaatst.
--
-- Ontwerpkeuzes:
--   - Tekstvelden met CHECK-constraints i.p.v. echte enums. Dat sluit aan
--     bij hoe bestaande velden (zoals jobs.status) in deze DB zijn gemodelleerd
--     en laat toekomstige waarden toevoegen zonder `ALTER TYPE`-dans.
--   - Alles in snake_case, consistent met de rest van het schema.
--   - Idempotent: `ADD COLUMN IF NOT EXISTS` + drop/create op de constraints,
--     zodat dit script veilig meerdere keren uitgevoerd kan worden.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── firms ────────────────────────────────────────────────────────────────────

alter table public.firms
  add column if not exists status        text    not null default 'TRIAL',
  add column if not exists billing_model text    not null default 'SUBSCRIPTION',
  add column if not exists admin_notes   text;

alter table public.firms
  drop constraint if exists firms_status_check;

alter table public.firms
  add constraint firms_status_check
  check (status in ('TRIAL', 'ACTIVE', 'BLOCKED'));

alter table public.firms
  drop constraint if exists firms_billing_model_check;

alter table public.firms
  add constraint firms_billing_model_check
  check (billing_model in ('CREDITS', 'SUBSCRIPTION', 'COMMISSION'));

-- Handig voor admin-filters als het aantal werkgevers groeit.
create index if not exists firms_status_idx        on public.firms (status);
create index if not exists firms_billing_model_idx on public.firms (billing_model);

-- ── jobs ─────────────────────────────────────────────────────────────────────

alter table public.jobs
  add column if not exists moderation_status text    not null default 'APPROVED',
  add column if not exists rejection_reason  text,
  add column if not exists posted_by_admin   boolean not null default false;

alter table public.jobs
  drop constraint if exists jobs_moderation_status_check;

alter table public.jobs
  add constraint jobs_moderation_status_check
  check (moderation_status in ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED'));

-- Queue voor de admin (IN_REVIEW/REJECTED eerst vinden) is met een simpele
-- index op moderation_status al ruim snel genoeg bij honderden tot duizenden
-- vacatures.
create index if not exists jobs_moderation_status_idx on public.jobs (moderation_status);

-- Verificatie (optioneel):
-- select column_name, data_type, column_default
--   from information_schema.columns
--  where table_schema = 'public'
--    and table_name in ('firms', 'jobs')
--    and column_name in (
--      'status', 'billing_model', 'admin_notes',
--      'moderation_status', 'rejection_reason', 'posted_by_admin'
--    )
--  order by table_name, column_name;
