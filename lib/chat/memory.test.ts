import { describe, expect, it } from 'vitest'

import { selectMessagesForSummarization, shouldTriggerSummarization, SummarizationCandidate } from './memory'
import { conversationSummarySchema } from './summarizer'

function createMessage(id: string, tokenCount: number): SummarizationCandidate {
  return {
    id,
    role: Number(id) % 2 === 0 ? 'assistant' : 'user',
    content: `پیام ${id}`,
    timestamp: new Date(`2024-01-0${id}T00:00:00.000Z`),
    tokenCount,
  }
}

describe('shouldTriggerSummarization', () => {
  it('returns false when tokens are below threshold', () => {
    const shouldSummarize = shouldTriggerSummarization({
      enabled: true,
      summaryTokens: 100,
      unsummarizedTokens: 200,
      unsummarizedCount: 10,
      keepLast: 5,
      threshold: 1000,
    })
    expect(shouldSummarize).toBe(false)
  })

  it('returns true when tokens exceed the threshold and there are enough messages', () => {
    const shouldSummarize = shouldTriggerSummarization({
      enabled: true,
      summaryTokens: 500,
      unsummarizedTokens: 20_000,
      unsummarizedCount: 12,
      keepLast: 5,
      threshold: 18_000,
    })
    expect(shouldSummarize).toBe(true)
  })
})

describe('selectMessagesForSummarization', () => {
  it('keeps the last N messages untouched', () => {
    const messages = Array.from({ length: 10 }, (_, idx) => createMessage(String(idx + 1), 100))
    const chunk = selectMessagesForSummarization(messages, 3, 100)
    expect(chunk).toHaveLength(7)
    expect(chunk.at(-1)?.id).toBe('7')
  })

  it('respects the maximum input size', () => {
    const messages = Array.from({ length: 20 }, (_, idx) => createMessage(String(idx + 1), 200))
    const chunk = selectMessagesForSummarization(messages, 5, 8)
    expect(chunk).toHaveLength(8)
    expect(chunk.at(-1)?.id).toBe('8')
  })

  it('returns an empty chunk if there are not enough messages beyond the short-term window', () => {
    const messages = Array.from({ length: 4 }, (_, idx) => createMessage(String(idx + 1), 50))
    const chunk = selectMessagesForSummarization(messages, 5, 10)
    expect(chunk).toHaveLength(0)
  })
})

describe('conversationSummarySchema', () => {
  it('accepts a valid summary payload', () => {
  const payload = {
    summary_version: 1,
    jurisdiction: 'Iran',
    domain: 'family',
    user_profile: {
      name_or_handle: null,
      preferences: [],
      constraints: [],
    },
    facts_confirmed: [
      {
        statement: 'نمونه',
        anchors: { message_ids: ['m1'] },
      },
    ],
    claims_unverified: [],
    timeline: [
      {
        date: null,
        event: 'رویداد',
        anchors: { message_ids: ['m1'] },
      },
    ],
    open_questions: [],
    decisions_and_actions: [],
    important_entities: {
      people: [],
      organizations: [],
      places: [],
      documents: [],
    },
    legal_context_if_any: {
      keywords: [],
      articles_or_laws_verified: [],
      articles_or_laws_needing_verification: [],
    },
    last_updated_iso: new Date().toISOString(),
    summarized_up_to_message_id: 'm1',
  }

    expect(() => conversationSummarySchema.parse(payload)).not.toThrow()
  })

  it('rejects payloads without the jurisdiction field', () => {
  const payload = {
    summary_version: 1,
    domain: 'civil',
    user_profile: {
      name_or_handle: null,
      preferences: [],
      constraints: [],
    },
    facts_confirmed: [
      {
        statement: 'نمونه',
        anchors: { message_ids: ['m1'] },
      },
    ],
    claims_unverified: [],
    timeline: [
      {
        date: null,
        event: 'رویداد',
        anchors: { message_ids: ['m1'] },
      },
    ],
    open_questions: [],
    decisions_and_actions: [],
    important_entities: {
      people: [],
      organizations: [],
      places: [],
      documents: [],
    },
    legal_context_if_any: {
      keywords: [],
      articles_or_laws_verified: [],
      articles_or_laws_needing_verification: [],
    },
    last_updated_iso: new Date().toISOString(),
    summarized_up_to_message_id: 'm1',
  }

    expect(() => conversationSummarySchema.parse(payload)).toThrow()
  })
})
