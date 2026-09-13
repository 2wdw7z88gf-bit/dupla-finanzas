import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './nav'

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface border-t border-border flex items-center justify-around pb-3.5 z-20">
      {NAV_ITEMS.map(({ to, label, shortLabel, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-coral' : 'text-text-muted'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} />
              <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-semibold'}`}>
                {shortLabel ?? label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
