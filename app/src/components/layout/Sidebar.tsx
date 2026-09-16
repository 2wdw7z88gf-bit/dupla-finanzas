import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './nav'
import { GearIcon } from '../icons/Icons'
import { Avatar } from '../ui/Avatar'
import { useMe } from '../../hooks/useMembers'

export function Sidebar() {
  const me = useMe()
  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 bg-surface border-r border-border p-7">
      <div className="flex items-center gap-2.5 px-2 mb-9">
        <div className="relative w-[30px] h-[22px]">
          <div className="absolute left-0 top-0 w-5 h-5 rounded-full bg-coral-soft" />
          <div className="absolute left-[9px] top-0 w-5 h-5 rounded-full bg-teal-soft" />
        </div>
        <span className="font-serif text-[19px] font-semibold">Dupla</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                isActive ? 'bg-coral-soft text-coral' : 'text-text-muted hover:bg-surface-2'
              }`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1" />

      <NavLink
        to="/ajustes"
        className="flex items-center gap-2.5 pt-[18px] border-t border-border px-2 py-2.5 rounded-xl hover:bg-surface-2"
      >
        <Avatar person={me} size={34} />
        <div className="flex-1">
          <div className="text-[13px] font-bold">{me.displayName}</div>
          <div className="text-[11.5px] text-text-muted">Ver ajustes</div>
        </div>
        <GearIcon size={17} className="text-text-muted" />
      </NavLink>
    </aside>
  )
}
