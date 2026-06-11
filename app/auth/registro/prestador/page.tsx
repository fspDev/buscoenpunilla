import { createClient } from '@/lib/supabase/server'
import { RegistroPrestadorForm } from './RegistroPrestadorForm'

const OFICIOS_FALLBACK = [
  'Electricidad', 'Plomería', 'Gasista', 'Albañilería', 'Carpintería',
  'Techado', 'Pintura', 'Jardinería', 'Cerrajería', 'Herrería',
  'Soldadura', 'Fumigación', 'Climatización/AC', 'Mudanzas', 'Otro',
]

const ZONAS_FALLBACK = [
  'San Antonio de Arredondo', 'Bialet Massé', 'Mayu Sumaj',
  'Villa Parque Síquiman', 'Villa Carlos Paz', 'Cosquín', 'La Falda',
]

export default async function RegistroPrestadorPage() {
  const supabase = createClient()
  const [{ data: oficiosData }, { data: zonasData }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('oficios').select('nombre').eq('activo', true)
      .order('es_base', { ascending: false }).order('nombre'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('zonas').select('nombre').eq('activo', true)
      .order('es_base', { ascending: false }).order('nombre'),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oficios = (oficiosData as any[])?.map((o) => o.nombre as string) ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zonas = (zonasData as any[])?.map((z) => z.nombre as string) ?? []

  return (
    <RegistroPrestadorForm
      oficiosDisponibles={oficios.length ? oficios : OFICIOS_FALLBACK}
      zonasDisponibles={zonas.length ? zonas : ZONAS_FALLBACK}
    />
  )
}
