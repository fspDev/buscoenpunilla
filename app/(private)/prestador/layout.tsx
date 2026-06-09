import { createClient } from '@/lib/supabase/server'
import { requireRole } from '@/lib/auth'
import { PrestadorSidebar } from '@/components/PrestadorSidebar'

export default async function PrestadorLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireRole('prestador')

  const supabase = createClient()
  const { data: prestador } = await supabase
    .from('prestadores')
    .select('activo')
    .eq('id', user.id)
    .single()

  const activo = prestador?.activo ?? true

  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      <PrestadorSidebar
        prestador_id={user.id}
        nombre={profile?.nombre ?? ''}
        activo={activo}
      />
      {/* pb-16 en mobile para dejar espacio a la bottom nav */}
      <div className="min-w-0 flex-1 bg-surface pb-16 md:pb-0">
        {children}
      </div>
    </div>
  )
}
