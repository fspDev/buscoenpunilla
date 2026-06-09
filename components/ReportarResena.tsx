'use client'

import { useState, useTransition } from 'react'
import { reportarResenaAction } from '@/app/actions/resenas'

const MOTIVOS = [
  'Contenido falso o inventado',
  'Lenguaje ofensivo o agresivo',
  'No corresponde a este prestador',
  'Otro',
]

interface Props {
  resena_id: string
  ya_reportada: boolean
}

export function ReportarResena({ resena_id, ya_reportada }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [enviado, setEnviado] = useState(ya_reportada)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (enviado) {
    return <span className="text-xs text-outline">Reseña reportada</span>
  }

  function handleEnviar() {
    if (!motivo) return
    setError(null)
    startTransition(async () => {
      const result = await reportarResenaAction(resena_id, motivo)
      if (result?.error) {
        setError(result.error)
      } else {
        setEnviado(true)
        setAbierto(false)
      }
    })
  }

  return (
    <div className="mt-2">
      {!abierto ? (
        <button
          onClick={() => setAbierto(true)}
          className="text-xs text-outline hover:text-on-surface-variant transition-colors"
        >
          Reportar
        </button>
      ) : (
        <div className="mt-2 rounded-lg border border-outline-variant bg-surface-low p-3 space-y-2">
          <p className="text-xs font-medium text-on-surface-variant">¿Por qué reportás esta reseña?</p>
          <div className="space-y-1">
            {MOTIVOS.map((m) => (
              <label key={m} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={`motivo-${resena_id}`}
                  value={m}
                  checked={motivo === m}
                  onChange={() => setMotivo(m)}
                  className="accent-primary-container"
                />
                <span className="text-xs text-on-surface">{m}</span>
              </label>
            ))}
          </div>
          {error && (
            <p className="text-xs text-ds-error">{error}</p>
          )}
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleEnviar}
              disabled={!motivo || isPending}
              className="rounded-lg bg-primary-container px-3 py-1 text-xs font-medium text-white disabled:opacity-50 transition"
            >
              {isPending ? 'Enviando...' : 'Enviar reporte'}
            </button>
            <button
              onClick={() => { setAbierto(false); setMotivo(''); setError(null) }}
              className="rounded-lg px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-base transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
