import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'

const PERIODOS = [
  { label: '7 días',  value: '7'  },
  { label: '30 días', value: '30' },
  { label: '90 días', value: '90' },
]

interface PageProps { searchParams: { periodo?: string } }

export default async function AdminMetricasPage({ searchParams }: PageProps) {
  await requireRole('admin')
  const dias    = Number(searchParams.periodo ?? 30)
  const supabase = createClient()
  const desde   = new Date(Date.now() - dias * 86400000).toISOString()

  const [
    { count: nuevosPrest },
    { count: nuevosClientes },
    { count: totalBusquedas },
    { count: totalContactos },
    { count: totalResenas },
    { data: ratingData },
    { data: topPrestadores },
    { data: oficiosBuscados },
    { data: zonasBuscadas },
  ] = await Promise.all([
    supabase.from('prestadores').select('id', { count: 'exact', head: true }).gte('created_at', desde),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'cliente').gte('created_at', desde),
    supabase.from('impresiones_busqueda').select('id', { count: 'exact', head: true }).gte('created_at', desde),
    supabase.from('contactos_log').select('id', { count: 'exact', head: true }).gte('created_at', desde),
    supabase.from('resenas').select('id', { count: 'exact', head: true }).gte('created_at', desde),
    supabase.from('resenas').select('estrellas'),
    // Top prestadores por contactos en el período
    supabase.from('contactos_log').select('prestador_id').gte('created_at', desde),
    // Oficios más buscados
    supabase.from('impresiones_busqueda').select('oficio_buscado').gte('created_at', desde).not('oficio_buscado', 'is', null),
    // Zonas más buscadas
    supabase.from('impresiones_busqueda').select('zona_buscada').gte('created_at', desde).not('zona_buscada', 'is', null),
  ])

  const ratingGlobal = ratingData?.length
    ? (ratingData.reduce((acc, r) => acc + r.estrellas, 0) / ratingData.length).toFixed(2)
    : '—'

  // Agrupar top prestadores
  const conteoP: Record<string, number> = {}
  ;(topPrestadores ?? []).forEach((c) => { conteoP[c.prestador_id] = (conteoP[c.prestador_id] ?? 0) + 1 })
  const topPIds = Object.entries(conteoP).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id]) => id)

  const { data: topPerfiles } = topPIds.length
    ? await supabase.from('admin_prestadores').select('id, nombre, oficio, zonas_trabajo, rating_promedio').in('id', topPIds)
    : { data: [] }

  const topOrdenados = topPIds.map((id) => ({
    ...(topPerfiles ?? []).find((p) => p.id === id)!,
    contactos: conteoP[id],
  })).filter(Boolean)

  // Agrupar oficios
  const conteoOficios: Record<string, number> = {}
  ;(oficiosBuscados ?? []).forEach((r) => { if (r.oficio_buscado) conteoOficios[r.oficio_buscado] = (conteoOficios[r.oficio_buscado] ?? 0) + 1 })
  const topOficios = Object.entries(conteoOficios).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Agrupar zonas
  const conteoZonas: Record<string, number> = {}
  ;(zonasBuscadas ?? []).forEach((r) => { if (r.zona_buscada) conteoZonas[r.zona_buscada] = (conteoZonas[r.zona_buscada] ?? 0) + 1 })
  const topZonas = Object.entries(conteoZonas).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const METRICAS = [
    { label: 'Nuevos prestadores',    valor: nuevosPrest ?? 0 },
    { label: 'Nuevos clientes',       valor: nuevosClientes ?? 0 },
    { label: 'Búsquedas realizadas',  valor: totalBusquedas ?? 0 },
    { label: 'Contactos WhatsApp',    valor: totalContactos ?? 0 },
    { label: 'Reseñas publicadas',    valor: totalResenas ?? 0 },
    { label: 'Rating promedio global',valor: ratingGlobal },
  ]

  return (
    <div className="px-6 py-8 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-on-surface">Métricas</h1>
        <div className="flex gap-1 rounded-lg border border-outline-variant bg-white p-1">
          {PERIODOS.map(({ label, value }) => (
            <Link key={value} href={`/admin/metricas?periodo=${value}`}
              className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                String(dias) === value ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-low'
              }`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {METRICAS.map(({ label, valor }) => (
          <div key={label} className="rounded-xl border border-outline-variant bg-white p-4 shadow-card">
            <p className="text-xs text-on-surface-variant">{label}</p>
            <p className="mt-1 text-3xl font-bold text-on-surface">{valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top prestadores */}
        <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
          <h2 className="mb-3 font-semibold text-on-surface">Top prestadores más contactados</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-on-surface-variant border-b border-outline-variant">
                <th className="pb-2 text-left">Nombre</th>
                <th className="pb-2 text-left">Oficio</th>
                <th className="pb-2 text-right">Contactos</th>
                <th className="pb-2 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {topOrdenados.map((p) => p && (
                <tr key={p.id} className="hover:bg-surface-low">
                  <td className="py-2 font-medium text-on-surface">{p.nombre}</td>
                  <td className="py-2 text-on-surface-variant">{p.oficio}</td>
                  <td className="py-2 text-right font-semibold text-on-surface">{p.contactos}</td>
                  <td className="py-2 text-right text-on-surface-variant">{Number(p.rating_promedio).toFixed(1)}★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-6">
          {/* Oficios más buscados */}
          <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
            <h2 className="mb-3 font-semibold text-on-surface">Oficios más buscados</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-on-surface-variant border-b border-outline-variant">
                  <th className="pb-2 text-left">Oficio</th>
                  <th className="pb-2 text-right">Búsquedas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {topOficios.map(([oficio, count]) => (
                  <tr key={oficio} className="hover:bg-surface-low">
                    <td className="py-2 text-on-surface">{oficio}</td>
                    <td className="py-2 text-right font-semibold text-on-surface">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Zonas más activas */}
          <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
            <h2 className="mb-3 font-semibold text-on-surface">Zonas más activas</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-on-surface-variant border-b border-outline-variant">
                  <th className="pb-2 text-left">Zona</th>
                  <th className="pb-2 text-right">Búsquedas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {topZonas.map(([zona, count]) => (
                  <tr key={zona} className="hover:bg-surface-low">
                    <td className="py-2 text-on-surface">{zona}</td>
                    <td className="py-2 text-right font-semibold text-on-surface">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
