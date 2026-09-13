import type {
  Account,
  Category,
  DraftTransaction,
  Person,
  RecurringPayment,
  SavingsGoal,
  Settlement,
  Transaction,
} from '../types'

export const PEOPLE: Record<string, Person> = {
  gonzalo: { id: 'gonzalo', name: 'Gonzalo', initial: 'G', color: 'teal' },
  luciana: { id: 'luciana', name: 'Luciana', initial: 'L', color: 'coral' },
}

export const CATEGORIES: Category[] = [
  { id: 'comida', name: 'Comida', type: 'gasto', icon: 'food', color: 'coral' },
  { id: 'hogar', name: 'Arriendo y hogar', type: 'gasto', icon: 'building', color: 'indigo' },
  { id: 'transporte', name: 'Transporte', type: 'gasto', icon: 'car', color: 'teal' },
  { id: 'compras', name: 'Compras', type: 'gasto', icon: 'bag', color: 'gold' },
  { id: 'ocio', name: 'Entretenimiento', type: 'gasto', icon: 'film', color: 'berry' },
  { id: 'salud', name: 'Salud', type: 'gasto', icon: 'heart', color: 'success' },
  { id: 'sueldo', name: 'Sueldo', type: 'ingreso', icon: 'wallet', color: 'success' },
]

export const TRANSACTIONS: Transaction[] = [
  { id: 't1', description: 'Supermercado Jumbo', categoryId: 'comida', amount: 38500, date: '2026-09-12', paidBy: 'luciana', split: '50/50' },
  { id: 't2', description: 'Bencina Copec', categoryId: 'transporte', amount: 25000, date: '2026-09-12', paidBy: 'gonzalo', split: 'personal' },
  { id: 't3', description: 'Falabella', categoryId: 'compras', amount: 54200, date: '2026-09-11', paidBy: 'luciana', split: 'custom', splitRatio: [0.7, 0.3] },
  { id: 't4', description: 'Sueldo Gonzalo', categoryId: 'sueldo', amount: 980000, date: '2026-09-05', paidBy: 'gonzalo', split: 'personal' },
  { id: 't5', description: 'Cine con amigos', categoryId: 'ocio', amount: 12000, date: '2026-09-05', paidBy: 'luciana', split: 'personal' },
  { id: 't6', description: 'Netflix', categoryId: 'ocio', amount: 9990, date: '2026-09-03', paidBy: 'gonzalo', split: '50/50' },
]

export const BUDGETS = [
  { categoryId: 'comida', monthlyLimit: 350000 },
  { categoryId: 'transporte', monthlyLimit: 150000 },
  { categoryId: 'ocio', monthlyLimit: 60000 },
  { categoryId: 'compras', monthlyLimit: 250000 },
  { categoryId: 'hogar', monthlyLimit: 650000 },
]

export const ACCOUNTS: Account[] = [
  { id: 'mp', name: 'Mercado Pago', balance: 2340000, annualInterestRate: 0.045, lastReconciledAt: '2026-09-01' },
]

export const RECURRING_PAYMENTS: RecurringPayment[] = [
  { id: 'r1', name: 'Crédito consumo', categoryId: 'hogar', amount: 120000, dueDay: 15, payer: 'compartido', paidThisMonth: false },
  { id: 'r2', name: 'Seguro auto', categoryId: 'transporte', amount: 45000, dueDay: 20, payer: 'gonzalo', paidThisMonth: false },
  { id: 'r3', name: 'Gimnasio', categoryId: 'salud', amount: 35000, dueDay: 10, payer: 'luciana', paidThisMonth: false },
  { id: 'r4', name: 'Crédito auto', categoryId: 'transporte', amount: 185000, dueDay: 5, payer: 'gonzalo', paidThisMonth: true, paidOn: '2026-09-05' },
  { id: 'r5', name: 'Netflix', categoryId: 'ocio', amount: 9990, dueDay: 3, payer: 'compartido', paidThisMonth: true, paidOn: '2026-09-03' },
  { id: 'r6', name: 'Plan celular', categoryId: 'hogar', amount: 18000, dueDay: 1, payer: 'luciana', paidThisMonth: true, paidOn: '2026-09-01' },
]

export const SAVINGS_GOALS: SavingsGoal[] = [
  { id: 'g1', name: 'Viaje a San Pedro', icon: 'plane', color: 'teal', targetAmount: 800000, currentAmount: 350000 },
  { id: 'g2', name: 'Fondo de emergencia', icon: 'shield', color: 'coral', targetAmount: 2000000, currentAmount: 1200000 },
  {
    id: 'g3',
    name: 'Matrimonio',
    icon: 'rings',
    color: 'gold',
    targetAmount: 8000000,
    currentAmount: 350000,
    targetDate: '2028-03-15',
    monthlyContributionPlan: 180000,
  },
]

/** Historical monthly totals — mocked until real history accumulates in the database. */
export const MONTHLY_SPENDING = [
  { month: 'Abr', total: 620000 },
  { month: 'May', total: 705000 },
  { month: 'Jun', total: 780000 },
  { month: 'Jul', total: 690000 },
  { month: 'Ago', total: 910000 },
]

export const SETTLEMENTS: Settlement[] = [
  { id: 's1', from: 'gonzalo', to: 'luciana', amount: 50000, date: '2026-08-12' },
  { id: 's2', from: 'luciana', to: 'gonzalo', amount: 30000, date: '2026-08-02' },
]

export const DRAFT_TRANSACTIONS: DraftTransaction[] = [
  { id: 'd1', merchant: 'Starbucks Las Condes', amount: 6500, cardOwner: 'gonzalo', cardLast4: '4821', detectedAt: '2026-09-12T14:32:00', suggestedCategoryId: 'comida', suggestedSplit: 'personal' },
  { id: 'd2', merchant: 'Uber *Trip', amount: 8200, cardOwner: 'luciana', cardLast4: '1190', detectedAt: '2026-09-12T09:14:00', suggestedCategoryId: 'transporte', suggestedSplit: 'personal' },
  { id: 'd3', merchant: 'PedidosYa', amount: 15300, cardOwner: 'gonzalo', cardLast4: '4821', detectedAt: '2026-09-11T21:05:00', suggestedCategoryId: 'comida', suggestedSplit: '50/50' },
]
