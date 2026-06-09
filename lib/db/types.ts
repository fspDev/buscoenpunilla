// Tipos compartidos para BD (mock o Supabase)

export interface Usuario {
  id: string
  email: string
  nombre: string
  role: 'cliente' | 'prestador' | 'admin'
  foto_url: string | null
  whatsapp: string | null
  localidad: string | null
  created_at: string
}

export interface Prestador {
  id: string
  nombre: string
  oficio: string
  oficios?: string[]
  descripcion: string | null
  foto_url: string | null
  zonas_trabajo: string[]
  whatsapp: string
  activo: boolean
  verificado: boolean
  rating_promedio: number
  total_resenas: number
  matricula?: string | null
  created_at: string
}

export interface Resena {
  id: string
  prestador_id: string
  cliente_id: string
  cliente_nombre: string
  estrellas: number
  comentario: string | null
  respuesta_prestador: string | null
  created_at: string
}

export interface FotoTrabajo {
  id: string
  prestador_id: string
  url: string
  created_at: string
}

export interface BusquedaPrestadores {
  prestadores: Prestador[]
  total: number
}
