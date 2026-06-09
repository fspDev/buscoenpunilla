import Link from 'next/link'

export function Footer() {
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
              San Antonio de Arredondo · Mayu Sumaj · Villa Parque Síquiman · Valle de Punilla · Córdoba
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-outline-variant pt-6 text-center text-xs text-outline">
          © {new Date().getFullYear()} BUSCO
        </div>
      </div>
    </footer>
  )
}
