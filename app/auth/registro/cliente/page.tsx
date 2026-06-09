'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { registroClienteAction } from '@/app/auth/actions'
import { useState } from 'react'
import { SubmitButton } from '@/components/SubmitButton'
import { PasswordInput } from '@/components/PasswordInput'

const LOCALIDADES = [
  'San Antonio de Arredondo','Mayu Sumaj','Villa Parque Síquiman',
  'Villa Carlos Paz','Cosquín','La Falda','Otra',
]

export default function RegistroClientePage() {
  const [state, action] = useFormState(registroClienteAction, null)
  const [terminos, setTerminos] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-on-surface">Crear cuenta</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Registrate como cliente</p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Nombre completo <span className="text-ds-error">*</span>
            </label>
            <input name="nombre" type="text" required
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Email <span className="text-ds-error">*</span>
            </label>
            <input name="email" type="email" required autoComplete="email"
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Contraseña <span className="text-ds-error">*</span>
            </label>
            <PasswordInput name="password" autoComplete="new-password" minLength={8} required />
            <p className="mt-1 text-xs text-outline">Mínimo 8 caracteres</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Localidad <span className="text-ds-error">*</span>
            </label>
            <select name="localidad" required defaultValue=""
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container">
              <option value="" disabled>Seleccioná tu localidad</option>
              {LOCALIDADES.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              WhatsApp <span className="text-on-surface-variant font-normal">(opcional)</span>
            </label>
            <input name="whatsapp" type="tel" inputMode="numeric" placeholder="Ej: 3541123456"
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="terminos"
              name="terminos"
              type="checkbox"
              required
              checked={terminos}
              onChange={(e) => setTerminos(e.target.checked)}
              className="mt-0.5 h-5 w-5 flex-shrink-0 rounded accent-primary-container"
            />
            <label htmlFor="terminos" className="text-sm text-on-surface-variant leading-snug">
              He leído y acepto los{' '}
              <Link href="/terminos" target="_blank" className="text-primary-container underline hover:opacity-80">
                Términos y Condiciones
              </Link>{' '}
              de uso de BUSCO.
            </label>
          </div>

          {state?.error && (
            <p className="rounded-lg bg-ds-error-container px-3 py-2 text-sm text-ds-error">{state.error}</p>
          )}

          <SubmitButton label="Crear cuenta" loadingLabel="Creando cuenta..." disabled={!terminos} />
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Ya tengo cuenta →{' '}
          <Link href="/auth/login" className="text-primary-container hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
