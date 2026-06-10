'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { verificarAdmin, auditarAccion } from '@/lib/admin'

// Helper — cast admin client to bypass new-column type checks until DB types regenerated
function db() {
  return createAdminClient() as any
}

// ─── PROPUESTAS ───────────────────────────────────────────────

export async function aprobarOficioPropuesto(prestador_id: string, nombre_oficio: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  await admin.from('oficios').upsert({ nombre: nombre_oficio, activo: true, es_base: false }, { onConflict: 'nombre' })

  await admin.from('prestadores')
    .update({ oficio: nombre_oficio, estado_oficio: 'aprobado', oficio_propuesto: null })
    .eq('id', prestador_id)

  await admin.from('notificaciones').insert({
    user_id: prestador_id,
    tipo: 'oficio_aprobado',
    mensaje: `Tu oficio "${nombre_oficio}" fue aprobado. Ya aparecés bien categorizado en BUSCO.`,
  })

  await auditarAccion(user.id, 'aprobar_oficio_propuesto', prestador_id, { nombre_oficio })
  revalidatePath('/admin/oficios')
  revalidatePath('/admin/prestadores')
}

export async function fusionarOficioPropuesto(prestador_id: string, oficio_propuesto: string, oficio_destino: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  await admin.from('prestadores')
    .update({ oficio: oficio_destino, oficio_fusionado: oficio_propuesto, estado_oficio: 'fusionado' })
    .eq('id', prestador_id)

  await admin.from('notificaciones').insert({
    user_id: prestador_id,
    tipo: 'oficio_fusionado',
    mensaje: `Tu oficio fue clasificado como "${oficio_destino}". Ya aparecés en búsquedas de esa categoría.`,
  })

  await auditarAccion(user.id, 'fusionar_oficio_propuesto', prestador_id, { oficio_propuesto, oficio_destino })
  revalidatePath('/admin/oficios')
  revalidatePath('/admin/prestadores')
}

export async function rechazarOficioPropuesto(prestador_id: string, oficio_propuesto: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  await admin.from('prestadores').update({ estado_oficio: 'rechazado' }).eq('id', prestador_id)

  await admin.from('notificaciones').insert({
    user_id: prestador_id,
    tipo: 'oficio_rechazado',
    mensaje: `Tu oficio propuesto no pudo ser aprobado. Por favor elegí uno de la lista disponible o proponé uno diferente.`,
  })

  await auditarAccion(user.id, 'rechazar_oficio_propuesto', prestador_id, { oficio_propuesto })
  revalidatePath('/admin/oficios')
}

// ─── GESTIÓN DE LISTA DE OFICIOS ─────────────────────────────

export async function crearOficio(nombre: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  const limpio = nombre.trim()
  if (!limpio) return { error: 'El nombre del oficio no puede estar vacío.' }
  if (limpio.length > 60) return { error: 'El nombre no puede superar los 60 caracteres.' }

  const { data: existe } = await admin.from('oficios').select('id').ilike('nombre', limpio).maybeSingle()
  if (existe) return { error: `Ya existe un oficio llamado "${limpio}".` }

  const { data: creado, error } = await admin
    .from('oficios')
    .insert({ nombre: limpio, activo: true, es_base: false })
    .select('id')
    .single()
  if (error) return { error: 'No se pudo crear el oficio.' }

  await auditarAccion(user.id, 'crear_oficio', creado.id, { nombre: limpio })
  revalidatePath('/admin/oficios')
  return { ok: true }
}

export async function toggleOficioActivo(id: string, activo: boolean) {
  const { user } = await verificarAdmin()
  const admin = db()
  await admin.from('oficios').update({ activo }).eq('id', id)
  await auditarAccion(user.id, activo ? 'activar_oficio' : 'desactivar_oficio', id)
  revalidatePath('/admin/oficios')
}

export async function renombrarOficio(id: string, nombre_actual: string, nuevo_nombre: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  const { data: existe } = await admin.from('oficios').select('id').eq('nombre', nuevo_nombre).single()
  if (existe) return { error: `Ya existe un oficio llamado "${nuevo_nombre}".` }

  await admin.from('oficios').update({ nombre: nuevo_nombre }).eq('id', id)
  await admin.from('prestadores').update({ oficio: nuevo_nombre }).eq('oficio', nombre_actual)

  const { data: afectados } = await admin
    .from('prestadores')
    .select('id, oficios')
    .contains('oficios', [nombre_actual])

  if (afectados) {
    for (const p of afectados) {
      const nuevosOficios = ((p.oficios as string[]) ?? []).map((o: string) =>
        o === nombre_actual ? nuevo_nombre : o
      )
      await admin.from('prestadores').update({ oficios: nuevosOficios }).eq('id', p.id)
    }
  }

  await auditarAccion(user.id, 'renombrar_oficio', id, { nombre_actual, nuevo_nombre })
  revalidatePath('/admin/oficios')
  revalidatePath('/buscar')
  return { ok: true }
}

export async function eliminarOficio(id: string, nombre: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  const { count } = await admin
    .from('prestadores')
    .select('id', { count: 'exact', head: true })
    .eq('oficio', nombre)

  if ((count ?? 0) > 0) {
    return { error: `No se puede eliminar: hay ${count} prestador${count === 1 ? '' : 'es'} con este oficio.` }
  }

  await admin.from('oficios').delete().eq('id', id)
  await auditarAccion(user.id, 'eliminar_oficio', id, { nombre })
  revalidatePath('/admin/oficios')
  return { ok: true }
}
