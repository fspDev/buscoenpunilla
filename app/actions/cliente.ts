'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type State = { error?: string; ok?: boolean } | null

export async function guardarPerfilClienteAction(_prev: State, formData: FormData): Promise<State> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado.' }

  const nombre    = (formData.get('nombre')    as string)?.trim()
  const localidad = formData.get('localidad') as string
  const whatsapp  = (formData.get('whatsapp')  as string)?.trim() || null

  if (!nombre) return { error: 'El nombre es requerido.' }

  const { error } = await supabase
    .from('profiles').update({ nombre, localidad: localidad || null, whatsapp }).eq('id', user.id)

  if (error) return { error: 'No se pudo guardar.' }
  revalidatePath('/cliente/perfil')
  return { ok: true }
}

export async function guardarFotoClienteAction(url: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').update({ foto_url: url } as never).eq('id', user.id)
  revalidatePath('/cliente/perfil')
}

export async function cambiarRolAction(nuevoRol: 'cliente' | 'prestador') {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autorizado')

  if (nuevoRol === 'prestador') {
    // 1. Obtener localidad actual
    const { data: profile } = await supabase
      .from('profiles')
      .select('localidad')
      .eq('id', user.id)
      .single()

    const localidad = profile?.localidad ?? null

    // 2. Actualizar rol a prestador
    await supabase.from('profiles').update({ role: 'prestador' }).eq('id', user.id)

    // 3. Crear registro en tabla prestadores si no existe
    const { data: prestador } = await supabase
      .from('prestadores')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!prestador) {
      await supabase.from('prestadores').insert({
        id: user.id,
        oficio: 'Otro',
        oficios: ['Otro'],
        activo: true,
        verificado: false,
        zonas_trabajo: localidad ? [localidad] : null
      })
    } else {
      await supabase.from('prestadores').update({ activo: true }).eq('id', user.id)
    }
  } else if (nuevoRol === 'cliente') {
    // 1. Actualizar rol a cliente
    await supabase.from('profiles').update({ role: 'cliente' }).eq('id', user.id)

    // 2. Pausar el prestador para ocultarlo de búsquedas públicas
    await supabase.from('prestadores').update({ activo: false }).eq('id', user.id)
  }

  revalidatePath('/cliente/perfil')
  revalidatePath('/prestador/editar')
  revalidatePath('/prestador/dashboard')
}
