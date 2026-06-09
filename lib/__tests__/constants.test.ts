import { describe, it, expect } from 'vitest'
import { OFICIOS, ZONAS, OFICIOS_LANDING } from '../constants'

describe('constants', () => {
  it('OFICIOS contiene los oficios esperados', () => {
    expect(OFICIOS).toContain('Electricista')
    expect(OFICIOS).toContain('Plomero')
    expect(OFICIOS).toContain('Otro')
  })

  it('OFICIOS_LANDING tiene los mismos nombres que OFICIOS (sin "Otro")', () => {
    const nombres = OFICIOS_LANDING.map((o) => o.label)
    for (const nombre of nombres) {
      expect(OFICIOS).toContain(nombre)
    }
  })

  it('OFICIOS_LANDING incluye emoji para cada oficio', () => {
    for (const oficio of OFICIOS_LANDING) {
      expect(oficio.emoji.length).toBeGreaterThan(0)
    }
  })

  it('ZONAS no tiene duplicados', () => {
    const unicos = new Set(ZONAS)
    expect(unicos.size).toBe(ZONAS.length)
  })

  it('ZONAS contiene las localidades principales', () => {
    expect(ZONAS).toContain('Villa Carlos Paz')
    expect(ZONAS).toContain('Cosquín')
    expect(ZONAS).toContain('La Falda')
  })
})
