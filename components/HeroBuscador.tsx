'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { OFICIOS, ZONAS } from '@/lib/constants'

interface Props {
  oficiosDisponibles?: string[]
  zonasDisponibles?: string[]
}

export function HeroBuscador({ oficiosDisponibles, zonasDisponibles }: Props = {}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const oficios = oficiosDisponibles?.length ? oficiosDisponibles : [...OFICIOS]
  const zonas   = zonasDisponibles?.length ? zonasDisponibles : [...ZONAS]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const oficio = form.get('oficio') as string
    const zona   = form.get('zona')   as string
    const params = new URLSearchParams()
    if (oficio) params.set('oficio', oficio)
    if (zona)   params.set('zona', zona)
    startTransition(() => router.push(`/buscar?${params.toString()}`))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20 p-1.5 flex flex-col sm:flex-row gap-1.5"
    >
      <select
        name="oficio"
        defaultValue=""
        className="flex-1 rounded-xl bg-white/95 px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary-container min-w-0 cursor-pointer"
      >
        <option value="">¿Qué oficio buscás?</option>
        {oficios.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>

      <select
        name="zona"
        defaultValue=""
        className="flex-1 rounded-xl bg-white/95 px-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary-container min-w-0 cursor-pointer"
      >
        <option value="">Todas las zonas</option>
        {zonas.map((z) => <option key={z} value={z}>{z}</option>)}
      </select>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 rounded-xl bg-secondary-container px-6 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        {isPending ? 'Buscando…' : 'Buscar'}
      </button>
    </form>
  )
}
