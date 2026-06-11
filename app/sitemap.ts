import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = 'https://buscoenpunilla.com.ar'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: prestadores } = await (supabase as any)
    .from('prestadores')
    .select('id')
    .eq('activo', true)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perfiles: MetadataRoute.Sitemap = (prestadores ?? []).map((p: any) => ({
    url: `${BASE}/prestador/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: BASE,                        lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/buscar`,            lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/contacto`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/terminos`,          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE}/auth/registro/prestador`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/auth/registro/cliente`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...perfiles,
  ]
}
