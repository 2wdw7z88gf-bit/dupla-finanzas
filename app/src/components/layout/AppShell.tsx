import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-screen flex bg-bg text-text">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="max-w-xl mx-auto px-5 pt-6 pb-24 md:pb-10">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
