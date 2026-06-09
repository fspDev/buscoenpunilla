'use client'

import { useFormState } from 'react-dom'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { recuperarAction } from '@/app/auth/actions'
import { SubmitButton } from '@/components/SubmitButton'

export default function RecuperarPage() {
  const [state, action] = useFormState(recuperarAction, null)
  const searchParams = useSearchParams()
  const enviado = searchParams.get('enviado')

  if (enviado) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="rounded-lg bg-green-50 p-6">
            <p className="text-sm text-green-700">
              Revisá tu email, te mandamos un link para restablecer tu contraseña.
            </p>
          </div>
          <Link href="/auth/login" className="block text-sm text-blue-600 hover:underline">
            ← Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresá tu email y te enviamos un link para restablecer tu contraseña.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <SubmitButton label="Enviar link de recuperación" loadingLabel="Enviando..." />
        </form>

        <Link href="/auth/login" className="block text-center text-sm text-blue-600 hover:underline">
          ← Volver al login
        </Link>
      </div>
    </div>
  )
}
