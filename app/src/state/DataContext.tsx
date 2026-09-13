import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  ACCOUNTS,
  BUDGETS,
  CATEGORIES,
  DRAFT_TRANSACTIONS,
  RECURRING_PAYMENTS,
  SAVINGS_GOALS,
  SETTLEMENTS,
  TRANSACTIONS,
} from '../data/mock'
import type { Account, Budget, Category, DraftTransaction, RecurringPayment, SavingsGoal, Settlement, Transaction } from '../types'

interface DataContextValue {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  accounts: Account[]
  recurringPayments: RecurringPayment[]
  savingsGoals: SavingsGoal[]
  settlements: Settlement[]
  draftTransactions: DraftTransaction[]
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  addCategory: (cat: Omit<Category, 'id'>) => void
  toggleRecurringPaid: (id: string) => void
  confirmDraft: (id: string, overrides?: Partial<Pick<Transaction, 'categoryId' | 'split'>>) => void
  discardDraft: (id: string) => void
  addSettlement: (settlement: Omit<Settlement, 'id'>) => void
}

const DataContext = createContext<DataContextValue | null>(null)

/**
 * In-memory demo store. This is where Supabase queries/mutations will slot in later —
 * the shape of these functions is designed to map 1:1 onto that future API.
 */
export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS)
  const [categories, setCategories] = useState<Category[]>(CATEGORIES)
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>(RECURRING_PAYMENTS)
  const [draftTransactions, setDraftTransactions] = useState<DraftTransaction[]>(DRAFT_TRANSACTIONS)
  const [settlements, setSettlements] = useState<Settlement[]>(SETTLEMENTS)

  const value = useMemo<DataContextValue>(
    () => ({
      transactions,
      categories,
      budgets: BUDGETS,
      accounts: ACCOUNTS,
      recurringPayments,
      savingsGoals: SAVINGS_GOALS,
      settlements,
      draftTransactions,
      addTransaction: (tx) => setTransactions((prev) => [{ ...tx, id: crypto.randomUUID() }, ...prev]),
      addCategory: (cat) => setCategories((prev) => [...prev, { ...cat, id: crypto.randomUUID() }]),
      toggleRecurringPaid: (id) =>
        setRecurringPayments((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, paidThisMonth: !r.paidThisMonth, paidOn: !r.paidThisMonth ? new Date().toISOString() : undefined }
              : r,
          ),
        ),
      confirmDraft: (id, overrides) => {
        const draft = draftTransactions.find((d) => d.id === id)
        if (!draft) return
        setTransactions((prev) => [
          {
            id: crypto.randomUUID(),
            description: draft.merchant,
            categoryId: overrides?.categoryId ?? draft.suggestedCategoryId,
            amount: draft.amount,
            date: draft.detectedAt.slice(0, 10),
            paidBy: draft.cardOwner,
            split: overrides?.split ?? draft.suggestedSplit,
          },
          ...prev,
        ])
        setDraftTransactions((prev) => prev.filter((d) => d.id !== id))
      },
      discardDraft: (id) => setDraftTransactions((prev) => prev.filter((d) => d.id !== id)),
      addSettlement: (s) => setSettlements((prev) => [{ ...s, id: crypto.randomUUID() }, ...prev]),
    }),
    [transactions, categories, recurringPayments, draftTransactions, settlements],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
