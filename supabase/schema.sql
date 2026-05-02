-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create type user_role as enum ('job_seeker', 'employer', 'admin');

create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  full_name       text,
  role            user_role not null default 'job_seeker',
  company_name    text,
  company_logo_url text,
  created_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, company_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'job_seeker'),
    new.raw_user_meta_data->>'company_name'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- VACANCIES
-- ─────────────────────────────────────────────
create type employment_type  as enum ('full_time', 'part_time', 'contract', 'internship', 'freelance');
create type experience_level as enum ('entry', 'mid', 'senior', 'lead', 'executive');
create type vacancy_status   as enum ('open', 'closed', 'draft');

create table public.vacancies (
  id               uuid primary key default uuid_generate_v4(),
  employer_id      uuid not null references public.profiles(id) on delete cascade,
  title            text not null,
  company_name     text not null,
  company_logo_url text,
  location         text not null,
  remote           boolean not null default false,
  employment_type  employment_type not null default 'full_time',
  experience_level experience_level not null default 'mid',
  salary_min       numeric,
  salary_max       numeric,
  salary_currency  text not null default 'EUR',
  description      text not null,
  requirements     text not null default '',
  status           vacancy_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.vacancies enable row level security;

create policy "Open vacancies are viewable by everyone"
  on public.vacancies for select
  using (status = 'open' or auth.uid() = employer_id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Employers can insert own vacancies"
  on public.vacancies for insert
  with check (auth.uid() = employer_id);

create policy "Employers can update own vacancies"
  on public.vacancies for update
  using (auth.uid() = employer_id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Employers or admin can delete vacancies"
  on public.vacancies for delete
  using (auth.uid() = employer_id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger vacancies_updated_at
  before update on public.vacancies
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- APPLICATIONS
-- ─────────────────────────────────────────────
create type application_status as enum ('pending', 'reviewing', 'interview', 'rejected', 'accepted');

create table public.applications (
  id           uuid primary key default uuid_generate_v4(),
  vacancy_id   uuid not null references public.vacancies(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text,
  status       application_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (vacancy_id, applicant_id)
);

alter table public.applications enable row level security;

create policy "Applicants can view own applications"
  on public.applications for select
  using (
    auth.uid() = applicant_id
    or exists (
      select 1 from public.vacancies v
      where v.id = vacancy_id and v.employer_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Job seekers can apply"
  on public.applications for insert
  with check (auth.uid() = applicant_id);

create policy "Employers or admins can update application status"
  on public.applications for update
  using (
    exists (
      select 1 from public.vacancies v
      where v.id = vacancy_id and v.employer_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create trigger applications_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────
create index vacancies_employer_id_idx on public.vacancies (employer_id);
create index vacancies_status_idx on public.vacancies (status);
create index applications_vacancy_id_idx on public.applications (vacancy_id);
create index applications_applicant_id_idx on public.applications (applicant_id);
