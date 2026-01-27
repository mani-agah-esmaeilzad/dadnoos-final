import { NextRequest, NextResponse } from 'next/server'

import { requireAuth } from '@/lib/auth/guards'
import { isBuildTime } from '@/lib/runtime/build'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    if (isBuildTime) {
      return NextResponse.json({ id: 'build-placeholder', username: 'placeholder', build_placeholder: true })
    }

    const { prisma } = await import('@/lib/db/prisma')

    const token = requireAuth(req)
    const user = await prisma.user.findUnique({ where: { id: token.sub } })
    if (!user) {
      return NextResponse.json({ detail: 'کاربر یافت نشد.' }, { status: 404 })
    }

    return NextResponse.json({ id: user.id, username: user.username })
  } catch (error) {
    const status = (error as { status?: number }).status || 500
    const message = status === 500 ? 'Internal server error' : (error as Error).message
    return NextResponse.json({ detail: message }, { status })
  }
}
