import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { EditarPerfilForm } from './EditarPerfilForm'
import type { FotoTrabajo } from '@/types'

const OFICIOS_FALLBACK = [
  'Electricista', 'Plomero', 'Gasista', 'Albañil', 'Carpintero',
  'Techista', 'Pintor', 'Jardinero', 'Cerrajero', 'Herrero',
  'Soldador', 'Fumigador', 'Climatización/AC', 'Mudanzas', 'Otro',
]

export default async function EditarPerfilPage() {
  const { user, profile } = await requireRole('prestador')
  const supabase = createClient()

  const [{ data: prestador }, { data: fotos }, { data: oficiosData }] = await Promise.all([
    supabase.from('prestadores').select('*').eq('id', user.id).single(),
    supabase.from('fotos_trabajos').select('id, url, created_at')
      .eq('prestador_id', user.id).order('created_at', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('oficios').select('nombre').eq('activo', true)
      .order('es_base', { ascending: false }).order('nombre'),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oficiosDisponibles = (oficiosData as any[])?.map((o) => o.nombre as string) ?? []

  return (
    <div className="px-4 py-8 sm:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Editar perfil</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Los cambios se ven reflejados en tu perfil público inmediatamente.
        </p>
      </div>

      <EditarPerfilForm
        prestador_id={user.id}
        oficiosDisponibles={oficiosDisponibles.length ? oficiosDisponibles : OFICIOS_FALLBACK}
        initialData={{
          nombre:           profile?.nombre ?? '',
          whatsapp:         profile?.whatsapp ?? '',
          oficio:           prestador?.oficio ?? '',
          oficios:          (prestador?.oficios as string[]) ?? (prestador?.oficio ? [prestador.oficio] : []),
          descripcion:      prestador?.descripcion ?? '',
          foto_url:         prestador?.foto_url ?? null,
          zonas:            (prestador?.zonas_trabajo as string[]) ?? [],
          activo:           prestador?.activo ?? true,
          matricula:        prestador?.matricula ?? '',
          oficio_propuesto: (prestador as Record<string, unknown>)?.oficio_propuesto as string | null ?? null,
          estado_oficio:    (prestador as Record<string, unknown>)?.estado_oficio as string | null ?? null,
        }}
        fotos_trabajos={(fotos ?? []) as FotoTrabajo[]}
      />
    </div>
  )
}
