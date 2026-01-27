import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/admin/auth', () => ({
  requireAdminAuth: vi.fn(),
}))

vi.mock('@/lib/admin/audit', () => ({
  buildAuditMeta: vi.fn(() => ({})),
  logAdminAction: vi.fn(),
}))

vi.mock('@/lib/admin/users', () => ({
  setUserMonthlyQuota: vi.fn(),
  setUserStatus: vi.fn(),
  getAdminUserDetail: vi.fn(),
}))

const { requireAdminAuth } = await import('@/lib/admin/auth')
const { setUserMonthlyQuota, setUserStatus, getAdminUserDetail } = await import('@/lib/admin/users')

describe('admin user patch endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects analyst role for quota update', async () => {
    const { PATCH } = await import('@/app/api/admin/users/[userId]/quota/route')
    vi.mocked(requireAdminAuth).mockImplementation(() => {
      const error = new Error('Insufficient admin role') as Error & { status?: number }
      error.status = 403
      throw error
    })
    const request = {
      json: () => Promise.resolve({ monthlyQuota: 1000 }),
    } as any
    const response = await PATCH(request, {
      params: Promise.resolve({ userId: 'user-1' }),
    })
    expect(response.status).toBe(403)
    expect(setUserMonthlyQuota).not.toHaveBeenCalled()
  })

  it('allows admin role to update quota', async () => {
    const { PATCH } = await import('@/app/api/admin/users/[userId]/quota/route')
    vi.mocked(requireAdminAuth).mockResolvedValue({ id: 'admin-1', role: 'ADMIN' } as any)
    vi.mocked(setUserMonthlyQuota).mockResolvedValue()
    vi.mocked(getAdminUserDetail).mockResolvedValueOnce({ id: 'user-2', monthlyTokenQuota: 1000 } as any)
    vi.mocked(getAdminUserDetail).mockResolvedValueOnce({ id: 'user-2', monthlyTokenQuota: 25000 } as any)
    const request = {
      json: () => Promise.resolve({ monthlyQuota: 25000 }),
    } as any
    const response = await PATCH(request, {
      params: Promise.resolve({ userId: 'user-2' }),
    })
    expect(response.status).toBe(200)
    expect(setUserMonthlyQuota).toHaveBeenCalledWith('user-2', 25000)
  })

  it('prevents analyst from changing status', async () => {
    const { PATCH } = await import('@/app/api/admin/users/[userId]/status/route')
    vi.mocked(requireAdminAuth).mockImplementation(() => {
      const error = new Error('Insufficient admin role') as Error & { status?: number }
      error.status = 403
      throw error
    })
    const request = {
      json: () => Promise.resolve({ status: 'disabled' }),
    } as any
    const response = await PATCH(request, {
      params: Promise.resolve({ userId: 'user-3' }),
    })
    expect(response.status).toBe(403)
    expect(setUserStatus).not.toHaveBeenCalled()
  })

  it('allows admin role to change status', async () => {
    const { PATCH } = await import('@/app/api/admin/users/[userId]/status/route')
    vi.mocked(requireAdminAuth).mockResolvedValue({ id: 'admin-2', role: 'ADMIN' } as any)
    vi.mocked(setUserStatus).mockResolvedValue()
    vi.mocked(getAdminUserDetail).mockResolvedValueOnce({ id: 'user-4', status: 'active' } as any)
    vi.mocked(getAdminUserDetail).mockResolvedValueOnce({ id: 'user-4', status: 'disabled' } as any)
    const request = {
      json: () => Promise.resolve({ status: 'disabled' }),
    } as any
    const response = await PATCH(request, {
      params: Promise.resolve({ userId: 'user-4' }),
    })
    expect(response.status).toBe(200)
    expect(setUserStatus).toHaveBeenCalledWith('user-4', 'disabled')
  })
})
