import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { AlertTriangleIcon, PlusIcon, RingsIcon } from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import { goalProjection } from '../lib/calc'
import { formatCLP, formatDate } from '../lib/format'
import type { SavingsGoal } from '../types'

const STEP = 10000

export function MetaMatrimonio() {
  const { goalId } = useParams()
  const { savingsGoals } = useData()
  const goal = savingsGoals.find((g) => g.id === goalId && g.targetDate)

  if (!goal) {
    return <PageHeader title="Meta no encontrada" backTo="/reportes" />
  }

  return <GoalSimulator goal={goal} />
}

function GoalSimulator({ goal }: { goal: SavingsGoal }) {
  const [monthly, setMonthly] = useState(goal.monthlyContributionPlan ?? 100000)

  const { monthsLeft, projected, shortfall, breakEvenMonthly } = goalProjection({
    currentAmount: goal.currentAmount,
    targetAmount: goal.targetAmount,
    targetDate: goal.targetDate!,
    monthlyContribution: monthly,
  })
  const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100)

  return (
    <div>
      <PageHeader title={`Meta: ${goal.name}`} backTo="/reportes" />

      <div className="bg-surface border border-border rounded-2xl p-6 mb-5.5 text-center">
        <div className="w-12 h-9.5 mx-auto mb-3 flex items-center justify-center">
          <RingsIcon size={40} className="text-gold" strokeWidth={1.8} />
        </div>
        <div className="text-[12.5px] text-text-muted">
          Para el {formatDate(goal.targetDate!)} de {new Date(goal.targetDate!).getFullYear()} · faltan {monthsLeft} meses
        </div>
        <div className="font-serif text-[30px] font-bold mt-2.5">
          {formatCLP(goal.currentAmount)}{' '}
          <span className="text-[15px] text-text-muted font-semibold">de {formatCLP(goal.targetAmount)}</span>
        </div>
        <div className="mt-3.5">
          <ProgressBar percent={pct} color="gold" />
        </div>
        <div className="text-xs text-text-muted mt-1.5">{pct}% ahorrado</div>
      </div>

      <div className="text-base font-bold mb-3">Simulador de aporte mensual</div>
      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <div className="text-[12.5px] font-semibold text-text-muted text-center mb-3.5">
          Si ahorran juntos cada mes
        </div>
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setMonthly((v) => Math.max(0, v - STEP))}
            className="w-[38px] h-[38px] rounded-full border-[1.5px] border-border flex items-center justify-center shrink-0"
          >
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
          <div className="font-serif text-[28px] font-bold min-w-[150px] text-center">{formatCLP(monthly)}</div>
          <button
            onClick={() => setMonthly((v) => v + STEP)}
            className="w-[38px] h-[38px] rounded-full bg-coral flex items-center justify-center shrink-0"
          >
            <PlusIcon size={15} className="text-surface" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-4">
        <Row label="Meses restantes" value={String(monthsLeft)} />
        <Row label="Ahorro proyectado a esa fecha" value={formatCLP(projected)} />
        <Row label="Meta" value={formatCLP(goal.targetAmount)} last />
      </div>

      {shortfall > 0 ? (
        <div className="bg-amber-soft rounded-2xl p-4.5 mb-3.5">
          <div className="flex items-center gap-2.5 mb-2">
            <AlertTriangleIcon size={17} className="text-amber" />
            <span className="text-[13.5px] font-bold">Crédito estimado a pedir</span>
          </div>
          <div className="font-serif text-[27px] font-bold">{formatCLP(shortfall)}</div>
          <div className="text-xs text-text-muted mt-1.5 leading-relaxed">
            Si mantienen este aporte, este sería el monto que les faltaría al llegar la fecha.
          </div>
        </div>
      ) : (
        <div className="bg-success-soft rounded-2xl p-4.5 mb-3.5">
          <div className="text-[13.5px] font-bold mb-1">🎉 Van a lograrlo sin pedir crédito</div>
          <div className="text-xs text-text-muted leading-relaxed">
            Les sobrarían {formatCLP(projected - goal.targetAmount)} con este aporte mensual.
          </div>
        </div>
      )}

      <p className="text-xs text-text-muted text-center leading-relaxed">
        Para llegar sin pedir crédito, necesitarían ahorrar <b className="text-text">{formatCLP(breakEvenMonthly)}</b> al mes.
      </p>
    </div>
  )
}

function Row({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${last ? '' : 'pb-3 mb-3 border-b border-border'}`}>
      <span className="text-[13px] text-text-muted">{label}</span>
      <span className="text-[13px] font-bold">{value}</span>
    </div>
  )
}
