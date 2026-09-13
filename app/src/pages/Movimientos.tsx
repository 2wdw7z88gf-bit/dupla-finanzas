import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { TransactionRow } from '../components/ui/TransactionRow'
import { FilterIcon, PlusIcon } from '../components/icons/Icons'
import { AddTransactionSheet } from '../components/AddTransactionSheet'
import { useData } from '../state/DataContext'
import { categoryById, groupTransactionsByDay } from '../lib/calc'
import { monthName } from '../lib/format'

export function Movimientos() {
  const { transactions, categories } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [adding, setAdding] = useState(searchParams.has('add'))

  function openAdd() {
    setAdding(true)
  }
  function closeAdd() {
    setAdding(false)
    if (searchParams.has('add')) {
      searchParams.delete('add')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const groups = groupTransactionsByDay(transactions)

  return (
    <div>
      <PageHeader
        title="Movimientos"
        action={
          <button className="w-[38px] h-[38px] rounded-full border-[1.5px] border-border flex items-center justify-center">
            <FilterIcon size={17} />
          </button>
        }
      />

      <div className="flex gap-2 mb-4.5">
        <span className="bg-coral text-surface text-[12.5px] font-bold px-3.5 py-2 rounded-full">
          {monthName().split(' ')[0]} ⌄
        </span>
        <span className="border border-border text-[12.5px] font-semibold px-3.5 py-2 rounded-full">Todos ⌄</span>
        <span className="border border-border text-[12.5px] font-semibold px-3.5 py-2 rounded-full">Categoría ⌄</span>
      </div>

      {groups.length === 0 && (
        <p className="text-sm text-text-muted text-center py-10">Todavía no hay movimientos este mes.</p>
      )}

      {groups.map((group) => (
        <div key={group.date} className="mb-4">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2">{group.label}</div>
          <div>
            {group.items.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} category={categoryById(categories, tx.categoryId)} showSplitBadge />
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={openAdd}
        className="fixed right-5 bottom-[96px] md:bottom-8 w-14 h-14 rounded-full bg-coral flex items-center justify-center shadow-[0_6px_16px_oklch(55%_0.15_35_/_0.35)]"
      >
        <PlusIcon size={24} className="text-surface" strokeWidth={2.4} />
      </button>

      {adding && <AddTransactionSheet onClose={closeAdd} />}
    </div>
  )
}
