import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { MetricaCard } from '@/components/MetricaCard'
import { RatingStars } from '@/components/RatingStars'
import { ResenaCard } from '@/components/ResenaCard'
import { CompartirWhatsApp } from '@/components/CompartirWhatsApp'
import type { Resena, MetricasPrestador } from '@/types'

async function getMetricas(prestador_id: string): Promise<MetricasPrestador> {
  const supabase = createClient()
  const ahora    = new Date()
  const hace30   = new Date(ahora.getTime() - 30  * 86400000).toISOString()
  const hace60   = new Date(ahora.getTime() - 60  * 86400000).toISOString()

  const [imp30, imp60, con30, con60, res30, ratingData] = await Promise.all([
    supabase.from('impresiones_busqueda').select('id', { count: 'exact', head: true })
      .eq('prestador_id', prestador_id).gte('created_at', hace30),
    supabase.from('impresiones_busqueda').select('id', { count: 'exact', head: true })
      .eq('prestador_id', prestador_id).gte('created_at', hace60).lt('created_at', hace30),
    supabase.from('contactos_log').select('id', { count: 'exact', head: true })
      .eq('prestador_id', prestador_id).gte('created_at', hace30),
    supabase.from('contactos_log').select('id', { count: 'exact', head: true })
      .eq('prestador_id', prestador_id).gte('created_at', hace60).lt('created_at', hace30),
    supabase.from('resenas').select('id', { count: 'exact', head: true })
      .eq('prestador_id', prestador_id).gte('created_at', hace30),
    supabase.from('prestadores_publicos').select('rating_promedio').eq('id', prestador_id).single(),
  ])

  return {
    impresiones_30d:          imp30.count ?? 0,
    impresiones_30d_anterior: imp60.count ?? 0,
    contactos_30d:            con30.count ?? 0,
    contactos_30d_anterior:   con60.count ?? 0,
    resenas_30d:              res30.count ?? 0,
    rating_promedio:          (ratingData.data?.rating_promedio as number) ?? 0,
  }
}

export default async function DashboardPage() {
  const { user, profile } = await requireRole('prestador')
  const supabase = createClient()

  const [{ data: prestador }, { data: prestadorBase }, metricas] = await Promise.all([
    supabase.from('prestadores_publicos').select('*').eq('id', user.id).single(),
    supabase.from('prestadores').select('activo, fecha_fin_gratuito, created_at').eq('id', user.id).single(),
    getMetricas(user.id),
  ])

  // Últimas 3 reseñas — incluye cliente_nombre para reseñas públicas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: resenasRaw } = await (supabase as any)
    .from('resenas')
    .select('id, prestador_id, cliente_id, cliente_nombre, estrellas, comentario, respuesta_prestador, created_at')
    .eq('prestador_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const sinResponder = await supabase
    .from('resenas')
    .select('id', { count: 'exact', head: true })
    .eq('prestador_id', user.id)
    .is('respuesta_prestador', null)

  // Resolver nombres: para reseñas con cliente_id → join profiles; para anónimas → usar cliente_nombre
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clienteIds = Array.from(new Set(((resenasRaw ?? []) as any[]).map((r) => r.cliente_id).filter(Boolean)))
  const { data: clientes } = clienteIds.length
    ? await supabase.from('profiles').select('id, nombre').in('id', clienteIds)
    : { data: [] }
  const nombresMap = Object.fromEntries((clientes ?? []).map((c) => [c.id, c.nombre ?? 'Cliente']))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resenas: Resena[] = ((resenasRaw ?? []) as any[]).map((r) => ({
    ...r,
    cliente_nombre: r.cliente_nombre ?? nombresMap[r.cliente_id] ?? 'Cliente',
  }))

  const activo     = prestadorBase?.activo ?? true
  const totalRes   = prestador?.total_resenas as number ?? 0
  const rating     = Math.round((metricas.rating_promedio) * 10) / 10

  // Período de prueba
  const fechaFinRaw = prestadorBase?.fecha_fin_gratuito
    ?? (prestadorBase?.created_at
      ? new Date(new Date(prestadorBase.created_at).getTime() + 60 * 86400000).toISOString()
      : null)
  const fechaFin     = fechaFinRaw ? new Date(fechaFinRaw) : null
  const diasRestantes = fechaFin
    ? Math.ceil((fechaFin.getTime() - Date.now()) / 86400000)
    : null
  const enPrueba     = diasRestantes !== null && diasRestantes > 0
  const pruebVencida = diasRestantes !== null && diasRestantes <= 0

  return (
    <div className="px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-bold text-on-surface">
        Hola, {profile?.nombre?.split(' ')[0]} 👋
      </h1>

      {/* Banner período de prueba */}
      {enPrueba && fechaFin && (
        <div className={`mt-4 flex items-start justify-between gap-4 rounded-xl px-4 py-3 ${
          diasRestantes! <= 15
            ? 'border border-amber-200 bg-amber-50 text-amber-900'
            : 'border border-secondary-container bg-secondary-container/30 text-on-surface'
        }`}>
          <div>
            <p className="text-sm font-semibold">
              {diasRestantes! <= 15
                ? `⚠️ Te quedan ${diasRestantes} días de prueba gratuita`
                : `✓ Período de prueba activo — ${diasRestantes} días restantes`}
            </p>
            <p className="mt-0.5 text-xs opacity-75">
              Tu plan se inicia el{' '}
              {fechaFin.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}{' '}
              por <strong>$10.200 ARS/mes</strong>.
            </p>
          </div>
          <Link
            href="/prestador/suscripcion"
            className="flex-shrink-0 rounded-lg border border-current px-3 py-1.5 text-xs font-medium opacity-80 hover:opacity-100 transition"
          >
            Ver plan
          </Link>
        </div>
      )}

      {pruebVencida && activo && (
        <div className="mt-4 flex items-start justify-between gap-4 rounded-xl border border-ds-error bg-ds-error-container px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-ds-error">Tu período de prueba venció</p>
            <p className="mt-0.5 text-xs text-ds-error opacity-75">
              Para mantener tu perfil visible contactate con nosotros para activar tu plan.
            </p>
          </div>
          <Link
            href="/prestador/suscripcion"
            className="flex-shrink-0 rounded-lg bg-ds-error px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
          >
            Ver plan
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* Columna izquierda: perfil */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-surface-highest">
                {prestador?.foto_url ? (
                  <Image src={prestador.foto_url as string} alt="" fill className="object-cover" sizes="64px" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl font-semibold text-outline">
                    {profile?.nombre?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-on-surface truncate">{profile?.nombre}</p>
                <p className="text-sm text-on-surface-variant">{prestador?.oficio as string}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <RatingStars rating={rating} size="sm" />
                  <span className="text-xs text-on-surface-variant">
                    {totalRes} reseña{totalRes !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${activo ? 'bg-secondary-container text-secondary-on' : 'bg-ds-error-container text-ds-error'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-secondary' : 'bg-ds-error'}`} />
                {activo ? 'Perfil activo' : 'Perfil pausado'}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/prestador/${user.id}`}
                target="_blank"
                className="block rounded-lg border border-outline-variant py-2 text-center text-sm font-medium text-on-surface-variant transition hover:bg-surface-low"
              >
                Ver perfil público ↗
              </Link>
              <Link
                href="/prestador/editar"
                className="block rounded-lg bg-primary-container py-2 text-center text-sm font-medium text-white transition hover:opacity-90"
              >
                Editar perfil
              </Link>
            </div>
          </div>
        </div>

        {/* Columna derecha: compartir + métricas + reseñas */}
        <div className="space-y-6 lg:col-span-2">

          {/* Bloque "Pedí una reseña" — siempre primero */}
          <CompartirWhatsApp
            prestador_id={user.id}
            prestador_nombre={profile?.nombre ?? ''}
          />

          {/* Métricas */}
          <div>
            <p className="mb-3 text-sm font-medium text-on-surface-variant">Últimos 30 días</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricaCard
                titulo="Búsquedas"
                valor={metricas.impresiones_30d}
                comparacion_anterior={metricas.impresiones_30d_anterior}
              />
              <MetricaCard
                titulo="Contactos WA"
                valor={metricas.contactos_30d}
                comparacion_anterior={metricas.contactos_30d_anterior}
              />
              <MetricaCard titulo="Reseñas nuevas" valor={metricas.resenas_30d} />
              <MetricaCard titulo="Rating" valor={Number(rating.toFixed(1))} />
            </div>
          </div>

          {/* Últimas reseñas */}
          <div className="rounded-xl border border-outline-variant bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-on-surface">Últimas reseñas</p>
              <div className="flex items-center gap-2">
                {(sinResponder.count ?? 0) > 0 && (
                  <span className="rounded-full bg-ds-error-container px-2 py-0.5 text-xs font-medium text-ds-error">
                    {sinResponder.count} sin responder
                  </span>
                )}
                <Link href="/prestador/resenas" className="text-sm text-primary-container hover:underline">
                  Ver todas
                </Link>
              </div>
            </div>

            {resenas.length > 0 ? (
              <div className="mt-4 divide-y divide-outline-variant">
                {resenas.map((r) => (
                  <ResenaCard
                    key={r.id}
                    resena={r}
                    nombre_prestador={profile?.nombre ?? ''}
                    puede_reportar={false}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 flex flex-col items-center py-4 text-center">
                <span className="text-4xl text-gray-200">★</span>
                <p className="mt-3 font-semibold text-on-surface">Todavía no tenés reseñas</p>
                <p className="mt-1 max-w-[260px] text-sm text-on-surface-variant leading-relaxed">
                  Compartí el link con tus clientes para empezar a construir tu reputación.
                </p>
              </div>
            )}

            <div className="mt-4 border-t border-outline-variant pt-4">
              <Link
                href="/prestador/resenas"
                className="block text-center text-sm text-primary-container hover:underline"
              >
                Ver todas mis reseñas
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
