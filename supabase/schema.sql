-- Dupla — schema for a 2-person shared household finance app.
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query).
-- Everything is scoped to a "household" (the couple) via Row Level Security,
-- so each household only ever sees its own rows.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Households & membership
-- ---------------------------------------------------------------------------

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Nuestro hogar',
  currency text not null default 'CLP',
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  color text not null default 'coral' check (color in ('coral', 'teal')),
  primary key (household_id, user_id)
);

create or replace function current_household_ids()
returns setof uuid
language sql stable security definer
as $$
  select household_id from household_members where user_id = auth.uid()
$$;

alter table households enable row level security;
alter table household_members enable row level security;

create policy "members can read their household" on households
  for select using (id in (select current_household_ids()));

create policy "members can read their membership rows" on household_members
  for select using (household_id in (select current_household_ids()));

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  type text not null check (type in ('gasto', 'ingreso')),
  icon text not null default 'food',
  color text not null default 'coral',
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
create policy "members manage their categories" on categories
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));

-- ---------------------------------------------------------------------------
-- Transactions
-- ---------------------------------------------------------------------------

create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  category_id uuid not null references categories (id),
  description text not null,
  amount numeric(12, 0) not null check (amount > 0),
  date date not null default current_date,
  paid_by uuid not null references auth.users (id),
  split text not null default '50/50' check (split in ('50/50', 'personal', 'custom')),
  split_ratio numeric(3, 2), -- payer's share, only set when split = 'custom'
  created_at timestamptz not null default now()
);

create index transactions_household_date_idx on transactions (household_id, date desc);

alter table transactions enable row level security;
create policy "members manage their transactions" on transactions
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));

-- ---------------------------------------------------------------------------
-- Budgets (one row per category per household; the limit applies every month)
-- ---------------------------------------------------------------------------

create table budgets (
  household_id uuid not null references households (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  monthly_limit numeric(12, 0) not null check (monthly_limit > 0),
  primary key (household_id, category_id)
);

alter table budgets enable row level security;
create policy "members manage their budgets" on budgets
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));

-- ---------------------------------------------------------------------------
-- Settlements (a real transfer between the two people, to zero out a balance)
-- ---------------------------------------------------------------------------

create table settlements (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  from_user uuid not null references auth.users (id),
  to_user uuid not null references auth.users (id),
  amount numeric(12, 0) not null check (amount > 0),
  date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table settlements enable row level security;
create policy "members manage their settlements" on settlements
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));

-- ---------------------------------------------------------------------------
-- Savings accounts (e.g. Mercado Pago) — reconciled balance + interest rate
-- ---------------------------------------------------------------------------

create table accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  balance numeric(14, 0) not null default 0,
  annual_interest_rate numeric(5, 4) not null default 0, -- e.g. 0.0450 = 4.5%
  last_reconciled_at date not null default current_date
);

alter table accounts enable row level security;
create policy "members manage their accounts" on accounts
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));

-- ---------------------------------------------------------------------------
-- Recurring payments (credits, subscriptions, etc.) + per-month paid status
-- ---------------------------------------------------------------------------

create table recurring_payments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  category_id uuid not null references categories (id),
  name text not null,
  amount numeric(12, 0) not null check (amount > 0),
  due_day smallint not null check (due_day between 1 and 31),
  payer uuid references auth.users (id), -- null = compartido
  active boolean not null default true
);

create table recurring_payment_instances (
  id uuid primary key default gen_random_uuid(),
  recurring_payment_id uuid not null references recurring_payments (id) on delete cascade,
  period date not null, -- first day of the month this instance is for
  paid_on date,
  transaction_id uuid references transactions (id),
  unique (recurring_payment_id, period)
);

alter table recurring_payments enable row level security;
alter table recurring_payment_instances enable row level security;
create policy "members manage their recurring payments" on recurring_payments
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));
create policy "members manage their recurring payment instances" on recurring_payment_instances
  for all using (
    recurring_payment_id in (
      select id from recurring_payments where household_id in (select current_household_ids())
    )
  );

-- ---------------------------------------------------------------------------
-- Savings goals (supports the wedding-style "credit needed" calculator)
-- ---------------------------------------------------------------------------

create table savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  icon text not null default 'plane',
  color text not null default 'teal',
  target_amount numeric(14, 0) not null check (target_amount > 0),
  current_amount numeric(14, 0) not null default 0,
  target_date date, -- null = open-ended goal, no credit projection shown
  monthly_contribution_plan numeric(12, 0)
);

alter table savings_goals enable row level security;
create policy "members manage their savings goals" on savings_goals
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));

-- ---------------------------------------------------------------------------
-- Draft transactions (parsed from forwarded bank "compra aprobada" emails,
-- pending a human tap in "Por confirmar" before they become real transactions)
-- ---------------------------------------------------------------------------

create table draft_transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  merchant text not null,
  amount numeric(12, 0) not null check (amount > 0),
  card_owner uuid not null references auth.users (id),
  card_last4 text not null,
  detected_at timestamptz not null default now(),
  suggested_category_id uuid references categories (id),
  suggested_split text not null default 'personal' check (suggested_split in ('50/50', 'personal', 'custom')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'discarded'))
);

alter table draft_transactions enable row level security;
create policy "members manage their draft transactions" on draft_transactions
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));

-- The inbound-email parser (a Supabase Edge Function, added when we wire up
-- "Correo del banco") inserts here with the service role key, which bypasses
-- RLS — no extra policy needed for that part.
