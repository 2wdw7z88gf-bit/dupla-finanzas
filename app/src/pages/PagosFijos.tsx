import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { PlusIcon } from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import { useMembers } from '../hooks/useMembers'
import { categoryById, memberById } from '../lib/calc'
import { formatCLP, monthName } from '../lib/format'
import type { RecurringPayment } from '../types'

export function PagosFijos() {
  const { recurringPayments, categories, toggleRecurringPaid } = useData()
  const members = useMembers()
  const pending = recurringPayments.filter((r) => !r.paidThisMonth)
  const paid = recurringPayments.filter((r) => r.paidThisMonth)
  const pendingTotal = pending.reduce((s, r) => s + r.amount, 0)
  const paidTotal = paid.reduce((s, r) => s + r.amount, 0)
  const pct = recurringPayments.length ? Math.round((paid.length / recurringPayments.length) * 100) : 0

  return (
    <div>
      <PageHeader
        title="Pagos fijos"
        backTo="/"
        action={
          <button className="w-9 h-9 rounded-[10px] bg-coral flex items-center justify-center">
            <PlusIcon size={17} className="text-surface" strokeWidth={2.2} />
          </button>
        }
      />

      <div className="bg-surface border border-border rounded-2xl p-5 mb-5.5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold">{monthName().split(' ')[0]}</span>
          <span className="text-[12.5px] text-text-muted">
            {paid.length} de {recurringPayments.length} pagados
          </span>
        </div>
        <ProgressBar percent={pct} color="success" />
        <div className="flex items-center justify-between mt-3">
          <span className="text-[12.5px] text-text-muted">
            Pagado: <b className="text-text">{formatCLP(paidTotal)}</b>
          </span>
          <span className="text-[12.5px] text-amber font-bold">Pendiente: {formatCLP(pendingTotal)}</span>
        </div>
      </div>

      <Group title="Pendientes" items={pending} categories={categories} members={members} onToggle={toggleRecurringPaid} />
      <Group title="Pagados este mes" items={paid} categories={categories} members={members} onToggle={toggleRecurringPaid} muted />

      <button className="w-full border-[1.5px] border-dashed border-border text-text-muted font-bold text-[13.5px] rounded-2xl py-3.5 mt-4.5">
        + Nuevo pago fijo
      </button>
    </div>
  )
}

function Group({
  title,
  items,
  categories,
  members,
  onToggle,
  muted = false,
}: {
  title: string
  items: RecurringPayment[]
  categories: ReturnType<typeof useData>['categories']
  members: ReturnType<typeof useMembers>
  onToggle: (id: string) => void
  muted?: boolean
}) {
  if (items.length === 0) return null
  return (
    <div className="mb-5.5">
      <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">{title}</div>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {items.map((item) => {
          const category = categoryById(categories, item.categoryId)
          const payerLabel = item.payer === null ? 'Compartido' : memberById(members, item.payer).displayName
          return (
            <button
              key={item.id}
              onClick={() => onToggle(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3.5 border-b border-border last:border-b-0 text-left ${muted ? 'opacity-75' : ''}`}
            >
              <CategoryIcon category={category} />
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-semibold">{item.name}</div>
                <div className="text-xs text-text-muted mt-px">
                  Mensual · {item.paidThisMonth ? 'pagado el' : 'vence el'} {item.dueDay} · {payerLabel}
                </div>
              </div>
              <div className="text-[14.5px] font-bold mr-2.5">{formatCLP(item.amount)}</div>
              {item.paidThisMonth ? (
                <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center shrink-0">
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-surface)" strokeWidth={3}>
                    <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full border-2 border-border shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
