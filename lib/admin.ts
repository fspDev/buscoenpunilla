import { createClient, createAdminClient } from '@/lib/supabase/server'

// Verifica que el usuario sea admin. Lanza error si no lo es.
// Llamar al inicio de cada Server Action del panel admin.
export async function verificarAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  const { data: profile } = await supabase
    .from('profiles').select('role, nombre').eq('id', user.id).single()

  if (profile?.role !== 'admin') throw new Error('No autorizado')

  return { user, profile }
}

// Registra una acción destructiva en la tabla de auditoría
export async function auditarAccion(
  admin_id: string,
  accion: string,
  entidad_id: string,
  detalle?: Record<string, unknown>
) {
  const supabase = createAdminClient()
  await supabase.from('auditoria_admin').insert({
    admin_id,
    accion,
    entidad_id,
    detalle: detalle ?? null,
  })
}
