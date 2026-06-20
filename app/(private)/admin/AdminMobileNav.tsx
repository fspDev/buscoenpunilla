'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { AdminNavLinks } from './AdminNavLinks'

interface Props {
  nombre?: string
  pendingOficiosCount?: number
  pendingZonasCount?: number
  contactosNoLeidosCount?: number
  reportesPendientesCount?: number
}

export function AdminMobileNav(props: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar el drawer al navegar
  useEffect(() => { setOpen(false) }, [pathname])

  // Evitar scroll del fondo cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const totalBadges =
    (props.pendingOficiosCount ?? 0) +
    (props.pendingZonasCount ?? 0) +
    (props.contactosNoLeidosCount ?? 0) +
    (props.reportesPendientesCount ?? 0)

  return (
    <div className="md:hidden">
      {/* Barra superior */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-on-surface hover:bg-surface-low"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          {totalBadges > 0 && (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-ds-error" />
          )}
        </button>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline leading-none">Admin</p>
          {props.nombre && <p className="mt-0.5 text-sm font-medium text-on-surface leading-none">{props.nombre}</p>}
        </div>
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute left-0 top-0 h-full w-64 max-w-[80%] overflow-y-auto bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">Admin</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="text-2xl leading-none text-outline hover:text-on-surface"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-0.5 p-2">
              <AdminNavLinks
                pendingOficiosCount={props.pendingOficiosCount}
                pendingZonasCount={props.pendingZonasCount}
                contactosNoLeidosCount={props.contactosNoLeidosCount}
                reportesPendientesCount={props.reportesPendientesCount}
              />
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
