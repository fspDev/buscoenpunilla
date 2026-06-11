'use server'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { verificarAdmin, auditarAccion } from '@/lib/admin'

// Helper — cast admin client to bypass new-column type checks until DB types regenerated
function db() {
  return createAdminClient() as any
}

// Agrega una zona al array zonas_trabajo del prestador sin duplicar
async function agregarZonaAlPrestador(admin: any, prestador_id: string, zona: string) {
  const { data: p } = await admin
    .from('prestadores')
    .select('zonas_trabajo')
    .eq('id', prestador_id)
    .single()

  const actuales: string[] = (p?.zonas_trabajo as string[]) ?? []
  if (!actuales.includes(zona)) {
    await admin.from('prestadores').update({ zonas_trabajo: [...actuales, zona] }).eq('id', prestador_id)
  }
}

// ─── PROPUESTAS ───────────────────────────────────────────────

export async function aprobarZonaPropuesta(
  prestador_id: string,
  nombre_original: string,
  nombre_editado: string,
) {
  const { user } = await verificarAdmin()
  const admin = db()

  const nombre = nombre_editado.trim() || nombre_original

  await admin.from('zonas').upsert({ nombre, activo: true, es_base: false }, { onConflict: 'nombre' })

  await agregarZonaAlPrestador(admin, prestador_id, nombre)
  await admin.from('prestadores')
    .update({ estado_zona: 'aprobado', zona_propuesta: null })
    .eq('id', prestador_id)

  await admin.from('notificaciones').insert({
    user_id: prestador_id,
    tipo: 'zona_aprobada',
    mensaje: `Tu zona "${nombre}" fue aprobada. Ya aparecés en búsquedas de esa zona.`,
  })

  await auditarAccion(user.id, 'aprobar_zona_propuesta', prestador_id, { nombre_original, nombre_aprobado: nombre })
  revalidatePath('/admin/zonas')
  revalidatePath('/admin/prestadores')
}

export async function fusionarZonaPropuesta(prestador_id: string, zona_propuesta: string, zona_destino: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  await agregarZonaAlPrestador(admin, prestador_id, zona_destino)
  await admin.from('prestadores')
    .update({ estado_zona: 'fusionado', zona_propuesta: null })
    .eq('id', prestador_id)

  await admin.from('notificaciones').insert({
    user_id: prestador_id,
    tipo: 'zona_fusionada',
    mensaje: `Tu zona fue clasificada como "${zona_destino}". Ya aparecés en búsquedas de esa zona.`,
  })

  await auditarAccion(user.id, 'fusionar_zona_propuesta', prestador_id, { zona_propuesta, zona_destino })
  revalidatePath('/admin/zonas')
  revalidatePath('/admin/prestadores')
}

export async function rechazarZonaPropuesta(prestador_id: string, zona_propuesta: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  await admin.from('prestadores').update({ estado_zona: 'rechazado', zona_propuesta: null }).eq('id', prestador_id)

  await admin.from('notificaciones').insert({
    user_id: prestador_id,
    tipo: 'zona_rechazada',
    mensaje: `Tu zona propuesta no pudo ser aprobada. Por favor elegí una de la lista disponible o proponé una diferente.`,
  })

  await auditarAccion(user.id, 'rechazar_zona_propuesta', prestador_id, { zona_propuesta })
  revalidatePath('/admin/zonas')
}

// ─── GESTIÓN DE LISTA DE ZONAS ───────────────────────────────

export async function crearZona(nombre: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  const limpio = nombre.trim()
  if (!limpio) return { error: 'El nombre de la zona no puede estar vacío.' }
  if (limpio.length > 60) return { error: 'El nombre no puede superar los 60 caracteres.' }

  const { data: existe } = await admin.from('zonas').select('id').ilike('nombre', limpio).maybeSingle()
  if (existe) return { error: `Ya existe una zona llamada "${limpio}".` }

  const { data: creado, error } = await admin
    .from('zonas')
    .insert({ nombre: limpio, activo: true, es_base: false })
    .select('id')
    .single()
  if (error) return { error: 'No se pudo crear la zona.' }

  await auditarAccion(user.id, 'crear_zona', creado.id, { nombre: limpio })
  revalidatePath('/admin/zonas')
  return { ok: true }
}

export async function toggleZonaActiva(id: string, activo: boolean) {
  const { user } = await verificarAdmin()
  const admin = db()
  await admin.from('zonas').update({ activo }).eq('id', id)
  await auditarAccion(user.id, activo ? 'activar_zona' : 'desactivar_zona', id)
  revalidatePath('/admin/zonas')
}

export async function renombrarZona(id: string, nombre_actual: string, nuevo_nombre: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  const limpio = nuevo_nombre.trim()
  if (!limpio) return { error: 'El nombre no puede estar vacío.' }

  const { data: existe } = await admin.from('zonas').select('id').eq('nombre', limpio).single()
  if (existe) return { error: `Ya existe una zona llamada "${limpio}".` }

  await admin.from('zonas').update({ nombre: limpio }).eq('id', id)

  // Reemplazar el nombre en el array zonas_trabajo de los prestadores afectados
  const { data: afectados } = await admin
    .from('prestadores')
    .select('id, zonas_trabajo')
    .contains('zonas_trabajo', [nombre_actual])

  if (afectados) {
    for (const p of afectados) {
      const nuevasZonas = ((p.zonas_trabajo as string[]) ?? []).map((z: string) =>
        z === nombre_actual ? limpio : z
      )
      await admin.from('prestadores').update({ zonas_trabajo: nuevasZonas }).eq('id', p.id)
    }
  }

  await auditarAccion(user.id, 'renombrar_zona', id, { nombre_actual, nuevo_nombre: limpio })
  revalidatePath('/admin/zonas')
  revalidatePath('/buscar')
  return { ok: true }
}

export async function eliminarZona(id: string, nombre: string) {
  const { user } = await verificarAdmin()
  const admin = db()

  // Quitar la zona del array zonas_trabajo de los prestadores afectados
  const { data: afectados } = await admin
    .from('prestadores')
    .select('id, zonas_trabajo')
    .contains('zonas_trabajo', [nombre])

  let reasignados = 0
  if (afectados) {
    reasignados = afectados.length
    for (const p of afectados) {
      const nuevasZonas = ((p.zonas_trabajo as string[]) ?? []).filter((z: string) => z !== nombre)
      await admin.from('prestadores').update({ zonas_trabajo: nuevasZonas }).eq('id', p.id)
    }
  }

  const { error } = await admin.from('zonas').delete().eq('id', id)
  if (error) return { error: 'No se pudo eliminar la zona.' }

  await auditarAccion(user.id, 'eliminar_zona', id, { nombre, prestadores_afectados: reasignados })
  revalidatePath('/admin/zonas')
  revalidatePath('/buscar')
  return { ok: true }
}
