'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { StarRating } from './StarRating'
import { publicarResenaPublicaAction } from '@/app/actions/resenas'

type Estado = 'idle' | 'enviando' | 'exito' | 'duplicado'

interface Props {
  prestador_id: string
  prestador_nombre: string
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="h-10 w-10">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function ResenaForm({ prestador_id, prestador_nombre }: Props) {
  const [estrellas, setEstrellas]   = useState(0)
  const [comentario, setComentario] = useState('')
  const [nombre, setNombre]         = useState('')
  const [email, setEmail]           = useState('')
  const [errorMsg, setErrorMsg]     = useState('')
  const [estado, setEstado]         = useState<Estado>('idle')
  const [isPending, startTransition] = useTransition()

  const mostrarSiguientes = estrellas > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!estrellas)        { setErrorMsg('Seleccioná una calificación.'); return }
    if (!nombre.trim())    { setErrorMsg('Ingresá tu nombre.'); return }
    if (!email.trim())     { setErrorMsg('Ingresá tu email.'); return }

    setErrorMsg('')
    setEstado('enviando')

    startTransition(async () => {
      const result = await publicarResenaPublicaAction({
        prestador_id,
        estrellas,
        comentario: comentario.trim() || undefined,
        cliente_nombre: nombre.trim(),
        cliente_email:  email.trim(),
      })

      if (result.error === 'duplicado') {
        setEstado('duplicado')
      } else if (result.error) {
        setErrorMsg(result.error)
        setEstado('idle')
      } else {
        setEstado('exito')
      }
    })
  }

  if (estado === 'exito') {
    return (
      <div className="flex flex-col items-center py-12 text-center px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckIcon />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-on-surface">¡Gracias por tu reseña!</h2>
        <p className="mt-2 max-w-xs text-sm text-on-surface-variant leading-relaxed">
          Tu opinión ayuda a otros vecinos a encontrar buenos prestadores.
        </p>
        <Link
          href={`/prestador/${prestador_id}`}
          className="mt-7 rounded-xl border border-outline-variant px-6 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-low"
        >
          Ver el perfil de {prestador_nombre}
        </Link>
      </div>
    )
  }

  if (estado === 'duplicado') {
    return (
      <div className="flex flex-col items-center py-12 text-center px-4">
        <div className="text-5xl">⭐</div>
        <h2 className="mt-5 text-xl font-bold text-on-surface">
          Ya dejaste una reseña para {prestador_nombre}
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          ¡Gracias! Tu opinión ya está publicada en su perfil.
        </p>
        <Link
          href={`/prestador/${prestador_id}`}
          className="mt-6 rounded-xl bg-primary-container px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Ver el perfil de {prestador_nombre}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7 px-1">

      {/* Paso 1: Estrellas */}
      <div className="flex flex-col items-center">
        <p className="mb-4 text-sm font-medium text-on-surface-variant">
          ¿Cuántas estrellas le das?
        </p>
        <StarRating value={estrellas} onChange={setEstrellas} size="lg" />
      </div>

      {/* Paso 2 + 3: Comentario y datos (aparecen al seleccionar estrellas) */}
      {mostrarSiguientes && (
        <div className="space-y-5">

          {/* Comentario */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">
              Comentario{' '}
              <span className="font-normal text-outline">(opcional)</span>
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={400}
              rows={4}
              placeholder="Contá brevemente cómo fue el trabajo..."
              className="w-full resize-none rounded-xl border border-outline-variant bg-surface-low px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
            />
            <p className="mt-1 text-right text-xs text-outline">{comentario.length}/400</p>
          </div>

          {/* Separador visual */}
          <div className="border-t border-outline-variant" />

          {/* Nombre */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">
              Tu nombre <span className="text-ds-error">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              placeholder="Juan García"
              className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-on-surface-variant">
              Tu email <span className="text-ds-error">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="juan@gmail.com"
              className="w-full rounded-xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container"
            />
            <p className="mt-1.5 text-xs text-outline">
              Solo para verificar que no se dupliquen reseñas. No se muestra públicamente.
            </p>
          </div>

          {errorMsg && (
            <p className="rounded-xl bg-ds-error-container px-4 py-3 text-sm text-ds-error">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending || estado === 'enviando'}
            className="w-full rounded-xl bg-primary-container py-4 text-base font-bold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? 'Publicando...' : 'Publicar mi reseña'}
          </button>

        </div>
      )}
    </form>
  )
}
