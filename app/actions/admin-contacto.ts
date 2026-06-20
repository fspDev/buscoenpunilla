'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { verificarAdmin } from '@/lib/admin'

// Cast para insertar en tablas aún no incluidas en los tipos (notificaciones)
function db() {
  return createAdminClient() as any
}

function revalidar() {
  revalidatePath('/admin/contacto')
  revalidatePath('/admin/reportes')
  revalidatePath('/admin')
}

// ─── Marcar leído / no leído ─────────────────────────────────
export async function setLeidoMensaje(id: string, leido: boolean) {
  await verificarAdmin()
  const supabase = createAdminClient()
  await supabase.from('mensajes_contacto').update({ leido }).eq('id', id)
  revalidar()
}

// Compat: usado por algún <form action=...>
export async function marcarLeidoAction(formData: FormData) {
  await verificarAdmin()
  const id = formData.get('id') as string
  const supabase = createAdminClient()
  await supabase.from('mensajes_contacto').update({ leido: true }).eq('id', id)
  revalidar()
}

// ─── Eliminar mensaje / reporte ──────────────────────────────
export async function eliminarMensaje(id: string) {
  await verificarAdmin()
  const supabase = createAdminClient()
  await supabase.from('mensajes_contacto').delete().eq('id', id)
  revalidar()
}

// ─── Responder al usuario registrado (notificación in-app) ───
// Crea una notificación para el usuario que hizo el reporte/mensaje
// (solo si está registrado) y marca el mensaje como leído.
export async function responderUsuario(
  id: string,
  texto: string
): Promise<{ ok?: boolean; error?: string }> {
  await verificarAdmin()
  const t = texto?.trim()
  if (!t) return { error: 'Escribí una respuesta.' }

  const supabase = db()
  const { data: msg } = await supabase
    .from('mensajes_contacto')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!msg?.user_id) {
    return { error: 'Este mensaje no tiene un usuario registrado asociado.' }
  }

  const { error } = await supabase.from('notificaciones').insert({
    user_id: msg.user_id,
    tipo: 'respuesta_soporte',
    mensaje: t,
  })
  if (error) return { error: 'No se pudo enviar la respuesta.' }

  await supabase.from('mensajes_contacto').update({ leido: true }).eq('id', id)
  revalidar()
  return { ok: true }
}
