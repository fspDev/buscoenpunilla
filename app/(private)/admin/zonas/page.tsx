/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { ZonasPageClient } from './ZonasPageClient'

export default async function AdminZonasPage() {
  await requireRole('admin')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any

  const propuestasQuery = admin.from('prestadores')
    .select('id, zona_propuesta, created_at, profiles!inner(nombre, whatsapp)')
    .eq('estado_zona', 'pendiente')
    .not('zona_propuesta', 'is', null)
    .order('created_at', { ascending: true })

  const [{ data: propuestasData }, { data: zonasData }, { data: countData }] = await Promise.all([
    propuestasQuery as Promise<{ data: unknown[] | null }>,

    // Lista de todas las zonas
    admin
      .from('zonas')
      .select('id, nombre, activo, es_base, created_at')
      .order('es_base', { ascending: false })
      .order('nombre') as Promise<{ data: unknown[] | null }>,

    // Prestadores con sus zonas (para conteo)
    admin
      .from('prestadores')
      .select('zonas_trabajo'),
  ])

  // Calcular total de prestadores por zona
  const conteoMap: Record<string, number> = {}
  for (const p of countData ?? []) {
    for (const z of (p.zonas_trabajo as string[] | null) ?? []) {
      conteoMap[z] = (conteoMap[z] ?? 0) + 1
    }
  }

  const propuestas = (propuestasData ?? []).map((p: any) => {
    const profiles = p.profiles as { nombre: string | null; whatsapp: string | null } | null
    return {
      prestador_id:   p.id as string,
      nombre:         profiles?.nombre ?? 'Sin nombre',
      whatsapp:       profiles?.whatsapp ?? null,
      zona_propuesta: (p.zona_propuesta as string) ?? '',
      created_at:     p.created_at as string,
    }
  })

  const zonas = (zonasData ?? []).map((z: any) => ({
    id:                z.id,
    nombre:            z.nombre,
    activo:            z.activo,
    es_base:           z.es_base,
    created_at:        z.created_at,
    total_prestadores: conteoMap[z.nombre] ?? 0,
  }))

  const zonasNombres = zonas.filter((z) => z.activo).map((z) => z.nombre)

  return (
    <ZonasPageClient
      propuestas={propuestas}
      zonas={zonas}
      zonasNombres={zonasNombres}
    />
  )
}
