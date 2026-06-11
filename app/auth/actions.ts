'use server'

import { redirect } from 'next/navigation'
import { getDatabase } from '@/lib/db'

type ActionState = { error: string } | null

// ─── LOGIN ────────────────────────────────────────────────────
export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Completá todos los campos.' }
  }

  const db = getDatabase()
  const resultado = await db.loginUsuario(email, password)

  if (!resultado) {
    return { error: 'Email o contraseña incorrectos.' }
  }

  if (resultado.usuario.role === 'prestador') redirect('/prestador/dashboard')
  if (resultado.usuario.role === 'admin') redirect('/admin')
  redirect('/')
}

// ─── REGISTRO CLIENTE ─────────────────────────────────────────
export async function registroClienteAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nombre = formData.get('nombre') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const localidad = formData.get('localidad') as string
  const whatsapp = formData.get('whatsapp') as string
  const terminos = formData.get('terminos')

  if (!nombre || !email || !password || !localidad) {
    return { error: 'Completá los campos requeridos.' }
  }
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }
  if (!terminos) {
    return { error: 'Debés aceptar los Términos y Condiciones para continuar.' }
  }

  const db = getDatabase()
  const usuario = await db.registroCliente(nombre, email, password, localidad, whatsapp)

  if (!usuario) {
    return { error: 'No se pudo crear la cuenta.' }
  }

  redirect('/')
}

// ─── REGISTRO PRESTADOR ───────────────────────────────────────
export async function registroPrestadorAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const nombre          = formData.get('nombre') as string
  const email           = formData.get('email') as string
  const password        = formData.get('password') as string
  const zonas           = formData.getAll('zonas') as string[]
  const whatsapp        = formData.get('whatsapp') as string
  const descripcion     = (formData.get('descripcion') as string) || undefined
  const terminos        = formData.get('terminos')
  const oficio_propuesto = ((formData.get('oficio_propuesto') as string) || '').trim() || null
  const zona_propuesta  = ((formData.get('zona_propuesta') as string) || '').trim() || null

  let oficios: string[] = []
  try {
    oficios = JSON.parse((formData.get('oficios_json') as string) || '[]')
  } catch { oficios = [] }

  if (!nombre || !email || !password || !whatsapp) {
    return { error: 'Completá todos los campos requeridos.' }
  }
  if (oficios.length === 0 && !oficio_propuesto) {
    return { error: 'Seleccioná al menos un oficio.' }
  }
  if (zonas.length === 0 && !zona_propuesta) {
    return { error: 'Seleccioná al menos una zona.' }
  }
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' }
  }
  if (!terminos) {
    return { error: 'Debés aceptar los Términos y Condiciones para continuar.' }
  }

  // Si hay propuesta de oficio y no eligió ninguno de la lista, poner "Otro"
  if (oficios.length === 0 && oficio_propuesto) oficios = ['Otro']

  const db = getDatabase()
  const usuario = await db.registroPrestador(
    nombre,
    email,
    password,
    oficios[0],
    zonas,
    whatsapp,
    descripcion
  )

  if (!usuario) {
    return { error: 'No se pudo crear la cuenta.' }
  }

  // Si hay propuesta de oficio o zona, actualizar el registro usando service_role
  if (oficio_propuesto || zona_propuesta) {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const admin = createAdminClient()
    const update: Record<string, unknown> = {}
    if (oficio_propuesto) {
      update.oficio_propuesto = oficio_propuesto
      update.estado_oficio    = 'pendiente'
    }
    if (zona_propuesta) {
      update.zona_propuesta = zona_propuesta
      update.estado_zona    = 'pendiente'
      // Si no eligió zonas de la lista, limpiar el array (el trigger pudo dejar [''])
      if (zonas.length === 0) update.zonas_trabajo = []
      else update.zonas_trabajo = zonas
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('prestadores') as any)
      .update(update)
      .eq('id', usuario.id)
  }

  redirect('/prestador/dashboard')
}

// ─── RECUPERAR CONTRASEÑA ─────────────────────────────────────
export async function recuperarAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string

  if (!email) return { error: 'Ingresá tu email.' }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)

  // No revelamos si el email existe o no (evita enumeración de cuentas)
  if (error) return { error: 'No se pudo procesar el pedido. Intentá de nuevo.' }

  redirect('/auth/recuperar?enviado=1')
}

// ─── LOGOUT ───────────────────────────────────────────────────
export async function logoutAction() {
  const db = getDatabase()
  await db.logoutUsuario()
  redirect('/')
}
