import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/admin/auth', () => ({
  requireAdminAuth: vi.fn(),
}))

vi.mock('@/lib/admin/dashboard', () => ({
  getDashboardOverview: vi.fn(),
}))

vi.mock('@/lib/admin/events', () => ({
  listTrackingEvents: vi.fn(),
}))

const { requireAdminAuth } = await import('@/lib/admin/auth')
const { getDashboardOverview } = await import('@/lib/admin/dashboard')
const { listTrackingEvents } = await import('@/lib/admin/events')

function createRequest(url: string) {
  return {
    nextUrl: new URL(url),
    headers: new Headers(),
    cookies: { get: () => undefined },
  } as any
}

describe('admin dashboard overview endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('protects overview endpoint for unauthenticated access', async () => {
    const { GET } = await import('@/app/api/admin/dashboard/overview/route')
    vi.mocked(requireAdminAuth).mockImplementation(() => {
      const error = new Error('Unauthorized') as Error & { status?: number }
      error.status = 401
      throw error
    })
    const response = await GET(createRequest('https://admin.local/api'))
    expect(response.status).toBe(401)
    expect(getDashboardOverview).not.toHaveBeenCalled()
  })

  it('returns dashboard overview payload', async () => {
    const { GET } = await import('@/app/api/admin/dashboard/overview/route')
    const sample = {
      range: { label: '7d', start: new Date().toISOString(), end: new Date().toISOString() },
      metrics: {
        users: 10,
        conversations: 20,
        messages: 30,
        tokens: { rangeTotal: 400, last30Days: 800 },
      },
      charts: {
        tokensPerDay: [],
        messagesPerDay: [],
        topUsers: [],
        moduleDistribution: [],
      },
    }
    vi.mocked(requireAdminAuth).mockResolvedValue({ id: 'admin' } as any)
    vi.mocked(getDashboardOverview).mockResolvedValue(sample as any)
    const response = await GET(createRequest('https://admin.local/api?range=30d'))
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload).toEqual(sample)
  })
})

describe('admin events endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('blocks unauthenticated access', async () => {
    const { GET } = await import('@/app/api/admin/events/route')
    vi.mocked(requireAdminAuth).mockImplementation(() => {
      const error = new Error('Unauthorized') as Error & { status?: number }
      error.status = 401
      throw error
    })
    const response = await GET(createRequest('https://admin.local/api/events'))
    expect(response.status).toBe(401)
    expect(listTrackingEvents).not.toHaveBeenCalled()
  })

  it('returns paginated events list', async () => {
    const { GET } = await import('@/app/api/admin/events/route')
    const sample = {
      total: 1,
      page: 1,
      pageSize: 25,
      items: [
        {
          id: 'evt',
          eventType: 'chat_request',
          userId: 'user-1',
          username: 'کاربر',
          source: 'api',
          payload: { foo: 'bar' },
          createdAt: new Date(),
        },
      ],
    }
    vi.mocked(requireAdminAuth).mockResolvedValue({ id: 'admin' } as any)
    vi.mocked(listTrackingEvents).mockResolvedValue(sample as any)
    const response = await GET(createRequest('https://admin.local/api/events?page=1'))
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.total).toBe(1)
    expect(payload.items[0].eventType).toBe('chat_request')
  })
})
