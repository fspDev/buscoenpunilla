import { createClient } from '@/lib/supabase/server'
import type { IDatabase } from './repository'
import type { Usuario, Prestador, Resena, FotoTrabajo, BusquedaPrestadores } from './types'

type ResenaRow = {
  id: string; prestador_id: string; cliente_id: string
  estrellas: number; comentario: string | null; respuesta_prestador: string | null
  created_at: string; profiles: { nombre: string | null } | null
}

export class SupabaseDatabase implements IDatabase {
  // ─── AUTH & SESIÓN ───────────────────────────────────────────

  async loginUsuario(email: string, password: string): Promise<{ usuario: Usuario; token: string } | null> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.user || !data.session) return null

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (!profile) return null

    return {
      usuario: {
        id: data.user.id,
        email: data.user.email!,
        nombre: profile.nombre ?? '',
        role: profile.role,
        foto_url: profile.foto_url,
        whatsapp: profile.whatsapp,
        localidad: profile.localidad,
        created_at: data.user.created_at,
      },
      token: data.session.access_token,
    }
  }

  async registroCliente(
    nombre: string,
    email: string,
    password: string,
    localidad: string,
    whatsapp?: string
  ): Promise<Usuario | null> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          role: 'cliente',
          localidad,
          whatsapp: whatsapp ?? null,
        },
      },
    })

    if (error || !data.user) return null

    return {
      id: data.user.id,
      email: data.user.email!,
      nombre,
      role: 'cliente',
      foto_url: null,
      whatsapp: whatsapp ?? null,
      localidad,
      created_at: data.user.created_at,
    }
  }

  async registroPrestador(
    nombre: string,
    email: string,
    password: string,
    oficio: string,
    zonas: string[],
    whatsapp: string,
    descripcion?: string
  ): Promise<Usuario | null> {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          role: 'prestador',
          oficio,
          oficios: [oficio],
          localidad: zonas[0] ?? '',
          zonas_trabajo: zonas,
          whatsapp,
          descripcion: descripcion ?? null,
        },
      },
    })

    if (error || !data.user) return null

    return {
      id: data.user.id,
      email: data.user.email!,
      nombre,
      role: 'prestador',
      foto_url: null,
      whatsapp,
      localidad: zonas[0] ?? '',
      created_at: data.user.created_at,
    }
  }

  async obtenerUsuarioActual(token: string): Promise<Usuario | null> {
    // Si bien Next.js usa cookies y no requiere token directo, implementamos la verificación
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    return {
      id: user.id,
      email: user.email!,
      nombre: profile.nombre ?? '',
      role: profile.role,
      foto_url: profile.foto_url,
      whatsapp: profile.whatsapp,
      localidad: profile.localidad,
      created_at: user.created_at,
    }
  }

  async logoutUsuario(): Promise<void> {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  // ─── PRESTADORES ─────────────────────────────────────────────

  async obtenerPrestador(id: string): Promise<Prestador | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('prestadores_publicos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return {
      id: data.id,
      nombre: data.nombre ?? '',
      oficio: data.oficio ?? '',
      oficios: data.oficios ?? [],
      descripcion: data.descripcion,
      foto_url: data.foto_url,
      zonas_trabajo: data.zonas_trabajo ?? [],
      whatsapp: data.whatsapp ?? '',
      activo: true, // Si está en la vista pública, está activo
      verificado: false, // Esta vista no expone verificado directamente
      rating_promedio: data.rating_promedio,
      total_resenas: data.total_resenas,
      matricula: data.matricula,
      created_at: '',
    }
  }

  async buscarPrestadores(oficio?: string, localidad?: string): Promise<BusquedaPrestadores> {
    const supabase = createClient()
    let query = supabase
      .from('prestadores_publicos')
      .select('*')
      .order('total_resenas', { ascending: false })

    if (oficio) {
      query = query.ilike('oficio', `%${oficio}%`)
    }

    const { data, error } = await query
    if (error || !data) return { prestadores: [], total: 0 }

    let filtrados = [...data]
    if (localidad) {
      filtrados = filtrados.filter((p) => p.zonas_trabajo?.some((z: string) => z.toLowerCase().includes(localidad.toLowerCase())))
    }

    const prestadores: Prestador[] = filtrados.map((p) => ({
      id: p.id,
      nombre: p.nombre ?? '',
      oficio: p.oficio ?? '',
      oficios: p.oficios ?? [],
      descripcion: p.descripcion,
      foto_url: p.foto_url,
      zonas_trabajo: p.zonas_trabajo ?? [],
      whatsapp: p.whatsapp ?? '',
      activo: true,
      verificado: false,
      rating_promedio: p.rating_promedio,
      total_resenas: p.total_resenas,
      matricula: p.matricula,
      created_at: '',
    }))

    return {
      prestadores,
      total: prestadores.length,
    }
  }

  async actualizarPerfil(prestador_id: string, datos: Partial<Prestador>): Promise<Prestador | null> {
    const supabase = createClient()

    // Actualizar tabla profiles si hay datos correspondientes
    if (datos.nombre !== undefined || datos.whatsapp !== undefined) {
      const profileUpdates: { nombre?: string | null; whatsapp?: string | null } = {}
      if (datos.nombre !== undefined) profileUpdates.nombre = datos.nombre
      if (datos.whatsapp !== undefined) profileUpdates.whatsapp = datos.whatsapp

      await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', prestador_id)
    }

    // Actualizar tabla prestadores
    const prestadorUpdates: {
      oficio?: string | null
      oficios?: string[] | null
      descripcion?: string | null
      foto_url?: string | null
      zonas_trabajo?: string[] | null
      activo?: boolean
      matricula?: string | null
    } = {}
    if (datos.oficio !== undefined) {
      prestadorUpdates.oficio = datos.oficio
      prestadorUpdates.oficios = datos.oficios !== undefined ? datos.oficios : [datos.oficio]
    }
    if (datos.descripcion !== undefined) prestadorUpdates.descripcion = datos.descripcion
    if (datos.foto_url !== undefined) prestadorUpdates.foto_url = datos.foto_url
    if (datos.zonas_trabajo !== undefined) prestadorUpdates.zonas_trabajo = datos.zonas_trabajo
    if (datos.activo !== undefined) prestadorUpdates.activo = datos.activo
    if (datos.matricula !== undefined) prestadorUpdates.matricula = datos.matricula

    if (Object.keys(prestadorUpdates).length > 0) {
      await supabase
        .from('prestadores')
        .update(prestadorUpdates)
        .eq('id', prestador_id)
    }

    return this.obtenerPrestador(prestador_id)
  }

  async toggleActivo(prestador_id: string, activo: boolean): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('prestadores')
      .update({ activo })
      .eq('id', prestador_id)

    return !error
  }

  // ─── RESEÑAS ─────────────────────────────────────────────────

  async obtenerResenas(prestador_id: string): Promise<Resena[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('resenas')
      .select('*, profiles(nombre)')
      .eq('prestador_id', prestador_id)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return (data as unknown as ResenaRow[]).map((r) => ({
      id: r.id,
      prestador_id: r.prestador_id,
      cliente_id: r.cliente_id,
      cliente_nombre: r.profiles?.nombre ?? 'Cliente',
      estrellas: r.estrellas,
      comentario: r.comentario,
      respuesta_prestador: r.respuesta_prestador,
      created_at: r.created_at,
    }))
  }

  async crearResena(
    prestador_id: string,
    cliente_id: string,
    estrellas: number,
    comentario?: string
  ): Promise<Resena | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('resenas')
      .insert({
        prestador_id,
        cliente_id,
        estrellas,
        comentario: comentario ?? null,
      })
      .select('*, profiles(nombre)')
      .single()

    if (error || !data) return null

    const row = data as unknown as ResenaRow
    return {
      id: row.id,
      prestador_id: row.prestador_id,
      cliente_id: row.cliente_id,
      cliente_nombre: row.profiles?.nombre ?? 'Cliente',
      estrellas: row.estrellas,
      comentario: row.comentario,
      respuesta_prestador: row.respuesta_prestador,
      created_at: row.created_at,
    }
  }

  async responderResena(resena_id: string, respuesta: string): Promise<Resena | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('resenas')
      .update({ respuesta_prestador: respuesta })
      .eq('id', resena_id)
      .select('*, profiles(nombre)')
      .single()

    if (error || !data) return null

    const row = data as unknown as ResenaRow
    return {
      id: row.id,
      prestador_id: row.prestador_id,
      cliente_id: row.cliente_id,
      cliente_nombre: row.profiles?.nombre ?? 'Cliente',
      estrellas: row.estrellas,
      comentario: row.comentario,
      respuesta_prestador: row.respuesta_prestador,
      created_at: row.created_at,
    }
  }

  // ─── FOTOS ───────────────────────────────────────────────────

  async subirFoto(prestador_id: string, url: string, tipo: 'perfil' | 'trabajo'): Promise<string> {
    const supabase = createClient()
    if (tipo === 'perfil') {
      await supabase.from('profiles').update({ foto_url: url }).eq('id', prestador_id)
      await supabase.from('prestadores').update({ foto_url: url }).eq('id', prestador_id)
    } else {
      await supabase.from('fotos_trabajos').insert({ prestador_id, url })
    }
    return url
  }

  async obtenerFotosTrabajo(prestador_id: string): Promise<FotoTrabajo[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('fotos_trabajos')
      .select('*')
      .eq('prestador_id', prestador_id)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((f) => ({
      id: f.id,
      prestador_id: f.prestador_id,
      url: f.url,
      created_at: f.created_at,
    }))
  }

  // ─── MÉTRICAS & PANEL ADMIN ──────────────────────────────────

  async obtenerMetricas(): Promise<{
    prestadores_activos: number
    prestadores_pausados: number
    total_clientes: number
    total_resenas: number
  }> {
    const supabase = createClient()
    const [activos, pausados, clientes, resenas] = await Promise.all([
      supabase.from('prestadores').select('id', { count: 'exact', head: true }).eq('activo', true).eq('suspendido', false),
      supabase.from('prestadores').select('id', { count: 'exact', head: true }).eq('activo', false),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'cliente'),
      supabase.from('resenas').select('id', { count: 'exact', head: true }),
    ])

    return {
      prestadores_activos: activos.count ?? 0,
      prestadores_pausados: pausados.count ?? 0,
      total_clientes: clientes.count ?? 0,
      total_resenas: resenas.count ?? 0,
    }
  }

  async obtenerPrestadoresAdmin(): Promise<Prestador[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('admin_prestadores')
      .select('*')

    if (error || !data) return []

    return data.map((p) => ({
      id: p.id,
      nombre: p.nombre ?? '',
      oficio: p.oficio ?? '',
      oficios: p.oficios ?? [],
      descripcion: p.descripcion,
      foto_url: p.foto_url,
      zonas_trabajo: p.zonas_trabajo ?? [],
      whatsapp: p.whatsapp ?? '',
      activo: p.activo ?? false,
      verificado: p.verificado ?? false,
      rating_promedio: p.rating_promedio ?? 0,
      total_resenas: p.total_resenas ?? 0,
      created_at: p.created_at ?? '',
    }))
  }

  async obtenerClientesAdmin(): Promise<Usuario[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('admin_clientes')
      .select('*')

    if (error || !data) return []

    return data.map((c) => ({
      id: c.id,
      email: c.email ?? '',
      nombre: c.nombre ?? '',
      role: 'cliente',
      foto_url: null,
      whatsapp: c.whatsapp,
      localidad: c.localidad,
      created_at: c.created_at ?? '',
    }))
  }

  // ─── CONTACTO ────────────────────────────────────────────────

  async crearMensajeContacto(nombre: string, email: string, tipo: string, mensaje: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
      .from('mensajes_contacto')
      .insert({ nombre, email, tipo, mensaje })

    return !error
  }
}
