import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { SuscripcionNotificar } from './SuscripcionNotificar'

export default async function SuscripcionPage() {
  const { user } = await requireRole('prestador')
  const supabase = createClient()

  const { data: prestador } = await supabase
    .from('prestadores')
    .select('created_at, fecha_fin_gratuito')
    .eq('id', user.id)
    .single()

  const fechaFin = prestador?.fecha_fin_gratuito
    ? new Date(prestador.fecha_fin_gratuito)
    : prestador?.created_at
      ? new Date(new Date(prestador.created_at).getTime() + 60 * 86400000)
      : null

  const fechaFinStr = fechaFin
    ? fechaFin.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const diasRestantes = fechaFin
    ? Math.max(0, Math.ceil((fechaFin.getTime() - Date.now()) / 86400000))
    : null

  const INCLUYE = [
    'Perfil activo y visible en búsquedas',
    'Estadísticas de visitas y contactos',
    'Recepción de reseñas',
    'Acceso a todos los oficios de la plataforma',
  ]

  return (
    <div className="px-4 py-8 sm:px-8">
      <div className="max-w-md space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-on-surface">Plan gratuito activo</h1>
          {fechaFinStr && (
            <p className="mt-2 text-sm text-on-surface-variant leading-relaxed">
              Tu perfil es gratuito hasta el <strong>{fechaFinStr}</strong>.
              {diasRestantes !== null && diasRestantes > 0 && (
                <> Te quedan <strong>{diasRestantes} días</strong> de período gratuito.</>
              )}
            </p>
          )}
        </div>

        {/* Barra de progreso del período gratuito */}
        {fechaFin && diasRestantes !== null && (
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Período gratuito</span>
              <span>{diasRestantes} días restantes</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-low">
              <div
                className={`h-full rounded-full transition-all ${diasRestantes < 15 ? 'bg-ds-error' : 'bg-secondary'}`}
                style={{ width: `${Math.min(100, (diasRestantes / 60) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-card">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-on-surface">$10.200</span>
            <span className="text-on-surface-variant">ARS / mes</span>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">Sin contratos — pausá o cancelá cuando quieras</p>

          <ul className="mt-4 space-y-2">
            {INCLUYE.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-on-surface">
                <span className="mt-0.5 text-secondary" aria-hidden="true">✓</span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-lg border border-outline-variant bg-surface-low px-4 py-3 text-center">
            <p className="text-sm font-medium text-on-surface">Pago disponible próximamente</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">Estamos integrando el sistema de pagos</p>
          </div>
        </div>

        {/* Captura de email para notificación */}
        <SuscripcionNotificar />
      </div>
    </div>
  )
}
