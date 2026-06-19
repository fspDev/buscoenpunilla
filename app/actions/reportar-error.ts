'use server'

import { createClient } from '@/lib/supabase/server'

type State = { error?: string; ok?: boolean } | null

// ⚠️ TEMPORAL (beta): reporte de errores. Quitar antes del lanzamiento.
// Ver componente components/ReportarErrorButton.tsx y su montaje en app/layout.tsx
export async function reportarErrorAction(_prev: State, formData: FormData): Promise<State> {
  const detalle = (formData.get('detalle') as string)?.trim()
  const ruta    = (formData.get('ruta')    as string)?.trim() || '—'

  if (!detalle) return { error: 'Contanos qué pasó.' }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let nombre = 'Reporte de error (beta)'
  let email  = 'beta@buscoenpunilla.com.ar'
  if (user) {
    email = user.email ?? email
    const { data: profile } = await supabase
      .from('profiles').select('nombre').eq('id', user.id).single()
    if (profile?.nombre) nombre = profile.nombre
  }

  const mensaje = `🐞 REPORTE DE ERROR (beta)\nPágina: ${ruta}\n\n${detalle}`

  const { error } = await supabase.from('mensajes_contacto').insert({
    nombre,
    email,
    tipo: 'Error / Bug',
    mensaje,
    user_id: user?.id ?? null,
  })

  if (error) return { error: 'No se pudo enviar el reporte. Probá de nuevo.' }
  return { ok: true }
}
