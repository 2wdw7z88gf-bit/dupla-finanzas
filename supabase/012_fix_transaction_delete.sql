-- Deleting a transaction that a "pago fijo" confirmation created was
-- silently failing: recurring_payment_instances.transaction_id referenced
-- it with no ON DELETE rule (defaults to blocking the delete). This makes
-- it so removing the transaction just unlinks it instead of blocking.

alter table recurring_payment_instances
  drop constraint if exists recurring_payment_instances_transaction_id_fkey;

alter table recurring_payment_instances
  add constraint recurring_payment_instances_transaction_id_fkey
  foreign key (transaction_id) references transactions (id) on delete set null;
