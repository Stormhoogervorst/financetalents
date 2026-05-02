-- ─────────────────────────────────────────────────────────────────────────────
-- Account deletion — verify ON DELETE CASCADE chain
-- ─────────────────────────────────────────────────────────────────────────────
-- Doel: als een auth.users-rij wordt verwijderd (via supabase.auth.admin.deleteUser),
-- moet alle gekoppelde data automatisch opgeruimd worden. Dit script verifieert
-- en forceert de cascade-chain, zodat een toekomstige handmatige wijziging deze
-- niet stilletjes kan breken.
--
-- Keten:
--   auth.users
--     └─► public.profiles           (on delete cascade)
--     └─► public.firms              (on delete cascade)
--           └─► public.jobs         (on delete cascade)
--                 └─► public.applications  (on delete cascade via job_id)
--           └─► public.applications (on delete cascade via firm_id)
--           └─► public.blogs        (on delete cascade)
--           └─► public.invitations  (on delete cascade)
--
-- Idempotent: DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT.
-- ─────────────────────────────────────────────────────────────────────────────

-- profiles.id -> auth.users(id)
alter table public.profiles
  drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

-- firms.user_id -> auth.users(id)
alter table public.firms
  drop constraint if exists firms_user_id_fkey;
alter table public.firms
  add constraint firms_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- jobs.firm_id -> firms(id)
alter table public.jobs
  drop constraint if exists jobs_firm_id_fkey;
alter table public.jobs
  add constraint jobs_firm_id_fkey
  foreign key (firm_id) references public.firms(id) on delete cascade;

-- applications.job_id -> jobs(id)
alter table public.applications
  drop constraint if exists applications_job_id_fkey;
alter table public.applications
  add constraint applications_job_id_fkey
  foreign key (job_id) references public.jobs(id) on delete cascade;

-- applications.firm_id -> firms(id)
alter table public.applications
  drop constraint if exists applications_firm_id_fkey;
alter table public.applications
  add constraint applications_firm_id_fkey
  foreign key (firm_id) references public.firms(id) on delete cascade;

-- blogs.firm_id -> firms(id)
alter table public.blogs
  drop constraint if exists blogs_firm_id_fkey;
alter table public.blogs
  add constraint blogs_firm_id_fkey
  foreign key (firm_id) references public.firms(id) on delete cascade;

-- invitations.firm_id -> firms(id)
alter table public.invitations
  drop constraint if exists invitations_firm_id_fkey;
alter table public.invitations
  add constraint invitations_firm_id_fkey
  foreign key (firm_id) references public.firms(id) on delete cascade;
