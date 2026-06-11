'use client'

import { useState, useTransition } from 'react'
import {
  aprobarZonaPropuesta,
  fusionarZonaPropuesta,
  rechazarZonaPropuesta,
} from '@/app/actions/zonas'

interface Props {
  prestador_id: string
  nombre: string
  whatsapp: string | null
  zona_propuesta: string
  created_at: string
  zonasExistentes: string[]
}

export function ZonaPropuestaCard({
  prestador_id,
  nombre,
  whatsapp,
  zona_propuesta,
  created_at,
  zonasExistentes,
}: Props) {
  const [modo, setModo]                   = useState<'idle' | 'fusionar'>('idle')
  const [zonaFusion, setZonaFusion]       = useState('')
  const [nombreEditado, setNombreEditado] = useState(zona_propuesta)
  const [isPending, startTransition]      = useTransition()
  const [done, setDone]                   = useState(false)

  function fecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function whatsappUrl() {
    if (!whatsapp) return null
    const limpio = whatsapp.replace(/\D/g, '')
    const numero = limpio.startsWith('54') ? limpio : `54${limpio}`
    return `https://wa.me/${numero}`
  }

  function handleAprobar() {
    startTransition(async () => {
      await aprobarZonaPropuesta(prestador_id, zona_propuesta, nombreEditado)
      setDone(true)
    })
  }

  function handleFusionar() {
    if (!zonaFusion) return
    startTransition(async () => {
      await fusionarZonaPropuesta(prestador_id, zona_propuesta, zonaFusion)
      setDone(true)
    })
  }

  function handleEliminar() {
    if (!window.confirm(`¿Eliminar la propuesta "${zona_propuesta}" de ${nombre}? Se notificará al prestador.`)) return
    startTransition(async () => {
      await rechazarZonaPropuesta(prestador_id, zona_propuesta)
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

  const wa = whatsappUrl()

  return (
    <div className={`rounded-xl border border-outline-variant bg-white p-4 shadow-card space-y-3 ${isPending ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Header: nombre + badge + WhatsApp */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-on-surface truncate">{nombre}</p>
          <p className="text-xs text-on-surface-variant mt-0.5">{fecha(created_at)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              title={`Contactar a ${nombre} por WhatsApp`}
              className="flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1 text-xs font-semibold text-white transition hover:opacity-90"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
            Pendiente
          </span>
        </div>
      </div>

      {/* Campo editable de la zona propuesta */}
      <div className="rounded-lg bg-surface px-3 py-2 space-y-1.5">
        <p className="text-xs text-on-surface-variant">Zona propuesta</p>
        <p className="text-xs text-outline line-through">{zona_propuesta}</p>
        <input
          value={nombreEditado}
          onChange={(e) => setNombreEditado(e.target.value.slice(0, 60))}
          placeholder="Editá el nombre antes de aprobar"
          className="w-full rounded-lg border border-outline-variant bg-white px-2.5 py-1.5 text-sm font-medium text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
        />
        {nombreEditado !== zona_propuesta && nombreEditado.trim() && (
          <p className="text-xs text-secondary">Se aprobará como: <strong>{nombreEditado.trim()}</strong></p>
        )}
      </div>

      {/* Acciones */}
      {modo === 'idle' && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => setModo('fusionar')}
            className="text-xs text-on-surface-variant hover:text-on-surface hover:underline transition"
          >
            Fusionar con existente
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleAprobar}
              disabled={!nombreEditado.trim()}
              className="text-xs font-medium text-primary-container hover:underline disabled:cursor-not-allowed disabled:opacity-40 transition"
            >
              Renombrar
            </button>
            <button
              onClick={handleEliminar}
              className="text-xs font-medium text-ds-error hover:underline transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {modo === 'fusionar' && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-on-surface">Seleccioná la zona destino:</p>
          <select
            value={zonaFusion}
            onChange={(e) => setZonaFusion(e.target.value)}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
          >
            <option value="">— Elegí una zona —</option>
            {zonasExistentes.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleFusionar}
              disabled={!zonaFusion}
              className="rounded-lg bg-primary-container px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Confirmar fusión
            </button>
            <button
              onClick={() => { setModo('idle'); setZonaFusion('') }}
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
