'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginAction } from '@/app/auth/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { PasswordInput } from '@/components/PasswordInput'

export default function LoginPage() {
  const [state, action] = useFormState(loginAction, null)
  const searchParams = useSearchParams()
  const mensaje = searchParams.get('mensaje')

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-on-surface">BUSCO</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Ingresá a tu cuenta</p>
        </div>

        {mensaje === 'confirma-email' && (
          <div className="rounded-lg bg-surface-low p-3 text-sm text-primary-container">
            Revisá tu email para confirmar tu cuenta antes de ingresar.
          </div>
        )}

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-1">
              Contraseña
            </label>
            <PasswordInput name="password" autoComplete="current-password" required />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-ds-error-container px-3 py-2 text-sm text-ds-error">
              {state.error}
            </p>
          )}

          <SubmitButton label="Ingresar" loadingLabel="Ingresando..." />
        </form>

        <div className="text-center text-sm">
          <Link href="/auth/recuperar" className="text-primary-container hover:underline">
            Olvidé mi contraseña
          </Link>
        </div>

        <div className="rounded-xl border border-outline-variant bg-white p-4 text-sm">
          <p className="mb-3 font-medium text-on-surface">¿No tenés cuenta?</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/auth/registro/cliente"
              className="min-h-[44px] flex items-center justify-center rounded-lg border border-outline-variant px-4 text-on-surface-variant transition hover:bg-surface-low"
            >
              Soy cliente
            </Link>
            <Link
              href="/auth/registro/prestador"
              className="min-h-[44px] flex items-center justify-center rounded-lg border border-surface-low bg-surface-low px-4 text-primary-container transition hover:bg-surface-base"
            >
              Soy prestador
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
