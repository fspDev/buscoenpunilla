'use client'

import { useFormState } from 'react-dom'
import { useEffect, useState } from 'react'
import { createContactoAction } from '@/app/actions/contacto-form'
import { SubmitButton } from '@/components/SubmitButton'

const TIPOS = [
  'Tengo un problema con mi perfil',
  'Quiero reportar algo',
  'Tengo una sugerencia',
  'Soy prestador y necesito ayuda',
  'Otro',
]

const MAX_MENSAJE = 1000

export default function ContactoPage() {
  const [state, action] = useFormState(createContactoAction, null)
  const [chars, setChars] = useState(0)
  const [enviado, setEnviado] = useState(false)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (state?.ok) { setEnviado(true); setEmail(state.email ?? '') }
  }, [state])

  if (enviado) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface px-4">
        <div className="max-w-sm text-center space-y-4">
          <div className="text-5xl">✉️</div>
          <h2 className="text-xl font-bold text-on-surface">¡Mensaje enviado!</h2>
          <p className="text-sm text-on-surface-variant">
            Te responderemos a <strong>{email}</strong> a la brevedad.
          </p>
          <button
            onClick={() => { setEnviado(false); setChars(0) }}
            className="rounded-lg border border-outline-variant px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-low transition"
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-12">
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Contacto</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Escribinos y te respondemos a la brevedad.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Nombre <span className="text-ds-error">*</span>
              </label>
              <input name="nombre" required
                className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Email <span className="text-ds-error">*</span>
              </label>
              <input name="email" type="email" required
                className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Tipo de consulta <span className="text-ds-error">*</span>
            </label>
            <select name="tipo" required defaultValue=""
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container">
              <option value="" disabled>Seleccioná una opción</option>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Mensaje <span className="text-ds-error">*</span>
            </label>
            <textarea name="mensaje" required rows={5} maxLength={MAX_MENSAJE}
              onChange={(e) => setChars(e.target.value.length)}
              placeholder="Contanos en qué podemos ayudarte..."
              className="w-full resize-none rounded-lg border border-outline-variant px-3 py-2.5 text-base text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
            <p className={`mt-1 text-right text-xs ${chars >= MAX_MENSAJE ? 'text-ds-error' : 'text-outline'}`}>
              {chars}/{MAX_MENSAJE}
            </p>
          </div>

          {state?.error && (
            <p className="rounded-lg bg-ds-error-container px-3 py-2 text-sm text-ds-error">{state.error}</p>
          )}

          <SubmitButton label="Enviar mensaje" loadingLabel="Enviando..." />
        </form>
      </div>
    </div>
  )
}
