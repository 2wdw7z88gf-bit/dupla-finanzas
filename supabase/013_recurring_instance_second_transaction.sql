-- Supports "cada uno paga su parte" when confirming a pago fijo: two people,
-- two separate transactions for the same month's payment. Second slot only
-- — this app is for a 2-person household, so two legs is the max needed.
alter table recurring_payment_instances add column if not exists transaction_id_2 uuid references transactions (id) on delete set null;
