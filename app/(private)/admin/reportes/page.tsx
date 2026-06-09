import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { ReportesPanel } from './ReportesPanel'

export default async function AdminReportesPage({
  searchParams,
}: { searchParams: { tab?: string } }) {
  await requireRole('admin')
  const supabase  = createClient()
  const pendiente = searchParams.tab !== 'resueltos'

  const { data: reportes } = await supabase
    .from('reportes_resenas')
    .select('id, resena_id, reportado_por, motivo, created_at, resuelto, resuelto_at')
    .eq('resuelto', !pendiente)
    .order('created_at', { ascending: false })

  // Cargar reseñas y perfiles relacionados
  const resenaIds   = Array.from(new Set((reportes ?? []).map((r) => r.resena_id)))
  const reportorIds = Array.from(new Set((reportes ?? []).map((r) => r.reportado_por)))

  const [{ data: resenas }, { data: reportores }] = await Promise.all([
    resenaIds.length
      ? supabase.from('resenas').select('id, prestador_id, cliente_id, estrellas, comentario, respuesta_prestador, created_at').in('id', resenaIds)
      : { data: [] },
    reportorIds.length
      ? supabase.from('profiles').select('id, nombre').in('id', reportorIds)
      : { data: [] },
  ])

  // Nombres de prestadores y clientes
  const personaIds = Array.from(new Set([
    ...(resenas ?? []).map((r) => r.prestador_id),
    ...(resenas ?? []).map((r) => r.cliente_id),
  ]))
  const { data: personas } = personaIds.length
    ? await supabase.from('profiles').select('id, nombre').in('id', personaIds)
    : { data: [] }

  const pMap = Object.fromEntries((personas ?? []).map((p) => [p.id, p.nombre]))
  const rMap = Object.fromEntries((reportores ?? []).map((r) => [r.id, r.nombre]))
  const resMap = Object.fromEntries((resenas ?? []).map((r) => [r.id, r]))

  const data = (reportes ?? []).map((rep) => {
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

  return (
    <div className="px-6 py-8 space-y-5">
      <h1 className="text-2xl font-bold text-on-surface">Reportes</h1>
      <ReportesPanel data={data} tab={searchParams.tab ?? 'pendientes'} />
    </div>
  )
}
