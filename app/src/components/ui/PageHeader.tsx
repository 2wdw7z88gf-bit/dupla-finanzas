import { Link } from 'react-router-dom'
import { ChevronLeftIcon } from '../icons/Icons'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  backTo,
  action,
}: {
  title: string
  backTo?: string
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-[18px] gap-3">
      <div className="flex items-center gap-2.5">
        {backTo && (
          <Link to={backTo} className="text-text">
            <ChevronLeftIcon size={18} strokeWidth={2} />
          </Link>
        )}
        <h1 className="font-serif text-[22px] font-semibold">{title}</h1>
      </div>
      {action}
    </div>
  )
}
