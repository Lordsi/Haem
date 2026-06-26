# Agent handoff — HEMA-Core / Haem

Last updated: 2026-06-26

This file captures operational knowledge for agents continuing work on this
repo. Read it before touching the database, env files, or project paths.

---

## Where we are now

### Product goal

Web platform for a **hospital hematology department** serving three audiences:

| Audience | Purpose |
|---|---|
| **General public** | Educational/marketing site (services, news, events, contact) |
| **Patients** | Login to view their own records (decided; not built yet) |
| **Department staff** | Internal PMS — cases, appointments, tasks, messaging (not built yet) |

Branding placeholder: **HEMA-Core**. User wants an **incremental** build — ask
questions at phase boundaries; do not implement the full spec in one pass.

Original mockups/spec live in the user's Downloads folder
(`stitch_hemahub_management_system`); design system is **"Clinical Precision"**.

### Key decisions already made

| Topic | Decision |
|---|---|
| Encryption | App-level **AES-256-GCM** (Option B) for sensitive fields — DB never sees plaintext |
| Database | **Supabase** (Auth, Postgres, RLS, Storage, Realtime) |
| Auth model | Patients **can** log in to their own records; roles: `public_user`, `patient`, `staff`, `dept_head` |
| RLS | Enabled on all tables; **staff** (not only `dept_head`) may create tasks |
| Deployment target | **Render** (`0.0.0.0:$PORT`, env vars for secrets, ephemeral filesystem) |
| Dev environment | Project moved off OneDrive to `C:\dev\haem` (OneDrive caused slow/hung `npm install`) |
| Supabase env | **Sandbox** cloud project for now; separate production project + rotated secrets later |

### Completed work

#### Phase 0 — Foundation (done)

- Next.js 16 App Router + TypeScript + Tailwind CSS v4 + React 19
- "Clinical Precision" design tokens in `src/app/globals.css` (`@theme`)
- Inter + JetBrains Mono + Material Symbols
- Supabase clients: `src/lib/supabase/{client,server,admin}.ts`
- Field encryption: `src/lib/crypto/fieldEncryption.ts` + `encryptedFields.ts`
- Audit logging scaffold: `src/lib/audit.ts`
- SQL migrations (schema, RLS, auth bridge, public content) in `supabase/migrations/`
- `npm run verify:encryption` script
- README, `.env.example`
- **Initial commit pushed** to `https://github.com/Lordsi/Haem.git` (`main`)

#### Phase 1 — Public site (done)

| Route | Status |
|---|---|
| `/` | Landing — hero, expertise, news bento, events, CTA |
| `/news`, `/news/[slug]` | Article list + detail |
| `/events`, `/events/[id]` | Event list + detail + registration form (server action) |
| `/contact` | Contact info + form (server action → `contact_messages`) |
| `/about`, `/services` | Department overview + services grid |
| `/privacy`, `/terms`, `/accessibility` | Placeholder legal pages |
| `/staff/login` | Placeholder ("auth in a later phase") |

Shared UI: `TopNavBar`, `Footer`, `Button`, `ArticleCard`, `EventCard`, etc.
Data layer: `src/lib/data/content.ts` with **sample fallback** when Supabase env
vars are missing.

Build/lint/typecheck passed at end of Phase 1. Dev server: `npm run dev` →
`http://localhost:3000`.

#### Sandbox database (done, partial app wiring)

- User provided sandbox Postgres credentials
- All 4 migrations applied + `seed.sql` run (4 articles, 3 events in DB)
- `.env.local` created at `C:\dev\haem` with URL, pooler `DATABASE_URL`, encryption key, **anon + service_role keys**
- Direct migration tooling added locally: `scripts/apply-migrations.mjs`, `npm run db:apply`

### Current gaps / blockers

| Gap | Impact | Unblock |
|---|---|---|
| ~~**`NEXT_PUBLIC_SUPABASE_ANON_KEY` not in `.env.local`**~~ | ~~App still shows **sample fallback** content~~ | **Done** — keys in `.env.local`, `npm run verify:supabase` passes |
| ~~**`SUPABASE_SERVICE_ROLE_KEY` not in `.env.local`**~~ | ~~Event registration capacity checks + audit writes use degraded paths~~ | **Done** — service role verified |
| **API keys + migration script not committed to GitHub** | Remote repo is Phase 1 only; `docs/`, `apply-migrations.mjs`, `pg` dep are local uncommitted changes | User asks to commit when ready |
| **Supabase CLI not linked** | `supabase db push` unavailable without `supabase login` / access token | User login or use `npm run db:apply` |
| **No auth middleware** | No real login, sessions, or protected routes | Phase 2 |
| **No staff/patient dashboards** | PMS tables exist in DB but no UI | Phase 3+ |
| **Encryption not wired to CRUD** | Crypto module exists; clinical writes not implemented yet | Phase 3+ |
| **Legal pages are placeholders** | Footer links work but content is stub text | Content/legal review |
| **Render deploy not configured** | App runs locally only | Phase 5 or when user requests deploy |

**Sample users:** all four roles seeded in sandbox — see `docs/SAMPLE_USERS.md`, refresh with `npm run seed:users`.

### Git state

```
Branch: main
Remote: origin → https://github.com/Lordsi/Haem.git
Latest pushed commit: c315d36 — Initial commit (Phase 1 public site)

Uncommitted locally (as of handoff):
  M .env.example
  M package.json, package-lock.json  (pg devDep + db:apply script)
  ?? docs/AGENT_HANDOFF.md
  ?? scripts/apply-migrations.mjs
```

---

## Roadmap — what to do next

Work in order unless the user redirects. Confirm scope before starting a new phase.

### Immediate (unblocks live sandbox)

1. ~~**Add Supabase API keys to `.env.local`**~~ — **Done** (`npm run verify:supabase` passes; `/news` + `/events` return 200 with seeded content).
2. **Smoke-test forms against live DB**
   - `/contact` → row in `contact_messages`
   - `/events/[id]` registration → row in `event_registrations`
3. **Optional: commit sandbox tooling** — `apply-migrations.mjs`, `docs/AGENT_HANDOFF.md`, `.env.example` + `package.json` updates (no secrets).

### Phase 2 — Authentication

- Supabase Auth email/password (or org-preferred provider)
- Next.js middleware for session refresh (`@supabase/ssr` cookie pattern)
- `/staff/login` — real staff sign-in
- Patient registration / login flow
- Role assignment via `public.users` (auth trigger already exists in migration 003)
- Route groups: `(staff)/`, `(patient)/` with layout guards
- **Ask user:** invite-only staff vs self-signup, MFA requirements, password policy

### Phase 3 — Staff workspace (PMS core)

Per original spec / mockups (`hdmis_staff_workspace`, `hdmis_patient_case_management`):

- Staff dashboard (cases overview, tasks, appointments)
- Patient list + case detail views
- Wire **field encryption** on read/write for `patients.contact_info`, `cases.diagnosis`, `cases.treatment_plan`, `reviews.notes`
- Wire **audit logging** on patient/case/review access
- Task creation (staff + dept_head — RLS already allows this)
- Messaging between staff / patients (RLS policies exist; UI needed)

### Phase 4 — Patient portal

- Patient dashboard: own cases, appointments, messages
- Read-only or limited views per RLS (`owns_patient`, `staffs_patient` helpers exist)
- **Ask user:** what patients can see vs staff-only fields

### Phase 5 — Deployment & production hardening

- New **production** Supabase project (do not reuse sandbox credentials)
- Rotate all secrets; separate encryption keys per environment
- Render web service: build command, env vars, custom domain
- HSTS, security headers, error tracking (if requested)
- Replace placeholder legal pages
- Replace HEMA-Core branding when user provides final name/assets

### Phase 6 — Extended features (backlog)

- File storage (lab reports, documents) with Storage RLS
- Realtime (notifications, live task updates)
- Admin: user role management (`dept_head` only)
- Reporting / analytics
- E2E tests, CI pipeline

---

## Canonical project location

| Path | Status |
|---|---|
| `C:\dev\haem` | **Canonical repo** — full Phase 1 app, git remote `https://github.com/Lordsi/Haem.git`, `main` branch pushed |
| `C:\Users\Praise Magangani\OneDrive\Documents\work\haem` | **Stale partial copy** — early scaffold only; do not develop here |

Always `cd` to `C:\dev\haem` for installs, dev server, migrations, and commits.

---

## Sandbox Supabase project

| Setting | Value |
|---|---|
| Project ref | `fftjydygnxjwvrrxnroc` |
| API URL | `https://fftjydygnxjwvrrxnroc.supabase.co` |
| Region (pooler) | `eu-central-1` (`aws-1-eu-central-1.pooler.supabase.com`) |
| Dashboard API keys | https://supabase.com/dashboard/project/fftjydygnxjwvrrxnroc/settings/api |

Credentials live in **`.env.local` only** (gitignored). Never commit secrets.

As of handoff:

- **Migrations + seed applied** to sandbox (4 articles, 3 events).
- **`.env.local` may still be missing** `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` — the Next.js app falls back to sample data until those are set.

User stated this is a **sandbox**; production will use a different project and rotated credentials.

---

## Direct migration method (preferred when CLI login is unavailable)

We could **not** use `npx supabase link` + `npx supabase db push` because the
Supabase CLI requires `supabase login` or `SUPABASE_ACCESS_TOKEN`, and the
sandbox project was not visible via the user's Supabase MCP account.

Instead, migrations are applied with a **Node + `pg` script** over Postgres.

### Files involved

| File | Role |
|---|---|
| `scripts/apply-migrations.mjs` | Applies `supabase/migrations/*.sql` in sorted order, tracks versions, runs seed once |
| `supabase/migrations/*.sql` | Source of truth for schema + RLS |
| `supabase/seed.sql` | Sample articles/events (skipped if `articles` already has rows) |
| `.env.local` | Must define `DATABASE_URL` |
| `package.json` | Script: `npm run db:apply` |

### How the script works

1. Reads `DATABASE_URL` from the environment.
2. Connects with `pg` + `ssl: { rejectUnauthorized: false }`.
3. Ensures `public.schema_migrations (version text primary key)` exists.
4. For each `supabase/migrations/*.sql` file (sorted by filename):
   - Skips if version already in `schema_migrations`.
   - Otherwise runs the SQL inside a transaction and records the version.
5. Runs `supabase/seed.sql` once if `articles` is empty.

**Note:** This uses a custom `schema_migrations` table, not Supabase CLI's
`supabase_migrations.schema_migrations`. That is fine for this workflow; if you
later switch to `supabase db push`, reconcile or accept duplicate-tracking.

### Run migrations

```powershell
cd C:\dev\haem
npm install          # ensures `pg` devDependency is present
npm run db:apply     # equivalent to: node --env-file=.env.local scripts/apply-migrations.mjs
```

Success output looks like:

```
Applying 20260626000001_init_schema.sql...
  OK
...
Running seed.sql...
  OK
Database setup complete.
```

Re-runs are idempotent: already-applied files are skipped; seed is skipped if
articles exist.

### Verify after apply

```powershell
node --env-file=.env.local -e "const pg=require('pg'); (async()=>{const c=new pg.Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}}); await c.connect(); const a=await c.query('select count(*)::int n from articles'); const e=await c.query('select count(*)::int n from events'); console.log('articles',a.rows[0].n,'events',e.rows[0].n); await c.end();})();"
```

Expected sandbox baseline: **4 articles, 3 events**.

---

## Windows + connection string gotcha (critical)

The user-provided **direct** Postgres URL:

```
postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

often **fails on Windows** in this environment:

| Symptom | Cause |
|---|---|
| `getaddrinfo ENOTFOUND db....supabase.co` | Host resolves to **IPv6 only** (no A record); Node `pg` DNS can fail |
| `connect ENETUNREACH <ipv6>:5432` | IPv6 literal works in DNS but network has no IPv6 route |

**Fix:** Use the **Session pooler** URL (IPv4) from Supabase Dashboard:

**Project Settings → Database → Connection string → Session pooler**

Shape:

```
postgresql://postgres.<project-ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres
```

For sandbox `fftjydygnxjwvrrxnroc`, the working pooler was:

```
aws-1-eu-central-1.pooler.supabase.com:5432
```

(user `postgres.fftjydygnxjwvrrxnroc`, not `postgres`)

### Discovering pooler region programmatically

If the region is unknown, probe pooler hosts with `pg` (connection succeeds,
wrong region returns `tenant/user postgres.<ref> not found`):

```javascript
// Quick probe — run from C:\dev\haem with password URL-encoded if needed
const pg = require("pg");
const ref = "<project-ref>";
const pass = "<password>";
const regions = ["eu-west-1","eu-west-2","eu-west-3","eu-central-1","us-east-1"];
const prefixes = ["aws-0", "aws-1"];

for (const prefix of prefixes) {
  for (const region of regions) {
    const host = `${prefix}-${region}.pooler.supabase.com`;
    const url = `postgresql://postgres.${ref}:${encodeURIComponent(pass)}@${host}:5432/postgres`;
    const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
    try {
      await client.connect();
      console.log("OK", host);
      await client.end();
    } catch (e) {
      console.log("FAIL", host, e.message);
      try { await client.end(); } catch {}
    }
  }
}
```

Use the host that prints `OK`, then set `DATABASE_URL` in `.env.local`.

### Shell env trap

If a prior command set `$env:DATABASE_URL` to an IPv6 literal, it **overrides**
`--env-file=.env.local`. Before `npm run db:apply`:

```powershell
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
npm run db:apply
```

---

## Alternative: Supabase CLI (when authenticated)

If the user provides `SUPABASE_ACCESS_TOKEN` or runs `npx supabase login`:

```powershell
cd C:\dev\haem
npx supabase link --project-ref fftjydygnxjwvrrxnroc --password "<db-password>"
npx supabase db push
# seed still needs manual run (SQL editor or psql) unless using local stack
```

`psql` was **not** installed on the handoff machine; do not assume it exists.

---

## Environment variables checklist

Copy `.env.example` → `.env.local` and fill:

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | App + RLS queries | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | App + RLS queries | From dashboard API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Event capacity checks, audit writes | Server-only; never `NEXT_PUBLIC_` |
| `DATABASE_URL` | `npm run db:apply` only | Session pooler on Windows |
| `ENCRYPTION_KEY_V1` | Field encryption | Generate per environment |
| `ENCRYPTION_KEY_CURRENT_VERSION` | Field encryption | Usually `1` |
| `NEXT_PUBLIC_SITE_URL` | Metadata / canonical URLs | `http://localhost:3000` locally |

Generate encryption key:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## App behavior without full env

`isSupabaseConfigured()` in `src/lib/supabase/server.ts` checks only
`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Until both are set, public pages use **sample fallback data** from
`src/lib/data/content.ts`. Forms simulate success when Supabase is not configured.

---

## Migration inventory (applied to sandbox)

| File | Purpose |
|---|---|
| `20260626000001_init_schema.sql` | Core tables, enums, indexes |
| `20260626000002_rls_policies.sql` | RLS helpers + policies (staff can create tasks) |
| `20260626000003_auth_user_bridge.sql` | `auth.users` → `public.users` trigger |
| `20260626000004_public_content_additions.sql` | Article slugs, `contact_messages`, event `location` |

---

## Security reminders for agents

1. Never commit `.env.local`, DB passwords, or service role keys.
2. User pasted sandbox DB password in chat — treat as compromised for anything beyond throwaway sandbox; rotate before production.
3. `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — use only in server-only modules (`server-only` package is used in crypto/audit paths).
4. Do not put real PHI in sandbox seed data.

---

## Quick commands reference

```powershell
cd C:\dev\haem
npm install
npm run dev                    # http://localhost:3000
npm run db:apply               # apply pending migrations + seed if empty
npm run verify:encryption      # AES-256-GCM round-trip test
npm run build                  # production build check
```

Git remote: `origin` → `https://github.com/Lordsi/Haem.git` (branch `main`).
