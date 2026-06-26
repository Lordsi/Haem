-- =============================================================================
-- HEMA-Core HDMIS — Department calendar + case review dates
-- =============================================================================
-- 1. cases.review_date: the next scheduled review date for a case, captured
--    when a case is opened. Surfaced on the shared department calendar.
-- 2. calendar_events: a department-wide, staff-shared calendar (clinic days,
--    meetings, training, etc). Anyone on staff can view; staff/head can add.
-- =============================================================================

alter table public.cases add column if not exists review_date date;

create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    text,                       -- e.g. 'clinic', 'meeting', 'training'
  event_date  date not null,
  created_by  uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists calendar_events_date_idx
  on public.calendar_events (event_date);

drop trigger if exists calendar_events_set_updated_at on public.calendar_events;
create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

alter table public.calendar_events enable row level security;

-- Department-shared: any staff member or head can view the whole calendar.
drop policy if exists "calendar_events_select_staff" on public.calendar_events;
create policy "calendar_events_select_staff"
  on public.calendar_events for select to authenticated
  using (public.is_staff_or_head());

drop policy if exists "calendar_events_insert_staff" on public.calendar_events;
create policy "calendar_events_insert_staff"
  on public.calendar_events for insert to authenticated
  with check (public.is_staff_or_head() and created_by = auth.uid());

drop policy if exists "calendar_events_update_creator_or_head" on public.calendar_events;
create policy "calendar_events_update_creator_or_head"
  on public.calendar_events for update to authenticated
  using (created_by = auth.uid() or public.is_dept_head())
  with check (created_by = auth.uid() or public.is_dept_head());

drop policy if exists "calendar_events_delete_creator_or_head" on public.calendar_events;
create policy "calendar_events_delete_creator_or_head"
  on public.calendar_events for delete to authenticated
  using (created_by = auth.uid() or public.is_dept_head());
