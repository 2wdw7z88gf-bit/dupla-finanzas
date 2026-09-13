import { BarChartIcon, ExchangeIcon, HomeIcon, ScaleIcon, TargetIcon } from '../icons/Icons'
import type { ComponentType } from 'react'

interface NavItem {
  to: string
  label: string
  shortLabel?: string
  Icon: ComponentType<{ size?: number }>
  end?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', Icon: HomeIcon, end: true },
  { to: '/movimientos', label: 'Movimientos', shortLabel: 'Movs', Icon: ExchangeIcon },
  { to: '/presupuestos', label: 'Presupuestos', shortLabel: 'Presup.', Icon: TargetIcon },
  { to: '/saldos', label: 'Saldos', Icon: ScaleIcon },
  { to: '/reportes', label: 'Reportes', Icon: BarChartIcon },
]
