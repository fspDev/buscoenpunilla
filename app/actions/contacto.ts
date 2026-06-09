'use server'

import { createClient } from '@/lib/supabase/server'

// Registra un evento de contacto vía WhatsApp
export async function registrarContacto(prestador_id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  await supabase.from('contactos_log').insert({
    prestador_id,
    cliente_id: user?.id ?? null,
  })
}
