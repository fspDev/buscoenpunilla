import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { RatingStars } from '@/components/RatingStars'
import { ResenaForm } from '@/components/ResenaForm'
import { Footer } from '@/components/Footer'

interface PageProps {
  params: { id: string }
}

export default async function ResenaPublicaPage({ params }: PageProps) {
  const supabase = createClient()

  const { data: prestador } = await supabase
    .from('prestadores_publicos')
    .select('id, nombre, oficio, foto_url, rating_promedio, total_resenas')
    .eq('id', params.id)
    .single()

  if (!prestador) notFound()

  const nombre      = prestador.nombre as string
  const oficio      = prestador.oficio as string | null
  const fotoUrl     = prestador.foto_url as string | null
  const rating      = Math.round((prestador.rating_promedio as number) * 10) / 10
  const totalRes    = prestador.total_resenas as number

  return (
    <div className="min-h-screen bg-surface pb-16">
      <main className="mx-auto max-w-md px-4 py-10">

        {/* Perfil resumido */}
        <div className="flex flex-col items-center text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-surface-highest shadow-card">
            {fotoUrl ? (
              <Image src={fotoUrl} alt={nombre} fill className="object-cover" sizes="96px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-outline">
                {nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl font-bold text-on-surface">{nombre}</h1>

          {oficio && (
            <span className="mt-2 inline-block rounded-full bg-primary-container/10 px-3 py-1 text-sm font-medium text-primary-container">
              {oficio}
            </span>
          )}

          {totalRes > 0 ? (
            <div className="mt-3 flex items-center justify-center gap-2">
              <RatingStars rating={rating} size="md" />
              <span className="text-sm text-on-surface-variant">
                {rating.toFixed(1)} ({totalRes} reseña{totalRes !== 1 ? 's' : ''})
              </span>
            </div>
          ) : (
            <p className="mt-3 text-sm italic text-outline">Todavía no tiene reseñas</p>
          )}

          <p className="mt-4 text-base font-medium text-on-surface">
            ¿Cómo fue tu experiencia con <span className="text-primary-container">{nombre.split(' ')[0]}</span>?
          </p>
        </div>

        {/* Separador */}
        <div className="my-7 border-t border-outline-variant" />

        {/* Formulario */}
        <ResenaForm
          prestador_id={prestador.id as string}
          prestador_nombre={nombre}
        />

      </main>

      <Footer />
    </div>
  )
}
