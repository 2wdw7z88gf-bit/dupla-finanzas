import { Link } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { TransactionRow } from '../components/ui/TransactionRow'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LightbulbIcon,
  MailIcon,
  PlusIcon,
  RepeatIcon,
  ScaleIcon,
} from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import { useMe, useMembers } from '../hooks/useMembers'
import { categoryById, categorySpent, computeBalance, memberById, projectedAccountBalance, recentTransactions, totalByType } from '../lib/calc'
import { formatCLP, monthName } from '../lib/format'

export function Dashboard() {
  const { transactions, categories, budgets, accounts, recurringPayments, settlements, draftTransactions, debts } = useData()
  const me = useMe()
  const members = useMembers()
  const spent = totalByType(transactions, categories, 'gasto')
  const income = totalByType(transactions, categories, 'ingreso')
  const netThisMonth = income - spent
  const budgetTotal = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)
  const percent = budgetTotal ? Math.round((spent / budgetTotal) * 100) : 0
  const balance = computeBalance(
    transactions,
    settlements,
    members.map((m) => m.id),
  )
  const account = accounts[0]
  const projection = account ? projectedAccountBalance(account) : null
  const pendingRecurring = recurringPayments.filter((r) => !r.paidThisMonth)

  // "Para ustedes": whichever budget is closest to (or over) its limit, plus the savings account's daily interest — only shown once there's real data to base them on.
  const tightestBudget = budgets
    .map((b) => ({ ...b, category: categoryById(categories, b.categoryId), spent: categorySpent(transactions, b.categoryId) }))
    .filter((b) => b.monthlyLimit > 0)
    .sort((a, b) => b.spent / b.monthlyLimit - a.spent / a.monthlyLimit)[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-4.5">
        <h1 className="font-serif text-[21px] font-semibold">Hola, {me.displayName}</h1>
        <Link to="/ajustes">
          <Avatar person={me} />
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4 bg-surface border border-border rounded-full px-4 py-2 w-fit mx-auto mb-5">
        <ChevronLeftIcon size={16} className="text-text-muted" strokeWidth={2} />
        <span className="text-[13.5px] font-bold">{monthName()}</span>
        <ChevronRightIcon size={16} className="text-text-muted" strokeWidth={2} />
      </div>

      <Card className="mb-3.5">
        <div className="text-[13px] font-semibold text-text-muted">Gastado este mes</div>
        <div className="font-serif text-[34px] font-bold mt-1">{formatCLP(spent)}</div>
        <div className="text-[13px] text-text-muted mt-0.5">de {formatCLP(budgetTotal)} presupuestado</div>
        <div className="mt-3.5">
          <ProgressBar percent={percent} color="coral" />
        </div>
        <div className="text-[12.5px] text-text-muted mt-2">
          {percent}% usado · quedan <b className="text-text">{formatCLP(Math.max(0, budgetTotal - spent))}</b>
        </div>
      </Card>

      {balance && (
        <Link to="/saldos" className="flex items-center gap-3.5 bg-teal-soft rounded-2xl px-4.5 py-4 mb-3.5">
          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
            <ScaleIcon size={20} className="text-teal" />
          </div>
          <div className="flex-1">
            <div className="text-sm leading-snug">
              <b>{memberById(members, balance.owes).displayName}</b> le debe <b>{formatCLP(balance.amount)}</b> a{' '}
              <b>{memberById(members, balance.owedTo).displayName}</b>
            </div>
            <div className="text-[12.5px] text-teal font-bold mt-0.5">Ver detalle →</div>
          </div>
        </Link>
      )}

      {draftTransactions.length > 0 && (
        <Link to="/por-confirmar" className="flex items-center gap-3.5 bg-indigo-soft rounded-2xl px-4.5 py-4 mb-3.5">
          <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
            <MailIcon size={19} className="text-indigo" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold">{draftTransactions.length} gastos por confirmar</div>
            <div className="text-[12.5px] text-text-muted mt-0.5">Detectados en el correo del banco</div>
          </div>
          <div className="text-[12.5px] text-indigo font-bold">Revisar →</div>
        </Link>
      )}

      <Link to="/pagos-fijos" className="flex items-center gap-3.5 bg-surface border border-border rounded-2xl px-4.5 py-4 mb-3.5">
        <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
          <RepeatIcon size={19} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold">Pagos fijos y deudas</div>
          <div className="text-[12.5px] text-text-muted mt-0.5">
            {recurringPayments.length > 0 || debts.length > 0
              ? [
                  recurringPayments.length > 0 &&
                    `${recurringPayments.length - pendingRecurring.length} de ${recurringPayments.length} pagados`,
                  debts.length > 0 && `deben ${formatCLP(debts.reduce((s, d) => s + d.remainingAmount, 0))}`,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : 'Agreguen sus pagos mensuales o deudas'}
          </div>
        </div>
        <ChevronRightIcon size={16} className="text-text-muted" />
      </Link>

      <div className="flex gap-3 mb-3.5">
        <div className="flex-1 bg-success-soft rounded-2xl px-4 py-3.5">
          <div className="text-xs font-semibold text-text-muted">Ingresos</div>
          <div className="font-serif text-lg font-bold mt-0.5">{formatCLP(income)}</div>
        </div>
        <div className="flex-1 bg-coral-soft rounded-2xl px-4 py-3.5">
          <div className="text-xs font-semibold text-text-muted">Gastos</div>
          <div className="font-serif text-lg font-bold mt-0.5">{formatCLP(spent)}</div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-surface border border-border rounded-2xl px-4.5 py-4 mb-5.5">
        <span className="text-[13px] font-semibold text-text-muted">Disponible este mes</span>
        <span className={`font-serif text-xl font-bold ${netThisMonth >= 0 ? 'text-success' : 'text-danger'}`}>
          {netThisMonth < 0 ? '-' : ''}
          {formatCLP(Math.abs(netThisMonth))}
        </span>
      </div>

      {(tightestBudget || (account && projection)) && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <LightbulbIcon size={18} />
            <span className="text-base font-bold">Para ustedes</span>
          </div>
          <div className="flex gap-3 overflow-x-auto mb-6 pb-0.5 -mx-5 px-5">
            {tightestBudget && (
              <div className="shrink-0 w-[250px] bg-amber-soft rounded-2xl p-4">
                <div className="text-[13px] font-bold leading-snug">
                  {tightestBudget.category.name} va en {Math.round((tightestBudget.spent / tightestBudget.monthlyLimit) * 100)}% del
                  presupuesto
                </div>
                <div className="text-xs text-text-muted mt-1.5 leading-snug">
                  Llevan {formatCLP(tightestBudget.spent)} de {formatCLP(tightestBudget.monthlyLimit)} este mes.
                </div>
              </div>
            )}
            {account && projection && (
              <div className="shrink-0 w-[250px] bg-teal-soft rounded-2xl p-4">
                <div className="text-[13px] font-bold leading-snug">
                  Su ahorro en {account.name} rinde ≈{formatCLP(projection.dailyEstimate)}/día
                </div>
                <div className="text-xs text-text-muted mt-1.5 leading-snug">
                  En un año, a esta tasa, ganarían cerca de {formatCLP(projection.dailyEstimate * 365)} en intereses.
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-bold">Últimos movimientos</span>
        <Link to="/movimientos" className="text-[13px] font-bold text-coral">
          Ver todos
        </Link>
      </div>
      <div>
        {recentTransactions(transactions, 4).map((tx) => (
          <TransactionRow key={tx.id} tx={tx} category={categoryById(categories, tx.categoryId)} />
        ))}
      </div>

      <Link
        to="/movimientos?add=1"
        className="md:hidden fixed right-5 bottom-[96px] w-14 h-14 rounded-full bg-coral flex items-center justify-center shadow-[0_6px_16px_oklch(55%_0.15_35_/_0.35)]"
      >
        <PlusIcon size={24} className="text-surface" strokeWidth={2.4} />
      </Link>
    </div>
  )
}
