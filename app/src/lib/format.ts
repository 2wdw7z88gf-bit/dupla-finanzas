const clp = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

export function formatCLP(amount: number): string {
  return clp.format(Math.round(amount))
}

const dateFmt = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long' })

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function relativeDay(iso: string, today: Date = new Date()): string {
  const d = new Date(iso)
  const diffDays = Math.round(
    (Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) /
      86400000,
  )
  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  return dateFmt.format(d)
}

export function monthName(date: Date = new Date()): string {
  const name = new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(date)
  return name.charAt(0).toUpperCase() + name.slice(1)
}
