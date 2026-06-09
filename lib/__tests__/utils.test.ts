import { describe, it, expect } from 'vitest'
import { formatWhatsApp, fechaRelativa } from '../utils'

// ─── formatWhatsApp ───────────────────────────────────────────

describe('formatWhatsApp', () => {
  it('número local sin código → agrega 549', () => {
    expect(formatWhatsApp('3541456789')).toBe('5493541456789')
  })

  it('número con 0 inicial → quita el 0 y agrega 549', () => {
    expect(formatWhatsApp('03541456789')).toBe('5493541456789')
  })

  it('número ya con 549 → no lo duplica', () => {
    expect(formatWhatsApp('5493541456789')).toBe('5493541456789')
  })

  it('número con 54 sin 9 → agrega el 9', () => {
    expect(formatWhatsApp('543541456789')).toBe('5493541456789')
  })

  it('ignora guiones y espacios', () => {
    expect(formatWhatsApp('354-145-6789')).toBe('5493541456789')
  })

  it('ignora paréntesis y espacios', () => {
    expect(formatWhatsApp('(354) 145 6789')).toBe('5493541456789')
  })
})

// ─── fechaRelativa ────────────────────────────────────────────

describe('fechaRelativa', () => {
  it('menos de 60 segundos → hace un momento', () => {
    const fecha = new Date(Date.now() - 30_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace un momento')
  })

  it('1 minuto → singular', () => {
    const fecha = new Date(Date.now() - 61_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace 1 minuto')
  })

  it('5 minutos → plural', () => {
    const fecha = new Date(Date.now() - 5 * 60_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace 5 minutos')
  })

  it('1 hora → singular', () => {
    const fecha = new Date(Date.now() - 61 * 60_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace 1 hora')
  })

  it('3 horas → plural', () => {
    const fecha = new Date(Date.now() - 3 * 60 * 60_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace 3 horas')
  })

  it('1 día → singular', () => {
    const fecha = new Date(Date.now() - 25 * 60 * 60_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace 1 día')
  })

  it('3 días → plural', () => {
    const fecha = new Date(Date.now() - 3 * 24 * 60 * 60_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace 3 días')
  })

  it('1 semana → singular', () => {
    const fecha = new Date(Date.now() - 8 * 24 * 60 * 60_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace 1 semana')
  })

  it('2 semanas → plural', () => {
    const fecha = new Date(Date.now() - 15 * 24 * 60 * 60_000).toISOString()
    expect(fechaRelativa(fecha)).toBe('hace 2 semanas')
  })

  it('fecha antigua → formato "el DD de mes"', () => {
    expect(fechaRelativa('2024-03-15T12:00:00Z')).toBe('el 15 de marzo')
  })

  it('fecha en diciembre', () => {
    expect(fechaRelativa('2024-12-01T12:00:00Z')).toBe('el 1 de diciembre')
  })
})
