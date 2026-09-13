import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import {
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  EditIcon,
  LogoutIcon,
  MailIcon,
  TargetIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from '../components/icons/Icons'
import { Avatar } from '../components/ui/Avatar'
import { useData } from '../state/DataContext'
import { useAuth } from '../state/AuthContext'
import { useMembers } from '../hooks/useMembers'

export function Ajustes() {
  const { categories, accounts } = useData()
  const { signOut } = useAuth()
  const members = useMembers()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [reconcileReminder, setReconcileReminder] = useState(true)

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div>
      <PageHeader title="Ajustes" />

      <div className="flex items-center gap-3.5 bg-surface border border-border rounded-2xl p-4.5 mb-5">
        <div className="relative w-[52px] h-[42px] shrink-0">
          {members.map((m, i) => (
            <div key={m.id} className={i === 0 ? 'absolute left-0 top-0' : 'absolute left-[18px] top-0 ring-2 ring-surface rounded-full'}>
              <Avatar person={m} size={36} />
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-bold">{members.map((m) => m.displayName).join(' & ') || 'Tu hogar'}</div>
          <div className="text-[12.5px] text-text-muted">Espacio compartido</div>
        </div>
        <EditIcon size={16} className="text-text-muted" />
      </div>

      <SectionLabel>Cuenta</SectionLabel>
      <Group>
        <Row icon={<WalletIcon size={19} />} label="Moneda" value="CLP · Peso chileno" />
        <Row icon={<TargetIcon size={19} />} label="Categorías" value={`${categories.length} categorías`} to="/ajustes/categorias" />
        <Row icon={<UsersIcon size={19} />} label="Miembros" value={`${members.length} persona${members.length === 1 ? '' : 's'}`} />
        <Row
          icon={<TrendingUpIcon size={19} />}
          label="Cuentas de ahorro"
          value={`${accounts[0].name} · ${(accounts[0].annualInterestRate * 100).toFixed(1)}%`}
        />
        <Row icon={<MailIcon size={19} />} label="Correo del banco" value="2 conectados" to="/ajustes/correo" last />
      </Group>

      <SectionLabel>Preferencias</SectionLabel>
      <Group>
        <ToggleRow icon={<BellIcon size={19} />} label="Notificaciones" checked={notifications} onChange={setNotifications} />
        <Row icon={<CalendarIcon size={19} />} label="Cierre de mes" value="Día 1" />
        <ToggleRow
          icon={<BellIcon size={19} />}
          label="Recordatorio de conciliar saldo"
          sublabel="Mensual, para ajustar el saldo real de tus cuentas"
          checked={reconcileReminder}
          onChange={setReconcileReminder}
          last
        />
      </Group>

      <Group>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3.5 py-3.5 text-danger text-left">
          <LogoutIcon size={19} />
          <span className="flex-1 text-[14.5px] font-bold">Cerrar sesión</span>
        </button>
      </Group>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold text-text-muted uppercase tracking-wide mb-2.5 ml-1">{children}</div>
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-5">{children}</div>
}

function Row({
  icon,
  label,
  value,
  to,
  last = false,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  to?: string
  last?: boolean
}) {
  const content = (
    <>
      <span className="text-text-muted">{icon}</span>
      <span className="flex-1 text-[14.5px] font-semibold">{label}</span>
      {value && <span className="text-[13px] text-text-muted">{value}</span>}
      {to && <ChevronRightIcon size={15} className="text-text-muted" />}
    </>
  )
  const cls = `flex items-center gap-3 px-3.5 py-3.5 ${last ? '' : 'border-b border-border'}`
  return to ? (
    <Link to={to} className={cls}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  )
}

function ToggleRow({
  icon,
  label,
  sublabel,
  checked,
  onChange,
  last = false,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  checked: boolean
  onChange: (v: boolean) => void
  last?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 px-3.5 py-3.5 ${last ? '' : 'border-b border-border'}`}>
      <span className="text-text-muted">{icon}</span>
      <div className="flex-1">
        <div className="text-[14.5px] font-semibold">{label}</div>
        {sublabel && <div className="text-[11.5px] text-text-muted mt-px">{sublabel}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-[38px] h-[22px] rounded-full relative shrink-0 transition-colors ${checked ? 'bg-coral' : 'bg-surface-2'}`}
      >
        <span
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-surface transition-all ${checked ? 'left-[18px]' : 'left-[2px]'}`}
        />
      </button>
    </div>
  )
}
