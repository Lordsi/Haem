# Sample user profiles (sandbox only)

Demo accounts for every `public.user_role` value. Created by `npm run seed:users`.
**Do not use these credentials in production.**

## Shared sandbox password

```
HemaCore-Sandbox-2026!
```

## Accounts

| Role | Email | Display name | What’s seeded |
|---|---|---|---|
| `public_user` | `public.demo@hema-core.test` | Alex Rivera | Auth + `public.users` row only. Represents a registered public-site visitor (news/events). No clinical data. |
| `patient` | `patient.demo@hema-core.test` | Jordan Mbeki | Linked to patient **`PAT-DEMO-001`**, active anemia case, follow-up appointment. Can see own patient/case rows under RLS when logged in. |
| `staff` | `staff.demo@hema-core.test` | Dr. Sam Okonkwo | Assigned to Jordan’s case; author of initial review; has a pending task from the dept head. |
| `dept_head` | `head.demo@hema-core.test` | Prof. Naledi Khumalo | Created the demo patient record; can see all patients/cases per RLS. |

## Demo clinical record (patient + staff + head)

| Entity | Detail |
|---|---|
| Patient code | `PAT-DEMO-001` |
| Diagnosis | Iron deficiency anemia (encrypted at app level in DB) |
| Case status | `active` |
| Appointment | Follow-up CBC ~3 weeks from seed run |
| Task | Staff todo: review repeat CBC when available |

Sensitive fields (`contact_info`, `diagnosis`, `treatment_plan`, `notes`) are stored as **AES-256-GCM ciphertext** via `encryptField()` during seeding.

## Create or refresh profiles

```powershell
cd C:\dev\haem
npm run seed:users
```

Requires `.env.local` with Supabase URL, service role key, and `ENCRYPTION_KEY_V1`.
The script is **idempotent** — re-running updates passwords/metadata and skips existing clinical rows.

## Login (Phase 2+)

Auth UI is not built yet (`/staff/login` is a placeholder). Until Phase 2:

- Use these accounts when implementing Supabase Auth sign-in.
- Or sign in via Supabase Dashboard → Authentication → Users → “Send password recovery” / manual test.
- Or use `supabase.auth.signInWithPassword` in a one-off script.

## Security

- Rotate or delete these users before production.
- The `@hema-core.test` domain is fictional; emails will not deliver unless you configure SMTP.
- Never commit real patient data — this is synthetic demo content only.
