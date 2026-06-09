import { RatingStars } from './RatingStars'
import { ReportarResena } from './ReportarResena'
import { fechaRelativa } from '@/lib/utils'
import type { Resena } from '@/types'

interface Props {
  resena: Resena
  nombre_prestador: string
  puede_reportar: boolean
  ya_reportada?: boolean
  compact?: boolean
}

export function ResenaCard({ resena, nombre_prestador, puede_reportar, ya_reportada = false, compact = false }: Props) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-sm font-medium text-on-surface">{resena.cliente_nombre}</span>
          <span className="ml-2 text-xs text-outline">{fechaRelativa(resena.created_at)}</span>
        </div>
        <RatingStars rating={resena.estrellas} size="sm" />
      </div>

      {resena.comentario && (
        <p className={`mt-1.5 text-sm text-on-surface-variant leading-relaxed ${compact ? 'line-clamp-2' : ''}`}>
          {resena.comentario}
        </p>
      )}

      {!compact && resena.respuesta_prestador && (
        <div className="mt-2 rounded-lg border-l-2 border-primary-container bg-surface-low px-3 py-2">
          <p className="text-xs font-medium text-on-surface-variant">
            Respuesta de {nombre_prestador}
          </p>
          <p className="mt-1 text-sm text-on-surface">{resena.respuesta_prestador}</p>
        </div>
      )}

      {!compact && puede_reportar && (
        <ReportarResena resena_id={resena.id} ya_reportada={ya_reportada} />
      )}
    </div>
  )
}
