// Interfaz para cualquier implementación de BD
import type { Usuario, Prestador, Resena, FotoTrabajo, BusquedaPrestadores } from './types'

export interface IDatabase {
  // Auth
  loginUsuario(email: string, password: string): Promise<{ usuario: Usuario; token: string } | null>
  registroCliente(nombre: string, email: string, password: string, localidad: string, whatsapp?: string): Promise<Usuario | null>
  registroPrestador(nombre: string, email: string, password: string, oficio: string, zonas: string[], whatsapp: string, descripcion?: string): Promise<Usuario | null>

  // Sesión
  obtenerUsuarioActual(token: string): Promise<Usuario | null>
  logoutUsuario(): Promise<void>

  // Prestadores
  obtenerPrestador(id: string): Promise<Prestador | null>
  buscarPrestadores(oficio?: string, localidad?: string, pagina?: number): Promise<BusquedaPrestadores>
  actualizarPerfil(prestador_id: string, datos: Partial<Prestador>): Promise<Prestador | null>
  toggleActivo(prestador_id: string, activo: boolean): Promise<boolean>

  // Reseñas
  obtenerResenas(prestador_id: string): Promise<Resena[]>
  crearResena(prestador_id: string, cliente_id: string, estrellas: number, comentario?: string): Promise<Resena | null>
  responderResena(resena_id: string, respuesta: string): Promise<Resena | null>

  // Fotos
  subirFoto(prestador_id: string, url: string, tipo: 'perfil' | 'trabajo'): Promise<string>
  obtenerFotosTrabajo(prestador_id: string): Promise<FotoTrabajo[]>

  // Métricas (admin)
  obtenerMetricas(): Promise<{ prestadores_activos: number; prestadores_pausados: number; total_clientes: number; total_resenas: number }>
  obtenerPrestadoresAdmin(): Promise<Prestador[]>
  obtenerClientesAdmin(): Promise<Usuario[]>

  // Contacto
  crearMensajeContacto(nombre: string, email: string, tipo: string, mensaje: string): Promise<boolean>
}
