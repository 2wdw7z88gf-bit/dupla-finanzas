-- Debts: credit cards, loans, money owed to someone outside the household —
-- a balance that persists and goes DOWN as you register payments, unlike a
-- budget (which resets every month). `creditor` is free text since who it's
-- owed to is often not a household member (a bank, a friend, a relative).

create table debts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name text not null,
  creditor text, -- e.g. "Banco Falabella", "Mamá" — free text, optional
  original_amount numeric(14, 0), -- optional, just for reference ("started at $X")
  remaining_amount numeric(14, 0) not null check (remaining_amount >= 0),
  monthly_payment numeric(12, 0), -- optional planned/minimum payment
  due_day smallint check (due_day between 1 and 31), -- optional
  created_at timestamptz not null default now()
);

alter table debts enable row level security;
create policy "members manage their debts" on debts
  for all using (household_id in (select current_household_ids()))
  with check (household_id in (select current_household_ids()));

alter publication supabase_realtime add table debts;
