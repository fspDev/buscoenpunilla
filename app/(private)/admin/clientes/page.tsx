import { createAdminClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { FiltrosTabla } from '@/components/admin/FiltrosTabla'
import { SuspenderClienteBtn } from '@/components/admin/SuspenderClienteBtn'

const POR_PAGINA = 20
const ZONAS = ['','San Antonio de Arredondo','Mayu Sumaj','Villa Parque Síquiman','Villa Carlos Paz','Cosquín','La Falda','Bialet Massé']

interface PageProps {
  searchParams: { zona?: string; q?: string; page?: string }
}

export default async function AdminClientesPage({ searchParams }: PageProps) {
  await requireRole('admin')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const page = Number(searchParams.page ?? 1)
  const from = (page - 1) * POR_PAGINA

  // Query profiles directly — service role bypasses RLS
  let query = supabase
    .from('profiles')
    .select('id, nombre, localidad, whatsapp, created_at', { count: 'exact' })
    .eq('role', 'cliente')
    .order('created_at', { ascending: false })
    .range(from, from + POR_PAGINA - 1)

  if (searchParams.zona) query = query.eq('localidad', searchParams.zona)
  if (searchParams.q)    query = query.ilike('nombre', `%${searchParams.q}%`)

  const { data: profiles, count } = await query
  const totalPaginas = Math.ceil((count ?? 0) / POR_PAGINA)

  // Get emails for current page via admin auth API
  const ids: string[] = (profiles ?? []).map((p: { id: string }) => p.id)
  const emailMap: Record<string, string> = {}
  if (ids.length > 0) {
    const { data: authData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
    for (const u of authData?.users ?? []) {
      if (ids.includes(u.id)) emailMap[u.id] = u.email ?? ''
    }
  }

  // Counts de reseñas y contactos
  const countMap: Record<string, { resenas: number; contactos: number }> = {}
  if (ids.length > 0) {
    const [{ data: resenas }, { data: contactos }] = await Promise.all([
      supabase.from('resenas').select('cliente_id').in('cliente_id', ids),
      supabase.from('contactos_log').select('cliente_id').in('cliente_id', ids),
    ])
    for (const id of ids) {
      countMap[id] = {
        resenas:   (resenas   ?? []).filter((r: { cliente_id: string }) => r.cliente_id === id).length,
        contactos: (contactos ?? []).filter((c: { cliente_id: string }) => c.cliente_id === id).length,
      }
    }
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <h1 className="text-2xl font-bold text-on-surface">Clientes</h1>

      <FiltrosTabla
        action="/admin/clientes"
        valores={searchParams}
        filtros={[
          { name: 'q',    label: 'Nombre',   type: 'text',   placeholder: 'Buscar...' },
          { name: 'zona', label: 'Localidad', type: 'select', options: ZONAS.map((z) => ({ value: z, label: z || 'Todas' })) },
        ]}
      />

      <p className="text-sm text-on-surface-variant">{count ?? 0} clientes</p>

      <div className="overflow-x-auto rounded-xl border border-outline-variant bg-white shadow-card">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-low text-xs text-on-surface-variant">
              <th className="px-4 py-2 text-left">Nombre</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Localidad</th>
              <th className="px-4 py-2 text-right">Reseñas</th>
              <th className="px-4 py-2 text-right">Contactos</th>
              <th className="px-4 py-2 text-left">Registro</th>
              <th className="px-4 py-2 text-left">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {(profiles ?? []).map((c: { id: string; nombre: string | null; localidad: string | null; whatsapp: string | null; created_at: string }) => (
              <tr key={c.id} className="hover:bg-surface-low transition">
                <td className="px-4 py-2.5 font-medium text-on-surface">{c.nombre ?? '—'}</td>
                <td className="px-4 py-2.5 text-on-surface-variant">{emailMap[c.id] ?? '—'}</td>
                <td className="px-4 py-2.5 text-on-surface-variant">{c.localidad ?? '—'}</td>
                <td className="px-4 py-2.5 text-right text-on-surface-variant">{countMap[c.id]?.resenas ?? 0}</td>
                <td className="px-4 py-2.5 text-right text-on-surface-variant">{countMap[c.id]?.contactos ?? 0}</td>
                <td className="px-4 py-2.5 text-xs text-outline">
                  {new Date(c.created_at).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-2.5">
                  <SuspenderClienteBtn id={c.id} nombre={c.nombre} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center gap-2 text-sm">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams({ ...searchParams, page: String(p) })
            return (
              <a key={p} href={`/admin/clientes?${params}`}
                className={`rounded-lg px-3 py-1.5 transition ${p === page ? 'bg-primary-container text-white' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-low'}`}>
                {p}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
