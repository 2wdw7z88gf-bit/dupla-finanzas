import { Link } from 'react-router-dom'
import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { InfoIcon } from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import { useMembers } from '../hooks/useMembers'
import { categoryById, memberById } from '../lib/calc'
import { formatCLP } from '../lib/format'
import type { DraftTransaction, SplitType } from '../types'

export function PorConfirmar() {
  const { draftTransactions, categories, confirmDraft, discardDraft } = useData()
  const members = useMembers()

  return (
    <div>
      <PageHeader title="Por confirmar" backTo="/" />
      <p className="text-[12.5px] text-text-muted leading-relaxed mb-5">
        Detectamos estos pagos en el correo del banco. Revisa la categoría y cómo se dividen antes de agregarlos.
      </p>

      {draftTransactions.length === 0 && (
        <p className="text-sm text-text-muted text-center py-10">No hay gastos por confirmar 🎉</p>
      )}

      {draftTransactions.map((draft) => (
        <DraftCard
          key={draft.id}
          draft={draft}
          categories={categories}
          members={members}
          onConfirm={confirmDraft}
          onDiscard={discardDraft}
        />
      ))}

      <div className="flex items-center justify-center gap-1.5 mt-2">
        <InfoIcon size={14} className="text-text-muted" />
        <Link to="/ajustes/correo" className="text-[12.5px] text-text-muted">
          ¿Cómo funciona esto?
        </Link>
      </div>
    </div>
  )
}

function DraftCard({
  draft,
  categories,
  members,
  onConfirm,
  onDiscard,
}: {
  draft: DraftTransaction
  categories: ReturnType<typeof useData>['categories']
  members: ReturnType<typeof useMembers>
  onConfirm: (id: string, overrides?: Partial<{ categoryId: string; split: SplitType }>) => void
  onDiscard: (id: string) => void
}) {
  const [categoryId, setCategoryId] = useState(
    draft.suggestedCategoryId ?? categories.find((c) => c.type === 'gasto')?.id ?? categories[0]?.id ?? '',
  )
  const [split, setSplit] = useState<SplitType>(draft.suggestedSplit)
  const category = categoryById(categories, categoryId)
  const time = new Date(draft.detectedAt)
  const isToday = new Date().toDateString() === time.toDateString()

  return (
    <div className="bg-surface border border-border rounded-2xl p-4 mb-3">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <div className="text-[14.5px] font-bold">{draft.merchant}</div>
          <div className="text-xs text-text-muted mt-0.5">
            Tarjeta {memberById(members, draft.cardOwner).displayName} •••• {draft.cardLast4} ·{' '}
            {isToday ? 'hoy' : 'ayer'}{' '}
            {time.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="text-base font-bold">{formatCLP(draft.amount)}</div>
      </div>
      <div className="flex gap-2 mb-3">
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="text-[11.5px] font-bold text-coral bg-coral-soft px-2.5 py-1.5 rounded-full outline-none"
        >
          {categories
            .filter((c) => c.type === 'gasto')
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        <select
          value={split}
          onChange={(e) => setSplit(e.target.value as SplitType)}
          className="text-[11.5px] font-bold text-text-muted bg-surface-2 px-2.5 py-1.5 rounded-full outline-none"
        >
          <option value="personal">Personal</option>
          <option value="50/50">50/50</option>
        </select>
      </div>
      <div className="flex gap-2.5">
        <button
          onClick={() => onDiscard(draft.id)}
          className="flex-1 text-center border-[1.5px] border-border text-text-muted font-bold text-[13px] rounded-[10px] py-2.5"
        >
          Descartar
        </button>
        <button
          onClick={() => onConfirm(draft.id, { categoryId, split })}
          className="flex-1 text-center bg-success text-surface font-bold text-[13px] rounded-[10px] py-2.5"
        >
          Confirmar
        </button>
      </div>
      <span className="sr-only">{category.name}</span>
    </div>
  )
}
