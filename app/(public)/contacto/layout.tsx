import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto',
  description: '¿Tenés una consulta, un problema con tu perfil o una sugerencia? Escribinos desde el formulario de contacto de BUSCO en Punilla y te respondemos a la brevedad.',
  alternates: { canonical: '/contacto' },
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children
}
