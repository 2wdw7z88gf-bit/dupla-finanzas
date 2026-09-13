import { ProgressBar } from '../components/ui/ProgressBar'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { useData } from '../state/DataContext'
import { categoryById, categorySpent } from '../lib/calc'
import { formatCLP, monthName } from '../lib/format'

export function Presupuestos() {
  const { transactions, categories, budgets } = useData()
  const spentTotal = budgets.reduce((sum, b) => sum + categorySpent(transactions, b.categoryId), 0)
  const limitTotal = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)
  const percent = Math.round((spentTotal / limitTotal) * 100)
  const circumference = 2 * Math.PI * 42
  const offset = circumference * (1 - Math.min(1, percent / 100))

  return (
    <div>
      <div className="flex items-center justify-between mb-4.5">
        <h1 className="font-serif text-[22px] font-semibold">Presupuestos</h1>
        <span className="border border-border rounded-full px-3.5 py-[7px] text-[12.5px] font-bold text-text-muted">
          {monthName()} ⌄
        </span>
      </div>

      <div className="flex items-center gap-5 bg-surface border border-border rounded-2xl p-5.5 mb-5.5">
        <svg width={92} height={92} viewBox="0 0 100 100" className="shrink-0">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-surface-2)" strokeWidth="11" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--color-coral)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
          <text x="50" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--color-text)">
            {percent}%
          </text>
        </svg>
        <div className="flex-1">
          <div className="text-xs font-semibold text-text-muted">Presupuesto total</div>
          <div className="font-serif text-[19px] font-bold mt-px">{formatCLP(limitTotal)}</div>
          <div className="text-xs font-semibold text-text-muted mt-2">Gastado</div>
          <div className="text-[15px] font-bold text-coral">{formatCLP(spentTotal)}</div>
        </div>
      </div>

      <div className="text-base font-bold mb-3">Por categoría</div>
      <div className="flex flex-col gap-2.5">
        {budgets.map((b) => {
          const category = categoryById(categories, b.categoryId)
          const spent = categorySpent(transactions, b.categoryId)
          const pct = Math.round((spent / b.monthlyLimit) * 100)
          const over = pct >= 100
          const near = pct >= 85 && !over
          return (
            <div key={b.categoryId} className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <CategoryIcon category={category} size="sm" />
                  <span className="text-[14.5px] font-bold">{category.name}</span>
                </div>
                <span className="text-[13.5px] font-bold">
                  {formatCLP(spent)} <span className="text-text-muted font-semibold">/ {formatCLP(b.monthlyLimit)}</span>
                </span>
              </div>
              <ProgressBar percent={pct} color={over ? 'danger' : near ? 'amber' : 'coral'} height={7} />
              <div className={`text-xs mt-1.5 ${over ? 'text-danger font-bold' : near ? 'text-amber font-bold' : 'text-text-muted'}`}>
                {over
                  ? `Superado por ${formatCLP(spent - b.monthlyLimit)}`
                  : near
                    ? '¡Cerca del límite!'
                    : `Quedan ${formatCLP(b.monthlyLimit - spent)}`}
              </div>
            </div>
          )
        })}
      </div>

      <button className="w-full border-[1.5px] border-dashed border-border text-text-muted font-bold text-[13.5px] rounded-2xl py-3.5 mt-4.5">
        + Nueva categoría de presupuesto
      </button>
    </div>
  )
}
