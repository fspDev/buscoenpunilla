import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PRESTADOR_PRIVADO = ['dashboard', 'editar', 'resenas', 'suscripcion']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // Rutas públicas — no necesitan auth check
  const esPublica = (
    pathname === '/' ||
    pathname.startsWith('/buscar') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/contacto') ||
    pathname.startsWith('/terminos') ||
    pathname.startsWith('/resena/') ||
    (pathname.startsWith('/prestador/') && !PRESTADOR_PRIVADO.includes(pathname.split('/')[2])) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api')
  )
  if (esPublica) return supabaseResponse

  // A partir de acá verificamos auth
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Obtener rol UNA SOLA VEZ por request
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role

  // /cliente/*
  if (pathname.startsWith('/cliente') && role !== 'cliente') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // /resenas/*
  if (pathname.startsWith('/resenas') && role !== 'cliente') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // /prestador/[privado]
  if (pathname.startsWith('/prestador/')) {
    const segmento = pathname.split('/')[2]
    if (PRESTADOR_PRIVADO.includes(segmento) && role !== 'prestador' && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // /admin/*
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.png$).*)',
  ],
}
