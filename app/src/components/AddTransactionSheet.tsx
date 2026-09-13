import { useState } from 'react'
import { CategoryIcon } from './ui/CategoryIcon'
import { CloseIcon } from './icons/Icons'
import { Avatar } from './ui/Avatar'
import { useData } from '../state/DataContext'
import { useMe, useMembers } from '../hooks/useMembers'
import type { SplitType, UserId } from '../types'
import { formatCLP } from '../lib/format'

export function AddTransactionSheet({ onClose }: { onClose: () => void }) {
  const { categories, addTransaction } = useData()
  const me = useMe()
  const members = useMembers()
  const [kind, setKind] = useState<'gasto' | 'ingreso'>('gasto')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [payer, setPayer] = useState<UserId>(me.id)
  const [split, setSplit] = useState<SplitType>('50/50')

  const filteredCategories = categories.filter((c) => c.type === kind)
  const selectedCategory = categoryId ?? filteredCategories[0]?.id
  const amountNumber = Number(amount.replace(/\D/g, '')) || 0
  const canSave = amountNumber > 0 && description.trim().length > 0 && selectedCategory

  function handleSave() {
    if (!canSave) return
    addTransaction({
      description: description.trim(),
      categoryId: selectedCategory,
      amount: amountNumber,
      date: new Date().toISOString().slice(0, 10),
      paidBy: payer,
      split,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-text/40" onClick={onClose} />
      <div className="relative w-full md:max-w-md bg-surface rounded-t-3xl md:rounded-3xl px-5 pt-3.5 pb-7 max-h-[88vh] overflow-y-auto">
        <div className="w-9 h-1 bg-border rounded-full mx-auto mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-4.5">
          <h2 className="font-serif text-lg font-semibold">Nuevo movimiento</h2>
          <button onClick={onClose} aria-label="Cerrar">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="flex bg-surface-2 rounded-xl p-1 mb-4.5">
          {(['gasto', 'ingreso'] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`flex-1 text-center text-[13.5px] font-bold py-2.5 rounded-[9px] capitalize ${
                kind === k ? 'bg-coral text-surface' : 'text-text-muted'
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="text-center mb-4.5">
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="numeric"
            placeholder="$0"
            className="font-serif text-4xl font-bold text-center bg-transparent outline-none w-full placeholder:text-text-muted/50"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿En qué fue?"
            className="text-xs text-text-muted text-center bg-transparent outline-none w-full mt-0.5"
          />
        </div>

        <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">Categoría</div>
        <div className="flex gap-2 overflow-x-auto mb-4.5 pb-0.5">
          {filteredCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryId(c.id)}
              className={`flex flex-col items-center gap-1.5 shrink-0 ${
                selectedCategory === c.id ? '' : 'opacity-60'
              }`}
            >
              <div className={selectedCategory === c.id ? 'ring-2 ring-coral rounded-[14px]' : ''}>
                <CategoryIcon category={c} />
              </div>
              <span className="text-[10.5px] font-semibold">{c.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">¿Quién pagó?</div>
        <div className="flex gap-2.5 mb-4.5">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setPayer(m.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 border-[1.5px] ${
                payer === m.id ? 'border-coral bg-coral-soft' : 'border-border'
              }`}
            >
              <Avatar person={m} size={22} />
              <span className={`text-[13px] ${payer === m.id ? 'font-bold' : 'font-semibold text-text-muted'}`}>
                {m.displayName}
              </span>
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">¿Cómo se divide?</div>
        <div className="flex bg-surface-2 rounded-xl p-1 mb-5">
          {(['50/50', 'personal', 'custom'] as SplitType[]).map((s) => (
            <button
              key={s}
              onClick={() => setSplit(s)}
              className={`flex-1 text-center text-[13px] font-bold py-2.5 rounded-[9px] capitalize ${
                split === s ? 'bg-surface shadow-sm text-text' : 'text-text-muted'
              }`}
            >
              {s === 'custom' ? 'Custom' : s === 'personal' ? 'Personal' : '50/50'}
            </button>
          ))}
        </div>

        {split === '50/50' && amountNumber > 0 && (
          <div className="text-xs text-text-muted mb-5 -mt-3">
            Cada uno paga <b className="text-text">{formatCLP(amountNumber / 2)}</b>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-40"
        >
          Guardar movimiento
        </button>
      </div>
    </div>
  )
}
