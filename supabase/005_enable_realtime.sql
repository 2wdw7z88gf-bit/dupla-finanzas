-- Turns on Supabase Realtime replication for every table the app subscribes
-- to. Without this, postgres_changes subscriptions connect successfully but
-- silently never receive an event — inserts/updates would only show up
-- after a manual page reload instead of live, for both of you.

alter publication supabase_realtime add table
  household_members,
  categories,
  transactions,
  budgets,
  accounts,
  recurring_payments,
  recurring_payment_instances,
  savings_goals,
  settlements,
  draft_transactions;
