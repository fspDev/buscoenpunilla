'use client'

import { useState, useTransition } from 'react'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { setLeidoMensaje, eliminarMensaje, responderUsuario } from '@/app/actions/admin-contacto'

interface Props {
  id: string
  leido: boolean
  /** id del usuario registrado que originó el mensaje (null si fue anónimo) */
  userId?: string | null
}

export function MensajeAcciones({ id, leido, userId }: Props) {
  const [pending, start] = useTransition()
  const [respondiendo, setRespondiendo] = useState(false)
  const [texto, setTexto] = useState('')
  const [resultado, setResultado] = useState<{ ok?: boolean; error?: string } | null>(null)

  function toggleLeido() {
    start(() => setLeidoMensaje(id, !leido))
  }

  function enviarRespuesta() {
    setResultado(null)
    start(async () => {
      const r = await responderUsuario(id, texto)
      setResultado(r)
      if (r.ok) {
        setTexto('')
        setRespondiendo(false)
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleLeido}
          disabled={pending}
          className="text-sm text-primary-container hover:underline disabled:opacity-60"
        >
          {leido ? 'Marcar como no leído' : 'Marcar como leído'}
        </button>

        {userId && (
          <button
            type="button"
            onClick={() => { setRespondiendo((v) => !v); setResultado(null) }}
            className="text-sm text-primary-container hover:underline"
          >
            {respondiendo ? 'Cancelar respuesta' : 'Responder al usuario'}
          </button>
        )}

        <ConfirmDialog
          label="Eliminar"
          mensaje="¿Eliminar este mensaje? Esta acción no se puede deshacer."
          onConfirm={() => eliminarMensaje(id)}
        />
      </div>

      {respondiendo && userId && (
        <div className="space-y-2 rounded-lg border border-outline-variant bg-surface-low p-3">
          <p className="text-xs text-on-surface-variant">
            Tu respuesta le llegará al usuario como una notificación dentro de BUSCO.
          </p>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={3}
            placeholder="Ej: ¡Gracias por avisar! Ya lo solucionamos."
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
          {resultado?.error && (
            <p className="text-xs text-ds-error">{resultado.error}</p>
          )}
          <button
            type="button"
            onClick={enviarRespuesta}
            disabled={pending || !texto.trim()}
            className="rounded-lg bg-primary-container px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? 'Enviando…' : 'Enviar respuesta'}
          </button>
        </div>
      )}

      {resultado?.ok && (
        <p className="text-xs text-on-secondary-container">Respuesta enviada ✅</p>
      )}
    </div>
  )
}
