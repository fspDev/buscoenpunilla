import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/types/database'

export async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { user, profile }
}

// Redirige a login si no hay sesión activa
export async function requireAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  return user
}

// Redirige si el usuario no tiene el rol requerido.
// Los admins pasan siempre — son consistente con lo que permite el middleware.
export async function requireRole(role: Role) {
  const data = await getUser()
  if (!data) redirect('/auth/login')
  const userRole = data.profile?.role
  if (userRole !== role && userRole !== 'admin') redirect('/')
  return data
}
