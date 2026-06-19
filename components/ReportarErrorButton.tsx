'use client'

// ⚠️ TEMPORAL (beta): botón flotante para reportar errores en cualquier página.
// QUITAR antes del lanzamiento: borrar este archivo, su <ReportarErrorButton/>
// en app/layout.tsx y app/actions/reportar-error.ts
import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { usePathname } from 'next/navigation'
import { reportarErrorAction } from '@/app/actions/reportar-error'

function EnviarBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-primary-container px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? 'Enviando…' : 'Enviar reporte'}
    </button>
  )
}

export function ReportarErrorButton() {
  const [abierto, setAbierto] = useState(false)
  const [state, action] = useFormState(reportarErrorAction, null)
  const pathname = usePathname()

  // Cerrar automáticamente tras un envío exitoso
  useEffect(() => {
    if (state?.ok) {
      const t = setTimeout(() => setAbierto(false), 1800)
      return () => clearTimeout(t)
    }
  }, [state?.ok])

  return (
    <>
      {/* Botón flotante */}
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Reportar un error"
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-ds-error px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"
      >
        <span aria-hidden>🐞</span> Reportar error
      </button>

      {/* Modal */}
      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setAbierto(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-start justify-between">
              <h2 className="text-lg font-bold text-on-surface">Reportar un error</h2>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
                className="text-2xl leading-none text-outline hover:text-on-surface"
              >
                ×
              </button>
            </div>

            {state?.ok ? (
              <p className="rounded-lg bg-secondary-container px-3 py-3 text-sm text-on-secondary-container">
                ¡Gracias! Recibimos tu reporte. ✅
              </p>
            ) : (
              <form action={action} className="space-y-3">
                <p className="text-sm text-on-surface-variant">
                  Contanos qué no funcionó. Se envía junto con la página donde estás.
                </p>
                <input type="hidden" name="ruta" value={pathname} />
                <textarea
                  name="detalle"
                  required
                  rows={4}
                  autoFocus
                  placeholder="Ej: al apretar “Crear cuenta” me da un error…"
                  className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                />
                {state?.error && (
                  <p className="rounded-lg bg-ds-error-container px-3 py-2 text-sm text-ds-error">
                    {state.error}
                  </p>
                )}
                <EnviarBtn />
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
