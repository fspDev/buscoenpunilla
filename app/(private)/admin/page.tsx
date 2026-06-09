import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { AlertaPanel } from '@/components/admin/AlertaPanel'
import { MetricaCard } from '@/components/MetricaCard'

export default async function AdminDashboardPage() {
  await requireRole('admin')
  const supabase = createClient()
  const hace24h  = new Date(Date.now() - 86400000).toISOString()
  const ahora    = new Date().toISOString()
  const manana   = new Date(Date.now() + 86400000).toISOString()

  const [
    { count: prestActivos },
    { count: prestInactivos },
    { count: totalClientes },
    { count: totalResenas },
    { count: busquedas24h },
    { count: contactos24h },
    { count: reportesPendientes },
    { data: sinFoto },
    { data: pruebaVencida },
    { data: pruebaHoy },
    { count: oficioPendiente },
  ] = await Promise.all([
    supabase.from('prestadores').select('id', { count: 'exact', head: true }).eq('activo', true).eq('suspendido', false),
    supabase.from('prestadores').select('id', { count: 'exact', head: true }).or('activo.eq.false,suspendido.eq.true'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'cliente'),
    supabase.from('resenas').select('id', { count: 'exact', head: true }),
    supabase.from('impresiones_busqueda').select('id', { count: 'exact', head: true }).gte('created_at', hace24h),
    supabase.from('contactos_log').select('id', { count: 'exact', head: true }).gte('created_at', hace24h),
    supabase.from('reportes_resenas').select('id', { count: 'exact', head: true }).eq('resuelto', false),
    supabase.from('prestadores').select('id').eq('activo', true).is('foto_url', null).limit(20),
    // Período de prueba vencido y sigue activo
    supabase.from('prestadores')
      .select('id, notas_admin')
      .not('fecha_fin_gratuito', 'is', null)
      .lt('fecha_fin_gratuito', ahora)
      .eq('activo', true)
      .eq('suspendido', false),
    // Período de prueba vence hoy (próximas 24h)
    supabase.from('prestadores')
      .select('id')
      .not('fecha_fin_gratuito', 'is', null)
      .gte('fecha_fin_gratuito', ahora)
      .lt('fecha_fin_gratuito', manana)
      .eq('activo', true),
    // Propuestas de oficio pendientes (estado_oficio es columna nueva, cast necesario)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('prestadores').select('id', { count: 'exact', head: true }) as any).eq('estado_oficio', 'pendiente') as Promise<{ count: number | null }>,
  ])

  // Actividad reciente (últimas 24h — múltiples fuentes)
  const [{ data: nuevosPrest }, { data: nuevasRes }, { data: nuevosRep }] = await Promise.all([
    supabase.from('admin_prestadores').select('id, nombre, oficio, created_at')
      .gte('created_at', hace24h).order('created_at', { ascending: false }).limit(5),
    supabase.from('resenas').select('id, estrellas, created_at').gte('created_at', hace24h)
      .order('created_at', { ascending: false }).limit(5),
    supabase.from('reportes_resenas').select('id, motivo, created_at').gte('created_at', hace24h)
      .order('created_at', { ascending: false }).limit(5),
  ])

  const actividad = [
    ...(nuevosPrest ?? []).map((p) => ({
      texto: `Nuevo prestador: ${p.nombre} — ${p.oficio}`,
      fecha: p.created_at,
    })),
    ...(nuevasRes ?? []).map((r) => ({
      texto: `Nueva reseña: ${r.estrellas} ★`,
      fecha: r.created_at,
    })),
    ...(nuevosRep ?? []).map((r) => ({
      texto: `Nuevo reporte: "${r.motivo}"`,
      fecha: r.created_at,
    })),
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).slice(0, 10)

  const cantVencidos      = pruebaVencida?.length ?? 0
  const cantHoy           = pruebaHoy?.length ?? 0
  const cantOficioPending = oficioPendiente ?? 0

  const alertas = [
    ...cantVencidos > 0 ? [{
      titulo: `${cantVencidos} prestador${cantVencidos > 1 ? 'es' : ''} con período de prueba vencido`,
      descripcion: `Siguen activos pero su prueba ya expiró. Pausar hasta que se gestione el pago ($10.200/mes).`,
      link: '/admin/prestadores?estado=activos',
      severidad: 'error' as const,
    }] : [],
    ...cantHoy > 0 ? [{
      titulo: `${cantHoy} prestador${cantHoy > 1 ? 'es' : ''} vence${cantHoy === 1 ? ' hoy' : 'n hoy'}`,
      descripcion: 'Su período de prueba gratuita termina hoy. Contactar para gestionar el pago.',
      link: '/admin/prestadores',
      severidad: 'warning' as const,
    }] : [],
    ...cantOficioPending > 0 ? [{
      titulo: `${cantOficioPending} propuesta${cantOficioPending > 1 ? 's' : ''} de oficio pendiente${cantOficioPending > 1 ? 's' : ''}`,
      descripcion: 'Prestadores que propusieron un oficio nuevo esperando aprobación.',
      link: '/admin/oficios',
      severidad: 'warning' as const,
    }] : [],
    ...(reportesPendientes ?? 0) > 0 ? [{
      titulo: `${reportesPendientes} reporte${(reportesPendientes ?? 0) > 1 ? 's' : ''} sin revisar`,
      descripcion: 'Reseñas reportadas por usuarios que requieren moderación.',
      link: '/admin/reportes',
      severidad: 'error' as const,
    }] : [],
    ...(sinFoto?.length ?? 0) > 0 ? [{
      titulo: `${sinFoto?.length} prestador${(sinFoto?.length ?? 0) > 1 ? 'es' : ''} sin foto de perfil`,
      descripcion: 'Perfiles activos sin foto — menor tasa de contacto.',
      severidad: 'warning' as const,
    }] : [],
  ]

  return (
    <div className="px-6 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>

      {alertas.length > 0 && <AlertaPanel alertas={alertas} />}

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricaCard titulo="Prestadores activos"    valor={prestActivos ?? 0} />
        <MetricaCard titulo="Prestadores pausados"   valor={prestInactivos ?? 0} />
        <MetricaCard titulo="Clientes"               valor={totalClientes ?? 0} />
        <MetricaCard titulo="Reseñas totales"        valor={totalResenas ?? 0} />
        <MetricaCard titulo="Búsquedas (24h)"        valor={busquedas24h ?? 0} />
        <MetricaCard titulo="Contactos WA (24h)"     valor={contactos24h ?? 0} />
      </div>

      {/* Actividad reciente */}
      <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
        <h2 className="mb-4 font-semibold text-on-surface">Actividad últimas 24 h</h2>
        {actividad.length > 0 ? (
          <ul className="divide-y divide-outline-variant">
            {actividad.map((a, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-on-surface">{a.texto}</span>
                <span className="text-xs text-outline">
                  {new Date(a.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-outline italic">Sin actividad en las últimas 24 horas.</p>
        )}
      </div>
    </div>
  )
}
