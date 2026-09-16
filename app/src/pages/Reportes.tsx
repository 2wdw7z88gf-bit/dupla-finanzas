import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { CloseIcon, EditIcon, PlaneIcon, PlusIcon, RingsIcon, ShieldIcon, TrendingUpIcon } from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import { MONTHLY_SPENDING } from '../data/mock'
import { useMembers } from '../hooks/useMembers'
import { categoryById, goalCurrentAmount, projectedAccountBalance, totalByType } from '../lib/calc'
import { formatCLP, monthName } from '../lib/format'
import { CATEGORY_CHART_COLOR, CHART } from '../lib/chartColors'
import type { SavingsGoal } from '../types'

const GOAL_ICONS = { plane: PlaneIcon, shield: ShieldIcon, rings: RingsIcon } as const
const GOAL_COLOR_CLASSES: Record<string, { bg: string; fg: string; bar: string }> = {
  teal: { bg: 'bg-teal-soft', fg: 'text-teal', bar: 'bg-teal' },
  coral: { bg: 'bg-coral-soft', fg: 'text-coral', bar: 'bg-coral' },
  gold: { bg: 'bg-gold-soft', fg: 'text-gold', bar: 'bg-gold' },
}

export function Reportes() {
  const { transactions, categories, accounts, savingsGoals, addAccount, reconcileAccount, addSavingsGoal, updateSavingsGoal } =
    useData()
  const members = useMembers()
  const [addingAccount, setAddingAccount] = useState(false)
  const [reconciling, setReconciling] = useState(false)
  const [addingGoal, setAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const thisMonthSpent = totalByType(transactions, categories, 'gasto')
  const monthlyData = [...MONTHLY_SPENDING, { month: monthName().slice(0, 3), total: thisMonthSpent }]

  const byCategory = new Map<string, number>()
  for (const t of transactions) {
    if (categoryById(categories, t.categoryId).type !== 'gasto') continue
    byCategory.set(t.categoryId, (byCategory.get(t.categoryId) ?? 0) + t.amount)
  }
  const pieData = Array.from(byCategory.entries())
    .map(([categoryId, value]) => ({ categoryId, name: categoryById(categories, categoryId).name, value }))
    .sort((a, b) => b.value - a.value)

  const totalsByPerson = new Map<string, number>(members.map((m) => [m.id, 0]))
  for (const t of transactions) {
    if (categoryById(categories, t.categoryId).type !== 'gasto') continue
    totalsByPerson.set(t.paidBy, (totalsByPerson.get(t.paidBy) ?? 0) + t.amount)
  }
  const maxPersonTotal = Math.max(...totalsByPerson.values(), 1)

  const account = accounts[0]
  const projection = account ? projectedAccountBalance(account) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4.5">
        <h1 className="font-serif text-[22px] font-semibold">Reportes</h1>
        <span className="border border-border rounded-full px-3.5 py-[7px] text-[12.5px] font-bold text-text-muted">
          Este mes ⌄
        </span>
      </div>

      {thisMonthSpent > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4.5 mb-3.5">
          <div className="text-sm font-bold mb-4">Gasto por mes</div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={monthlyData}>
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {monthlyData.map((entry, i) => (
                  <Cell key={entry.month} fill={i === monthlyData.length - 1 ? CHART.coral : CHART.coralMuted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-between px-1 -mt-1">
            {monthlyData.map((m, i) => (
              <span key={m.month} className={`text-[10.5px] ${i === monthlyData.length - 1 ? 'font-bold text-text' : 'text-text-muted'}`}>
                {m.month}
              </span>
            ))}
          </div>
        </div>
      )}

      {pieData.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4.5 mb-3.5">
          <div className="text-sm font-bold mb-4">Gasto por categoría</div>
          <div className="flex items-center gap-5.5">
            <div className="w-[104px] h-[104px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={28} outerRadius={52} strokeWidth={0}>
                    {pieData.map((entry) => (
                      <Cell key={entry.categoryId} fill={CATEGORY_CHART_COLOR[entry.categoryId] ?? CHART.textMuted} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {pieData.map((entry) => (
                <div key={entry.categoryId} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: CATEGORY_CHART_COLOR[entry.categoryId] ?? CHART.textMuted }}
                    />
                    {entry.name}
                  </span>
                  <span className="text-xs font-bold">{Math.round((entry.value / thisMonthSpent) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {members.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-4.5 mb-3.5">
          <div className="text-sm font-bold mb-4">{members.map((m) => m.displayName).join(' vs. ')}</div>
          {members.map((m) => (
            <div key={m.id} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] font-semibold">{m.displayName}</span>
                <span className="text-[13px] font-bold">{formatCLP(totalsByPerson.get(m.id) ?? 0)}</span>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.color === 'coral' ? 'bg-coral' : 'bg-teal'}`}
                  style={{ width: `${((totalsByPerson.get(m.id) ?? 0) / maxPersonTotal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-base font-bold mb-3">Cuentas de ahorro</div>
      {account && projection ? (
        <div className="bg-surface border border-border rounded-2xl p-4.5 mb-5">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-[10px] bg-gold-soft text-gold flex items-center justify-center shrink-0">
                <TrendingUpIcon size={17} />
              </div>
              <div>
                <div className="text-sm font-bold">{account.name}</div>
                <div className="text-[11.5px] text-text-muted">Cuenta remunerada · {(account.annualInterestRate * 100).toFixed(1)}% anual</div>
              </div>
            </div>
            <span className="text-[10.5px] font-bold text-success bg-success-soft px-2.5 py-1 rounded-full whitespace-nowrap">
              ≈ {formatCLP(projection.dailyEstimate)}/día
            </span>
          </div>
          <div className="font-serif text-2xl font-bold mt-2.5">{formatCLP(projection.projected)}</div>
          <div className="text-xs text-text-muted mt-0.5">
            Saldo estimado hoy · incluye ~{formatCLP(projection.accrued)} de interés acumulado
          </div>
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border">
            <span className="text-[11.5px] text-text-muted">
              Real registrado: {formatCLP(account.balance)} ·{' '}
              {new Date(account.lastReconciledAt).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
            </span>
            <button onClick={() => setReconciling(true)} className="text-xs text-coral font-bold">
              Ajustar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingAccount(true)}
          className="w-full border-[1.5px] border-dashed border-border text-text-muted font-bold text-[13.5px] rounded-2xl py-3.5 mb-5 flex items-center justify-center gap-2"
        >
          <PlusIcon size={15} /> Agregar cuenta de ahorro
        </button>
      )}

      <div className="text-base font-bold mb-3">Metas de ahorro</div>
      <div className="flex flex-col gap-2.5 mb-4.5">
        {savingsGoals.map((goal) => {
          const Icon = GOAL_ICONS[goal.icon]
          const colors = GOAL_COLOR_CLASSES[goal.color]
          const linkedAccount = goal.accountId ? accounts.find((a) => a.id === goal.accountId) : undefined
          const currentAmt = goalCurrentAmount(goal, accounts)
          const pct = Math.round((currentAmt / goal.targetAmount) * 100)
          const content = (
            <>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className={`w-[34px] h-[34px] rounded-[10px] ${colors.bg} ${colors.fg} flex items-center justify-center shrink-0`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-bold">{goal.name}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12.5px] text-text-muted font-bold">{pct}%</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setEditingGoal(goal)
                      }}
                      aria-label="Editar meta"
                    >
                      <EditIcon size={14} className="text-text-muted" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {formatCLP(currentAmt)} de {formatCLP(goal.targetAmount)}
                  {linkedAccount && <span className="text-coral"> · vinculada a {linkedAccount.name}</span>}
                </span>
                {goal.targetDate && <span className="text-xs text-coral font-bold shrink-0 ml-2">Ver simulador →</span>}
              </div>
            </>
          )
          return goal.targetDate ? (
            <Link key={goal.id} to={`/metas/${goal.id}`} className="bg-surface border border-border rounded-2xl p-4">
              {content}
            </Link>
          ) : (
            <div key={goal.id} className="bg-surface border border-border rounded-2xl p-4">
              {content}
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setAddingGoal(true)}
        className="w-full border-[1.5px] border-dashed border-border text-text-muted font-bold text-[13.5px] rounded-2xl py-3.5 flex items-center justify-center gap-2"
      >
        <PlusIcon size={15} /> Nueva meta de ahorro
      </button>

      {addingAccount && (
        <NewAccountSheet
          onSave={(a) => addAccount(a)}
          onClose={() => setAddingAccount(false)}
        />
      )}

      {reconciling && account && (
        <ReconcileSheet
          account={account}
          onSave={(balance) => reconcileAccount(account.id, balance)}
          onClose={() => setReconciling(false)}
        />
      )}

      {addingGoal && <NewGoalSheet accounts={accounts} onSave={addSavingsGoal} onClose={() => setAddingGoal(false)} />}

      {editingGoal && (
        <NewGoalSheet
          accounts={accounts}
          existingGoal={editingGoal}
          onSave={(patch) => updateSavingsGoal(editingGoal.id, patch)}
          onClose={() => setEditingGoal(null)}
        />
      )}
    </div>
  )
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-text/40" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-surface rounded-t-3xl md:rounded-3xl px-5 pt-3.5 pb-7 max-h-[88vh] overflow-y-auto">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-4.5">
          <h2 className="font-serif text-lg font-semibold">{title}</h2>
          <button onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4.5">
      <label className="text-xs font-bold text-text-muted uppercase tracking-wide">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

const inputCls = 'w-full border border-border rounded-xl px-3.5 py-3 text-[15px] bg-bg outline-none'

function NewAccountSheet({ onSave, onClose }: { onSave: (a: { name: string; balance: number; annualInterestRate: number; lastReconciledAt: string }) => void; onClose: () => void }) {
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [rate, setRate] = useState('')
  const balanceNumber = Number(balance.replace(/\D/g, '')) || 0
  const rateNumber = Number(rate.replace(',', '.')) || 0
  const canSave = name.trim().length > 0 && balanceNumber >= 0

  return (
    <Sheet title="Nueva cuenta de ahorro" onClose={onClose}>
      <Field label="Nombre">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Mercado Pago" className={inputCls} />
      </Field>
      <Field label="Saldo actual">
        <input value={balance} onChange={(e) => setBalance(e.target.value)} inputMode="numeric" placeholder="$0" className={inputCls} />
      </Field>
      <Field label="Tasa de interés anual (%, opcional)">
        <input value={rate} onChange={(e) => setRate(e.target.value)} inputMode="decimal" placeholder="Ej: 4.5" className={inputCls} />
      </Field>
      <button
        onClick={() =>
          canSave &&
          (onSave({
            name: name.trim(),
            balance: balanceNumber,
            annualInterestRate: rateNumber / 100,
            lastReconciledAt: new Date().toISOString().slice(0, 10),
          }),
          onClose())
        }
        disabled={!canSave}
        className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
      >
        Guardar cuenta
      </button>
    </Sheet>
  )
}

function ReconcileSheet({
  account,
  onSave,
  onClose,
}: {
  account: { balance: number }
  onSave: (balance: number) => void
  onClose: () => void
}) {
  const [balance, setBalance] = useState(String(account.balance))
  const balanceNumber = Number(balance.replace(/\D/g, '')) || 0

  return (
    <Sheet title="Ajustar saldo real" onClose={onClose}>
      <Field label="Saldo actual en la app del banco">
        <input value={balance} onChange={(e) => setBalance(e.target.value)} inputMode="numeric" className={inputCls} />
      </Field>
      <button
        onClick={() => (onSave(balanceNumber), onClose())}
        className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5"
      >
        Guardar ajuste
      </button>
    </Sheet>
  )
}

function NewGoalSheet({
  accounts,
  existingGoal,
  onSave,
  onClose,
}: {
  accounts: ReturnType<typeof useData>['accounts']
  existingGoal?: SavingsGoal
  onSave: (g: Omit<SavingsGoal, 'id'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(existingGoal?.name ?? '')
  const [icon, setIcon] = useState<SavingsGoal['icon']>(existingGoal?.icon ?? 'plane')
  const [color, setColor] = useState<SavingsGoal['color']>(existingGoal?.color ?? 'teal')
  const [targetAmount, setTargetAmount] = useState(existingGoal ? String(existingGoal.targetAmount) : '')
  const [currentAmount, setCurrentAmount] = useState(existingGoal ? String(existingGoal.currentAmount) : '')
  const [accountId, setAccountId] = useState<string>(existingGoal?.accountId ?? '')
  const [hasDate, setHasDate] = useState(Boolean(existingGoal?.targetDate))
  const [targetDate, setTargetDate] = useState(existingGoal?.targetDate ?? '')
  const [monthlyPlan, setMonthlyPlan] = useState(
    existingGoal?.monthlyContributionPlan ? String(existingGoal.monthlyContributionPlan) : '',
  )

  const targetNumber = Number(targetAmount.replace(/\D/g, '')) || 0
  const currentNumber = Number(currentAmount.replace(/\D/g, '')) || 0
  const canSave = name.trim().length > 0 && targetNumber > 0
  const linkedAccount = accounts.find((a) => a.id === accountId)

  function handleSave() {
    if (!canSave) return
    onSave({
      name: name.trim(),
      icon,
      color,
      targetAmount: targetNumber,
      currentAmount: currentNumber,
      accountId: accountId || undefined,
      targetDate: hasDate && targetDate ? targetDate : undefined,
      monthlyContributionPlan: hasDate && monthlyPlan ? Number(monthlyPlan.replace(/\D/g, '')) : undefined,
    })
    onClose()
  }

  return (
    <Sheet title={existingGoal ? 'Editar meta' : 'Nueva meta de ahorro'} onClose={onClose}>
      <Field label="Nombre">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Viaje al sur" className={inputCls} />
      </Field>
      <Field label="Ícono">
        <div className="flex gap-2.5">
          {(Object.keys(GOAL_ICONS) as SavingsGoal['icon'][]).map((key) => {
            const Icon = GOAL_ICONS[key]
            return (
              <button
                key={key}
                onClick={() => setIcon(key)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  icon === key ? 'bg-coral-soft border-2 border-coral text-coral' : 'bg-surface-2 text-text-muted'
                }`}
              >
                <Icon size={19} />
              </button>
            )
          })}
        </div>
      </Field>
      <Field label="Color">
        <div className="flex gap-2.5">
          {(['teal', 'coral', 'gold'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full ${GOAL_COLOR_CLASSES[c].bg} ${color === c ? 'ring-2 ring-offset-2 ring-text/20' : ''}`}
            />
          ))}
        </div>
      </Field>
      <Field label="Monto meta">
        <input value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} inputMode="numeric" placeholder="$0" className={inputCls} />
      </Field>

      {accounts.length > 0 && (
        <Field label="Vincular a una cuenta de ahorro (opcional)">
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputCls}>
            <option value="">Ninguna — monto manual</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      {linkedAccount ? (
        <div className="text-xs text-text-muted mb-4.5 -mt-2">
          El ahorro actual va a seguir el saldo real de <b className="text-text">{linkedAccount.name}</b> automáticamente.
        </div>
      ) : (
        <Field label="Ahorro actual">
          <input
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            inputMode="numeric"
            placeholder="$0"
            className={inputCls}
          />
        </Field>
      )}

      <label className="flex items-center gap-2.5 mb-4.5 text-[13.5px] font-semibold">
        <input type="checkbox" checked={hasDate} onChange={(e) => setHasDate(e.target.checked)} className="w-4 h-4 accent-coral" />
        Tiene fecha objetivo (activa el simulador de crédito)
      </label>

      {hasDate && (
        <>
          <Field label="Fecha objetivo">
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Aporte mensual planeado">
            <input value={monthlyPlan} onChange={(e) => setMonthlyPlan(e.target.value)} inputMode="numeric" placeholder="$0" className={inputCls} />
          </Field>
        </>
      )}

      <button
        onClick={handleSave}
        disabled={!canSave}
        className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
      >
        {existingGoal ? 'Guardar cambios' : 'Guardar meta'}
      </button>
    </Sheet>
  )
}
