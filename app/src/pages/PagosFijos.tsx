import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CategoryIcon } from '../components/ui/CategoryIcon'
import { Avatar } from '../components/ui/Avatar'
import { CloseIcon, CreditCardIcon, EditIcon, PlusIcon } from '../components/icons/Icons'
import { useData, type PaymentDetails } from '../state/DataContext'
import { useMe, useMembers } from '../hooks/useMembers'
import { categoryById, memberById } from '../lib/calc'
import { formatCLP, monthName } from '../lib/format'
import type { Debt, RecurringPayment, SplitType, UserId } from '../types'

export function PagosFijos() {
  const {
    recurringPayments,
    categories,
    addRecurringPayment,
    updateRecurringPayment,
    deleteRecurringPayment,
    confirmRecurringPayment,
    undoRecurringPayment,
    debts,
    addDebt,
    updateDebt,
    deleteDebt,
    registerDebtPayment,
  } = useData()
  const members = useMembers()
  const pending = recurringPayments.filter((r) => !r.paidThisMonth)
  const paid = recurringPayments.filter((r) => r.paidThisMonth)
  const pendingTotal = pending.reduce((s, r) => s + r.amount, 0)
  const paidTotal = paid.reduce((s, r) => s + r.amount, 0)
  const pct = recurringPayments.length ? Math.round((paid.length / recurringPayments.length) * 100) : 0
  const totalDebt = debts.reduce((s, d) => s + d.remainingAmount, 0)

  const [addingDebt, setAddingDebt] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null)
  const [addingRecurring, setAddingRecurring] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<RecurringPayment | null>(null)
  const [payingRecurring, setPayingRecurring] = useState<RecurringPayment | null>(null)

  return (
    <div>
      <PageHeader
        title="Pagos fijos"
        backTo="/"
        action={
          <button
            onClick={() => setAddingRecurring(true)}
            className="w-9 h-9 rounded-[10px] bg-coral flex items-center justify-center"
          >
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

      <Group
        title="Pendientes"
        items={pending}
        categories={categories}
        members={members}
        onCheck={setPayingRecurring}
        onEdit={setEditingRecurring}
      />
      <Group
        title="Pagados este mes"
        items={paid}
        categories={categories}
        members={members}
        onCheck={(item) => undoRecurringPayment(item.id)}
        onEdit={setEditingRecurring}
        muted
      />

      <button
        onClick={() => setAddingRecurring(true)}
        className="w-full border-[1.5px] border-dashed border-border text-text-muted font-bold text-[13.5px] rounded-2xl py-3.5 mb-7"
      >
        + Nuevo pago fijo
      </button>

      <div className="flex items-center justify-between mb-3">
        <span className="text-base font-bold">Deudas</span>
        {debts.length > 0 && <span className="text-[12.5px] text-text-muted">Deben en total {formatCLP(totalDebt)}</span>}
      </div>

      {debts.length === 0 && <p className="text-sm text-text-muted mb-4">Todavía no tienen deudas registradas.</p>}

      <div className="flex flex-col gap-2.5 mb-4.5">
        {debts.map((debt) => {
          const paidPct = debt.originalAmount
            ? Math.round(((debt.originalAmount - debt.remainingAmount) / debt.originalAmount) * 100)
            : null
          return (
            <div key={debt.id} className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-[34px] h-[34px] rounded-[10px] bg-berry-soft text-berry flex items-center justify-center shrink-0">
                    <CreditCardIcon size={17} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{debt.name}</div>
                    {debt.creditor && <div className="text-[11.5px] text-text-muted">{debt.creditor}</div>}
                  </div>
                </div>
                <button onClick={() => setEditingDebt(debt)} aria-label="Editar deuda">
                  <EditIcon size={14} className="text-text-muted" />
                </button>
              </div>

              {paidPct !== null && (
                <>
                  <ProgressBar percent={Math.min(100, paidPct)} color="teal" height={7} />
                  <div className="text-xs text-text-muted mt-1.5 mb-2">{paidPct}% pagado</div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-bold">
                  {formatCLP(debt.remainingAmount)} <span className="text-text-muted font-semibold">por pagar</span>
                </span>
                <button onClick={() => setPayingDebt(debt)} className="text-xs text-coral font-bold">
                  Registrar pago
                </button>
              </div>

              {debt.monthlyPayment != null && (
                <div className="text-[11.5px] text-text-muted mt-1.5">
                  Cuota mensual: {formatCLP(debt.monthlyPayment)}
                  {debt.dueDay ? ` · vence el día ${debt.dueDay}` : ''}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={() => setAddingDebt(true)}
        className="w-full border-[1.5px] border-dashed border-border text-text-muted font-bold text-[13.5px] rounded-2xl py-3.5"
      >
        + Nueva deuda
      </button>

      {addingDebt && <DebtSheet categories={categories} onSave={addDebt} onClose={() => setAddingDebt(false)} />}
      {editingDebt && (
        <DebtSheet
          categories={categories}
          existingDebt={editingDebt}
          onSave={(patch) => updateDebt(editingDebt.id, patch)}
          onDelete={() => {
            deleteDebt(editingDebt.id)
            setEditingDebt(null)
          }}
          onClose={() => setEditingDebt(null)}
        />
      )}
      {payingDebt && (
        <PayDebtSheet
          debt={payingDebt}
          categories={categories}
          onSave={(details) => registerDebtPayment(payingDebt.id, details)}
          onClose={() => setPayingDebt(null)}
        />
      )}

      {addingRecurring && (
        <RecurringPaymentSheet categories={categories} onSave={addRecurringPayment} onClose={() => setAddingRecurring(false)} />
      )}
      {editingRecurring && (
        <RecurringPaymentSheet
          categories={categories}
          existing={editingRecurring}
          onSave={(patch) => updateRecurringPayment(editingRecurring.id, patch)}
          onDelete={() => {
            deleteRecurringPayment(editingRecurring.id)
            setEditingRecurring(null)
          }}
          onClose={() => setEditingRecurring(null)}
        />
      )}
      {payingRecurring && (
        <ConfirmPaymentSheet
          item={payingRecurring}
          onSave={(details) => confirmRecurringPayment(payingRecurring.id, details)}
          onClose={() => setPayingRecurring(null)}
        />
      )}
    </div>
  )
}

function Group({
  title,
  items,
  categories,
  members,
  onCheck,
  onEdit,
  muted = false,
}: {
  title: string
  items: RecurringPayment[]
  categories: ReturnType<typeof useData>['categories']
  members: ReturnType<typeof useMembers>
  onCheck: (item: RecurringPayment) => void
  onEdit: (item: RecurringPayment) => void
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
            <div key={item.id} className={`flex items-center gap-3 px-3.5 py-3.5 border-b border-border last:border-b-0 ${muted ? 'opacity-75' : ''}`}>
              <CategoryIcon category={category} />
              <div className="flex-1 min-w-0">
                <div className="text-[14.5px] font-semibold">{item.name}</div>
                <div className="text-xs text-text-muted mt-px">
                  Mensual · {item.paidThisMonth ? 'pagado el' : 'vence el'} {item.dueDay} · {payerLabel}
                </div>
              </div>
              <div className="text-[14.5px] font-bold">{formatCLP(item.amount)}</div>
              <button onClick={() => onEdit(item)} aria-label="Editar pago fijo" className="shrink-0">
                <EditIcon size={14} className="text-text-muted" />
              </button>
              <button onClick={() => onCheck(item)} aria-label="Marcar pagado" className="shrink-0">
                {item.paidThisMonth ? (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--color-surface)" strokeWidth={3}>
                      <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-border" />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-border rounded-xl px-3.5 py-3 text-[15px] bg-bg outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4.5">
      <label className="text-xs font-bold text-text-muted uppercase tracking-wide">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

/** Payer + split picker shared by the payment-confirmation sheets below. */
function PayerAndSplit({
  payer,
  onPayer,
  split,
  onSplit,
}: {
  payer: UserId
  onPayer: (id: UserId) => void
  split: SplitType
  onSplit: (s: SplitType) => void
}) {
  const members = useMembers()
  return (
    <>
      <Field label="¿Quién pagó?">
        <div className="flex gap-2.5">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => onPayer(m.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 border-[1.5px] ${payer === m.id ? 'border-coral bg-coral-soft' : 'border-border'}`}
            >
              <Avatar person={m} size={20} />
              <span className={`text-[13px] ${payer === m.id ? 'font-bold' : 'font-semibold text-text-muted'}`}>{m.displayName}</span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="¿Cómo se divide?">
        <div className="flex bg-surface-2 rounded-xl p-1">
          {(['50/50', 'personal'] as SplitType[]).map((s) => (
            <button
              key={s}
              onClick={() => onSplit(s)}
              className={`flex-1 text-center text-[13px] font-bold py-2.5 rounded-[9px] ${split === s ? 'bg-surface shadow-sm text-text' : 'text-text-muted'}`}
            >
              {s === '50/50' ? '50/50' : 'Personal'}
            </button>
          ))}
        </div>
      </Field>
    </>
  )
}

function ConfirmPaymentSheet({
  item,
  onSave,
  onClose,
}: {
  item: RecurringPayment
  onSave: (details: Omit<PaymentDetails, 'categoryId'>) => void
  onClose: () => void
}) {
  const me = useMe()
  const [amount, setAmount] = useState(String(item.amount))
  const [payer, setPayer] = useState<UserId>(item.payer ?? me.id)
  const [split, setSplit] = useState<SplitType>(item.payer === null ? '50/50' : 'personal')
  const amountNumber = Number(amount.replace(/\D/g, '')) || 0

  function handleSave() {
    if (amountNumber <= 0) return
    onSave({ amount: amountNumber, date: new Date().toISOString().slice(0, 10), paidBy: payer, split })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-text/40" onClick={onClose} />
      <div className="relative w-full md:max-w-sm bg-surface rounded-t-3xl md:rounded-3xl px-5 pt-3.5 pb-7 max-h-[88vh] overflow-y-auto">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-4.5">
          <h2 className="font-serif text-lg font-semibold">Confirmar pago</h2>
          <button onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="text-xs text-text-muted mb-4">
          Esto agrega {item.name} como movimiento de hoy y descuenta del presupuesto de su categoría.
        </div>
        <Field label="Monto">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" className={inputCls} />
        </Field>
        <PayerAndSplit payer={payer} onPayer={setPayer} split={split} onSplit={setSplit} />
        <button
          onClick={handleSave}
          disabled={amountNumber <= 0}
          className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
        >
          Confirmar pago
        </button>
      </div>
    </div>
  )
}

function DebtSheet({
  categories,
  existingDebt,
  onSave,
  onDelete,
  onClose,
}: {
  categories: ReturnType<typeof useData>['categories']
  existingDebt?: Debt
  onSave: (d: Omit<Debt, 'id'>) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const expenseCategories = categories.filter((c) => c.type === 'gasto')
  const [name, setName] = useState(existingDebt?.name ?? '')
  const [creditor, setCreditor] = useState(existingDebt?.creditor ?? '')
  const [categoryId, setCategoryId] = useState(existingDebt?.categoryId ?? '')
  const [originalAmount, setOriginalAmount] = useState(existingDebt?.originalAmount ? String(existingDebt.originalAmount) : '')
  const [remainingAmount, setRemainingAmount] = useState(existingDebt ? String(existingDebt.remainingAmount) : '')
  const [monthlyPayment, setMonthlyPayment] = useState(existingDebt?.monthlyPayment ? String(existingDebt.monthlyPayment) : '')
  const [dueDay, setDueDay] = useState(existingDebt?.dueDay ? String(existingDebt.dueDay) : '')

  const remainingNumber = Number(remainingAmount.replace(/\D/g, '')) || 0
  const canSave = name.trim().length > 0 && remainingNumber >= 0

  function handleSave() {
    if (!canSave) return
    onSave({
      name: name.trim(),
      creditor: creditor.trim() || undefined,
      categoryId: categoryId || undefined,
      originalAmount: originalAmount ? Number(originalAmount.replace(/\D/g, '')) : undefined,
      remainingAmount: remainingNumber,
      monthlyPayment: monthlyPayment ? Number(monthlyPayment.replace(/\D/g, '')) : undefined,
      dueDay: dueDay ? Number(dueDay) : undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-text/40" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-surface rounded-t-3xl md:rounded-3xl px-5 pt-3.5 pb-7 max-h-[88vh] overflow-y-auto">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-4.5">
          <h2 className="font-serif text-lg font-semibold">{existingDebt ? 'Editar deuda' : 'Nueva deuda'}</h2>
          <button onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        <Field label="Nombre">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tarjeta Falabella" className={inputCls} />
        </Field>
        <Field label="A quién se le debe (opcional)">
          <input value={creditor} onChange={(e) => setCreditor(e.target.value)} placeholder="Ej: Banco, o el nombre de una persona" className={inputCls} />
        </Field>
        <Field label="Categoría de los pagos (opcional)">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {expenseCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(categoryId === c.id ? '' : c.id)}
                className={`flex flex-col items-center gap-1.5 shrink-0 ${categoryId === c.id ? '' : 'opacity-60'}`}
              >
                <div className={categoryId === c.id ? 'ring-2 ring-coral rounded-[14px]' : ''}>
                  <CategoryIcon category={c} />
                </div>
                <span className="text-[10.5px] font-semibold">{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Monto original (opcional)">
          <input value={originalAmount} onChange={(e) => setOriginalAmount(e.target.value)} inputMode="numeric" placeholder="$0" className={inputCls} />
        </Field>
        <Field label="Saldo actual por pagar">
          <input value={remainingAmount} onChange={(e) => setRemainingAmount(e.target.value)} inputMode="numeric" placeholder="$0" className={inputCls} />
        </Field>
        <Field label="Cuota mensual (opcional)">
          <input value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} inputMode="numeric" placeholder="$0" className={inputCls} />
        </Field>
        <Field label="Día de vencimiento (opcional)">
          <input value={dueDay} onChange={(e) => setDueDay(e.target.value)} inputMode="numeric" placeholder="Ej: 12" className={inputCls} />
        </Field>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
        >
          {existingDebt ? 'Guardar cambios' : 'Guardar deuda'}
        </button>

        {onDelete && (
          <button onClick={onDelete} className="w-full text-danger font-bold text-[13.5px] py-3.5">
            Eliminar deuda
          </button>
        )}
      </div>
    </div>
  )
}

function PayDebtSheet({
  debt,
  categories,
  onSave,
  onClose,
}: {
  debt: Debt
  categories: ReturnType<typeof useData>['categories']
  onSave: (details: PaymentDetails) => void
  onClose: () => void
}) {
  const me = useMe()
  const expenseCategories = categories.filter((c) => c.type === 'gasto')
  const [amount, setAmount] = useState(debt.monthlyPayment ? String(debt.monthlyPayment) : '')
  const [categoryId, setCategoryId] = useState(debt.categoryId ?? expenseCategories[0]?.id ?? '')
  const [payer, setPayer] = useState<UserId>(me.id)
  const [split, setSplit] = useState<SplitType>('personal')
  const amountNumber = Number(amount.replace(/\D/g, '')) || 0
  const canSave = amountNumber > 0 && Boolean(categoryId)

  function handleSave() {
    if (!canSave) return
    onSave({ amount: amountNumber, categoryId, date: new Date().toISOString().slice(0, 10), paidBy: payer, split })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-text/40" onClick={onClose} />
      <div className="relative w-full md:max-w-sm bg-surface rounded-t-3xl md:rounded-3xl px-5 pt-3.5 pb-7 max-h-[88vh] overflow-y-auto">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-4.5">
          <h2 className="font-serif text-lg font-semibold">Registrar pago</h2>
          <button onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="text-xs text-text-muted mb-4">
          Deben {formatCLP(debt.remainingAmount)} de {debt.name}. Esto se agrega como movimiento y se descuenta del saldo.
        </div>
        <Field label="Monto a pagar">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="$0" className={inputCls} />
        </Field>
        {expenseCategories.length > 0 && (
          <Field label="Categoría">
            <div className="flex gap-2 overflow-x-auto pb-0.5">
              {expenseCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className={`flex flex-col items-center gap-1.5 shrink-0 ${categoryId === c.id ? '' : 'opacity-60'}`}
                >
                  <div className={categoryId === c.id ? 'ring-2 ring-coral rounded-[14px]' : ''}>
                    <CategoryIcon category={c} />
                  </div>
                  <span className="text-[10.5px] font-semibold">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </Field>
        )}
        <PayerAndSplit payer={payer} onPayer={setPayer} split={split} onSplit={setSplit} />
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
        >
          Registrar pago
        </button>
      </div>
    </div>
  )
}

function RecurringPaymentSheet({
  categories,
  existing,
  onSave,
  onDelete,
  onClose,
}: {
  categories: ReturnType<typeof useData>['categories']
  existing?: RecurringPayment
  onSave: (r: Omit<RecurringPayment, 'id' | 'paidThisMonth' | 'paidOn'>) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const expenseCategories = categories.filter((c) => c.type === 'gasto')
  const [name, setName] = useState(existing?.name ?? '')
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? expenseCategories[0]?.id ?? '')
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '')
  const [dueDay, setDueDay] = useState(existing ? String(existing.dueDay) : '')
  const [payer, setPayer] = useState<UserId | null>(existing?.payer ?? null)
  const members = useMembers()

  const amountNumber = Number(amount.replace(/\D/g, '')) || 0
  const dueDayNumber = Number(dueDay) || 0
  const canSave = name.trim().length > 0 && categoryId && amountNumber > 0 && dueDayNumber >= 1 && dueDayNumber <= 31

  function handleSave() {
    if (!canSave) return
    onSave({ name: name.trim(), categoryId, amount: amountNumber, dueDay: dueDayNumber, payer })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-text/40" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-surface rounded-t-3xl md:rounded-3xl px-5 pt-3.5 pb-7 max-h-[88vh] overflow-y-auto">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-4.5">
          <h2 className="font-serif text-lg font-semibold">{existing ? 'Editar pago fijo' : 'Nuevo pago fijo'}</h2>
          <button onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </div>

        <Field label="Nombre">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Netflix" className={inputCls} />
        </Field>

        <Field label="Categoría">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {expenseCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`flex flex-col items-center gap-1.5 shrink-0 ${categoryId === c.id ? '' : 'opacity-60'}`}
              >
                <div className={categoryId === c.id ? 'ring-2 ring-coral rounded-[14px]' : ''}>
                  <CategoryIcon category={c} />
                </div>
                <span className="text-[10.5px] font-semibold">{c.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Monto mensual">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" placeholder="$0" className={inputCls} />
        </Field>

        <Field label="Día de vencimiento">
          <input value={dueDay} onChange={(e) => setDueDay(e.target.value)} inputMode="numeric" placeholder="Ej: 12" className={inputCls} />
        </Field>

        <Field label="¿Quién paga habitualmente?">
          <div className="flex gap-2.5">
            <button
              onClick={() => setPayer(null)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 border-[1.5px] ${payer === null ? 'border-coral bg-coral-soft' : 'border-border'}`}
            >
              <span className={`text-[13px] ${payer === null ? 'font-bold' : 'font-semibold text-text-muted'}`}>Compartido</span>
            </button>
            {members.map((m) => (
              <button
                key={m.id}
                onClick={() => setPayer(m.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 border-[1.5px] ${payer === m.id ? 'border-coral bg-coral-soft' : 'border-border'}`}
              >
                <Avatar person={m} size={20} />
                <span className={`text-[13px] ${payer === m.id ? 'font-bold' : 'font-semibold text-text-muted'}`}>{m.displayName}</span>
              </button>
            ))}
          </div>
        </Field>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
        >
          {existing ? 'Guardar cambios' : 'Guardar pago fijo'}
        </button>

        {onDelete && (
          <button onClick={onDelete} className="w-full text-danger font-bold text-[13.5px] py-3.5">
            Eliminar pago fijo
          </button>
        )}
      </div>
    </div>
  )
}
