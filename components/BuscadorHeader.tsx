'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { ZONAS } from '@/lib/constants'

interface Props {
  oficio_default?: string
  zona_default?: string
  oficiosDisponibles: string[]
}

export function BuscadorHeader({ oficio_default, zona_default, oficiosDisponibles }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const oficio = form.get('oficio') as string
    const zona = form.get('zona') as string
    const params = new URLSearchParams()
    if (oficio) params.set('oficio', oficio)
    if (zona)   params.set('zona', zona)
    startTransition(() => router.push(`/buscar?${params.toString()}`))
  }

  return (
    <div className="sticky top-[57px] z-10 border-b border-outline-variant bg-white shadow-sm">
      <div className="mx-auto max-w-container px-4 py-4 sm:px-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Oficio</label>
            <select
              name="oficio"
              defaultValue={oficio_default ?? ''}
              className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            >
              <option value="">Todos los oficios</option>
              {oficiosDisponibles.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-on-surface-variant mb-1">Zona</label>
            <select
              name="zona"
              defaultValue={zona_default ?? ''}
              className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            >
              <option value="">Todas las zonas</option>
              {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary-container px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60 sm:w-auto w-full"
          >
            {isPending ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </div>
    </div>
  )
}
