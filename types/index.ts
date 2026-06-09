// Tipos de dominio para usar en componentes y páginas

export type EstadoOficio = 'aprobado' | 'pendiente' | 'rechazado' | 'fusionado'

export type Oficio = {
  id: string
  nombre: string
  activo: boolean
  es_base: boolean
  created_at: string
}

export type Notificacion = {
  id: string
  tipo: string
  mensaje: string
  leida: boolean
  created_at: string
}

export type Prestador = {
  id: string
  nombre: string
  oficio: string
  oficios?: string[]
  descripcion: string | null
  foto_url: string | null
  zonas_trabajo: string[]
  whatsapp: string | null
  activo: boolean
  rating_promedio: number
  total_resenas: number
  matricula?: string | null
  oficio_propuesto?: string | null
  estado_oficio?: EstadoOficio | null
  oficio_fusionado?: string | null
}

export type MetricasPrestador = {
  impresiones_30d: number
  contactos_30d: number
  resenas_30d: number
  rating_promedio: number
  impresiones_30d_anterior: number
  contactos_30d_anterior: number
}

export type FotoTrabajo = {
  id: string
  url: string
  created_at: string
}

export type NuevaResena = {
  prestador_id: string
  estrellas: number
  comentario?: string
}

export type NuevaResenaPublica = {
  prestador_id: string
  estrellas: number
  comentario?: string
  cliente_nombre: string
  cliente_email: string
}

export type ReporteResena = {
  resena_id: string
  motivo: string
}

export type Resena = {
  id: string
  prestador_id: string
  cliente_id: string | null
  cliente_nombre: string
  estrellas: number
  comentario: string | null
  respuesta_prestador: string | null
  created_at: string
}
