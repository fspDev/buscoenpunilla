'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { resolverReporteAdmin } from '@/app/actions/admin'

interface ReporteRow {
  reporte_id: string; motivo: string; reporte_fecha: string; reportado_por: string
  resena_id: string; resuelto: boolean; estrellas?: number; comentario?: string | null
  respuesta?: string | null; prestador_nombre: string; cliente_nombre: string
  prestador_id?: string; reseña_fecha?: string; cliente_id?: string
}

interface Props {
  data: ReporteRow[]
  tab: string
}

export function ReportesPanel({ data, tab }: Props) {
  const router = useRouter()

  function goTab(t: string) { router.push(`/admin/reportes?tab=${t}`) }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-outline-variant bg-white p-1 w-fit">
        {['pendientes', 'resueltos'].map((t) => (
          <button key={t} onClick={() => goTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition capitalize ${
              tab === t ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-low'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {data.length === 0 && (
        <p className="text-sm italic text-outline">
          {tab === 'pendientes' ? 'No hay reportes pendientes. ✓' : 'No hay reportes resueltos.'}
        </p>
      )}

      <div className="space-y-4">
        {data.map((r) => (
          <div key={r.reporte_id} className="rounded-xl border border-outline-variant bg-white p-5 shadow-card space-y-3">
            {/* Reseña */}
            <div className="rounded-lg bg-surface-low p-3 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-on-surface">
                  {r.prestador_nombre} — calificado por {r.cliente_nombre}
                </p>
                <span className="text-yellow-500 text-sm">{r.estrellas}★</span>
              </div>
              {r.comentario && <p className="text-sm text-on-surface-variant">{r.comentario}</p>}
              {r.respuesta && (
                <p className="text-xs text-outline italic">Respuesta: {r.respuesta}</p>
              )}
            </div>

            {/* Reporte */}
            <div className="text-xs text-on-surface-variant space-y-0.5">
              <p><strong>Motivo:</strong> {r.motivo}</p>
              <p><strong>Reportado por:</strong> {r.reportado_por}</p>
              <p><strong>Fecha:</strong> {new Date(r.reporte_fecha).toLocaleDateString('es-AR')}</p>
            </div>

            {/* Acciones */}
            {!r.resuelto && (
              <div className="flex flex-wrap gap-3 pt-1">
                <ConfirmDialog
                  label="Eliminar reseña"
                  mensaje="¿Eliminar esta reseña? El rating del prestador se recalculará."
                  onConfirm={() => resolverReporteAdmin(r.reporte_id, 'eliminar_resena', r.resena_id)}
                />
                <ConfirmDialog
                  label="Ignorar reporte"
                  mensaje="¿Ignorar este reporte? La reseña permanecerá visible."
                  onConfirm={() => resolverReporteAdmin(r.reporte_id, 'ignorar')}
                  variant="warning"
                  labelClass="text-on-surface-variant hover:underline text-sm"
                />
                {r.prestador_id && (
                  <Link href={`/prestador/${r.prestador_id}`} target="_blank"
                    className="text-sm text-primary-container hover:underline">
                    Ver perfil ↗
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
