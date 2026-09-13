import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface Member {
  displayName: string
  color: 'coral' | 'teal'
}

interface AuthContextValue {
  session: Session | null
  loading: boolean
  householdId: string | null
  member: Member | null
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Tracks the Supabase session and this user's membership in the (one)
 * household. On first login/signup with no membership row yet, calls the
 * `bootstrap_household` RPC — see supabase/002_bootstrap_household.sql.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const pendingDisplayName = useRef<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => setSession(sess))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    if (!session) {
      setHouseholdId(null)
      setMember(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    ;(async () => {
      const { data: row } = await supabase
        .from('household_members')
        .select('household_id, display_name, color')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (cancelled) return

      if (row) {
        setHouseholdId(row.household_id)
        setMember({ displayName: row.display_name, color: row.color as 'coral' | 'teal' })
        setLoading(false)
        return
      }

      // First time this user is seen: create or join the household.
      const displayName = pendingDisplayName.current ?? session.user.email?.split('@')[0] ?? 'Tú'
      await supabase.rpc('bootstrap_household', { p_display_name: displayName })
      const { data: freshRow } = await supabase
        .from('household_members')
        .select('household_id, display_name, color')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!cancelled && freshRow) {
        setHouseholdId(freshRow.household_id)
        setMember({ displayName: freshRow.display_name, color: freshRow.color as 'coral' | 'teal' })
      }
      if (!cancelled) setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [session])

  async function signUp(email: string, password: string, displayName: string) {
    if (!supabase) return {}
    pendingDisplayName.current = displayName
    const { error } = await supabase.auth.signUp({ email, password })
    return error ? { error: error.message } : {}
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return {}
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? { error: error.message } : {}
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, loading, householdId, member, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
