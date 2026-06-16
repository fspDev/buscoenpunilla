import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Restablecé la contraseña de tu cuenta de BUSCO en Punilla.',
  alternates: { canonical: '/auth/recuperar' },
}

export default function RecuperarLayout({ children }: { children: React.ReactNode }) {
  return children
}
