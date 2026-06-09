'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { logoutAction } from '@/app/auth/actions'

type Role = 'cliente' | 'prestador' | 'admin'

interface Props {
  nombre: string | null
  foto_url: string | null
  role: Role
}

const BADGE: Record<Role, { label: string; cls: string }> = {
  cliente:  { label: 'Vecino',    cls: 'bg-sky-100 text-sky-700' },
  prestador:{ label: 'Prestador', cls: 'bg-orange-100 text-orange-700' },
  admin:    { label: 'Admin',     cls: 'bg-surface-highest text-on-surface' },
}

const PANEL_LINK: Record<Role, { label: string; href: string }> = {
  cliente:  { label: 'Mis datos',  href: '/cliente/perfil' },
  prestador:{ label: 'Mi panel',   href: '/prestador/dashboard' },
  admin:    { label: 'Panel admin',href: '/admin' },
}

const SETTINGS_LINK: Record<Role, string> = {
  cliente:  '/cliente/perfil',
  prestador:'/prestador/editar',
  admin:    '/admin',
}

function GearIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      className="h-5 w-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export function NavbarUserMenu({ nombre, foto_url, role }: Props) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)
  const inicial         = (nombre ?? '?').charAt(0).toUpperCase()
  const badge           = BADGE[role]
  const panelLink       = PANEL_LINK[role]

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative flex items-center gap-1">
      {/* Botón acceso rápido a configuración */}
      <Link
        href={SETTINGS_LINK[role]}
        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-low"
        aria-label="Configuración"
        title="Configuración"
      >
        <GearIcon />
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-surface-low"
        aria-label="Menú de usuario"
      >
        {/* Avatar */}
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-surface-highest flex-shrink-0">
          {foto_url ? (
            <Image src={foto_url} alt={nombre ?? ''} fill className="object-cover" sizes="32px" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-outline">
              {inicial}
            </span>
          )}
        </div>
        {/* Badge — oculto en mobile */}
        <span className={`hidden sm:inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
          {badge.label}
        </span>
      </button>

      {/* Dropdown — expande en el flujo normal, sin position: fixed */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-outline-variant bg-white py-1 shadow-card-hover z-30">
          {nombre && (
            <p className="truncate px-3 py-1.5 text-xs text-on-surface-variant border-b border-outline-variant mb-1">
              {nombre}
            </p>
          )}
          <Link
            href={panelLink.href}
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-on-surface hover:bg-surface-low transition"
          >
            {panelLink.label}
          </Link>
          <Link
            href={SETTINGS_LINK[role]}
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-sm text-on-surface hover:bg-surface-low transition"
          >
            Configuración
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="w-full text-left px-3 py-2 text-sm text-ds-error hover:bg-ds-error-container transition">
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
