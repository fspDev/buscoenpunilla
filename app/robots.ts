import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/prestador/dashboard', '/prestador/editar', '/prestador/resenas', '/prestador/suscripcion', '/cliente/', '/resenas/nueva', '/api/'],
      },
    ],
    sitemap: 'https://buscoenpunilla.com.ar/sitemap.xml',
  }
}
