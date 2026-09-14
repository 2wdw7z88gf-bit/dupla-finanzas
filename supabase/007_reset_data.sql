-- Wipes all the example/test data so you can start clean — keeps your
-- login, household, and categories untouched. No household_id filter:
-- this project only ever serves your one household, so it's safe to
-- just clear every row in these tables. Run once. Cannot be undone.

delete from transactions;
delete from settlements;
delete from budgets;
delete from recurring_payments; -- also removes its recurring_payment_instances (cascade)
delete from savings_goals;
delete from accounts;
delete from draft_transactions;

-- Categories are intentionally left alone.
