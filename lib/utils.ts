// Formatea un número argentino para la URL de WhatsApp
export function formatWhatsApp(numero: string): string {
  const digits = numero.replace(/\D/g, '')
  if (digits.startsWith('549')) return digits
  if (digits.startsWith('54')) return `549${digits.slice(2)}`
  const sin0 = digits.startsWith('0') ? digits.slice(1) : digits
  return `549${sin0}`
}

const MESES = [
  'enero','febrero','marzo','abril','mayo','junio',
  'julio','agosto','septiembre','octubre','noviembre','diciembre',
]

// Retorna una fecha en formato relativo en español
export function fechaRelativa(dateStr: string): string {
  const date = new Date(dateStr)
  const diff = Date.now() - date.getTime()
  const seg = diff / 1000
  if (seg < 60)  return 'hace un momento'
  const min = seg / 60
  if (min < 60)  return `hace ${Math.floor(min)} minuto${Math.floor(min) !== 1 ? 's' : ''}`
  const hs = min / 60
  if (hs < 24)   return `hace ${Math.floor(hs)} hora${Math.floor(hs) !== 1 ? 's' : ''}`
  const dias = hs / 24
  if (dias < 7)  return `hace ${Math.floor(dias)} día${Math.floor(dias) !== 1 ? 's' : ''}`
  const sem = dias / 7
  if (sem < 4)   return `hace ${Math.floor(sem)} semana${Math.floor(sem) !== 1 ? 's' : ''}`
  // Más de un mes → formato "el 15 de marzo"
  return `el ${date.getDate()} de ${MESES[date.getMonth()]}`
}
