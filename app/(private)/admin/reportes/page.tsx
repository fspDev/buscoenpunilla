import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { ReportesPanel } from './ReportesPanel'
import { MensajeAcciones } from '@/components/admin/MensajeAcciones'

export const dynamic = 'force-dynamic'

const TIPO_ERROR = 'Error / Bug'

export default async function AdminReportesPage({
  searchParams,
}: { searchParams: { tab?: string; seccion?: string } }) {
  await requireRole('admin')
  const supabase = createClient()
  const admin = createAdminClient()
  const seccion = searchParams.seccion === 'errores' ? 'errores' : 'resenas'

  // ─── Contadores para las tabs ───────────────────────────────
  const [{ count: pendientesResenas }, { count: erroresNoLeidos }] = await Promise.all([
    admin.from('reportes_resenas').select('id', { count: 'exact', head: true }).eq('resuelto', false),
    admin.from('mensajes_contacto').select('id', { count: 'exact', head: true }).eq('tipo', TIPO_ERROR).eq('leido', false),
  ])

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <h1 className="text-2xl font-bold text-on-surface">Reportes</h1>

      {/* Tabs de sección */}
      <div className="flex gap-1 rounded-lg border border-outline-variant bg-white p-1 w-fit">
        {[
          { value: 'resenas', label: 'Reseñas', badge: pendientesResenas ?? 0 },
          { value: 'errores', label: 'Errores reportados', badge: erroresNoLeidos ?? 0 },
        ].map(({ value, label, badge }) => (
          <a
            key={value}
            href={value === 'resenas' ? '/admin/reportes' : '/admin/reportes?seccion=errores'}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition ${
              seccion === value ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-low'
            }`}
          >
            {label}
            {badge > 0 && (
              <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                seccion === value ? 'bg-white text-primary-container' : 'bg-ds-error text-white'
              }`}>
                {badge}
              </span>
            )}
          </a>
        ))}
      </div>

      {seccion === 'errores'
        ? <ErroresReportados />
        : <ReportesResenas tab={searchParams.tab ?? 'pendientes'} supabase={supabase} />}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// SECCIÓN: Errores reportados (botón "Reportar error")
// ════════════════════════════════════════════════════════════
async function ErroresReportados() {
  const admin = createAdminClient()
  const { data: errores } = await admin
    .from('mensajes_contacto')
    .select('id, nombre, email, mensaje, leido, user_id, created_at')
    .eq('tipo', TIPO_ERROR)
    .order('created_at', { ascending: false })

  if (!errores || errores.length === 0) {
    return <p className="text-sm italic text-outline">No hay errores reportados. ✓</p>
  }

  return (
    <div className="space-y-3">
      {errores.map((e) => (
        <div
          key={e.id}
          className={`rounded-xl border p-5 shadow-card ${
            e.leido ? 'border-outline-variant bg-white' : 'border-ds-error-container bg-surface-low'
          }`}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-medium text-on-surface">
                {e.user_id ? e.nombre : `${e.nombre} (anónimo)`}
              </p>
              <p className="text-sm text-on-surface-variant">{e.email}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-outline">{new Date(e.created_at).toLocaleString('es-AR')}</p>
              {!e.leido && (
                <span className="mt-1 inline-block rounded-full bg-ds-error-container px-2 py-0.5 text-[10px] font-medium text-ds-error">
                  Sin leer
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 whitespace-pre-line text-sm text-on-surface leading-relaxed">{e.mensaje}</p>

          <div className="mt-4 border-t border-outline-variant pt-3">
            <MensajeAcciones id={e.id} leido={e.leido} userId={e.user_id} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// SECCIÓN: Reseñas reportadas (comportamiento original)
// ════════════════════════════════════════════════════════════
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ReportesResenas({ tab, supabase }: { tab: string; supabase: any }) {
  const pendiente = tab !== 'resueltos'

  const { data: reportes } = await supabase
    .from('reportes_resenas')
    .select('id, resena_id, reportado_por, motivo, created_at, resuelto, resuelto_at')
    .eq('resuelto', !pendiente)
    .order('created_at', { ascending: false })

  const resenaIds   = Array.from(new Set((reportes ?? []).map((r: { resena_id: string }) => r.resena_id)))
  const reportorIds = Array.from(new Set((reportes ?? []).map((r: { reportado_por: string }) => r.reportado_por)))

  const [{ data: resenas }, { data: reportores }] = await Promise.all([
    resenaIds.length
      ? supabase.from('resenas').select('id, prestador_id, cliente_id, estrellas, comentario, respuesta_prestador, created_at').in('id', resenaIds)
      : { data: [] },
    reportorIds.length
      ? supabase.from('profiles').select('id, nombre').in('id', reportorIds)
      : { data: [] },
  ])

  const personaIds = Array.from(new Set([
    ...(resenas ?? []).map((r: { prestador_id: string }) => r.prestador_id),
    ...(resenas ?? []).map((r: { cliente_id: string }) => r.cliente_id),
  ]))
  const { data: personas } = personaIds.length
    ? await supabase.from('profiles').select('id, nombre').in('id', personaIds)
    : { data: [] }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pMap = Object.fromEntries((personas ?? []).map((p: any) => [p.id, p.nombre]))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rMap = Object.fromEntries((reportores ?? []).map((r: any) => [r.id, r.nombre]))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resMap = Object.fromEntries((resenas ?? []).map((r: any) => [r.id, r]))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (reportes ?? []).map((rep: any) => {
    const resena = resMap[rep.resena_id]
    return {
      reporte_id:        rep.id,
      motivo:            rep.motivo,
      reporte_fecha:     rep.created_at,
      reportado_por:     rMap[rep.reportado_por] ?? '—',
      resena_id:         rep.resena_id,
      resuelto:          rep.resuelto,
      estrellas:         resena?.estrellas,
      comentario:        resena?.comentario,
      respuesta:         resena?.respuesta_prestador,
      prestador_nombre:  pMap[resena?.prestador_id] ?? '—',
      cliente_nombre:    pMap[resena?.cliente_id]   ?? '—',
      prestador_id:      resena?.prestador_id,
      reseña_fecha:      resena?.created_at,
    }
  })

  return <ReportesPanel data={data} tab={tab} />
}
