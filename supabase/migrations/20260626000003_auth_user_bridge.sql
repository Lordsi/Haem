-- =============================================================================
-- HEMA-Core HDMIS — Auth bridge
-- =============================================================================
-- Automatically create a public.users profile row whenever a new auth.users
-- record is created. The role defaults to 'patient'; staff/dept_head roles are
-- assigned by a department head afterwards. If the account is provisioned with
-- a role in user metadata (e.g. by an admin server action), that role is used.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_role public.user_role;
begin
  begin
    meta_role := (new.raw_user_meta_data ->> 'role')::public.user_role;
  exception when others then
    meta_role := null;
  end;

  insert into public.users (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    coalesce(meta_role, 'patient')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
