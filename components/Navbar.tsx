import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/lib/auth'
import { NavbarUserMenu } from './NavbarUserMenu'

export async function Navbar() {
  const data    = await getUser()
  const profile = data?.profile

  return (
    <nav className="sticky top-0 z-20 border-b border-outline-variant bg-white shadow-sm">
      <div className="mx-auto flex max-w-container items-center justify-between px-4 py-3 sm:px-8">
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="BUSCO" width={96} height={20} priority className="h-7 w-auto" />
        </Link>

        <div className="flex items-center gap-2">
          {!profile ? (
            <>
              <Link href="/auth/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant transition hover:bg-surface-low min-h-[44px] flex items-center">
                Ingresar
              </Link>
              <Link href="/auth/registro/cliente"
                className="rounded-lg bg-primary-container px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 min-h-[44px] flex items-center">
                Registrarse
              </Link>
            </>
          ) : (
            <NavbarUserMenu
              nombre={profile.nombre}
              foto_url={(profile as { foto_url?: string | null }).foto_url ?? null}
              role={profile.role as 'cliente' | 'prestador' | 'admin'}
            />
          )}
        </div>
      </div>
    </nav>
  )
}
