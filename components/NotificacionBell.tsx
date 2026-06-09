'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { marcarNotificacionLeida, marcarTodasLeidas } from '@/app/actions/notificaciones'
import type { Notificacion } from '@/types'

interface Props {
  userId: string
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

export function NotificacionBell({ userId }: Props) {
  const [notifs, setNotifs]   = useState<Notificacion[]>([])
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(true)
  const ref                   = useRef<HTMLDivElement>(null)

  const noLeidas = notifs.filter((n) => !n.leida).length

  useEffect(() => {
    async function fetchNotifs() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = createClient() as any
      const { data } = await supabase
        .from('notificaciones')
        .select('id, tipo, mensaje, leida, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)
      setNotifs((data ?? []) as Notificacion[])
      setLoading(false)
    }
    fetchNotifs()
  }, [userId])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleMarcarLeida(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n))
    await marcarNotificacionLeida(id)
  }

  async function handleMarcarTodas() {
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })))
    await marcarTodasLeidas()
  }

  function formatFecha(iso: string) {
    const d = new Date(iso)
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-low"
        aria-label="Notificaciones"
        title="Notificaciones"
      >
        <BellIcon className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-ds-error text-[10px] font-bold text-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 rounded-xl border border-outline-variant bg-white shadow-card-hover z-30">
          <div className="flex items-center justify-between border-b border-outline-variant px-3 py-2">
            <p className="text-sm font-semibold text-on-surface">Notificaciones</p>
            {noLeidas > 0 && (
              <button
                onClick={handleMarcarTodas}
                className="text-xs text-primary-container hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-center text-sm text-outline">Cargando...</p>
            ) : notifs.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-outline italic">Sin notificaciones</p>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.leida && handleMarcarLeida(n.id)}
                  className={`flex gap-2 px-3 py-2.5 text-sm border-b border-outline-variant last:border-0 transition ${
                    n.leida ? 'opacity-60' : 'cursor-pointer hover:bg-surface-low'
                  }`}
                >
                  <div className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.leida ? 'bg-transparent' : 'bg-primary-container'}`} />
                  <div className="min-w-0">
                    <p className={`leading-snug text-on-surface ${n.leida ? '' : 'font-medium'}`}>
                      {n.mensaje}
                    </p>
                    <p className="mt-0.5 text-xs text-outline">{formatFecha(n.created_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
