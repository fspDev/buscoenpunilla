'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'

export async function marcarNotificacionLeida(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await (supabase as any).from('notificaciones').update({ leida: true }).eq('id', id).eq('user_id', user.id)
}

export async function marcarTodasLeidas() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await (supabase as any).from('notificaciones').update({ leida: true }).eq('user_id', user.id)
}
