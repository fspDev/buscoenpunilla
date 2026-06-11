import Link from 'next/link'
import { Footer } from '@/components/Footer'
import { AnimateIn } from '@/components/AnimateIn'
import { HeroBuscador } from '@/components/HeroBuscador'
import { CountUp } from '@/components/CountUp'
import { createClient } from '@/lib/supabase/server'
import { OFICIOS_LANDING } from '@/lib/constants'

const PASOS = [
  {
    n: '1',
    titulo: 'Buscá por oficio y zona',
    desc: 'Filtrá por el servicio que necesitás y la localidad más cercana.',
    icon: (
      <svg className="h-8 w-8 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
  },
  {
    n: '2',
    titulo: 'Revisá el perfil y las reseñas',
    desc: 'Mirá la experiencia del prestador y lo que dicen otros vecinos.',
    icon: (
      <svg className="h-8 w-8 text-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
  },
  {
    n: '3',
    titulo: 'Contactá directo por WhatsApp',
    desc: 'Sin intermediarios. Hablás directo con quien va a hacer el trabajo.',
    icon: (
      <svg className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
      </svg>
    ),
  },
]

/* ─── Página ─────────────────────────────────────────────────── */
export default async function HomePage() {
  const supabase = createClient()

  const [
    { count: totalPrestadores },
    { data: oficiosRaw },
    { data: zonasRaw },
    { data: oficiosLista },
    { data: zonasLista },
  ] = await Promise.all([
    supabase.from('prestadores').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('prestadores').select('oficio').eq('activo', true),
    supabase.from('prestadores').select('zonas_trabajo').eq('activo', true),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('oficios').select('nombre').eq('activo', true).order('es_base', { ascending: false }).order('nombre'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('zonas').select('nombre').eq('activo', true).order('es_base', { ascending: false }).order('nombre'),
  ])

  const totalCount    = totalPrestadores ?? 0
  const oficiosCount  = new Set(oficiosRaw?.map((p) => p.oficio).filter(Boolean)).size
  const localesCount  = new Set(zonasRaw?.flatMap((p) => p.zonas_trabajo ?? []).filter(Boolean)).size

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oficiosDisponibles = (oficiosLista as any[])?.map((o) => o.nombre as string) ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zonasDisponibles = (zonasLista as any[])?.map((z) => z.nombre as string) ?? []

  const mostrarStats  = totalCount >= 5

  const STATS = [
    { to: totalCount,   suffix: totalCount >= 50 ? '+' : '', label: 'Prestadores' },
    { to: oficiosCount, suffix: '',                           label: 'Oficios' },
    { to: localesCount, suffix: '',                           label: 'Localidades' },
  ]
  return (
    <div className="min-h-screen bg-surface">

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#001d5c] via-primary to-primary-container px-4 pb-32 pt-20 text-center sm:pt-28">

        {/* Círculos decorativos de fondo */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-white/5 animate-float-slow" />
          <div className="absolute -left-20 bottom-12 h-72 w-72 rounded-full bg-white/5 animate-float" />
          <div className="absolute left-1/2 top-8 h-48 w-48 -translate-x-1/2 rounded-full bg-white/5 animate-float-delayed hidden sm:block" />
          <div className="absolute right-1/3 bottom-1/4 h-28 w-28 rounded-full bg-secondary-container/10 animate-float-slow hidden lg:block" />
        </div>

        {/* Íconos flotantes — solo desktop */}
        {/* Llave inglesa */}
        <div className="pointer-events-none absolute left-10 top-24 animate-float hidden lg:block" style={{ animationDelay: '0.6s' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.1" className="opacity-[0.13]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
          </svg>
        </div>
        {/* Rayo */}
        <div className="pointer-events-none absolute right-14 top-16 animate-float-slow hidden lg:block">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="white" className="opacity-[0.12]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        {/* Casa */}
        <div className="pointer-events-none absolute right-36 bottom-28 animate-float-delayed hidden lg:block">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.1" className="opacity-[0.12]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
        {/* Pincel */}
        <div className="pointer-events-none absolute left-36 bottom-36 animate-float hidden lg:block" style={{ animationDelay: '2.2s' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.1" className="opacity-[0.12]">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
          </svg>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 mx-auto max-w-3xl">

          {/* Logo grande en blanco */}
          <div className="animate-fade-in mb-8 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="BUSCO"
              className="h-16 w-auto sm:h-20 lg:h-24 brightness-0 invert"
            />
          </div>

          <h1
            className="animate-fade-up text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '240ms', letterSpacing: '-0.025em' }}
          >
            Encontrá el oficio que{' '}
            <br className="hidden sm:block" />
            <span className="text-secondary-container">necesitás cerca tuyo</span>
          </h1>

          <p
            className="animate-fade-up mx-auto mt-5 max-w-xl text-base text-white/80 sm:text-lg"
            style={{ animationDelay: '360ms' }}
          >
            Electricistas, plomeros, albañiles y más — todos verificados en el Valle de Punilla
          </p>

          <div
            className="animate-fade-up mt-10 w-full"
            style={{ animationDelay: '480ms' }}
          >
            <HeroBuscador
              oficiosDisponibles={oficiosDisponibles}
              zonasDisponibles={zonasDisponibles}
            />
            <div className="mt-4 text-center">
              <Link
                href="/auth/registro/prestador"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition hover:text-white hover:underline"
              >
                ¿Sos prestador? Registrate gratis →
              </Link>
            </div>
          </div>
        </div>

        {/* Ola de transición */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 sm:h-20" fill="#f9f9ff">
            <path d="M0,80 L0,40 C180,0 360,80 540,48 C720,16 900,72 1080,48 C1260,24 1380,56 1440,40 L1440,80 Z" />
          </svg>
        </div>
      </section>

      {mostrarStats && (
        <>
          {/* ════════════════════ STATS ════════════════════ */}
          <section className="bg-surface px-4 py-10">
            <div className="mx-auto max-w-container">
              <div className="flex items-center justify-center gap-6 sm:gap-20">
                {STATS.map(({ to, suffix, label }, i) => (
                  <AnimateIn key={label} delay={i * 100} className="text-center px-4">
                    <p className="text-3xl font-extrabold text-on-surface sm:text-4xl">
                      <CountUp to={to} suffix={suffix} />
                    </p>
                    <p className="mt-1 text-sm text-on-surface-variant">{label}</p>
                  </AnimateIn>
                ))}
              </div>
            </div>
          </section>

          {/* Separador */}
          <div className="mx-auto max-w-container px-4">
            <div className="h-px bg-outline-variant" />
          </div>
        </>
      )}

      {/* ════════════════════ PROPUESTA DE VALOR ════════════════════ */}
      <section className="px-4 py-16 bg-surface">
        <div className="mx-auto max-w-container">
          <AnimateIn className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">
              Contratá con confianza
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-base text-on-surface-variant">
              Cada prestador en BUSCO tiene un historial real. Antes de llamar, sabés exactamente con quién estás tratando.
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">

            <AnimateIn delay={0} className="h-full">
              <div className="flex h-full flex-col items-center rounded-2xl border border-outline-variant bg-white p-7 text-center shadow-card">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                  <svg className="h-7 w-7 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Calificación de 1 a 5</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Cada trabajo queda calificado. El puntaje refleja el promedio real de todos los clientes anteriores.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn delay={120} className="h-full">
              <div className="flex h-full flex-col items-center rounded-2xl border border-outline-variant bg-white p-7 text-center shadow-card">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                  <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Reseñas verificadas</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  Solo clientes que contrataron pueden dejar reseña. Sin opiniones inventadas ni perfiles falsos.
                </p>
              </div>
            </AnimateIn>

            <AnimateIn delay={240} className="h-full">
              <div className="flex h-full flex-col items-center rounded-2xl border border-outline-variant bg-white p-7 text-center shadow-card">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                  <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-on-surface">Reputación pública</h3>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  El historial de cada prestador es visible para todos. Quien trabaja bien, se destaca. Quien no cumple, pierde clientes.
                </p>
              </div>
            </AnimateIn>

          </div>
        </div>
      </section>

      {/* ════════════════════ CÓMO FUNCIONA ════════════════════ */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-container">
          <AnimateIn className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">¿Cómo funciona?</h2>
            <p className="mt-2 text-on-surface-variant">Tres pasos para encontrar el prestador ideal</p>
          </AnimateIn>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {PASOS.map(({ n, titulo, desc, icon }, i) => (
              <AnimateIn key={n} delay={i * 150}>
                <div className="group flex flex-col items-center rounded-2xl border border-outline-variant bg-white p-7 text-center shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary-container/50 hover:shadow-card-hover">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-low transition group-hover:bg-surface-base">
                    {icon}
                  </div>
                  <div className="mb-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-white">
                    {n}
                  </div>
                  <h3 className="font-semibold text-on-surface">{titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{desc}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ CATEGORÍAS ════════════════════ */}
      <section className="bg-surface-low px-4 py-16">
        <div className="mx-auto max-w-container">
          <AnimateIn className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-on-surface sm:text-4xl">Explorá por oficio</h2>
            <p className="mt-2 text-on-surface-variant">Encontrá especialistas en cada área</p>
          </AnimateIn>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {OFICIOS_LANDING.map(({ label, emoji }, i) => (
              <AnimateIn key={label} delay={i * 55}>
                <Link
                  href={`/buscar?oficio=${encodeURIComponent(label)}`}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-outline-variant bg-white p-4 shadow-card transition duration-200 hover:-translate-y-1 hover:border-primary-container hover:shadow-card-hover"
                >
                  <span aria-hidden="true" className="text-3xl transition-transform duration-200 group-hover:scale-110">
                    {emoji}
                  </span>
                  <span className="text-center text-xs font-medium text-on-surface-variant transition group-hover:text-primary-container leading-tight">
                    {label}
                  </span>
                </Link>
              </AnimateIn>
            ))}
          </div>

          <AnimateIn delay={600} className="mt-8 text-center">
            <Link
              href="/buscar"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-container hover:underline"
            >
              Ver todos los prestadores
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* ════════════════════ CTA PRESTADOR ════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#00472e] via-secondary to-[#006040] px-4 py-20">

        {/* Círculos decorativos */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 animate-float-slow" />
          <div className="absolute -left-12 bottom-0 h-56 w-56 rounded-full bg-white/5 animate-float" />
          <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 animate-float-delayed hidden sm:block" />
        </div>

        <div className="relative mx-auto max-w-2xl text-center">
          <AnimateIn>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
          </AnimateIn>

          <AnimateIn delay={100}>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              ¿Sos prestador de servicios?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-lg text-white/80">
              Creá tu perfil gratis y empezá a recibir clientes en el Valle de Punilla
            </p>
          </AnimateIn>

          <AnimateIn delay={220}>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/75">
              {['Perfil visible en búsquedas', '60 días gratis', 'Sin contratos'].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-secondary-container flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <Link
                href="/auth/registro/prestador"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-secondary shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Crear mi perfil gratis
                <svg className="h-5 w-5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>

      <Footer />

      {/* JSON-LD — datos estructurados para Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'BUSCO en Punilla',
            url: 'https://buscoenpunilla.com.ar',
            description: 'Directorio de servicios y oficios locales en el Valle de Punilla, Córdoba, Argentina.',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://buscoenpunilla.com.ar/buscar?oficio={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </div>
  )
}
