'use client'

import { useState } from 'react'

export function SuscripcionNotificar() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) setEnviado(true)
  }

  if (enviado) {
    return (
      <div className="rounded-xl border border-secondary bg-secondary-container px-4 py-4 text-center">
        <p className="text-sm font-medium text-secondary-on">¡Listo! Te avisamos cuando esté disponible.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
      <p className="text-sm font-medium text-on-surface">¿Querés que te avisemos cuando esté disponible?</p>
      <p className="mt-0.5 text-xs text-on-surface-variant">Te mandamos un email cuando abramos los pagos.</p>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          required
          className="flex-1 rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary-container px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Avisame
        </button>
      </form>
    </div>
  )
}
