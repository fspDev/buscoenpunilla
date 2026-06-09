interface Filtro {
  name: string
  label: string
  type: 'select' | 'text'
  options?: { value: string; label: string }[]
  placeholder?: string
}

interface Props {
  filtros: Filtro[]
  valores: Record<string, string>
  action: string
}

// Formulario GET que actualiza la URL con los filtros activos
export function FiltrosTabla({ filtros, valores, action }: Props) {
  return (
    <form action={action} method="get" className="flex flex-wrap gap-2 items-end">
      {filtros.map((f) => (
        <div key={f.name}>
          <label className="block text-xs text-on-surface-variant mb-1">{f.label}</label>
          {f.type === 'select' ? (
            <select
              name={f.name}
              defaultValue={valores[f.name] ?? ''}
              className="rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-sm text-on-surface outline-none focus:border-primary-container"
            >
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              name={f.name}
              type="text"
              defaultValue={valores[f.name] ?? ''}
              placeholder={f.placeholder}
              className="rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-sm text-on-surface outline-none focus:border-primary-container w-44"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="rounded-lg bg-primary-container px-4 py-1.5 text-sm font-medium text-white transition hover:opacity-90"
      >
        Filtrar
      </button>
      <a
        href={action}
        className="rounded-lg border border-outline-variant px-4 py-1.5 text-sm text-on-surface-variant transition hover:bg-surface-low"
      >
        Limpiar
      </a>
    </form>
  )
}
