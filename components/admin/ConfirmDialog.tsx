'use client'

import { useState, useTransition } from 'react'

interface Props {
  label: string
  mensaje: string
  onConfirm: () => Promise<void>
  variant?: 'danger' | 'warning'
  labelClass?: string
}

// Panel inline de confirmación (sin position: fixed)
export function ConfirmDialog({ label, mensaje, onConfirm, variant = 'danger', labelClass = '' }: Props) {
  const [open, setOpen]       = useState(false)
  const [isPending, start]    = useTransition()

  const colors = variant === 'danger'
    ? 'border-ds-error-container bg-ds-error-container'
    : 'border-yellow-100 bg-yellow-50'

  const btnColor = variant === 'danger'
    ? 'bg-ds-error text-white hover:opacity-90'
    : 'bg-yellow-600 text-white hover:opacity-90'

  function handleConfirm() {
    start(async () => {
      await onConfirm()
      setOpen(false)
    })
  }

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`text-sm transition ${labelClass || 'text-ds-error hover:underline'}`}
      >
        {label}
      </button>

      {open && (
        <div className={`mt-1 rounded-lg border p-3 text-sm ${colors} shadow-card`}>
          <p className="text-on-surface">{mensaje}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition disabled:opacity-60 ${btnColor}`}
            >
              {isPending ? 'Procesando...' : 'Confirmar'}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg border border-outline-variant px-3 py-1 text-xs text-on-surface-variant hover:bg-white transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
