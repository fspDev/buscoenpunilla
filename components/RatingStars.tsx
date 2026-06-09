interface Props {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
}

// Muestra estrellas llenas, medias y vacías según el valor (0-5)
export function RatingStars({ rating, size = 'md' }: Props) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const val = rating - i
    if (val >= 1) return 'full'
    if (val >= 0.5) return 'half'
    return 'empty'
  })

  return (
    <span className={`inline-flex items-center gap-0.5 ${SIZE[size]}`} aria-label={`${rating} de 5 estrellas`}>
      {stars.map((type, i) => (
        <span key={i} className={type === 'empty' ? 'text-gray-300' : 'text-yellow-400'}>
          {type === 'full' ? '★' : type === 'half' ? '⯨' : '★'}
        </span>
      ))}
    </span>
  )
}
