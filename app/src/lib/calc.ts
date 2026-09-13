import type { Account, Category, PersonId, Settlement, Transaction } from '../types'
import { relativeDay } from './format'

export function categoryById(categories: Category[], id: string): Category {
  return categories.find((c) => c.id === id) ?? categories[0]
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
 * Nets out who owes whom across shared transactions and settlements.
 * Positive `net[personId]` means the household owes that person money.
 */
export function computeBalance(
  transactions: Transaction[],
  settlements: Settlement[],
): { owes: PersonId; owedTo: PersonId; amount: number } | null {
  const net: Record<PersonId, number> = { gonzalo: 0, luciana: 0 }

  for (const t of transactions) {
    if (t.split === 'personal') continue
    const otherShare = t.split === 'custom' && t.splitRatio ? t.splitRatio[1] : 0.5
    const other: PersonId = t.paidBy === 'gonzalo' ? 'luciana' : 'gonzalo'
    const otherOwes = t.amount * otherShare
    net[t.paidBy] += otherOwes
    net[other] -= otherOwes
  }

  for (const s of settlements) {
    net[s.from] += s.amount
    net[s.to] -= s.amount
  }

  if (net.gonzalo > 0.5) return { owes: 'luciana', owedTo: 'gonzalo', amount: Math.round(net.gonzalo) }
  if (net.luciana > 0.5) return { owes: 'gonzalo', owedTo: 'luciana', amount: Math.round(net.luciana) }
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
