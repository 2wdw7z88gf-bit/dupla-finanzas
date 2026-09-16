/** A user's id (auth.users.id / household_members.user_id) — always a uuid once real data is wired. */
export type UserId = string

export interface HouseholdMember {
  id: UserId
  displayName: string
  color: 'coral' | 'teal'
}

export type SplitType = '50/50' | 'personal' | 'custom'

export interface Category {
  id: string
  name: string
  type: 'gasto' | 'ingreso'
  icon: string
  color: 'coral' | 'teal' | 'gold' | 'success' | 'indigo' | 'berry' | 'amber' | 'violet'
}

export interface Transaction {
  id: string
  description: string
  categoryId: string
  amount: number
  date: string // ISO date
  paidBy: UserId
  split: SplitType
  splitRatio?: [number, number] // [paidBy share, other share], only for 'custom'
}

export interface Budget {
  categoryId: string
  monthlyLimit: number
}

export interface Account {
  id: string
  name: string
  balance: number
  annualInterestRate: number // e.g. 0.045 for 4.5%
  lastReconciledAt: string
}

export interface RecurringPayment {
  id: string
  name: string
  categoryId: string
  amount: number
  dueDay: number
  payer: UserId | null // null = compartido
  paidThisMonth: boolean
  paidOn?: string
}

export interface SavingsGoal {
  id: string
  name: string
  icon: 'plane' | 'shield' | 'rings'
  color: 'teal' | 'coral' | 'gold'
  targetAmount: number
  currentAmount: number
  targetDate?: string
  monthlyContributionPlan?: number
  /** When set, the goal's progress tracks this account's balance instead of `currentAmount`. */
  accountId?: string
}

export interface Settlement {
  id: string
  from: UserId
  to: UserId
  amount: number
  date: string
}

export interface DraftTransaction {
  id: string
  merchant: string
  amount: number
  cardOwner: UserId
  cardLast4: string
  detectedAt: string
  suggestedCategoryId: string | null
  suggestedSplit: SplitType
}
