-- Lets a savings goal optionally be linked to a savings account, so its
-- progress is the account's real (estimated) balance instead of a number
-- you type in and forget to update.

alter table savings_goals add column if not exists account_id uuid references accounts (id) on delete set null;
