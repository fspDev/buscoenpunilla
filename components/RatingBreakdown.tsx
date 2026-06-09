import { RatingStars } from './RatingStars'

interface Props {
  resenas: { estrellas: number }[]
}

export function RatingBreakdown({ resenas }: Props) {
  const total = resenas.length
  if (total === 0) return null

  const promedio = resenas.reduce((acc, r) => acc + r.estrellas, 0) / total
  const redondeado = Math.round(promedio * 10) / 10

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
      {/* Número grande */}
      <div className="text-center sm:text-left">
        <p className="text-5xl font-bold text-on-surface leading-none">{redondeado.toFixed(1)}</p>
        <RatingStars rating={redondeado} size="md" />
        <p className="mt-1 text-sm text-on-surface-variant">
          basado en {total} reseña{total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Barras */}
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = resenas.filter((r) => r.estrellas === n).length
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={n} className="flex items-center gap-2 text-sm">
              <span className="w-3 text-right text-on-surface-variant">{n}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-highest">
                <div
                  className="h-full rounded-full bg-yellow-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-5 text-right text-on-surface-variant">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
