import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/guards'
import { deserializeContent, summarizeParts } from '@/lib/chat/messages'
import { isBuildTime } from '@/lib/runtime/build'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string; chatId: string }> }
) {
  try {
    if (isBuildTime) {
      return NextResponse.json([])
    }

    const { prisma } = await import('@/lib/db/prisma')

    const { userId, chatId } = await context.params
    const auth = requireAuth(req)
    if (auth.sub !== userId) {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 })
    }

    const messages = await prisma.message.findMany({
      where: { userId: auth.sub, chatId },
      orderBy: { timestamp: 'asc' },
    })

    const result = messages.map((msg) => {
      const parts = deserializeContent(msg.content)
      const summary = summarizeParts(parts)
      return {
        role: msg.role,
        content: msg.content,
        ...summary,
        timestamp: msg.timestamp.toISOString(),
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    const status = (error as { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ userId: string; chatId: string }> }
) {
  try {
    if (isBuildTime) {
      return NextResponse.json({ message: 'build placeholder', build_placeholder: true })
    }

    const { prisma } = await import('@/lib/db/prisma')

    const { userId, chatId } = await context.params
    const auth = requireAuth(req)
    if (auth.sub !== userId) {
      return NextResponse.json({ detail: 'Forbidden' }, { status: 403 })
    }

    await prisma.chatAttachment.deleteMany({ where: { userId: auth.sub, chatId } })
    await prisma.message.deleteMany({ where: { userId: auth.sub, chatId } })
    await prisma.chatSession.deleteMany({ where: { userId: auth.sub, chatId } })

    return NextResponse.json({ message: 'Chat deleted.' })
  } catch (error) {
    const status = (error as { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
