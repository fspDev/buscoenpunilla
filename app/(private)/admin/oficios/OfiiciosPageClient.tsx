'use client'

import { useState, useTransition } from 'react'
import { OficioPropuestaCard } from '@/components/admin/OficioPropuestaCard'
import { toggleOficioActivo, renombrarOficio, eliminarOficio } from '@/app/actions/oficios'

interface Propuesta {
  prestador_id: string
  nombre: string
  oficio_propuesto: string
  created_at: string
}

interface OficioRow {
  id: string
  nombre: string
  activo: boolean
  es_base: boolean
  created_at: string
  total_prestadores: number
}

interface Props {
  propuestas: Propuesta[]
  oficios: OficioRow[]
  oficiosNombres: string[]
}

export function OficiosPageClient({ propuestas, oficios, oficiosNombres }: Props) {
  const [tab, setTab] = useState<'propuestas' | 'lista'>('propuestas')

  return (
    <div className="px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Oficios</h1>
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
              : 'Lista de oficios'
            }
          </button>
        ))}
      </div>

      {tab === 'propuestas' && (
        <PropuestasTab propuestas={propuestas} oficiosNombres={oficiosNombres} />
      )}
      {tab === 'lista' && (
        <ListaTab oficios={oficios} />
      )}
    </div>
  )
}

function PropuestasTab({ propuestas, oficiosNombres }: { propuestas: Propuesta[]; oficiosNombres: string[] }) {
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
        <OficioPropuestaCard
          key={p.prestador_id}
          prestador_id={p.prestador_id}
          nombre={p.nombre}
          oficio_propuesto={p.oficio_propuesto}
          created_at={p.created_at}
          oficiosExistentes={oficiosNombres}
        />
      ))}
    </div>
  )
}

function ListaTab({ oficios }: { oficios: OficioRow[] }) {
  const [editando, setEditando]     = useState<string | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
      const res = await renombrarOficio(id, nombreActual, nuevoNombre.trim())
      if (res?.error) setError(res.error)
      else setEditando(null)
    })
  }

  function handleEliminar(id: string, nombre: string, total: number) {
    if (total > 0) {
      setError(`No se puede eliminar "${nombre}": hay ${total} prestador${total > 1 ? 'es' : ''} con este oficio.`)
      return
    }
    if (!window.confirm(`¿Eliminar el oficio "${nombre}"? Esta acción no se puede deshacer.`)) return
    startTransition(async () => {
      const res = await eliminarOficio(id, nombre)
      if (res?.error) setError(res.error)
    })
  }

  return (
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
            <th className="px-4 py-3 text-left">Oficio</th>
            <th className="px-4 py-3 text-left">Tipo</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-center">Prestadores</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          {oficios.map((o) => (
            <tr key={o.id} className={`transition ${isPending ? 'opacity-60' : ''}`}>
              <td className="px-4 py-3 font-medium text-on-surface">
                {editando === o.id ? (
                  <input
                    autoFocus
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    onBlur={() => handleRenombrar(o.id, o.nombre)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenombrar(o.id, o.nombre)
                      if (e.key === 'Escape') setEditando(null)
                    }}
                    className="w-full rounded border border-primary-container px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary-container"
                  />
                ) : o.nombre}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${o.es_base ? 'bg-surface-highest text-on-surface' : 'bg-secondary/10 text-secondary'}`}>
                  {o.es_base ? 'Base' : 'Aprobado'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => startTransition(() => toggleOficioActivo(o.id, !o.activo))}
                  className={`rounded-full px-2 py-0.5 text-xs font-medium transition ${
                    o.activo
                      ? 'bg-secondary-container text-secondary-on hover:bg-secondary-container/70'
                      : 'bg-ds-error-container/30 text-ds-error hover:bg-ds-error-container/50'
                  }`}
                >
                  {o.activo ? 'Activo' : 'Inactivo'}
                </button>
              </td>
              <td className="px-4 py-3 text-center text-on-surface-variant">{o.total_prestadores}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => iniciarEdicion(o.id, o.nombre)}
                    className="text-xs text-primary-container hover:underline"
                  >
                    Renombrar
                  </button>
                  {o.total_prestadores === 0 && !o.es_base && (
                    <button
                      onClick={() => handleEliminar(o.id, o.nombre, o.total_prestadores)}
                      className="text-xs text-ds-error hover:underline"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
