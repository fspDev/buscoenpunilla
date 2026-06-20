'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'

// Elimina DEFINITIVAMENTE la cuenta del usuario autenticado.
// Borra el usuario de auth.users; las tablas relacionadas (profiles,
// prestadores, resenas, notificaciones, fotos, etc.) se eliminan en
// cascada por las FK ON DELETE CASCADE del esquema.
export async function eliminarCuentaAction(): Promise<{ error: string } | void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { error: 'No se pudo eliminar la cuenta. Intentá de nuevo.' }

  // Cerrar sesión (limpiar cookies) y volver al inicio.
  await supabase.auth.signOut()
  redirect('/')
}
