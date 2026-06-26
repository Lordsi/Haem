-- =============================================================================
-- HEMA-Core HDMIS — Public content additions (Phase 1)
-- =============================================================================
-- Adds the pieces the public site needs on top of the base schema:
--   * articles.slug          (for /news/[slug] routes)
--   * articles.excerpt + cover_image_url (list/detail presentation)
--   * events.location        (for the events directory)
--   * contact_messages table (public contact form submissions)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ARTICLES: slug + presentation fields
-- -----------------------------------------------------------------------------
alter table public.articles
  add column if not exists slug            text,
  add column if not exists excerpt         text,
  add column if not exists cover_image_url text;

-- Slugs must be unique when present.
create unique index if not exists articles_slug_key on public.articles (slug);

-- -----------------------------------------------------------------------------
-- EVENTS: location
-- -----------------------------------------------------------------------------
alter table public.events
  add column if not exists location text;

-- -----------------------------------------------------------------------------
-- CONTACT_MESSAGES  (public contact form)
--   Anyone may insert (submit the form). Only staff/head may read.
-- -----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at);

alter table public.contact_messages enable row level security;

create policy "contact_messages_insert_public"
  on public.contact_messages for insert to anon, authenticated
  with check (true);

create policy "contact_messages_select_staff"
  on public.contact_messages for select to authenticated
  using (public.is_staff_or_head());

create policy "contact_messages_delete_staff"
  on public.contact_messages for delete to authenticated
  using (public.is_staff_or_head());
