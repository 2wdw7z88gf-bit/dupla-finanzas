import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  ACCOUNTS,
  BUDGETS,
  CATEGORIES,
  DEBTS,
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
  accountToRow,
  categoryToRow,
  debtToRow,
  mapAccount,
  mapBudget,
  mapCategory,
  mapDebt,
  mapDraftTransaction,
  mapRecurringPayment,
  mapSavingsGoal,
  mapSettlement,
  mapTransaction,
  recurringPaymentToRow,
  savingsGoalToRow,
  settlementToRow,
  transactionToRow,
} from '../lib/mappers'
import type {
  Account,
  Budget,
  Category,
  Debt,
  DraftTransaction,
  RecurringPayment,
  SavingsGoal,
  Settlement,
  SplitType,
  Transaction,
  UserId,
} from '../types'

export interface PaymentDetails {
  amount: number
  date: string
  categoryId: string
  paidBy: UserId
  split: SplitType
}

interface DataContextValue {
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
  accounts: Account[]
  recurringPayments: RecurringPayment[]
  savingsGoals: SavingsGoal[]
  settlements: Settlement[]
  draftTransactions: DraftTransaction[]
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<string | undefined>
  updateTransaction: (id: string, patch: Partial<Omit<Transaction, 'id'>>) => void
  deleteTransaction: (id: string) => void
  addCategory: (cat: Omit<Category, 'id'>) => void
  addRecurringPayment: (r: Omit<RecurringPayment, 'id' | 'paidThisMonth' | 'paidOn'>) => void
  updateRecurringPayment: (id: string, patch: Partial<Omit<RecurringPayment, 'id' | 'paidThisMonth' | 'paidOn'>>) => void
  deleteRecurringPayment: (id: string) => void
  /** Marks a recurring payment paid for the current month AND creates the matching transaction. */
  confirmRecurringPayment: (id: string, details: Omit<PaymentDetails, 'categoryId'>) => void
  /** Undoes "paid" for the current month and removes the transaction it created. */
  undoRecurringPayment: (id: string) => void
  confirmDraft: (id: string, overrides?: Partial<Pick<Transaction, 'categoryId' | 'split'>>) => void
  discardDraft: (id: string) => void
  addSettlement: (settlement: Omit<Settlement, 'id'>) => void
  addBudget: (categoryId: string, monthlyLimit: number) => void
  addAccount: (account: Omit<Account, 'id'>) => void
  reconcileAccount: (id: string, balance: number) => void
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void
  updateSavingsGoal: (id: string, patch: Partial<Omit<SavingsGoal, 'id'>>) => void
  debts: Debt[]
  addDebt: (debt: Omit<Debt, 'id'>) => void
  updateDebt: (id: string, patch: Partial<Omit<Debt, 'id'>>) => void
  deleteDebt: (id: string) => void
  /** Registers a payment against a debt: creates the matching transaction and reduces the balance owed. */
  registerDebtPayment: (id: string, details: PaymentDetails) => void
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
  const { rows: debtRows } = useRealtimeTable<any>('debts', householdId, (r) => r.id)

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
  const debts = useMemo(() => debtRows.map(mapDebt), [debtRows])

  const recurringPayments = useMemo<RecurringPayment[]>(
    () =>
      recurringRows.map((r) => {
        const base = mapRecurringPayment(r)
        const instance = instanceRows.find((i) => i.recurring_payment_id === r.id && i.period === period)
        return { ...base, paidThisMonth: Boolean(instance?.paid_on), paidOn: instance?.paid_on ?? undefined }
      }),
    [recurringRows, instanceRows, period],
  )

  async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<string | undefined> {
    if (!supabase || !householdId) return undefined
    const { data } = await supabase.from('transactions').insert(transactionToRow(householdId, tx)).select('id').single()
    return data?.id
  }

  async function updateTransaction(id: string, patch: Partial<Omit<Transaction, 'id'>>) {
    if (!supabase) return
    const row: Record<string, unknown> = {}
    if (patch.description !== undefined) row.description = patch.description
    if (patch.categoryId !== undefined) row.category_id = patch.categoryId
    if (patch.amount !== undefined) row.amount = patch.amount
    if (patch.date !== undefined) row.date = patch.date
    if (patch.paidBy !== undefined) row.paid_by = patch.paidBy
    if (patch.split !== undefined) row.split = patch.split
    if (patch.splitRatio !== undefined) row.split_ratio = patch.split === 'custom' && patch.splitRatio ? patch.splitRatio[0] : null
    await supabase.from('transactions').update(row).eq('id', id)
  }

  async function deleteTransaction(id: string) {
    if (!supabase) return
    await supabase.from('transactions').delete().eq('id', id)
  }

  async function addCategory(cat: Omit<Category, 'id'>) {
    if (!supabase || !householdId) return
    await supabase.from('categories').insert(categoryToRow(householdId, cat))
  }

  async function addRecurringPayment(r: Omit<RecurringPayment, 'id' | 'paidThisMonth' | 'paidOn'>) {
    if (!supabase || !householdId) return
    await supabase.from('recurring_payments').insert(recurringPaymentToRow(householdId, r))
  }

  async function updateRecurringPayment(id: string, patch: Partial<Omit<RecurringPayment, 'id' | 'paidThisMonth' | 'paidOn'>>) {
    if (!supabase) return
    const row: Record<string, unknown> = {}
    if (patch.name !== undefined) row.name = patch.name
    if (patch.categoryId !== undefined) row.category_id = patch.categoryId
    if (patch.amount !== undefined) row.amount = patch.amount
    if (patch.dueDay !== undefined) row.due_day = patch.dueDay
    if (patch.payer !== undefined) row.payer = patch.payer
    await supabase.from('recurring_payments').update(row).eq('id', id)
  }

  async function deleteRecurringPayment(id: string) {
    if (!supabase) return
    await supabase.from('recurring_payments').delete().eq('id', id)
  }

  async function confirmRecurringPayment(id: string, details: Omit<PaymentDetails, 'categoryId'>) {
    if (!supabase || !householdId) return
    const rp = recurringRows.find((r) => r.id === id)
    if (!rp) return
    const transactionId = await addTransaction({
      description: rp.name,
      categoryId: rp.category_id,
      amount: details.amount,
      date: details.date,
      paidBy: details.paidBy,
      split: details.split,
    })
    await supabase.from('recurring_payment_instances').upsert(
      { household_id: householdId, recurring_payment_id: id, period, paid_on: details.date, transaction_id: transactionId ?? null },
      { onConflict: 'recurring_payment_id,period' },
    )
  }

  async function undoRecurringPayment(id: string) {
    if (!supabase || !householdId) return
    const existing = instanceRows.find((i) => i.recurring_payment_id === id && i.period === period)
    if (existing?.transaction_id) {
      await supabase.from('transactions').delete().eq('id', existing.transaction_id)
    }
    await supabase.from('recurring_payment_instances').upsert(
      { household_id: householdId, recurring_payment_id: id, period, paid_on: null, transaction_id: null },
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

  async function addBudget(categoryId: string, monthlyLimit: number) {
    if (!supabase || !householdId) return
    await supabase
      .from('budgets')
      .upsert({ household_id: householdId, category_id: categoryId, monthly_limit: monthlyLimit }, { onConflict: 'household_id,category_id' })
  }

  async function addAccount(account: Omit<Account, 'id'>) {
    if (!supabase || !householdId) return
    await supabase.from('accounts').insert(accountToRow(householdId, account))
  }

  async function reconcileAccount(id: string, balance: number) {
    if (!supabase) return
    await supabase.from('accounts').update({ balance, last_reconciled_at: new Date().toISOString().slice(0, 10) }).eq('id', id)
  }

  async function addSavingsGoal(goal: Omit<SavingsGoal, 'id'>) {
    if (!supabase || !householdId) return
    await supabase.from('savings_goals').insert(savingsGoalToRow(householdId, goal))
  }

  async function updateSavingsGoal(id: string, patch: Partial<Omit<SavingsGoal, 'id'>>) {
    if (!supabase) return
    const row: Record<string, unknown> = {}
    if (patch.name !== undefined) row.name = patch.name
    if (patch.icon !== undefined) row.icon = patch.icon
    if (patch.color !== undefined) row.color = patch.color
    if (patch.targetAmount !== undefined) row.target_amount = patch.targetAmount
    if (patch.currentAmount !== undefined) row.current_amount = patch.currentAmount
    if (patch.targetDate !== undefined) row.target_date = patch.targetDate ?? null
    if (patch.monthlyContributionPlan !== undefined) row.monthly_contribution_plan = patch.monthlyContributionPlan ?? null
    if (patch.accountId !== undefined) row.account_id = patch.accountId ?? null
    await supabase.from('savings_goals').update(row).eq('id', id)
  }

  async function addDebt(debt: Omit<Debt, 'id'>) {
    if (!supabase || !householdId) return
    await supabase.from('debts').insert(debtToRow(householdId, debt))
  }

  async function updateDebt(id: string, patch: Partial<Omit<Debt, 'id'>>) {
    if (!supabase) return
    const row: Record<string, unknown> = {}
    if (patch.name !== undefined) row.name = patch.name
    if (patch.creditor !== undefined) row.creditor = patch.creditor ?? null
    if (patch.originalAmount !== undefined) row.original_amount = patch.originalAmount ?? null
    if (patch.remainingAmount !== undefined) row.remaining_amount = patch.remainingAmount
    if (patch.monthlyPayment !== undefined) row.monthly_payment = patch.monthlyPayment ?? null
    if (patch.dueDay !== undefined) row.due_day = patch.dueDay ?? null
    await supabase.from('debts').update(row).eq('id', id)
  }

  async function deleteDebt(id: string) {
    if (!supabase) return
    await supabase.from('debts').delete().eq('id', id)
  }

  async function registerDebtPayment(id: string, details: PaymentDetails) {
    const debt = debts.find((d) => d.id === id)
    if (!debt) return
    await addTransaction({
      description: `Pago ${debt.name}`,
      categoryId: details.categoryId,
      amount: details.amount,
      date: details.date,
      paidBy: details.paidBy,
      split: details.split,
    })
    await updateDebt(id, { remainingAmount: Math.max(0, debt.remainingAmount - details.amount) })
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
    updateTransaction,
    deleteTransaction,
    addCategory,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    confirmRecurringPayment,
    undoRecurringPayment,
    confirmDraft,
    discardDraft,
    addSettlement,
    addBudget,
    addAccount,
    reconcileAccount,
    addSavingsGoal,
    updateSavingsGoal,
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
    registerDebtPayment,
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
  const [budgets, setBudgets] = useState<Budget[]>(BUDGETS)
  const [accounts, setAccounts] = useState<Account[]>(ACCOUNTS)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(SAVINGS_GOALS)
  const [debts, setDebts] = useState<Debt[]>(DEBTS)
  const [recurringPayments, setRecurringPayments] = useState<RecurringPayment[]>(RECURRING_PAYMENTS)
  const [recurringTxMap, setRecurringTxMap] = useState<Record<string, string>>({})
  const [draftTransactions, setDraftTransactions] = useState<DraftTransaction[]>(DRAFT_TRANSACTIONS)
  const [settlements, setSettlements] = useState<Settlement[]>(SETTLEMENTS)

  const value = useMemo<DataContextValue>(
    () => ({
      transactions,
      categories,
      budgets,
      accounts,
      recurringPayments,
      savingsGoals,
      settlements,
      draftTransactions,
      addTransaction: async (tx) => {
        const id = crypto.randomUUID()
        setTransactions((prev) => [{ ...tx, id }, ...prev])
        return id
      },
      updateTransaction: (id, patch) => setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      deleteTransaction: (id) => setTransactions((prev) => prev.filter((t) => t.id !== id)),
      addCategory: (cat) => setCategories((prev) => [...prev, { ...cat, id: crypto.randomUUID() }]),
      addRecurringPayment: (r) =>
        setRecurringPayments((prev) => [...prev, { ...r, id: crypto.randomUUID(), paidThisMonth: false }]),
      updateRecurringPayment: (id, patch) =>
        setRecurringPayments((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))),
      deleteRecurringPayment: (id) => setRecurringPayments((prev) => prev.filter((r) => r.id !== id)),
      confirmRecurringPayment: (id, details) => {
        const rp = recurringPayments.find((r) => r.id === id)
        if (!rp) return
        const txId = crypto.randomUUID()
        setTransactions((prev) => [
          {
            id: txId,
            description: rp.name,
            categoryId: rp.categoryId,
            amount: details.amount,
            date: details.date,
            paidBy: details.paidBy,
            split: details.split,
          },
          ...prev,
        ])
        setRecurringTxMap((prev) => ({ ...prev, [id]: txId }))
        setRecurringPayments((prev) => prev.map((r) => (r.id === id ? { ...r, paidThisMonth: true, paidOn: details.date } : r)))
      },
      undoRecurringPayment: (id) => {
        const txId = recurringTxMap[id]
        if (txId) setTransactions((prev) => prev.filter((t) => t.id !== txId))
        setRecurringTxMap((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        setRecurringPayments((prev) => prev.map((r) => (r.id === id ? { ...r, paidThisMonth: false, paidOn: undefined } : r)))
      },
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
      addBudget: (categoryId, monthlyLimit) =>
        setBudgets((prev) =>
          prev.some((b) => b.categoryId === categoryId)
            ? prev.map((b) => (b.categoryId === categoryId ? { ...b, monthlyLimit } : b))
            : [...prev, { categoryId, monthlyLimit }],
        ),
      addAccount: (account) => setAccounts((prev) => [...prev, { ...account, id: crypto.randomUUID() }]),
      reconcileAccount: (id, balance) =>
        setAccounts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, balance, lastReconciledAt: new Date().toISOString().slice(0, 10) } : a)),
        ),
      addSavingsGoal: (goal) => setSavingsGoals((prev) => [...prev, { ...goal, id: crypto.randomUUID() }]),
      updateSavingsGoal: (id, patch) => setSavingsGoals((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g))),
      debts,
      addDebt: (debt) => setDebts((prev) => [...prev, { ...debt, id: crypto.randomUUID() }]),
      updateDebt: (id, patch) => setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d))),
      deleteDebt: (id) => setDebts((prev) => prev.filter((d) => d.id !== id)),
      registerDebtPayment: (id, details) => {
        const debt = debts.find((d) => d.id === id)
        if (!debt) return
        setTransactions((prev) => [
          {
            id: crypto.randomUUID(),
            description: `Pago ${debt.name}`,
            categoryId: details.categoryId,
            amount: details.amount,
            date: details.date,
            paidBy: details.paidBy,
            split: details.split,
          },
          ...prev,
        ])
        setDebts((prev) =>
          prev.map((d) => (d.id === id ? { ...d, remainingAmount: Math.max(0, d.remainingAmount - details.amount) } : d)),
        )
      },
    }),
    [transactions, categories, budgets, accounts, savingsGoals, debts, recurringPayments, recurringTxMap, draftTransactions, settlements],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}
