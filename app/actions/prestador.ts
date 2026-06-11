'use server'

import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'

type ActionState = { error?: string; ok?: boolean } | null

// ─── GUARDAR PERFIL (texto) ───────────────────────────────────
export async function guardarPerfilAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const nombre          = (formData.get('nombre') as string)?.trim()
  const whatsapp        = (formData.get('whatsapp') as string)?.trim()
  const descripcion     = (formData.get('descripcion') as string)?.trim() || null
  const zonas           = formData.getAll('zonas') as string[]
  const matricula       = (formData.get('matricula') as string)?.trim() || null
  const oficio_propuesto = ((formData.get('oficio_propuesto') as string) || '').trim() || null

  let oficios: string[] = []
  try {
    oficios = JSON.parse((formData.get('oficios_json') as string) || '[]')
  } catch { oficios = [] }

  if (!nombre)   return { error: 'El nombre es requerido.' }
  if (!whatsapp) return { error: 'El WhatsApp es requerido.' }
  if (oficios.length === 0 && !oficio_propuesto) return { error: 'Seleccioná al menos un oficio.' }

  if (oficios.length === 0 && oficio_propuesto) oficios = ['Otro']

  const oficio = oficios[0] || 'Otro'

  const { error: errProfile } = await supabase
    .from('profiles')
    .update({ nombre, whatsapp })
    .eq('id', user.id)

  if (errProfile) return { error: 'No se pudo actualizar el perfil.' }

  const prestadorUpdate: Record<string, unknown> = {
    oficio,
    oficios,
    descripcion,
    zonas_trabajo: zonas.length ? zonas : null,
    matricula,
  }

  if (oficio_propuesto) {
    prestadorUpdate.oficio_propuesto = oficio_propuesto
    prestadorUpdate.estado_oficio    = 'pendiente'
  } else {
    // Si cambió a oficio de lista, limpiar propuesta anterior y marcar aprobado
    prestadorUpdate.oficio_propuesto = null
    prestadorUpdate.estado_oficio    = 'aprobado'
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any
  const { error: errPrestador } = await admin
    .from('prestadores')
    .update(prestadorUpdate)
    .eq('id', user.id)

  if (errPrestador) return { error: 'No se pudieron guardar los cambios. Intentá de nuevo en unos segundos.' }

  revalidatePath('/prestador/editar')
  revalidatePath(`/prestador/${user.id}`)
  return { ok: true }
}

// ─── GUARDAR URL DE FOTO DE PERFIL ───────────────────────────
export async function guardarFotoPerfilAction(url: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase.from('prestadores').update({ foto_url: url }).eq('id', user.id)
  if (error) return { error: 'No se pudo guardar la foto de perfil.' }

  revalidatePath('/prestador/editar')
  revalidatePath(`/prestador/${user.id}`)
  return {}
}

// ─── AGREGAR FOTO DE TRABAJO ─────────────────────────────────
export async function agregarFotoTrabajoAction(url: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase.from('fotos_trabajos').insert({ prestador_id: user.id, url })
  if (error) return { error: 'No se pudo agregar la foto.' }

  revalidatePath('/prestador/editar')
  revalidatePath(`/prestador/${user.id}`)
  return {}
}

// ─── ELIMINAR FOTO DE TRABAJO ────────────────────────────────
export async function eliminarFotoTrabajoAction(foto_id: string, storage_path: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('fotos_trabajos').delete().eq('id', foto_id).eq('prestador_id', user.id)

  // Intentar eliminar del storage (puede fallar si la URL es externa)
  if (storage_path) {
    await supabase.storage.from('fotos-trabajos').remove([storage_path])
  }

  revalidatePath('/prestador/editar')
  revalidatePath(`/prestador/${user.id}`)
}

// ─── TOGGLE ACTIVO / PAUSADO ─────────────────────────────────
export async function toggleActivoAction(nuevoEstado: boolean): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const { error } = await supabase.from('prestadores').update({ activo: nuevoEstado }).eq('id', user.id)
  if (error) return { error: 'No se pudo cambiar el estado del perfil.' }

  revalidatePath('/prestador/dashboard')
  revalidatePath('/prestador/editar')
  return {}
}
