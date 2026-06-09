import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BuscadorHeader } from '@/components/BuscadorHeader'
import { PrestadorCard } from '@/components/PrestadorCard'
import { PrestadorCardSkeletonGrid } from '@/components/PrestadorCardSkeleton'
import { AnimateIn } from '@/components/AnimateIn'
import type { Prestador } from '@/types'

const OFICIOS_FALLBACK = [
  'Electricista', 'Plomero', 'Gasista', 'Albañil', 'Carpintero',
  'Techista', 'Pintor', 'Jardinero', 'Cerrajero', 'Herrero',
  'Soldador', 'Fumigador', 'Climatización/AC', 'Mudanzas', 'Otro',
]

interface PageProps {
  searchParams: { oficio?: string; zona?: string }
}

async function getOficios(): Promise<string[]> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('oficios')
    .select('nombre')
    .eq('activo', true)
    .order('es_base', { ascending: false })
    .order('nombre')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[])?.map((o) => o.nombre as string) ?? []
}

async function getPrestadores(oficio?: string, zona?: string): Promise<Prestador[]> {
  const supabase = createClient()

  let query = supabase
    .from('prestadores_publicos')
    .select('*')
    .order('total_resenas', { ascending: false })

  if (oficio) {
    // Buscar por oficio principal, array de oficios, o fusionado a ese oficio
    query = query.or(`oficio.ilike.${oficio},oficios.cs.{${oficio}}`)
  }

  const { data, error } = await query
  if (error || !data) return []

  return zona
    ? (data as unknown as Prestador[]).filter((p) => p.zonas_trabajo?.includes(zona))
    : (data as unknown as Prestador[])
}

async function registrarImpresiones(prestadores: Prestador[], oficio?: string, zona?: string) {
  if (!prestadores.length) return
  const supabase = createClient()
  await supabase.from('impresiones_busqueda').insert(
    prestadores.map((p) => ({
      prestador_id:   p.id,
      oficio_buscado: oficio ?? null,
      zona_buscada:   zona ?? null,
    }))
  )
}

async function ResultadosBusqueda({ oficio, zona }: { oficio?: string; zona?: string }) {
  const prestadores = await getPrestadores(oficio, zona)
  registrarImpresiones(prestadores, oficio, zona)

  const tituloFiltro = oficio
    ? zona ? `${oficio}s en ${zona}` : `${oficio}s en Valle de Punilla`
    : zona ? `Prestadores en ${zona}` : 'Todos los prestadores'

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-on-surface">{tituloFiltro}</h1>
        <span className="text-sm text-on-surface-variant">
          {prestadores.length} resultado{prestadores.length !== 1 ? 's' : ''}
        </span>
      </div>

      {prestadores.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prestadores.map((p, i) => (
            <AnimateIn key={p.id} delay={Math.min(i * 65, 390)}>
              <PrestadorCard
                id={p.id}
                nombre={p.nombre}
                oficio={p.oficio}
                oficios={p.oficios}
                zonas_trabajo={p.zonas_trabajo}
                foto_url={p.foto_url}
                rating_promedio={p.rating_promedio}
                total_resenas={p.total_resenas}
              />
            </AnimateIn>
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="text-5xl" aria-hidden="true">🔍</p>
          <p className="mt-4 text-lg font-medium text-on-surface">
            No encontramos prestadores{oficio ? ` de ${oficio}` : ''}{zona ? ` en ${zona}` : ' en esta zona'} todavía.
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Podés ampliar la búsqueda cambiando el oficio o la zona.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/buscar"
              className="rounded-lg border border-outline-variant px-5 py-2.5 text-sm font-medium text-on-surface transition hover:bg-surface-low"
            >
              Ver todos los prestadores
            </Link>
            <Link
              href="/auth/registro/prestador"
              className="rounded-lg bg-primary-container px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              ¿Sos prestador? Registrate gratis
            </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default async function BuscarPage({ searchParams }: PageProps) {
  const { oficio, zona } = searchParams
  const oficios = await getOficios()

  return (
    <div className="min-h-screen bg-surface">
      <Suspense fallback={<div className="h-[72px] border-b bg-white" />}>
        <BuscadorHeader
          oficio_default={oficio}
          zona_default={zona}
          oficiosDisponibles={oficios.length ? oficios : OFICIOS_FALLBACK}
        />
      </Suspense>

      <main className="mx-auto max-w-container px-4 py-8 sm:px-8">
        <Suspense fallback={<PrestadorCardSkeletonGrid count={6} />}>
          <ResultadosBusqueda oficio={oficio} zona={zona} />
        </Suspense>
      </main>
    </div>
  )
}
