import crypto from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { runAgent, buildAgentMessages, type AgentMetadata } from '@/lib/agent/runner'
import { requireAuth } from '@/lib/auth/guards'
import { chatRequestSchema } from '@/lib/chat/schema'
import { enforceRateLimit } from '@/lib/rate-limit'
import { env } from '@/lib/env'
import { enforceBodySizeLimit } from '@/lib/http/bodyLimit'
import { HttpError } from '@/lib/http/errors'
import { estimateTokensFromMessages, estimateTokensFromText } from '@/lib/llm/tokens'
import { isBuildTime } from '@/lib/runtime/build'
import { planConversation } from '@/lib/chat/plan'
import { recordTrackingEvent } from '@/lib/tracking/events'
import { getCorePromptEntry } from '@/lib/agent/registry'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let currentUserId: string | null = null
  let currentChatId: string | null = null
  const startedAt = Date.now()
  try {
    if (isBuildTime) {
      return NextResponse.json({
        response: 'سیستم در حال آماده‌سازی است. لطفاً بعداً دوباره تلاش کنید.',
        build_placeholder: true,
      })
    }

    const [{ prisma }, { prepareChatContext }, { serializeContent }, quotaModule, monthlyQuotaModule] = await Promise.all([
      import('@/lib/db/prisma'),
      import('@/lib/chat/context'),
      import('@/lib/chat/messages'),
      import('@/lib/billing/quota'),
      import('@/lib/quota/monthly'),
    ])

    const { enforceQuota, recordUsage } = quotaModule
    const { enforceMonthlyQuota, addMonthlyUsage } = monthlyQuotaModule

    const auth = requireAuth(req)
    currentUserId = auth.sub
    enforceBodySizeLimit(req, env.MAX_UPLOAD_BYTES * 2)
    await enforceRateLimit({
      key: `ratelimit:chat:${auth.sub}`,
      limit: env.RATE_LIMIT_MAX_REQUESTS,
      windowSeconds: env.RATE_LIMIT_WINDOW_SEC,
    })

    const payload = await req.json()
    const body = chatRequestSchema.parse(payload)
    const prepared = await prepareChatContext(auth.sub, body)
    currentChatId = prepared.sessionChatId
    await recordTrackingEvent({
      userId: auth.sub,
      eventType: 'chat_request',
      source: 'api/v1/chat',
      payload: {
        chatId: prepared.sessionChatId,
        hasAttachments: prepared.attachmentContext.length > 0,
        messageLength: prepared.userPlainText.length,
      },
    })

    const plan = await planConversation({
      userId: auth.sub,
      chatId: prepared.sessionChatId,
      message: prepared.userPlainText,
      summaryJson: prepared.summaryJson,
      history: prepared.history,
      sessionMetadata: prepared.sessionMetadata,
    })

    if (plan.mode === 'intake' && plan.intakeResponse) {
      const text = plan.intakeResponse
      const assistantTokens = estimateTokensFromText(text)
      await prisma.message.create({
        data: {
          id: crypto.randomUUID(),
          userId: auth.sub,
          chatId: prepared.sessionChatId,
          role: 'assistant',
          content: serializeContent([{ type: 'text', text }]),
          tokenCount: assistantTokens,
        },
      })
      await recordTrackingEvent({
        userId: auth.sub,
        eventType: 'chat_success',
        source: 'api/v1/chat',
        payload: {
          chatId: prepared.sessionChatId,
          module: plan.moduleId,
          totalTokens: assistantTokens,
          durationMs: Date.now() - startedAt,
          mode: 'intake',
        },
      })
      return NextResponse.json({ response: text })
    }

    const agentMetadata: AgentMetadata = {}
    if (prepared.attachmentContext.length) {
      agentMetadata.attachments = prepared.attachmentContext
    }
    if (plan.metadataNote) {
      agentMetadata.notes = plan.metadataNote
    }
    const metadata = Object.keys(agentMetadata).length ? agentMetadata : undefined
    const corePrompt = await getCorePromptEntry()
    const modulePrompt = plan.modulePrompt

    const selectedModel = modulePrompt?.model ?? corePrompt.model ?? undefined

    const agentMessages = buildAgentMessages({
      corePrompt: corePrompt.content,
      history: prepared.history,
      message: prepared.userPlainText,
      metadata,
      summaryJson: prepared.summaryJson || undefined,
      modulePrompt: modulePrompt?.content,
      articleLookupJson: plan.articleLookupJson ?? undefined,
    })
    const estimatedPromptTokens = estimateTokensFromMessages(agentMessages)

    await enforceQuota(auth.sub, estimatedPromptTokens)
    await enforceMonthlyQuota(auth.sub, estimatedPromptTokens)

    const agent = await runAgent({
      corePrompt: corePrompt.content,
      message: prepared.userPlainText,
      history: prepared.history,
      summaryJson: prepared.summaryJson || undefined,
      metadata,
      modulePrompt: modulePrompt?.content,
      articleLookupJson: plan.articleLookupJson ?? undefined,
      model: selectedModel,
    })

    const assistantTokens = estimateTokensFromText(agent.text)
    const totalTokens = estimatedPromptTokens + assistantTokens
    await recordUsage(auth.sub, totalTokens)
    await addMonthlyUsage(auth.sub, totalTokens)

    const assistantMessage = await prisma.message.create({
      data: {
        id: crypto.randomUUID(),
        userId: auth.sub,
        chatId: prepared.sessionChatId,
        role: 'assistant',
        content: serializeContent([{ type: 'text', text: agent.text }]),
        tokenCount: assistantTokens,
      },
    })

    await prisma.tokenUsage.create({
      data: {
        userId: auth.sub,
        chatId: prepared.sessionChatId,
        messageId: assistantMessage.id,
        module: plan.moduleId,
        model: selectedModel ?? env.LLM_MODEL,
        endpoint: '/api/v1/chat',
        promptTokens: estimatedPromptTokens,
        completionTokens: assistantTokens,
        totalTokens,
      },
    })

    await recordTrackingEvent({
      userId: auth.sub,
      eventType: 'chat_success',
      source: 'api/v1/chat',
      payload: {
        chatId: prepared.sessionChatId,
        module: plan.moduleId,
        totalTokens,
        durationMs: Date.now() - startedAt,
      },
    })

    return NextResponse.json({ response: agent.text })
  } catch (error) {
    if (currentUserId) {
      const statusGuess =
        error instanceof HttpError
          ? error.status
          : error instanceof SyntaxError || error instanceof z.ZodError
            ? 400
            : (error as { status?: number }).status ?? 500
      await recordTrackingEvent({
        userId: currentUserId,
        eventType: 'chat_fail',
        source: 'api/v1/chat',
        payload: {
          chatId: currentChatId ?? undefined,
          status: statusGuess,
          message: error instanceof Error ? error.message : 'unknown_error',
        },
      })
    }
    if (error instanceof HttpError) {
      return NextResponse.json({ detail: error.message }, { status: error.status })
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ detail: 'JSON بدفرمت است.' }, { status: 400 })
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'ورودی نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    console.error('Chat endpoint error:', error)
    const status = (error as { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
