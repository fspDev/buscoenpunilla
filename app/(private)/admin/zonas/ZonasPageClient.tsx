'use client'

import { useState, useTransition } from 'react'
import { ZonaPropuestaCard } from '@/components/admin/ZonaPropuestaCard'
import { toggleZonaActiva, renombrarZona, eliminarZona, crearZona } from '@/app/actions/zonas'

interface Propuesta {
  prestador_id: string
  nombre: string
  whatsapp: string | null
  zona_propuesta: string
  created_at: string
}

interface ZonaRow {
  id: string
  nombre: string
  activo: boolean
  es_base: boolean
  created_at: string
  total_prestadores: number
}

interface Props {
  propuestas: Propuesta[]
  zonas: ZonaRow[]
  zonasNombres: string[]
}

export function ZonasPageClient({ propuestas, zonas, zonasNombres }: Props) {
  const [tab, setTab] = useState<'propuestas' | 'lista'>('propuestas')

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Zonas</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-surface-low p-1 w-fit">
        {(['propuestas', 'lista'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t === 'propuestas'
              ? <>Propuestas pendientes {propuestas.length > 0 && <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{propuestas.length}</span>}</>
              : 'Lista de zonas'
            }
          </button>
        ))}
      </div>

      {tab === 'propuestas' && (
        <PropuestasTab propuestas={propuestas} zonasNombres={zonasNombres} />
      )}
      {tab === 'lista' && (
        <ListaTab zonas={zonas} />
      )}
    </div>
  )
}

function PropuestasTab({ propuestas, zonasNombres }: { propuestas: Propuesta[]; zonasNombres: string[] }) {
  if (propuestas.length === 0) {
    return (
      <div className="rounded-xl border border-outline-variant bg-white p-8 text-center">
        <p className="text-on-surface-variant">No hay propuestas pendientes.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {propuestas.map((p) => (
        <ZonaPropuestaCard
          key={p.prestador_id}
          prestador_id={p.prestador_id}
          nombre={p.nombre}
          whatsapp={p.whatsapp}
          zona_propuesta={p.zona_propuesta}
          created_at={p.created_at}
          zonasExistentes={zonasNombres}
        />
      ))}
    </div>
  )
}

function ListaTab({ zonas }: { zonas: ZonaRow[] }) {
  const [editando, setEditando]     = useState<string | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaZona, setNuevaZona]   = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCrear() {
    const nombre = nuevaZona.trim()
    if (!nombre) return
    startTransition(async () => {
      const res = await crearZona(nombre)
      if (res?.error) setError(res.error)
      else {
        setNuevaZona('')
        setError(null)
      }
    })
  }

  function iniciarEdicion(id: string, nombre: string) {
    setEditando(id)
    setNuevoNombre(nombre)
    setError(null)
  }

  function handleRenombrar(id: string, nombreActual: string) {
    if (!nuevoNombre.trim() || nuevoNombre.trim() === nombreActual) {
      setEditando(null)
      return
    }
    startTransition(async () => {
      const res = await renombrarZona(id, nombreActual, nuevoNombre.trim())
      if (res?.error) setError(res.error)
      else setEditando(null)
    })
  }

  function handleEliminar(id: string, nombre: string, total: number) {
    const aviso = total > 0
      ? `¿Eliminar la zona "${nombre}"? Hay ${total} prestador${total > 1 ? 'es' : ''} que la tiene${total > 1 ? 'n' : ''} asignada: se les quitará de su lista. Esta acción no se puede deshacer.`
      : `¿Eliminar la zona "${nombre}"? Esta acción no se puede deshacer.`
    if (!window.confirm(aviso)) return
    startTransition(async () => {
      const res = await eliminarZona(id, nombre)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-xl border border-outline-variant bg-white p-3 shadow-card">
        <input
          value={nuevaZona}
          onChange={(e) => setNuevaZona(e.target.value.slice(0, 60))}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCrear() }}
          placeholder="Nombre de la nueva zona (ej: Tanti)"
          className="flex-1 rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
        />
        <button
          onClick={handleCrear}
          disabled={!nuevaZona.trim() || isPending}
          className="rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Agregar zona
        </button>
      </div>

    <div className="rounded-xl border border-outline-variant bg-white overflow-hidden shadow-card">
      {error && (
        <div className="border-b border-ds-error/20 bg-ds-error-container/20 px-4 py-2 text-sm text-ds-error">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Cerrar</button>
        </div>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant bg-surface-low text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            <th className="px-4 py-3 text-left">Zona</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-center">Prestadores</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {zonas.map((z) => (
            <tr key={z.id} className={`transition ${isPending ? 'opacity-60' : ''}`}>
              <td className="px-4 py-3 font-medium text-on-surface">
                {editando === z.id ? (
                  <input
                    autoFocus
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    onBlur={() => handleRenombrar(z.id, z.nombre)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenombrar(z.id, z.nombre)
                      if (e.key === 'Escape') setEditando(null)
                    }}
                    className="w-full rounded border border-primary-container px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary-container"
                  />
                ) : z.nombre}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${z.es_base ? 'bg-surface-highest text-on-surface' : 'bg-secondary/10 text-secondary'}`}>
                  {z.es_base ? 'Base' : 'Aprobada'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => startTransition(() => toggleZonaActiva(z.id, !z.activo))}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                    z.activo
                      ? 'bg-secondary-container text-secondary-on hover:bg-secondary-container/70'
                      : 'bg-ds-error-container/30 text-ds-error hover:bg-ds-error-container/50'
                  }`}
                >
                  {z.activo ? 'Activa' : 'Inactiva'}
                </button>
              </td>
              <td className="px-4 py-3 text-center text-on-surface-variant">{z.total_prestadores}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => iniciarEdicion(z.id, z.nombre)}
                    className="text-xs text-primary-container hover:underline"
                  >
                    Renombrar
                  </button>
                  <button
                    onClick={() => handleEliminar(z.id, z.nombre, z.total_prestadores)}
                    className="text-xs text-ds-error hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  )
}
