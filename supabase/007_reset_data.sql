-- Wipes all the example/test data for your household so you can start
-- clean — keeps your login, household, and categories untouched.
-- Run once in the SQL Editor. This cannot be undone.

with h as (select id from households order by created_at asc limit 1)
delete from transactions where household_id in (select id from h);

with h as (select id from households order by created_at asc limit 1)
delete from settlements where household_id in (select id from h);

with h as (select id from households order by created_at asc limit 1)
delete from budgets where household_id in (select id from h);

with h as (select id from households order by created_at asc limit 1)
delete from recurring_payments where household_id in (select id from h); -- also removes its recurring_payment_instances (cascade)

with h as (select id from households order by created_at asc limit 1)
delete from savings_goals where household_id in (select id from h);

with h as (select id from households order by created_at asc limit 1)
delete from accounts where household_id in (select id from h);

with h as (select id from households order by created_at asc limit 1)
delete from draft_transactions where household_id in (select id from h);

-- Categories are intentionally left alone.
