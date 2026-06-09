'use client'

import { useFormState } from 'react-dom'
import { useState } from 'react'
import Link from 'next/link'
import { registroPrestadorAction } from '@/app/auth/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { OficioSelector } from '@/components/OficioSelector'
import { PasswordInput } from '@/components/PasswordInput'
import { ZONAS } from '@/lib/constants'
const MAX_DESC = 200

interface Props {
  oficiosDisponibles: string[]
}

export function RegistroPrestadorForm({ oficiosDisponibles }: Props) {
  const [state, action] = useFormState(registroPrestadorAction, null)
  const [paso, setPaso] = useState<1 | 2>(1)
  const [terminosAceptados, setTerminosAceptados] = useState(false)

  // Paso 1
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [erroresPaso1, setErroresPaso1] = useState<{ nombre?: string; email?: string; password?: string }>({})

  // Paso 2 — solo para saber si tiene al menos un oficio (para habilitar submit)
  const [tieneOficio, setTieneOficio] = useState(false)
  const [descLen, setDescLen] = useState(0)
  const [zonas, setZonas] = useState<string[]>([])

  function toggleZona(zona: string) {
    setZonas((prev) => prev.includes(zona) ? prev.filter((z) => z !== zona) : [...prev, zona])
  }

  function validarPaso1() {
    const errs: typeof erroresPaso1 = {}
    if (!nombre.trim()) errs.nombre = 'El nombre es requerido'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Ingresá un email válido'
    if (password.length < 8) errs.password = 'La contraseña debe tener al menos 8 caracteres'
    setErroresPaso1(errs)
    return Object.keys(errs).length === 0
  }

  function avanzarPaso2(e: React.MouseEvent) {
    e.preventDefault()
    if (validarPaso1()) setPaso(2)
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm space-y-6">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-on-surface">Crear perfil</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Registrate como prestador de servicios</p>
        </div>

        {/* Indicador de progreso */}
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${paso >= 1 ? 'bg-primary-container text-white' : 'bg-surface-low text-outline'}`}>
              {paso > 1 ? '✓' : '1'}
            </div>
            <span className={`text-xs font-medium transition ${paso === 1 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              Datos básicos
            </span>
          </div>
          <div className={`h-px flex-1 transition ${paso >= 2 ? 'bg-primary-container' : 'bg-outline-variant'}`} />
          <div className="flex flex-1 items-center gap-2">
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${paso >= 2 ? 'bg-primary-container text-white' : 'bg-surface-low text-outline'}`}>
              2
            </div>
            <span className={`text-xs font-medium transition ${paso === 2 ? 'text-on-surface' : 'text-on-surface-variant'}`}>
              Perfil profesional
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-secondary-container bg-secondary-container/30 px-4 py-3 space-y-1">
          <p className="text-sm font-semibold text-on-surface">60 días de prueba gratuita</p>
          <p className="text-xs text-on-surface-variant">
            Luego, el plan mensual es de{' '}
            <span className="font-semibold text-on-surface">$10.200 ARS/mes</span>.
            Sin contratos — pausá o cancelá cuando quieras.
          </p>
        </div>

        <form action={action} className="space-y-4">
          {/* Campos ocultos del paso 1 cuando estamos en paso 2 */}
          {paso === 2 && (
            <>
              <input type="hidden" name="nombre" value={nombre} />
              <input type="hidden" name="email" value={email} />
              <input type="hidden" name="password" value={password} />
            </>
          )}

          {/* ── PASO 1 ── */}
          <div className={paso === 1 ? 'space-y-4' : 'hidden'}>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Nombre completo <span className="text-ds-error">*</span>
              </label>
              <input
                name="nombre_visible"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                onBlur={() => {
                  if (!nombre.trim()) setErroresPaso1((p) => ({ ...p, nombre: 'El nombre es requerido' }))
                  else setErroresPaso1((p) => ({ ...p, nombre: undefined }))
                }}
                className={`w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:ring-1 transition ${erroresPaso1.nombre ? 'border-ds-error focus:border-ds-error focus:ring-ds-error' : 'border-outline-variant focus:border-primary-container focus:ring-primary-container'}`}
              />
              {erroresPaso1.nombre && <p className="mt-1 text-xs text-ds-error">{erroresPaso1.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Email <span className="text-ds-error">*</span>
              </label>
              <input
                name="email_visible"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => {
                  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                    setErroresPaso1((p) => ({ ...p, email: 'Ingresá un email válido' }))
                  else setErroresPaso1((p) => ({ ...p, email: undefined }))
                }}
                autoComplete="email"
                className={`w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:ring-1 transition ${erroresPaso1.email ? 'border-ds-error focus:border-ds-error focus:ring-ds-error' : 'border-outline-variant focus:border-primary-container focus:ring-primary-container'}`}
              />
              {erroresPaso1.email && <p className="mt-1 text-xs text-ds-error">{erroresPaso1.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                Contraseña <span className="text-ds-error">*</span>
              </label>
              <PasswordInput
                name="password_visible"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onBlur={() => {
                  if (password.length < 8)
                    setErroresPaso1((p) => ({ ...p, password: 'Mínimo 8 caracteres' }))
                  else setErroresPaso1((p) => ({ ...p, password: undefined }))
                }}
                hasError={!!erroresPaso1.password}
              />
              {erroresPaso1.password
                ? <p className="mt-1 text-xs text-ds-error">{erroresPaso1.password}</p>
                : <p className="mt-1 text-xs text-outline">Mínimo 8 caracteres</p>
              }
            </div>

            <button
              type="button"
              onClick={avanzarPaso2}
              className="w-full min-h-[44px] rounded-lg bg-primary-container px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-95"
            >
              Continuar →
            </button>
          </div>

          {/* ── PASO 2 ── */}
          <div className={paso === 2 ? 'space-y-4' : 'hidden'}>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Oficios <span className="text-ds-error">*</span>
              </label>
              <OficioSelector
                oficiosDisponibles={oficiosDisponibles}
                max={5}
                onChange={(sel, prop) => setTieneOficio(sel.length > 0 || prop.trim().length > 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Zonas de trabajo <span className="text-ds-error">*</span>
              </label>
              {zonas.map((z) => <input key={z} type="hidden" name="zonas" value={z} />)}
              <div className="flex flex-wrap gap-2">
                {ZONAS.map((z) => (
                  <button
                    key={z}
                    type="button"
                    onClick={() => toggleZona(z)}
                    className={`min-h-[36px] rounded-full border px-3 py-1 text-sm font-medium transition ${
                      zonas.includes(z)
                        ? 'border-primary-container bg-surface-low text-primary-container'
                        : 'border-outline-variant text-on-surface-variant hover:border-primary-container hover:text-on-surface'
                    }`}
                  >
                    {z}
                  </button>
                ))}
              </div>
              {zonas.length === 0 && (
                <p className="mt-1 text-xs text-ds-error">Seleccioná al menos una zona</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">
                WhatsApp <span className="text-ds-error">*</span>
              </label>
              <input name="whatsapp" required inputMode="numeric" placeholder="Ej: 3541456789"
                className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
              <p className="mt-1 text-xs text-outline">Es el canal principal de contacto con clientes</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Descripción breve</label>
              <textarea name="descripcion" rows={3} maxLength={MAX_DESC}
                onChange={(e) => setDescLen(e.target.value.length)}
                placeholder="Contá brevemente qué hacés y tu experiencia..."
                className="w-full resize-none rounded-lg border border-outline-variant px-3 py-2.5 text-base outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
              <p className={`mt-1 text-right text-xs ${descLen >= MAX_DESC ? 'text-ds-error' : 'text-outline'}`}>
                {descLen}/{MAX_DESC}
              </p>
            </div>

            <div className="flex items-start gap-2">
              <input
                id="terminos"
                name="terminos"
                type="checkbox"
                required
                checked={terminosAceptados}
                onChange={(e) => setTerminosAceptados(e.target.checked)}
                className="mt-0.5 h-5 w-5 flex-shrink-0 rounded accent-primary-container"
              />
              <label htmlFor="terminos" className="text-sm text-on-surface-variant leading-snug">
                He leído y acepto los{' '}
                <Link href="/terminos" target="_blank" className="text-primary-container underline hover:opacity-80">
                  Términos y Condiciones
                </Link>
                {' '}y autorizo que mi perfil aparezca en el directorio público de BUSCO.
              </label>
            </div>

            {state?.error && (
              <p className="rounded-lg bg-ds-error-container px-3 py-2 text-sm text-ds-error">{state.error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaso(1)}
                className="flex-shrink-0 rounded-lg border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-low"
              >
                ← Atrás
              </button>
              <div className="flex-1">
                <SubmitButton
                  label="Crear perfil"
                  loadingLabel="Creando perfil..."
                  disabled={!terminosAceptados || !tieneOficio || zonas.length === 0}
                />
              </div>
            </div>
          </div>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Ya tengo cuenta →{' '}
          <Link href="/auth/login" className="text-primary-container hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
