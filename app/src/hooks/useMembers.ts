import { PEOPLE } from '../data/mock'
import { isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../state/AuthContext'
import type { HouseholdMember } from '../types'

const DEMO_MEMBERS: HouseholdMember[] = [PEOPLE.luciana, PEOPLE.gonzalo]

/** The people in this household — real members once Supabase is connected, mock Gonzalo/Luciana in demo mode. */
export function useMembers(): HouseholdMember[] {
  const { members } = useAuth()
  const list = isSupabaseConfigured ? members : DEMO_MEMBERS
  // Stable, deterministic order (coral first) so "who's on the left" doesn't jump around.
  return [...list].sort((a, b) => a.color.localeCompare(b.color))
}

/** The signed-in user, as a HouseholdMember (falls back to "Luciana" in demo mode). */
export function useMe(): HouseholdMember {
  const { member } = useAuth()
  return isSupabaseConfigured ? (member ?? { id: '', displayName: 'Tú', color: 'coral' }) : PEOPLE.luciana
}
