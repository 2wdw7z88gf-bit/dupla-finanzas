import type { Account, Category, HouseholdMember, SavingsGoal, Settlement, Transaction, UserId } from '../types'
import { relativeDay } from './format'

export function categoryById(categories: Category[], id: string | null): Category {
  return categories.find((c) => c.id === id) ?? categories[0]
}

export function memberById(members: HouseholdMember[], id: UserId | null): HouseholdMember {
  return members.find((m) => m.id === id) ?? { id: id ?? '', displayName: 'Compartido', color: 'coral' }
}

export function totalByType(transactions: Transaction[], categories: Category[], type: 'gasto' | 'ingreso'): number {
  return transactions
    .filter((t) => categoryById(categories, t.categoryId).type === type)
    .reduce((sum, t) => sum + t.amount, 0)
}

export function categorySpent(transactions: Transaction[], categoryId: string): number {
  return transactions.filter((t) => t.categoryId === categoryId).reduce((sum, t) => sum + t.amount, 0)
}

export function recentTransactions(transactions: Transaction[], count: number): Transaction[] {
  return [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, count)
}

export function groupTransactionsByDay(transactions: Transaction[]): { date: string; label: string; items: Transaction[] }[] {
  const byDate = new Map<string, Transaction[]>()
  for (const t of [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1))) {
    if (!byDate.has(t.date)) byDate.set(t.date, [])
    byDate.get(t.date)!.push(t)
  }
  return Array.from(byDate.entries()).map(([date, items]) => ({ date, label: relativeDay(date), items }))
}

/** Simple-interest projection: real balance grows daily at annualRate/365 between reconciliations. */
export function projectedAccountBalance(account: Account, asOf: Date = new Date()) {
  const days = Math.max(
    0,
    Math.floor((asOf.getTime() - new Date(account.lastReconciledAt).getTime()) / 86400000),
  )
  const dailyRate = account.annualInterestRate / 365
  const accrued = account.balance * dailyRate * days
  return {
    days,
    dailyEstimate: Math.round(account.balance * dailyRate),
    accrued: Math.round(accrued),
    projected: Math.round(account.balance + accrued),
  }
}

/**
 * A goal linked to an account tracks that account's live (estimated) balance
 * instead of its own stored `currentAmount` — so progress updates itself as
 * the account earns interest, instead of needing to be typed in by hand.
 */
export function goalCurrentAmount(goal: SavingsGoal, accounts: Account[]): number {
  if (goal.accountId) {
    const account = accounts.find((a) => a.id === goal.accountId)
    if (account) return projectedAccountBalance(account).projected
  }
  return goal.currentAmount
}

/** Given a 2-person household, returns whichever id in `members` is NOT `id`. */
export function otherMember(members: UserId[], id: UserId): UserId | undefined {
  return members.find((m) => m !== id)
}

/**
 * Nets out who owes whom across shared transactions and settlements, for a
 * 2-person household. Positive `net[personId]` means the household owes
 * that person money.
 */
export function computeBalance(
  transactions: Transaction[],
  settlements: Settlement[],
  memberIds: UserId[],
): { owes: UserId; owedTo: UserId; amount: number } | null {
  if (memberIds.length < 2) return null
  const net = new Map<UserId, number>(memberIds.map((id) => [id, 0]))
  const bump = (id: UserId, delta: number) => net.set(id, (net.get(id) ?? 0) + delta)

  for (const t of transactions) {
    if (t.split === 'personal') continue
    const other = otherMember(memberIds, t.paidBy)
    if (!other) continue
    const otherShare = t.split === 'custom' && t.splitRatio ? t.splitRatio[1] : 0.5
    const otherOwes = t.amount * otherShare
    bump(t.paidBy, otherOwes)
    bump(other, -otherOwes)
  }

  for (const s of settlements) {
    bump(s.from, s.amount)
    bump(s.to, -s.amount)
  }

  for (const [id, amount] of net) {
    if (amount > 0.5) {
      const other = otherMember(memberIds, id)
      if (other) return { owes: other, owedTo: id, amount: Math.round(amount) }
    }
  }
  return null
}

/** Wedding-style goal calculator: months left, projected savings, and the credit shortfall (if any). */
export function goalProjection({
  currentAmount,
  targetAmount,
  targetDate,
  monthlyContribution,
  today = new Date(),
}: {
  currentAmount: number
  targetAmount: number
  targetDate: string
  monthlyContribution: number
  today?: Date
}) {
  const target = new Date(targetDate)
  const monthsLeft = Math.max(
    0,
    (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()),
  )
  const projected = currentAmount + monthlyContribution * monthsLeft
  const shortfall = Math.max(0, targetAmount - projected)
  const breakEvenMonthly = monthsLeft > 0 ? Math.ceil((targetAmount - currentAmount) / monthsLeft) : targetAmount
  return { monthsLeft, projected, shortfall, breakEvenMonthly }
}
