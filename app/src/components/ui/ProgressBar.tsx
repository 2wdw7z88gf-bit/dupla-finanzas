const FILL_CLASSES: Record<string, string> = {
  coral: 'bg-coral',
  teal: 'bg-teal',
  success: 'bg-success',
  amber: 'bg-amber',
  danger: 'bg-danger',
  gold: 'bg-gold',
  indigo: 'bg-indigo',
}

export function ProgressBar({
  percent,
  color = 'coral',
  height = 8,
}: {
  percent: number
  color?: keyof typeof FILL_CLASSES
  height?: number
}) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div className="rounded-full bg-surface-2 overflow-hidden" style={{ height }}>
      <div className={`h-full rounded-full ${FILL_CLASSES[color]}`} style={{ width: `${clamped}%` }} />
    </div>
  )
}
