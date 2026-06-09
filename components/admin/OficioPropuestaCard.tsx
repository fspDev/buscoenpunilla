'use client'

import { useState, useTransition } from 'react'
import {
  aprobarOficioPropuesto,
  fusionarOficioPropuesto,
  rechazarOficioPropuesto,
} from '@/app/actions/oficios'

interface Props {
  prestador_id: string
  nombre: string
  oficio_propuesto: string
  created_at: string
  oficiosExistentes: string[]
}

export function OficioPropuestaCard({
  prestador_id,
  nombre,
  oficio_propuesto,
  created_at,
  oficiosExistentes,
}: Props) {
  const [modo, setModo]           = useState<'idle' | 'fusionar' | 'rechazar'>('idle')
  const [oficioFusion, setOficioFusion] = useState('')
  const [isPending, startTransition]   = useTransition()
  const [done, setDone]           = useState(false)

  function fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function handleAprobar() {
    startTransition(async () => {
      await aprobarOficioPropuesto(prestador_id, oficio_propuesto)
      setDone(true)
    })
  }

  function handleFusionar() {
    if (!oficioFusion) return
    startTransition(async () => {
      await fusionarOficioPropuesto(prestador_id, oficio_propuesto, oficioFusion)
      setDone(true)
    })
  }

  function handleRechazar() {
    startTransition(async () => {
      await rechazarOficioPropuesto(prestador_id, oficio_propuesto)
      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="rounded-xl border border-outline-variant bg-surface-low p-4 text-sm text-on-surface-variant italic">
        Acción aplicada ✓
      </div>
    )
  }

  return (
    <div className={`rounded-xl border border-outline-variant bg-white p-4 shadow-card space-y-3 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-on-surface">{nombre}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">{fecha(created_at)}</p>
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 shrink-0">
          Pendiente
        </span>
      </div>

      <div className="rounded-lg bg-surface px-3 py-2">
        <p className="text-xs text-on-surface-variant mb-0.5">Oficio propuesto</p>
        <p className="font-medium text-on-surface">{oficio_propuesto}</p>
      </div>

      {/* Acciones */}
      {modo === 'idle' && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleAprobar}
            className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
          >
            Aprobar como nuevo oficio
          </button>
          <button
            onClick={() => setModo('fusionar')}
            className="rounded-lg border border-primary-container px-3 py-2 text-xs font-semibold text-primary-container transition hover:bg-surface-low"
          >
            Fusionar con oficio existente
          </button>
          <button
            onClick={() => setModo('rechazar')}
            className="rounded-lg border border-ds-error px-3 py-2 text-xs font-semibold text-ds-error transition hover:bg-ds-error-container/20"
          >
            Rechazar
          </button>
        </div>
      )}

      {modo === 'fusionar' && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">Seleccioná el oficio destino:</p>
          <select
            value={oficioFusion}
            onChange={(e) => setOficioFusion(e.target.value)}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
          >
            <option value="">— Elegí un oficio —</option>
            {oficiosExistentes.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleFusionar}
              disabled={!oficioFusion}
              className="rounded-lg bg-primary-container px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Confirmar fusión
            </button>
            <button
              onClick={() => { setModo('idle'); setOficioFusion('') }}
              className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-medium text-on-surface-variant transition hover:bg-surface-low"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {modo === 'rechazar' && (
        <div className="space-y-2">
          <p className="text-sm text-on-surface-variant">
            El prestador recibirá una notificación para que actualice su oficio.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleRechazar}
              className="rounded-lg bg-ds-error px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Confirmar rechazo
            </button>
            <button
              onClick={() => setModo('idle')}
              className="rounded-lg border border-outline-variant px-3 py-2 text-xs font-medium text-on-surface-variant transition hover:bg-surface-low"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
