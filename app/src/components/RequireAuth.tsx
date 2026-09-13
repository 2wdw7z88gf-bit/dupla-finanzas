import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../state/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()

  if (!isSupabaseConfigured) return <>{children}</> // demo mode: no login required

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text-muted text-sm">
        Cargando…
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return <>{children}</>
}
