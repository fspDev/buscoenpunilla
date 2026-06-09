import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Vercel Cron Job — se ejecuta diariamente a las 9:00 UTC
// Pausa automáticamente los prestadores cuyo período de prueba venció
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const ahora = new Date().toISOString()

  const { data, error } = await supabase
    .from('prestadores')
    .update({ activo: false })
    .not('fecha_fin_gratuito', 'is', null)
    .lt('fecha_fin_gratuito', ahora)
    .eq('activo', true)
    .eq('suspendido', false)
    .select('id')

  if (error) {
    console.error('[cron/pausar-expirados]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const pausados = data?.length ?? 0
  console.log(`[cron/pausar-expirados] ${pausados} prestador(es) pausado(s) — ${ahora}`)
  return NextResponse.json({ ok: true, pausados })
}
