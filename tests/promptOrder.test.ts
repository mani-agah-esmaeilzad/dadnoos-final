import { describe, expect, it } from 'vitest'

import { buildAgentMessages } from '@/lib/agent/runner'
import { getDefaultPromptBySlug } from '@/lib/prompts/defaults'

describe('prompt layering and policies', () => {
  it('core prompt explicitly enforces Persian-only outputs', () => {
    const corePrompt = getDefaultPromptBySlug('core')
    expect(corePrompt?.content).toContain('ALL user-facing responses MUST be written exclusively in Persian (Farsi).')
  })

  it('buildAgentMessages keeps system layers in required order', () => {
    const messages = buildAgentMessages({
      corePrompt: 'CORE_PROMPT',
      history: [
        { role: 'user', content: 'سلام' },
        { role: 'assistant', content: 'پاسخ قبلی' },
      ],
      message: 'سوال جدید',
      modulePrompt: 'MODULE_PROMPT',
      summaryJson: '{"hello":"world"}',
      articleLookupJson: '{"results":[]}',
    })

    expect(messages[0]).toMatchObject({ role: 'system', content: 'CORE_PROMPT' })
    expect(messages[1]).toMatchObject({ role: 'system', content: 'MODULE_PROMPT' })
    expect(messages[2].role).toBe('system')
    expect(messages[2].content.startsWith('CONVERSATION_SUMMARY_JSON:\n')).toBe(true)
    expect(messages[3].role).toBe('system')
    expect(messages[3].content.startsWith('ARTICLE_LOOKUP_RESULTS_JSON:\n')).toBe(true)
  })
})
