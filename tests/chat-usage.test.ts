import { describe, it, expect, vi, beforeEach } from 'vitest'

import { HttpError } from '@/lib/http/errors'

const messageCreate = vi.fn().mockResolvedValue({ id: 'assistant-message' })
const tokenUsageCreate = vi.fn().mockResolvedValue({})
const promptConfigFindUnique = vi.fn().mockResolvedValue(null)

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    message: { create: messageCreate },
    tokenUsage: { create: tokenUsageCreate },
    promptConfig: { findUnique: promptConfigFindUnique },
  },
}))

vi.mock('@/lib/chat/context', () => ({
  prepareChatContext: vi.fn().mockResolvedValue({
    sessionChatId: 'chat-1',
    sessionMetadata: {},
    history: [],
    userPlainText: 'سلام',
    attachmentContext: [],
    summaryJson: null,
  }),
}))

vi.mock('@/lib/chat/messages', () => ({
  serializeContent: vi.fn().mockReturnValue('serialized'),
}))

vi.mock('@/lib/agent/runner', () => ({
  runAgent: vi.fn().mockResolvedValue({ text: 'خروجی' }),
  buildAgentMessages: vi.fn().mockReturnValue([{ role: 'user', content: 'سلام' }]),
}))

vi.mock('@/lib/auth/guards', () => ({
  requireAuth: vi.fn().mockReturnValue({ sub: 'user-123' }),
}))

vi.mock('@/lib/chat/plan', () => ({
  planConversation: vi.fn().mockResolvedValue({
    moduleId: 'generic_chat',
    mode: 'agent',
    metadata: {},
    metadataNote: null,
    modulePrompt: undefined,
    articleLookupJson: null,
    intakeResponse: null,
  }),
}))

vi.mock('@/lib/rate-limit', () => ({
  enforceRateLimit: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/billing/quota', () => ({
  enforceQuota: vi.fn().mockResolvedValue(null),
  recordUsage: vi.fn().mockResolvedValue(undefined),
}))

const monthlyQuotaMock = {
  enforceMonthlyQuota: vi.fn().mockResolvedValue(undefined),
  addMonthlyUsage: vi.fn().mockResolvedValue(undefined),
}

vi.mock('@/lib/quota/monthly', () => monthlyQuotaMock)

vi.mock('@/lib/llm/tokens', () => ({
  estimateTokensFromMessages: vi.fn().mockReturnValue(20),
  estimateTokensFromText: vi.fn().mockReturnValue(10),
}))

describe('chat usage logging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    messageCreate.mockResolvedValue({ id: 'assistant-message' })
  })

  it('creates a token usage record after successful chat call', async () => {
    const { POST } = await import('@/app/api/v1/chat/route')
    const request = {
      json: () => Promise.resolve({ chat_id: 'chat-1', message: 'سلام' }),
      headers: new Headers(),
    } as any
    const response = await POST(request)
    expect(response.status).toBe(200)
    expect(tokenUsageCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-123',
          promptTokens: 20,
          completionTokens: 10,
        }),
      })
    )
  })

  it('returns same error shape when quota is exceeded', async () => {
    const { POST } = await import('@/app/api/v1/chat/route')
    monthlyQuotaMock.enforceMonthlyQuota.mockImplementationOnce(() => {
      throw new HttpError(402, 'سقف توکن اشتراک شما تمام شده است.')
    })
    const request = {
      json: () => Promise.resolve({ chat_id: 'chat-1', message: 'سلام' }),
      headers: new Headers(),
    } as any
    const response = await POST(request)
    expect(response.status).toBe(402)
    const payload = await response.json()
    expect(payload.detail).toBe('سقف توکن اشتراک شما تمام شده است.')
    expect(tokenUsageCreate).not.toHaveBeenCalled()
  })
})
