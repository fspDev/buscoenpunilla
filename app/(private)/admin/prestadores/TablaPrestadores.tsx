'use client'

import { useState, useTransition } from 'react'
import { toggleMasivoPrestadores } from '@/app/actions/admin'
import { AccionesPrestador } from './AccionesPrestador'

interface Prestador {
  id: string; nombre: string; oficio: string | null; zonas_trabajo: string[] | null
  activo: boolean; suspendido: boolean; verificado: boolean
  rating_promedio: number; total_resenas: number
  created_at: string; ultimo_contacto: string | null
  fecha_fin_gratuito: string | null
}

interface Props { prestadores: Prestador[] }

function BadgeSuscripcion({ fechaFin }: { fechaFin: string | null }) {
  if (!fechaFin) return <span className="text-xs text-outline">—</span>
  const vencida = new Date(fechaFin) < new Date()
  if (vencida) {
    return (
      <span className="rounded-full bg-ds-error-container px-2 py-0.5 text-xs text-ds-error">
        Vencida
      </span>
    )
  }
  const dias = Math.ceil((new Date(fechaFin).getTime() - Date.now()) / 86_400_000)
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
      Prueba · {dias}d
    </span>
  )
}

export function TablaPrestadores({ prestadores }: Props) {
  const [seleccion, setSeleccion] = useState<string[]>([])
  const [isPending, start]        = useTransition()

  function toggleAll(checked: boolean) {
    setSeleccion(checked ? prestadores.map((p) => p.id) : [])
  }
  function toggleOne(id: string, checked: boolean) {
    setSeleccion((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id))
  }

  function accionMasiva(estado: boolean) {
    start(() => toggleMasivoPrestadores(seleccion, estado))
    setSeleccion([])
  }

  const vencidos = prestadores.filter(
    (p) => p.fecha_fin_gratuito && new Date(p.fecha_fin_gratuito) < new Date()
  ).length

  return (
    <div className="space-y-3">
      {vencidos > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-ds-error-container bg-ds-error-container/20 px-4 py-2 text-sm text-ds-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span><strong>{vencidos}</strong> prestador{vencidos !== 1 ? 'es' : ''} con período de prueba vencido sin suscripción activa</span>
        </div>
      )}

      {seleccion.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-surface-low px-4 py-2 text-sm">
          <span className="text-on-surface-variant">{seleccion.length} seleccionados</span>
          <button onClick={() => accionMasiva(true)}  disabled={isPending}
            className="rounded-lg bg-secondary px-3 py-1 text-xs font-medium text-white">
            Activar
          </button>
          <button onClick={() => accionMasiva(false)} disabled={isPending}
            className="rounded-lg bg-outline-variant px-3 py-1 text-xs font-medium text-on-surface">
            Pausar
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-low text-xs text-on-surface-variant">
              <th className="px-3 py-2">
                <input type="checkbox" onChange={(e) => toggleAll(e.target.checked)}
                  checked={seleccion.length === prestadores.length && prestadores.length > 0} />
              </th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Oficio</th>
              <th className="px-3 py-2 text-left">Zona</th>
              <th className="px-3 py-2 text-right">Rating</th>
              <th className="px-3 py-2 text-center">Estado</th>
              <th className="px-3 py-2 text-center">Suscripción</th>
              <th className="px-3 py-2 text-left">Registro</th>
              <th className="px-3 py-2 text-left">Últ. contacto</th>
              <th className="px-3 py-2 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {prestadores.map((p) => (
              <tr key={p.id} className="hover:bg-surface-low transition">
                <td className="px-3 py-2.5 text-center">
                  <input type="checkbox" checked={seleccion.includes(p.id)}
                    onChange={(e) => toggleOne(p.id, e.target.checked)} />
                </td>
                <td className="px-3 py-2.5 font-medium text-on-surface">
                  {p.nombre}
                  {p.verificado && <span className="ml-1 text-xs text-primary-container">✓</span>}
                </td>
                <td className="px-3 py-2.5 text-on-surface-variant">{p.oficio ?? '—'}</td>
                <td className="px-3 py-2.5 text-on-surface-variant">
                  {p.zonas_trabajo?.[0] ?? '—'}
                </td>
                <td className="px-3 py-2.5 text-right text-on-surface-variant">
                  {Number(p.rating_promedio).toFixed(1)} ({p.total_resenas})
                </td>
                <td className="px-3 py-2.5 text-center">
                  {p.suspendido ? (
                    <span className="rounded-full bg-ds-error-container px-2 py-0.5 text-xs text-ds-error">Susp.</span>
                  ) : p.activo ? (
                    <span className="rounded-full bg-secondary-container px-2 py-0.5 text-xs text-secondary-on">Activo</span>
                  ) : (
                    <span className="rounded-full bg-surface-highest px-2 py-0.5 text-xs text-outline">Pausado</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <BadgeSuscripcion fechaFin={p.fecha_fin_gratuito} />
                </td>
                <td className="px-3 py-2.5 text-xs text-outline">
                  {new Date(p.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-3 py-2.5 text-xs text-outline">
                  {p.ultimo_contacto ? new Date(p.ultimo_contacto).toLocaleDateString('es-AR') : '—'}
                </td>
                <td className="px-3 py-2.5">
                  <AccionesPrestador id={p.id} nombre={p.nombre} activo={p.activo} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
