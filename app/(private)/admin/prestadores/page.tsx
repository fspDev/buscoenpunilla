import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { FiltrosTabla } from '@/components/admin/FiltrosTabla'
import { TablaPrestadores } from './TablaPrestadores'
import { OFICIOS, ZONAS } from '@/lib/constants'

const POR_PAGINA = 20

// Filtros vacíos al inicio de la lista (opción "todos")
const OFICIOS_FILTRO = ['', ...OFICIOS] as string[]
const ZONAS_FILTRO   = ['', ...ZONAS]   as string[]

interface PageProps {
  searchParams: { estado?: string; oficio?: string; zona?: string; q?: string; page?: string }
}

export default async function AdminPrestadoresPage({ searchParams }: PageProps) {
  await requireRole('admin')
  const supabase = createClient()
  const page = Number(searchParams.page ?? 1)
  const from = (page - 1) * POR_PAGINA
  const to   = from + POR_PAGINA - 1

  let query = supabase
    .from('admin_prestadores')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (searchParams.estado === 'activos')  query = query.eq('activo', true).eq('suspendido', false)
  if (searchParams.estado === 'pausados') query = query.eq('activo', false)
  if (searchParams.estado === 'vencidos') query = query.lt('fecha_fin_gratuito', new Date().toISOString())
  if (searchParams.oficio) query = query.ilike('oficio', searchParams.oficio)
  if (searchParams.zona)   query = query.contains('zonas_trabajo', [searchParams.zona])
  if (searchParams.q)      query = query.ilike('nombre', `%${searchParams.q}%`)

  const { data, count } = await query
  const totalPaginas = Math.ceil((count ?? 0) / POR_PAGINA)

  return (
    <div className="px-6 py-8 space-y-5">
      <h1 className="text-2xl font-bold text-on-surface">Prestadores</h1>

      <FiltrosTabla
        action="/admin/prestadores"
        valores={searchParams}
        filtros={[
          { name: 'q',      label: 'Nombre',  type: 'text',   placeholder: 'Buscar por nombre...' },
          { name: 'estado', label: 'Estado',  type: 'select', options: [
            { value: '', label: 'Todos' },
            { value: 'activos', label: 'Activos' },
            { value: 'pausados', label: 'Pausados' },
            { value: 'vencidos', label: 'Prueba vencida' },
          ]},
          { name: 'oficio', label: 'Oficio',  type: 'select', options: OFICIOS_FILTRO.map((o) => ({ value: o, label: o || 'Todos' })) },
          { name: 'zona',   label: 'Zona',    type: 'select', options: ZONAS_FILTRO.map((z) => ({ value: z, label: z || 'Todas' })) },
        ]}
      />

      <p className="text-sm text-on-surface-variant">{count ?? 0} prestadores encontrados</p>

      <TablaPrestadores prestadores={(data ?? []) as Parameters<typeof TablaPrestadores>[0]['prestadores']} />

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center gap-2 text-sm">
          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams({ ...searchParams, page: String(p) })
            return (
              <a
                key={p}
                href={`/admin/prestadores?${params}`}
                className={`rounded-lg px-3 py-1.5 transition ${p === page ? 'bg-primary-container text-white' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-low'}`}
              >
                {p}
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
