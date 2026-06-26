-- =============================================================================
-- HEMA-Core HDMIS — Staff inbox read tracking
-- =============================================================================
-- Adds an `read_at` timestamp to the two public submission tables so the staff
-- inbox can distinguish opened from unopened items and surface an unread count.
-- Also grants staff / department head UPDATE access so they can mark items read.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CONTACT_MESSAGES: read tracking
-- -----------------------------------------------------------------------------
alter table public.contact_messages
  add column if not exists read_at timestamptz;

create index if not exists contact_messages_read_at_idx
  on public.contact_messages (read_at);

drop policy if exists "contact_messages_update_staff" on public.contact_messages;
create policy "contact_messages_update_staff"
  on public.contact_messages for update to authenticated
  using (public.is_staff_or_head())
  with check (public.is_staff_or_head());

-- -----------------------------------------------------------------------------
-- EVENT_REGISTRATIONS: read tracking
-- -----------------------------------------------------------------------------
alter table public.event_registrations
  add column if not exists read_at timestamptz;

create index if not exists event_registrations_read_at_idx
  on public.event_registrations (read_at);

drop policy if exists "event_registrations_update_staff" on public.event_registrations;
create policy "event_registrations_update_staff"
  on public.event_registrations for update to authenticated
  using (public.is_staff_or_head())
  with check (public.is_staff_or_head());
