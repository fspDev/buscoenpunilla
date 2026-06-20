import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registrate como cliente',
  description: 'Creá tu cuenta gratis en BUSCO en Punilla para dejar reseñas y contactar prestadores de servicios verificados en el Valle de Punilla.',
  alternates: { canonical: '/auth/registro/cliente' },
}

export default function RegistroClienteLayout({ children }: { children: React.ReactNode }) {
  return children
}
