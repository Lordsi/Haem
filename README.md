# HEMA-Core — Hematology Department Management & Information System

A web platform for a hospital hematology department, combining a public
educational/marketing site with a secure internal patient management system
(PMS). Built as a system that handles **sensitive health data** from the ground
up (encryption, Row Level Security, audit logging).

> **Status:** Phase 1 (public site) is implemented. Auth, staff/patient
> dashboards, and clinical features follow in later phases.

## Tech stack

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** Supabase (Auth, PostgreSQL, Storage, Realtime, Row Level Security)
- **Deployment:** Render (HTTPS/HSTS, secrets as env vars)
- **Design system:** "Clinical Precision" — Inter + JetBrains Mono + Material
  Symbols, ported into Tailwind v4 `@theme` tokens in `src/app/globals.css`.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in values (see below)
npm run dev                  # http://localhost:3000
```

The public site renders with **sample fallback content** until Supabase is
configured, so you can develop the UI without a database.

## Environment variables

Copy `.env.example` → `.env.local` and fill in:

| Variable | Purpose | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | public |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server ops (audit, capacity checks) | **server only** |
| `ENCRYPTION_KEY_CURRENT_VERSION` | Active field-encryption key version | server only |
| `ENCRYPTION_KEY_V1` | 32-byte base64 AES key | **server only, secret** |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL | public |

Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Never commit `.env.local`. On Render, set these as environment variables. Use
**separate keys per environment** (dev / staging / production).

## Database

SQL migrations live in `supabase/migrations/` and seed data in
`supabase/seed.sql`.

Apply to a hosted Supabase project (no Docker required):

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
# then run supabase/seed.sql once (SQL editor or psql) for sample content
```

Or, with Docker installed, run the full local stack:

```bash
npx supabase start      # applies migrations + seed automatically
```

### Schema overview

`users`, `patients`, `cases`, `reviews`, `appointments`, `tasks`, `messages`,
`events`, `event_registrations`, `articles`, `contact_messages`, `audit_logs`.

## Security model

- **Row Level Security** is enabled on every table and is the primary
  access-control layer. Policies are per-action (select/insert/update/delete).
- **Field-level encryption** (AES-256-GCM, app-level / "Option B") protects the
  sensitive columns `diagnosis`, `treatment_plan`, `notes`, `contact_info`. The
  database never sees plaintext. See `src/lib/crypto/fieldEncryption.ts`.
- **Audit logging** records reads/writes to `patients`, `cases`, `reviews`
  (`src/lib/audit.ts`).
- The **service role key** bypasses RLS and is used only in trusted server-side
  contexts — never shipped to the browser.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run verify:encryption` | Round-trip / tamper / rotation check for field encryption |

## Project structure

```
src/
  app/
    (public)/          Public site (landing, news, events, contact, about, services)
    staff/login/       Staff login placeholder (auth in a later phase)
  components/
    public/            TopNavBar, Footer, ArticleCard, EventRow, EventCard
    ui/                Button, StatusChip, SectionHeader, Icon
  lib/
    supabase/          Browser, server, and admin (service-role) clients
    crypto/            Field-level encryption + encrypted-field registry
    data/              Public content data access (with sample fallback)
    audit.ts           Audit-log writer
supabase/
  migrations/          SQL schema, RLS policies, auth bridge
  seed.sql             Sample articles & events
```
