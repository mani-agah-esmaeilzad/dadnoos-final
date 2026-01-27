import type { ChatSummary, Message } from '@prisma/client'

import type { ConversationTurn } from '@/lib/agent/runner'
import { prisma } from '@/lib/db/prisma'
import { env } from '@/lib/env'
import { deserializeContent, partsToPlainText } from '@/lib/chat/messages'
import { estimateTokensFromText } from '@/lib/llm/tokens'
import { ConversationSummary, generateConversationSummary, SummarizableMessage } from '@/lib/chat/summarizer'
import { recordTrackingEvent } from '@/lib/tracking/events'

interface NormalizedMessage extends SummarizableMessage {
  tokenCount: number
}

export type SummarizationCandidate = NormalizedMessage

interface BuildConversationMemoryOptions {
  userId: string
  chatId: string
  excludeMessageId?: string
}

interface ConversationMemoryResult {
  history: ConversationTurn[]
  summaryJson: string | null
}

export function shouldTriggerSummarization({
  enabled,
  summaryTokens,
  unsummarizedTokens,
  unsummarizedCount,
  keepLast,
  threshold,
}: {
  enabled: boolean
  summaryTokens: number
  unsummarizedTokens: number
  unsummarizedCount: number
  keepLast: number
  threshold: number
}) {
  if (!enabled) return false
  if (unsummarizedCount <= keepLast) return false
  return summaryTokens + unsummarizedTokens > threshold
}

export function selectMessagesForSummarization(
  messages: NormalizedMessage[],
  keepLast: number,
  maxInput: number
) {
  if (messages.length <= keepLast) return []
  const limit = Math.min(messages.length - keepLast, Math.max(maxInput, 1))
  return messages.slice(0, limit)
}

function normalizeMessage(record: Message): NormalizedMessage | null {
  const parts = deserializeContent(record.content)
  const content = partsToPlainText(parts)
  const role = record.role === 'assistant' ? 'assistant' : record.role === 'user' ? 'user' : null
  if (!role) return null
  const tokenCount = record.tokenCount && record.tokenCount > 0 ? record.tokenCount : estimateTokensFromText(content)
  return {
    id: record.id,
    role,
    content,
    timestamp: record.timestamp,
    tokenCount,
  }
}

function dropSummarizedMessages(messages: NormalizedMessage[], summarizedUpToId?: string | null) {
  if (!summarizedUpToId) {
    return messages.slice()
  }
  const idx = messages.findIndex((msg) => msg.id === summarizedUpToId)
  if (idx === -1) {
    return messages.slice()
  }
  return messages.slice(idx + 1)
}

function toConversationTurn(message: NormalizedMessage): ConversationTurn {
  return {
    role: message.role,
    content: message.content,
  }
}

async function persistSummary({
  userId,
  chatId,
  previousSummary,
  messages,
}: {
  userId: string
  chatId: string
  previousSummary: ChatSummary | null
  messages: NormalizedMessage[]
}) {
  if (!messages.length) return previousSummary
  const targetVersion = (previousSummary?.summaryVersion ?? 0) + 1
  const summaryPayload = await generateConversationSummary({
    previousSummary: (previousSummary?.summaryJson as ConversationSummary) || null,
    messages,
    targetVersion,
  })
  const summarizedUpTo = messages[messages.length - 1]?.id
  if (!summarizedUpTo) {
    return previousSummary
  }

  const latest = await prisma.chatSummary.findUnique({
    where: { userId_chatId: { userId, chatId } },
  })

  if (previousSummary) {
    if (latest && latest.summaryVersion !== previousSummary.summaryVersion) {
      return latest
    }
    const updateResult = await prisma.chatSummary.updateMany({
      where: {
        userId,
        chatId,
        summaryVersion: previousSummary.summaryVersion,
      },
      data: {
        summaryJson: summaryPayload.summaryObject,
        summaryText: summaryPayload.summaryText,
        summaryVersion: targetVersion,
        summarizedUpToMessageId: summarizedUpTo,
      },
    })
    if (updateResult.count === 0) {
      return prisma.chatSummary.findUnique({ where: { userId_chatId: { userId, chatId } } })
    }
    return prisma.chatSummary.findUnique({ where: { userId_chatId: { userId, chatId } } })
  }

  if (latest) {
    return latest
  }

  try {
    return await prisma.chatSummary.create({
      data: {
        userId,
        chatId,
        summaryJson: summaryPayload.summaryObject,
        summaryText: summaryPayload.summaryText,
        summaryVersion: targetVersion,
        summarizedUpToMessageId: summarizedUpTo,
      },
    })
  } catch (error) {
    console.warn('Concurrent summary creation detected, reusing existing summary.', error)
    const concurrent = await prisma.chatSummary.findUnique({ where: { userId_chatId: { userId, chatId } } })
    return concurrent ?? null
  }
}

export async function buildConversationMemory({
  userId,
  chatId,
  excludeMessageId,
}: BuildConversationMemoryOptions): Promise<ConversationMemoryResult> {
  const [summaryRecord, rawMessages] = await Promise.all([
    prisma.chatSummary.findUnique({ where: { userId_chatId: { userId, chatId } } }),
    prisma.message.findMany({
      where: { userId, chatId },
      orderBy: { timestamp: 'asc' },
    }),
  ])

  const normalizedMessages = rawMessages
    .map(normalizeMessage)
    .filter((msg): msg is NormalizedMessage => Boolean(msg))

  let currentSummary = summaryRecord
  let unsummarizedMessages = dropSummarizedMessages(normalizedMessages, currentSummary?.summarizedUpToMessageId)

  const summaryTokens = currentSummary?.summaryText ? estimateTokensFromText(currentSummary.summaryText) : 0
  const unsummarizedTokens = unsummarizedMessages.reduce((sum, msg) => sum + msg.tokenCount, 0)

  if (
    shouldTriggerSummarization({
      enabled: env.SUMMARY_ENABLED,
      summaryTokens,
      unsummarizedTokens,
      unsummarizedCount: unsummarizedMessages.length,
      keepLast: env.SUMMARY_KEEP_LAST_MESSAGES,
      threshold: env.SUMMARY_TOKEN_THRESHOLD,
    })
  ) {
    const chunk = selectMessagesForSummarization(
      unsummarizedMessages,
      env.SUMMARY_KEEP_LAST_MESSAGES,
      env.SUMMARY_MAX_INPUT_MESSAGES
    )
    if (chunk.length) {
      await recordTrackingEvent({
        userId,
        eventType: 'summarization_trigger',
        source: 'conversation_memory',
        payload: {
          messagesEvaluated: unsummarizedMessages.length,
          tokensEvaluated: unsummarizedTokens,
          summaryTokens,
        },
      })
      try {
        currentSummary = await persistSummary({
          userId,
          chatId,
          previousSummary: currentSummary || null,
          messages: chunk,
        })
        unsummarizedMessages = dropSummarizedMessages(
          normalizedMessages,
          currentSummary?.summarizedUpToMessageId
        )
      } catch (error) {
        console.error('Failed to summarize conversation', error)
      }
    }
  }

  let historyMessages: NormalizedMessage[]
  if (!currentSummary) {
    historyMessages = normalizedMessages.slice()
  } else {
    const extraWindow = excludeMessageId ? env.SUMMARY_KEEP_LAST_MESSAGES + 1 : env.SUMMARY_KEEP_LAST_MESSAGES
    historyMessages = unsummarizedMessages.slice(-extraWindow)
  }

  if (excludeMessageId) {
    historyMessages = historyMessages.filter((msg) => msg.id !== excludeMessageId)
    if (currentSummary) {
      historyMessages = historyMessages.slice(-env.SUMMARY_KEEP_LAST_MESSAGES)
    }
  }

  return {
    history: historyMessages.map(toConversationTurn),
    summaryJson: currentSummary?.summaryText ?? null,
  }
}
