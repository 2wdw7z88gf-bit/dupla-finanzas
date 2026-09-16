-- Lets a debt have an optional category, used to classify the transaction
-- created automatically every time you register a payment against it.
alter table debts add column if not exists category_id uuid references categories (id);
