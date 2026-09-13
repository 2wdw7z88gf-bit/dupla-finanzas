import { useState } from 'react'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { CloseIcon } from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import { categoryById, categorySpent } from '../lib/calc'
import { formatCLP, monthName } from '../lib/format'

export function Presupuestos() {
  const { transactions, categories, budgets, addBudget } = useData()
  const [editing, setEditing] = useState<string | null>(null) // categoryId being added/edited, '' = new
  const spentTotal = budgets.reduce((sum, b) => sum + categorySpent(transactions, b.categoryId), 0)
  const limitTotal = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0)
  const percent = limitTotal ? Math.round((spentTotal / limitTotal) * 100) : 0
  const circumference = 2 * Math.PI * 42
  const offset = circumference * (1 - Math.min(1, percent / 100))

  const budgetedIds = new Set(budgets.map((b) => b.categoryId))
  const availableCategories = categories.filter((c) => c.type === 'gasto' && !budgetedIds.has(c.id))

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

      {budgets.length === 0 && (
        <p className="text-sm text-text-muted text-center py-6">Todavía no tienen presupuestos. Agreguen el primero abajo.</p>
      )}

      <div className="text-base font-bold mb-3">Por categoría</div>
      <div className="flex flex-col gap-2.5">
        {budgets.map((b) => {
          const category = categoryById(categories, b.categoryId)
          const spent = categorySpent(transactions, b.categoryId)
          const pct = Math.round((spent / b.monthlyLimit) * 100)
          const over = pct >= 100
          const near = pct >= 85 && !over
          return (
            <button
              key={b.categoryId}
              onClick={() => setEditing(b.categoryId)}
              className="bg-surface border border-border rounded-2xl p-4 text-left"
            >
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
            </button>
          )
        })}
      </div>

      {availableCategories.length > 0 && (
        <button
          onClick={() => setEditing('')}
          className="w-full border-[1.5px] border-dashed border-border text-text-muted font-bold text-[13.5px] rounded-2xl py-3.5 mt-4.5"
        >
          + Nueva categoría de presupuesto
        </button>
      )}

      {editing !== null && (
        <BudgetSheet
          categoryId={editing || undefined}
          availableCategories={availableCategories}
          categories={categories}
          currentLimit={editing ? budgets.find((b) => b.categoryId === editing)?.monthlyLimit : undefined}
          onSave={addBudget}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function BudgetSheet({
  categoryId,
  availableCategories,
  categories,
  currentLimit,
  onSave,
  onClose,
}: {
  categoryId?: string
  availableCategories: ReturnType<typeof useData>['categories']
  categories: ReturnType<typeof useData>['categories']
  currentLimit?: number
  onSave: (categoryId: string, monthlyLimit: number) => void
  onClose: () => void
}) {
  const [selectedCategory, setSelectedCategory] = useState(categoryId ?? availableCategories[0]?.id ?? '')
  const [limit, setLimit] = useState(currentLimit ? String(currentLimit) : '')
  const limitNumber = Number(limit.replace(/\D/g, '')) || 0
  const isEditing = Boolean(categoryId)

  function handleSave() {
    if (!selectedCategory || limitNumber <= 0) return
    onSave(selectedCategory, limitNumber)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-text/40" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-surface rounded-t-3xl md:rounded-3xl px-5 pt-3.5 pb-7">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-4.5">
          <h2 className="font-serif text-lg font-semibold">{isEditing ? 'Editar presupuesto' : 'Nuevo presupuesto'}</h2>
          <button onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        {!isEditing && (
          <>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Categoría</label>
            <div className="flex gap-2 overflow-x-auto mt-2 mb-4.5 pb-0.5">
              {availableCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 ${selectedCategory === c.id ? '' : 'opacity-60'}`}
                >
                  <div className={selectedCategory === c.id ? 'ring-2 ring-coral rounded-[14px]' : ''}>
                    <CategoryIcon category={c} />
                  </div>
                  <span className="text-[10.5px] font-semibold">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {isEditing && (
          <div className="flex items-center gap-2.5 mb-4.5">
            <CategoryIcon category={categoryById(categories, categoryId!)} />
            <span className="text-sm font-bold">{categoryById(categories, categoryId!).name}</span>
          </div>
        )}

        <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Límite mensual</label>
        <input
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          inputMode="numeric"
          placeholder="$0"
          className="w-full border border-border rounded-xl px-3.5 py-3 text-[15px] mt-1.5 mb-6 bg-bg outline-none"
        />

        <button
          onClick={handleSave}
          disabled={!selectedCategory || limitNumber <= 0}
          className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
        >
          Guardar presupuesto
        </button>
      </div>
    </div>
  )
}
