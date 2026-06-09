'use client'

import { useEffect, useState } from 'react'

interface Props {
  mensaje: string
}

export function SuccessBanner({ mensaje }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(t)
  }, [])

  if (!visible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="mb-4 flex items-center justify-between rounded-xl bg-secondary-container px-4 py-3 text-sm font-medium text-secondary-on"
    >
      <span>{mensaje}</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-4 text-secondary-on opacity-60 hover:opacity-100 transition"
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>
  )
}
