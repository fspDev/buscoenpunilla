'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

interface Props {
  orden: string
}

export function ResenasOrden({ orden }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function cambiarOrden(nuevoOrden: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (nuevoOrden === 'recientes') {
      params.delete('orden')
    } else {
      params.set('orden', nuevoOrden)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const opciones = [
    { value: 'recientes', label: 'Más recientes' },
    { value: 'mejor', label: 'Mejor calificadas' },
    { value: 'peor', label: 'Peor calificadas' },
  ]

  const ordenActual = orden || 'recientes'

  return (
    <div className="flex items-center gap-1.5">
      {opciones.map((op) => (
        <button
          key={op.value}
          onClick={() => cambiarOrden(op.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            ordenActual === op.value
              ? 'bg-primary-container text-white'
              : 'border border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-primary-container'
          }`}
        >
          {op.label}
        </button>
      ))}
    </div>
  )
}
