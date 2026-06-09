'use client'

import { logoutAction } from '@/app/auth/actions'

export function NavbarLogout() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-low"
      >
        Salir
      </button>
    </form>
  )
}
