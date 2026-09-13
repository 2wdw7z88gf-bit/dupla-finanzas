import { Link } from 'react-router-dom'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { PlaneIcon, RingsIcon, ShieldIcon, TrendingUpIcon } from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import { MONTHLY_SPENDING } from '../data/mock'
import { useMembers } from '../hooks/useMembers'
import { categoryById, projectedAccountBalance, totalByType } from '../lib/calc'
import { formatCLP, monthName } from '../lib/format'
import { CATEGORY_CHART_COLOR, CHART } from '../lib/chartColors'

const GOAL_ICONS = { plane: PlaneIcon, shield: ShieldIcon, rings: RingsIcon }
const GOAL_COLOR_CLASSES: Record<string, { bg: string; fg: string; bar: string }> = {
  teal: { bg: 'bg-teal-soft', fg: 'text-teal', bar: 'bg-teal' },
  coral: { bg: 'bg-coral-soft', fg: 'text-coral', bar: 'bg-coral' },
  gold: { bg: 'bg-gold-soft', fg: 'text-gold', bar: 'bg-gold' },
}

export function Reportes() {
  const { transactions, categories, accounts, savingsGoals } = useData()
  const members = useMembers()
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
  const projection = projectedAccountBalance(account)

  return (
    <div>
      <div className="flex items-center justify-between mb-4.5">
        <h1 className="font-serif text-[22px] font-semibold">Reportes</h1>
        <span className="border border-border rounded-full px-3.5 py-[7px] text-[12.5px] font-bold text-text-muted">
          Este mes ⌄
        </span>
      </div>

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

      <div className="bg-surface border border-border rounded-2xl p-4.5 mb-3.5">
        <div className="text-sm font-bold mb-4">
          {members.map((m) => m.displayName).join(' vs. ') || 'Gasto por persona'}
        </div>
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

      <div className="text-base font-bold mb-3">Cuentas de ahorro</div>
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
            Real registrado: {formatCLP(account.balance)} · {new Date(account.lastReconciledAt).getDate()} sep
          </span>
          <span className="text-xs text-coral font-bold">Ajustar</span>
        </div>
      </div>

      <div className="text-base font-bold mb-3">Metas de ahorro</div>
      <div className="flex flex-col gap-2.5">
        {savingsGoals.map((goal) => {
          const Icon = GOAL_ICONS[goal.icon]
          const colors = GOAL_COLOR_CLASSES[goal.color]
          const pct = Math.round((goal.currentAmount / goal.targetAmount) * 100)
          const content = (
            <>
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className={`w-[34px] h-[34px] rounded-[10px] ${colors.bg} ${colors.fg} flex items-center justify-center shrink-0`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm font-bold">{goal.name}</span>
                  <span className="text-[12.5px] text-text-muted font-bold">{pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-1.5">
                <div className={`h-full rounded-full ${colors.bar}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">
                  {formatCLP(goal.currentAmount)} de {formatCLP(goal.targetAmount)}
                </span>
                {goal.targetDate && <span className="text-xs text-coral font-bold">Ver simulador →</span>}
              </div>
            </>
          )
          return goal.targetDate ? (
            <Link key={goal.id} to="/metas/matrimonio" className="bg-surface border border-border rounded-2xl p-4">
              {content}
            </Link>
          ) : (
            <div key={goal.id} className="bg-surface border border-border rounded-2xl p-4">
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
