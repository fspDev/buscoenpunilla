'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { verificarAdmin } from '@/lib/admin'

export async function marcarLeidoAction(formData: FormData) {
  await verificarAdmin()
  const supabase = createClient()
  const id = formData.get('id') as string
  await supabase.from('mensajes_contacto').update({ leido: true }).eq('id', id)
  revalidatePath('/admin/contacto')
}
