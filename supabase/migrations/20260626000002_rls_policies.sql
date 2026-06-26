-- =============================================================================
-- HEMA-Core HDMIS — Row Level Security
-- =============================================================================
-- Design principles:
--   * RLS is the PRIMARY access-control layer. Every table has it enabled.
--   * Policies are written per-action (select / insert / update / delete);
--     a missing update/delete policy is as dangerous as a missing select.
--   * Role lookups go through SECURITY DEFINER helpers to avoid infinite
--     recursion when a policy on `users` needs to read `users`.
--   * The `service_role` key bypasses RLS and is used ONLY in trusted
--     server-side contexts (audit writes, admin operations).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER, fixed search_path)
-- -----------------------------------------------------------------------------
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_dept_head()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'dept_head', false);
$$;

create or replace function public.is_staff_or_head()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('staff', 'dept_head'), false);
$$;

-- Does the current user own this patient record (patient login)?
create or replace function public.owns_patient(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.patients p
    where p.id = p_patient_id and p.user_id = auth.uid()
  );
$$;

-- Is the current user the assigned staff on any case for this patient?
create or replace function public.staffs_patient(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cases c
    where c.patient_id = p_patient_id and c.assigned_to = auth.uid()
  );
$$;

-- =============================================================================
-- Enable RLS on every table
-- =============================================================================
alter table public.users               enable row level security;
alter table public.patients            enable row level security;
alter table public.cases               enable row level security;
alter table public.reviews             enable row level security;
alter table public.appointments        enable row level security;
alter table public.tasks               enable row level security;
alter table public.messages            enable row level security;
alter table public.events              enable row level security;
alter table public.event_registrations enable row level security;
alter table public.articles            enable row level security;
alter table public.audit_logs          enable row level security;

-- =============================================================================
-- USERS
-- =============================================================================
create policy "users_select_own"
  on public.users for select to authenticated
  using (id = auth.uid());

create policy "users_select_staff_directory"
  on public.users for select to authenticated
  using (public.is_staff_or_head() and role in ('staff', 'dept_head'));

create policy "users_select_dept_head_all"
  on public.users for select to authenticated
  using (public.is_dept_head());

-- A user may update their own profile (role changes are blocked by trigger below).
create policy "users_update_own"
  on public.users for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Department head manages staff accounts.
create policy "users_dept_head_insert"
  on public.users for insert to authenticated
  with check (public.is_dept_head());

create policy "users_dept_head_update"
  on public.users for update to authenticated
  using (public.is_dept_head())
  with check (public.is_dept_head());

create policy "users_dept_head_delete"
  on public.users for delete to authenticated
  using (public.is_dept_head());

-- Prevent non-dept-head users from escalating their own role.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_dept_head() then
    raise exception 'Only a department head can change a user role';
  end if;
  return new;
end;
$$;

create trigger users_prevent_role_escalation
  before update on public.users
  for each row execute function public.prevent_role_escalation();

-- =============================================================================
-- PATIENTS
-- =============================================================================
create policy "patients_select_own"
  on public.patients for select to authenticated
  using (user_id = auth.uid());

create policy "patients_select_assigned_staff"
  on public.patients for select to authenticated
  using (public.staffs_patient(id));

create policy "patients_select_dept_head"
  on public.patients for select to authenticated
  using (public.is_dept_head());

create policy "patients_insert_staff"
  on public.patients for insert to authenticated
  with check (public.is_staff_or_head() and created_by = auth.uid());

create policy "patients_update_assigned_staff"
  on public.patients for update to authenticated
  using (public.staffs_patient(id) or public.is_dept_head())
  with check (public.staffs_patient(id) or public.is_dept_head());

create policy "patients_delete_dept_head"
  on public.patients for delete to authenticated
  using (public.is_dept_head());

-- =============================================================================
-- CASES
-- =============================================================================
create policy "cases_select_patient_own"
  on public.cases for select to authenticated
  using (public.owns_patient(patient_id));

create policy "cases_select_assigned_staff"
  on public.cases for select to authenticated
  using (assigned_to = auth.uid());

create policy "cases_select_dept_head"
  on public.cases for select to authenticated
  using (public.is_dept_head());

create policy "cases_insert_staff"
  on public.cases for insert to authenticated
  with check (public.is_staff_or_head());

create policy "cases_update_assigned_staff"
  on public.cases for update to authenticated
  using (assigned_to = auth.uid() or public.is_dept_head())
  with check (assigned_to = auth.uid() or public.is_dept_head());

create policy "cases_delete_dept_head"
  on public.cases for delete to authenticated
  using (public.is_dept_head());

-- =============================================================================
-- REVIEWS  (internal clinical notes; not exposed to patients)
-- =============================================================================
create policy "reviews_select_staff"
  on public.reviews for select to authenticated
  using (
    author_id = auth.uid()
    or public.is_dept_head()
    or exists (
      select 1 from public.cases c
      where c.id = reviews.case_id and c.assigned_to = auth.uid()
    )
  );

create policy "reviews_insert_staff"
  on public.reviews for insert to authenticated
  with check (public.is_staff_or_head() and author_id = auth.uid());

create policy "reviews_update_author_or_head"
  on public.reviews for update to authenticated
  using (author_id = auth.uid() or public.is_dept_head())
  with check (author_id = auth.uid() or public.is_dept_head());

create policy "reviews_delete_dept_head"
  on public.reviews for delete to authenticated
  using (public.is_dept_head());

-- =============================================================================
-- APPOINTMENTS
-- =============================================================================
create policy "appointments_select_patient_own"
  on public.appointments for select to authenticated
  using (public.owns_patient(patient_id));

create policy "appointments_select_staff"
  on public.appointments for select to authenticated
  using (staff_id = auth.uid() or public.is_dept_head());

create policy "appointments_insert_staff"
  on public.appointments for insert to authenticated
  with check (public.is_staff_or_head());

create policy "appointments_update_staff"
  on public.appointments for update to authenticated
  using (staff_id = auth.uid() or public.is_dept_head())
  with check (staff_id = auth.uid() or public.is_dept_head());

create policy "appointments_delete_staff"
  on public.appointments for delete to authenticated
  using (staff_id = auth.uid() or public.is_dept_head());

-- =============================================================================
-- TASKS
-- =============================================================================
create policy "tasks_select_involved"
  on public.tasks for select to authenticated
  using (assigned_to = auth.uid() or assigned_by = auth.uid() or public.is_dept_head());

-- Staff and dept head can create/assign tasks.
create policy "tasks_insert_staff"
  on public.tasks for insert to authenticated
  with check (public.is_staff_or_head() and assigned_by = auth.uid());

-- Assignee may update (e.g. status); dept head may update anything.
create policy "tasks_update_assignee_or_head"
  on public.tasks for update to authenticated
  using (assigned_to = auth.uid() or public.is_dept_head())
  with check (assigned_to = auth.uid() or public.is_dept_head());

create policy "tasks_delete_dept_head"
  on public.tasks for delete to authenticated
  using (public.is_dept_head());

-- =============================================================================
-- MESSAGES  (receiver_id null => department-wide announcement)
-- =============================================================================
create policy "messages_select_party"
  on public.messages for select to authenticated
  using (
    sender_id = auth.uid()
    or receiver_id = auth.uid()
    or (receiver_id is null and public.is_staff_or_head())
  );

-- Direct messages: any authenticated user as themselves.
-- Announcements (receiver_id null): dept head only.
create policy "messages_insert"
  on public.messages for insert to authenticated
  with check (
    sender_id = auth.uid()
    and (receiver_id is not null or public.is_dept_head())
  );

-- Recipient can update their copy (e.g. mark read).
create policy "messages_update_receiver"
  on public.messages for update to authenticated
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

create policy "messages_delete_sender_or_head"
  on public.messages for delete to authenticated
  using (sender_id = auth.uid() or public.is_dept_head());

-- =============================================================================
-- EVENTS  (public read; staff/head manage)
-- =============================================================================
create policy "events_select_public"
  on public.events for select to anon, authenticated
  using (true);

create policy "events_insert_staff"
  on public.events for insert to authenticated
  with check (public.is_staff_or_head());

create policy "events_update_staff"
  on public.events for update to authenticated
  using (public.is_staff_or_head())
  with check (public.is_staff_or_head());

create policy "events_delete_dept_head"
  on public.events for delete to authenticated
  using (public.is_dept_head());

-- =============================================================================
-- EVENT_REGISTRATIONS
--   Anyone (incl. anonymous public visitors) may register.
--   Only staff/head may read the list (contains personal contact data).
-- =============================================================================
create policy "event_registrations_insert_public"
  on public.event_registrations for insert to anon, authenticated
  with check (true);

create policy "event_registrations_select_staff"
  on public.event_registrations for select to authenticated
  using (public.is_staff_or_head());

create policy "event_registrations_delete_staff"
  on public.event_registrations for delete to authenticated
  using (public.is_staff_or_head());

-- =============================================================================
-- ARTICLES  (published readable by everyone; drafts only author/head)
-- =============================================================================
create policy "articles_select_published"
  on public.articles for select to anon, authenticated
  using (status = 'published');

create policy "articles_select_own_drafts"
  on public.articles for select to authenticated
  using (author_id = auth.uid() or public.is_dept_head());

create policy "articles_insert_staff"
  on public.articles for insert to authenticated
  with check (public.is_staff_or_head() and author_id = auth.uid());

create policy "articles_update_author_or_head"
  on public.articles for update to authenticated
  using (author_id = auth.uid() or public.is_dept_head())
  with check (author_id = auth.uid() or public.is_dept_head());

create policy "articles_delete_dept_head"
  on public.articles for delete to authenticated
  using (public.is_dept_head());

-- =============================================================================
-- AUDIT_LOGS
--   Readable only by dept head. Writes normally happen via service_role
--   (which bypasses RLS); this insert policy is a fallback for authenticated
--   users logging their own actions.
-- =============================================================================
create policy "audit_logs_select_dept_head"
  on public.audit_logs for select to authenticated
  using (public.is_dept_head());

create policy "audit_logs_insert_self"
  on public.audit_logs for insert to authenticated
  with check (user_id = auth.uid());
