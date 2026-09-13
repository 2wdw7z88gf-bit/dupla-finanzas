import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Loads every row of `table` scoped to `householdId`, then keeps it live via
 * Supabase Realtime — so when Gonzalo adds a transaction, Luciana's screen
 * updates without a reload, and vice versa.
 */
export function useRealtimeTable<T extends Record<string, unknown>>(
  table: string,
  householdId: string | null,
  keyOf: (row: T) => string,
  order?: { column: string; ascending?: boolean },
) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase || !householdId) {
      setRows([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    let query = supabase.from(table).select('*').eq('household_id', householdId)
    if (order) query = query.order(order.column, { ascending: order.ascending ?? true })

    query.then(({ data, error }) => {
      if (cancelled) return
      if (!error && data) setRows(data as T[])
      setLoading(false)
    })

    const channel = supabase
      .channel(`${table}-${householdId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter: `household_id=eq.${householdId}` },
        (payload) => {
          setRows((prev) => {
            if (payload.eventType === 'INSERT') {
              const row = payload.new as T
              return prev.some((r) => keyOf(r) === keyOf(row)) ? prev : [...prev, row]
            }
            if (payload.eventType === 'UPDATE') {
              const row = payload.new as T
              return prev.map((r) => (keyOf(r) === keyOf(row) ? row : r))
            }
            if (payload.eventType === 'DELETE') {
              const old = payload.old as T
              return prev.filter((r) => keyOf(r) !== keyOf(old))
            }
            return prev
          })
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase?.removeChannel(channel)
    }
  }, [table, householdId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { rows, setRows, loading }
}
