# VacancyHub

A full-stack vacancy platform built with **Next.js 15**, **Supabase**, and **Tailwind CSS**.

## Features

- **Job seekers** — browse/search vacancies, apply with a cover letter, track application status
- **Employers** — post & manage vacancies, review applications, update applicant status
- **Admin panel** — manage all users and vacancies
- **Auth** — Supabase email/password authentication with role-based access

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Auth & DB | Supabase |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Icons | Lucide React |

## Getting started

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the schema

In your Supabase dashboard → **SQL Editor**, paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase project URL and anon key (found in **Project Settings → API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the dev server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roles

| Role | How to get it |
|------|--------------|
| `job_seeker` | Default when registering |
| `employer` | Select "Employer" during registration |
| `admin` | Manually set `role = 'admin'` in the `profiles` table |

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home / landing
│   ├── vacancies/            # Browse & detail pages
│   ├── auth/                 # Login & register
│   ├── dashboard/            # Employer dashboard
│   └── admin/                # Admin panel
├── components/               # Shared UI components
├── lib/
│   ├── supabase/             # Client & server Supabase helpers
│   └── utils.ts              # Utilities & formatters
└── types/                    # TypeScript types
supabase/
└── schema.sql                # Full database schema with RLS policies
```
