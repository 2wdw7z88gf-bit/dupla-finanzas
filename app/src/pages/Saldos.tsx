import { useState } from 'react'
import { Avatar } from '../components/ui/Avatar'
import { ArrowRightIcon, SendIcon } from '../components/icons/Icons'
import { PEOPLE } from '../data/mock'
import { useData } from '../state/DataContext'
import { computeBalance } from '../lib/calc'
import { formatCLP, formatDate } from '../lib/format'
import type { PersonId } from '../types'

export function Saldos() {
  const { transactions, settlements, addSettlement } = useData()
  const [registering, setRegistering] = useState(false)
  const balance = computeBalance(transactions, settlements)

  const shared = transactions.filter((t) => t.split !== 'personal')
  const paidBy: Record<PersonId, number> = { gonzalo: 0, luciana: 0 }
  for (const t of shared) paidBy[t.paidBy] += t.amount
  const sharedTotal = paidBy.gonzalo + paidBy.luciana
  const fairShare = sharedTotal / 2

  function handleRegisterPayment() {
    if (!balance) return
    addSettlement({ from: balance.owes, to: balance.owedTo, amount: balance.amount, date: new Date().toISOString().slice(0, 10) })
    setRegistering(false)
  }

  return (
    <div>
      <h1 className="font-serif text-[22px] font-semibold mb-4.5">Saldos</h1>

      <div className="bg-surface border border-border rounded-2xl p-7 mb-4.5 text-center">
        <div className="flex items-center justify-center gap-4.5 mb-4">
          <Avatar person={PEOPLE.gonzalo} size={52} />
          <ArrowRightIcon size={26} className="text-text-muted" />
          <Avatar person={PEOPLE.luciana} size={52} />
        </div>
        {balance ? (
          <>
            <div className="text-[13.5px] font-semibold text-text-muted">
              {PEOPLE[balance.owes].name} le debe a {PEOPLE[balance.owedTo].name}
            </div>
            <div className="font-serif text-[38px] font-bold my-1">{formatCLP(balance.amount)}</div>
          </>
        ) : (
          <div className="font-serif text-xl font-bold my-4">Están al día 🎉</div>
        )}
        {balance && (
          <button
            onClick={() => setRegistering(true)}
            className="flex items-center justify-center gap-2 bg-coral text-surface font-bold text-[14.5px] rounded-xl py-3.5 w-full mt-3"
          >
            <SendIcon size={17} />
            Registrar pago
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 mb-4.5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold">Gastos compartidos</span>
          <span className="text-[13px] text-text-muted">{formatCLP(sharedTotal)}</span>
        </div>
        {(['luciana', 'gonzalo'] as PersonId[]).map((id) => (
          <div key={id} className="mb-3.5 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Avatar person={PEOPLE[id]} size={18} />
                <span className="text-[13px] font-semibold">{PEOPLE[id].name} puso</span>
              </div>
              <span className="text-[13px] font-bold">{formatCLP(paidBy[id])}</span>
            </div>
            <div className="h-[7px] bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${id === 'luciana' ? 'bg-coral' : 'bg-teal'}`}
                style={{ width: sharedTotal ? `${(paidBy[id] / sharedTotal) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
        <div className="text-xs text-text-muted mt-3.5 pt-3.5 border-t border-border">
          A cada uno le correspondía poner <b className="text-text">{formatCLP(fairShare)}</b>
        </div>
      </div>

      <div className="text-base font-bold mb-3">Historial de pagos</div>
      {settlements.length === 0 && <p className="text-sm text-text-muted">Todavía no han registrado pagos entre ustedes.</p>}
      {settlements.map((s) => (
        <div key={s.id} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
          <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center ${s.from === 'gonzalo' ? 'bg-teal-soft' : 'bg-coral-soft'}`}>
            <SendIcon size={16} className={s.from === 'gonzalo' ? 'text-teal' : 'text-coral'} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">
              {PEOPLE[s.from].name} transfirió a {PEOPLE[s.to].name}
            </div>
            <div className="text-xs text-text-muted">{formatDate(s.date)}</div>
          </div>
          <div className="text-sm font-bold">{formatCLP(s.amount)}</div>
        </div>
      ))}

      <p className="text-xs text-text-muted text-center mt-5 leading-relaxed">
        Los gastos marcados como compartidos se dividen 50/50, salvo que elijas otra proporción al crearlos.
      </p>

      {registering && balance && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-text/40" onClick={() => setRegistering(false)} />
          <div className="relative bg-surface rounded-2xl p-6 w-[320px] text-center">
            <p className="text-sm mb-4">
              ¿Confirmas que <b>{PEOPLE[balance.owes].name}</b> le transfirió <b>{formatCLP(balance.amount)}</b> a{' '}
              <b>{PEOPLE[balance.owedTo].name}</b>?
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setRegistering(false)}
                className="flex-1 border border-border rounded-xl py-2.5 text-sm font-semibold text-text-muted"
              >
                Cancelar
              </button>
              <button onClick={handleRegisterPayment} className="flex-1 bg-coral text-surface rounded-xl py-2.5 text-sm font-bold">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
