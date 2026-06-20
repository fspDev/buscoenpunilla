import { createAdminClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { MensajeAcciones } from '@/components/admin/MensajeAcciones'

export const dynamic = 'force-dynamic'

const TIPO_ERROR = 'Error / Bug'

interface PageProps { searchParams: { tab?: string } }

export default async function AdminContactoPage({ searchParams }: PageProps) {
  await requireRole('admin')
  const supabase  = createAdminClient()
  const soloNoLeidos = searchParams.tab === 'no-leidos'

  // Los reportes del botón "Reportar error" se gestionan en /admin/reportes.
  let query = supabase
    .from('mensajes_contacto')
    .select('*')
    .neq('tipo', TIPO_ERROR)
    .order('created_at', { ascending: false })

  if (soloNoLeidos) query = query.eq('leido', false)

  const { data: mensajes } = await query
  const { count: noLeidos } = await supabase
    .from('mensajes_contacto').select('id', { count: 'exact', head: true })
    .neq('tipo', TIPO_ERROR).eq('leido', false)

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">Mensajes de contacto</h1>
        {(noLeidos ?? 0) > 0 && (
          <span className="rounded-full bg-ds-error-container px-2.5 py-1 text-xs font-medium text-ds-error">
            {noLeidos} sin leer
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-outline-variant bg-white p-1 w-fit">
        {[{ label: 'Todos', value: '' }, { label: 'No leídos', value: 'no-leidos' }].map(({ label, value }) => (
          <a key={value} href={value ? `/admin/contacto?tab=${value}` : '/admin/contacto'}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
              (searchParams.tab ?? '') === value ? 'bg-primary-container text-white' : 'text-on-surface-variant hover:bg-surface-low'
            }`}>
            {label}
          </a>
        ))}
      </div>

      <div className="space-y-3">
        {(mensajes ?? []).length === 0 && (
          <p className="text-sm italic text-outline">No hay mensajes.</p>
        )}
        {(mensajes ?? []).map((m) => (
          <div key={m.id} className={`rounded-xl border p-5 shadow-card ${m.leido ? 'border-outline-variant bg-white' : 'border-primary-container bg-surface-low'}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium text-on-surface">{m.nombre}</p>
                <p className="text-sm text-on-surface-variant">{m.email}</p>
                <span className="mt-1 inline-block rounded-full bg-surface-base px-2 py-0.5 text-xs text-on-surface-variant">{m.tipo}</span>
              </div>
              <p className="text-xs text-outline flex-shrink-0">{new Date(m.created_at).toLocaleString('es-AR')}</p>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-on-surface leading-relaxed">{m.mensaje}</p>
            <div className="mt-4 border-t border-outline-variant pt-3">
              <MensajeAcciones id={m.id} leido={m.leido} userId={m.user_id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
