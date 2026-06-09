import { createClient } from '@/lib/supabase/server'
import { RegistroPrestadorForm } from './RegistroPrestadorForm'

const OFICIOS_FALLBACK = [
  'Electricidad', 'Plomería', 'Gasista', 'Albañilería', 'Carpintería',
  'Techado', 'Pintura', 'Jardinería', 'Cerrajería', 'Herrería',
  'Soldadura', 'Fumigación', 'Climatización/AC', 'Mudanzas', 'Otro',
]

export default async function RegistroPrestadorPage() {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('oficios')
    .select('nombre')
    .eq('activo', true)
    .order('es_base', { ascending: false })
    .order('nombre')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oficios = (data as any[])?.map((o) => o.nombre as string) ?? []

  return <RegistroPrestadorForm oficiosDisponibles={oficios.length ? oficios : OFICIOS_FALLBACK} />
}
