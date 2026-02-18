import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { requireAuth } from '@/lib/auth/guards'
import { isBuildTime } from '@/lib/runtime/build'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  title: z.string().trim().min(3).max(120),
  message: z.string().trim().min(5).max(4000),
  type: z.enum(['idea', 'report']).optional(),
})

export async function POST(req: NextRequest) {
  try {
    if (isBuildTime) {
      return NextResponse.json({ message: 'build placeholder', build_placeholder: true })
    }

    const { prisma } = await import('@/lib/db/prisma')
    const auth = requireAuth(req)
    const body = bodySchema.parse(await req.json())

    const record = await prisma.feedback.create({
      data: {
        userId: auth.sub,
        title: body.title,
        message: body.message,
        type: body.type === 'report' ? 'REPORT' : 'IDEA',
        status: 'NEW',
      },
    })

    return NextResponse.json({ id: record.id })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ detail: 'درخواست نامعتبر است.', issues: error.flatten() }, { status: 400 })
    }
    const status = (error as { status?: number }).status || 500
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ detail: message }, { status })
  }
}
