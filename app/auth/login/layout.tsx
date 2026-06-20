import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ingresar a tu cuenta',
  description: 'Ingresá a tu cuenta de BUSCO en Punilla para gestionar tu perfil, dejar reseñas o contactar prestadores de servicios.',
  alternates: { canonical: '/auth/login' },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
