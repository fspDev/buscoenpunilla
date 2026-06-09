interface Props {
  titulo: string
  valor: number
  comparacion_anterior?: number
}

export function MetricaCard({ titulo, valor, comparacion_anterior }: Props) {
  const diff = comparacion_anterior !== undefined ? valor - comparacion_anterior : null

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
      <p className="text-sm font-medium text-on-surface-variant">{titulo}</p>
      <p className="mt-1 text-4xl font-bold text-on-surface">{valor}</p>
      {diff !== null && (
        <p className={`mt-2 text-xs font-medium ${diff >= 0 ? 'text-secondary' : 'text-ds-error'}`}>
          {diff >= 0 ? `↑ ${diff}` : `↓ ${Math.abs(diff)}`} vs mes anterior
        </p>
      )}
    </div>
  )
}
