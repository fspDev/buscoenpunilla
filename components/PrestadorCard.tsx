import Link from 'next/link'
import Image from 'next/image'
import { RatingStars } from './RatingStars'
import type { Prestador } from '@/types'

type Props = Pick<Prestador, 'id' | 'nombre' | 'oficio' | 'oficios' | 'zonas_trabajo' | 'foto_url' | 'rating_promedio' | 'total_resenas'>

export function PrestadorCard({ id, nombre, oficio, oficios, zonas_trabajo, foto_url, rating_promedio, total_resenas }: Props) {
  const zona = zonas_trabajo?.[0] ?? 'Valle de Punilla'
  const rating = Math.round(rating_promedio * 10) / 10
  const todosOficios = oficios?.length ? oficios : [oficio]
  const visibles = todosOficios.slice(0, 2)
  const extra = todosOficios.length - visibles.length

  return (
    <Link
      href={`/prestador/${id}`}
      className="group flex flex-col rounded-2xl border border-outline-variant bg-white p-4 shadow-card cursor-pointer
        transition-all duration-300 ease-out
        hover:-translate-y-2 hover:border-primary-container/50 hover:shadow-xl"
    >
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-surface-highest
          ring-2 ring-transparent transition-all duration-300 group-hover:ring-primary-container/30">
          {foto_url ? (
            <Image
              src={foto_url}
              alt={nombre}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="56px"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xl font-semibold text-outline">
              {nombre.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-on-surface transition-colors duration-200 group-hover:text-primary-container">
            {nombre}
          </h3>
          <div className="mt-0.5 flex flex-wrap gap-1">
            {visibles.map((o) => (
              <span key={o} className="inline-block rounded-full bg-surface-low px-2 py-0.5 text-xs font-medium text-primary-container
                transition-colors duration-200 group-hover:bg-primary-container/10">
                {o}
              </span>
            ))}
            {extra > 0 && (
              <span className="inline-block rounded-full bg-surface-base px-2 py-0.5 text-xs font-medium text-on-surface-variant">
                +{extra}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">{zona}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        {total_resenas > 0 ? (
          <>
            <RatingStars rating={rating} size="sm" />
            <span className="text-xs text-on-surface-variant">
              {rating.toFixed(1)} ({total_resenas} reseña{total_resenas !== 1 ? 's' : ''})
            </span>
          </>
        ) : (
          <span className="text-xs text-outline italic">Nuevo en BUSCO</span>
        )}
      </div>

      <div className="mt-4 block w-full rounded-lg border border-primary-container/30 py-2 text-center text-sm font-semibold
        text-primary-container
        transition-all duration-200
        group-hover:bg-primary-container group-hover:text-white group-hover:border-primary-container group-hover:shadow-md">
        Ver perfil →
      </div>
    </Link>
  )
}
