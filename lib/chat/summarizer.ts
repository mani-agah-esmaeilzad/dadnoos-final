import { z } from 'zod'

import { env } from '@/lib/env'
import { createChatCompletion, LlmMessage } from '@/lib/llm/client'

const anchorSchema = z.object({
  message_ids: z.array(z.string()).min(1),
  turn_range: z
    .object({
      from: z.number(),
      to: z.number(),
    })
    .optional(),
})

export const conversationSummarySchema = z.object({
  summary_version: z.number(),
  jurisdiction: z.literal('Iran'),
  domain: z.string().default('general'),
  user_profile: z.object({
    name_or_handle: z.string().nullable().default(null),
    preferences: z.array(z.string()).default([]),
    constraints: z.array(z.string()).default([]),
  }),
  facts_confirmed: z
    .array(
      z.object({
        statement: z.string(),
        anchors: anchorSchema,
      })
    )
    .default([]),
  claims_unverified: z.array(z.string()).default([]),
  timeline: z
    .array(
      z.object({
        date: z.string().nullable().default(null),
        event: z.string(),
        anchors: anchorSchema,
      })
    )
    .default([]),
  open_questions: z.array(z.string()).default([]),
  decisions_and_actions: z.array(z.string()).default([]),
  important_entities: z.object({
    people: z.array(z.string()).default([]),
    organizations: z.array(z.string()).default([]),
    places: z.array(z.string()).default([]),
    documents: z.array(z.string()).default([]),
  }),
  legal_context_if_any: z.object({
    keywords: z.array(z.string()).default([]),
    articles_or_laws_verified: z.array(z.string()).default([]),
    articles_or_laws_needing_verification: z.array(z.string()).default([]),
  }),
  last_updated_iso: z.string(),
  summarized_up_to_message_id: z.string().nullable().optional(),
})

export type ConversationSummary = z.infer<typeof conversationSummarySchema>

export interface SummarizableMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUMMARY_SCHEMA_HINT = `
{
  "summary_version": number,
  "jurisdiction": "Iran",
  "facts_confirmed": [
    {
      "statement": string,
      "anchors": { "message_ids": [string, ...], "turn_range": { "from": number, "to": number }? }
    }
  ],
  "timeline": [
    { "date": string|null, "event": string, "anchors": { "message_ids": [string, ...] } }
  ],
  "summarized_up_to_message_id": string
}
`

const SUMMARIZER_SYSTEM_PROMPT =
  'You are a summarization engine. Output ONLY valid JSON matching the provided schema. Do not add facts. Every confirmed fact and every timeline event MUST include anchors referencing the original message_ids supplied in the payload. If a previous summary is provided, merge and update it. Prefer brevity. Use Persian text for values where natural. Jurisdiction is Iran.'

const SUMMARY_REPAIR_PROMPT =
  'You are a JSON repair assistant. Fix the provided JSON so it strictly matches the required schema, keep existing facts, do not add new information, and return ONLY the repaired JSON.'

export async function generateConversationSummary({
  previousSummary,
  messages,
  targetVersion,
}: {
  previousSummary: ConversationSummary | null
  messages: SummarizableMessage[]
  targetVersion: number
}): Promise<{ summaryObject: ConversationSummary; summaryText: string }> {
  if (!messages.length) {
    throw new Error('No messages provided for summarization')
  }

  const payload = {
    previous_summary_json: previousSummary,
    new_messages: messages.map((msg) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
    })),
  }

  const summarizerMessages: LlmMessage[] = [
    { role: 'system', content: SUMMARIZER_SYSTEM_PROMPT },
    { role: 'user', content: JSON.stringify(payload) },
  ]

  const rawSummary = await createChatCompletion({
    model: env.SUMMARY_MODEL || env.LLM_MODEL,
    messages: summarizerMessages,
    temperature: 0.1,
    maxTokens: env.SUMMARY_TARGET_TOKENS,
  })
  const finalId = messages[messages.length - 1]?.id || null

  const parseAttempt = () => conversationSummarySchema.parse(JSON.parse(rawSummary))

  let parsed: ConversationSummary | null = null
  try {
    parsed = parseAttempt()
  } catch (error) {
    console.warn('Initial summary parse failed, attempting repair.', error)
    const repaired = await createChatCompletion({
      model: env.SUMMARY_MODEL || env.LLM_MODEL,
      messages: [
        { role: 'system', content: SUMMARY_REPAIR_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            schema: SUMMARY_SCHEMA_HINT,
            invalid_json: rawSummary,
          }),
        },
      ],
      temperature: 0,
      maxTokens: env.SUMMARY_TARGET_TOKENS / 2,
    })
    try {
      parsed = conversationSummarySchema.parse(JSON.parse(repaired))
    } catch (finalError) {
      throw new Error(`Summarizer did not return valid JSON after repair: ${(finalError as Error).message}`)
    }
  }

  const messageIds = new Set(messages.map((msg) => msg.id))
  const sanitizeAnchors = (entry: { anchors: { message_ids: string[] } }) => {
    entry.anchors.message_ids = entry.anchors.message_ids.filter((id) => messageIds.has(id))
    return entry.anchors.message_ids.length > 0
  }

  parsed.facts_confirmed = parsed.facts_confirmed.filter((fact) => sanitizeAnchors(fact))
  parsed.timeline = parsed.timeline.filter((item) => sanitizeAnchors(item))

  parsed.summary_version = targetVersion
  parsed.jurisdiction = 'Iran'
  parsed.last_updated_iso = new Date().toISOString()
  parsed.summarized_up_to_message_id = finalId

  return {
    summaryObject: parsed,
    summaryText: JSON.stringify(parsed),
  }
}
