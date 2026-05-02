# Legal Talents — MVP Build Spec voor Cursor

> Dit document is de volledige bouwinstructie voor het MVP van legal-talents.nl. Het is bedoeld als context voor Cursor. Lees dit volledig door voordat je begint met bouwen.

---

## 1. Wat we bouwen

Een vacatureplatform voor juridische kantoren (advocaten & notarissen) waar:
- **Kantoren** zich registreren, een profiel aanmaken en vacatures plaatsen
- **Studenten** vacatures en kantoren kunnen bekijken en solliciteren — zonder account

Voorbeeldsite ter referentie: [legalhunt.nl](https://legalhunt.nl)

---

## 2. Stijlgids

> Volg deze stijlgids strikt voor alle pagina's en componenten. Niet afwijken.

### Kleuren

```css
/* Primaire merkkleur — uit het Legal Talents logo */
--color-primary: #6B7BF7;        /* Paars-blauw — hoofdkleur knoppen, accenten, links */
--color-primary-dark: #4F5FD6;   /* Hover state knoppen */
--color-primary-light: #EEF0FE;  /* Lichte achtergrond, tags, badges */

/* Neutrale kleuren */
--color-black: #0F0F0F;          /* Hoofdtekst, titels */
--color-grey-dark: #4B5563;      /* Subtekst, labels */
--color-grey-mid: #9CA3AF;       /* Placeholder tekst, iconen */
--color-grey-light: #F3F4F6;     /* Kaart achtergronden, inputs */
--color-white: #FFFFFF;

/* Statuskleur */
--color-success: #10B981;        /* Actief badge */
--color-warning: #F59E0B;        /* Concept badge */
--color-error: #EF4444;          /* Gesloten badge, foutmeldingen */
```

In Tailwind config (`tailwind.config.ts`):

```typescript
colors: {
  primary: {
    DEFAULT: '#6B7BF7',
    dark: '#4F5FD6',
    light: '#EEF0FE',
  }
}
```

### Typografie

Het logo gebruikt een **bold italic sans-serif** — gebruik **Inter** als websitelettertype (gratis via Google Fonts, dichtst bij het logo).

```html
<!-- In layout.tsx -->
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })
```

Typografische schaal:

| Element | Klasse |
|---|---|
| Paginatitel (H1) | `text-4xl font-extrabold italic text-black` |
| Sectietitel (H2) | `text-2xl font-bold text-black` |
| Kaarttitel | `text-lg font-semibold text-black` |
| Bodytekst | `text-base font-normal text-gray-700` |
| Subtekst / label | `text-sm text-gray-500` |
| Knoptekst | `text-sm font-semibold` |

### Knoppen

```tsx
/* Primaire knop */
<button className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
  Vacature plaatsen
</button>

/* Secundaire knop (outline) */
<button className="border border-primary text-primary hover:bg-primary-light text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
  Meer info
</button>

/* Ghost knop */
<button className="text-primary hover:underline text-sm font-semibold">
  Bekijk alle kantoren →
</button>
```

### Kaarten (JobCard / FirmCard)

```tsx
<div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary transition-all cursor-pointer">
  {/* content */}
</div>
```

### Inputs & Formulieren

```tsx
<input className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />

<label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
```

### Navigatie (publiek)

- Achtergrond: `white` met `border-b border-gray-100 shadow-sm`
- Logo: "Legal Talents." in `font-extrabold italic text-primary text-xl`
- Links: `text-sm font-medium text-gray-600 hover:text-primary`
- CTA rechts: primaire knop "Kantoor aanmelden"

### Navigatie (portal)

- Sidebar op desktop, bottom nav op mobiel
- Actieve pagina: `bg-primary-light text-primary font-semibold`
- Inactief: `text-gray-600 hover:text-primary`

### Badges / Status

```tsx
/* Actief */
<span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Actief</span>

/* Concept */
<span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">Concept</span>

/* Gesloten */
<span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">Gesloten</span>

/* Rechtsgebied tag */
<span className="bg-primary-light text-primary text-xs font-medium px-2.5 py-1 rounded-full">Arbeidsrecht</span>
```

### Layout & Spacing

- Max breedte content: `max-w-6xl mx-auto px-4 sm:px-6`
- Sectie padding: `py-16` (desktop), `py-10` (mobiel)
- Kaarten grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5`
- Formulieren: `max-w-lg mx-auto` (auth), `max-w-2xl` (portal forms)

### Homepage Hero (geïnspireerd op werkzoeken.nl)

De hero heeft:
- Volle breedte achtergrond in `bg-primary` (paars-blauw)
- Grote witte italic H1: "Vind jouw stage of baan in de juridische wereld."
- Witte subtekst
- Prominente zoekbalk op witte achtergrond met slagschaduw, met twee velden: "Wat" (functie/rechtsgebied) en "Waar" (stad) + blauwe zoekknop
- Onder de hero: witte balk met 3 trust-stats: "X kantoren", "Y vacatures", "Solliciteer zonder account"

### Algemene ontwerpregels

1. Gebruik **altijd** `rounded-lg` of `rounded-xl` — nooit scherpe hoeken
2. Hover states altijd met `transition-all` of `transition-colors`
3. Geen zware schaduwen — gebruik `shadow-sm` of `shadow-md` maximaal
4. Wit is de standaard achtergrond; gebruik `bg-gray-50` voor sectieafwisseling
5. Iconen: gebruik **Lucide React** (`npm install lucide-react`)
6. Mobiel-eerst — alle pagina's moeten werken op 375px breedte

---

## 3. Tech Stack

| Onderdeel | Keuze | Reden |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SEO-vriendelijk, goed gedocumenteerd |
| Database + Auth | **Supabase** | Auth, database én file storage in één |
| Email | **Resend** | Simpelste manier voor transactionele mail met bijlagen |
| Styling | **Tailwind CSS** | Snel, geen aparte CSS-bestanden |
| Hosting | **Vercel** | Gratis tier, directe Next.js-integratie |
| Rich text editor | **Tiptap** (of React Quill) | Voor vacaturebeschrijvingen |

---

## 3. Projectstructuur

```
legal-talents/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Homepage
│   │   ├── firms/
│   │   │   ├── page.tsx              # Overzicht alle kantoren
│   │   │   └── [slug]/page.tsx       # Kantoorpagina
│   │   └── jobs/
│   │       ├── page.tsx              # Overzicht alle vacatures
│   │       └── [slug]/page.tsx       # Vacaturepagina + sollicitatieformulier
│   ├── (auth)/
│   │   ├── register/page.tsx
│   │   ├── login/page.tsx
│   │   └── verify/page.tsx
│   ├── portal/                       # Beschermd — alleen voor ingelogde kantoren
│   │   ├── layout.tsx                # Auth guard
│   │   ├── page.tsx                  # Dashboard
│   │   ├── profile/page.tsx
│   │   ├── jobs/
│   │   │   ├── page.tsx              # Vacature overzicht
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── apply/route.ts            # Sollicitatie verwerken + mail sturen
│       └── auth/callback/route.ts    # Supabase auth callback
├── components/
│   ├── ui/                           # Herbruikbare UI-componenten
│   ├── JobCard.tsx
│   ├── FirmCard.tsx
│   └── ApplicationForm.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── resend.ts
└── types/
    └── index.ts
```

---

## 4. Database Schema (Supabase)

Maak deze tabellen aan in Supabase via de SQL editor.

```sql
-- Kantoren
create table firms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  contact_person text,
  notification_email text not null,
  cc_email text,
  phone text,
  location text,
  practice_areas text[],          -- bijv. ['corporate', 'family', 'real_estate']
  description text,               -- max 300 woorden
  why_work_with_us text,
  team_size text,                 -- '1-10', '11-50', '51-200', '200+'
  website_url text,
  linkedin_url text,
  salary_indication text,
  logo_url text,                  -- Supabase Storage URL
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Vacatures
create table jobs (
  id uuid primary key default gen_random_uuid(),
  firm_id uuid references firms(id) on delete cascade,
  title text not null,
  slug text unique not null,
  location text not null,
  type text not null,             -- 'full-time', 'part-time', 'internship', 'student'
  practice_area text not null,
  description text not null,     -- rich text (HTML opgeslagen als string)
  salary_indication text,
  start_date date,
  required_education text,
  hours_per_week int,
  status text default 'draft',   -- 'draft', 'active', 'closed'
  notification_email_override text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Sollicitaties (alleen voor logging/dashboard-teller — echte data gaat per mail)
create table applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references jobs(id) on delete cascade,
  firm_id uuid references firms(id) on delete cascade,
  applicant_name text not null,
  applicant_email text not null,
  applicant_phone text,
  university text,
  study_field text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table firms enable row level security;
alter table jobs enable row level security;
alter table applications enable row level security;

-- Policies: kantoor kan alleen eigen data zien/bewerken
create policy "Firms: eigen data" on firms
  for all using (auth.uid() = user_id);

create policy "Jobs: eigen data" on jobs
  for all using (
    firm_id in (select id from firms where user_id = auth.uid())
  );

-- Publiek leesbaar voor published firms en active jobs
create policy "Firms: publiek leesbaar" on firms
  for select using (is_published = true);

create policy "Jobs: publiek leesbaar" on jobs
  for select using (status = 'active');
```

---

## 5. Supabase Storage

Maak twee buckets aan in Supabase Storage:
- `logos` — publiek, voor kantoorlogo's (max 2MB, alleen jpg/png)
- `cvs` — privé, voor CV-uploads van sollicitanten (max 5MB, alleen pdf)

---

## 6. Authenticatie

Gebruik Supabase Auth (email + wachtwoord). Flow:

1. Kantoor registreert → Supabase stuurt verificatiemail automatisch
2. Na verificatie → redirect naar `/portal`
3. Bij eerste login: check of `firms` record bestaat voor deze `user_id`. Zo niet → redirect naar `/portal/profile` om profiel aan te maken
4. Auth guard in `portal/layout.tsx`: check session, redirect naar `/login` als niet ingelogd

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}
```

---

## 7. Registratie & Login

### Registratiepagina (`/register`)
Formuliervelden:
- Naam kantoor
- Contactpersoon (voornaam + achternaam)
- E-mailadres (wordt login + standaard notificatie-email)
- Wachtwoord
- Telefoonnummer

Na submit: `supabase.auth.signUp()` → gebruiker krijgt verificatiemail → toon melding "Check je inbox".

### Loginpagina (`/login`)
- E-mail + wachtwoord
- Link naar `/register`
- "Wachtwoord vergeten" → Supabase built-in reset flow

---

## 8. Portal — Kantoor Dashboard (`/portal`)

Na inloggen ziet het kantoor:

- Welkomstbericht met kантоornaam
- **Snelstatistieken** (3 kaartjes):
  - Actieve vacatures (count uit `jobs` tabel)
  - Sollicitaties deze maand (count uit `applications` tabel)
  - Profiel compleet? (ja/nee check op required fields)
- **Recente sollicitaties**: laatste 5 uit `applications` tabel (naam + vacaturetitel + datum)
- **CTA**: "Profiel aanvullen" als profiel nog niet volledig is, of "Nieuwe vacature plaatsen"

### Navigatie portal
- Dashboard
- Mijn profiel
- Vacatures
- Instellingen

---

## 9. Kantoorprofiel (`/portal/profile`)

### Verplichte velden (profiel wordt niet gepubliceerd zonder deze):
- Naam kantoor
- Vestigingsplaats
- Rechtsgebieden (multi-select uit vaste lijst)
- Korte omschrijving (max 300 woorden)
- Contactpersoon platform
- Notificatie-emailadres

### Optionele velden:
- Logo (upload naar Supabase Storage `logos` bucket)
- Teamgrootte (dropdown: 1–10 / 11–50 / 51–200 / 200+)
- "Waarom bij ons werken?" (vrije tekst)
- Website URL
- LinkedIn URL
- Salarisindicatie

### Vaste lijst rechtsgebieden:
```
Arbeidsrecht, Bestuursrecht, Erfrecht, Familierecht, Intellectueel eigendom,
IT-recht, Ondernemingsrecht, Onroerend goed, Personen- en familierecht,
Strafrecht, Vastgoedrecht, Verbintenissenrecht, Overig
```

### Publicatie-logica:
Zodra alle verplichte velden zijn ingevuld én opgeslagen → `is_published = true` → profiel is zichtbaar op publieke site. Toon duidelijk in de UI of het profiel live is of niet.

---

## 10. Vacaturebeheer (`/portal/jobs`)

### Overzicht
Tabel met alle vacatures van dit kantoor:
- Titel
- Status (badge: Concept / Actief / Gesloten)
- Aangemaakt op
- Aantal sollicitaties (count uit `applications`)
- Acties: Bewerken / Dupliceren / Verwijderen / Status wijzigen

### Vacature aanmaken/bewerken

**Verplichte velden:**
- Vacaturetitel
- Vestigingsplaats
- Type: Voltijd / Deeltijd / Stage / Studentbaan
- Rechtsgebied (select uit vaste lijst)
- Beschrijving (rich text editor — bold, italic, bullet points)

**Optionele velden:**
- Salarisindicatie
- Startdatum
- Vereiste opleiding / studierichting
- Uren per week

**Statusbeheer:**
- Opslaan als concept → `status = 'draft'`
- Publiceren → `status = 'active'`
- Handmatig sluiten → `status = 'closed'`

> ⚠️ **Geen automatisch sluiten op datum in MVP** — kantoor sluit handmatig.

### Slug generatie:
```typescript
const slug = `${firmSlug}-${title.toLowerCase().replace(/\s+/g, '-')}-${nanoid(6)}`
```

---

## 11. Instellingen (`/portal/settings`)

- Wachtwoord wijzigen (via Supabase Auth)
- Primair notificatie-emailadres wijzigen
- Extra CC-emailadres toevoegen (optioneel)

---

## 12. Sollicitatieflow

### Sollicitatieformulier (op `/jobs/[slug]`)

Student vult in — **geen account nodig**:
- Voornaam + achternaam
- E-mailadres
- Telefoonnummer
- Universiteit (vrij tekstveld in MVP)
- Studierichting
- Motivatie (vrije tekst, max 500 woorden)
- CV upload (PDF, max 5MB)

### Verwerking via API Route (`/api/apply`)

```
POST /api/apply
Content-Type: multipart/form-data
```

Stappen in de API route:
1. Valideer formulierdata
2. Upload CV naar Supabase Storage (`cvs` bucket) → krijg URL
3. Sla sollicitatie op in `applications` tabel (zonder CV-data, want die staat in Storage)
4. Stuur email naar kantoor via Resend (zie sectie 13)
5. Stuur bevestigingsmail naar student via Resend
6. Return `{ success: true }`

Na submit: toon bevestigingspagina "Je sollicitatie is verstuurd!"

---

## 13. Transactionele Emails (Resend)

### Setup
```typescript
// lib/resend.ts
import { Resend } from 'resend'
export const resend = new Resend(process.env.RESEND_API_KEY)
```

### Email 1 — Nieuwe sollicitatie (naar kantoor)

**Aan:** `notification_email` van het kantoor (+ `cc_email` als ingesteld)  
**Van:** noreply@legal-talents.nl  
**Onderwerp:** Nieuwe sollicitatie: [Naam student] voor [Vacaturetitel]  
**Inhoud:**
- Naam student
- Email + telefoon
- Universiteit & studierichting
- Motivatietekst
- CV als bijlage (PDF ophalen uit Supabase Storage)
- Vacaturetitel

```typescript
await resend.emails.send({
  from: 'Legal Talents <noreply@legal-talents.nl>',
  to: firm.notification_email,
  cc: firm.cc_email || undefined,
  subject: `Nieuwe sollicitatie: ${applicantName} voor ${jobTitle}`,
  html: `<p>...</p>`,
  attachments: [{
    filename: `CV-${applicantName}.pdf`,
    content: cvBuffer, // Buffer van Supabase Storage download
  }]
})
```

### Email 2 — Bevestiging (naar student)

**Aan:** student  
**Onderwerp:** Je sollicitatie bij [Kантоornaam] is ontvangen  
**Inhoud:** Bevestiging dat sollicitatie is binnengekomen, naam kantoor, vacaturetitel

### Email 3 — Wachtwoord reset

Wordt automatisch afgehandeld door Supabase Auth.

---

## 14. Publieke Site — Wat studenten zien

### Homepage (`/`)
- Hero met zoekbalk (filtert op vacatureoverzicht)
- Lijst met uitgelichte kantoren
- CTA voor kantoren: "Plaats je kantoor op Legal Talents"

### Vacatureoverzicht (`/jobs`)
- Alle actieve vacatures (status = 'active')
- **Filters** (in MVP: eenvoudig via URL query params):
  - Locatie
  - Type (Voltijd / Stage / Studentbaan)
  - Rechtsgebied
- Elke vacature als kaart: titel, kantoor, locatie, type, rechtsgebied

### Kantorenoverzicht (`/firms`)
- Alle gepubliceerde kantoren (is_published = true)
- Elke kantoor als kaart: logo, naam, locatie, rechtsgebieden
- Geen filters in MVP

### Kantoorpagina (`/firms/[slug]`)
- Logo, naam, locatie, rechtsgebieden
- Omschrijving
- "Waarom bij ons werken?"
- Teamgrootte, website, LinkedIn
- Actieve vacatures van dit kantoor

### Vacaturepagina (`/jobs/[slug]`)
- Alle vacaturedetails
- Naam + logo van het kantoor (met link naar kantoorpagina)
- Sollicitatieformulier (zie sectie 12)

---

## 15. SEO (belangrijk voor groei)

Gebruik Next.js `generateMetadata` op alle publieke pagina's:

```typescript
// app/(public)/jobs/[slug]/page.tsx
export async function generateMetadata({ params }) {
  const job = await getJob(params.slug)
  return {
    title: `${job.title} bij ${job.firm.name} | Legal Talents`,
    description: job.description.substring(0, 160),
    openGraph: {
      title: `${job.title} bij ${job.firm.name}`,
      description: job.description.substring(0, 160),
    }
  }
}
```

Zorg ook voor:
- Statische pagina's waar mogelijk (`generateStaticParams` voor vacatures en kantoren)
- `sitemap.ts` in de `app/` root die alle publieke pagina's exporteert
- Canonical URLs op elke pagina

---

## 16. Omgevingsvariabelen

Maak een `.env.local` aan met:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...     # Alleen server-side gebruiken
RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 17. Wat bewust NIET in het MVP zit

Deze features zijn bewust weggelaten voor snelheid. Voeg ze pas toe als het platform live is:

| Weggelaten feature | Reden |
|---|---|
| Onboarding wizard | Direct naar profielpagina is sneller te bouwen |
| Automatisch sluiten op sluitingsdatum | Vereist cron job — niet nodig voor launch |
| Vacature views/analytics | Complexity zonder directe waarde |
| Profielcompleteness percentage | Nice-to-have, geen prioriteit |
| Video embed | Edge cases, weinig gebruik verwacht |
| Meerdere gebruikers per kantoor | V2 feature |
| Per-vacature email override | V2 feature |
| Filters op kantorenoverzicht | V2 — begin met simpele lijst |

---

## 18. MVP Bouwen in Volgorde

Bouw in deze volgorde — elke stap levert iets werkends op:

1. **Supabase project aanmaken** — tabellen en storage buckets instellen (SQL uit sectie 4)
2. **Next.js project bootstrappen** — `npx create-next-app@latest` met Tailwind
3. **Auth flow** — registratie, login, email verificatie, auth guard in portal
4. **Kantoorprofiel** — form in portal, opslaan in Supabase
5. **Vacature CRUD** — aanmaken, bewerken, status wijzigen
6. **Publieke pagina's** — vacatureoverzicht, kantorenoverzicht, detail pagina's
7. **Sollicitatieformulier + API route** — form, CV upload, email via Resend
8. **Dashboard** — statistieken en recente sollicitaties
9. **SEO** — metadata, sitemap
10. **Deployen op Vercel** — koppelen aan Supabase productie project

---

*Legal Talents VOF — legal-talents.nl*
