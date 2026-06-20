import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminNavLinks } from './AdminNavLinks'
import { AdminMobileNav } from './AdminMobileNav'

// El panel admin siempre debe mostrar datos frescos: las consultas SELECT de
// Supabase son GET y Next.js las cachea por defecto (Data Cache), lo que hacía
// que mensajes/clientes nuevos no aparecieran. force-dynamic desactiva ese caché.
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole('admin')
  const admin = createAdminClient()

  const [
    { count: pendingOficios },
    { count: pendingZonas },
    { count: contactosNoLeidos },
    { count: reportesPendientes },
    { count: erroresNoLeidos },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] = await Promise.all<any>([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('prestadores').select('id', { count: 'exact', head: true }) as any).eq('estado_oficio', 'pendiente'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('prestadores').select('id', { count: 'exact', head: true }) as any).eq('estado_zona', 'pendiente'),
    // Contactos reales sin leer (excluye reportes de error)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('mensajes_contacto').select('id', { count: 'exact', head: true }) as any).neq('tipo', 'Error / Bug').eq('leido', false),
    // Reseñas reportadas sin resolver
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('reportes_resenas').select('id', { count: 'exact', head: true }) as any).eq('resuelto', false),
    // Reportes de error sin leer
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('mensajes_contacto').select('id', { count: 'exact', head: true }) as any).eq('tipo', 'Error / Bug').eq('leido', false),
  ])

  const navCounts = {
    pendingOficiosCount: pendingOficios ?? 0,
    pendingZonasCount: pendingZonas ?? 0,
    contactosNoLeidosCount: contactosNoLeidos ?? 0,
    reportesPendientesCount: (reportesPendientes ?? 0) + (erroresNoLeidos ?? 0),
  }

  return (
    <div>
      {/* Navegación mobile (barra superior + drawer) */}
      <AdminMobileNav nombre={profile?.nombre ?? ''} {...navCounts} />

      <div className="flex min-h-[calc(100vh-57px)]">
      {/* Sidebar desktop */}
      <aside className="hidden w-52 flex-shrink-0 border-r border-outline-variant bg-white md:flex md:flex-col">
        <div className="border-b border-outline-variant px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">Admin</p>
          <p className="mt-0.5 truncate text-sm font-medium text-on-surface">{profile?.nombre}</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          <AdminNavLinks {...navCounts} />
        </nav>
        <div className="mt-auto border-t border-outline-variant p-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-low transition"
          >
            ↗ Ver sitio
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <main className="min-w-0 flex-1 bg-surface overflow-auto">
        {children}
      </main>
      </div>
    </div>
  )
}
