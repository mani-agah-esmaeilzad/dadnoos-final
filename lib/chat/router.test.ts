import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/llm/client', () => ({
  createChatCompletion: vi.fn(),
}))

import {
  applyStickyRouting,
  detectExplicitModuleIntent,
  detectFollowUp,
  selectModule,
} from '@/lib/chat/router'
import type { ConversationMetadata } from '@/lib/chat/sessionMetadata'
import { createChatCompletion } from '@/lib/llm/client'

function decision(module: ReturnType<typeof applyStickyRouting>, confidence: number, notes = 'switch') {
  return {
    module,
    confidence,
    required_metadata: [],
    notes,
    decidedAt: new Date().toISOString(),
  }
}

describe('router helpers', () => {
  afterEach(() => {
    vi.mocked(createChatCompletion).mockReset()
  })

  it('detects follow-up intents', () => {
    expect(detectFollowUp('ادامه بده')).toBe(true)
    expect(detectFollowUp('باشه ادامه بده')).toBe(true)
    expect(detectFollowUp('سوال جدید')).toBe(false)
  })

  it('recognizes explicit module keywords', () => {
    expect(detectExplicitModuleIntent('لطفاً قرارداد جدید بنویس')).toBe('contract_drafting')
    expect(detectExplicitModuleIntent('یک دادخواست تنظیم کن')).toBe('petition')
    expect(detectExplicitModuleIntent('سوال عمومی دارم')).toBeNull()
  })

  it('sticks to active module when follow-up is detected and router confidence is low', () => {
    const result = applyStickyRouting({
      activeModule: 'contract_drafting',
      followUp: true,
      explicitIntent: null,
      routerDecision: decision('analysis_contract', 0.4, 'maybe switch'),
    })
    expect(result).toBe('contract_drafting')
  })

  it('switches modules when router is confident and has notes', () => {
    const result = applyStickyRouting({
      activeModule: 'generic_chat',
      followUp: true,
      explicitIntent: null,
      routerDecision: decision('analysis_contract', 0.9, 'کاربر درباره تحلیل قرارداد پرسید'),
    })
    expect(result).toBe('analysis_contract')
  })

  it('falls back to generic_chat when router output is invalid', async () => {
    vi.mocked(createChatCompletion).mockResolvedValueOnce('invalid-json')
    const result = await selectModule({
      message: 'ادامه بده',
      summaryJson: null,
      history: [],
      metadata: {} as ConversationMetadata,
    })
    expect(result.module).toBe('generic_chat')
    expect(result.routerDecision.notes).toBe('invalid_router_output')
  })
})
