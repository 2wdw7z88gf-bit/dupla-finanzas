// Supabase returns Postgres `numeric` columns as strings (they don't fit safely
// in a JS number type-wise), so every money/rate column needs an explicit
// Number(...) on the way in.
import type { Account, Budget, Category, Debt, DraftTransaction, RecurringPayment, SavingsGoal, Settlement, Transaction } from '../types'

const num = (v: unknown) => Number(v ?? 0)

export function mapCategory(row: any): Category {
  return { id: row.id, name: row.name, type: row.type, icon: row.icon, color: row.color }
}

export function categoryToRow(householdId: string, cat: Omit<Category, 'id'>) {
  return { household_id: householdId, name: cat.name, type: cat.type, icon: cat.icon, color: cat.color }
}

export function mapTransaction(row: any): Transaction {
  const ratio = row.split_ratio == null ? undefined : num(row.split_ratio)
  return {
    id: row.id,
    description: row.description,
    categoryId: row.category_id,
    amount: num(row.amount),
    date: row.date,
    paidBy: row.paid_by,
    split: row.split,
    splitRatio: ratio == null ? undefined : [ratio, 1 - ratio],
  }
}

export function transactionToRow(householdId: string, tx: Omit<Transaction, 'id'>) {
  return {
    household_id: householdId,
    category_id: tx.categoryId,
    description: tx.description,
    amount: tx.amount,
    date: tx.date,
    paid_by: tx.paidBy,
    split: tx.split,
    split_ratio: tx.split === 'custom' && tx.splitRatio ? tx.splitRatio[0] : null,
  }
}

export function mapBudget(row: any): Budget {
  return { categoryId: row.category_id, monthlyLimit: num(row.monthly_limit) }
}

export function accountToRow(householdId: string, account: Omit<Account, 'id'>) {
  return {
    household_id: householdId,
    name: account.name,
    balance: account.balance,
    annual_interest_rate: account.annualInterestRate,
    last_reconciled_at: account.lastReconciledAt,
  }
}

export function mapAccount(row: any): Account {
  return {
    id: row.id,
    name: row.name,
    balance: num(row.balance),
    annualInterestRate: num(row.annual_interest_rate),
    lastReconciledAt: row.last_reconciled_at,
  }
}

export function mapRecurringPayment(row: any): Omit<RecurringPayment, 'paidThisMonth' | 'paidOn'> {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    amount: num(row.amount),
    dueDay: row.due_day,
    payer: row.payer,
  }
}

export function mapSavingsGoal(row: any): SavingsGoal {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    targetAmount: num(row.target_amount),
    currentAmount: num(row.current_amount),
    targetDate: row.target_date ?? undefined,
    monthlyContributionPlan: row.monthly_contribution_plan == null ? undefined : num(row.monthly_contribution_plan),
    accountId: row.account_id ?? undefined,
  }
}

export function savingsGoalToRow(householdId: string, goal: Omit<SavingsGoal, 'id'>) {
  return {
    household_id: householdId,
    name: goal.name,
    icon: goal.icon,
    color: goal.color,
    target_amount: goal.targetAmount,
    current_amount: goal.currentAmount,
    target_date: goal.targetDate ?? null,
    monthly_contribution_plan: goal.monthlyContributionPlan ?? null,
    account_id: goal.accountId ?? null,
  }
}

export function mapSettlement(row: any): Settlement {
  return { id: row.id, from: row.from_user, to: row.to_user, amount: num(row.amount), date: row.date }
}

export function settlementToRow(householdId: string, s: Omit<Settlement, 'id'>) {
  return { household_id: householdId, from_user: s.from, to_user: s.to, amount: s.amount, date: s.date }
}

export function mapDebt(row: any): Debt {
  return {
    id: row.id,
    name: row.name,
    creditor: row.creditor ?? undefined,
    originalAmount: row.original_amount == null ? undefined : num(row.original_amount),
    remainingAmount: num(row.remaining_amount),
    monthlyPayment: row.monthly_payment == null ? undefined : num(row.monthly_payment),
    dueDay: row.due_day ?? undefined,
  }
}

export function debtToRow(householdId: string, debt: Omit<Debt, 'id'>) {
  return {
    household_id: householdId,
    name: debt.name,
    creditor: debt.creditor ?? null,
    original_amount: debt.originalAmount ?? null,
    remaining_amount: debt.remainingAmount,
    monthly_payment: debt.monthlyPayment ?? null,
    due_day: debt.dueDay ?? null,
  }
}

export function mapDraftTransaction(row: any): DraftTransaction {
  return {
    id: row.id,
    merchant: row.merchant,
    amount: num(row.amount),
    cardOwner: row.card_owner,
    cardLast4: row.card_last4,
    detectedAt: row.detected_at,
    suggestedCategoryId: row.suggested_category_id,
    suggestedSplit: row.suggested_split,
  }
}
