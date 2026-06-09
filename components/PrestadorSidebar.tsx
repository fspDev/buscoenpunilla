'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NotificacionBell } from '@/components/NotificacionBell'

interface Props {
  prestador_id: string
  nombre: string
  activo: boolean
}

const NAV = [
  { href: '/prestador/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/prestador/editar',    label: 'Mi perfil',  icon: '✏️'  },
  { href: '/prestador/resenas',   label: 'Reseñas',    icon: '⭐'  },
]

export function PrestadorSidebar({ prestador_id, nombre, activo }: Props) {
  const pathname = usePathname()

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden w-56 flex-shrink-0 border-r border-outline-variant bg-white md:flex md:flex-col">
        <div className="border-b border-outline-variant px-5 py-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-on-surface-variant">Panel del prestador</p>
              <p className="mt-0.5 font-semibold text-on-surface truncate">{nombre}</p>
              <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${activo ? 'bg-secondary-container text-secondary-on' : 'bg-ds-error-container text-ds-error'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${activo ? 'bg-secondary' : 'bg-ds-error'}`} />
                {activo ? 'Activo' : 'Pausado'}
              </span>
            </div>
            <NotificacionBell userId={prestador_id} />
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === href
                  ? 'bg-surface-low text-primary-container'
                  : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
              }`}
            >
              <span className="text-base leading-none">{icon}</span>
              {label}
            </Link>
          ))}

          {/* Suscripción — desactivado */}
          <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-outline cursor-not-allowed">
            <span className="flex items-center gap-2.5">
              <span className="text-base leading-none">💳</span>
              Suscripción
            </span>
            <span className="rounded-full bg-surface-highest px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant">
              Pronto
            </span>
          </div>
        </nav>

        <div className="mt-auto border-t border-outline-variant p-3">
          <Link
            href={`/prestador/${prestador_id}`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-low transition"
          >
            <span>↗</span> Ver perfil público
          </Link>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-outline-variant bg-white md:hidden">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition ${
              pathname === href ? 'text-primary-container' : 'text-on-surface-variant'
            }`}
          >
            <span className="text-xl leading-none">{icon}</span>
            {label}
          </Link>
        ))}
        <Link
          href="/prestador/suscripcion"
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs text-outline"
        >
          <span className="text-xl leading-none">💳</span>
          Suscripción
        </Link>
      </nav>
    </>
  )
}
