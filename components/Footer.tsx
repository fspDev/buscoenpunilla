import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const ZONAS_FALLBACK = [
  'San Antonio de Arredondo',
  'Bialet Massé',
  'Mayu Sumaj',
  'Villa Parque Síquiman',
  'Villa Carlos Paz',
  'Cosquín',
  'La Falda',
]

export async function Footer() {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: zonasData } = await (supabase as any)
    .from('zonas')
    .select('nombre')
    .eq('activo', true)
    .order('es_base', { ascending: false })
    .order('nombre')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zonas = (zonasData as any[])?.map((z) => z.nombre as string) ?? ZONAS_FALLBACK
  const zonasTexto = zonas.join(' · ')

  return (
    <footer className="border-t border-outline-variant bg-white px-4 py-10">
      <div className="mx-auto max-w-container">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-on-surface">BUSCO</p>
            <p className="mt-1 text-sm text-on-surface-variant">Encontrá el oficio que necesitás</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-outline mb-3">Links</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/buscar" className="text-on-surface-variant hover:text-on-surface hover:underline transition">Buscar prestador</Link></li>
              <li><Link href="/auth/registro/prestador" className="text-on-surface-variant hover:text-on-surface hover:underline transition">Registrarme como prestador</Link></li>
              <li><Link href="/contacto" className="text-on-surface-variant hover:text-on-surface hover:underline transition">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-outline mb-3">Zonas</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {zonasTexto}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-outline-variant pt-6 text-center text-xs text-outline">
          <p>© {new Date().getFullYear()} BUSCO</p>
          <p className="mt-1">
            Hecho por{' '}
            <Link href="https://www.3libras.com.ar" target="_blank" rel="noopener noreferrer" className="text-primary-container hover:underline">
              3 libras
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
