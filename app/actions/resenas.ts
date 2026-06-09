'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { NuevaResenaPublica } from '@/types'

type ActionState = { error: string } | null

// ─── CREAR RESEÑA ─────────────────────────────────────────────
export async function crearResenaAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debés iniciar sesión para dejar una reseña.' }

  const prestador_id = formData.get('prestador_id') as string
  const estrellas    = Number(formData.get('estrellas'))
  const comentario   = (formData.get('comentario') as string)?.trim() || null

  if (!estrellas || estrellas < 1 || estrellas > 5) {
    return { error: 'Seleccioná una cantidad de estrellas.' }
  }

  // Verificar que el cliente contactó al prestador
  const { data: contacto } = await supabase
    .from('contactos_log')
    .select('id')
    .eq('prestador_id', prestador_id)
    .eq('cliente_id', user.id)
    .limit(1)
    .single()

  if (!contacto) {
    return { error: 'Solo podés reseñar a prestadores que contactaste.' }
  }

  const { error } = await supabase.from('resenas').insert({
    prestador_id,
    cliente_id: user.id,
    estrellas,
    comentario,
  })

  if (error) {
    if (error.code === '23505') return { error: 'Ya dejaste una reseña para este prestador.' }
    if (error.code === '23514') return { error: 'No podés reseñarte a vos mismo.' }
    return { error: 'No se pudo publicar la reseña. Intentá de nuevo.' }
  }

  redirect(`/prestador/${prestador_id}?resena=publicada`)
}

// ─── RESPONDER RESEÑA (prestador) ────────────────────────────
export async function responderResenaAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const resena_id  = formData.get('resena_id') as string
  const respuesta  = (formData.get('respuesta') as string)?.trim()

  if (!respuesta) return { error: 'Escribí una respuesta.' }
  if (respuesta.length > 300) return { error: 'La respuesta no puede superar los 300 caracteres.' }

  // Solo el prestador dueño puede responder
  const { data: resena } = await supabase
    .from('resenas')
    .select('prestador_id')
    .eq('id', resena_id)
    .single()

  if (resena?.prestador_id !== user.id) {
    return { error: 'No tenés permiso para responder esta reseña.' }
  }

  const { error } = await supabase
    .from('resenas')
    .update({ respuesta_prestador: respuesta })
    .eq('id', resena_id)

  if (error) return { error: 'No se pudo guardar la respuesta.' }

  return null
}

// ─── PUBLICAR RESEÑA PÚBLICA (sin login) ─────────────────────
export async function publicarResenaPublicaAction(
  data: NuevaResenaPublica
): Promise<{ error?: string; success?: boolean }> {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const admin = createAdminClient() as any

  if (!data.estrellas || data.estrellas < 1 || data.estrellas > 5)
    return { error: 'Seleccioná una calificación.' }
  if (!data.cliente_nombre?.trim())
    return { error: 'Ingresá tu nombre.' }
  if (!data.cliente_email?.trim())
    return { error: 'Ingresá tu email.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.cliente_email))
    return { error: 'El email no es válido.' }

  const email = data.cliente_email.toLowerCase().trim()

  // Verificar que el prestador existe
  const { data: prestador } = await admin
    .from('prestadores')
    .select('id')
    .eq('id', data.prestador_id)
    .single()

  if (!prestador) return { error: 'El prestador no existe.' }

  // Verificar email duplicado
  const { data: existente } = await admin
    .from('resenas')
    .select('id')
    .eq('prestador_id', data.prestador_id)
    .eq('cliente_email', email)
    .maybeSingle()

  if (existente) return { error: 'duplicado' }

  const { error } = await admin.from('resenas').insert({
    prestador_id:   data.prestador_id,
    cliente_id:     null,
    cliente_nombre: data.cliente_nombre.trim(),
    cliente_email:  email,
    estrellas:      data.estrellas,
    comentario:     data.comentario?.trim() || null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'duplicado' }
    return { error: 'No se pudo publicar la reseña. Intentá de nuevo.' }
  }

  return { success: true }
}

// ─── REPORTAR RESEÑA ─────────────────────────────────────────
export async function reportarResenaAction(resena_id: string, motivo: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Debés iniciar sesión para reportar.' }

  const { error } = await supabase.from('reportes_resenas').insert({
    resena_id,
    reportado_por: user.id,
    motivo,
  })
  if (error) return { error: 'No se pudo enviar el reporte. Intentá de nuevo.' }
  return {}
}
