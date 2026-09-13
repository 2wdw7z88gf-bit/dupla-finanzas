import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockIcon } from '../components/icons/Icons'
import { HeartIcon } from '../components/icons/Icons'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode: no backend configured yet, just enter the app.
      navigate('/')
      return
    }

    setLoading(true)
    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[340px] flex flex-col items-center">
        <div className="relative w-16 h-11 mb-4.5">
          <div className="absolute left-0 top-0 w-11 h-11 rounded-full bg-coral-soft" />
          <div className="absolute left-5 top-0 w-11 h-11 rounded-full bg-teal-soft" />
          <div className="absolute left-[22px] top-3.5 w-5 h-4 flex items-center justify-center">
            <HeartIcon size={16} className="text-surface" strokeWidth={2.2} />
          </div>
        </div>

        <h1 className="font-serif text-[30px] font-semibold tracking-tight">Dupla</h1>
        <p className="text-sm text-text-muted mt-1 mb-9 text-center">Sus finanzas, juntos.</p>

        {!isSupabaseConfigured && (
          <div className="w-full bg-amber-soft text-[12.5px] text-text rounded-xl px-3.5 py-3 mb-4 leading-relaxed">
            Todavía no está conectada a una base de datos real — cualquier botón de acá abajo te deja entrar en{' '}
            <b>modo demo</b> con datos de ejemplo.
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full bg-surface border border-border rounded-[20px] p-6">
          <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Correo</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tú@correo.com"
            className="w-full border border-border rounded-xl px-3.5 py-3 text-[15px] mt-1.5 mb-4 bg-bg outline-none"
          />

          <label className="text-xs font-bold text-text-muted uppercase tracking-wide">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-border rounded-xl px-3.5 py-3 text-[15px] mt-1.5 mb-5 bg-bg outline-none"
          />

          {error && <div className="text-xs text-danger font-semibold mb-4">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coral text-surface font-bold text-[15px] rounded-xl py-3.5 disabled:opacity-60"
          >
            {loading ? 'Cargando…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>

          <div className="flex items-center gap-2.5 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">o</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="w-full border-[1.5px] border-coral text-coral font-bold text-sm rounded-xl py-3.5"
          >
            {mode === 'login' ? 'Crear cuenta e invitar a mi pareja' : 'Ya tengo cuenta'}
          </button>
        </form>

        <div className="flex items-center gap-2 text-text-muted text-[12.5px] mt-6 text-center leading-relaxed">
          <LockIcon size={15} className="shrink-0" />
          <span>Tus datos son privados: solo Gonzalo y Luciana pueden verlos.</span>
        </div>
      </div>
    </div>
  )
}
