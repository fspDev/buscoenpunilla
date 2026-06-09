/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { OficiosPageClient } from './OfiiciosPageClient'

export default async function AdminOficiosPage() {
  await requireRole('admin')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  const propuestasQuery = admin.from('prestadores')
    .select('id, oficio_propuesto, created_at, profiles!inner(nombre)')
    .eq('estado_oficio', 'pendiente')
    .not('oficio_propuesto', 'is', null)
    .order('created_at', { ascending: true })

  const [{ data: propuestasData }, { data: oficiosData }, { data: countData }] = await Promise.all([
    propuestasQuery as Promise<{ data: unknown[] | null }>,

    // Lista de todos los oficios
    admin
      .from('oficios')
      .select('id, nombre, activo, es_base, created_at')
      .order('es_base', { ascending: false })
      .order('nombre') as Promise<{ data: unknown[] | null }>,

    // Conteo de prestadores por oficio
    admin
      .from('prestadores')
      .select('oficio'),
  ])

  // Calcular total de prestadores por oficio
  const conteoMap: Record<string, number> = {}
  for (const p of countData ?? []) {
    if (p.oficio) conteoMap[p.oficio] = (conteoMap[p.oficio] ?? 0) + 1
  }

  const propuestas = (propuestasData ?? []).map((p: any) => {
    const profiles = p.profiles as { nombre: string | null } | null
    return {
      prestador_id:     p.id as string,
      nombre:           profiles?.nombre ?? 'Sin nombre',
      oficio_propuesto: (p.oficio_propuesto as string) ?? '',
      created_at:       p.created_at as string,
    }
  })

  const oficios = (oficiosData ?? []).map((o: any) => ({
    id:                o.id,
    nombre:            o.nombre,
    activo:            o.activo,
    es_base:           o.es_base,
    created_at:        o.created_at,
    total_prestadores: conteoMap[o.nombre] ?? 0,
  }))

  const oficiosNombres = oficios.filter((o) => o.activo).map((o) => o.nombre)

  return (
    <OficiosPageClient
      propuestas={propuestas}
      oficios={oficios}
      oficiosNombres={oficiosNombres}
    />
  )
}
