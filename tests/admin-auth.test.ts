import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: () => undefined,
    set: () => undefined,
  })),
}))

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(() => {
    throw new Error('redirected')
  }),
}))

vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}))

vi.mock('@/lib/admin/session', async () => {
  const actual = await vi.importActual<typeof import('../lib/admin/session')>('../lib/admin/session')
  return {
    ...actual,
    getAdminSession: vi.fn(),
    getAdminFromCookies: vi.fn(),
  }
})

import * as adminSession from '@/lib/admin/session'
import * as adminAuth from '@/lib/admin/auth'
import { requireAdminPage } from '@/lib/admin/server'
import { GET as adminMeEndpoint } from '@/app/api/admin/me/route'

describe('admin auth guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('blocks /api/admin/me for non-admin users', async () => {
    vi.mocked(adminSession.getAdminSession).mockResolvedValue(null)
    const request = { cookies: { get: () => undefined } } as any
    await expect(adminAuth.requireAdminAuth(request)).rejects.toMatchObject({ status: 401 })
  })

  it('redirects to /admin/login for unauthenticated pages', async () => {
    vi.mocked(adminSession.getAdminFromCookies).mockResolvedValue(null as any)
    await expect(requireAdminPage()).rejects.toThrow('redirected')
    expect(redirectMock).toHaveBeenCalledWith('/admin/login')
  })
})

describe('admin session cookies', () => {
  it('produces HttpOnly cookie for login sessions', () => {
    const cookie = adminSession.buildAdminSessionCookie('token', new Date(Date.now() + 1000))
    expect(cookie.httpOnly).toBe(true)
    expect(cookie.path).toBe('/')
  })

  it('clears cookie data for logout', () => {
    const cookie = adminSession.buildClearedAdminSessionCookie()
    expect(cookie.value).toBe('')
    expect(cookie.expires.getTime()).toBe(0)
  })
})

describe('admin identity endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('/api/admin/me returns admin identity when authenticated', async () => {
    const fakeAdmin = { id: '1', email: 'admin@test.dev', role: 'ADMIN' } as const
    const authSpy = vi.spyOn(adminAuth, 'requireAdminAuth').mockResolvedValue(fakeAdmin as any)
    const response = await adminMeEndpoint({} as any)
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toMatchObject(fakeAdmin)
    authSpy.mockRestore()
  })
})
