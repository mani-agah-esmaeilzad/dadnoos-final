import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAdminAuth } from '@/lib/admin/auth'
import { decodeConversationId, getConversationTranscript } from '@/lib/admin/support'
import { buildAuditMeta, logAdminAction } from '@/lib/admin/audit'

const querySchema = z.object({
  reason: z.string().min(3),
  cursor: z.string().optional(),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  userId: z.string().optional(),
})

export async function GET(req: NextRequest, context: { params: Promise<{ conversationId: string }> }) {
  try {
    const admin = await requireAdminAuth(req)
    const { conversationId } = await context.params
    const parsed = querySchema.parse(Object.fromEntries(req.nextUrl.searchParams))
    const { userId, chatId } = decodeConversationId(conversationId)
    const transcript = await getConversationTranscript({
      userId,
      chatId,
      cursor: parsed.cursor || undefined,
      pageSize: parsed.pageSize,
    })
    if (!transcript) {
      return NextResponse.json({ detail: 'گفتگو یافت نشد.' }, { status: 404 })
    }
    const requestedUserId = parsed.userId?.trim()
    const hasFlag = transcript.supportRequested || transcript.reported
    const hasUserOverride = Boolean(requestedUserId && requestedUserId === transcript.userId)
    if (!hasFlag && !hasUserOverride) {
      return NextResponse.json(
        { detail: 'دسترسی به این گفتگو تنها برای گفتگوهای علامت‌گذاری شده یا با جستجوی شناسه کاربر مجاز است.' },
        { status: 403 }
      )
    }
    await logAdminAction({
      adminId: admin.id,
      actionType: 'VIEW_TRANSCRIPT',
      entityType: 'chat_session',
      entityId: conversationId,
      meta: buildAuditMeta(req, { reason: parsed.reason, searchedUserId: requestedUserId }),
    })
    return NextResponse.json(transcript)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'دلیل دسترسی الزامی است.', issues: error.flatten() }, { status: 400 })
    }
    const status = (error as { status?: number }).status ?? 500
    const message = status === 500 ? 'خطای داخلی سرور' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
