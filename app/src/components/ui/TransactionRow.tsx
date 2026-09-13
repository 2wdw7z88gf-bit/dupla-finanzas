import type { Category, Transaction } from '../../types'
import { useMembers } from '../../hooks/useMembers'
import { formatCLP, relativeDay } from '../../lib/format'
import { memberById } from '../../lib/calc'
import { CategoryIcon } from './CategoryIcon'
import { SplitBadge } from './SplitBadge'

export function TransactionRow({
  tx,
  category,
  showSplitBadge = false,
}: {
  tx: Transaction
  category: Category
  showSplitBadge?: boolean
}) {
  const members = useMembers()
  const isIncome = category.type === 'ingreso'
  return (
    <div className="flex items-center gap-3 py-[11px] border-b border-border last:border-b-0">
      <CategoryIcon category={category} />
      <div className="flex-1 min-w-0">
        <div className="text-[14.5px] font-semibold truncate">{tx.description}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-text-muted truncate">
            {category.name} · {memberById(members, tx.paidBy).displayName}
          </span>
          {showSplitBadge && <SplitBadge split={tx.split} ratio={tx.splitRatio} />}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className={`text-[14.5px] font-bold ${isIncome ? 'text-success' : 'text-danger'}`}>
          {isIncome ? '+' : '-'}
          {formatCLP(tx.amount)}
        </div>
        <div className="text-[11.5px] text-text-muted">{relativeDay(tx.date)}</div>
      </div>
    </div>
  )
}
