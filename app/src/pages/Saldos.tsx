import { Fragment, useState } from 'react'
import { Avatar } from '../components/ui/Avatar'
import { ArrowRightIcon, SendIcon } from '../components/icons/Icons'
import { useData } from '../state/DataContext'
import { useMembers } from '../hooks/useMembers'
import { computeBalance, memberById } from '../lib/calc'
import { formatCLP, formatDate } from '../lib/format'

export function Saldos() {
  const { transactions, settlements, addSettlement } = useData()
  const members = useMembers()
  const [registering, setRegistering] = useState(false)
  const balance = computeBalance(
    transactions,
    settlements,
    members.map((m) => m.id),
  )

  const shared = transactions.filter((t) => t.split !== 'personal')
  const paidBy = new Map<string, number>(members.map((m) => [m.id, 0]))
  for (const t of shared) paidBy.set(t.paidBy, (paidBy.get(t.paidBy) ?? 0) + t.amount)
  const sharedTotal = [...paidBy.values()].reduce((a, b) => a + b, 0)
  const fairShare = members.length ? sharedTotal / members.length : 0

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
          {members.map((m, i) => (
            <Fragment key={m.id}>
              <Avatar person={m} size={52} />
              {i === 0 && members.length > 1 && <ArrowRightIcon size={26} className="text-text-muted" />}
            </Fragment>
          ))}
        </div>
        {balance ? (
          <>
            <div className="text-[13.5px] font-semibold text-text-muted">
              {memberById(members, balance.owes).displayName} le debe a {memberById(members, balance.owedTo).displayName}
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
        {members.map((m) => (
          <div key={m.id} className="mb-3.5 last:mb-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Avatar person={m} size={18} />
                <span className="text-[13px] font-semibold">{m.displayName} puso</span>
              </div>
              <span className="text-[13px] font-bold">{formatCLP(paidBy.get(m.id) ?? 0)}</span>
            </div>
            <div className="h-[7px] bg-surface-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${m.color === 'coral' ? 'bg-coral' : 'bg-teal'}`}
                style={{ width: sharedTotal ? `${((paidBy.get(m.id) ?? 0) / sharedTotal) * 100}%` : '0%' }}
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
      {settlements.map((s) => {
        const from = memberById(members, s.from)
        const to = memberById(members, s.to)
        return (
          <div key={s.id} className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
            <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center ${from.color === 'teal' ? 'bg-teal-soft' : 'bg-coral-soft'}`}>
              <SendIcon size={16} className={from.color === 'teal' ? 'text-teal' : 'text-coral'} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {from.displayName} transfirió a {to.displayName}
              </div>
              <div className="text-xs text-text-muted">{formatDate(s.date)}</div>
            </div>
            <div className="text-sm font-bold">{formatCLP(s.amount)}</div>
          </div>
        )
      })}

      <p className="text-xs text-text-muted text-center mt-5 leading-relaxed">
        Los gastos marcados como compartidos se dividen 50/50, salvo que elijas otra proporción al crearlos.
      </p>

      {registering && balance && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-text/40" onClick={() => setRegistering(false)} />
          <div className="relative bg-surface rounded-2xl p-6 w-[320px] text-center">
            <p className="text-sm mb-4">
              ¿Confirmas que <b>{memberById(members, balance.owes).displayName}</b> le transfirió{' '}
              <b>{formatCLP(balance.amount)}</b> a <b>{memberById(members, balance.owedTo).displayName}</b>?
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
