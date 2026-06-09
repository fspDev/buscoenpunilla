// Fuente única de verdad para oficios y zonas — importar desde acá en todo el proyecto

export const OFICIOS = [
  'Electricista',
  'Plomero',
  'Gasista',
  'Albañil',
  'Carpintero',
  'Techista',
  'Pintor',
  'Jardinero',
  'Cerrajero',
  'Otro',
] as const

export const OFICIOS_LANDING = [
  { label: 'Electricista', emoji: '⚡' },
  { label: 'Plomero',      emoji: '🔧' },
  { label: 'Gasista',      emoji: '🔥' },
  { label: 'Albañil',      emoji: '🧱' },
  { label: 'Carpintero',   emoji: '🪚' },
  { label: 'Techista',     emoji: '🏠' },
  { label: 'Pintor',       emoji: '🖌️' },
  { label: 'Jardinero',    emoji: '🌿' },
  { label: 'Cerrajero',    emoji: '🔑' },
] as const

export const ZONAS = [
  'San Antonio de Arredondo',
  'Bialet Massé',
  'Mayu Sumaj',
  'Villa Parque Síquiman',
  'Villa Carlos Paz',
  'Cosquín',
  'La Falda',
] as const
