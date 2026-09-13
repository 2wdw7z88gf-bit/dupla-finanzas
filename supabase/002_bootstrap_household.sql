-- Run this AFTER schema.sql (SQL Editor → New query → paste → Run).
--
-- This project's Supabase instance is dedicated to one household (just the
-- two of you), so there's no invite-code flow: whoever signs up first
-- creates the household, and anyone who signs up after that automatically
-- joins that same (only) household. `security definer` lets this function
-- do that lookup/insert even though the caller can't yet see the
-- `households`/`household_members` rows directly (RLS blocks that until
-- they're a member — this function is the one safe way in).

create or replace function bootstrap_household(p_display_name text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  h_id uuid;
  member_count int;
  assigned_color text;
begin
  select id into h_id from households order by created_at asc limit 1;

  if h_id is null then
    insert into households default values returning id into h_id;
  end if;

  select count(*) into member_count from household_members where household_id = h_id;
  assigned_color := case when member_count = 0 then 'coral' else 'teal' end;

  insert into household_members (household_id, user_id, display_name, color)
  values (h_id, auth.uid(), p_display_name, assigned_color)
  on conflict (household_id, user_id)
  do update set display_name = excluded.display_name;

  return h_id;
end;
$$;

grant execute on function bootstrap_household(text) to authenticated;
