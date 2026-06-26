-- =============================================================================
-- HEMA-Core HDMIS — Initial schema
-- =============================================================================
-- Notes on sensitive data:
--   Columns marked "ENCRYPTED (app-level)" hold ciphertext produced by the
--   application using AES-256-GCM (Option B). The database NEVER sees plaintext
--   for these fields. They are stored as `text` in the packed format:
--     v<keyVersion>:<ivB64>:<tagB64>:<ciphertextB64>
--   See src/lib/crypto/fieldEncryption.ts.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('public_user', 'patient', 'staff', 'dept_head');
create type public.case_status as enum ('open', 'active', 'resolved', 'closed');
create type public.appointment_status as enum ('scheduled', 'completed', 'cancelled', 'no_show');
create type public.task_status as enum ('todo', 'in_progress', 'done');
create type public.article_status as enum ('draft', 'published');

-- -----------------------------------------------------------------------------
-- Shared: updated_at trigger function
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- USERS  (extended profile mirroring auth.users)
-- -----------------------------------------------------------------------------
create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  name        text,
  email       text,
  role        public.user_role not null default 'patient',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- PATIENTS  (formerly "Clients")
-- -----------------------------------------------------------------------------
create table public.patients (
  id            uuid primary key default gen_random_uuid(),
  patient_code  text not null unique,
  user_id       uuid references public.users (id) on delete set null, -- if patient has login
  name          text not null,
  date_of_birth date,
  sex           text,
  contact_info  text,            -- ENCRYPTED (app-level)
  created_by    uuid references public.users (id) on delete set null, -- staff who created record
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index patients_user_id_idx on public.patients (user_id);
create index patients_created_by_idx on public.patients (created_by);

create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- CASES
-- -----------------------------------------------------------------------------
create table public.cases (
  id             uuid primary key default gen_random_uuid(),
  patient_id     uuid not null references public.patients (id) on delete cascade,
  assigned_to    uuid references public.users (id) on delete set null, -- staff, drives RLS scoping
  diagnosis      text,           -- ENCRYPTED (app-level)
  treatment_plan text,           -- ENCRYPTED (app-level)
  status         public.case_status not null default 'open',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index cases_patient_id_idx on public.cases (patient_id);
create index cases_assigned_to_idx on public.cases (assigned_to);
create index cases_status_idx on public.cases (status);

create trigger cases_set_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- REVIEWS  (progress / consultation notes)
-- -----------------------------------------------------------------------------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.cases (id) on delete cascade,
  author_id   uuid references public.users (id) on delete set null,
  notes       text,              -- ENCRYPTED (app-level)
  review_date timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index reviews_case_id_idx on public.reviews (case_id);
create index reviews_author_id_idx on public.reviews (author_id);

-- -----------------------------------------------------------------------------
-- APPOINTMENTS
-- -----------------------------------------------------------------------------
create table public.appointments (
  id               uuid primary key default gen_random_uuid(),
  patient_id       uuid not null references public.patients (id) on delete cascade,
  staff_id         uuid references public.users (id) on delete set null,
  appointment_date timestamptz not null,
  purpose          text,
  status           public.appointment_status not null default 'scheduled',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index appointments_patient_id_idx on public.appointments (patient_id);
create index appointments_staff_id_idx on public.appointments (staff_id);
create index appointments_date_idx on public.appointments (appointment_date);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- TASKS
-- -----------------------------------------------------------------------------
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  assigned_to uuid references public.users (id) on delete set null,
  assigned_by uuid references public.users (id) on delete set null,
  due_date    date,
  status      public.task_status not null default 'todo',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index tasks_assigned_to_idx on public.tasks (assigned_to);
create index tasks_assigned_by_idx on public.tasks (assigned_by);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- MESSAGES  (receiver_id null => department-wide announcement)
-- -----------------------------------------------------------------------------
create table public.messages (
  id          uuid primary key default gen_random_uuid(),
  sender_id   uuid references public.users (id) on delete set null,
  receiver_id uuid references public.users (id) on delete cascade, -- null = announcement
  body        text not null,
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index messages_sender_id_idx on public.messages (sender_id);
create index messages_receiver_id_idx on public.messages (receiver_id);

-- -----------------------------------------------------------------------------
-- EVENTS  (public)
-- -----------------------------------------------------------------------------
create table public.events (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  description        text,
  event_date         timestamptz,
  registration_limit int,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- EVENT_REGISTRATIONS  (public can register)
-- -----------------------------------------------------------------------------
create table public.event_registrations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events (id) on delete cascade,
  name          text not null,
  email         text not null,
  registered_at timestamptz not null default now()
);

create index event_registrations_event_id_idx on public.event_registrations (event_id);

-- -----------------------------------------------------------------------------
-- ARTICLES
-- -----------------------------------------------------------------------------
create table public.articles (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  content          text,
  author_id        uuid references public.users (id) on delete set null,
  publication_date date,
  status           public.article_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index articles_status_idx on public.articles (status);
create index articles_author_id_idx on public.articles (author_id);

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- AUDIT_LOGS  (who viewed/changed sensitive records)
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.users (id) on delete set null,
  action      text not null,           -- e.g. 'viewed_case', 'updated_diagnosis'
  table_name  text,
  record_id   uuid,
  created_at  timestamptz not null default now()
);

create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_record_idx on public.audit_logs (table_name, record_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at);
