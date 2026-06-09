'use client'

import { useState } from 'react'

const LABELS: Record<number, string> = {
  1: 'Muy mala experiencia',
  2: 'Mala experiencia',
  3: 'Experiencia regular',
  4: 'Buena experiencia',
  5: 'Excelente experiencia',
}

interface Props {
  value: number
  onChange: (v: number) => void
}

export function StarSelector({ value, onChange }: Props) {
  const [hover, setHover] = useState(0)
  const active = hover || value

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} estrella${n !== 1 ? 's' : ''}`}
            className="text-4xl leading-none transition-transform hover:scale-110 focus:outline-none"
          >
            <span className={n <= active ? 'text-yellow-400' : 'text-outline-variant'}>★</span>
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-sm font-medium text-on-surface-variant">{LABELS[active]}</p>
      )}
    </div>
  )
}
