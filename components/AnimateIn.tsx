'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimateIn({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'idle' | 'hidden' | 'visible'>('idle')

  useEffect(() => {
    const el = ref.current
    if (!el) return

    setState('hidden')

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setState('visible'), delay)
          obs.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  const stateClass =
    state === 'hidden'  ? 'reveal reveal-hidden' :
    state === 'visible' ? 'reveal reveal-visible' :
    ''

  return (
    <div ref={ref} className={`${stateClass} ${className}`}>
      {children}
    </div>
  )
}
