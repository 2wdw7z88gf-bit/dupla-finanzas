-- Denormalizes household_id onto recurring_payment_instances so the app can
-- read/subscribe to it the same simple way as every other table (a plain
-- `eq('household_id', ...)`), instead of a join just for this one table.

alter table recurring_payment_instances add column if not exists household_id uuid references households (id) on delete cascade;

update recurring_payment_instances rpi
set household_id = rp.household_id
from recurring_payments rp
where rp.id = rpi.recurring_payment_id
  and rpi.household_id is null;

alter table recurring_payment_instances alter column household_id set not null;

drop policy if exists "members manage their recurring payment instances" on recurring_payment_instances;
create policy "members manage their recurring payment instances" on recurring_payment_instances
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));
