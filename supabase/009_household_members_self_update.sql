-- schema.sql only ever gave household_members a SELECT policy, so nobody
-- could actually update their own display_name/color from the app — the
-- write silently matched zero rows (RLS, not an error). This lets you
-- update only your OWN row, never anyone else's.

create policy "members can update their own membership row" on household_members
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());
