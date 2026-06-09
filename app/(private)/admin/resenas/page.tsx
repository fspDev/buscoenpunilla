import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { FiltrosTabla } from '@/components/admin/FiltrosTabla'
import { EliminarResenaBtn } from '@/components/admin/EliminarResenaBtn'

const POR_PAGINA = 20

interface PageProps {
  searchParams: { estrellas?: string; reportadas?: string; q?: string; page?: string }
}

export default async function AdminResenasPage({ searchParams }: PageProps) {
  await requireRole('admin')
  const supabase = createClient()
  const page = Number(searchParams.page ?? 1)
  const from = (page - 1) * POR_PAGINA

  // Cargar reseñas con datos de prestador y cliente
  const { data: resenasRaw, count } = await supabase
    .from('resenas')
    .select('id, prestador_id, cliente_id, estrellas, comentario, respuesta_prestador, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + POR_PAGINA - 1)

  // IDs de prestadores y clientes para nombres
  const pIds = Array.from(new Set((resenasRaw ?? []).map((r) => r.prestador_id)))
  const cIds = Array.from(new Set((resenasRaw ?? []).map((r) => r.cliente_id)))
  const [{ data: prests }, { data: clientes }, { data: reportadas }] = await Promise.all([
    pIds.length ? supabase.from('profiles').select('id, nombre').in('id', pIds) : { data: [] },
    cIds.length ? supabase.from('profiles').select('id, nombre').in('id', cIds) : { data: [] },
    supabase.from('reportes_resenas').select('resena_id').eq('resuelto', false),
  ])

  const pMap = Object.fromEntries((prests ?? []).map((p) => [p.id, p.nombre]))
  const cMap = Object.fromEntries((clientes ?? []).map((c) => [c.id, c.nombre]))
  const repSet = new Set((reportadas ?? []).map((r) => r.resena_id))

  const resenas = (resenasRaw ?? []).map((r) => ({
    ...r,
    prestador_nombre: pMap[r.prestador_id] ?? '—',
    cliente_nombre:   cMap[r.cliente_id]   ?? '—',
    reportada: repSet.has(r.id),
  }))

  const totalPaginas = Math.ceil((count ?? 0) / POR_PAGINA)

  return (
    <div className="px-6 py-8 space-y-5">
      <h1 className="text-2xl font-bold text-on-surface">Reseñas</h1>

      <FiltrosTabla
        action="/admin/resenas"
        valores={searchParams}
        filtros={[
          { name: 'estrellas', label: 'Estrellas', type: 'select', options: [
            { value: '', label: 'Todas' },
            ...['5','4','3','2','1'].map((n) => ({ value: n, label: `${n} ★` })),
          ]},
          { name: 'reportadas', label: 'Reportadas', type: 'select', options: [
            { value: '', label: 'Todas' },
            { value: '1', label: 'Solo reportadas' },
          ]},
        ]}
      />

      <p className="text-sm text-on-surface-variant">{count ?? 0} reseñas</p>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-low text-xs text-on-surface-variant">
              <th className="px-4 py-2 text-left">Prestador</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-center">★</th>
              <th className="px-4 py-2 text-left">Comentario</th>
              <th className="px-4 py-2 text-center">Resp.</th>
              <th className="px-4 py-2 text-center">Rep.</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {resenas.map((r) => (
              <tr key={r.id} className={`hover:bg-surface-low transition ${r.reportada ? 'bg-ds-error-container/20' : ''}`}>
                <td className="px-4 py-2.5 font-medium text-on-surface">{r.prestador_nombre}</td>
                <td className="px-4 py-2.5 text-on-surface-variant">{r.cliente_nombre}</td>
                <td className="px-4 py-2.5 text-center text-yellow-500">{r.estrellas}★</td>
                <td className="px-4 py-2.5 text-on-surface-variant max-w-xs">
                  <span title={r.comentario ?? ''}>
                    {r.comentario ? (r.comentario.length > 80 ? r.comentario.slice(0, 80) + '…' : r.comentario) : '—'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center text-xs">
                  {r.respuesta_prestador ? '✓' : '—'}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {r.reportada && <span className="text-ds-error text-xs font-bold">!</span>}
                </td>
                <td className="px-4 py-2.5 text-xs text-outline">
                  {new Date(r.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-3">
                    <a href={`/prestador/${r.prestador_id}`} target="_blank"
                      className="text-xs text-primary-container hover:underline">Ver ↗</a>
                    <EliminarResenaBtn resenaId={r.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex gap-2 text-sm">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <a key={p} href={`/admin/resenas?page=${p}`}
              className={`rounded-lg px-3 py-1.5 ${p === page ? 'bg-primary-container text-white' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-low'}`}>
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
