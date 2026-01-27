import { beforeEach, describe, expect, it, vi } from 'vitest'
import React from 'react'

describe('admin protected layout', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('requires admin session before rendering children', async () => {
    const requireAdminPageMock = vi.fn().mockResolvedValue({
      email: 'admin@test.dev',
      role: 'ADMIN',
    })

    vi.doMock('@/lib/admin/server', () => ({
      requireAdminPage: requireAdminPageMock,
    }))

    const layoutModule = await import('@/app/admin/(protected)/layout')
    const AdminProtectedLayout = layoutModule.default
    const rendered = await AdminProtectedLayout({ children: React.createElement('div', null, 'child') })

    const { requireAdminPage } = await import('@/lib/admin/server')
    expect(requireAdminPage).toHaveBeenCalled()
    expect(rendered).toBeTruthy()
  })
})
