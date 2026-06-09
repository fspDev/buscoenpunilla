'use server'

import { createClient } from '@/lib/supabase/server'

type State = { error?: string; ok?: boolean; email?: string } | null

export async function createContactoAction(_prev: State, formData: FormData): Promise<State> {
  const nombre  = (formData.get('nombre')  as string)?.trim()
  const email   = (formData.get('email')   as string)?.trim()
  const tipo    = formData.get('tipo')    as string
  const mensaje = (formData.get('mensaje') as string)?.trim()

  if (!nombre || !email || !tipo || !mensaje) return { error: 'Completá todos los campos.' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('mensajes_contacto').insert({
    nombre, email, tipo, mensaje,
    user_id: user?.id ?? null,
  })

  if (error) return { error: 'No se pudo enviar el mensaje. Intentá de nuevo.' }
  return { ok: true, email }
}
