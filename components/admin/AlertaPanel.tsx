import Link from 'next/link'

interface Alerta {
  titulo: string
  descripcion: string
  link?: string
  severidad: 'error' | 'warning' | 'info'
}

interface Props {
  alertas: Alerta[]
}

const COLORS = {
  error:   'border-ds-error-container bg-ds-error-container text-ds-error',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  info:    'border-surface-base bg-surface-base text-on-surface-variant',
}

const ICONS = { error: '🔴', warning: '🟡', info: 'ℹ️' }

export function AlertaPanel({ alertas }: Props) {
  if (!alertas.length) return null

  return (
    <div className="space-y-2">
      {alertas.map((a, i) => (
        <div key={i} className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${COLORS[a.severidad]}`}>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 text-base leading-none">{ICONS[a.severidad]}</span>
            <div>
              <p className="font-medium">{a.titulo}</p>
              <p className="mt-0.5 text-xs opacity-80">{a.descripcion}</p>
            </div>
          </div>
          {a.link && (
            <Link href={a.link} className="flex-shrink-0 text-xs font-medium underline">
              Ver →
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
