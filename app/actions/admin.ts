'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/server'
import { verificarAdmin, auditarAccion } from '@/lib/admin'

// ─── PRESTADORES ─────────────────────────────────────────────

export async function toggleActivoPrestadorAdmin(id: string, nuevoEstado: boolean) {
  const { user } = await verificarAdmin()
  const admin = createAdminClient()
  await admin.from('prestadores').update({ activo: nuevoEstado }).eq('id', id)
  await auditarAccion(user.id, nuevoEstado ? 'activar_prestador' : 'pausar_prestador', id)
  revalidatePath('/admin/prestadores')
}

export async function suspenderPrestadorAdmin(id: string) {
  const { user } = await verificarAdmin()
  const admin = createAdminClient()
  const { data: snap } = await admin.from('prestadores').select('*').eq('id', id).single()
  await admin.from('prestadores').update({ activo: false, suspendido: true }).eq('id', id)
  await auditarAccion(user.id, 'suspender_prestador', id, snap ?? undefined)
  revalidatePath('/admin/prestadores')
}

export async function eliminarPrestadorAdmin(id: string) {
  const { user } = await verificarAdmin()
  const admin = createAdminClient()
  const { data: snap } = await admin.from('profiles').select('nombre, whatsapp').eq('id', id).single()

  // Eliminar usuario de auth (cascada borra profiles → prestadores → reseñas)
  await admin.auth.admin.deleteUser(id)

  await auditarAccion(user.id, 'eliminar_prestador', id, snap ?? undefined)
  revalidatePath('/admin/prestadores')
}

export async function guardarEdicionPrestadorAdmin(
  id: string,
  campos: {
    nombre?: string; whatsapp?: string; oficio?: string
    descripcion?: string; zonas_trabajo?: string[]
    activo?: boolean; verificado?: boolean; suspendido?: boolean
    notas_admin?: string; fecha_fin_gratuito?: string
  }
) {
  const { user } = await verificarAdmin()
  const admin = createAdminClient()

  const { nombre, whatsapp, ...prestadorCampos } = campos

  if (nombre || whatsapp) {
    await admin.from('profiles').update({ nombre, whatsapp }).eq('id', id)
  }
  await admin.from('prestadores').update(prestadorCampos).eq('id', id)
  await auditarAccion(user.id, 'editar_prestador_admin', id, campos)
  revalidatePath('/admin/prestadores')
  revalidatePath(`/prestador/${id}`)
}

export async function toggleMasivoPrestadores(ids: string[], nuevoEstado: boolean) {
  const { user } = await verificarAdmin()
  const admin = createAdminClient()
  await admin.from('prestadores').update({ activo: nuevoEstado }).in('id', ids)
  await auditarAccion(user.id, nuevoEstado ? 'activar_masivo' : 'pausar_masivo', ids[0], { ids })
  revalidatePath('/admin/prestadores')
}

// ─── CLIENTES ────────────────────────────────────────────────

export async function eliminarClienteAdmin(id: string) {
  const { user } = await verificarAdmin()
  const admin = createAdminClient()
  const { data: snap } = await admin.from('profiles').select('nombre').eq('id', id).single()
  await admin.auth.admin.deleteUser(id)
  await auditarAccion(user.id, 'eliminar_cliente', id, snap ?? undefined)
  revalidatePath('/admin/clientes')
}

// ─── RESEÑAS ─────────────────────────────────────────────────

export async function eliminarResenaAdmin(id: string) {
  const { user } = await verificarAdmin()
  const admin = createAdminClient()
  const { data: snap } = await admin.from('resenas').select('*').eq('id', id).single()
  await admin.from('resenas').delete().eq('id', id)
  await auditarAccion(user.id, 'eliminar_resena', id, snap ?? undefined)
  revalidatePath('/admin/resenas')
  revalidatePath('/admin/reportes')
}

// ─── REPORTES ────────────────────────────────────────────────

export async function resolverReporteAdmin(
  reporte_id: string,
  accion: 'eliminar_resena' | 'ignorar',
  resena_id?: string
) {
  const { user } = await verificarAdmin()
  const admin = createAdminClient()

  if (accion === 'eliminar_resena' && resena_id) {
    const { data: snap } = await admin.from('resenas').select('*').eq('id', resena_id).single()
    await admin.from('resenas').delete().eq('id', resena_id)
    await auditarAccion(user.id, 'eliminar_resena_via_reporte', resena_id, snap ?? undefined)
  }

  await admin.from('reportes_resenas')
    .update({ resuelto: true, resuelto_at: new Date().toISOString() })
    .eq('id', reporte_id)

  revalidatePath('/admin/reportes')
  revalidatePath('/admin/resenas')
}
