import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { HouseholdMember } from '../types'

interface AuthContextValue {
  session: Session | null
  loading: boolean
  householdId: string | null
  userId: string | null
  member: HouseholdMember | null // me
  members: HouseholdMember[] // everyone in the household, including me
  signUp: (email: string, password: string, displayName: string) => Promise<{ error?: string }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * Tracks the Supabase session, this user's membership in the (one)
 * household, and everyone else in it. On first login/signup with no
 * membership row yet, calls the `bootstrap_household` RPC — see
 * supabase/002_bootstrap_household.sql.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [householdId, setHouseholdId] = useState<string | null>(null)
  const [members, setMembers] = useState<HouseholdMember[]>([])
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
      setMembers([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    async function loadMembers(hId: string) {
      const { data } = await supabase!
        .from('household_members')
        .select('user_id, display_name, color')
        .eq('household_id', hId)
      if (!cancelled && data) {
        setMembers(data.map((r) => ({ id: r.user_id, displayName: r.display_name, color: r.color as 'coral' | 'teal' })))
      }
    }

    ;(async () => {
      const { data: row } = await supabase!
        .from('household_members')
        .select('household_id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (cancelled) return

      let hId = row?.household_id as string | undefined

      if (!hId) {
        // First time this user is seen: create or join the household.
        const displayName = pendingDisplayName.current ?? session.user.email?.split('@')[0] ?? 'Tú'
        const { data: newHId } = await supabase!.rpc('bootstrap_household', { p_display_name: displayName })
        hId = newHId ?? undefined
      }

      if (cancelled) return

      if (hId) {
        setHouseholdId(hId)
        await loadMembers(hId)
      }
      if (!cancelled) setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [session])

  // Keep the member list live: if my partner signs up while I'm looking at the app, show them without a reload.
  useEffect(() => {
    if (!supabase || !householdId) return
    const channel = supabase
      .channel(`household_members-${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'household_members', filter: `household_id=eq.${householdId}` },
        () => {
          supabase!
            .from('household_members')
            .select('user_id, display_name, color')
            .eq('household_id', householdId)
            .then(({ data }) => {
              if (data) setMembers(data.map((r) => ({ id: r.user_id, displayName: r.display_name, color: r.color as 'coral' | 'teal' })))
            })
        },
      )
      .subscribe()
    return () => {
      supabase?.removeChannel(channel)
    }
  }, [householdId])

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

  const userId = session?.user.id ?? null
  const member = members.find((m) => m.id === userId) ?? null

  return (
    <AuthContext.Provider value={{ session, loading, householdId, userId, member, members, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
