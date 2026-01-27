import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/guards'
import { deserializeContent, partsToPlainText } from '@/lib/chat/messages'
import { isBuildTime } from '@/lib/runtime/build'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    if (isBuildTime) {
      return NextResponse.json([])
    }

    const { prisma } = await import('@/lib/db/prisma')

    const { userId } = await context.params
    const auth = requireAuth(req)
    if (auth.sub !== userId) {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 })
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId: auth.sub },
      orderBy: { createdAt: 'desc' },
    })

    const result = []
    for (const session of sessions) {
      let title = session.title?.trim()
      if (!title) {
        const firstMessage = await prisma.message.findFirst({
          where: { userId: auth.sub, chatId: session.chatId },
          orderBy: { timestamp: 'asc' },
        })
        if (firstMessage) {
          const text = partsToPlainText(deserializeContent(firstMessage.content)).trim()
          if (text) {
            title = text.length > 50 ? `${text.slice(0, 50)}…` : text
          }
        }
        if (!title) {
          title = 'گفتگو'
        }
      }
      result.push({
        chat_id: session.chatId,
        created_at: session.createdAt.toISOString(),
        title,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    const status = (error as { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
