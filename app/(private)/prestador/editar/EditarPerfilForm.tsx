'use client'

import { useFormState } from 'react-dom'
import { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { guardarPerfilAction, guardarFotoPerfilAction, agregarFotoTrabajoAction, eliminarFotoTrabajoAction, toggleActivoAction } from '@/app/actions/prestador'
import { cambiarRolAction } from '@/app/actions/cliente'
import { FotoUploader } from '@/components/FotoUploader'
import { OficioSelector } from '@/components/OficioSelector'
import { ZonaSelector } from '@/components/ZonaSelector'
import { SubmitButton } from '@/components/SubmitButton'
import type { FotoTrabajo } from '@/types'

const MAX_DESC = 200

interface InitialData {
  nombre: string; whatsapp: string; oficio: string
  oficios: string[]; descripcion: string; foto_url: string | null
  zonas: string[]; activo: boolean; matricula: string
  oficio_propuesto?: string | null
  estado_oficio?: string | null
  zona_propuesta?: string | null
  estado_zona?: string | null
}

interface Props {
  prestador_id: string
  oficiosDisponibles: string[]
  zonasDisponibles: string[]
  initialData: InitialData
  fotos_trabajos: FotoTrabajo[]
}

export function EditarPerfilForm({ prestador_id, oficiosDisponibles, zonasDisponibles, initialData, fotos_trabajos }: Props) {
  const [state, formAction]   = useFormState(guardarPerfilAction, null)
  const [desc, setDesc]       = useState(initialData.descripcion)
  const [fotoUrl, setFotoUrl] = useState<string | null>(initialData.foto_url)
  const [fotos, setFotos]     = useState<FotoTrabajo[]>(fotos_trabajos)
  const [activo, setActivo]   = useState(initialData.activo)
  const [toast, setToast]       = useState<{ text: string; ok: boolean } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (state?.ok) showToast('Cambios guardados ✓')
  }, [state])

  function showToast(text: string) {
    setToast({ text, ok: true })
    setTimeout(() => setToast(null), 3000)
  }

  function showError(text: string) {
    setToast({ text, ok: false })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleFotoPerfil(url: string) {
    setFotoUrl(url)
    const result = await guardarFotoPerfilAction(url)
    if (result?.error) { setFotoUrl(initialData.foto_url); showError(result.error) }
    else showToast('Foto de perfil actualizada ✓')
  }

  async function handleAgregarFoto(url: string) {
    const result = await agregarFotoTrabajoAction(url)
    if (result?.error) showError(result.error)
    else {
      setFotos((prev) => [...prev, { id: Date.now().toString(), url, created_at: new Date().toISOString() }])
      showToast('Foto agregada ✓')
    }
  }

  async function handleEliminarFoto(foto: FotoTrabajo) {
    if (!window.confirm('¿Eliminar esta foto?')) return
    const storagePath = foto.url.split('/fotos-trabajos/')[1] ?? ''
    await eliminarFotoTrabajoAction(foto.id, storagePath)
    setFotos((prev) => prev.filter((f) => f.id !== foto.id))
  }

  async function handleToggleActivo() {
    if (activo && !window.confirm('¿Pausar tu perfil? Dejarás de aparecer en búsquedas.')) return
    startTransition(async () => {
      const result = await toggleActivoAction(!activo)
      if (result?.error) showError(result.error)
      else setActivo((v) => !v)
    })
  }

  async function handleSwitchToCliente() {
    if (!window.confirm('¿Confirmás cambiar tu cuenta a Vecino? Tu perfil de prestador se pausará.')) return
    await cambiarRolAction('cliente')
    window.location.href = '/cliente/perfil'
  }

  const estado = initialData.estado_oficio
  const propuesta = initialData.oficio_propuesto
  const estadoZona = initialData.estado_zona
  const propuestaZona = initialData.zona_propuesta

  return (
    <div className="space-y-8 max-w-2xl">
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-2.5 text-sm font-medium text-white shadow-card-hover transition-all ${toast.ok ? 'bg-secondary' : 'bg-ds-error'}`}>
          {toast.text}
        </div>
      )}

      {/* Banners de estado de oficio */}
      {estado === 'pendiente' && propuesta && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800">Oficio en revisión</p>
          <p className="mt-0.5 text-sm text-amber-700">
            Tu oficio <strong>&ldquo;{propuesta}&rdquo;</strong> está siendo revisado. Te avisamos cuando sea aprobado.
          </p>
        </div>
      )}
      {estado === 'rechazado' && (
        <div className="rounded-xl border border-ds-error/30 bg-ds-error-container/20 px-4 py-3">
          <p className="text-sm font-semibold text-ds-error">Oficio no aprobado</p>
          <p className="mt-0.5 text-sm text-ds-error/80">
            Tu oficio propuesto no pudo ser aprobado. Por favor elegí uno de la lista o proponé uno diferente.
          </p>
        </div>
      )}
      {estado === 'fusionado' && (
        <div className="rounded-xl border border-secondary/30 bg-secondary/10 px-4 py-3">
          <p className="text-sm font-semibold text-secondary">Oficio clasificado</p>
          <p className="mt-0.5 text-sm text-secondary/80">
            Tu oficio fue clasificado como <strong>&ldquo;{initialData.oficio}&rdquo;</strong>. Ya aparecés en búsquedas de esa categoría.
          </p>
        </div>
      )}

      {/* Banners de estado de zona */}
      {estadoZona === 'pendiente' && propuestaZona && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-800">Zona en revisión</p>
          <p className="mt-0.5 text-sm text-amber-700">
            Tu zona <strong>&ldquo;{propuestaZona}&rdquo;</strong> está siendo revisada. Te avisamos cuando sea aprobada.
          </p>
        </div>
      )}
      {estadoZona === 'rechazado' && (
        <div className="rounded-xl border border-ds-error/30 bg-ds-error-container/20 px-4 py-3">
          <p className="text-sm font-semibold text-ds-error">Zona no aprobada</p>
          <p className="mt-0.5 text-sm text-ds-error/80">
            Tu zona propuesta no pudo ser aprobada. Por favor elegí una de la lista o proponé una diferente.
          </p>
        </div>
      )}

      {/* Foto de perfil */}
      <section className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
        <h2 className="mb-4 font-semibold text-on-surface">Foto de perfil</h2>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-surface-highest">
            {fotoUrl ? (
              <Image src={fotoUrl} alt="Foto de perfil" fill className="object-cover" sizes="80px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-outline">
                {initialData.nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <FotoUploader
            bucket="fotos-perfil"
            path_prefix={`${prestador_id}/${prestador_id}-avatar`}
            onUploadComplete={handleFotoPerfil}
            label="Cambiar foto"
          />
        </div>
      </section>

      {/* Datos del perfil */}
      <form action={formAction} className="rounded-xl border border-outline-variant bg-white p-5 shadow-card space-y-4">
        <h2 className="font-semibold text-on-surface">Datos del perfil</h2>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            Nombre completo <span className="text-ds-error">*</span>
          </label>
          <input
            name="nombre"
            defaultValue={initialData.nombre}
            required
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">
            WhatsApp <span className="text-ds-error">*</span>
          </label>
          <input
            name="whatsapp"
            defaultValue={initialData.whatsapp}
            required
            placeholder="Ej: 3541456789 (sin el 0 y sin el 15)"
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
        </div>

        {/* Oficios con OficioSelector */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Oficios <span className="text-ds-error">*</span>
          </label>
          <OficioSelector
            oficiosDisponibles={oficiosDisponibles}
            defaultSelected={initialData.oficios.length ? initialData.oficios : (initialData.oficio ? [initialData.oficio] : [])}
            defaultPropuesta={propuesta ?? ''}
            max={5}
          />
        </div>

        {/* Matrícula */}
        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Número de matrícula</label>
          <input
            name="matricula"
            defaultValue={initialData.matricula}
            placeholder="Ej: MP 1234 (opcional)"
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
          <p className="mt-1 text-xs text-on-surface-variant">Si tenés habilitación oficial podés ingresarla aquí.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Zonas de trabajo <span className="text-ds-error">*</span>
          </label>
          <ZonaSelector
            zonasDisponibles={zonasDisponibles}
            defaultSelected={initialData.zonas}
            defaultPropuesta={propuestaZona ?? ''}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-1">Descripción</label>
          <textarea
            name="descripcion"
            rows={3}
            maxLength={MAX_DESC}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full resize-none rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
          />
          <p className={`mt-1 text-right text-xs ${desc.length >= MAX_DESC ? 'text-ds-error' : 'text-outline'}`}>
            {desc.length}/{MAX_DESC}
          </p>
        </div>

        {state?.error && (
          <p className="rounded-lg bg-ds-error-container px-3 py-2 text-sm text-ds-error">{state.error}</p>
        )}

        <SubmitButton label="Guardar cambios" loadingLabel="Guardando..." />
      </form>

      {/* Fotos de trabajos */}
      <section className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-on-surface">Fotos de trabajos</h2>
          <span className="text-xs text-outline">{fotos.length}/8</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {fotos.map((foto) => (
            <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-lg bg-surface-highest">
              <Image src={foto.url} alt="Foto de trabajo" fill className="object-cover" sizes="25vw" />
              <button
                onClick={() => handleEliminarFoto(foto)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 text-xs"
              >
                ✕
              </button>
            </div>
          ))}
          {fotos.length < 8 && (
            <FotoUploader
              bucket="fotos-trabajos"
              path_prefix={`${prestador_id}/${prestador_id}`}
              onUploadComplete={handleAgregarFoto}
              label="+ foto"
            />
          )}
        </div>
      </section>

      {/* Estado del perfil */}
      <section className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
        <h2 className="font-semibold text-on-surface mb-3">Estado del perfil</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-on-surface">
              {activo ? 'Tu perfil está visible en búsquedas' : 'Tu perfil está pausado'}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {activo
                ? 'Los vecinos pueden encontrarte y contactarte.'
                : 'No aparecés en búsquedas. Tus reseñas y datos se conservan.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleActivo}
            disabled={isPending}
            aria-checked={activo}
            role="switch"
            className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:opacity-50 ${activo ? 'bg-secondary' : 'bg-outline-variant'}`}
          >
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${activo ? 'translate-x-7' : 'translate-x-0'}`} />
          </button>
        </div>
      </section>

      {/* Cambiar rol a cliente */}
      <section className="rounded-xl border border-outline-variant bg-white p-5 shadow-card space-y-3">
        <h3 className="font-semibold text-ds-error">¿Ya no querés ofrecer servicios?</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Podés volver a cambiar tu cuenta a Vecino. Tu perfil de prestador se pausará automáticamente y dejarás de figurar en las búsquedas públicas, pero conservarás tus datos por si deseás volver a activarlo más adelante.
        </p>
        <button
          type="button"
          onClick={handleSwitchToCliente}
          className="w-full rounded-lg bg-ds-error-container/20 border border-ds-error/30 py-2.5 text-center text-sm font-semibold text-ds-error transition hover:bg-ds-error-container/40"
        >
          Cambiar mi cuenta a Vecino
        </button>
      </section>

      <Link href="/prestador/dashboard" className="block text-center text-sm text-on-surface-variant hover:text-on-surface transition">
        Cancelar
      </Link>
    </div>
  )
}
