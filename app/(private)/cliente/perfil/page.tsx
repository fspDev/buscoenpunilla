'use client'

import { useEffect, useState } from 'react'
import { useFormState } from 'react-dom'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { guardarPerfilClienteAction, guardarFotoClienteAction, cambiarRolAction } from '@/app/actions/cliente'
import { FotoUploader } from '@/components/FotoUploader'
import { SubmitButton } from '@/components/SubmitButton'

const LOCALIDADES = [
  'San Antonio de Arredondo','Mayu Sumaj','Villa Parque Síquiman',
  'Villa Carlos Paz','Cosquín','La Falda','Otra',
]

export default function PerfilClientePage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null)
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [toast, setToast]     = useState(false)
  const [state, action]       = useFormState(guardarPerfilClienteAction, null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      createClient().from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => { setProfile(data); setFotoUrl((data as Record<string, unknown>)?.foto_url as string | null) })
    })
  }, [])

  useEffect(() => {
    if (state?.ok) { setToast(true); setTimeout(() => setToast(false), 3000) }
  }, [state])

  if (!profile) return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <p className="text-on-surface-variant">Cargando...</p>
    </div>
  )

  async function handleFoto(url: string) {
    setFotoUrl(url)
    await guardarFotoClienteAction(url)
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  async function handleSwitchToPrestador() {
    if (!window.confirm('¿Confirmás cambiar tu cuenta a Prestador? Podrás ofrecer tus servicios en el directorio.')) return
    await cambiarRolAction('prestador')
    window.location.href = '/prestador/dashboard'
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-secondary px-5 py-2.5 text-sm font-medium text-white shadow-card-hover">
          Cambios guardados ✓
        </div>
      )}

      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-on-surface">Mis datos</h1>

        {/* Foto */}
        <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card flex items-center gap-4">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-surface-highest">
            {fotoUrl ? (
              <Image src={fotoUrl} alt="Foto de perfil" fill className="object-cover" sizes="80px" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-outline">
                {(profile.nombre as string)?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <FotoUploader
            bucket="fotos-perfil"
            path_prefix={`${profile.id}/${profile.id}-avatar`}
            onUploadComplete={handleFoto}
            label="Cambiar foto"
          />
        </div>

        {/* Formulario */}
        <form action={action} className="rounded-xl border border-outline-variant bg-white p-5 shadow-card space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Nombre completo</label>
            <input name="nombre" defaultValue={(profile.nombre as string) ?? ''} required
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Localidad</label>
            <select name="localidad" defaultValue={(profile.localidad as string) ?? ''}
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container">
              <option value="">Seleccioná</option>
              {LOCALIDADES.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">WhatsApp</label>
            <input name="whatsapp" inputMode="numeric" defaultValue={(profile.whatsapp as string) ?? ''}
              placeholder="Ej: 3541456789"
              className="w-full rounded-lg border border-outline-variant px-3 py-2.5 text-base text-on-surface outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container" />
          </div>
          {state?.error && <p className="text-sm text-ds-error">{state.error}</p>}
          <SubmitButton label="Guardar cambios" loadingLabel="Guardando..." />
        </form>

        {/* Cambiar rol a prestador */}
        <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card space-y-3">
          <h3 className="font-semibold text-on-surface">¿Querés ofrecer tus servicios?</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Convertí tu cuenta en **Prestador** para poder registrar tus oficios, publicar fotos de tus trabajos y recibir contactos de clientes por WhatsApp.
          </p>
          <button
            type="button"
            onClick={handleSwitchToPrestador}
            className="w-full rounded-lg bg-surface-low border border-outline-variant py-2.5 text-center text-sm font-semibold text-primary-container transition hover:bg-surface-base"
          >
            Cambiar mi cuenta a Prestador
          </button>
        </div>
      </div>
    </div>
  )
}
