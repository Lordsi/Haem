-- =============================================================================
-- Phase 4b — Article author bylines + public author visibility
-- =============================================================================

-- Explicit byline for articles (used in seed data and when author_id is unset).
alter table public.articles
  add column if not exists author_name text;

-- Backfill bylines on existing seeded articles.
update public.articles
set author_name = 'Dr. Sam Okonkwo'
where slug in ('ai-driven-morphology-analysis', 'open-source-blood-smear-dataset')
  and author_name is null;

update public.articles
set author_name = 'Prof. Naledi Khumalo'
where slug in ('car-t-cell-therapy-tracking', 'hemophilia-care-portal')
  and author_name is null;

create policy "users_select_published_article_authors"
  on public.users for select to anon, authenticated
  using (
    exists (
      select 1
      from public.articles a
      where a.author_id = users.id
        and a.status = 'published'
    )
  );
