import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import { AdminNavLinks } from './AdminNavLinks'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole('admin')
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ count: pendingOficios }, { count: pendingZonas }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('prestadores').select('id', { count: 'exact', head: true }) as any).eq('estado_oficio', 'pendiente'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('prestadores').select('id', { count: 'exact', head: true }) as any).eq('estado_zona', 'pendiente'),
  ])

  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      {/* Sidebar */}
      <aside className="hidden w-52 flex-shrink-0 border-r border-outline-variant bg-white md:flex md:flex-col">
        <div className="border-b border-outline-variant px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">Admin</p>
          <p className="mt-0.5 truncate text-sm font-medium text-on-surface">{profile?.nombre}</p>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          <AdminNavLinks pendingOficiosCount={pendingOficios ?? 0} pendingZonasCount={pendingZonas ?? 0} />
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
  )
}
