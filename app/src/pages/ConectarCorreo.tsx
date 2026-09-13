import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { CopyIcon, MailIcon } from '../components/icons/Icons'

const ALIAS = 'gonzalo-luciana-4f2a@gastos.dupla.app'

export function ConectarCorreo() {
  const [copied, setCopied] = useState(false)

  async function copyAlias() {
    try {
      await navigator.clipboard.writeText(ALIAS)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard permission denied — nothing to fall back to here
    }
  }

  return (
    <div>
      <PageHeader title="Correo del banco" backTo="/ajustes" />

      <div className="text-center mb-5.5">
        <div className="w-14 h-14 rounded-full bg-coral-soft flex items-center justify-center mx-auto mb-3.5">
          <MailIcon size={26} className="text-coral" strokeWidth={1.7} />
        </div>
        <p className="text-[13.5px] text-text-muted leading-relaxed px-2">
          Reenvía los correos de "compra aprobada" de tu banco a esta dirección y te armamos el borrador del gasto
          automáticamente.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
        <div className="text-[11.5px] font-bold text-text-muted uppercase tracking-wide mb-2">
          Su dirección de reenvío
        </div>
        <button
          onClick={copyAlias}
          className="w-full flex items-center justify-between gap-2.5 bg-bg rounded-[10px] px-3.5 py-3 text-left"
        >
          <span className="text-[13px] font-semibold break-all">{ALIAS}</span>
          <CopyIcon size={16} className="text-coral shrink-0" />
        </button>
        {copied && <div className="text-xs text-success font-semibold mt-2">Copiado ✓</div>}
      </div>

      <div className="text-base font-bold mb-3.5">Cómo configurarlo</div>
      <Step n={1}>Entra a la configuración de reglas/filtros de tu correo (Gmail, Outlook, etc.).</Step>
      <Step n={2}>
        Crea una regla: si el remitente es tu banco y el asunto contiene <b>"compra aprobada"</b>, reenviar a la
        dirección de arriba.
      </Step>
      <Step n={3}>
        Listo. Los próximos pagos con esa tarjeta (incluido Apple Pay) van a aparecer en <b>"Por confirmar"</b>.
      </Step>

      <div className="text-base font-bold mb-3 mt-6">Bancos conectados</div>
      <div className="bg-surface border border-border rounded-2xl overflow-hidden mb-5.5">
        <BankRow bank="Banco de Chile" owner="Gonzalo" />
        <BankRow bank="Santander" owner="Luciana" last />
      </div>

      <p className="text-xs text-text-muted text-center leading-relaxed">
        Esto no le da acceso a tu correo completo — solo recibimos lo que tú decides reenviar.
      </p>
    </div>
  )
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 mb-4">
      <div className="w-6 h-6 rounded-full bg-coral-soft text-coral text-xs font-bold flex items-center justify-center shrink-0">
        {n}
      </div>
      <div className="text-[13.5px] leading-relaxed">{children}</div>
    </div>
  )
}

function BankRow({ bank, owner, last = false }: { bank: string; owner: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-3.5 py-3.5 ${last ? '' : 'border-b border-border'}`}>
      <div className="w-2 h-2 rounded-full bg-success shrink-0" />
      <span className="flex-1 text-sm font-semibold">{bank}</span>
      <span className="text-xs text-text-muted">{owner}</span>
    </div>
  )
}
