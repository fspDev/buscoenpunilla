'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  pendingOficiosCount?: number
  pendingZonasCount?: number
}

const BASE_LINKS = [
  { href: '/admin',             label: 'Dashboard',   icon: '📊' },
  { href: '/admin/prestadores', label: 'Prestadores', icon: '🔧' },
  { href: '/admin/clientes',    label: 'Clientes',    icon: '👤' },
  { href: '/admin/resenas',     label: 'Reseñas',     icon: '⭐' },
  { href: '/admin/reportes',    label: 'Reportes',    icon: '🚩' },
  { href: '/admin/oficios',     label: 'Oficios',     icon: '🗂️' },
  { href: '/admin/zonas',       label: 'Zonas',       icon: '📍' },
  { href: '/admin/metricas',    label: 'Métricas',    icon: '📈' },
  { href: '/admin/contacto',    label: 'Contacto',    icon: '✉️'  },
]

export function AdminNavLinks({ pendingOficiosCount = 0, pendingZonasCount = 0 }: Props) {
  const pathname = usePathname()

  return (
    <>
      {BASE_LINKS.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition ${
            pathname === href
              ? 'bg-surface-low font-medium text-primary-container'
              : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">{icon}</span>
            {label}
          </span>
          {href === '/admin/oficios' && pendingOficiosCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {pendingOficiosCount}
            </span>
          )}
          {href === '/admin/zonas' && pendingZonasCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {pendingZonasCount}
            </span>
          )}
        </Link>
      ))}
    </>
  )
}
