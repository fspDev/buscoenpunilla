'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { guardarEdicionPrestadorAdmin } from '@/app/actions/admin'

const OFICIOS = ['Electricista','Plomero','Gasista','Albañil','Carpintero','Techista','Pintor','Jardinero','Cerrajero','Otro']
const ZONAS   = ['San Antonio de Arredondo','Mayu Sumaj','Villa Parque Síquiman','Villa Carlos Paz','Cosquín','La Falda','Bialet Massé']

// Esta página recibe el ID via props pero carga los datos server-side en el componente padre
// Por simplicidad usamos 'use client' y cargamos con useEffect
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EditarPrestadorAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [data, setData]   = useState<Record<string, unknown> | null>(null)
  const [form, setForm]   = useState<Record<string, unknown>>({})
  const [isPending, start] = useTransition()
  const [ok, setOk]       = useState(false)

  useEffect(() => {
    createClient()
      .from('admin_prestadores').select('*').eq('id', params.id).single()
      .then(({ data }) => { setData(data); setForm(data ?? {}) })
  }, [params.id])

  if (!data) return <div className="p-8 text-on-surface-variant">Cargando...</div>

  function set(key: string, value: unknown) { setForm((f) => ({ ...f, [key]: value })) }

  function handleGuardar() {
    start(async () => {
      await guardarEdicionPrestadorAdmin(params.id, {
        nombre:             form.nombre as string,
        whatsapp:           form.whatsapp as string,
        oficio:             form.oficio as string,
        descripcion:        form.descripcion as string,
        zonas_trabajo:      form.zonas_trabajo as string[],
        activo:             form.activo as boolean,
        verificado:         form.verificado as boolean,
        suspendido:         form.suspendido as boolean,
        notas_admin:        form.notas_admin as string,
        fecha_fin_gratuito: form.fecha_fin_gratuito as string,
      })
      setOk(true)
      setTimeout(() => router.push('/admin/prestadores'), 1200)
    })
  }

  const Input = ({ label, field, type = 'text' }: { label: string; field: string; type?: string }) => (
    <div>
      <label className="block text-xs font-medium text-on-surface-variant mb-1">{label}</label>
      <input
        type={type}
        value={(form[field] as string) ?? ''}
        onChange={(e) => set(field, e.target.value)}
        className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm text-on-surface outline-none focus:border-primary-container"
      />
    </div>
  )

  return (
    <div className="px-6 py-8 max-w-xl space-y-5">
      <h1 className="text-2xl font-bold text-on-surface">Editar prestador</h1>

      <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card space-y-4">
        <Input label="Nombre" field="nombre" />
        <Input label="WhatsApp" field="whatsapp" />

        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Oficio</label>
          <select value={(form.oficio as string) ?? ''} onChange={(e) => set('oficio', e.target.value)}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-sm">
            {OFICIOS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Zonas</label>
          <div className="flex flex-wrap gap-1.5">
            {ZONAS.map((z) => {
              const zonas = (form.zonas_trabajo as string[]) ?? []
              const sel   = zonas.includes(z)
              return (
                <button key={z} type="button"
                  onClick={() => set('zonas_trabajo', sel ? zonas.filter((x) => x !== z) : [...zonas, z])}
                  className={`rounded-full px-2.5 py-1 text-xs border transition ${sel ? 'border-primary-container bg-surface-low text-primary-container' : 'border-outline-variant text-on-surface-variant'}`}
                >
                  {z}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Descripción</label>
          <textarea rows={3} value={(form.descripcion as string) ?? ''} onChange={(e) => set('descripcion', e.target.value)}
            className="w-full resize-none rounded-lg border border-outline-variant px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Campos solo admin */}
      <div className="rounded-xl border border-ds-error-container bg-white p-5 shadow-card space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-ds-error">Solo admin</p>

        <div className="flex flex-wrap gap-4">
          {[
            { key: 'activo',      label: 'Activo' },
            { key: 'verificado',  label: 'Verificado ✓' },
            { key: 'suspendido',  label: 'Suspendido' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={(form[key] as boolean) ?? false}
                onChange={(e) => set(key, e.target.checked)}
                className="accent-primary-container" />
              {label}
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Fecha fin período gratuito</label>
          <input type="date"
            value={form.fecha_fin_gratuito ? (form.fecha_fin_gratuito as string).slice(0, 10) : ''}
            onChange={(e) => set('fecha_fin_gratuito', e.target.value)}
            className="rounded-lg border border-outline-variant px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-xs font-medium text-on-surface-variant mb-1">Notas internas</label>
          <textarea rows={3} value={(form.notas_admin as string) ?? ''}
            onChange={(e) => set('notas_admin', e.target.value)}
            placeholder="Observaciones privadas — nunca se muestran al prestador."
            className="w-full resize-none rounded-lg border border-outline-variant px-3 py-2 text-sm" />
        </div>
      </div>

      {ok && (
        <p className="text-sm text-secondary font-medium">✓ Guardado. Redirigiendo...</p>
      )}

      <div className="flex gap-3">
        <button onClick={handleGuardar} disabled={isPending}
          className="rounded-lg bg-primary-container px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button onClick={() => router.back()}
          className="rounded-lg border border-outline-variant px-5 py-2 text-sm text-on-surface-variant hover:bg-surface-low transition">
          Cancelar
        </button>
      </div>
    </div>
  )
}
