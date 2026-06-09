'use client'

import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import { RatingStars } from '@/components/RatingStars'
import { fechaRelativa } from '@/lib/utils'
import { responderResenaAction } from '@/app/actions/resenas'

// Carga datos del servidor e hidrata en el cliente
import { createClient } from '@/lib/supabase/client'
import type { Resena } from '@/types'

const MAX_RESP = 300

function ResenaConRespuesta({ resena }: { resena: Resena & { id: string } }) {
  const [editando, setEditando]   = useState(!resena.respuesta_prestador)
  const [respuesta, setRespuesta] = useState(resena.respuesta_prestador ?? '')
  const [state, action] = useFormState(responderResenaAction, null)

  return (
    <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-medium text-on-surface text-sm">{resena.cliente_nombre}</span>
          <span className="ml-2 text-xs text-outline">{fechaRelativa(resena.created_at)}</span>
        </div>
        <RatingStars rating={resena.estrellas} size="sm" />
      </div>
      {resena.comentario && (
        <p className="text-sm text-on-surface-variant">{resena.comentario}</p>
      )}

      {/* Respuesta */}
      {resena.respuesta_prestador && !editando ? (
        <div className="rounded-lg border-l-2 border-primary-container bg-surface-low px-3 py-2">
          <p className="text-xs font-medium text-on-surface-variant">Tu respuesta</p>
          <p className="mt-1 text-sm text-on-surface">{resena.respuesta_prestador}</p>
          <button
            onClick={() => setEditando(true)}
            className="mt-2 text-xs text-primary-container hover:underline"
          >
            Editar respuesta
          </button>
        </div>
      ) : (
        <form action={action} className="space-y-2">
          <input type="hidden" name="resena_id" value={resena.id} />
          <textarea
            name="respuesta"
            rows={3}
            maxLength={MAX_RESP}
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            placeholder="Respondé públicamente a esta reseña..."
            className="w-full resize-none rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
          <p className={`text-right text-xs ${respuesta.length >= MAX_RESP ? 'text-ds-error' : 'text-outline'}`}>
            {respuesta.length}/{MAX_RESP}
          </p>
          {state?.error && <p className="text-xs text-ds-error">{state.error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-primary-container px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
            >
              Publicar respuesta
            </button>
            {resena.respuesta_prestador && (
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="rounded-lg px-4 py-1.5 text-xs text-on-surface-variant hover:bg-surface-low transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

export default function PrestadorResenasPage() {
  const [resenas, setResenas] = useState<(Resena & { id: string })[]>([])
  const [, setNombre]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('nombre').eq('id', user.id).single()
      setNombre(profile?.nombre ?? '')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: raw } = await (supabase as any)
        .from('resenas')
        .select('id, prestador_id, cliente_id, cliente_nombre, estrellas, comentario, respuesta_prestador, created_at')
        .eq('prestador_id', user.id)
        .order('created_at', { ascending: false })

      if (!raw) { setLoading(false); return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ids = Array.from(new Set((raw as any[]).map((r) => r.cliente_id).filter(Boolean)))
      const { data: clientes } = ids.length
        ? await supabase.from('profiles').select('id, nombre').in('id', ids)
        : { data: [] }

      const map = Object.fromEntries((clientes ?? []).map((c) => [c.id, c.nombre ?? 'Cliente']))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setResenas((raw as any[]).map((r) => ({ ...r, cliente_nombre: r.cliente_nombre ?? map[r.cliente_id] ?? 'Cliente' })))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-on-surface-variant">Cargando reseñas...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-on-surface">Mis reseñas</h1>
        <p className="text-sm text-on-surface-variant">
          {resenas.length} reseña{resenas.length !== 1 ? 's' : ''} recibida{resenas.length !== 1 ? 's' : ''}
        </p>

        {resenas.length === 0 ? (
          <p className="mt-8 text-center text-on-surface-variant italic">
            Todavía no recibiste reseñas.
          </p>
        ) : (
          <div className="space-y-4 mt-4">
            {resenas.map((r) => (
              <ResenaConRespuesta key={r.id} resena={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
