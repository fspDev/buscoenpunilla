import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { Footer } from '@/components/Footer'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { RatingStars } from '@/components/RatingStars'
import { RatingBreakdown } from '@/components/RatingBreakdown'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { ResenaCard } from '@/components/ResenaCard'
import { SuccessBanner } from '@/components/SuccessBanner'
import { ResenasOrden } from '@/components/ResenasOrden'
import type { Resena } from '@/types'

interface PageProps {
  params: { id: string }
  searchParams: { resena?: string; orden?: string }
}

export default async function PerfilPrestadorPage({ params, searchParams }: PageProps) {
  const ordenResenas = searchParams.orden ?? 'recientes'
  const supabase   = createClient()
  const userData   = await getUser()
  const userId     = userData?.user.id
  const esCliente  = userData?.profile?.role === 'cliente'

  const { data: prestador } = await supabase
    .from('prestadores_publicos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!prestador) notFound()

  // Fotos y reseñas en paralelo
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const supabaseAny = supabase as any
  const [{ data: fotos }, { data: resenasRaw }] = (await Promise.all([
    supabase
      .from('fotos_trabajos')
      .select('id, url')
      .eq('prestador_id', params.id)
      .order('created_at', { ascending: false }),
    supabaseAny
      .from('resenas')
      .select('id, prestador_id, cliente_id, cliente_nombre, estrellas, comentario, respuesta_prestador, created_at')
      .eq('prestador_id', params.id)
      .order('created_at', { ascending: false }),
  ])) as [{ data: any[] | null }, { data: any[] | null }]
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clienteIds = Array.from(new Set((resenasRaw ?? []).map((r: any) => r.cliente_id).filter(Boolean)))

  // Nombres de clientes + reportes del usuario logueado en paralelo
  const [{ data: clientesProfiles }, reportesData] = await Promise.all([
    clienteIds.length
      ? supabase.from('profiles').select('id, nombre').in('id', clienteIds)
      : Promise.resolve({ data: [] as { id: string; nombre: string | null }[] }),
    userId && esCliente && (resenasRaw ?? []).length > 0
      ? supabase
          .from('reportes_resenas')
          .select('resena_id')
          .eq('reportado_por', userId)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .in('resena_id', (resenasRaw ?? []).map((r: any) => r.id))
      : Promise.resolve({ data: [] as { resena_id: string }[] }),
  ])

  const nombresMap = Object.fromEntries(
    (clientesProfiles ?? []).map((p) => [p.id, p.nombre ?? 'Cliente'])
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resenas: Resena[] = (resenasRaw ?? []).map((r: any) => ({
    ...r,
    cliente_nombre: r.cliente_nombre ?? nombresMap[r.cliente_id] ?? 'Cliente',
  }))

  let yaReseno = false
  let reportesIds: string[] = []

  if (userId && esCliente) {
    yaReseno = resenas.some((r) => r.cliente_id === userId)
    reportesIds = ((reportesData as { data: { resena_id: string }[] | null })?.data ?? []).map((r: { resena_id: string }) => r.resena_id)
  }

  const rating      = Math.round((prestador.rating_promedio as number) * 10) / 10
  const totalResenas = prestador.total_resenas as number

  const resenasSorted = [...resenas].sort((a, b) => {
    if (ordenResenas === 'mejor') return b.estrellas - a.estrellas
    if (ordenResenas === 'peor') return a.estrellas - b.estrellas
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="min-h-screen bg-surface pb-24 sm:pb-0">
      <main className="mx-auto max-w-3xl px-4 py-10">

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-on-surface-variant">
          <Link href="/" className="hover:text-on-surface hover:underline transition">Inicio</Link>
          <span aria-hidden="true">›</span>
          <Link href="/buscar" className="hover:text-on-surface hover:underline transition">Buscar</Link>
          {prestador.oficio && (
            <>
              <span aria-hidden="true">›</span>
              <Link
                href={`/buscar?oficio=${encodeURIComponent(prestador.oficio as string)}`}
                className="hover:text-on-surface hover:underline transition"
              >
                {prestador.oficio as string}
              </Link>
            </>
          )}
          <span aria-hidden="true">›</span>
          <span className="text-on-surface font-medium truncate max-w-[160px]">{prestador.nombre as string}</span>
        </nav>

        {/* Banner de éxito post-reseña */}
        {searchParams.resena === 'publicada' && (
          <SuccessBanner mensaje="¡Gracias! Tu reseña fue publicada." />
        )}

        {/* Sección superior */}
        <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-card">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-surface-highest">
              {prestador.foto_url ? (
                <Image src={prestador.foto_url} alt={prestador.nombre} fill className="object-cover" sizes="96px" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-outline">
                  {(prestador.nombre as string).charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-on-surface">{prestador.nombre}</h1>
              <div className="mt-2 flex flex-wrap gap-1.5 justify-center sm:justify-start">
                {((prestador.oficios as string[])?.length
                  ? (prestador.oficios as string[])
                  : [prestador.oficio as string]
                ).map((o) => (
                  <span key={o} className="inline-block rounded-full bg-surface-low px-3 py-1 text-sm font-medium text-primary-container">
                    {o}
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-sm text-on-surface-variant">
                {(prestador.zonas_trabajo as string[])?.join(', ')}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                {totalResenas > 0 ? (
                  <>
                    <RatingStars rating={rating} size="md" />
                    <span className="text-sm text-on-surface-variant">
                      {rating.toFixed(1)} ({totalResenas} reseña{totalResenas !== 1 ? 's' : ''})
                    </span>
                  </>
                ) : (
                  <p className="text-sm text-outline italic">
                    Nuevo en BUSCO — sé el primero en dejar una reseña
                  </p>
                )}
              </div>
            </div>
          </div>

          {prestador.descripcion && (
            <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{prestador.descripcion}</p>
          )}

          {/* Botón WhatsApp — visible en desktop dentro de la card */}
          {prestador.whatsapp && (
            <div className="mt-6 hidden sm:block">
              <WhatsAppButton
                numero={prestador.whatsapp}
                nombre_prestador={prestador.nombre}
                prestador_id={prestador.id}
              />
            </div>
          )}
        </div>

        {/* Galería — scroll horizontal en mobile, grid en desktop */}
        {fotos && fotos.length > 0 && (
          <div className="mt-5 rounded-xl border border-outline-variant bg-white p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-on-surface">Trabajos realizados</h2>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0">
              {fotos.map((foto) => (
                <div key={foto.id} className="relative aspect-square w-40 flex-shrink-0 overflow-hidden rounded-lg bg-surface-highest sm:w-auto">
                  <Image src={foto.url} alt="Foto de trabajo" fill className="object-cover" sizes="(max-width: 640px) 160px, 33vw" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reseñas */}
        <div className="mt-5 rounded-xl border border-outline-variant bg-white p-6 shadow-card">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-on-surface">Reseñas</h2>

            {/* Botón dejar reseña — disponible para todos */}
            {yaReseno ? (
              <p className="text-xs text-outline">Ya dejaste una reseña</p>
            ) : (
              <Link
                href={`/resena/${params.id}`}
                className="rounded-lg bg-primary-container px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90 whitespace-nowrap"
              >
                Dejar reseña
              </Link>
            )}
          </div>

          {totalResenas > 0 && (
            <div className="mb-6">
              <RatingBreakdown resenas={resenas} />
            </div>
          )}

          {resenas.length > 1 && (
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xs text-on-surface-variant">Ordenar:</span>
              <Suspense>
                <ResenasOrden orden={ordenResenas} />
              </Suspense>
            </div>
          )}

          {resenasSorted.length > 0 ? (
            <div className="divide-y divide-outline-variant">
              {resenasSorted.map((resena) => (
                <ResenaCard
                  key={resena.id}
                  resena={resena}
                  nombre_prestador={prestador.nombre}
                  puede_reportar={!!userId && esCliente}
                  ya_reportada={reportesIds.includes(resena.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-outline italic">
              Todavía no hay reseñas. ¡Sé el primero!
            </p>
          )}
        </div>

      </main>

      <Footer />

      {/* WhatsApp sticky — solo mobile */}
      {prestador.whatsapp && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-3 bg-white border-t border-outline-variant sm:hidden">
          <WhatsAppButton
            numero={prestador.whatsapp}
            nombre_prestador={prestador.nombre}
            prestador_id={prestador.id}
          />
        </div>
      )}
    </div>
  )
}
