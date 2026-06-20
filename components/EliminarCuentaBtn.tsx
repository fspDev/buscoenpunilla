'use client'

import { useState, useTransition } from 'react'
import { eliminarCuentaAction } from '@/app/actions/cuenta'

const PALABRA = 'ELIMINAR'

export function EliminarCuentaBtn() {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  function confirmar() {
    setError(null)
    start(async () => {
      const r = await eliminarCuentaAction()
      // Si la acción no redirige (error), mostramos el mensaje.
      if (r?.error) setError(r.error)
    })
  }

  return (
    <section className="rounded-xl border border-ds-error/30 bg-white p-5 shadow-card space-y-3">
      <h3 className="font-semibold text-ds-error">Eliminar mi cuenta</h3>
      <p className="text-xs text-on-surface-variant leading-relaxed">
        Esta acción es <strong>permanente</strong>. Se borrarán tu perfil, tus datos, reseñas y fotos.
        No se puede deshacer.
      </p>

      {!abierto ? (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="w-full rounded-lg border border-ds-error/30 bg-ds-error-container/20 py-2.5 text-center text-sm font-semibold text-ds-error transition hover:bg-ds-error-container/40"
        >
          Eliminar mi cuenta
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border border-ds-error/30 bg-ds-error-container/10 p-3">
          <p className="text-sm text-on-surface">
            Para confirmar, escribí <strong>{PALABRA}</strong> abajo.
          </p>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder={PALABRA}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-ds-error focus:ring-1 focus:ring-ds-error"
          />
          {error && <p className="text-sm text-ds-error">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmar}
              disabled={pending || texto.trim().toUpperCase() !== PALABRA}
              className="flex-1 rounded-lg bg-ds-error py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {pending ? 'Eliminando…' : 'Eliminar definitivamente'}
            </button>
            <button
              type="button"
              onClick={() => { setAbierto(false); setTexto(''); setError(null) }}
              disabled={pending}
              className="rounded-lg border border-outline-variant px-4 py-2.5 text-sm text-on-surface-variant transition hover:bg-surface-low disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
