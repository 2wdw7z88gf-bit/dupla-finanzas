import type { SplitType } from '../../types'

export function SplitBadge({ split, ratio }: { split: SplitType; ratio?: [number, number] }) {
  if (split === 'personal') {
    return (
      <span className="text-[10.5px] font-bold text-text-muted bg-surface-2 px-[7px] py-[1.5px] rounded-full shrink-0">
        Personal
      </span>
    )
  }
  if (split === 'custom' && ratio) {
    return (
      <span className="text-[10.5px] font-bold text-indigo bg-indigo-soft px-[7px] py-[1.5px] rounded-full shrink-0">
        {Math.round(ratio[0] * 100)}/{Math.round(ratio[1] * 100)}
      </span>
    )
  }
  return (
    <span className="text-[10.5px] font-bold text-teal bg-teal-soft px-[7px] py-[1.5px] rounded-full shrink-0">
      50/50
    </span>
  )
}
