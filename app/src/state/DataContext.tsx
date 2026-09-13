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
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import { useRealtimeTable } from '../hooks/useRealtimeTable'
import {
  categoryToRow,
  mapAccount,
  mapBudget,
  mapCategory,
  mapDraftTransaction,
  mapRecurringPayment,
  mapSavingsGoal,
  mapSettlement,
  mapTransaction,
  settlementToRow,
  transactionToRow,
} from '../lib/mappers'
import type {
  Account,
  Budget,
  Category,
  DraftTransaction,
  RecurringPayment,
  SavingsGoal,
  Settlement,
  SplitType,
  Transaction,
} from '../types'

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

export function DataProvider({ children }: { children: ReactNode }) {
  return isSupabaseConfigured ? <RealDataProvider>{children}</RealDataProvider> : <MockDataProvider>{children}</MockDataProvider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

function currentPeriod(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

/** The real thing: every entity read live from Supabase and kept in sync via Realtime. */
function RealDataProvider({ children }: { children: ReactNode }) {
  const { householdId } = useAuth()
  const period = currentPeriod()

  const { rows: categoryRows } = useRealtimeTable<any>('categories', householdId, (r) => r.id)
  const { rows: transactionRows } = useRealtimeTable<any>('transactions', householdId, (r) => r.id, {
    column: 'date',
    ascending: false,
  })
  const { rows: budgetRows } = useRealtimeTable<any>('budgets', householdId, (r) => r.category_id)
  const { rows: accountRows } = useRealtimeTable<any>('accounts', householdId, (r) => r.id)
  const { rows: recurringRows } = useRealtimeTable<any>('recurring_payments', householdId, (r) => r.id)
  const { rows: instanceRows } = useRealtimeTable<any>('recurring_payment_instances', householdId, (r) => r.id)
  const { rows: goalRows } = useRealtimeTable<any>('savings_goals', householdId, (r) => r.id)
  const { rows: settlementRows } = useRealtimeTable<any>('settlements', householdId, (r) => r.id, {
    column: 'date',
    ascending: false,
  })
  const { rows: draftRows } = useRealtimeTable<any>('draft_transactions', householdId, (r) => r.id, {
    column: 'detected_at',
    ascending: false,
  })

  const categories = useMemo(() => categoryRows.map(mapCategory), [categoryRows])
  const transactions = useMemo(() => transactionRows.map(mapTransaction), [transactionRows])
  const budgets = useMemo(() => budgetRows.map(mapBudget), [budgetRows])
  const accounts = useMemo(() => accountRows.map(mapAccount), [accountRows])
  const savingsGoals = useMemo(() => goalRows.map(mapSavingsGoal), [goalRows])
  const settlements = useMemo(() => settlementRows.map(mapSettlement), [settlementRows])
  const draftTransactions = useMemo(
    () => draftRows.filter((r) => r.status === 'pending').map(mapDraftTransaction),
    [draftRows],
  )

  const recurringPayments = useMemo<RecurringPayment[]>(
    () =>
      recurringRows.map((r) => {
        const base = mapRecurringPayment(r)
        const instance = instanceRows.find((i) => i.recurring_payment_id === r.id && i.period === period)
        return { ...base, paidThisMonth: Boolean(instance?.paid_on), paidOn: instance?.paid_on ?? undefined }
      }),
    [recurringRows, instanceRows, period],
  )

  async function addTransaction(tx: Omit<Transaction, 'id'>) {
    if (!supabase || !householdId) return
    await supabase.from('transactions').insert(transactionToRow(householdId, tx))
  }

  async function addCategory(cat: Omit<Category, 'id'>) {
    if (!supabase || !householdId) return
    await supabase.from('categories').insert(categoryToRow(householdId, cat))
  }

  async function toggleRecurringPaid(id: string) {
    if (!supabase || !householdId) return
    const existing = instanceRows.find((i) => i.recurring_payment_id === id && i.period === period)
    const nowPaid = !existing?.paid_on
    await supabase.from('recurring_payment_instances').upsert(
      {
        household_id: householdId,
        recurring_payment_id: id,
        period,
        paid_on: nowPaid ? new Date().toISOString().slice(0, 10) : null,
      },
      { onConflict: 'recurring_payment_id,period' },
    )
  }

  async function confirmDraft(id: string, overrides?: Partial<Pick<Transaction, 'categoryId' | 'split'>>) {
    if (!supabase || !householdId) return
    const draft = draftRows.find((d) => d.id === id)
    if (!draft) return
    await supabase.from('transactions').insert(
      transactionToRow(householdId, {
        description: draft.merchant,
        categoryId: overrides?.categoryId ?? draft.suggested_category_id,
        amount: Number(draft.amount),
        date: String(draft.detected_at).slice(0, 10),
        paidBy: draft.card_owner,
        split: overrides?.split ?? draft.suggested_split,
      }),
    )
    await supabase.from('draft_transactions').update({ status: 'confirmed' }).eq('id', id)
  }

  async function discardDraft(id: string) {
    if (!supabase) return
    await supabase.from('draft_transactions').update({ status: 'discarded' }).eq('id', id)
  }

  async function addSettlement(s: Omit<Settlement, 'id'>) {
    if (!supabase || !householdId) return
    await supabase.from('settlements').insert(settlementToRow(householdId, s))
  }

  const value: DataContextValue = {
    transactions,
    categories,
    budgets,
    accounts,
    recurringPayments,
    savingsGoals,
    settlements,
    draftTransactions,
    addTransaction,
    addCategory,
    toggleRecurringPaid,
    confirmDraft,
    discardDraft,
    addSettlement,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

/**
 * Demo mode: an in-memory store with example data, used whenever Supabase
 * isn't configured (see lib/supabase.ts). Lets the app be tried out with
 * zero setup.
 */
function MockDataProvider({ children }: { children: ReactNode }) {
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
            categoryId: overrides?.categoryId ?? draft.suggestedCategoryId ?? categories[0]?.id,
            amount: draft.amount,
            date: draft.detectedAt.slice(0, 10),
            paidBy: draft.cardOwner,
            split: (overrides?.split ?? draft.suggestedSplit) as SplitType,
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
