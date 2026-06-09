'use client'

import { useState } from 'react'

interface Props {
  value: number
  onChange: (value: number) => void
  size?: 'sm' | 'lg'
}

const LABELS = ['', 'Muy mala experiencia', 'Mala experiencia', 'Regular', 'Buena experiencia', '¡Excelente!']

export function StarRating({ value, onChange, size = 'lg' }: Props) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex"
        onMouseLeave={() => setHover(0)}
        role="group"
        aria-label="Calificación con estrellas"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
            className={[
              'flex items-center justify-center transition-transform duration-100 active:scale-90',
              size === 'lg'
                ? 'min-h-[52px] min-w-[52px] text-[44px] px-1'
                : 'min-h-[24px] min-w-[24px] text-lg px-0.5',
              star <= display ? 'text-yellow-400' : 'text-gray-200',
            ].join(' ')}
          >
            ★
          </button>
        ))}
      </div>

      {size === 'lg' && (
        <p
          className={[
            'mt-2 text-base font-semibold text-on-surface transition-opacity duration-200 min-h-[1.5rem]',
            display > 0 ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          {LABELS[display] ?? ''}
        </p>
      )}
    </div>
  )
}
