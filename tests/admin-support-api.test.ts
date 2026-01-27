import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/admin/auth', () => ({
  requireAdminAuth: vi.fn(),
}))

vi.mock('@/lib/admin/support', () => ({
  decodeConversationId: vi.fn(),
  getConversationTranscript: vi.fn(),
}))

vi.mock('@/lib/admin/audit', () => ({
  buildAuditMeta: vi.fn(() => ({})),
  logAdminAction: vi.fn(),
}))

const { requireAdminAuth } = await import('@/lib/admin/auth')
const { decodeConversationId, getConversationTranscript } = await import('@/lib/admin/support')
const { logAdminAction } = await import('@/lib/admin/audit')

function createRequest(url: string) {
  return {
    nextUrl: new URL(url),
    headers: new Headers(),
    cookies: { get: () => undefined },
  } as any
}

describe('support transcript endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(requireAdminAuth).mockResolvedValue({ id: 'admin-1' } as any)
    vi.mocked(decodeConversationId).mockReturnValue({ userId: 'user-1', chatId: 'chat-1' } as any)
  })

  it('requires providing a reason string', async () => {
    const { GET } = await import('@/app/api/admin/support/conversations/[conversationId]/route')
    const response = await GET(createRequest('https://admin.dadnoos.local/api'), {
      params: Promise.resolve({ conversationId: 'encoded' }),
    })
    expect(response.status).toBe(400)
    expect(getConversationTranscript).not.toHaveBeenCalled()
  })

  it('rejects unflagged conversations when no userId override is provided', async () => {
    const { GET } = await import('@/app/api/admin/support/conversations/[conversationId]/route')
    vi.mocked(getConversationTranscript).mockResolvedValue({
      conversationId: 'encoded',
      userId: 'user-1',
      chatId: 'chat-1',
      messages: [],
      nextCursor: null,
      supportRequested: false,
      reported: false,
    })
    const response = await GET(createRequest('https://admin.dadnoos.local/api?reason=پیگیری'), {
      params: Promise.resolve({ conversationId: 'encoded' }),
    })
    expect(response.status).toBe(403)
    expect(logAdminAction).not.toHaveBeenCalled()
  })

  it('allows analysts to access unflagged conversations when userId override matches', async () => {
    const { GET } = await import('@/app/api/admin/support/conversations/[conversationId]/route')
    vi.mocked(getConversationTranscript).mockResolvedValue({
      conversationId: 'encoded',
      userId: 'user-1',
      chatId: 'chat-1',
      messages: [],
      nextCursor: null,
      supportRequested: false,
      reported: false,
    })
    const response = await GET(createRequest('https://admin.dadnoos.local/api?reason=پیگیری&userId=user-1'), {
      params: Promise.resolve({ conversationId: 'encoded' }),
    })
    expect(response.status).toBe(200)
    expect(logAdminAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'VIEW_TRANSCRIPT',
      })
    )
  })

  it('logs audit entries for flagged conversations without needing overrides', async () => {
    const { GET } = await import('@/app/api/admin/support/conversations/[conversationId]/route')
    vi.mocked(getConversationTranscript).mockResolvedValue({
      conversationId: 'encoded',
      userId: 'user-2',
      chatId: 'chat-x',
      messages: [],
      nextCursor: null,
      supportRequested: true,
      reported: false,
    })
    const response = await GET(createRequest('https://admin.dadnoos.local/api?reason=گزارش'), {
      params: Promise.resolve({ conversationId: 'encoded' }),
    })
    expect(response.status).toBe(200)
    expect(logAdminAction).toHaveBeenCalledTimes(1)
  })
})
