import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de next/navigation para evitar errores en tests
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))

// Mock del cliente Supabase
const mockGetUser = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}))

import { requireRole } from '../auth'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('requireRole', () => {
  it('redirige a /auth/login si no hay usuario', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    await expect(requireRole('prestador')).rejects.toThrow('REDIRECT:/auth/login')
  })

  it('redirige a / si el rol no coincide', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: 'cliente' } }) }) }),
    })

    await expect(requireRole('prestador')).rejects.toThrow('REDIRECT:/')
  })

  it('permite acceso si el rol coincide', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: 'prestador', nombre: 'Juan' } }) }) }),
    })

    const result = await requireRole('prestador')
    expect(result.user).toBeDefined()
  })

  it('admin puede acceder a cualquier ruta (incluyendo prestador)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'admin1' } } })
    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: 'admin', nombre: 'Admin' } }) }) }),
    })

    // No debe redirigir aunque se pida rol 'prestador'
    const result = await requireRole('prestador')
    expect(result.user).toBeDefined()
  })

  it('cliente no puede acceder a ruta de admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u2' } } })
    mockFrom.mockReturnValue({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { role: 'cliente' } }) }) }),
    })

    await expect(requireRole('admin')).rejects.toThrow('REDIRECT:/')
  })
})
