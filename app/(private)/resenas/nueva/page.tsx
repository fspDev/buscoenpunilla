'use client'

import { useFormState } from 'react-dom'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { crearResenaAction } from '@/app/actions/resenas'
import { StarSelector } from '@/components/StarSelector'
import { SubmitButton } from '@/components/SubmitButton'

const MAX_COMENTARIO = 500

export default function NuevaResenaPage() {
  const searchParams = useSearchParams()
  const prestadorId   = searchParams.get('prestador') ?? ''
  const prestadorNombre = searchParams.get('nombre') ?? 'el prestador'

  const [state, action] = useFormState(crearResenaAction, null)
  const [estrellas, setEstrellas]   = useState(0)
  const [comentario, setComentario] = useState('')

  return (
    <div className="flex min-h-screen items-start justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            ¿Cómo fue tu experiencia con {prestadorNombre}?
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Tu opinión ayuda a otros vecinos a elegir mejor.
          </p>
        </div>

        <form action={action} className="space-y-6">
          <input type="hidden" name="prestador_id" value={prestadorId} />
          <input type="hidden" name="estrellas"    value={estrellas} />

          {/* Selector de estrellas */}
          <div>
            <p className="mb-2 text-sm font-medium text-on-surface">
              Calificación <span className="text-ds-error">*</span>
            </p>
            <StarSelector value={estrellas} onChange={setEstrellas} />
          </div>

          {/* Comentario */}
          <div>
            <label htmlFor="comentario" className="block text-sm font-medium text-on-surface">
              Comentario <span className="text-on-surface-variant font-normal">(opcional)</span>
            </label>
            <textarea
              id="comentario"
              name="comentario"
              rows={4}
              maxLength={MAX_COMENTARIO}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Contá cómo fue el trabajo, puntualidad, precio, etc."
              className="mt-1 w-full resize-none rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm text-on-surface outline-none placeholder:text-outline focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            />
            <p className={`mt-1 text-right text-xs ${comentario.length >= MAX_COMENTARIO ? 'text-ds-error' : 'text-outline'}`}>
              {comentario.length}/{MAX_COMENTARIO}
            </p>
          </div>

          {state?.error && (
            <p className="rounded-lg bg-ds-error-container px-3 py-2 text-sm text-ds-error">
              {state.error}
            </p>
          )}

          <SubmitButton label="Publicar reseña" loadingLabel="Publicando..." />
        </form>

        <Link
          href={`/prestador/${prestadorId}`}
          className="block text-center text-sm text-on-surface-variant hover:text-on-surface transition"
        >
          Cancelar
        </Link>
      </div>
    </div>
  )
}
